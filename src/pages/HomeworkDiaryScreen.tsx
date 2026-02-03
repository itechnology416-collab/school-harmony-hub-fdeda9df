import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExportButton } from '@/components/common/ExportButton';
import { formatDate } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { FileText, Plus, Calendar, Clock, Users, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isFuture, isToday } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  teacher_id: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  class_name?: string;
  subject_name?: string;
}

const HomeworkDiaryScreen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    total_marks: 100
  });

  const { user, isTeacher, isParent, isStudent } = useAuth();
  const queryClient = useQueryClient();

  // Fetch teacher record
  const { data: teacherRecord } = useQuery({
    queryKey: ['teacher-for-homework', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && isTeacher()
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes-for-homework'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('id, name').order('name');
      return data || [];
    }
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects-for-homework'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('id, name').order('name');
      return data || [];
    }
  });

  // Fetch assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['homework-assignments', teacherRecord?.id],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (teacherRecord?.id) {
        query = query.eq('teacher_id', teacherRecord.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data) return [];

      // Fetch related data
      const classIds = [...new Set(data.map(a => a.class_id))];
      const subjectIds = [...new Set(data.map(a => a.subject_id))];

      const [classesRes, subjectsRes] = await Promise.all([
        supabase.from('classes').select('id, name').in('id', classIds),
        supabase.from('subjects').select('id, name').in('id', subjectIds)
      ]);

      return data.map(assignment => ({
        ...assignment,
        class_name: classesRes.data?.find(c => c.id === assignment.class_id)?.name || 'N/A',
        subject_name: subjectsRes.data?.find(s => s.id === assignment.subject_id)?.name || 'N/A'
      })) as Assignment[];
    }
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async (assignment: typeof newAssignment) => {
      if (!teacherRecord?.id) throw new Error('Teacher record not found');

      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignment,
          teacher_id: teacherRecord.id,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      toast.success('Assignment created successfully');
      setIsAddDialogOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        class_id: '',
        subject_id: '',
        due_date: '',
        total_marks: 100
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create assignment');
    }
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      toast.success('Assignment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete assignment');
    }
  });

  const getStatusBadge = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge variant="default" className="bg-warning text-warning-foreground">Due Today</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  const exportColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Class', accessor: 'class_name' },
    { header: 'Subject', accessor: 'subject_name' },
    { header: 'Due Date', accessor: 'due_date', format: formatDate },
    { header: 'Total Marks', accessor: 'total_marks' },
    { header: 'Description', accessor: 'description' },
  ];

  const upcomingCount = assignments?.filter(a => isFuture(new Date(a.due_date)) || isToday(new Date(a.due_date))).length || 0;
  const overdueCount = assignments?.filter(a => isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date))).length || 0;

  return (
    <div className="screen-container">
      <PageHeader 
        title="Homework Diary" 
        subtitle="Manage assignments and homework"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/20">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-4 mb-4">
        {isTeacher() && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Assignment title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select 
                      value={newAssignment.class_id} 
                      onValueChange={(v) => setNewAssignment({ ...newAssignment, class_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={newAssignment.subject_id} 
                      onValueChange={(v) => setNewAssignment({ ...newAssignment, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map(subj => (
                          <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input
                      type="number"
                      value={newAssignment.total_marks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, total_marks: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Assignment description and instructions"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createMutation.mutate(newAssignment)}
                  disabled={createMutation.isPending || !newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id || !newAssignment.due_date}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <ExportButton
          options={{
            title: 'Homework Diary Report',
            subtitle: `Generated on ${format(new Date(), 'PPP')}`,
            columns: exportColumns,
            data: assignments || []
          }}
          defaultFilename="homework-diary"
        />
      </div>

      {/* Assignments List */}
      <div className="px-4">
        {!assignments || assignments.length === 0 ? (
          <Card className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No assignments yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{assignment.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{assignment.class_name}</Badge>
                          <Badge variant="outline">{assignment.subject_name}</Badge>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(assignment.due_date)}
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {format(new Date(assignment.due_date), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.total_marks} marks
                      </span>
                    </div>
                    {isTeacher() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkDiaryScreen;
