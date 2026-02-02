import { format } from 'date-fns';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { useSalaryReport } from '@/hooks/useSalaryReport';
import { ExportButton } from '@/components/common/ExportButton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/exportUtils';

const SalaryReportScreen = () => {
  const { salaryInfo, salarySlips, isLoading, totals } = useSalaryReport();

  const exportColumns = [
    { header: 'Month', accessor: 'month' },
    { header: 'Year', accessor: 'year' },
    { header: 'Base Salary', accessor: 'baseSalary', format: formatCurrency },
    { header: 'Allowances', accessor: 'allowances', format: formatCurrency },
    { header: 'Deductions', accessor: 'deductions', format: formatCurrency },
    { header: 'Net Salary', accessor: 'netSalary', format: formatCurrency },
    { header: 'Status', accessor: 'status' },
    { header: 'Paid Date', accessor: 'paidDate', format: (v: string) => v ? format(new Date(v), 'dd/MM/yyyy') : '-' },
  ];

  if (isLoading) {
    return (
      <div className="screen-container px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading salary information...</p>
        </div>
      </div>
    );
  }

  if (!salaryInfo) {
    return (
      <div className="screen-container px-4">
        <PageHeader title="Salary Report" subtitle="View your salary details" />
        <Card className="mt-6">
          <CardContent className="p-8 text-center text-muted-foreground">
            No salary information available. Please contact administration.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="screen-container px-4 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Salary Report"
          subtitle="View your salary details and history"
        />
        <ExportButton
          options={{
            title: 'Salary Report',
            subtitle: `Generated for ${salaryInfo.designation}`,
            columns: exportColumns,
            data: salarySlips,
            filename: 'salary_report',
          }}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-success text-success-foreground overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Earned</p>
                <p className="text-2xl font-bold font-display">
                  {formatCurrency(totals.totalEarned)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="gradient-warning text-warning-foreground overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Pending</p>
                <p className="text-2xl font-bold font-display">
                  {formatCurrency(totals.pending)}
                </p>
              </div>
              <Clock className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Designation</p>
            <p className="font-medium">{salaryInfo.designation}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Department</p>
            <p className="font-medium">{salaryInfo.department}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Experience</p>
            <p className="font-medium">{salaryInfo.experienceYears} years</p>
          </div>
          <div>
            <p className="text-muted-foreground">Joining Date</p>
            <p className="font-medium">
              {salaryInfo.joiningDate ? format(new Date(salaryInfo.joiningDate), 'dd MMM yyyy') : '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Salary Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monthly Salary Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">Base Salary</span>
            <span className="font-semibold text-success">+ {formatCurrency(salaryInfo.baseSalary)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">Allowances</span>
            <span className="font-semibold text-success">+ {formatCurrency(salaryInfo.allowances)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">Deductions</span>
            <span className="font-semibold text-destructive">- {formatCurrency(salaryInfo.deductions)}</span>
          </div>
          <div className="flex justify-between items-center p-4 gradient-primary text-primary-foreground rounded-xl">
            <span className="font-medium">Net Salary</span>
            <span className="text-xl font-bold">{formatCurrency(salaryInfo.netSalary)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Salary History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Salary History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {salarySlips.map((slip) => (
              <div key={slip.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    slip.status === 'paid' ? "bg-success/10" : "bg-warning/10"
                  )}>
                    {slip.status === 'paid' ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{slip.month} {slip.year}</p>
                    <p className="text-xs text-muted-foreground">
                      {slip.paidDate ? `Paid on ${format(new Date(slip.paidDate), 'dd MMM')}` : 'Processing'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(slip.netSalary)}</p>
                  <Badge 
                    variant={slip.status === 'paid' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs",
                      slip.status === 'paid' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}
                  >
                    {slip.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryReportScreen;
