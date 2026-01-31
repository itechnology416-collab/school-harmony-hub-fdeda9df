import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  UserCircle, 
  BookOpen,
  Bell,
  Plus,
  FileUp,
  FileText,
  Calendar,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip
} from 'recharts';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, attendanceChartData, performanceChartData } from '@/data/mockData';
import { toast } from 'sonner';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : 'Admin';

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const quickActions = [
    { 
      title: 'Add Student', 
      description: 'Register new student', 
      icon: Plus, 
      onClick: () => navigate('/students/add'),
      variant: 'primary' as const
    },
    { 
      title: 'Import Data', 
      description: 'Excel/CSV upload', 
      icon: FileUp, 
      onClick: () => navigate('/import'),
      variant: 'default' as const
    },
    { 
      title: 'Generate Report', 
      description: 'Export reports', 
      icon: FileText, 
      onClick: () => navigate('/reports'),
      variant: 'default' as const
    },
    { 
      title: 'Calendar', 
      description: 'View schedule', 
      icon: Calendar, 
      onClick: () => navigate('/calendar'),
      variant: 'default' as const
    },
  ];

  return (
    <div className="screen-container px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="lg" />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-lg font-bold font-display text-foreground">
              {profile?.first_name || 'Admin'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="Total Students"
          value={mockDashboardStats.totalStudents}
          icon={GraduationCap}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Total Teachers"
          value={mockDashboardStats.totalTeachers}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Total Parents"
          value={mockDashboardStats.totalParents}
          icon={UserCircle}
          variant="success"
        />
        <StatCard
          title="Total Classes"
          value={mockDashboardStats.totalClasses}
          icon={BookOpen}
          variant="warning"
        />
      </div>

      {/* Attendance Chart */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Attendance Rate</h3>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              {mockDashboardStats.attendanceRate}%
            </span>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceChartData}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(234, 89%, 58%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(234, 89%, 58%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="hsl(234, 89%, 58%)"
                strokeWidth={3}
                fill="url(#colorPresent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Subject Performance</h3>
            <p className="text-sm text-muted-foreground">Average scores</p>
          </div>
          <span className="text-sm font-medium text-primary">
            Avg: {mockDashboardStats.averagePerformance}%
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceChartData} barCategoryGap="20%">
              <XAxis 
                dataKey="subject" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="score" 
                fill="hsl(25, 95%, 53%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              variant={action.variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
