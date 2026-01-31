import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { useParents, ParentWithProfile } from '@/hooks/useParents';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

const ParentCardNew = ({ parent, onClick }: { parent: ParentWithProfile; onClick: () => void }) => {
  const displayName = parent.profile 
    ? `${parent.profile.first_name} ${parent.profile.last_name}`
    : `Parent ${parent.id.slice(0, 8)}`;
  
  const childrenNames = parent.children?.map(c => 
    c.profile ? `${c.profile.first_name}` : c.admission_number
  ).join(', ') || 'No children linked';
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all duration-200 active:scale-[0.99]"
    >
      <Avatar name={displayName} size="lg" />
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-foreground">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{parent.occupation || 'Parent'}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          Children: {childrenNames}
        </p>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        parent.status === 'active' ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}>
        {parent.status}
      </div>
    </button>
  );
};

const ParentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: parents, isLoading } = useParents();

  const filteredParents = (parents || []).filter(parent => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = parent.profile 
      ? `${parent.profile.first_name} ${parent.profile.last_name}`.toLowerCase()
      : '';
    return displayName.includes(searchLower) ||
      (parent.occupation?.toLowerCase() || '').includes(searchLower) ||
      (parent.profile?.email?.toLowerCase() || '').includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="screen-container px-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading parents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Parents"
        subtitle={`${parents?.length || 0} total parents`}
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
            <ParentCardNew
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
