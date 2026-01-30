import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { TeacherCard } from '@/components/cards/TeacherCard';
import { EmptyState } from '@/components/common/EmptyState';
import { mockTeachers } from '@/data/mockData';

const TeachersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredTeachers = mockTeachers.filter(teacher =>
    `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Teachers"
        subtitle={`${mockTeachers.length} total teachers`}
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
            <TeacherCard
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
