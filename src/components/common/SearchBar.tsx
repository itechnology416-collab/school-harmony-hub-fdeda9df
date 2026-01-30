import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onFilter,
  className
}: SearchBarProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 h-12 bg-card border-border"
        />
      </div>
      {onFilter && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilter}
          className="h-12 w-12 shrink-0"
        >
          <Filter className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
