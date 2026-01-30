import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, Users, BookOpen, ChevronRight, Settings } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/common/Avatar';
import { mockClasses, mockTeachers, mockSubjects } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ClassesScreen = () => {
  const navigate = useNavigate();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const getTeacherName = (teacherId: string) => {
    const teacher = mockTeachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not assigned';
  };

  const getSubjectNames = (subjectIds: string[]) => {
    return subjectIds.map(id => mockSubjects.find(s => s.id === id)?.name || '').filter(Boolean);
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage class structure"
        showBack
        action={
          <Button variant="gradient" size="iconSm">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-primary">{mockClasses.length}</p>
          <p className="text-xs text-muted-foreground">Classes</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-accent">
            {mockClasses.reduce((acc, c) => acc + c.sections.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Sections</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-success">
            {mockClasses.reduce((acc, c) => acc + c.sections.reduce((a, s) => a + s.studentCount, 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Students</p>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {mockClasses.map((cls) => {
          const isExpanded = expandedClass === cls.id;
          const totalStudents = cls.sections.reduce((acc, s) => acc + s.studentCount, 0);
          const totalCapacity = cls.sections.reduce((acc, s) => acc + s.capacity, 0);
          const subjects = getSubjectNames(cls.subjectIds);
          
          return (
            <div
              key={cls.id}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="gradient-primary p-3 rounded-xl">
                    <Layers className="h-5 w-5 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{cls.name}</h3>
                      <Badge variant="secondary">{cls.sections.length} sections</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {totalStudents}/{totalCapacity} students • {subjects.length} subjects
                    </p>
                  </div>
                  
                  <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-scale-in">
                  {/* Class Teacher */}
                  {cls.classTeacherId && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                      <Avatar name={getTeacherName(cls.classTeacherId)} size="sm" />
                      <div>
                        <p className="text-xs text-muted-foreground">Class Teacher</p>
                        <p className="text-sm font-medium">{getTeacherName(cls.classTeacherId)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Sections */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">SECTIONS</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cls.sections.map((section) => (
                        <div
                          key={section.id}
                          className="p-3 bg-secondary/50 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{section.name}</span>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {section.studentCount}/{section.capacity} students
                          </p>
                          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-primary rounded-full"
                              style={{ width: `${(section.studentCount / section.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Subjects */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">SUBJECTS</p>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Class FAB */}
      <button className="fab-button flex items-center justify-center">
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default ClassesScreen;
