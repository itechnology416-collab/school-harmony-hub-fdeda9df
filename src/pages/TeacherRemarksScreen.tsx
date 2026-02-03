import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar } from '@/components/common/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeacherRemarks } from '@/hooks/useTeacherRemarks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExportButton } from '@/components/common/ExportButton';
import { formatDate } from '@/utils/exportUtils';
import { MessageSquare, Plus, ThumbsUp, ThumbsDown, Minus, TrendingUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const remarkTypeConfig = {
  positive: { icon: ThumbsUp, color: 'bg-success/10 text-success border-success/30', label: 'Positive' },
  negative: { icon: ThumbsDown, color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Needs Attention' },
  neutral: { icon: Minus, color: 'bg-secondary text-secondary-foreground border-secondary', label: 'Neutral' },
  improvement: { icon: TrendingUp, color: 'bg-warning/10 text-warning border-warning/30', label: 'Improvement' },
};

const TeacherRemarksScreen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [remarkType, setRemarkType] = useState<'positive' | 'negative' | 'neutral' | 'improvement'>('positive');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [shareWithParent, setShareWithParent] = useState(true);

  const { isTeacher, user } = useAuth();
  const { remarks, stats, isLoading, createRemark, deleteRemark, isCreating, teacherId } = useTeacherRemarks();

  // Fetch students for the teacher's classes
  const { data: students } = useQuery({
    queryKey: ['teacher-students-for-remarks', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      // Get teacher's assigned classes
      const { data: teacherClasses } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', teacherId);

      if (!teacherClasses || teacherClasses.length === 0) return [];

      const classIds = teacherClasses.map(tc => tc.class_id);

      // Get students in those classes
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, user_id, admission_number')
        .in('class_id', classIds);

      if (!studentsData) return [];

      // Get profiles
      const userIds = studentsData.map(s => s.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      return studentsData.map(student => {
        const profile = profiles?.find(p => p.user_id === student.user_id);
        return {
          id: student.id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
          avatar_url: profile?.avatar_url
        };
      });
    },
    enabled: !!teacherId
  });

  const handleAddRemark = () => {
    if (!selectedStudentId || !content) return;

    createRemark({
      student_id: selectedStudentId,
      remark_type: remarkType,
      subject: subject || undefined,
      content,
      is_shared_with_parent: shareWithParent
    });

    setSelectedStudentId('');
    setRemarkType('positive');
    setSubject('');
    setContent('');
    setShareWithParent(true);
    setIsAddDialogOpen(false);
  };

  const exportColumns = [
    { header: 'Date', accessor: 'created_at', format: formatDate },
    { header: 'Student', accessor: 'student_name' },
    { header: 'Type', accessor: 'remark_type' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Remark', accessor: 'content' },
    { header: 'Shared', accessor: 'is_shared_with_parent', format: (v: boolean) => v ? 'Yes' : 'No' },
  ];

  return (
    <div className="screen-container">
      <PageHeader 
        title="Teacher Remarks" 
        subtitle="Add and manage student feedback"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-6">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-success">{stats.positive}</p>
            <p className="text-[10px] text-muted-foreground">Positive</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-warning">{stats.improvement}</p>
            <p className="text-[10px] text-muted-foreground">Improve</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-destructive">{stats.negative}</p>
            <p className="text-[10px] text-muted-foreground">Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-4 mb-4">
        {isTeacher() && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Remark
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student Remark</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Remark Type</Label>
                  <Select value={remarkType} onValueChange={(v) => setRemarkType(v as typeof remarkType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="improvement">Needs Improvement</SelectItem>
                      <SelectItem value="negative">Needs Attention</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject (Optional)</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remark</Label>
                  <Textarea
                    placeholder="Enter your remark..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shareWithParent"
                    checked={shareWithParent}
                    onCheckedChange={(checked) => setShareWithParent(checked as boolean)}
                  />
                  <Label htmlFor="shareWithParent" className="text-sm">
                    Share with parent
                  </Label>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddRemark}
                  disabled={isCreating || !selectedStudentId || !content}
                >
                  {isCreating ? 'Adding...' : 'Add Remark'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <ExportButton
          options={{
            title: 'Teacher Remarks Report',
            subtitle: `Generated on ${format(new Date(), 'PPP')}`,
            columns: exportColumns,
            data: remarks
          }}
          defaultFilename="teacher-remarks"
        />
      </div>

      {/* Remarks List */}
      <div className="px-4">
        {remarks.length === 0 ? (
          <Card className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No remarks yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {remarks.map((remark) => {
              const config = remarkTypeConfig[remark.remark_type];
              const IconComponent = config?.icon || MessageSquare;
              
              return (
                <Card key={remark.id} className={cn('border', config?.color)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-3 rounded-xl", config?.color.split(' ')[0])}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{remark.student_name}</p>
                            <Badge variant="outline" className="text-xs">{config?.label}</Badge>
                          </div>
                          {remark.subject && (
                            <p className="text-xs text-muted-foreground mb-2">Subject: {remark.subject}</p>
                          )}
                          <p className="text-sm text-foreground">{remark.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>{format(new Date(remark.created_at), 'MMM d, yyyy')}</span>
                            <span>By: {remark.teacher_name}</span>
                            {remark.is_shared_with_parent && (
                              <Badge variant="secondary" className="text-xs">Shared with parent</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isTeacher() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteRemark(remark.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherRemarksScreen;
