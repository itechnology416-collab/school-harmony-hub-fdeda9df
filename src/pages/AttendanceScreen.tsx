import { useState } from 'react';
import { Check, X, Clock, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/common/Avatar';
import { mockStudents, mockClasses } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

const statusConfig = {
  present: { icon: Check, label: 'Present', color: 'bg-success text-success-foreground' },
  absent: { icon: X, label: 'Absent', color: 'bg-destructive text-destructive-foreground' },
  late: { icon: Clock, label: 'Late', color: 'bg-warning text-warning-foreground' },
  excused: { icon: AlertCircle, label: 'Excused', color: 'bg-secondary text-secondary-foreground' },
};

const AttendanceScreen = () => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [attendance, setAttendance] = useState<StudentAttendance[]>(
    mockStudents.map(s => ({ studentId: s.id, status: 'present' as AttendanceStatus }))
  );

  const currentClass = mockClasses.find(c => c.id === selectedClass);
  const classStudents = mockStudents.filter(s => s.classId === selectedClass);

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => 
      prev.map(a => a.studentId === studentId ? { ...a, status } : a)
    );
  };

  const getStudentAttendance = (studentId: string): AttendanceStatus => {
    return attendance.find(a => a.studentId === studentId)?.status || 'present';
  };

  const handleSave = () => {
    toast.success('Attendance saved successfully!');
  };

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance"
        showBack
        action={
          <Button variant="gradient" size="sm" onClick={handleSave}>
            Save
          </Button>
        }
      />

      {/* Date & Class Selector */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 p-3 bg-card rounded-xl border border-border">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        
        <button
          onClick={() => setShowClassPicker(!showClassPicker)}
          className="flex-1 flex items-center justify-between p-3 bg-card rounded-xl border border-border"
        >
          <span className="text-sm font-medium">{currentClass?.name}</span>
          {showClassPicker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Class Picker Dropdown */}
      {showClassPicker && (
        <div className="mb-4 p-2 bg-card rounded-xl border border-border animate-scale-in">
          {mockClasses.map(cls => (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedClass(cls.id);
                setShowClassPicker(false);
              }}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors",
                cls.id === selectedClass ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              )}
            >
              <span className="font-medium">{cls.name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({cls.sections.reduce((acc, s) => acc + s.studentCount, 0)} students)
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {Object.entries(stats).map(([key, value]) => {
          const config = statusConfig[key as AttendanceStatus];
          return (
            <div key={key} className="p-3 bg-card rounded-xl border border-border text-center">
              <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-full mb-1", config.color)}>
                <config.icon className="h-4 w-4" />
              </span>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {classStudents.length > 0 ? (
          classStudents.map(student => {
            const currentStatus = getStudentAttendance(student.id);
            return (
              <div key={student.id} className="p-4 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={`${student.firstName} ${student.lastName}`} size="md" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{student.firstName} {student.lastName}</h4>
                    <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
                  </div>
                  <Badge className={statusConfig[currentStatus].color}>
                    {statusConfig[currentStatus].label}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {(Object.keys(statusConfig) as AttendanceStatus[]).map(status => {
                    const config = statusConfig[status];
                    const isActive = currentStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => updateAttendance(student.id, status)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-all",
                          isActive ? config.color : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        <config.icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students in this class</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceScreen;
