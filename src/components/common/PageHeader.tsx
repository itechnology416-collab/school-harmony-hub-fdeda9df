import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  action,
  className
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
