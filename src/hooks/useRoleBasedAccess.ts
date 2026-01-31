import { useAuth, AppRole } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export interface Permission {
  canManageUsers: boolean;
  canManageStudents: boolean;
  canManageTeachers: boolean;
  canManageParents: boolean;
  canManageClasses: boolean;
  canManageSubjects: boolean;
  canManageAttendance: boolean;
  canManageExams: boolean;
  canManageAssignments: boolean;
  canManageFees: boolean;
  canManageLibrary: boolean;
  canManageTransport: boolean;
  canManageNotifications: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageCalendar: boolean;
}

const rolePermissions: Record<AppRole, Permission> = {
  admin: {
    canManageUsers: true,
    canManageStudents: true,
    canManageTeachers: true,
    canManageParents: true,
    canManageClasses: true,
    canManageSubjects: true,
    canManageAttendance: true,
    canManageExams: true,
    canManageAssignments: true,
    canManageFees: true,
    canManageLibrary: true,
    canManageTransport: true,
    canManageNotifications: true,
    canViewReports: true,
    canManageSettings: true,
    canManageCalendar: true,
  },
  teacher: {
    canManageUsers: false,
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageClasses: false,
    canManageSubjects: false,
    canManageAttendance: true,
    canManageExams: true,
    canManageAssignments: true,
    canManageFees: false,
    canManageLibrary: false,
    canManageTransport: false,
    canManageNotifications: true,
    canViewReports: true,
    canManageSettings: false,
    canManageCalendar: true,
  },
  parent: {
    canManageUsers: false,
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageClasses: false,
    canManageSubjects: false,
    canManageAttendance: false,
    canManageExams: false,
    canManageAssignments: false,
    canManageFees: false,
    canManageLibrary: false,
    canManageTransport: false,
    canManageNotifications: false,
    canViewReports: true,
    canManageSettings: false,
    canManageCalendar: false,
  },
  student: {
    canManageUsers: false,
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageClasses: false,
    canManageSubjects: false,
    canManageAttendance: false,
    canManageExams: false,
    canManageAssignments: false,
    canManageFees: false,
    canManageLibrary: false,
    canManageTransport: false,
    canManageNotifications: false,
    canViewReports: true,
    canManageSettings: false,
    canManageCalendar: false,
  },
};

export const useRoleBasedAccess = () => {
  const { primaryRole, roles, isAdmin, isTeacher, isParent, isStudent } = useAuth();

  const permissions = useMemo<Permission>(() => {
    if (!primaryRole) {
      return {
        canManageUsers: false,
        canManageStudents: false,
        canManageTeachers: false,
        canManageParents: false,
        canManageClasses: false,
        canManageSubjects: false,
        canManageAttendance: false,
        canManageExams: false,
        canManageAssignments: false,
        canManageFees: false,
        canManageLibrary: false,
        canManageTransport: false,
        canManageNotifications: false,
        canViewReports: false,
        canManageSettings: false,
        canManageCalendar: false,
      };
    }

    // Merge permissions from all roles (user gets the highest permission from any role)
    const mergedPermissions = { ...rolePermissions[primaryRole] };
    
    roles.forEach(role => {
      const perms = rolePermissions[role];
      Object.keys(perms).forEach(key => {
        const permKey = key as keyof Permission;
        if (perms[permKey]) {
          mergedPermissions[permKey] = true;
        }
      });
    });

    return mergedPermissions;
  }, [primaryRole, roles]);

  const getDashboardRoute = (): string => {
    if (isAdmin()) return '/admin/dashboard';
    if (isTeacher()) return '/teacher/dashboard';
    if (isParent()) return '/parent/dashboard';
    if (isStudent()) return '/student/dashboard';
    return '/dashboard';
  };

  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: getDashboardRoute(), icon: 'LayoutDashboard' },
    ];

    if (isAdmin()) {
      return [
        ...baseItems,
        { label: 'Students', path: '/students', icon: 'GraduationCap' },
        { label: 'Teachers', path: '/teachers', icon: 'Users' },
        { label: 'Parents', path: '/parents', icon: 'UserCircle' },
        { label: 'Classes', path: '/classes-sections', icon: 'School' },
        { label: 'More', path: '/settings', icon: 'Settings' },
      ];
    }

    if (isTeacher()) {
      return [
        ...baseItems,
        { label: 'My Classes', path: '/teacher/classes', icon: 'School' },
        { label: 'Attendance', path: '/attendance', icon: 'ClipboardCheck' },
        { label: 'Assignments', path: '/assignments', icon: 'FileText' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ];
    }

    if (isParent()) {
      return [
        ...baseItems,
        { label: 'Children', path: '/parent/children', icon: 'Users' },
        { label: 'Attendance', path: '/parent/attendance', icon: 'ClipboardCheck' },
        { label: 'Fees', path: '/parent/fees', icon: 'CreditCard' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ];
    }

    if (isStudent()) {
      return [
        ...baseItems,
        { label: 'My Classes', path: '/student/classes', icon: 'School' },
        { label: 'Assignments', path: '/student/assignments', icon: 'FileText' },
        { label: 'Results', path: '/student/results', icon: 'Award' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ];
    }

    return baseItems;
  };

  return {
    permissions,
    primaryRole,
    roles,
    isAdmin,
    isTeacher,
    isParent,
    isStudent,
    getDashboardRoute,
    getNavItems,
  };
};
