import { useState } from 'react';
import { Plus, Award, Calendar, BookOpen, ChevronRight, Clock, Loader2, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExams, useMarks, useExamStats } from '@/hooks/useExams';
import { useClasses, useSubjects, useStudentsByClass } from '@/hooks/useClasses';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/integrations/supabase/types';

type ExamType = Database['public']['Enums']['exam_type'];

const typeConfig: Record<ExamType, { label: string; color: string }> = {
  quiz: { label: 'Quiz', color: 'bg-accent/10 text-accent border-accent/20' },
  midterm: { label: 'Mid-Term', color: 'bg-primary/10 text-primary border-primary/20' },
  final: { label: 'Final', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  assignment: { label: 'Assignment', color: 'bg-success/10 text-success border-success/20' },
  practical: { label: 'Practical', color: 'bg-warning/10 text-warning border-warning/20' },
  project: { label: 'Project', color: 'bg-secondary text-secondary-foreground' },
};

const ExamsScreen = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [newExam, setNewExam] = useState({
    name: '',
    exam_type: 'quiz' as ExamType,
    class_id: '',
    subject_id: '',
    date: '',
    total_marks: 100,
    passing_marks: 40,
  });
  const [marksInput, setMarksInput] = useState<Record<string, number | null>>({});

  const { exams, isLoading, createExam, isCreating } = useExams();
  const { classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { data: students } = useStudentsByClass(selectedExam ? exams.find(e => e.id === selectedExam)?.class_id : undefined);
  const { marks, saveMarks, isSaving } = useMarks(selectedExam || undefined);
  const { data: examStats } = useExamStats(selectedExam || undefined);

  const today = new Date().toISOString().split('T')[0];

  const getExamStatus = (date: string) => {
    if (date > today) return 'upcoming';
    if (date === today) return 'ongoing';
    return 'completed';
  };

  const filteredExams = exams.filter(exam => {
    const status = getExamStatus(exam.date);
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return status === 'upcoming' || status === 'ongoing';
    return status === 'completed';
  });

  const handleAddExam = () => {
    if (!newExam.name || !newExam.class_id || !newExam.subject_id || !newExam.date) return;
    
    createExam(newExam);
    setIsAddDialogOpen(false);
    setNewExam({
      name: '',
      exam_type: 'quiz',
      class_id: '',
      subject_id: '',
      date: '',
      total_marks: 100,
      passing_marks: 40,
    });
  };

  const handleSaveMarks = () => {
    if (!selectedExam) return;
    
    const exam = exams.find(e => e.id === selectedExam);
    if (!exam) return;

    const marksToSave = Object.entries(marksInput)
      .filter(([_, marks]) => marks !== undefined)
      .map(([studentId, marksObtained]) => ({
        student_id: studentId,
        exam_id: selectedExam,
        marks_obtained: marksObtained,
        is_absent: marksObtained === null,
      }));

    saveMarks({ marks: marksToSave, totalMarks: exam.total_marks });
  };

  const openMarksDialog = (examId: string) => {
    setSelectedExam(examId);
    setMarksInput({});
    setIsMarksDialogOpen(true);
  };

  // Initialize marks input from existing marks
  useState(() => {
    if (marks.length > 0) {
      const existingMarks = marks.reduce((acc, m) => {
        acc[m.student_id] = m.marks_obtained;
        return acc;
      }, {} as Record<string, number | null>);
      setMarksInput(existingMarks);
    }
  });

  const stats = {
    total: exams.length,
    upcoming: exams.filter(e => getExamStatus(e.date) === 'upcoming').length,
    completed: exams.filter(e => getExamStatus(e.date) === 'completed').length,
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Examinations"
        subtitle="Manage exams & marks"
        showBack
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="iconSm">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Exam Name</Label>
                  <Input 
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    placeholder="e.g., Mid-Term Mathematics"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={newExam.exam_type} 
                      onValueChange={(v) => setNewExam({ ...newExam, exam_type: v as ExamType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select 
                    value={newExam.class_id} 
                    onValueChange={(v) => setNewExam({ ...newExam, class_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select 
                    value={newExam.subject_id} 
                    onValueChange={(v) => setNewExam({ ...newExam, subject_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input 
                      type="number"
                      value={newExam.total_marks}
                      onChange={(e) => setNewExam({ ...newExam, total_marks: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Marks</Label>
                    <Input 
                      type="number"
                      value={newExam.passing_marks}
                      onChange={(e) => setNewExam({ ...newExam, passing_marks: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="gradient" 
                  onClick={handleAddExam}
                  disabled={isCreating || !newExam.name || !newExam.class_id || !newExam.subject_id || !newExam.date}
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Exam
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary rounded-xl mb-6">
        {(['all', 'upcoming', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 rounded-lg text-sm font-medium transition-all capitalize",
              activeTab === tab 
                ? "bg-card shadow-sm text-foreground" 
                : "text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-xl border border-warning/20 text-center">
          <p className="text-2xl font-bold text-warning">{stats.upcoming}</p>
          <p className="text-xs text-warning">Upcoming</p>
        </div>
        <div className="p-4 bg-success/10 rounded-xl border border-success/20 text-center">
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
          <p className="text-xs text-success">Completed</p>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Exams Found</h3>
            <p className="text-sm text-muted-foreground">Create your first exam to get started</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const status = getExamStatus(exam.date);
            const typeStyle = typeConfig[exam.exam_type];
            const statusStyle = {
              upcoming: { label: 'Upcoming', color: 'bg-warning/10 text-warning' },
              ongoing: { label: 'Ongoing', color: 'bg-primary/10 text-primary' },
              completed: { label: 'Completed', color: 'bg-success/10 text-success' },
            }[status];
            
            return (
              <button
                key={exam.id}
                onClick={() => openMarksDialog(exam.id)}
                className="w-full p-4 bg-card rounded-2xl border border-border text-left hover:shadow-card transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{exam.name}</h3>
                      <Badge className={statusStyle.color}>{statusStyle.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeStyle.color}>
                        {typeStyle.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{exam.class?.name}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {exam.subject?.name || 'Subject'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {exam.total_marks} marks
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Marks Entry Dialog */}
      <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter Marks</DialogTitle>
          </DialogHeader>
          
          {selectedExam && examStats && (
            <div className="grid grid-cols-3 gap-2 py-3">
              <div className="text-center p-2 bg-secondary/50 rounded-lg">
                <p className="text-lg font-bold">{examStats.totalStudents}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-2 bg-success/10 rounded-lg">
                <p className="text-lg font-bold text-success">{examStats.passedStudents}</p>
                <p className="text-[10px] text-success">Passed</p>
              </div>
              <div className="text-center p-2 bg-destructive/10 rounded-lg">
                <p className="text-lg font-bold text-destructive">{examStats.failedStudents}</p>
                <p className="text-[10px] text-destructive">Failed</p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {students?.map((student) => {
              const profile = student.profile as { first_name: string; last_name: string } | null;
              const fullName = profile 
                ? `${profile.first_name} ${profile.last_name}`
                : `Student ${student.admission_number}`;
              const existingMark = marks.find(m => m.student_id === student.id);
              
              return (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.roll_number || student.admission_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20 h-9 text-center"
                      placeholder="--"
                      value={marksInput[student.id] ?? existingMark?.marks_obtained ?? ''}
                      onChange={(e) => setMarksInput({
                        ...marksInput,
                        [student.id]: e.target.value ? parseInt(e.target.value) : null,
                      })}
                    />
                    {existingMark?.grade && (
                      <Badge variant="outline" className="min-w-[40px] justify-center">
                        {existingMark.grade}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            className="w-full mt-4" 
            variant="gradient" 
            onClick={handleSaveMarks}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Marks
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamsScreen;
