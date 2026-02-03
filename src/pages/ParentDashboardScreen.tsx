import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  CreditCard, 
  Wallet,
  BookOpen,
  FileText,
  Calendar,
  Bell,
  Plus,
  RefreshCw,
  Eye,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useParentData } from '@/hooks/useParentData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'default';
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-blue-500 text-white',
  default: 'bg-secondary text-secondary-foreground',
};

const MenuItem = ({ icon: Icon, label, onClick, variant = 'default' }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className={cn(
        "p-4 rounded-2xl",
        variantStyles[variant]
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[10px] font-medium text-foreground text-center leading-tight">{label}</span>
    </button>
  );
};

const ParentDashboardScreen = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { connectedStudents, dueAmount, isLoading } = useParentData();

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : 'Parent';
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const isDay = hours >= 6 && hours < 18;

  const menuItems = [
    { icon: ClipboardCheck, label: 'Attendance', path: '/parent/attendance', variant: 'primary' as const },
    { icon: CreditCard, label: 'Fees', path: '/parent/fees', variant: 'success' as const },
    { icon: Wallet, label: 'Wallet', path: '/parent/wallet', variant: 'warning' as const },
    { icon: BookOpen, label: 'Timetable', path: '/parent/timetable', variant: 'accent' as const },
    { icon: FileText, label: 'Marks', path: '/parent/marks', variant: 'primary' as const },
    { icon: FileText, label: 'Homework Diary', path: '/parent/homework', variant: 'info' as const },
    { icon: Calendar, label: 'Holiday Calendar', path: '/holiday-calendar', variant: 'success' as const },
    { icon: Bell, label: 'Noticeboard', path: '/notice-board', variant: 'warning' as const },
  ];

  return (
    <div className="screen-container px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-2">
          {isDay ? (
            <Sun className="h-6 w-6 text-warning" />
          ) : (
            <Moon className="h-6 w-6 text-primary" />
          )}
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">ES</span>
          </div>
          <span className="font-display font-bold text-foreground">EduSync</span>
        </div>
        <Avatar name={displayName} src={profile?.avatar_url} size="lg" />
      </div>

      {/* Parent Info */}
      <div className="mb-6">
        <h1 className="text-xl font-bold font-display text-foreground">{displayName}</h1>
        <p className="text-sm text-muted-foreground">Parent Account</p>
      </div>

      {/* Due Amount Card */}
      <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold font-display text-primary">
              ₹{dueAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Due Amount</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/parent/fees')}>
            <RefreshCw className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>

      {/* Connected Students */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Connected Students</h3>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-dashed border-2"
            onClick={() => navigate('/parent/add-student')}
          >
            <Plus className="h-6 w-6" />
          </Button>

          {connectedStudents.map((student) => (
            <div key={student.id} className="flex flex-col items-center gap-2">
              <Avatar 
                name={`${student.profile.first_name} ${student.profile.last_name}`}
                src={student.profile.avatar_url}
                size="lg"
                className="h-16 w-16"
              />
              <span className="text-xs text-muted-foreground text-center">
                {student.profile.first_name}
              </span>
            </div>
          ))}

          {connectedStudents.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No connected students</p>
          )}
        </div>
      </div>

      {/* Main Menu */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Main Menu</h3>
        </div>

        <div className="grid grid-cols-4 gap-3 p-4 bg-card rounded-3xl shadow-card">
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.path)}
              variant={item.variant}
            />
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-4 bg-secondary/50 rounded-2xl text-center">
        <p className="text-xs text-muted-foreground">
          {format(now, 'EEEE, MMMM d, yyyy')} • {format(now, 'HH:mm')}
        </p>
        <p className="text-sm font-medium text-foreground mt-1">{greeting}, {profile?.first_name}! 👋</p>
      </div>
    </div>
  );
};

export default ParentDashboardScreen;
