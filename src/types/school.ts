export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  classId: string;
  sectionId: string;
  parentId: string;
  admissionDate: string;
  rollNumber: string;
  avatar?: string;
  documents?: string[];
  status: 'active' | 'inactive' | 'graduated';
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  subjects: string[];
  classes: string[];
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  studentIds: string[];
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Class {
  id: string;
  name: string;
  sections: Section[];
  classTeacherId?: string;
  subjectIds: string[];
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  capacity: number;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherIds: string[];
  classIds: string[];
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface Exam {
  id: string;
  name: string;
  type: 'quiz' | 'midterm' | 'final' | 'assignment';
  classId: string;
  subjectId: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
}

export interface Mark {
  id: string;
  studentId: string;
  examId: string;
  obtainedMarks: number;
  grade?: string;
  remarks?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'alert' | 'reminder';
  recipientType: 'all' | 'teachers' | 'parents' | 'specific';
  recipientIds?: string[];
  createdAt: string;
  isRead: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: 'holiday' | 'exam' | 'event' | 'meeting';
  color?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  attendanceRate: number;
  averagePerformance: number;
}
