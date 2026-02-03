import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHolidayCalendar, CalendarEvent } from '@/hooks/useHolidayCalendar';
import { ExportButton } from '@/components/common/ExportButton';
import { formatDate } from '@/utils/exportUtils';
import { CalendarDays, Plus, Sun, BookOpen, PartyPopper, Users, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';

const eventTypeConfig = {
  holiday: { icon: Sun, color: 'bg-warning/10 text-warning border-warning/30', label: 'Holiday' },
  exam: { icon: BookOpen, color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Exam' },
  event: { icon: PartyPopper, color: 'bg-primary/10 text-primary border-primary/30', label: 'Event' },
  meeting: { icon: Users, color: 'bg-accent/10 text-accent border-accent/30', label: 'Meeting' },
  deadline: { icon: CalendarDays, color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Deadline' },
  activity: { icon: PartyPopper, color: 'bg-success/10 text-success border-success/30', label: 'Activity' },
};

const HolidayCalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'holiday' as CalendarEvent['event_type'],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    all_day: true
  });

  const { 
    events, 
    holidays, 
    exams, 
    activities, 
    stats,
    isLoading, 
    hasEventsOnDate, 
    getEventsForDate,
    createEvent,
    deleteEvent,
    canManage,
    isCreating
  } = useHolidayCalendar(currentMonth);

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start_date) return;

    createEvent({
      title: newEvent.title,
      description: newEvent.description || null,
      event_type: newEvent.event_type,
      start_date: newEvent.start_date,
      end_date: null,
      start_time: null,
      end_time: null,
      all_day: newEvent.all_day,
      location: null,
      color: null,
      class_id: null
    });

    setNewEvent({
      title: '',
      description: '',
      event_type: 'holiday',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      all_day: true
    });
    setIsAddDialogOpen(false);
  };

  const exportColumns = [
    { header: 'Date', accessor: 'start_date', format: formatDate },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'event_type' },
    { header: 'Description', accessor: 'description' },
    { header: 'Location', accessor: 'location' },
  ];

  return (
    <div className="screen-container">
      <PageHeader 
        title="Holiday Calendar" 
        subtitle="View holidays and important events"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-6">
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-3 text-center">
            <Sun className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-warning">{stats.holidayCount}</p>
            <p className="text-[10px] text-muted-foreground">Holidays</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3 text-center">
            <BookOpen className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-xl font-bold text-destructive">{stats.examCount}</p>
            <p className="text-[10px] text-muted-foreground">Exams</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-3 text-center">
            <PartyPopper className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-success">{stats.activityCount}</p>
            <p className="text-[10px] text-muted-foreground">Activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-4 mb-4">
        {canManage && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select 
                    value={newEvent.event_type} 
                    onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v as CalendarEvent['event_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Event description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddEvent}
                  disabled={isCreating || !newEvent.title}
                >
                  {isCreating ? 'Creating...' : 'Add Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <ExportButton
          options={{
            title: 'Calendar Events Report',
            subtitle: format(currentMonth, 'MMMM yyyy'),
            columns: exportColumns,
            data: events
          }}
          defaultFilename="calendar-events"
        />
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar */}
      <div className="px-4 mb-6">
        <Card>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasEvent: (date) => hasEventsOnDate(date)
              }}
              modifiersClassNames={{
                hasEvent: 'bg-primary/20 font-bold'
              }}
              className="rounded-md w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      <div className="px-4">
        <h3 className="font-semibold text-foreground mb-4">
          Events on {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        
        {selectedDateEvents.length === 0 ? (
          <Card className="text-center py-8">
            <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No events on this date</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => {
              const config = eventTypeConfig[event.event_type];
              const IconComponent = config?.icon || CalendarDays;
              
              return (
                <Card key={event.id} className={cn('border', config?.color)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-3 rounded-xl", config?.color.split(' ')[0])}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{event.title}</p>
                          <Badge variant="outline" className="mt-1">{config?.label}</Badge>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayCalendarScreen;
