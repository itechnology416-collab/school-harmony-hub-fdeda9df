import { useState } from 'react';
import { Plus, Clock, BookOpen, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimetable, DAYS_OF_WEEK } from '@/hooks/useTimetable';
import { useClasses, useSubjects } from '@/hooks/useClasses';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const dayColors: Record<number, string> = {
  1: 'bg-primary/10 border-primary/20 text-primary',
  2: 'bg-accent/10 border-accent/20 text-accent',
  3: 'bg-success/10 border-success/20 text-success',
  4: 'bg-warning/10 border-warning/20 text-warning',
  5: 'bg-destructive/10 border-destructive/20 text-destructive',
};

const TimetableScreen = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    day_of_week: 1,
    subject_id: '',
    start_time: '08:00',
    end_time: '09:00',
    room_number: '',
  });

  const { classes, isLoading: classesLoading } = useClasses();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { timetableByDay, isLoading, createEntry, isCreating } = useTimetable(selectedClass, selectedSection);

  const currentClass = classes.find(c => c.id === selectedClass);
  const sections = currentClass?.sections || [];

  const handleAddEntry = () => {
    if (!selectedClass || !newEntry.subject_id) return;
    
    createEntry({
      class_id: selectedClass,
      section_id: selectedSection || null,
      ...newEntry,
    });
    setIsAddDialogOpen(false);
    setNewEntry({
      day_of_week: 1,
      subject_id: '',
      start_time: '08:00',
      end_time: '09:00',
      room_number: '',
    });
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Timetable"
        subtitle="Weekly class schedule"
        showBack
        action={
          selectedClass && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" size="iconSm">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Timetable Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select 
                      value={newEntry.day_of_week.toString()} 
                      onValueChange={(v) => setNewEntry({ ...newEntry, day_of_week: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {DAYS_OF_WEEK[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={newEntry.subject_id} 
                      onValueChange={(v) => setNewEntry({ ...newEntry, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input 
                        type="time" 
                        value={newEntry.start_time}
                        onChange={(e) => setNewEntry({ ...newEntry, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input 
                        type="time" 
                        value={newEntry.end_time}
                        onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Room Number (Optional)</Label>
                    <Input 
                      value={newEntry.room_number}
                      onChange={(e) => setNewEntry({ ...newEntry, room_number: e.target.value })}
                      placeholder="e.g., Room 101"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    onClick={handleAddEntry}
                    disabled={isCreating || !newEntry.subject_id}
                  >
                    {isCreating ? 'Adding...' : 'Add Entry'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Class & Section Selector */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedSection(''); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classesLoading ? (
                <div className="p-2"><Skeleton className="h-6 w-full" /></div>
              ) : (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {sections.length > 0 && (
          <div className="flex-1">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="All sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Timetable Content */}
      {!selectedClass ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Select a Class</h3>
          <p className="text-sm text-muted-foreground">Choose a class to view its timetable</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {timetableByDay.map(({ day, dayIndex, entries }) => (
            <div key={dayIndex} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleDay(dayIndex)}
                className={cn(
                  "w-full flex items-center justify-between p-4 transition-colors",
                  dayColors[dayIndex] || 'bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{day}</span>
                  <Badge variant="outline" className="bg-background/50">
                    {entries.length} {entries.length === 1 ? 'class' : 'classes'}
                  </Badge>
                </div>
                {expandedDay === dayIndex ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {(expandedDay === dayIndex || entries.length > 0) && expandedDay === dayIndex && (
                <div className="p-3 space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes scheduled
                    </p>
                  ) : (
                    entries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl"
                      >
                        <div className="flex flex-col items-center px-3 py-2 bg-background rounded-lg min-w-[80px]">
                          <span className="text-xs text-muted-foreground">
                            {entry.start_time?.slice(0, 5)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">to</span>
                          <span className="text-xs text-muted-foreground">
                            {entry.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">
                              {entry.subject?.name || 'Unknown Subject'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {entry.teacher?.profile && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {entry.teacher.profile.first_name} {entry.teacher.profile.last_name}
                              </span>
                            )}
                            {entry.room_number && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {entry.room_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimetableScreen;
