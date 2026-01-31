import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { useTeachers, TeacherWithProfile } from '@/hooks/useTeachers';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

const TeacherCardNew = ({ teacher, onClick }: { teacher: TeacherWithProfile; onClick: () => void }) => {
  const displayName = teacher.profile 
    ? `${teacher.profile.first_name} ${teacher.profile.last_name}`
    : `Teacher ${teacher.employee_id || teacher.id.slice(0, 8)}`;
  
  const subjects = teacher.subjects?.map(s => s.name).join(', ') || 'No subjects assigned';
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all duration-200 active:scale-[0.99]"
    >
      <Avatar name={displayName} size="lg" />
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-foreground">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{teacher.designation || 'Teacher'}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{subjects}</p>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        teacher.status === 'active' ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}>
        {teacher.status}
      </div>
    </button>
  );
};

const TeachersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: teachers, isLoading } = useTeachers();

  const filteredTeachers = (teachers || []).filter(teacher => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = teacher.profile 
      ? `${teacher.profile.first_name} ${teacher.profile.last_name}`.toLowerCase()
      : '';
    return displayName.includes(searchLower) ||
      (teacher.qualification?.toLowerCase() || '').includes(searchLower) ||
      (teacher.profile?.email?.toLowerCase() || '').includes(searchLower) ||
      (teacher.department?.toLowerCase() || '').includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="screen-container px-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Teachers"
        subtitle={`${teachers?.length || 0} total teachers`}
        action={
          <Button
            variant="gradient"
            size="iconSm"
            onClick={() => navigate('/teachers/add')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search teachers..."
        onFilter={() => {}}
        className="mb-4"
      />

      <div className="space-y-3">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <TeacherCardNew
              key={teacher.id}
              teacher={teacher}
              onClick={() => navigate(`/teachers/${teacher.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon={Users}
            title="No teachers found"
            description={searchQuery ? "Try a different search term" : "Add your first teacher to get started"}
            actionLabel="Add Teacher"
            onAction={() => navigate('/teachers/add')}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/teachers/add')}
        className="fab-button flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default TeachersScreen;
