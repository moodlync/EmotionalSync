import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import TokenMilestonesGrid from "@/components/token-milestones/token-milestones-grid";
import { 
  Coins, 
  History, 
  Share2, 
  Trophy, 
  Users,
  CheckCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RewardActivity {
  id: number;
  userId: number;
  activityType: string;
  tokensEarned: number;
  description: string;
  createdAt: string;
}

interface MilestoneShare {
  id: number;
  userId: number;
  milestone: number;
  platform: string;
  clicks: number;
  tokensAwarded: number;
  createdAt: string;
}

export default function TokenMilestonesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id || 1; // Default to user 1 for demo

  // Get user's token balance
  const { data: userTokens, isLoading: isLoadingTokens } = useQuery({
    queryKey: ['/api/user/tokens'],
    queryFn: async () => {
      const res = await fetch('/api/user/tokens');
      if (!res.ok) throw new Error('Failed to fetch token balance');
      const data = await res.json();
      return data.tokens;
    },
    initialData: user?.emotionTokens || 750, // Default value for demo
  });

  // Get user's reward activities
  const { data: rewardActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/rewards/history'],
    queryFn: async () => {
      const res = await fetch('/api/rewards/history');
      if (!res.ok) throw new Error('Failed to fetch reward history');
      return res.json() as Promise<RewardActivity[]>;
    },
    enabled: !!user,
    initialData: [] as RewardActivity[],
  });

  // Get user's milestone shares
  const { data: milestoneShares, isLoading: isLoadingShares } = useQuery({
    queryKey: ['/api/milestone-shares'],
    queryFn: async () => {
      const res = await fetch('/api/milestone-shares');
      if (!res.ok) throw new Error('Failed to fetch milestone shares');
      return res.json() as Promise<MilestoneShare[]>;
    },
    enabled: !!user,
    initialData: [] as MilestoneShare[],
  });

  const totalTokensEarned = Array.isArray(rewardActivities) ? rewardActivities.reduce(
    (total, activity) => total + activity.tokensEarned,
    0
  ) : 0;

  const totalMilestoneShares = Array.isArray(milestoneShares) ? milestoneShares.length : 0;
  const totalShareClicks = Array.isArray(milestoneShares) ? milestoneShares.reduce(
    (total, share) => total + share.clicks,
    0
  ) : 0;
  const totalTokensFromShares = Array.isArray(milestoneShares) ? milestoneShares.reduce(
    (total, share) => total + share.tokensAwarded,
    0
  ) : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Get platform label for display
  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
        return 'LinkedIn';
      case 'whatsapp':
        return 'WhatsApp';
      case 'telegram':
        return 'Telegram';
      case 'email':
        return 'Email';
      case 'copy_link':
        return 'Copied Link';
      default:
        return platform;
    }
  };

  // Get activity type label for display
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'journal_entry':
        return 'Journal Entry';
      case 'chat_participation':
        return 'Chat Participation';
      case 'emotion_update':
        return 'Emotion Update';
      case 'daily_login':
        return 'Daily Login';
      case 'help_others':
        return 'Helping Others';
      case 'challenge_completion':
        return 'Challenge Completion';
      case 'badge_earned':
        return 'Badge Earned';
      case 'token_transfer':
        return 'Token Transfer';
      case 'video_post':
        return 'Video Post';
      case 'milestone_share':
        return 'Milestone Share';
      default:
        return type.replace('_', ' ');
    }
  };

  // Decreased milestone values by 25%
  const nextMilestone = [30, 150, 300, 750, 1500, 3000, 7500].find(
    milestone => milestone > userTokens
  ) || 7500;
  
  const progress = Math.min(
    100,
    Math.round(((userTokens || 0) / (nextMilestone || 1)) * 100)
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Token Milestones</h1>
        <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-4 py-2 rounded-full shadow-md">
          <Coins className="mr-2 h-5 w-5" />
          <span className="font-bold">{userTokens} Tokens</span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
        Track your progress and reach token milestones to unlock rewards. Share your achievements with friends and earn additional tokens!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoadingTokens ? <Skeleton className="h-8 w-20" /> : userTokens}
              </div>
              <Coins className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Progress to {nextMilestone} tokens</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoadingActivities ? <Skeleton className="h-8 w-20" /> : totalTokensEarned}
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              From {Array.isArray(rewardActivities) ? rewardActivities.length : 0} activities
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Milestone Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoadingShares ? <Skeleton className="h-8 w-20" /> : totalMilestoneShares}
              </div>
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Earned {totalTokensFromShares} tokens from shares
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Share Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoadingShares ? <Skeleton className="h-8 w-20" /> : totalShareClicks}
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total clicks on shared milestones
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="history">Reward History</TabsTrigger>
          <TabsTrigger value="shares">Milestone Shares</TabsTrigger>
        </TabsList>
        
        <TabsContent value="milestones" className="mt-6">
          <TokenMilestonesGrid userTokens={userTokens} />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>
                Detailed report of all your token earnings across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : Array.isArray(rewardActivities) && rewardActivities.length > 0 ? (
                <>
                  {/* Summary by activity type */}
                  <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3">Earnings by Activity Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(
                        rewardActivities.reduce((acc, activity) => {
                          const type = getActivityTypeLabel(activity.activityType);
                          acc[type] = (acc[type] || 0) + activity.tokensEarned;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, total]) => (
                        <div key={type} className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">{type}</div>
                          <div className="font-semibold text-primary">{total} tokens</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Monthly summary */}
                  <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3">Monthly Earnings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(
                        rewardActivities.reduce((acc, activity) => {
                          const date = new Date(activity.createdAt);
                          const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                          acc[monthYear] = (acc[monthYear] || 0) + activity.tokensEarned;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([monthYear, total]) => (
                        <div key={monthYear} className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm flex justify-between items-center">
                          <div className="text-sm">{monthYear}</div>
                          <div className="font-semibold text-primary">{total} tokens</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Detailed activity list */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Detailed Transaction History</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {rewardActivities.map((activity, index) => (
                        <div key={activity.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-900 -mx-2 px-2 py-1 rounded-md transition-colors">
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                              <span>{formatDate(activity.createdAt)}</span>
                              <Badge variant="outline" className="text-xs">
                                {getActivityTypeLabel(activity.activityType)}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900 dark:text-green-100">
                            +{activity.tokensEarned} tokens
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg max-w-md mx-auto">
                    <h3 className="text-amber-700 dark:text-amber-400 font-medium mb-2">No token history yet</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your detailed token earnings report will appear here once you start earning tokens.
                    </p>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-3">Ways to Earn Tokens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                    <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="text-blue-500 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Daily Login</p>
                        <p className="text-xs text-gray-500">Earn tokens just by logging in each day</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="text-blue-500 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Complete Challenges</p>
                        <p className="text-xs text-gray-500">Participate in user challenges to earn tokens</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="text-blue-500 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Journal Entries</p>
                        <p className="text-xs text-gray-500">Record your emotions and insights</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="text-blue-500 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Help Others</p>
                        <p className="text-xs text-gray-500">Engage with and support community members</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shares">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Shares</CardTitle>
              <CardDescription>
                Track the milestones you've shared and their engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingShares ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(milestoneShares) && milestoneShares.length > 0 ? (
                <div className="space-y-6">
                  {milestoneShares.map((share) => (
                    <div key={share.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-amber-100">
                            <AvatarFallback>{share.milestone}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {share.milestone} Tokens Milestone
                            </p>
                            <p className="text-sm text-gray-500">
                              Shared via {getPlatformLabel(share.platform)} on {formatDate(share.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Share2 className="h-3 w-3" />
                          <span>Share Again</span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-center">
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="font-medium">{share.clicks}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-center">
                          <p className="text-xs text-gray-500">Tokens Earned</p>
                          <p className="font-medium">{share.tokensAwarded}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-center">
                          <p className="text-xs text-gray-500">Click Rate</p>
                          <p className="font-medium">{share.clicks > 0 ? Math.round((share.clicks / 100) * 100) / 100 : 0}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p>No milestone shares yet.</p>
                  <p className="text-sm mt-1 max-w-md mx-auto">
                    Share your achievements on social media to earn additional tokens and track engagement!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}