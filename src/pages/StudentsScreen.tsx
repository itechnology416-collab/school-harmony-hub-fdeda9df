import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { useStudents, StudentWithProfile } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useAcademics';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

const StudentCardNew = ({ student, onClick }: { student: StudentWithProfile; onClick: () => void }) => {
  const displayName = student.profile 
    ? `${student.profile.first_name} ${student.profile.last_name}`
    : `Student ${student.admission_number}`;
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all duration-200 active:scale-[0.99]"
    >
      <Avatar name={displayName} size="lg" />
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-foreground">{displayName}</h3>
        <p className="text-sm text-muted-foreground">
          {student.class?.name || 'No class'} {student.section?.name ? `• ${student.section.name}` : ''}
        </p>
        <p className="text-xs text-muted-foreground">Roll: {student.roll_number || student.admission_number}</p>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        student.status === 'active' ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}>
        {student.status}
      </div>
    </button>
  );
};

const StudentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: students, isLoading, error } = useStudents();
  const { data: classes } = useClasses();

  const filteredStudents = (students || []).filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = student.profile 
      ? `${student.profile.first_name} ${student.profile.last_name}`.toLowerCase()
      : '';
    return displayName.includes(searchLower) ||
      student.admission_number.toLowerCase().includes(searchLower) ||
      (student.roll_number?.toLowerCase() || '').includes(searchLower) ||
      (student.profile?.email?.toLowerCase() || '').includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="screen-container px-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Students"
        subtitle={`${students?.length || 0} total students`}
        action={
          <Button
            variant="gradient"
            size="iconSm"
            onClick={() => navigate('/students/add')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search students..."
        onFilter={() => {}}
        className="mb-4"
      />

      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCardNew
              key={student.id}
              student={student}
              onClick={() => navigate(`/students/${student.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description={searchQuery ? "Try a different search term" : "Add your first student to get started"}
            actionLabel="Add Student"
            onAction={() => navigate('/students/add')}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/students/add')}
        className="fab-button flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default StudentsScreen;
