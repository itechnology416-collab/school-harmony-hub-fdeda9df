import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

interface StaffAttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  created_at: string;
}

export function useSelfAttendance(month?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const attendanceQuery = useQuery({
    queryKey: ['self-attendance', user?.id, month],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('staff_attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (month) {
        const startDate = `${month}-01`;
        const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StaffAttendanceRecord[];
    },
    enabled: !!user?.id,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      // Check if already checked in today
      const { data: existing } = await supabase
        .from('staff_attendance')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        throw new Error('Already checked in today');
      }

      const { data, error } = await supabase
        .from('staff_attendance')
        .insert({
          user_id: user.id,
          date: today,
          status: 'present',
          check_in_time: now,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-attendance'] });
      toast.success('Checked in successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      const { data: existing } = await supabase
        .from('staff_attendance')
        .select('id, check_out_time')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (!existing) {
        throw new Error('Please check in first');
      }

      if (existing.check_out_time) {
        throw new Error('Already checked out today');
      }

      const { data, error } = await supabase
        .from('staff_attendance')
        .update({ check_out_time: now })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-attendance'] });
      toast.success('Checked out successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calculate stats
  const stats = {
    totalDays: attendanceQuery.data?.length || 0,
    present: attendanceQuery.data?.filter(a => a.status === 'present').length || 0,
    absent: attendanceQuery.data?.filter(a => a.status === 'absent').length || 0,
    late: attendanceQuery.data?.filter(a => a.status === 'late').length || 0,
    leaves: attendanceQuery.data?.filter(a => a.status === 'excused').length || 0,
  };

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceQuery.data?.find(a => a.date === today);

  return {
    attendance: attendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading,
    stats,
    todayAttendance,
    checkIn: checkInMutation.mutate,
    checkOut: checkOutMutation.mutate,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
  };
}
