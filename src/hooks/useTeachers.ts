import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeacherWithProfile {
  id: string;
  user_id: string;
  employee_id: string | null;
  qualification: string | null;
  specialization: string | null;
  experience_years: number;
  joining_date: string | null;
  department: string | null;
  designation: string | null;
  status: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
  } | null;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  classes?: Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateTeacherData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  employee_id?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date?: string;
  department?: string;
  designation?: string;
  subject_ids?: string[];
  class_ids?: string[];
}

export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for teachers
      const teachersWithProfiles = await Promise.all(
        (data || []).map(async (teacher) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone, avatar_url, date_of_birth, gender, address')
            .eq('user_id', teacher.user_id)
            .maybeSingle();
          
          // Fetch assigned subjects
          const { data: teacherSubjects } = await supabase
            .from('teacher_subjects')
            .select('subject:subjects(id, name, code)')
            .eq('teacher_id', teacher.id);
          
          return { 
            ...teacher, 
            profile,
            subjects: teacherSubjects?.map(ts => ts.subject).filter(Boolean) || []
          };
        })
      );
      
      return teachersWithProfiles as TeacherWithProfile[];
    },
  });
};

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user_id)
          .maybeSingle();
        
        const { data: teacherSubjects } = await supabase
          .from('teacher_subjects')
          .select('subject:subjects(id, name, code)')
          .eq('teacher_id', data.id);
        
        return { 
          ...data, 
          profile,
          subjects: teacherSubjects?.map(ts => ts.subject).filter(Boolean) || []
        } as TeacherWithProfile;
      }
      
      return null;
    },
    enabled: !!id,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teacherData: CreateTeacherData) => {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacherData.email,
        password: teacherData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: teacherData.first_name,
            last_name: teacherData.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Assign teacher role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'teacher',
      });

      // Create teacher record
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          employee_id: teacherData.employee_id,
          qualification: teacherData.qualification,
          specialization: teacherData.specialization,
          experience_years: teacherData.experience_years || 0,
          joining_date: teacherData.joining_date,
          department: teacherData.department,
          designation: teacherData.designation,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Assign subjects
      if (teacherData.subject_ids?.length) {
        await supabase.from('teacher_subjects').insert(
          teacherData.subject_ids.map(subjectId => ({
            teacher_id: data.id,
            subject_id: subjectId,
          }))
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create teacher');
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete teacher');
    },
  });
};
