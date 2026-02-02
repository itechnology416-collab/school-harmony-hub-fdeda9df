import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardCheck, 
  Calendar,
  BookOpen,
  FileText,
  PenTool,
  MessageSquare,
  Clock,
  Bell,
  LogOut,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'default';
}

const MenuItem = ({ icon: Icon, label, onClick, variant = 'default' }: MenuItemProps) => {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    default: 'bg-secondary text-secondary-foreground',
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className={cn(
        "p-4 rounded-2xl",
        variantStyles[variant]
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-foreground text-center">{label}</span>
    </button>
  );
};

const TeacherDashboardScreen = () => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : 'Teacher';

  // Fetch teacher data and their assigned classes
  const { data: teacherData } = useQuery({
    queryKey: ['teacher-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get teacher record
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, department, designation')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacher) return { studentCount: 0, classCount: 0, attendanceRate: 0 };

      // Get assigned classes
      const { data: teacherClasses } = await supabase
        .from('teacher_classes')
        .select('class_id, section_id')
        .eq('teacher_id', teacher.id);

      const classIds = teacherClasses?.map(tc => tc.class_id) || [];

      // Get student count in assigned classes
      let studentCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
        studentCount = count || 0;
      }

      // Get today's attendance for assigned classes
      const today = new Date().toISOString().split('T')[0];
      let attendanceRate = 0;
      if (classIds.length > 0) {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .in('class_id', classIds)
          .eq('date', today);

        if (attendanceData && attendanceData.length > 0) {
          const presentCount = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
          attendanceRate = Math.round((presentCount / attendanceData.length) * 100);
        }
      }

      return {
        studentCount,
        classCount: classIds.length,
        attendanceRate,
        teacherId: teacher.id,
        designation: teacher.designation || 'Class Teacher'
      };
    },
    enabled: !!user?.id
  });

  // Fetch latest student admissions
  const { data: latestStudents } = useQuery({
    queryKey: ['latest-admissions'],
    queryFn: async () => {
      const { data: students } = await supabase
        .from('students')
        .select(`
          id,
          admission_number,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!students) return [];

      // Fetch profiles for these students
      const userIds = students.map(s => s.user_id).filter(Boolean);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      return students.map(student => {
        const studentProfile = profiles?.find(p => p.user_id === student.user_id);
        return {
          id: student.id,
          name: studentProfile ? `${studentProfile.first_name} ${studentProfile.last_name}` : 'Unknown',
          avatar: studentProfile?.avatar_url
        };
      });
    }
  });

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: Users, label: 'Student List', path: '/students', variant: 'primary' as const },
    { icon: ClipboardCheck, label: 'Class Attendance', path: '/attendance', variant: 'success' as const },
    { icon: Clock, label: 'Self Attendance', path: '/profile', variant: 'accent' as const },
    { icon: Calendar, label: 'Holiday Calendar', path: '/academic-calendar', variant: 'warning' as const },
    { icon: BookOpen, label: 'My Timetable', path: '/timetable', variant: 'primary' as const },
    { icon: FileText, label: 'Homework Diary', path: '/assignments', variant: 'default' as const },
    { icon: PenTool, label: 'Marks Entry', path: '/examinations', variant: 'accent' as const },
    { icon: MessageSquare, label: 'Teacher Remarks', path: '/notifications', variant: 'success' as const },
  ];

  return (
    <div className="screen-container px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              {profile?.first_name || 'Teacher'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {teacherData?.designation || 'Class Teacher'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          <Avatar name={displayName} src={profile?.avatar_url} size="lg" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-card gradient-success text-success-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Students</p>
              <p className="text-3xl font-bold font-display">{teacherData?.studentCount || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/20">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="stat-card gradient-warning text-warning-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Class Attendance</p>
              <p className="text-3xl font-bold font-display">{teacherData?.attendanceRate || 0}%</p>
            </div>
            <div className="p-3 rounded-xl bg-white/20">
              <ClipboardCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Admissions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Latest Admissions</h3>
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2">
          {latestStudents && latestStudents.length > 0 ? (
            latestStudents.map((student) => (
              <div key={student.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                <Avatar name={student.name} src={student.avatar} size="lg" />
                <span className="text-xs text-muted-foreground text-center truncate w-full">
                  {student.name.split(' ')[0]}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent admissions</p>
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

      {/* Logout Button */}
      <Button 
        variant="outline" 
        className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default TeacherDashboardScreen;
