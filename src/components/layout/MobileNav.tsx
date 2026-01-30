import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCircle,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: GraduationCap, label: 'Students', path: '/students' },
  { icon: Users, label: 'Teachers', path: '/teachers' },
  { icon: UserCircle, label: 'Parents', path: '/parents' },
  { icon: Settings, label: 'More', path: '/settings' },
];

export const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
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
                <item.icon className={cn(
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
