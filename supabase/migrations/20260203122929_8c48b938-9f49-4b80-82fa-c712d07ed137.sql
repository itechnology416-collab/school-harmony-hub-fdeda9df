-- Create wallet_transactions table for parent wallet system
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  description TEXT,
  reference_id TEXT,
  balance_after NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teacher_remarks table for student feedback
CREATE TABLE public.teacher_remarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  remark_type TEXT NOT NULL CHECK (remark_type IN ('positive', 'negative', 'neutral', 'improvement')),
  subject TEXT,
  content TEXT NOT NULL,
  is_shared_with_parent BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create online_classes table for virtual meetings
CREATE TABLE public.online_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table for better fee tracking
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_transactions
CREATE POLICY "Parents view own wallet" ON public.wallet_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM parents WHERE parents.id = wallet_transactions.parent_id AND parents.user_id = auth.uid())
  );

CREATE POLICY "Admins manage wallet" ON public.wallet_transactions
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for teacher_remarks
CREATE POLICY "Teachers manage own remarks" ON public.teacher_remarks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = teacher_remarks.teacher_id AND teachers.user_id = auth.uid())
  );

CREATE POLICY "Parents view child remarks" ON public.teacher_remarks
  FOR SELECT USING (
    is_shared_with_parent = true AND
    EXISTS (
      SELECT 1 FROM student_parents sp 
      JOIN parents p ON sp.parent_id = p.id 
      WHERE sp.student_id = teacher_remarks.student_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Students view own remarks" ON public.teacher_remarks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = teacher_remarks.student_id AND students.user_id = auth.uid())
  );

CREATE POLICY "Admins manage remarks" ON public.teacher_remarks
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for online_classes
CREATE POLICY "Teachers manage own classes" ON public.online_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = online_classes.teacher_id AND teachers.user_id = auth.uid())
  );

CREATE POLICY "Authenticated view online classes" ON public.online_classes
  FOR SELECT USING (true);

CREATE POLICY "Admins manage online classes" ON public.online_classes
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Students view own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = invoices.student_id AND students.user_id = auth.uid())
  );

CREATE POLICY "Parents view children invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_parents sp 
      JOIN parents p ON sp.parent_id = p.id 
      WHERE sp.student_id = invoices.student_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL USING (is_admin(auth.uid()));

-- Add trigger for updated_at on online_classes
CREATE TRIGGER update_online_classes_updated_at
  BEFORE UPDATE ON public.online_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();