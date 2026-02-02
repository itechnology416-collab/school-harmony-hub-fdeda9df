import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCircle,
  Settings,
  School,
  ClipboardCheck,
  FileText,
  CreditCard,
  Award,
  User,
  BookOpen,
  Bell,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: GraduationCap, label: 'Students', path: '/students' },
  { icon: Users, label: 'Teachers', path: '/teachers' },
  { icon: UserCircle, label: 'Parents', path: '/parents' },
  { icon: Settings, label: 'More', path: '/settings' },
];

const teacherNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
  { icon: BookOpen, label: 'Timetable', path: '/timetable' },
  { icon: Bell, label: 'Notices', path: '/notice-board' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const parentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Children', path: '/parent/children' },
  { icon: ClipboardCheck, label: 'Attendance', path: '/parent/attendance' },
  { icon: CreditCard, label: 'Fees', path: '/parent/fees' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const studentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: School, label: 'Classes', path: '/student/classes' },
  { icon: FileText, label: 'Assignments', path: '/student/assignments' },
  { icon: Award, label: 'Results', path: '/student/results' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isTeacher, isParent, isStudent } = useRoleBasedAccess();

  const getNavItems = (): NavItem[] => {
    if (isAdmin()) return adminNavItems;
    if (isTeacher()) return teacherNavItems;
    if (isParent()) return parentNavItems;
    if (isStudent()) return studentNavItems;
    return adminNavItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive && "gradient-primary shadow-glow"
              )}>
                <IconComponent className={cn(
                  "h-5 w-5",
                  isActive && "text-primary-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
