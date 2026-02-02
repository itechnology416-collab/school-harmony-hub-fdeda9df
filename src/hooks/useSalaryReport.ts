import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SalaryInfo {
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  teacherId: string;
  designation: string;
  department: string;
  joiningDate: string;
  experienceYears: number;
}

interface SalarySlip {
  id: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'processing';
  paidDate: string | null;
}

// Generate mock salary slips based on teacher data
const generateSalarySlips = (baseSalary: number): SalarySlip[] => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return months.slice(0, currentMonth + 1).reverse().map((month, index) => {
    const allowances = Math.round(baseSalary * 0.2);
    const deductions = Math.round(baseSalary * 0.1);
    const netSalary = baseSalary + allowances - deductions;
    
    return {
      id: `salary-${currentYear}-${currentMonth - index}`,
      month,
      year: currentYear,
      baseSalary,
      allowances,
      deductions,
      netSalary,
      status: index === 0 ? 'pending' : 'paid',
      paidDate: index === 0 ? null : new Date(currentYear, currentMonth - index, 28).toISOString(),
    };
  });
};

export function useSalaryReport() {
  const { user } = useAuth();

  const salaryQuery = useQuery({
    queryKey: ['salary-report', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get teacher record
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('id, salary, designation, department, joining_date, experience_years')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!teacher) return null;

      const baseSalary = teacher.salary || 50000;
      const allowances = Math.round(baseSalary * 0.2);
      const deductions = Math.round(baseSalary * 0.1);

      const salaryInfo: SalaryInfo = {
        baseSalary,
        allowances,
        deductions,
        netSalary: baseSalary + allowances - deductions,
        teacherId: teacher.id,
        designation: teacher.designation || 'Teacher',
        department: teacher.department || 'General',
        joiningDate: teacher.joining_date || '',
        experienceYears: teacher.experience_years || 0,
      };

      const salarySlips = generateSalarySlips(baseSalary);

      return {
        info: salaryInfo,
        slips: salarySlips,
      };
    },
    enabled: !!user?.id,
  });

  // Calculate totals
  const totals = {
    totalEarned: salaryQuery.data?.slips
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.netSalary, 0) || 0,
    pending: salaryQuery.data?.slips
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.netSalary, 0) || 0,
    paidMonths: salaryQuery.data?.slips.filter(s => s.status === 'paid').length || 0,
  };

  return {
    salaryInfo: salaryQuery.data?.info,
    salarySlips: salaryQuery.data?.slips || [],
    isLoading: salaryQuery.isLoading,
    totals,
  };
}
