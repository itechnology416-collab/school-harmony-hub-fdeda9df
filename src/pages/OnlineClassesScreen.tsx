import { useState } from 'react';
import { 
  Video, 
  Plus, 
  Play, 
  ExternalLink,
  Calendar,
  Clock,
  Users,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import { useClasses } from '@/hooks/useClasses';

// Mock online classes data
interface OnlineClass {
  id: string;
  title: string;
  subject: string;
  classId: string;
  className: string;
  meetingUrl: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'live' | 'completed';
}

const mockClasses: OnlineClass[] = [
  {
    id: '1',
    title: 'Mathematics - Quadratic Equations',
    subject: 'Mathematics',
    classId: '1',
    className: 'Class 10-A',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    duration: 45,
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Science - Chemical Reactions',
    subject: 'Science',
    classId: '1',
    className: 'Class 10-A',
    meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:30',
    duration: 45,
    status: 'live',
  },
];

const OnlineClassesScreen = () => {
  const [classes, setClasses] = useState<OnlineClass[]>(mockClasses);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [duration, setDuration] = useState('45');

  const { classes: dbClasses } = useClasses();

  const handleCreate = () => {
    if (!title || !meetingUrl || !scheduledDate || !scheduledTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const newClass: OnlineClass = {
      id: Date.now().toString(),
      title,
      subject: 'General',
      classId: selectedClass,
      className: dbClasses.find(c => c.id === selectedClass)?.name || 'Unknown',
      meetingUrl,
      scheduledDate,
      scheduledTime,
      duration: parseInt(duration),
      status: 'scheduled',
    };

    setClasses([newClass, ...classes]);
    setIsCreateOpen(false);
    setTitle('');
    setMeetingUrl('');
    setScheduledDate('');
    setScheduledTime('');
    setSelectedClass('');
    toast.success('Online class scheduled!');
  };

  const handleJoin = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDelete = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast.success('Class deleted');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-destructive text-destructive-foreground animate-pulse">🔴 Live Now</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const liveClasses = classes.filter(c => c.status === 'live');
  const scheduledClasses = classes.filter(c => c.status === 'scheduled');
  const completedClasses = classes.filter(c => c.status === 'completed');

  return (
    <div className="screen-container px-4 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Online Classes"
          subtitle="Manage virtual classroom sessions"
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Online Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input
                  placeholder="e.g., Mathematics - Algebra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Meeting URL</Label>
                <Input
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                className="w-full gradient-primary text-primary-foreground"
              >
                Schedule Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="gradient-destructive text-destructive-foreground">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{liveClasses.length}</p>
            <p className="text-sm opacity-80">Live Now</p>
          </CardContent>
        </Card>
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{scheduledClasses.length}</p>
            <p className="text-sm opacity-80">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="gradient-success text-success-foreground">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{completedClasses.length}</p>
            <p className="text-sm opacity-80">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Classes */}
      {liveClasses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-destructive">🔴 Live Classes</h3>
          {liveClasses.map((classItem) => (
            <Card key={classItem.id} className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-destructive/10">
                      <Video className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{classItem.title}</h4>
                      <p className="text-sm text-muted-foreground">{classItem.className}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {classItem.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleJoin(classItem.meetingUrl)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduled Classes */}
      <div className="space-y-3">
        <h3 className="font-semibold">Upcoming Classes</h3>
        {scheduledClasses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled classes</p>
            </CardContent>
          </Card>
        ) : (
          scheduledClasses.map((classItem) => (
            <Card key={classItem.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{classItem.title}</h4>
                        {getStatusBadge(classItem.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{classItem.className}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {classItem.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {classItem.scheduledTime} ({classItem.duration} min)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleJoin(classItem.meetingUrl)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(classItem.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineClassesScreen;
