import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OnlineClass {
  id: string;
  teacher_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string | null;
  title: string;
  description: string | null;
  meeting_link: string | null;
  meeting_id: string | null;
  meeting_password: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  recording_url: string | null;
  created_at: string;
  class_name?: string;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

export const useOnlineClasses = (teacherId?: string, classId?: string) => {
  const { user, isTeacher } = useAuth();
  const queryClient = useQueryClient();

  // Fetch teacher record for current user
  const { data: teacherRecord } = useQuery({
    queryKey: ['teacher-for-online-classes', user?.id],
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

  const { data: onlineClasses, isLoading } = useQuery({
    queryKey: ['online-classes', effectiveTeacherId, classId],
    queryFn: async () => {
      let query = supabase
        .from('online_classes')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (effectiveTeacherId) {
        query = query.eq('teacher_id', effectiveTeacherId);
      }

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data
      if (data && data.length > 0) {
        const classIds = [...new Set(data.map(c => c.class_id))];
        const sectionIds = [...new Set(data.map(c => c.section_id).filter(Boolean))];
        const subjectIds = [...new Set(data.map(c => c.subject_id).filter(Boolean))];
        const teacherIds = [...new Set(data.map(c => c.teacher_id))];

        const [classes, sections, subjects, teachers] = await Promise.all([
          supabase.from('classes').select('id, name').in('id', classIds),
          sectionIds.length > 0 ? supabase.from('sections').select('id, name').in('id', sectionIds) : { data: [] },
          subjectIds.length > 0 ? supabase.from('subjects').select('id, name').in('id', subjectIds) : { data: [] },
          supabase.from('teachers').select('id, user_id').in('id', teacherIds)
        ]);

        // Fetch teacher profiles
        const teacherUserIds = teachers.data?.map(t => t.user_id).filter(Boolean) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', teacherUserIds);

        return data.map(classItem => {
          const classInfo = classes.data?.find(c => c.id === classItem.class_id);
          const section = sections.data?.find(s => s.id === classItem.section_id);
          const subject = subjects.data?.find(s => s.id === classItem.subject_id);
          const teacher = teachers.data?.find(t => t.id === classItem.teacher_id);
          const teacherProfile = profiles?.find(p => p.user_id === teacher?.user_id);

          return {
            ...classItem,
            class_name: classInfo?.name || 'N/A',
            section_name: section?.name || null,
            subject_name: subject?.name || null,
            teacher_name: teacherProfile ? `${teacherProfile.first_name} ${teacherProfile.last_name}` : 'Unknown'
          } as OnlineClass;
        });
      }

      return data as OnlineClass[];
    },
    enabled: !!user
  });

  const createClassMutation = useMutation({
    mutationFn: async (classData: {
      class_id: string;
      section_id?: string;
      subject_id?: string;
      title: string;
      description?: string;
      meeting_link?: string;
      meeting_id?: string;
      meeting_password?: string;
      scheduled_at: string;
      duration_minutes?: number;
    }) => {
      if (!effectiveTeacherId) throw new Error('Teacher ID not found');

      const { data, error } = await supabase
        .from('online_classes')
        .insert({
          ...classData,
          teacher_id: effectiveTeacherId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-classes'] });
      toast.success('Online class scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule class');
    }
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnlineClass> & { id: string }) => {
      const { data, error } = await supabase
        .from('online_classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-classes'] });
      toast.success('Online class updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update class');
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('online_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-classes'] });
      toast.success('Online class deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete class');
    }
  });

  const upcomingClasses = onlineClasses?.filter(c => 
    c.status === 'scheduled' && new Date(c.scheduled_at) > new Date()
  ) || [];

  const stats = {
    total: onlineClasses?.length || 0,
    scheduled: onlineClasses?.filter(c => c.status === 'scheduled').length || 0,
    completed: onlineClasses?.filter(c => c.status === 'completed').length || 0,
    upcoming: upcomingClasses.length
  };

  return {
    onlineClasses: onlineClasses || [],
    upcomingClasses,
    stats,
    isLoading,
    teacherId: effectiveTeacherId,
    createClass: createClassMutation.mutate,
    updateClass: updateClassMutation.mutate,
    deleteClass: deleteClassMutation.mutate,
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending
  };
};
