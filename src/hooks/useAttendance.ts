import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  section_id: string | null;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  marked_by: string | null;
  created_at: string;
  student?: {
    id: string;
    admission_number: string;
    roll_number: string | null;
    profile?: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
}

interface AttendanceInput {
  student_id: string;
  class_id: string;
  section_id?: string | null;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export function useAttendance(classId?: string, date?: string) {
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(
            id,
            admission_number,
            roll_number,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch profiles separately for students
      const studentUserIds = data
        ?.map(a => a.student?.user_id)
        .filter(Boolean) as string[];
      
      let profiles: Record<string, { first_name: string; last_name: string; avatar_url: string | null }> = {};
      
      if (studentUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', studentUserIds);
        
        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profiles);
      }
      
      return data?.map(a => ({
        ...a,
        student: a.student ? {
          ...a.student,
          profile: a.student.user_id ? profiles[a.student.user_id] : undefined,
        } : undefined,
      })) as AttendanceRecord[];
    },
    enabled: !!classId,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (records: AttendanceInput[]) => {
      const { data: user } = await supabase.auth.getUser();
      
      const recordsWithMarkedBy = records.map(r => ({
        ...r,
        marked_by: user.user?.id || null,
      }));

      const { data, error } = await supabase
        .from('attendance')
        .upsert(recordsWithMarkedBy, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save attendance: ' + error.message);
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AttendanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance updated!');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading,
    error: attendanceQuery.error,
    markAttendance: markAttendanceMutation.mutate,
    updateAttendance: updateAttendanceMutation.mutate,
    isMarking: markAttendanceMutation.isPending,
  };
}

export function useAttendanceStats(classId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance-stats', classId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select('status');

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        present: data.filter(a => a.status === 'present').length,
        absent: data.filter(a => a.status === 'absent').length,
        late: data.filter(a => a.status === 'late').length,
        excused: data.filter(a => a.status === 'excused').length,
        half_day: data.filter(a => a.status === 'half_day').length,
      };

      return {
        ...stats,
        attendanceRate: stats.total > 0 
          ? ((stats.present + stats.late) / stats.total * 100).toFixed(1) 
          : '0',
      };
    },
  });
}
