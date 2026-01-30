import { ChevronRight, Phone, Users } from 'lucide-react';
import { Parent } from '@/types/school';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ParentCardProps {
  parent: Parent;
  onClick?: () => void;
  className?: string;
}

export const ParentCard = ({ parent, onClick, className }: ParentCardProps) => {
  const fullName = `${parent.firstName} ${parent.lastName}`;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-card rounded-2xl border border-border text-left",
        "transition-all duration-200 hover:shadow-card hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar name={fullName} src={parent.avatar} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
            <Badge 
              variant={parent.status === 'active' ? 'default' : 'secondary'}
              className="shrink-0 text-xs"
            >
              {parent.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 truncate">
            {parent.occupation}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{parent.studentIds.length} student(s)</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{parent.phone}</span>
            </span>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
};
