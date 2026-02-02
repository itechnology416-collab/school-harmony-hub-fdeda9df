import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportData, ExportFormat, ExportOptions } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportButtonProps {
  options: Omit<ExportOptions, 'filename'> & { filename?: string };
  defaultFilename?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ExportButton = ({
  options,
  defaultFilename = 'export',
  variant = 'outline',
  size = 'sm',
  className,
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (options.data.length === 0) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      const filename = options.filename || defaultFilename;
      const timestamp = new Date().toISOString().split('T')[0];
      
      exportData(format, {
        ...options,
        filename: `${filename}_${timestamp}`,
      });
      
      toast.success(`Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2 text-destructive" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileImage className="h-4 w-4 mr-2 text-primary" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
