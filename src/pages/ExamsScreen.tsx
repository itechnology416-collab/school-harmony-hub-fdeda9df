import { useState } from 'react';
import { Plus, Award, Calendar, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Exam {
  id: string;
  name: string;
  type: 'quiz' | 'midterm' | 'final' | 'assignment';
  className: string;
  subject: string;
  date: string;
  totalMarks: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const mockExams: Exam[] = [
  { id: '1', name: 'Mid-Term Mathematics', type: 'midterm', className: 'Grade 5', subject: 'Mathematics', date: '2024-02-15', totalMarks: 100, status: 'upcoming' },
  { id: '2', name: 'English Quiz 3', type: 'quiz', className: 'Grade 5', subject: 'English', date: '2024-02-10', totalMarks: 20, status: 'upcoming' },
  { id: '3', name: 'Science Assignment', type: 'assignment', className: 'Grade 6', subject: 'Science', date: '2024-02-08', totalMarks: 30, status: 'ongoing' },
  { id: '4', name: 'History Mid-Term', type: 'midterm', className: 'Grade 6', subject: 'History', date: '2024-02-01', totalMarks: 100, status: 'completed' },
  { id: '5', name: 'Physics Quiz 2', type: 'quiz', className: 'Grade 7', subject: 'Physics', date: '2024-01-28', totalMarks: 25, status: 'completed' },
];

const typeConfig = {
  quiz: { label: 'Quiz', color: 'bg-accent/10 text-accent border-accent/20' },
  midterm: { label: 'Mid-Term', color: 'bg-primary/10 text-primary border-primary/20' },
  final: { label: 'Final', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  assignment: { label: 'Assignment', color: 'bg-success/10 text-success border-success/20' },
};

const statusConfig = {
  upcoming: { label: 'Upcoming', color: 'bg-warning/10 text-warning' },
  ongoing: { label: 'Ongoing', color: 'bg-primary/10 text-primary' },
  completed: { label: 'Completed', color: 'bg-success/10 text-success' },
};

const ExamsScreen = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredExams = mockExams.filter(exam => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return exam.status === 'upcoming' || exam.status === 'ongoing';
    return exam.status === 'completed';
  });

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Examinations"
        subtitle="Manage exams & marks"
        showBack
        action={
          <Button variant="gradient" size="iconSm">
            <Plus className="h-5 w-5" />
          </Button>
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
          <p className="text-2xl font-bold text-foreground">{mockExams.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-xl border border-warning/20 text-center">
          <p className="text-2xl font-bold text-warning">{mockExams.filter(e => e.status === 'upcoming').length}</p>
          <p className="text-xs text-warning">Upcoming</p>
        </div>
        <div className="p-4 bg-success/10 rounded-xl border border-success/20 text-center">
          <p className="text-2xl font-bold text-success">{mockExams.filter(e => e.status === 'completed').length}</p>
          <p className="text-xs text-success">Completed</p>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-3">
        {filteredExams.map((exam) => {
          const typeStyle = typeConfig[exam.type];
          const statusStyle = statusConfig[exam.status];
          
          return (
            <button
              key={exam.id}
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
                    <span className="text-xs text-muted-foreground">{exam.className}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {exam.subject}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {exam.totalMarks} marks
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Exam FAB */}
      <button className="fab-button flex items-center justify-center">
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default ExamsScreen;
