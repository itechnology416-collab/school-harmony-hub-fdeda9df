import { ChevronRight, Phone, Mail } from 'lucide-react';
import { Student } from '@/types/school';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
  className?: string;
}

export const StudentCard = ({ student, onClick, className }: StudentCardProps) => {
  const fullName = `${student.firstName} ${student.lastName}`;
  
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
        <Avatar name={fullName} src={student.avatar} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
            <Badge 
              variant={student.status === 'active' ? 'default' : 'secondary'}
              className="shrink-0 text-xs"
            >
              {student.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            Roll: {student.rollNumber}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{student.email}</span>
            </span>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
};
