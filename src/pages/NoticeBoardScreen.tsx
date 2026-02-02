import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Bell, 
  Plus, 
  Send,
  MessageSquare,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { useNoticeBoard } from '@/hooks/useNoticeBoard';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NoticeBoardScreen = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  const { notices, isLoading, createNotice, markAsRead, unreadCount, isCreating } = useNoticeBoard();

  const filteredNotices = notices.filter(notice => {
    if (activeTab === 'unread') return !notice.is_read;
    return true;
  });

  const handleCreate = () => {
    if (!title || !message) return;

    createNotice({
      title,
      message,
      type: 'announcement',
      recipientRole: recipientRole as any || undefined,
    });

    setIsCreateOpen(false);
    setTitle('');
    setMessage('');
    setRecipientRole('');
  };

  const getNoticeTypeColor = (type: string | null) => {
    switch (type) {
      case 'announcement': return 'bg-primary/10 text-primary';
      case 'alert': return 'bg-destructive/10 text-destructive';
      case 'reminder': return 'bg-warning/10 text-warning';
      case 'emergency': return 'bg-destructive/20 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="screen-container px-4 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notice Board"
          subtitle={`${unreadCount} unread notices`}
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              New Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Notice title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your notice here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Send To</Label>
                <Select value={recipientRole} onValueChange={setRecipientRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    <SelectItem value="teacher">Teachers Only</SelectItem>
                    <SelectItem value="parent">Parents Only</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || !title || !message}
                className="w-full gradient-primary text-primary-foreground"
              >
                <Send className="h-4 w-4 mr-2" />
                {isCreating ? 'Posting...' : 'Post Notice'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 opacity-70" />
              <div>
                <p className="text-2xl font-bold">{notices.length}</p>
                <p className="text-sm opacity-80">Total Notices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-warning text-warning-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 opacity-70" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm opacity-80">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Notices</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading notices...</div>
          ) : filteredNotices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'unread' ? 'No unread notices' : 'No notices yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card 
                  key={notice.id} 
                  className={cn(
                    "transition-all cursor-pointer hover:shadow-lg",
                    !notice.is_read && "border-l-4 border-l-primary"
                  )}
                  onClick={() => !notice.is_read && markAsRead(notice.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {notice.sender ? (
                        <Avatar 
                          name={`${notice.sender.first_name} ${notice.sender.last_name}`}
                          src={notice.sender.avatar_url}
                          size="md"
                        />
                      ) : (
                        <div className="p-2 rounded-full bg-primary/10">
                          <Bell className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{notice.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notice.message}
                            </p>
                          </div>
                          {!notice.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={cn("text-xs", getNoticeTypeColor(notice.notification_type))}>
                            {notice.notification_type || 'Notice'}
                          </Badge>
                          {notice.recipient_role && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {notice.recipient_role}s
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(notice.created_at), 'dd MMM yyyy, HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoticeBoardScreen;
