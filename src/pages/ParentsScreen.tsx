import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { ParentCard } from '@/components/cards/ParentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { mockParents } from '@/data/mockData';

const ParentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredParents = mockParents.filter(parent =>
    `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Parents"
        subtitle={`${mockParents.length} total parents`}
        action={
          <Button
            variant="gradient"
            size="iconSm"
            onClick={() => navigate('/parents/add')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search parents..."
        onFilter={() => {}}
        className="mb-4"
      />

      <div className="space-y-3">
        {filteredParents.length > 0 ? (
          filteredParents.map((parent) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onClick={() => navigate(`/parents/${parent.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon={UserCircle}
            title="No parents found"
            description={searchQuery ? "Try a different search term" : "Add your first parent to get started"}
            actionLabel="Add Parent"
            onAction={() => navigate('/parents/add')}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/parents/add')}
        className="fab-button flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default ParentsScreen;
