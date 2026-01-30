import { useState } from 'react';
import { Send, Users, GraduationCap, Bell, Clock, Check } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type RecipientType = 'all' | 'teachers' | 'parents';

const recipientOptions: { id: RecipientType; label: string; icon: React.ElementType; count: number }[] = [
  { id: 'all', label: 'Everyone', icon: Users, count: 467 },
  { id: 'teachers', label: 'Teachers', icon: Users, count: 42 },
  { id: 'parents', label: 'Parents', icon: GraduationCap, count: 425 },
];

const recentNotifications = [
  { id: '1', title: 'Holiday Announcement', message: 'School will be closed on Monday...', time: '2 hours ago', read: false },
  { id: '2', title: 'Parent-Teacher Meeting', message: 'Annual PTM scheduled for Feb 28...', time: '1 day ago', read: true },
  { id: '3', title: 'Fee Reminder', message: 'Kindly submit the pending fees...', time: '3 days ago', read: true },
];

const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [recipient, setRecipient] = useState<RecipientType>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    
    toast.success(`Notification sent to ${recipientOptions.find(r => r.id === recipient)?.label}`);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Notifications"
        subtitle="Send announcements"
        showBack
      />

      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('send')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === 'send' 
              ? "bg-card shadow-sm text-foreground" 
              : "text-muted-foreground"
          )}
        >
          <Send className="h-4 w-4" />
          Send New
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === 'history' 
              ? "bg-card shadow-sm text-foreground" 
              : "text-muted-foreground"
          )}
        >
          <Bell className="h-4 w-4" />
          History
        </button>
      </div>

      {activeTab === 'send' ? (
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">Send To</label>
            <div className="grid grid-cols-3 gap-2">
              {recipientOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setRecipient(option.id)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all",
                    recipient === option.id 
                      ? "bg-primary/10 border-primary" 
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <option.icon className={cn(
                    "h-6 w-6 mx-auto mb-2",
                    recipient === option.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <p className={cn(
                    "text-sm font-medium",
                    recipient === option.id ? "text-primary" : "text-foreground"
                  )}>
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.count}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Send Button */}
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentNotifications.map(notification => (
            <div
              key={notification.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                notification.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  notification.read ? "bg-secondary" : "gradient-primary"
                )}>
                  <Bell className={cn(
                    "h-4 w-4",
                    notification.read ? "text-muted-foreground" : "text-primary-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{notification.title}</h4>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {notification.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
