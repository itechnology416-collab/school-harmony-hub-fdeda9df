import { Student, Teacher, Parent, Class, Subject, DashboardStats, Attendance, CalendarEvent } from '@/types/school';

export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@school.edu',
    phone: '+1 234-567-8901',
    dateOfBirth: '2010-05-15',
    gender: 'female',
    address: '123 Oak Street, Springfield',
    classId: '1',
    sectionId: '1a',
    parentId: '1',
    admissionDate: '2020-08-01',
    rollNumber: 'STU001',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@school.edu',
    phone: '+1 234-567-8902',
    dateOfBirth: '2010-08-22',
    gender: 'male',
    address: '456 Maple Avenue, Springfield',
    classId: '1',
    sectionId: '1a',
    parentId: '2',
    admissionDate: '2020-08-01',
    rollNumber: 'STU002',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Sophia',
    lastName: 'Garcia',
    email: 'sophia.garcia@school.edu',
    phone: '+1 234-567-8903',
    dateOfBirth: '2009-12-03',
    gender: 'female',
    address: '789 Pine Road, Springfield',
    classId: '2',
    sectionId: '2a',
    parentId: '3',
    admissionDate: '2019-08-01',
    rollNumber: 'STU003',
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Liam',
    lastName: 'Martinez',
    email: 'liam.martinez@school.edu',
    phone: '+1 234-567-8904',
    dateOfBirth: '2011-03-18',
    gender: 'male',
    address: '321 Elm Street, Springfield',
    classId: '1',
    sectionId: '1b',
    parentId: '4',
    admissionDate: '2021-08-01',
    rollNumber: 'STU004',
    status: 'active'
  },
  {
    id: '5',
    firstName: 'Olivia',
    lastName: 'Anderson',
    email: 'olivia.anderson@school.edu',
    phone: '+1 234-567-8905',
    dateOfBirth: '2010-07-09',
    gender: 'female',
    address: '654 Birch Lane, Springfield',
    classId: '2',
    sectionId: '2b',
    parentId: '5',
    admissionDate: '2020-08-01',
    rollNumber: 'STU005',
    status: 'active'
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'michael.t@school.edu',
    phone: '+1 234-567-1001',
    dateOfBirth: '1985-03-20',
    gender: 'male',
    address: '100 Teacher Lane, Springfield',
    qualification: 'M.Ed in Mathematics',
    experience: '12 years',
    joiningDate: '2012-07-01',
    subjects: ['1', '2'],
    classes: ['1', '2'],
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.d@school.edu',
    phone: '+1 234-567-1002',
    dateOfBirth: '1988-07-15',
    gender: 'female',
    address: '200 Teacher Lane, Springfield',
    qualification: 'M.A. in English Literature',
    experience: '8 years',
    joiningDate: '2016-07-01',
    subjects: ['3'],
    classes: ['1', '2', '3'],
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.c@school.edu',
    phone: '+1 234-567-1003',
    dateOfBirth: '1982-11-08',
    gender: 'male',
    address: '300 Teacher Lane, Springfield',
    qualification: 'Ph.D. in Physics',
    experience: '15 years',
    joiningDate: '2010-07-01',
    subjects: ['4'],
    classes: ['2', '3'],
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@school.edu',
    phone: '+1 234-567-1004',
    dateOfBirth: '1990-04-25',
    gender: 'female',
    address: '400 Teacher Lane, Springfield',
    qualification: 'M.Sc. in Chemistry',
    experience: '6 years',
    joiningDate: '2018-07-01',
    subjects: ['5'],
    classes: ['2', '3'],
    status: 'active'
  }
];

export const mockParents: Parent[] = [
  {
    id: '1',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 234-567-2001',
    address: '123 Oak Street, Springfield',
    occupation: 'Software Engineer',
    studentIds: ['1'],
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Brown',
    email: 'sarah.brown@email.com',
    phone: '+1 234-567-2002',
    address: '456 Maple Avenue, Springfield',
    occupation: 'Doctor',
    studentIds: ['2'],
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Garcia',
    email: 'carlos.garcia@email.com',
    phone: '+1 234-567-2003',
    address: '789 Pine Road, Springfield',
    occupation: 'Business Owner',
    studentIds: ['3'],
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Maria',
    lastName: 'Martinez',
    email: 'maria.martinez@email.com',
    phone: '+1 234-567-2004',
    address: '321 Elm Street, Springfield',
    occupation: 'Teacher',
    studentIds: ['4'],
    status: 'active'
  },
  {
    id: '5',
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 234-567-2005',
    address: '654 Birch Lane, Springfield',
    occupation: 'Accountant',
    studentIds: ['5'],
    status: 'active'
  }
];

