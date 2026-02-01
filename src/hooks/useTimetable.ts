import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimetableEntry {
  id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  teacher_id: string | null;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  room_number: string | null;
  academic_year_id: string | null;
  created_at: string;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
  subject?: { id: string; name: string; code: string };
  teacher?: {
    id: string;
    profile?: { first_name: string; last_name: string };
  };
}

interface TimetableInput {
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id?: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string | null;
  academic_year_id?: string | null;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function useTimetable(classId?: string, sectionId?: string) {
  const queryClient = useQueryClient();

  const timetableQuery = useQuery({
    queryKey: ['timetable', classId, sectionId],
    queryFn: async () => {
      let query = supabase
        .from('timetable')
        .select(`
          *,
          class:classes(id, name),
          section:sections(id, name),
          subject:subjects(id, name, code),
          teacher:teachers(id, user_id)
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch teacher profiles separately
      const teacherUserIds = data
        ?.map(t => t.teacher?.user_id)
        .filter(Boolean) as string[];
      
      let profiles: Record<string, { first_name: string; last_name: string }> = {};
      
      if (teacherUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', teacherUserIds);
        
        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profiles);
      }
      
      return data?.map(t => ({
        ...t,
        teacher: t.teacher ? {
          ...t.teacher,
          profile: t.teacher.user_id ? profiles[t.teacher.user_id] : undefined,
        } : undefined,
      })) as TimetableEntry[];
    },
    enabled: !!classId,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: TimetableInput) => {
      const { data, error } = await supabase
        .from('timetable')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry added!');
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimetableEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('timetable')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Entry updated!');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Entry deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  // Group timetable by day
  const timetableByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    dayIndex: index,
    entries: (timetableQuery.data || []).filter(e => e.day_of_week === index),
  })).filter(d => d.entries.length > 0 || [1, 2, 3, 4, 5].includes(d.dayIndex)); // Only show weekdays by default

  return {
    timetable: timetableQuery.data || [],
    timetableByDay,
    isLoading: timetableQuery.isLoading,
    error: timetableQuery.error,
    createEntry: createEntryMutation.mutate,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    isCreating: createEntryMutation.isPending,
  };
}

export function useTeacherTimetable(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-timetable', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          class:classes(id, name),
          section:sections(id, name),
          subject:subjects(id, name, code)
        `)
        .eq('teacher_id', teacherId!)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

export { DAYS_OF_WEEK };
