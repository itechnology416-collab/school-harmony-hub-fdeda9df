-- =====================================================
-- SCHOOL MANAGEMENT SYSTEM - FOUNDATION SCHEMA
-- Modules 1-6: Auth, Users, Students, Teachers, Parents, Academic Structure, Attendance
-- =====================================================

-- 1. Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'parent', 'student');

-- 2. Create app_permission enum for fine-grained permissions
CREATE TYPE public.app_permission AS ENUM (
  'manage_users', 'manage_students', 'manage_teachers', 'manage_parents',
  'manage_classes', 'manage_subjects', 'manage_attendance', 'manage_exams',
  'manage_assignments', 'manage_fees', 'manage_library', 'manage_transport',
  'manage_notifications', 'view_reports', 'manage_settings', 'manage_calendar'
);

-- 3. Create gender enum
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- 4. Create status enums
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended', 'graduated', 'transferred');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused', 'half_day');
CREATE TYPE public.exam_type AS ENUM ('quiz', 'midterm', 'final', 'assignment', 'practical', 'project');
CREATE TYPE public.notification_type AS ENUM ('announcement', 'alert', 'reminder', 'message', 'emergency');
CREATE TYPE public.event_type AS ENUM ('holiday', 'exam', 'event', 'meeting', 'deadline', 'activity');

-- 5. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender gender_type,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User roles table (many-to-many: user can have multiple roles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 7. Role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

-- 8. Academic years table
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Terms/Semesters table
CREATE TABLE public.terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level INTEGER,
  description TEXT,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Sections table
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 30,
  room_number TEXT,
  class_teacher_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, name)
);

-- 12. Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  credit_hours INTEGER DEFAULT 0,
  is_elective BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Class-Subject mapping (which subjects are taught in which classes)
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id)
);

-- 14. Teachers table (extends profiles for teacher-specific data)
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id TEXT UNIQUE,
  qualification TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 0,
  joining_date DATE,
  department TEXT,
  designation TEXT,
  salary DECIMAL(10,2),
  status user_status DEFAULT 'active',
  emergency_contact TEXT,
  emergency_phone TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Teacher-Subject assignment
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, subject_id)
);

-- 16. Teacher-Class assignment
CREATE TABLE public.teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, class_id, section_id, subject_id)
);

-- 17. Parents table
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  occupation TEXT,
  workplace TEXT,
  annual_income DECIMAL(12,2),
  relation_type TEXT DEFAULT 'parent',
  secondary_phone TEXT,
  secondary_email TEXT,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  admission_number TEXT UNIQUE NOT NULL,
  roll_number TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  admission_date DATE DEFAULT CURRENT_DATE,
  previous_school TEXT,
  blood_group TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  status user_status DEFAULT 'active',
  transport_opted BOOLEAN DEFAULT false,
  hostel_opted BOOLEAN DEFAULT false,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Student-Parent relationship (supports multiple children per parent)
CREATE TABLE public.student_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, parent_id)
);

-- 20. Attendance table (students)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  remarks TEXT,
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

-- 21. Staff attendance table
CREATE TABLE public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 22. Exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_type exam_type NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  passing_marks DECIMAL(5,2) NOT NULL DEFAULT 40,
  syllabus TEXT,
  instructions TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Marks/Results table
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  marks_obtained DECIMAL(5,2),
  grade TEXT,
  grade_points DECIMAL(3,2),
  remarks TEXT,
  is_absent BOOLEAN DEFAULT false,
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_id)
);

