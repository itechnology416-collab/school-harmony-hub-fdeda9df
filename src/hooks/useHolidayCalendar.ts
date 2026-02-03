import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  event_type: 'holiday' | 'exam' | 'event' | 'meeting' | 'deadline' | 'activity';
  location: string | null;
  color: string | null;
  all_day: boolean;
  class_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useHolidayCalendar = (selectedMonth?: Date) => {
  const { user, isAdmin, isTeacher } = useAuth();
  const queryClient = useQueryClient();

  const currentMonth = selectedMonth || new Date();
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', monthStart, monthEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`start_date.gte.${monthStart},start_date.lte.${monthEnd}`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user
  });

  // Filter holidays specifically
  const holidays = events?.filter(e => e.event_type === 'holiday') || [];
  
  // Filter exams
  const exams = events?.filter(e => e.event_type === 'exam') || [];
  
  // Filter activities/events
  const activities = events?.filter(e => 
    e.event_type === 'activity' || e.event_type === 'event'
  ) || [];

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events?.forEach(event => {
    const dateKey = event.start_date;
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event');
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
    }
  });

  // Check if a date has events
  const hasEventsOnDate = (date: Date): boolean => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return !!eventsByDate[dateKey] && eventsByDate[dateKey].length > 0;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  };

  const stats = {
    totalEvents: events?.length || 0,
    holidayCount: holidays.length,
    examCount: exams.length,
    activityCount: activities.length
  };

  return {
    events: events || [],
    holidays,
    exams,
    activities,
    eventsByDate,
    stats,
    isLoading,
    hasEventsOnDate,
    getEventsForDate,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    canManage: isAdmin() || isTeacher()
  };
};
