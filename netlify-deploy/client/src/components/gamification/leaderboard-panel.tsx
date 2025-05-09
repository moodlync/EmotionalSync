import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, ChevronUp, Flame } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { LeaderboardEntry } from '@/types/gamification-types';

interface LeaderboardPanelProps {
  className?: string;
  limit?: number;
}

export default function LeaderboardPanel({ className, limit = 5 }: LeaderboardPanelProps) {
  const { leaderboard, profile, isLoadingLeaderboard } = useGamification();
  
  if (isLoadingLeaderboard || !leaderboard) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-amber-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading leaderboard data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const topUsers = leaderboard.slice(0, limit);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-amber-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topUsers.map((entry, index) => {
          const isCurrentUser = profile && entry.id === profile.id;
          const rank = index + 1;
          
          return (
            <div 
              key={entry.id} 
              className={`relative flex items-center p-2 rounded-lg mb-2 transition-all
                ${rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}
                ${isCurrentUser ? 'border-primary border-2' : ''}
              `}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full mr-3 font-bold text-sm"
                style={{
                  backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#E5E7EB',
                  color: rank <= 3 ? '#000' : '#6B7280'
                }}
              >
                {rank}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm flex items-center">
                  {entry.username}
                  {isCurrentUser && <span className="ml-2 text-xs font-normal text-gray-500">(You)</span>}
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <span className="flex items-center">
                    <Trophy className="w-3 h-3 mr-1" />
                    {entry.points} pts
                  </span>
                  <span className="flex items-center">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Lvl {entry.level}
                  </span>
                  <span className="flex items-center">
                    <Flame className="w-3 h-3 mr-1" />
                    {entry.streak}d
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="bg-primary text-white border-0 text-xs">
                  <Award className="w-3 h-3 mr-1" />{entry.achievementCount}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}