export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Grade 5',
    sections: [
      { id: '1a', name: 'Section A', classId: '1', capacity: 30, studentCount: 25 },
      { id: '1b', name: 'Section B', classId: '1', capacity: 30, studentCount: 22 }
    ],
    classTeacherId: '1',
    subjectIds: ['1', '2', '3', '4', '5']
  },
  {
    id: '2',
    name: 'Grade 6',
    sections: [
      { id: '2a', name: 'Section A', classId: '2', capacity: 30, studentCount: 28 },
      { id: '2b', name: 'Section B', classId: '2', capacity: 30, studentCount: 26 }
    ],
    classTeacherId: '2',
    subjectIds: ['1', '2', '3', '4', '5']
  },
  {
    id: '3',
    name: 'Grade 7',
    sections: [
      { id: '3a', name: 'Section A', classId: '3', capacity: 35, studentCount: 30 },
      { id: '3b', name: 'Section B', classId: '3', capacity: 35, studentCount: 32 }
    ],
    classTeacherId: '3',
    subjectIds: ['1', '2', '3', '4', '5']
  }
];

export const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH', teacherIds: ['1'], classIds: ['1', '2', '3'] },
  { id: '2', name: 'Algebra', code: 'ALG', teacherIds: ['1'], classIds: ['2', '3'] },
  { id: '3', name: 'English', code: 'ENG', teacherIds: ['2'], classIds: ['1', '2', '3'] },
  { id: '4', name: 'Physics', code: 'PHY', teacherIds: ['3'], classIds: ['2', '3'] },
  { id: '5', name: 'Chemistry', code: 'CHEM', teacherIds: ['4'], classIds: ['2', '3'] }
];

export const mockAttendance: Attendance[] = [
  { id: '1', studentId: '1', date: '2024-01-15', status: 'present' },
  { id: '2', studentId: '2', date: '2024-01-15', status: 'present' },
  { id: '3', studentId: '3', date: '2024-01-15', status: 'absent', remarks: 'Sick leave' },
  { id: '4', studentId: '4', date: '2024-01-15', status: 'late' },
  { id: '5', studentId: '5', date: '2024-01-15', status: 'present' }
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Mid-Term Exams', date: '2024-02-15', endDate: '2024-02-22', type: 'exam', color: '#ef4444' },
  { id: '2', title: 'Spring Break', date: '2024-03-18', endDate: '2024-03-22', type: 'holiday', color: '#22c55e' },
  { id: '3', title: 'Parent-Teacher Meeting', date: '2024-02-28', type: 'meeting', color: '#3b82f6' },
  { id: '4', title: 'Annual Sports Day', date: '2024-04-05', type: 'event', color: '#f97316' },
  { id: '5', title: 'Final Exams', date: '2024-05-20', endDate: '2024-05-31', type: 'exam', color: '#ef4444' }
];

export const mockDashboardStats: DashboardStats = {
  totalStudents: 487,
  totalTeachers: 42,
  totalParents: 425,
  totalClasses: 18,
  attendanceRate: 94.5,
  averagePerformance: 78.3
};

export const attendanceChartData = [
  { month: 'Sep', present: 95, absent: 5 },
  { month: 'Oct', present: 92, absent: 8 },
  { month: 'Nov', present: 94, absent: 6 },
  { month: 'Dec', present: 88, absent: 12 },
  { month: 'Jan', present: 96, absent: 4 },
  { month: 'Feb', present: 93, absent: 7 }
];

export const performanceChartData = [
  { subject: 'Math', score: 82 },
  { subject: 'English', score: 78 },
  { subject: 'Science', score: 85 },
  { subject: 'History', score: 72 },
  { subject: 'Art', score: 90 }
];
