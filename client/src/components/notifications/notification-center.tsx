import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, formatDistance } from 'date-fns';
import { 
  Bell, 
  MessageSquare, 
  Award, 
  Coins, 
  UserPlus, 
  Info, 
  Check, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import { Notification } from '@shared/schema';

type NotificationCenterProps = {
  userId: number;
  limit?: number;
  showMarkAllAsRead?: boolean;
  showEmptyState?: boolean;
  className?: string;
};

export default function NotificationCenter({
  userId,
  limit,
  showMarkAllAsRead = true,
  showEmptyState = true,
  className = '',
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications for this user
  const { 
    data: notifications, 
    isLoading,
    error,
    refetch 
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userId, filter],
    queryFn: async () => {
      const url = `/api/notifications?userId=${userId}${filter === 'unread' ? '&unread=true' : ''}${limit ? `&limit=${limit}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refresh every minute
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('POST', `/api/notifications/${notificationId}/read`);
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/notifications/mark-all-read?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
    },
  });

  // Get the icon component based on notification type
  const getNotificationIcon = (type: string, isRead: boolean) => {
    const className = `h-5 w-5 ${isRead ? 'text-gray-400' : 'text-primary'}`;

    switch (type) {
      case 'friend_request':
        return <UserPlus className={className} />;
      case 'message':
        return <MessageSquare className={className} />;
      case 'token_received':
        return <Coins className={className} />;
      case 'badge_earned':
        return <Award className={className} />;
      case 'system_announcement':
        return <Info className={className} />;
      default:
        return <Bell className={className} />;
    }
  };

  // Handler for marking a notification as read
  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  // Handler for marking all notifications as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Format notification time relative to now
  const formatNotificationTime = (date: Date | null) => {
    if (!date) return '';
    
    // For notifications today, show relative time
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date > yesterday) {
      return formatDistance(date, now, { addSuffix: true });
    }
    
    // For older notifications, show date
    return format(date, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error loading notifications</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Filter notifications if needed
  const filteredNotifications = notifications || [];
  const hasUnread = filteredNotifications.some(n => !n.readAt);
  
  return (
    <div className={`notification-center ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">Your activity and updates</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          
          {showMarkAllAsRead && hasUnread && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {filteredNotifications.length === 0 ? (
        showEmptyState && (
          <div className="text-center p-8 border rounded-lg bg-background">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? "You've read all your notifications" 
                : "You don't have any notifications yet"}
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-colors ${!notification.readAt ? 'bg-primary/5 border-primary/10' : ''}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${!notification.readAt ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getNotificationIcon(notification.type, !!notification.readAt)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {formatNotificationTime(notification.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {!notification.readAt && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      New
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-2">
                <p className="text-sm">{notification.content}</p>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-between">
                {notification.actionLink ? (
                  <Button asChild variant="link" className="p-0 h-auto text-sm font-normal">
                    <Link to={notification.actionLink}>View Details</Link>
                  </Button>
                ) : (
                  <span></span>
                )}
                
                {!notification.readAt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark as read
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}