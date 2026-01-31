import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentWithProfile {
  id: string;
  admission_number: string;
  roll_number: string | null;
  class_id: string | null;
  section_id: string | null;
  admission_date: string | null;
  status: string;
  blood_group: string | null;
  medical_conditions: string | null;
  transport_opted: boolean;
  hostel_opted: boolean;
  user_id: string | null;
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
  class?: {
    id: string;
    name: string;
  } | null;
  section?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  class_id?: string;
  section_id?: string;
  admission_number: string;
  roll_number?: string;
  blood_group?: string;
  medical_conditions?: string;
  transport_opted?: boolean;
  hostel_opted?: boolean;
}

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          section:sections(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for students with user_ids
      const studentsWithProfiles = await Promise.all(
        (data || []).map(async (student) => {
          if (student.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone, avatar_url, date_of_birth, gender, address')
              .eq('user_id', student.user_id)
              .maybeSingle();
            return { ...student, profile };
          }
          return { ...student, profile: null };
        })
      );
      
      return studentsWithProfiles as StudentWithProfile[];
    },
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          section:sections(id, name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user_id)
          .maybeSingle();
        return { ...data, profile } as StudentWithProfile;
      }
      
      return data as StudentWithProfile;
    },
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: CreateStudentData) => {
      // For now, create student without user account (admin-managed)
      const { data, error } = await supabase
        .from('students')
        .insert({
          admission_number: studentData.admission_number,
          roll_number: studentData.roll_number,
          class_id: studentData.class_id,
          section_id: studentData.section_id,
          blood_group: studentData.blood_group,
          medical_conditions: studentData.medical_conditions,
          transport_opted: studentData.transport_opted || false,
          hostel_opted: studentData.hostel_opted || false,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create student');
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateStudentData>) => {
      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update student');
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete student');
    },
  });
};
