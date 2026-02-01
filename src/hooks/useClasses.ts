import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  grade_level: number | null;
  academic_year_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
  capacity: number | null;
  room_number: string | null;
  class_teacher_id: string | null;
  created_at: string;
}

interface ClassWithSections extends ClassData {
  sections: Section[];
  studentCount?: number;
}

export function useClasses() {
  const queryClient = useQueryClient();

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;

      // Fetch sections for each class
      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('name', { ascending: true });

      if (sectionsError) throw sectionsError;

      // Fetch student counts per class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('class_id')
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // Map sections and counts to classes
      const classesWithSections: ClassWithSections[] = classes.map(cls => ({
        ...cls,
        sections: sections.filter(s => s.class_id === cls.id),
        studentCount: students.filter(s => s.class_id === cls.id).length,
      }));

      return classesWithSections;
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (classData: { name: string; description?: string; grade_level?: number }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created!');
    },
    onError: (error) => {
      toast.error('Failed to create class: ' + error.message);
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (section: { name: string; class_id: string; capacity?: number; room_number?: string }) => {
      const { data, error } = await supabase
        .from('sections')
        .insert([section])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Section added!');
    },
    onError: (error) => {
      toast.error('Failed to add section: ' + error.message);
    },
  });

  return {
    classes: classesQuery.data || [],
    isLoading: classesQuery.isLoading,
    error: classesQuery.error,
    createClass: createClassMutation.mutate,
    createSection: createSectionMutation.mutate,
    isCreating: createClassMutation.isPending,
  };
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useStudentsByClass(classId?: string, sectionId?: string) {
  return useQuery({
    queryKey: ['students-by-class', classId, sectionId],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          id,
          admission_number,
          roll_number,
          class_id,
          section_id,
          status,
          user_id
        `)
        .eq('status', 'active')
        .order('roll_number', { ascending: true });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data?.map(s => s.user_id).filter(Boolean) as string[];
      
      let profiles: Record<string, { first_name: string; last_name: string; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', userIds);
        
        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profiles);
      }
      
      return data?.map(s => ({
        ...s,
        profile: s.user_id ? profiles[s.user_id] : null,
      }));
    },
    enabled: !!classId,
  });
}
