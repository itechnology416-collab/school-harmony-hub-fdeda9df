import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'accent';
}

const variantStyles = {
  default: 'bg-card hover:bg-secondary/50',
  primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20',
  accent: 'bg-accent/5 hover:bg-accent/10 border-accent/20',
};

const iconVariantStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
};

export const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'default'
}: QuickActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border border-border text-left transition-all duration-200",
        "hover:shadow-card hover:scale-[1.02] active:scale-[0.98]",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          iconVariantStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{title}</h4>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>
      </div>
    </button>
  );
};
