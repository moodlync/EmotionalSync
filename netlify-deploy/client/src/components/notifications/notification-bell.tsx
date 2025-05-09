import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Notification } from '@shared/schema';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch notifications for the current user
  const { 
    data: notifications,
    isLoading,
    error
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', user?.id, 'unread'],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/notifications?userId=${user.id}&unread=true&limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Update unread count when notifications change
  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.length);
    }
  }, [notifications]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get icon for notification type
  const getNotificationPreview = (notification: Notification) => {
    const timeString = notification.createdAt 
      ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <div className="flex gap-3 items-start py-2 px-1 hover:bg-primary/5 rounded-md transition-colors">
        <div className="p-1.5 rounded-full bg-primary/10 text-primary">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="font-medium text-sm line-clamp-1">{notification.title}</p>
            <span className="text-xs text-muted-foreground shrink-0">{timeString}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.content}
          </p>
        </div>
      </div>
    );
  };

  // If not logged in, don't show the bell
  if (!user) {
    return null;
  }

  return (
    <div ref={popoverRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-primary text-white px-1.5 rounded-full"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="px-4 py-3 font-medium border-b flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} New</Badge>
            )}
          </div>
          
          <ScrollArea className="max-h-80">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">Failed to load notifications</div>
            ) : notifications?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="py-2 px-3">
                {notifications?.map((notification) => (
                  <Link 
                    key={notification.id} 
                    to="/profile/notifications"
                    className="block"
                    onClick={() => setOpen(false)}
                  >
                    {getNotificationPreview(notification)}
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <Separator className="my-0" />
          
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-sm"
              onClick={() => {
                setOpen(false);
              }}
              asChild
            >
              <Link to="/profile/notifications">
                View all notifications
              </Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}