import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ExamType = Database['public']['Enums']['exam_type'];

interface Exam {
  id: string;
  name: string;
  exam_type: ExamType;
  class_id: string;
  subject_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_marks: number;
  passing_marks: number;
  syllabus: string | null;
  instructions: string | null;
  academic_year_id: string | null;
  term_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  class?: { id: string; name: string };
  subject?: { id: string; name: string; code: string };
}

interface Mark {
  id: string;
  student_id: string;
  exam_id: string;
  marks_obtained: number | null;
  grade: string | null;
  grade_points: number | null;
  is_absent: boolean | null;
  remarks: string | null;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    admission_number: string;
    roll_number: string | null;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
}

interface ExamInput {
  name: string;
  exam_type: ExamType;
  class_id: string;
  subject_id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  total_marks?: number;
  passing_marks?: number;
  syllabus?: string | null;
  instructions?: string | null;
  academic_year_id?: string | null;
  term_id?: string | null;
}

interface MarkInput {
  student_id: string;
  exam_id: string;
  marks_obtained: number | null;
  is_absent?: boolean;
  remarks?: string | null;
}

// Grade calculation based on percentage
function calculateGrade(marksObtained: number, totalMarks: number): { grade: string; gradePoints: number } {
  const percentage = (marksObtained / totalMarks) * 100;
  
  if (percentage >= 90) return { grade: 'A+', gradePoints: 10 };
  if (percentage >= 80) return { grade: 'A', gradePoints: 9 };
  if (percentage >= 70) return { grade: 'B+', gradePoints: 8 };
  if (percentage >= 60) return { grade: 'B', gradePoints: 7 };
  if (percentage >= 50) return { grade: 'C', gradePoints: 6 };
  if (percentage >= 40) return { grade: 'D', gradePoints: 5 };
  return { grade: 'F', gradePoints: 0 };
}

export function useExams(classId?: string) {
  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ['exams', classId],
    queryFn: async () => {
      let query = supabase
        .from('exams')
        .select(`
          *,
          class:classes(id, name),
          subject:subjects(id, name, code)
        `)
        .order('date', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exam[];
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (exam: ExamInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('exams')
        .insert({
          ...exam,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create exam: ' + error.message);
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated!');
    },
    onError: (error) => {
      toast.error('Failed to update exam: ' + error.message);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete exam: ' + error.message);
    },
  });

  return {
    exams: examsQuery.data || [],
    isLoading: examsQuery.isLoading,
    error: examsQuery.error,
    createExam: createExamMutation.mutate,
    updateExam: updateExamMutation.mutate,
    deleteExam: deleteExamMutation.mutate,
    isCreating: createExamMutation.isPending,
  };
}

export function useMarks(examId?: string) {
  const queryClient = useQueryClient();

  const marksQuery = useQuery({
    queryKey: ['marks', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marks')
        .select(`
          *,
          student:students(
            id,
            admission_number,
            roll_number,
            user_id
          )
        `)
        .eq('exam_id', examId!)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch profiles separately
      const studentUserIds = data
        ?.map(m => m.student?.user_id)
        .filter(Boolean) as string[];
      
      let profiles: Record<string, { first_name: string; last_name: string }> = {};
      
      if (studentUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', studentUserIds);
        
        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as typeof profiles);
      }
      
      return data?.map(m => ({
        ...m,
        student: m.student ? {
          ...m.student,
          profile: m.student.user_id ? profiles[m.student.user_id] : undefined,
        } : undefined,
      })) as Mark[];
    },
    enabled: !!examId,
  });

  const saveMarksMutation = useMutation({
    mutationFn: async ({ marks, totalMarks }: { marks: MarkInput[]; totalMarks: number }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const marksWithGrades = marks.map(m => {
        if (m.is_absent || m.marks_obtained === null) {
          return {
            ...m,
            grade: m.is_absent ? 'AB' : null,
            grade_points: 0,
            entered_by: user.user?.id,
          };
        }
        
        const { grade, gradePoints } = calculateGrade(m.marks_obtained, totalMarks);
        return {
          ...m,
          grade,
          grade_points: gradePoints,
          entered_by: user.user?.id,
        };
      });

      const { data, error } = await supabase
        .from('marks')
        .upsert(marksWithGrades, {
          onConflict: 'student_id,exam_id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success('Marks saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save marks: ' + error.message);
    },
  });

  return {
    marks: marksQuery.data || [],
    isLoading: marksQuery.isLoading,
    error: marksQuery.error,
    saveMarks: saveMarksMutation.mutate,
    isSaving: saveMarksMutation.isPending,
  };
}

export function useExamStats(examId?: string) {
  return useQuery({
    queryKey: ['exam-stats', examId],
    queryFn: async () => {
      const { data: exam } = await supabase
        .from('exams')
        .select('total_marks, passing_marks')
        .eq('id', examId!)
        .single();

      const { data: marks } = await supabase
        .from('marks')
        .select('marks_obtained, is_absent')
        .eq('exam_id', examId!);

      if (!marks || !exam) return null;

      const validMarks = marks.filter(m => !m.is_absent && m.marks_obtained !== null);
      const totalStudents = marks.length;
      const presentStudents = validMarks.length;
      const absentStudents = marks.filter(m => m.is_absent).length;
      
      const passedStudents = validMarks.filter(
        m => (m.marks_obtained || 0) >= exam.passing_marks
      ).length;

      const avgMarks = presentStudents > 0
        ? validMarks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0) / presentStudents
        : 0;

      const highestMarks = presentStudents > 0
        ? Math.max(...validMarks.map(m => m.marks_obtained || 0))
        : 0;

      const lowestMarks = presentStudents > 0
        ? Math.min(...validMarks.map(m => m.marks_obtained || 0))
        : 0;

      return {
        totalStudents,
        presentStudents,
        absentStudents,
        passedStudents,
        failedStudents: presentStudents - passedStudents,
        passPercentage: presentStudents > 0 
          ? ((passedStudents / presentStudents) * 100).toFixed(1) 
          : '0',
        avgMarks: avgMarks.toFixed(1),
        highestMarks,
        lowestMarks,
        totalMarks: exam.total_marks,
      };
    },
    enabled: !!examId,
  });
}
