import { ChevronRight, BookOpen, Clock } from 'lucide-react';
import { Teacher } from '@/types/school';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TeacherCardProps {
  teacher: Teacher;
  onClick?: () => void;
  className?: string;
}

export const TeacherCard = ({ teacher, onClick, className }: TeacherCardProps) => {
  const fullName = `${teacher.firstName} ${teacher.lastName}`;
  
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
        <Avatar name={fullName} src={teacher.avatar} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
            <Badge 
              variant={teacher.status === 'active' ? 'default' : 'secondary'}
              className="shrink-0 text-xs"
            >
              {teacher.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 truncate">
            {teacher.qualification}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{teacher.subjects.length} subjects</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{teacher.experience}</span>
            </span>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
};