-- 24. Assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  total_marks DECIMAL(5,2) DEFAULT 100,
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. Assignment submissions
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  submission_text TEXT,
  attachments JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  marks_obtained DECIMAL(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

-- 26. Timetable table
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. Fee structure table
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  due_day INTEGER DEFAULT 10,
  late_fee DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 28. Fee payments table
CREATE TABLE public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE CASCADE NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT,
  remarks TEXT,
  collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 29. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type DEFAULT 'announcement',
  recipient_role app_role,
  recipient_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  sent_via JSONB DEFAULT '["app"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. Calendar events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT true,
  location TEXT,
  color TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 31. Documents table (centralized document storage references)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. School settings table
CREATE TABLE public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'My School',
  school_logo TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  email TEXT,
  website TEXT,
  principal_name TEXT,
  established_year INTEGER,
  board_affiliation TEXT,
  grading_system JSONB DEFAULT '{"A+": 90, "A": 80, "B+": 70, "B": 60, "C": 50, "F": 0}',
  attendance_rules JSONB DEFAULT '{"minimum_percentage": 75}',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Function to check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'teacher'
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'teacher' THEN 2 
      WHEN 'parent' THEN 3 
      WHEN 'student' THEN 4 
    END
  LIMIT 1
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- Role permissions (read-only for all authenticated)
CREATE POLICY "Authenticated users can view permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage permissions" ON public.role_permissions FOR ALL USING (public.is_admin(auth.uid()));

-- Academic years (read by all, managed by admin)
CREATE POLICY "Authenticated can view academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage academic years" ON public.academic_years FOR ALL USING (public.is_admin(auth.uid()));

-- Terms
CREATE POLICY "Authenticated can view terms" ON public.terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage terms" ON public.terms FOR ALL USING (public.is_admin(auth.uid()));

-- Classes (read by all authenticated, managed by admin/teachers)
CREATE POLICY "Authenticated can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.is_admin(auth.uid()));

-- Sections
CREATE POLICY "Authenticated can view sections" ON public.sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sections" ON public.sections FOR ALL USING (public.is_admin(auth.uid()));

-- Subjects
CREATE POLICY "Authenticated can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.is_admin(auth.uid()));

-- Class subjects
CREATE POLICY "Authenticated can view class subjects" ON public.class_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage class subjects" ON public.class_subjects FOR ALL USING (public.is_admin(auth.uid()));

-- Teachers
CREATE POLICY "Authenticated can view teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can view own record" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage teachers" ON public.teachers FOR ALL USING (public.is_admin(auth.uid()));

-- Teacher subjects/classes
CREATE POLICY "Authenticated can view teacher assignments" ON public.teacher_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage teacher subjects" ON public.teacher_subjects FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view teacher classes" ON public.teacher_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes FOR ALL USING (public.is_admin(auth.uid()));

-- Parents
CREATE POLICY "Parents can view own record" ON public.parents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage parents" ON public.parents FOR ALL USING (public.is_admin(auth.uid()));

-- Students
CREATE POLICY "Students can view own record" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Parents can view linked students" ON public.students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parents sp
    JOIN public.parents p ON sp.parent_id = p.id
    WHERE sp.student_id = students.id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Teachers can view class students" ON public.students FOR SELECT USING (
  public.is_teacher(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.teacher_classes tc
    JOIN public.teachers t ON tc.teacher_id = t.id
    WHERE t.user_id = auth.uid() AND tc.class_id = students.class_id
  )
);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (public.is_admin(auth.uid()));

-- Student parents
CREATE POLICY "View own student-parent links" ON public.student_parents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.parents WHERE id = student_parents.parent_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.students WHERE id = student_parents.student_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage student parents" ON public.student_parents FOR ALL USING (public.is_admin(auth.uid()));

-- Attendance
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE id = attendance.student_id AND user_id = auth.uid())
);
CREATE POLICY "Parents view children attendance" ON public.attendance FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parents sp
    JOIN public.parents p ON sp.parent_id = p.id
    WHERE sp.student_id = attendance.student_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Teachers manage class attendance" ON public.attendance FOR ALL USING (
  public.is_teacher(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.teacher_classes tc
    JOIN public.teachers t ON tc.teacher_id = t.id
    WHERE t.user_id = auth.uid() AND tc.class_id = attendance.class_id
  )
);
CREATE POLICY "Admins manage all attendance" ON public.attendance FOR ALL USING (public.is_admin(auth.uid()));

-- Staff attendance
CREATE POLICY "Staff view own attendance" ON public.staff_attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage staff attendance" ON public.staff_attendance FOR ALL USING (public.is_admin(auth.uid()));

-- Exams
CREATE POLICY "Authenticated view exams" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage own exams" ON public.exams FOR ALL USING (
  public.is_teacher(auth.uid()) AND created_by = auth.uid()
);
CREATE POLICY "Admins manage all exams" ON public.exams FOR ALL USING (public.is_admin(auth.uid()));

