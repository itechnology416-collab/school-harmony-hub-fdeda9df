import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layouts
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import LoginScreen from "./pages/LoginScreen";
import SignUpScreen from "./pages/SignUpScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import RoleDashboard from "./pages/RoleDashboard";
import StudentsScreen from "./pages/StudentsScreen";
import TeachersScreen from "./pages/TeachersScreen";
import ParentsScreen from "./pages/ParentsScreen";
import SettingsScreen from "./pages/SettingsScreen";
import AttendanceScreen from "./pages/AttendanceScreen";
import ImportExportScreen from "./pages/ImportExportScreen";
import CalendarScreen from "./pages/CalendarScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import AddStudentScreen from "./pages/AddStudentScreen";
import ExamsScreen from "./pages/ExamsScreen";
import ClassesScreen from "./pages/ClassesScreen";
import ProfileScreen from "./pages/ProfileScreen";
import TimetableScreen from "./pages/TimetableScreen";
import NotFound from "./pages/NotFound";

// New Teacher Module Pages
import SelfAttendanceScreen from "./pages/SelfAttendanceScreen";
import SalaryReportScreen from "./pages/SalaryReportScreen";
import StudyMaterialScreen from "./pages/StudyMaterialScreen";
import NoticeBoardScreen from "./pages/NoticeBoardScreen";
import ChangePasswordScreen from "./pages/ChangePasswordScreen";
import OnlineClassesScreen from "./pages/OnlineClassesScreen";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignUpScreen />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordScreen />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Common Routes */}
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/change-password" element={<ChangePasswordScreen />} />
        
        {/* Admin Routes */}
        <Route path="/students" element={<StudentsScreen />} />
        <Route path="/students/add" element={<AddStudentScreen />} />
        <Route path="/teachers" element={<TeachersScreen />} />
        <Route path="/parents" element={<ParentsScreen />} />
        <Route path="/classes-sections" element={<ClassesScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/attendance" element={<AttendanceScreen />} />
        <Route path="/import-data" element={<ImportExportScreen />} />
        <Route path="/export-data" element={<ImportExportScreen />} />
        <Route path="/academic-calendar" element={<CalendarScreen />} />
        <Route path="/examinations" element={<ExamsScreen />} />
        <Route path="/timetable" element={<TimetableScreen />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/classes" element={<ClassesScreen />} />
        <Route path="/assignments" element={<ExamsScreen />} />
        <Route path="/self-attendance" element={<SelfAttendanceScreen />} />
        <Route path="/salary-report" element={<SalaryReportScreen />} />
        <Route path="/study-material" element={<StudyMaterialScreen />} />
        <Route path="/notice-board" element={<NoticeBoardScreen />} />
        <Route path="/online-classes" element={<OnlineClassesScreen />} />
        
        {/* Parent Routes */}
        <Route path="/parent/children" element={<StudentsScreen />} />
        <Route path="/parent/attendance" element={<AttendanceScreen />} />
        <Route path="/parent/fees" element={<SettingsScreen />} />
        
        {/* Student Routes */}
        <Route path="/student/classes" element={<ClassesScreen />} />
        <Route path="/student/assignments" element={<ExamsScreen />} />
        <Route path="/student/results" element={<ExamsScreen />} />
      </Route>
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
