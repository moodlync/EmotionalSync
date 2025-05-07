import { useState } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Award, Flame, Medal, ChevronUp, Gift, Star, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Challenge, Achievement, LeaderboardEntry } from '@/types/gamification-types';

type GamificationTabType = 'challenges' | 'achievements' | 'leaderboard' | 'profile';

export default function GamificationTab() {
  const [activeTabType, setActiveTabType] = useState<GamificationTabType>('challenges');
  const { toast } = useToast();
  const {
    profile,
    challenges,
    achievements,
    leaderboard,
    completeChallengeActivity,
    claimAchievementReward,
    isLoadingProfile,
    isLoadingChallenges,
    isLoadingAchievements,
    isLoadingLeaderboard
  } = useGamification();

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const result = await completeChallengeActivity(challengeId);
      
      if (result.tokensAwarded > 0) {
        toast({
          title: 'Challenge Progress Updated!',
          description: `You earned ${result.tokensAwarded} tokens for completing this challenge!`,
          variant: 'default',
        });
        
        if (result.levelUp) {
          toast({
            title: 'Level Up!',
            description: `You've reached level ${result.newLevel}!`,
            variant: 'default',
          });
        }
        
        if (result.achievementUnlocked) {
          toast({
            title: 'Achievement Unlocked!',
            description: `You've unlocked "${result.achievementUnlocked.title}"`,
            variant: 'default',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update challenge progress.',
        variant: 'destructive',
      });
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const result = await claimAchievementReward(achievementId);
      
      toast({
        title: 'Reward Claimed!',
        description: `You earned ${result.tokensAwarded} tokens for this achievement!`,
        variant: 'default',
      });
      
      if (result.levelUp) {
        toast({
          title: 'Level Up!',
          description: `You've reached level ${result.newLevel}!`,
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim the achievement reward.',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tracking': return <Trophy className="w-4 h-4" />;
      case 'journal': return <Award className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'ai': return <Star className="w-4 h-4" />;
      case 'exploration': return <Flame className="w-4 h-4" />;
      case 'challenges': return <Medal className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const isCompleted = challenge.isCompleted;
    const progress = Math.min(challenge.progress / challenge.target * 100, 100);
    
    return (
      <Card key={challenge.id} className={`mb-4 relative overflow-hidden ${isCompleted ? 'border-green-500' : ''}`}>
        {isCompleted && (
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <Badge variant="outline" className="bg-green-500 text-white border-0">
              Completed
            </Badge>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">{challenge.icon}</div>
              <CardTitle>{challenge.title}</CardTitle>
            </div>
            <Badge variant="outline" className={`${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </Badge>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
            <span>Progress: {challenge.progress}/{challenge.target}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center mt-3 text-gray-500 text-sm">
            <div className="flex items-center mr-4">
              {getCategoryIcon(challenge.category)}
              <span className="ml-1 capitalize">{challenge.category}</span>
            </div>
            <div className="flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              <span>{challenge.reward} tokens</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleCompleteChallenge(challenge.id)} 
            disabled={isCompleted}
            size="sm"
            className="w-full"
            variant={isCompleted ? "outline" : "default"}
          >
            {isCompleted ? 'Completed' : 'Mark Progress'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const isUnlocked = achievement.isUnlocked;
    const progress = Math.min(achievement.progressCurrent / achievement.progressTarget * 100, 100);
    const isClaimed = profile?.achievements.includes(achievement.id);
    
    return (
      <Card 
        key={achievement.id} 
        className={`mb-4 relative overflow-hidden transition-all duration-200
          ${isUnlocked ? 'border-amber-500 shadow-md' : 'opacity-80'}
          ${isClaimed ? 'border-green-500' : ''}
        `}
      >
        {isUnlocked && (
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <Badge variant="outline" className="bg-amber-500 text-white border-0">
              Unlocked
            </Badge>
          </div>
        )}
        {isClaimed && (
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <Badge variant="outline" className="bg-green-500 text-white border-0">
              Claimed
            </Badge>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">{achievement.icon}</div>
              <CardTitle>{achievement.title}</CardTitle>
            </div>
          </div>
          <CardDescription>{achievement.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
            <span>Progress: {achievement.progressCurrent}/{achievement.progressTarget}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center mt-3 text-gray-500 text-sm">
            <div className="flex items-center mr-4">
              {getCategoryIcon(achievement.category)}
              <span className="ml-1 capitalize">{achievement.category}</span>
            </div>
            <div className="flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              <span>{achievement.reward} tokens</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleClaimAchievement(achievement.id)} 
            disabled={!isUnlocked || isClaimed}
            size="sm"
            className="w-full"
            variant={isClaimed ? "outline" : isUnlocked ? "default" : "outline"}
          >
            {isClaimed ? 'Claimed' : isUnlocked ? 'Claim Reward' : 'Locked'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, rank: number) => {
    const isCurrentUser = profile && entry.id === profile.id;
    
    return (
      <div 
        key={entry.id} 
        className={`relative flex items-center p-3 rounded-lg mb-2 transition-all
          ${rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}
          ${isCurrentUser ? 'border-primary border-2' : ''}
        `}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full mr-3 font-bold text-lg"
          style={{
            backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#E5E7EB',
            color: rank <= 3 ? '#000' : '#6B7280'
          }}
        >
          {rank}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg flex items-center">
            {entry.username}
            {isCurrentUser && <span className="ml-2 text-xs font-normal text-gray-500">(You)</span>}
          </div>
          <div className="flex items-center text-sm text-gray-500 space-x-3">
            <span className="flex items-center">
              <Trophy className="w-3 h-3 mr-1" />
              {entry.points} pts
            </span>
            <span className="flex items-center">
              <ChevronUp className="w-3 h-3 mr-1" />
              Level {entry.level}
            </span>
            <span className="flex items-center">
              <Flame className="w-3 h-3 mr-1" />
              {entry.streak} day streak
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="bg-primary text-white border-0 mb-1">
            <Award className="w-3 h-3 mr-1" />{entry.achievementCount}
          </Badge>
        </div>
      </div>
    );
  };

  const renderProfileSection = () => {
    if (!profile) return <div className="text-center py-10">Loading profile data...</div>;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              Your Gamification Profile
              <Trophy className="ml-2 text-amber-500" />
            </CardTitle>
            <CardDescription>Track your progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Experience & Level</h3>
                <div className="text-3xl font-bold mb-1">Level {profile.level}</div>
                <div className="mb-1 text-sm text-gray-500">
                  XP: {profile.experience}/{profile.level * 100}
                </div>
                <Progress value={(profile.experience % 100)} className="h-2" />
                <div className="mt-2 text-sm text-gray-500">
                  {100 - (profile.experience % 100)} XP until next level
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-100/50 to-amber-50/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Points & Rewards</h3>
                <div className="text-3xl font-bold mb-1">{profile.points} pts</div>
                <div className="flex flex-col text-sm text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                    <span>{profile.completedChallenges.length} challenges completed</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{profile.achievements.length} achievements unlocked</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-100/50 to-red-50/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Streak Information</h3>
                <div className="text-3xl font-bold mb-1">
                  <Flame className="inline mr-2 text-red-500" />
                  {profile.currentStreak} days
                </div>
                <div className="flex flex-col text-sm text-gray-500 space-y-1">
                  <div>Current daily check-in streak</div>
                  <div>Longest streak: {profile.longestStreak} days</div>
                  <div>Last check-in: {profile.lastCheckIn ? new Date(profile.lastCheckIn).toLocaleDateString() : 'No check-ins yet'}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-100/50 to-blue-50/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Badges & Rewards</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.length > 0 ? (
                    profile.badges.map((badge, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-2xl">{badge}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Badge Description</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      Complete challenges to earn badges
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      {profile && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Your Gamification Status</h2>
            <div className="text-sm text-gray-500">
              Level {profile.level} • {profile.points} points • {profile.currentStreak} day streak
            </div>
          </div>
          <Button size="sm" onClick={() => setActiveTabType('profile')}>
            View Profile
          </Button>
        </div>
      )}
      
      <Tabs defaultValue="challenges" value={activeTabType} onValueChange={(value) => setActiveTabType(value as GamificationTabType)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="challenges" className="flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center">
            <Medal className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            My Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="challenges">
          {isLoadingChallenges ? (
            <div className="text-center py-10">Loading challenges...</div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(challenge => renderChallengeCard(challenge))}
            </div>
          ) : (
            <div className="text-center py-10">No challenges available at the moment.</div>
          )}
        </TabsContent>
        
        <TabsContent value="achievements">
          {isLoadingAchievements ? (
            <div className="text-center py-10">Loading achievements...</div>
          ) : achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => renderAchievementCard(achievement))}
            </div>
          ) : (
            <div className="text-center py-10">No achievements available at the moment.</div>
          )}
        </TabsContent>
        
        <TabsContent value="leaderboard">
          {isLoadingLeaderboard ? (
            <div className="text-center py-10">Loading leaderboard...</div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div>
              {leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index + 1))}
            </div>
          ) : (
            <div className="text-center py-10">No leaderboard data available.</div>
          )}
        </TabsContent>
        
        <TabsContent value="profile">
          {isLoadingProfile ? (
            <div className="text-center py-10">Loading your profile...</div>
          ) : (
            renderProfileSection()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}