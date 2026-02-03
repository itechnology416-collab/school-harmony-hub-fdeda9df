import { useAuth } from '@/contexts/AuthContext';
import DashboardScreen from './DashboardScreen';
import TeacherDashboardScreen from './TeacherDashboardScreen';
import ParentDashboardScreen from './ParentDashboardScreen';

const RoleDashboard = () => {
  const { isTeacher, isAdmin, isParent, isStudent } = useAuth();

  // Show role-specific dashboards (priority order matters)
  if (isAdmin()) {
    return <DashboardScreen />;
  }

  if (isTeacher()) {
    return <TeacherDashboardScreen />;
  }

  if (isParent()) {
    return <ParentDashboardScreen />;
  }

  // TODO: Add StudentDashboardScreen
  // if (isStudent()) {
  //   return <StudentDashboardScreen />;
  // }

  // Default to admin dashboard
  return <DashboardScreen />;
};

export default RoleDashboard;
