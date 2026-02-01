import { useState } from 'react';
import { Check, X, Clock, AlertCircle, Calendar, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/common/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/hooks/useAttendance';
import { useClasses, useStudentsByClass } from '@/hooks/useClasses';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/integrations/supabase/types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

const statusConfig = {
  present: { icon: Check, label: 'Present', color: 'bg-success text-success-foreground' },
  absent: { icon: X, label: 'Absent', color: 'bg-destructive text-destructive-foreground' },
  late: { icon: Clock, label: 'Late', color: 'bg-warning text-warning-foreground' },
  excused: { icon: AlertCircle, label: 'Excused', color: 'bg-secondary text-secondary-foreground' },
  half_day: { icon: Clock, label: 'Half Day', color: 'bg-accent text-accent-foreground' },
};

const AttendanceScreen = () => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [localAttendance, setLocalAttendance] = useState<StudentAttendance[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { classes, isLoading: classesLoading } = useClasses();
  const { data: students, isLoading: studentsLoading } = useStudentsByClass(selectedClass, selectedSection);
  const { attendance, markAttendance, isMarking, isLoading: attendanceLoading } = useAttendance(selectedClass, selectedDate);

  const currentClass = classes.find(c => c.id === selectedClass);
  const sections = currentClass?.sections || [];

  // Initialize local attendance when students or existing attendance loads
  const initializeAttendance = () => {
    if (students && !isInitialized) {
      const existingAttendanceMap = new Map(
        attendance.map(a => [a.student_id, a.status])
      );
      
      setLocalAttendance(
        students.map(s => ({
          studentId: s.id,
          status: existingAttendanceMap.get(s.id) || 'present',
        }))
      );
      setIsInitialized(true);
    }
  };

  // Re-initialize when class changes
  useState(() => {
    if (selectedClass && students) {
      setIsInitialized(false);
      initializeAttendance();
    }
  });

  if (students && !isInitialized) {
    initializeAttendance();
  }

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => 
      prev.map(a => a.studentId === studentId ? { ...a, status } : a)
    );
  };

  const getStudentAttendance = (studentId: string): AttendanceStatus => {
    return localAttendance.find(a => a.studentId === studentId)?.status || 'present';
  };

  const handleSave = () => {
    if (!selectedClass || localAttendance.length === 0) {
      toast.error('Please select a class and mark attendance');
      return;
    }

    markAttendance(
      localAttendance.map(a => ({
        student_id: a.studentId,
        class_id: selectedClass,
        section_id: selectedSection || null,
        date: selectedDate,
        status: a.status,
      }))
    );
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setIsInitialized(false);
    setLocalAttendance([]);
  };

  const stats = {
    present: localAttendance.filter(a => a.status === 'present').length,
    absent: localAttendance.filter(a => a.status === 'absent').length,
    late: localAttendance.filter(a => a.status === 'late').length,
    excused: localAttendance.filter(a => a.status === 'excused').length,
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance"
        showBack
        action={
          <Button 
            variant="gradient" 
            size="sm" 
            onClick={handleSave}
            disabled={isMarking || !selectedClass || localAttendance.length === 0}
          >
            {isMarking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        }
      />

      {/* Date & Class Selector */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 p-3 bg-card rounded-xl border border-border">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="flex-1">
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classesLoading ? (
                <div className="p-2"><Skeleton className="h-6 w-full" /></div>
              ) : classes.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No classes found</div>
              ) : (
                classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section Selector */}
      {sections.length > 0 && (
        <div className="mb-4">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="All sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sections</SelectItem>
              {sections.map(section => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quick Stats */}
      {selectedClass && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(stats).map(([key, value]) => {
            const config = statusConfig[key as keyof typeof stats];
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
      )}

      {/* Student List */}
      <div className="space-y-3">
        {!selectedClass ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Select a Class</h3>
            <p className="text-sm text-muted-foreground">Choose a class to mark attendance</p>
          </div>
        ) : studentsLoading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : students && students.length > 0 ? (
          students.map(student => {
            const currentStatus = getStudentAttendance(student.id);
            const profile = student.profile as { first_name: string; last_name: string; avatar_url: string | null } | null;
            const fullName = profile 
              ? `${profile.first_name} ${profile.last_name}`
              : `Student ${student.admission_number}`;
            
            return (
              <div key={student.id} className="p-4 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={fullName} size="md" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{fullName}</h4>
                    <p className="text-xs text-muted-foreground">
                      Roll: {student.roll_number || student.admission_number}
                    </p>
                  </div>
                  <Badge className={statusConfig[currentStatus]?.color || statusConfig.present.color}>
                    {statusConfig[currentStatus]?.label || 'Present'}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {(Object.keys(statusConfig) as AttendanceStatus[])
                    .filter(s => s !== 'half_day') // Hide half_day for simplicity
                    .map(status => {
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
