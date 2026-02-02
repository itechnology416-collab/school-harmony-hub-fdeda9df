import { useAuth } from '@/contexts/AuthContext';
import DashboardScreen from './DashboardScreen';
import TeacherDashboardScreen from './TeacherDashboardScreen';

const RoleDashboard = () => {
  const { isTeacher, isAdmin, isParent, isStudent } = useAuth();

  // Show role-specific dashboards
  if (isTeacher() && !isAdmin()) {
    return <TeacherDashboardScreen />;
  }

  // TODO: Add ParentDashboardScreen and StudentDashboardScreen
  // if (isParent() && !isAdmin() && !isTeacher()) {
  //   return <ParentDashboardScreen />;
  // }

  // if (isStudent() && !isAdmin() && !isTeacher() && !isParent()) {
  //   return <StudentDashboardScreen />;
  // }

  // Default to admin dashboard
  return <DashboardScreen />;
};

export default RoleDashboard;