-- Marks
CREATE POLICY "Students view own marks" ON public.marks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE id = marks.student_id AND user_id = auth.uid())
);
CREATE POLICY "Parents view children marks" ON public.marks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parents sp
    JOIN public.parents p ON sp.parent_id = p.id
    WHERE sp.student_id = marks.student_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Teachers manage exam marks" ON public.marks FOR ALL USING (
  public.is_teacher(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.teacher_classes tc ON e.class_id = tc.class_id
    JOIN public.teachers t ON tc.teacher_id = t.id
    WHERE e.id = marks.exam_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Admins manage all marks" ON public.marks FOR ALL USING (public.is_admin(auth.uid()));

-- Assignments
CREATE POLICY "Authenticated view published assignments" ON public.assignments FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Teachers manage own assignments" ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = assignments.teacher_id AND user_id = auth.uid())
);
CREATE POLICY "Admins manage all assignments" ON public.assignments FOR ALL USING (public.is_admin(auth.uid()));

-- Assignment submissions
CREATE POLICY "Students manage own submissions" ON public.assignment_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.students WHERE id = assignment_submissions.student_id AND user_id = auth.uid())
);
CREATE POLICY "Teachers view/grade submissions" ON public.assignment_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.teachers t ON a.teacher_id = t.id
    WHERE a.id = assignment_submissions.assignment_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Admins manage all submissions" ON public.assignment_submissions FOR ALL USING (public.is_admin(auth.uid()));

-- Timetable
CREATE POLICY "Authenticated view timetable" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable FOR ALL USING (public.is_admin(auth.uid()));

-- Fee structures
CREATE POLICY "Authenticated view fee structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage fee structures" ON public.fee_structures FOR ALL USING (public.is_admin(auth.uid()));

-- Fee payments
CREATE POLICY "Students view own payments" ON public.fee_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE id = fee_payments.student_id AND user_id = auth.uid())
);
CREATE POLICY "Parents view children payments" ON public.fee_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parents sp
    JOIN public.parents p ON sp.parent_id = p.id
    WHERE sp.student_id = fee_payments.student_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Admins manage all payments" ON public.fee_payments FOR ALL USING (public.is_admin(auth.uid()));

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (
  recipient_user_id = auth.uid() OR 
  (recipient_role IS NOT NULL AND public.has_role(auth.uid(), recipient_role))
);
CREATE POLICY "Users can mark own notifications read" ON public.notifications FOR UPDATE USING (recipient_user_id = auth.uid());
CREATE POLICY "Admins manage all notifications" ON public.notifications FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Teachers can send notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_teacher(auth.uid()));

-- Calendar events
CREATE POLICY "Authenticated view events" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage events" ON public.calendar_events FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Teachers can create events" ON public.calendar_events FOR INSERT WITH CHECK (public.is_teacher(auth.uid()));

-- Documents
CREATE POLICY "Users view own documents" ON public.documents FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "View public documents" ON public.documents FOR SELECT USING (is_public = true);
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins manage all documents" ON public.documents FOR ALL USING (public.is_admin(auth.uid()));

-- School settings
CREATE POLICY "Authenticated view school settings" ON public.school_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage school settings" ON public.school_settings FOR ALL USING (public.is_admin(auth.uid()));

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATED TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON public.parents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON public.marks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_settings_updated_at BEFORE UPDATE ON public.school_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default school settings
INSERT INTO public.school_settings (school_name, email, phone) 
VALUES ('EduManage Pro School', 'admin@school.edu', '+91 1234567890');

-- Insert default academic year
INSERT INTO public.academic_years (name, start_date, end_date, is_current)
VALUES ('2025-2026', '2025-04-01', '2026-03-31', true);

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_users'), ('admin', 'manage_students'), ('admin', 'manage_teachers'),
  ('admin', 'manage_parents'), ('admin', 'manage_classes'), ('admin', 'manage_subjects'),
  ('admin', 'manage_attendance'), ('admin', 'manage_exams'), ('admin', 'manage_assignments'),
  ('admin', 'manage_fees'), ('admin', 'manage_library'), ('admin', 'manage_transport'),
  ('admin', 'manage_notifications'), ('admin', 'view_reports'), ('admin', 'manage_settings'),
  ('admin', 'manage_calendar'),
  ('teacher', 'manage_attendance'), ('teacher', 'manage_exams'), ('teacher', 'manage_assignments'),
  ('teacher', 'manage_notifications'), ('teacher', 'view_reports'), ('teacher', 'manage_calendar'),
  ('parent', 'view_reports'),
  ('student', 'view_reports');