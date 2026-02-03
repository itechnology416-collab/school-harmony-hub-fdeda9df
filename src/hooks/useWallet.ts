import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WalletTransaction {
  id: string;
  parent_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  description: string | null;
  reference_id: string | null;
  balance_after: number;
  created_at: string;
}

export const useWallet = (parentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch parent ID if not provided
  const { data: parentRecord } = useQuery({
    queryKey: ['parent-for-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !parentId
  });

  const effectiveParentId = parentId || parentRecord?.id;

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['wallet-transactions', effectiveParentId],
    queryFn: async () => {
      if (!effectiveParentId) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('parent_id', effectiveParentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!effectiveParentId
  });

  // Calculate current balance from latest transaction
  const currentBalance = transactions && transactions.length > 0 
    ? transactions[0].balance_after 
    : 0;

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: {
      amount: number;
      transaction_type: 'credit' | 'debit';
      description?: string;
      reference_id?: string;
    }) => {
      if (!effectiveParentId) throw new Error('Parent ID not found');

      const newBalance = transaction.transaction_type === 'credit'
        ? currentBalance + transaction.amount
        : currentBalance - transaction.amount;

      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          parent_id: effectiveParentId,
          amount: transaction.amount,
          transaction_type: transaction.transaction_type,
          description: transaction.description,
          reference_id: transaction.reference_id,
          balance_after: newBalance
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Transaction recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record transaction');
    }
  });

  // Transaction summary
  const summary = {
    totalCredits: transactions?.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    totalDebits: transactions?.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    transactionCount: transactions?.length || 0
  };

  return {
    transactions: transactions || [],
    currentBalance,
    summary,
    isLoading,
    addTransaction: addTransactionMutation.mutate,
    isAdding: addTransactionMutation.isPending
  };
};
