import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ConnectedStudent {
  id: string;
  admission_number: string;
  roll_number: string | null;
  class_name: string;
  section_name: string;
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export const useParentData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch parent record
  const { data: parentRecord } = useQuery({
    queryKey: ['parent-record', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch connected students with their profiles and class info
  const { data: connectedStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ['connected-students', parentRecord?.id],
    queryFn: async () => {
      if (!parentRecord?.id) return [];

      const { data: studentLinks, error: linksError } = await supabase
        .from('student_parents')
        .select('student_id, relationship, is_primary')
        .eq('parent_id', parentRecord.id);

      if (linksError) throw linksError;
      if (!studentLinks || studentLinks.length === 0) return [];

      const studentIds = studentLinks.map(l => l.student_id);

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id, 
          admission_number, 
          roll_number, 
          user_id,
          class_id,
          section_id
        `)
        .in('id', studentIds);

      if (studentsError) throw studentsError;
      if (!students) return [];

      // Fetch profiles
      const userIds = students.map(s => s.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      // Fetch classes
      const classIds = students.map(s => s.class_id).filter(Boolean);
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds);

      // Fetch sections
      const sectionIds = students.map(s => s.section_id).filter(Boolean);
      const { data: sections } = await supabase
        .from('sections')
        .select('id, name')
        .in('id', sectionIds);

      return students.map(student => {
        const profile = profiles?.find(p => p.user_id === student.user_id);
        const classInfo = classes?.find(c => c.id === student.class_id);
        const sectionInfo = sections?.find(s => s.id === student.section_id);
        
        return {
          id: student.id,
          admission_number: student.admission_number,
          roll_number: student.roll_number,
          class_name: classInfo?.name || 'N/A',
          section_name: sectionInfo?.name || 'N/A',
          profile: {
            first_name: profile?.first_name || 'Unknown',
            last_name: profile?.last_name || '',
            avatar_url: profile?.avatar_url || null
          }
        } as ConnectedStudent;
      });
    },
    enabled: !!parentRecord?.id
  });

  // Calculate total due amount from invoices
  const { data: dueAmount } = useQuery({
    queryKey: ['parent-due-amount', connectedStudents],
    queryFn: async () => {
      if (!connectedStudents || connectedStudents.length === 0) return 0;

      const studentIds = connectedStudents.map(s => s.id);

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount, paid_amount, status')
        .in('student_id', studentIds)
        .neq('status', 'paid');

      if (error) throw error;

      return invoices?.reduce((total, inv) => {
        return total + (Number(inv.amount) - Number(inv.paid_amount || 0));
      }, 0) || 0;
    },
    enabled: !!connectedStudents && connectedStudents.length > 0
  });

  return {
    parentRecord,
    connectedStudents: connectedStudents || [],
    dueAmount: dueAmount || 0,
    isLoading: studentsLoading
  };
};
