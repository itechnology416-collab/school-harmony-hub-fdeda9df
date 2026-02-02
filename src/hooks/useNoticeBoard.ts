import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type NotificationType = Database['public']['Enums']['notification_type'];

interface Notice {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType | null;
  created_at: string;
  is_read: boolean | null;
  sender_id: string | null;
  recipient_role: string | null;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface CreateNoticeInput {
  title: string;
  message: string;
  type?: NotificationType;
  recipientRole?: 'admin' | 'teacher' | 'parent' | 'student';
  recipientClassId?: string;
}

export function useNoticeBoard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const noticesQuery = useQuery({
    queryKey: ['notices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_user_id.eq.${user.id},recipient_role.eq.teacher,recipient_role.is.null`)
        .eq('notification_type', 'announcement')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(data?.map(n => n.sender_id).filter(Boolean))];
      let profiles: Record<string, any> = {};

      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', senderIds as string[]);

        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profiles);
      }

      return data?.map(notice => ({
        ...notice,
        sender: notice.sender_id ? profiles[notice.sender_id] : undefined,
      })) as Notice[];
    },
    enabled: !!user?.id,
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (input: CreateNoticeInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: input.title,
          message: input.message,
          notification_type: input.type || 'announcement',
          sender_id: user.id,
          recipient_role: input.recipientRole,
          recipient_class_id: input.recipientClassId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post notice: ' + error.message);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (noticeId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', noticeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const unreadCount = noticesQuery.data?.filter(n => !n.is_read).length || 0;

  return {
    notices: noticesQuery.data || [],
    isLoading: noticesQuery.isLoading,
    createNotice: createNoticeMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    unreadCount,
    isCreating: createNoticeMutation.isPending,
  };
}
