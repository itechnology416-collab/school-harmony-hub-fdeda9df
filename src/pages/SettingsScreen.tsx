import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  CalendarDays, 
  FileSpreadsheet,
  ClipboardCheck,
  Award,
  Bell,
  Settings2,
  Database,
  ChevronRight,
  FileDown,
  FileUp,
  BarChart3
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  success: 'gradient-success text-success-foreground',
};

const SettingsItem = ({ icon: Icon, title, description, onClick, variant = 'default' }: SettingsItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-card transition-all duration-200 active:scale-[0.99]"
  >
    <div className={cn("p-3 rounded-xl", variantStyles[variant])}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 text-left">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </button>
);

const SettingsScreen = () => {
  const navigate = useNavigate();

  const managementItems = [
    { icon: Layers, title: 'Classes & Sections', description: 'Manage class structure', variant: 'primary' as const },
    { icon: BookOpen, title: 'Subjects', description: 'Manage subjects', variant: 'default' as const },
    { icon: ClipboardCheck, title: 'Attendance', description: 'Track daily attendance', variant: 'success' as const },
    { icon: Award, title: 'Examinations', description: 'Exams & grading', variant: 'accent' as const },
  ];

  const dataItems = [
    { icon: FileUp, title: 'Import Data', description: 'Excel/CSV upload', variant: 'primary' as const },
    { icon: FileDown, title: 'Export Data', description: 'Download reports', variant: 'default' as const },
    { icon: BarChart3, title: 'Analytics', description: 'View statistics', variant: 'success' as const },
    { icon: FileSpreadsheet, title: 'Report Cards', description: 'Generate reports', variant: 'accent' as const },
  ];

  const systemItems = [
    { icon: CalendarDays, title: 'Academic Calendar', description: 'Events & holidays', variant: 'default' as const },
    { icon: Bell, title: 'Notifications', description: 'Send announcements', variant: 'primary' as const },
    { icon: Settings2, title: 'School Settings', description: 'Profile & config', variant: 'default' as const },
    { icon: Database, title: 'Backup & Restore', description: 'Data management', variant: 'default' as const },
  ];

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="More"
        subtitle="Management & Settings"
      />

      <div className="space-y-6">
        {/* Management Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Academic Management
          </h2>
          <div className="space-y-2">
            {managementItems.map((item) => (
              <SettingsItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => navigate(`/${item.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`)}
                variant={item.variant}
              />
            ))}
          </div>
        </div>

        {/* Data Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Data & Reports
          </h2>
          <div className="space-y-2">
            {dataItems.map((item) => (
              <SettingsItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => navigate(`/${item.title.toLowerCase().replace(/ /g, '-')}`)}
                variant={item.variant}
              />
            ))}
          </div>
        </div>

        {/* System Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            System
          </h2>
          <div className="space-y-2">
            {systemItems.map((item) => (
              <SettingsItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => navigate(`/${item.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`)}
                variant={item.variant}
              />
            ))}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            EduManage Pro v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
