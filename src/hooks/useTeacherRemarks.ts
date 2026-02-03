import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TeacherRemark {
  id: string;
  student_id: string;
  teacher_id: string;
  remark_type: 'positive' | 'negative' | 'neutral' | 'improvement';
  subject: string | null;
  content: string;
  is_shared_with_parent: boolean;
  created_at: string;
  student_name?: string;
  teacher_name?: string;
}

export const useTeacherRemarks = (studentId?: string, teacherId?: string) => {
  const { user, isTeacher } = useAuth();
  const queryClient = useQueryClient();

  // Fetch teacher record for current user
  const { data: teacherRecord } = useQuery({
    queryKey: ['teacher-for-remarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isTeacher()
  });

  const effectiveTeacherId = teacherId || teacherRecord?.id;

  const { data: remarks, isLoading } = useQuery({
    queryKey: ['teacher-remarks', studentId, effectiveTeacherId],
    queryFn: async () => {
      let query = supabase
        .from('teacher_remarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      if (effectiveTeacherId) {
        query = query.eq('teacher_id', effectiveTeacherId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related names
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map(r => r.student_id))];
        const teacherIds = [...new Set(data.map(r => r.teacher_id))];

        // Fetch students
        const { data: students } = await supabase
          .from('students')
          .select('id, user_id')
          .in('id', studentIds);

        // Fetch teachers
        const { data: teachers } = await supabase
          .from('teachers')
          .select('id, user_id')
          .in('id', teacherIds);

        // Fetch profiles
        const allUserIds = [
          ...(students?.map(s => s.user_id).filter(Boolean) || []),
          ...(teachers?.map(t => t.user_id).filter(Boolean) || [])
        ];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', allUserIds);

        return data.map(remark => {
          const student = students?.find(s => s.id === remark.student_id);
          const teacher = teachers?.find(t => t.id === remark.teacher_id);
          const studentProfile = profiles?.find(p => p.user_id === student?.user_id);
          const teacherProfile = profiles?.find(p => p.user_id === teacher?.user_id);

          return {
            ...remark,
            student_name: studentProfile ? `${studentProfile.first_name} ${studentProfile.last_name}` : 'Unknown',
            teacher_name: teacherProfile ? `${teacherProfile.first_name} ${teacherProfile.last_name}` : 'Unknown'
          } as TeacherRemark;
        });
      }

      return data as TeacherRemark[];
    },
    enabled: !!user
  });

  const createRemarkMutation = useMutation({
    mutationFn: async (remark: {
      student_id: string;
      remark_type: 'positive' | 'negative' | 'neutral' | 'improvement';
      subject?: string;
      content: string;
      is_shared_with_parent?: boolean;
    }) => {
      if (!effectiveTeacherId) throw new Error('Teacher ID not found');

      const { data, error } = await supabase
        .from('teacher_remarks')
        .insert({
          ...remark,
          teacher_id: effectiveTeacherId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-remarks'] });
      toast.success('Remark added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add remark');
    }
  });

  const deleteRemarkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teacher_remarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-remarks'] });
      toast.success('Remark deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete remark');
    }
  });

  const stats = {
    total: remarks?.length || 0,
    positive: remarks?.filter(r => r.remark_type === 'positive').length || 0,
    negative: remarks?.filter(r => r.remark_type === 'negative').length || 0,
    improvement: remarks?.filter(r => r.remark_type === 'improvement').length || 0
  };

  return {
    remarks: remarks || [],
    stats,
    isLoading,
    teacherId: effectiveTeacherId,
    createRemark: createRemarkMutation.mutate,
    deleteRemark: deleteRemarkMutation.mutate,
    isCreating: createRemarkMutation.isPending,
    isDeleting: deleteRemarkMutation.isPending
  };
};
