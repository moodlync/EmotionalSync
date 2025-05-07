import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type ProfileData = {
  id: number;
  username: string;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  points: number;
};

export default function StreakCalendar() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch user gamification profile
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/gamification/profile'],
    queryFn: async () => {
      const res = await fetch('/api/gamification/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });
  
  // Generate check-in dates for past 60 days (for demo purposes)
  const getCheckInDates = (): Date[] => {
    if (!profile || !profile.lastCheckIn) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    const lastCheckIn = new Date(profile.lastCheckIn);
    
    // Add last check-in
    dates.push(new Date(lastCheckIn));
    
    // Generate some random check-in dates for the past 2 months
    // This is just for demonstration - in a real app, you'd fetch actual check-in history
    const startDate = new Date();
    startDate.setDate(today.getDate() - 60); // 60 days ago
    
    // Generate dates based on streak (more consistent dates for higher streaks)
    const consistency = Math.min(profile.currentStreak / 10, 0.9); // 0.1 to 0.9
    const daysToGenerate = Math.min(profile.currentStreak, 60);
    
    for (let i = 1; i <= daysToGenerate; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      
      // Higher streak = more consistent check-ins
      if (Math.random() < consistency) {
        dates.push(new Date(checkDate));
      }
    }
    
    return dates;
  };
  
  const checkInDates = getCheckInDates();
  
  // Get streak label and color
  const getStreakBadge = () => {
    if (!profile) return null;
    
    let label = '';
    let color = '';
    
    if (profile.currentStreak >= 30) {
      label = 'Ultimate Streak!';
      color = 'bg-purple-100 text-purple-800 border-purple-300';
    } else if (profile.currentStreak >= 14) {
      label = 'Blazing Streak!';
      color = 'bg-red-100 text-red-800 border-red-300';
    } else if (profile.currentStreak >= 7) {
      label = 'Strong Streak!';
      color = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (profile.currentStreak >= 3) {
      label = 'Building Streak!';
      color = 'bg-green-100 text-green-800 border-green-300';
    } else {
      label = 'Getting Started';
      color = 'bg-blue-100 text-blue-800 border-blue-300';
    }
    
    return (
      <Badge variant="outline" className={color}>
        {label}
      </Badge>
    );
  };
  
  // Custom day renderer for the calendar
  const dayRenderer = (day: Date) => {
    const isCheckIn = checkInDates.some(d => 
      d.getDate() === day.getDate() && 
      d.getMonth() === day.getMonth() && 
      d.getFullYear() === day.getFullYear()
    );
    
    return (
      <div className={`relative ${isCheckIn ? 'bg-green-100 rounded-full' : ''}`}>
        <time dateTime={day.toISOString()}>
          {day.getDate()}
        </time>
        {isCheckIn && (
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-600 rounded-full" />
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Streaks & Check-ins
        </CardTitle>
        <CardDescription>
          Track your daily check-in streaks and consistency
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="md:flex-1 bg-muted rounded-lg p-4 flex items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Streak</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{profile.currentStreak}</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
                <Flame className="h-10 w-10 text-primary opacity-80" />
              </div>
              
              <div className="md:flex-1 bg-muted rounded-lg p-4 flex items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Longest Streak</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{profile.longestStreak}</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
                <Trophy className="h-10 w-10 text-primary opacity-80" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last check-in: {profile.lastCheckIn ? new Date(profile.lastCheckIn).toLocaleDateString() : 'Never'}
                </span>
              </div>
              {getStreakBadge()}
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Check-in Calendar
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Check-in</span>
                </div>
              </div>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={{ after: new Date() }}
                showOutsideDays={false}
                components={{
                  Day: ({ day, ...props }) => (
                    <div
                      className={`relative ${checkInDates.some(d => 
                        d.getDate() === day.getDate() && 
                        d.getMonth() === day.getMonth() && 
                        d.getFullYear() === day.getFullYear()
                      ) ? 'bg-green-100 text-green-900 font-medium rounded-full' : ''}`}
                      {...props}
                    >
                      {day.getDate()}
                    </div>
                  ),
                }}
              />
              
              <div className="mt-4 text-sm text-center text-muted-foreground">
                <p>Keep your streak going by checking in daily to earn more rewards!</p>
                <p className="mt-1 text-xs">Regular check-ins increase your chances of earning special badges.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border rounded p-2">
                <div className="text-2xl font-bold">{Math.floor((profile.currentStreak / 30) * 100)}%</div>
                <div className="text-xs text-muted-foreground">Monthly Goal</div>
              </div>
              <div className="border rounded p-2">
                <div className="text-2xl font-bold">{profile.currentStreak >= 7 ? '✓' : profile.currentStreak}/7</div>
                <div className="text-xs text-muted-foreground">Weekly Streak</div>
              </div>
              <div className="border rounded p-2">
                <div className="text-2xl font-bold">{profile.points}</div>
                <div className="text-xs text-muted-foreground">Streak Points</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Flame className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No streak data available.</p>
            <p className="text-sm">Start checking in daily to build your streak!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}