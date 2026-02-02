import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { useSelfAttendance } from '@/hooks/useSelfAttendance';
import { ExportButton } from '@/components/common/ExportButton';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SelfAttendanceScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { 
    attendance, 
    isLoading, 
    stats, 
    todayAttendance,
    checkIn,
    checkOut,
    isCheckingIn,
    isCheckingOut 
  } = useSelfAttendance(selectedMonth);

  const today = new Date();
  const currentTime = format(today, 'HH:mm:ss');
  const currentDate = format(today, 'EEEE, MMMM d, yyyy');

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: format(date, 'MMMM yyyy'),
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'absent': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'late': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'excused': return <Calendar className="h-5 w-5 text-primary" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const exportColumns = [
    { header: 'Date', accessor: 'date', format: (v: string) => format(new Date(v), 'dd/MM/yyyy') },
    { header: 'Day', accessor: 'date', format: (v: string) => format(new Date(v), 'EEEE') },
    { header: 'Status', accessor: 'status' },
    { header: 'Check In', accessor: 'check_in_time', format: (v: string) => v || '-' },
    { header: 'Check Out', accessor: 'check_out_time', format: (v: string) => v || '-' },
    { header: 'Remarks', accessor: 'remarks', format: (v: string) => v || '-' },
  ];

  return (
    <div className="screen-container px-4 space-y-6">
      <PageHeader
        title="Self Attendance"
        subtitle="Track your daily attendance"
      />

      {/* Live Clock Card */}
      <Card className="gradient-primary text-primary-foreground overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold font-display">{currentTime}</p>
              <p className="text-sm opacity-80 mt-1">{currentDate}</p>
            </div>
            <Clock className="h-12 w-12 opacity-50" />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => checkIn()}
              disabled={isCheckingIn || !!todayAttendance}
              className="flex-1 bg-white/20 hover:bg-white/30 text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {todayAttendance ? 'Already Checked In' : 'Check In'}
            </Button>
            <Button
              onClick={() => checkOut()}
              disabled={isCheckingOut || !todayAttendance || !!todayAttendance?.check_out_time}
              className="flex-1 bg-white/20 hover:bg-white/30 text-primary-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {todayAttendance?.check_out_time ? 'Checked Out' : 'Check Out'}
            </Button>
          </div>

          {todayAttendance && (
            <div className="mt-4 p-3 bg-white/10 rounded-xl">
              <p className="text-sm">
                Today: Check-in at <span className="font-semibold">{todayAttendance.check_in_time || '-'}</span>
                {todayAttendance.check_out_time && (
                  <>, Check-out at <span className="font-semibold">{todayAttendance.check_out_time}</span></>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-4 bg-success/10 rounded-2xl">
          <p className="text-2xl font-bold text-success">{stats.present}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="text-center p-4 bg-destructive/10 rounded-2xl">
          <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-2xl">
          <p className="text-2xl font-bold text-warning">{stats.late}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <p className="text-2xl font-bold text-primary">{stats.leaves}</p>
          <p className="text-xs text-muted-foreground">Leaves</p>
        </div>
      </div>

      {/* Filter & Export */}
      <div className="flex items-center justify-between gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ExportButton
          options={{
            title: 'Self Attendance Report',
            subtitle: `Month: ${monthOptions.find(m => m.value === selectedMonth)?.label}`,
            columns: exportColumns,
            data: attendance,
            filename: 'self_attendance',
          }}
        />
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No attendance records found</div>
          ) : (
            <div className="divide-y divide-border">
              {attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.date), 'EEEE')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-medium capitalize",
                      record.status === 'present' && "text-success",
                      record.status === 'absent' && "text-destructive",
                      record.status === 'late' && "text-warning"
                    )}>
                      {record.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.check_in_time || '-'} - {record.check_out_time || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfAttendanceScreen;
