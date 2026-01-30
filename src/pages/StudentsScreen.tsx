import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { StudentCard } from '@/components/cards/StudentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { mockStudents } from '@/data/mockData';

const StudentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredStudents = mockStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Students"
        subtitle={`${mockStudents.length} total students`}
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
            <StudentCard
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
