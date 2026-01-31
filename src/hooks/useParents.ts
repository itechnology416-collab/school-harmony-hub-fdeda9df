import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ParentWithProfile {
  id: string;
  user_id: string;
  occupation: string | null;
  workplace: string | null;
  relation_type: string | null;
  secondary_phone: string | null;
  secondary_email: string | null;
  status: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    address: string | null;
  } | null;
  children?: Array<{
    id: string;
    admission_number: string;
    profile?: {
      first_name: string;
      last_name: string;
    } | null;
  }>;
}

export interface CreateParentData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  occupation?: string;
  workplace?: string;
  relation_type?: string;
  secondary_phone?: string;
  secondary_email?: string;
  student_ids?: string[];
}

export const useParents = () => {
  return useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles and children
      const parentsWithData = await Promise.all(
        (data || []).map(async (parent) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone, avatar_url, address')
            .eq('user_id', parent.user_id)
            .maybeSingle();
          
          // Fetch linked children
          const { data: studentParents } = await supabase
            .from('student_parents')
            .select('student:students(id, admission_number, user_id)')
            .eq('parent_id', parent.id);
          
          const children = await Promise.all(
            (studentParents || []).map(async (sp) => {
              if (sp.student?.user_id) {
                const { data: studentProfile } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('user_id', sp.student.user_id)
                  .maybeSingle();
                return { ...sp.student, profile: studentProfile };
              }
              return { ...sp.student, profile: null };
            })
          );
          
          return { 
            ...parent, 
            profile,
            children: children.filter(Boolean)
          };
        })
      );
      
      return parentsWithData as ParentWithProfile[];
    },
  });
};

export const useParent = (id: string) => {
  return useQuery({
    queryKey: ['parent', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parents')
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
        
        return { ...data, profile } as ParentWithProfile;
      }
      
      return null;
    },
    enabled: !!id,
  });
};

export const useCreateParent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (parentData: CreateParentData) => {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parentData.email,
        password: parentData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: parentData.first_name,
            last_name: parentData.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Assign parent role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'parent',
      });

      // Create parent record
      const { data, error } = await supabase
        .from('parents')
        .insert({
          user_id: authData.user.id,
          occupation: parentData.occupation,
          workplace: parentData.workplace,
          relation_type: parentData.relation_type || 'parent',
          secondary_phone: parentData.secondary_phone,
          secondary_email: parentData.secondary_email,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Link children
      if (parentData.student_ids?.length) {
        await supabase.from('student_parents').insert(
          parentData.student_ids.map(studentId => ({
            parent_id: data.id,
            student_id: studentId,
            is_primary: true,
          }))
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create parent');
    },
  });
};

export const useDeleteParent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('parents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete parent');
    },
  });
};
