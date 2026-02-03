import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  student_id: string;
  invoice_number: string;
  title: string;
  amount: number;
  due_date: string;
  paid_amount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  paid_at: string | null;
  created_at: string;
  student_name?: string;
}

export const useInvoices = (studentIds?: string[]) => {
  const { user, isAdmin, isParent } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', studentIds],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentIds && studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch student profiles for names
      if (data && data.length > 0) {
        const uniqueStudentIds = [...new Set(data.map(inv => inv.student_id))];
        
        const { data: students } = await supabase
          .from('students')
          .select('id, user_id')
          .in('id', uniqueStudentIds);

        const userIds = students?.map(s => s.user_id).filter(Boolean) || [];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);

        return data.map(inv => {
          const student = students?.find(s => s.id === inv.student_id);
          const profile = profiles?.find(p => p.user_id === student?.user_id);
          return {
            ...inv,
            student_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'
          } as Invoice;
        });
      }

      return data as Invoice[];
    },
    enabled: !!user
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'created_at' | 'student_name'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice');
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update invoice');
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('amount')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_amount: invoice?.amount,
          paid_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['parent-due-amount'] });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update invoice');
    }
  });

  const stats = {
    paidCount: invoices?.filter(inv => inv.status === 'paid').length || 0,
    unpaidCount: invoices?.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue').length || 0,
    totalPaid: invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.paid_amount), 0) || 0,
    totalDue: invoices?.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paid_amount || 0)), 0) || 0
  };

  return {
    invoices: invoices || [],
    isLoading,
    error,
    stats,
    createInvoice: createInvoiceMutation.mutate,
    updateInvoice: updateInvoiceMutation.mutate,
    markAsPaid: markAsPaidMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending
  };
};
