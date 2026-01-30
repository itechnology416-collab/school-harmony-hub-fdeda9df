import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  success: 'gradient-success',
  warning: 'gradient-warning',
};

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'primary',
  className 
}: StatCardProps) => {
  return (
    <div className={cn(
      "stat-card text-primary-foreground",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold font-display">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-green-200" : "text-red-200"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="opacity-75">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />
    </div>
  );
};
