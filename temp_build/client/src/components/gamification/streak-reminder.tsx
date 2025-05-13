import { useEffect, useState } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  isToday, 
  formatDistanceToNow,
  differenceInCalendarDays,
  parseISO 
} from 'date-fns';

interface StreakReminderProps {
  onCheckIn: () => void;
  className?: string;
}

export default function StreakReminder({ onCheckIn, className }: StreakReminderProps) {
  const { profile } = useGamification();
  const [showReminder, setShowReminder] = useState(false);
  
  useEffect(() => {
    if (!profile) return;
    
    // Check if user has checked in today
    const lastCheckIn = profile.lastCheckIn ? parseISO(profile.lastCheckIn) : null;
    const checkedInToday = lastCheckIn && isToday(lastCheckIn);
    
    // Only show reminder if:
    // 1. They haven't checked in today, AND
    // 2. They have a streak to maintain OR it's been less than 3 days since their last check-in
    if (!checkedInToday) {
      if (profile.currentStreak > 0) {
        setShowReminder(true);
      } else if (lastCheckIn && differenceInCalendarDays(new Date(), lastCheckIn) <= 2) {
        setShowReminder(true);
      }
    } else {
      setShowReminder(false);
    }
  }, [profile]);
  
  if (!showReminder || !profile) return null;
  
  // Prepare streak message
  const getStreakMessage = () => {
    if (profile.currentStreak > 0) {
      return `Don't break your ${profile.currentStreak}-day streak!`;
    } else if (profile.lastCheckIn) {
      const lastCheckInDate = parseISO(profile.lastCheckIn);
      const daysSinceLastCheckIn = differenceInCalendarDays(new Date(), lastCheckInDate);
      
      if (daysSinceLastCheckIn === 1) {
        return "Check in today to maintain your streak!";
      } else {
        return `Your last check-in was ${formatDistanceToNow(lastCheckInDate)} ago. Start a new streak today!`;
      }
    } else {
      return "Start your emotional wellness streak today!";
    }
  };
  
  return (
    <Card className={`${className || ''} border-primary/20 bg-gradient-to-r from-primary/5 to-white`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-primary">{getStreakMessage()}</h3>
              <p className="text-sm text-gray-500">
                Daily check-ins boost your wellness score
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              onCheckIn();
              setShowReminder(false);
            }}
            size="sm"
          >
            Check In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}