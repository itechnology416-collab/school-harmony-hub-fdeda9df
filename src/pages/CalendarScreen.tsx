import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Award, BookOpen, PartyPopper } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { mockCalendarEvents } from '@/data/mockData';
import { cn } from '@/lib/utils';

const eventTypeConfig = {
  holiday: { icon: PartyPopper, color: 'bg-success/10 text-success border-success/20' },
  exam: { icon: Award, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  event: { icon: Calendar, color: 'bg-accent/10 text-accent border-accent/20' },
  meeting: { icon: BookOpen, color: 'bg-primary/10 text-primary border-primary/20' },
};

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockCalendarEvents.filter(event => {
      const eventStart = event.date;
      const eventEnd = event.endDate || event.date;
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };
  
  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Academic Calendar"
        subtitle="Events & Schedule"
        showBack
        action={
          <Button variant="gradient" size="iconSm">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold font-display">
          {monthName} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) {
              return <div key={i} className="aspect-square" />;
            }
            
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            
            return (
              <button
                key={i}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all",
                  isToday(day) && "gradient-primary text-primary-foreground font-bold",
                  !isToday(day) && hasEvents && "bg-secondary",
                  !isToday(day) && !hasEvents && "hover:bg-secondary"
                )}
              >
                {day}
                {hasEvents && !isToday(day) && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {mockCalendarEvents.map(event => {
            const config = eventTypeConfig[event.type];
            return (
              <div
                key={event.id}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-4",
                  config.color
                )}
              >
                <div className="p-2 rounded-lg bg-current/10">
                  <config.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm opacity-80">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;
