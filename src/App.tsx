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
import DashboardScreen from "./pages/DashboardScreen";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
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
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/students" element={<StudentsScreen />} />
        <Route path="/teachers" element={<TeachersScreen />} />
        <Route path="/parents" element={<ParentsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/attendance" element={<AttendanceScreen />} />
        <Route path="/import-data" element={<ImportExportScreen />} />
        <Route path="/export-data" element={<ImportExportScreen />} />
        <Route path="/academic-calendar" element={<CalendarScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/students/add" element={<AddStudentScreen />} />
        <Route path="/examinations" element={<ExamsScreen />} />
        <Route path="/classes-sections" element={<ClassesScreen />} />
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
