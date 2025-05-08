import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Award, Flame, Settings, Clock, BarChart, Shield, Lock, ShieldCheck, Bell, Database, Home, Heart } from 'lucide-react';
import { Redirect, Link } from 'wouter';
import ProfilePictureForm from '@/components/profile/profile-picture-form';
import ProfileInformationForm from '@/components/profile/profile-information-form';
import ProfileSecurityTab from '@/components/profile/profile-security-tab';
import AccountDataManagement from '@/components/profile/account-data-management';
import BadgesDisplay from '@/components/gamification/badges-display';
import ChallengeList from '@/components/gamification/challenge-list';
import StreakCalendar from '@/components/gamification/streak-calendar';
import { ProfileMetrics } from '@/components/profile/profile-metrics';
import { ProfileSubscriptionCard } from '@/components/profile/profile-subscription-card';
import { VerificationBadge } from '@/components/verification/verification-badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmotionType } from '@/types/imprints';

// Component to show verification status and link to verification page for all users
function VerificationStatusSection() {
  const { data: verificationData, isLoading } = useQuery<{
    status?: 'not_verified' | 'pending' | 'verified';
    verifiedAt?: string;
    documents?: any[];
  }>({
    queryKey: ['/api/user/verification/status'],
    retry: false,
    staleTime: 30000, // 30 seconds
  });
  
  const { data: premiumStatus } = useQuery<{
    isPremium?: boolean;
  }>({
    queryKey: ['/api/user/premium/status'],
  });
  
  const isPremium = premiumStatus?.isPremium;
  
  if (isLoading) {
    return <div className="flex items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
      <span className="text-xs">Loading...</span>
    </div>;
  }
  
  // If verified, show verified badge with date
  if (verificationData && verificationData.status === 'verified') {
    return (
      <div className="flex items-center">
        <VerificationBadge status="verified" size="sm" />
        {verificationData.verifiedAt && (
          <span className="ml-2 text-xs text-gray-500">
            since {new Date(verificationData.verifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }
  
  // If pending verification
  if (verificationData && verificationData.status === 'pending') {
    return (
      <div className="flex items-center">
        <VerificationBadge status="pending" size="sm" />
        <span className="ml-2 text-xs text-amber-600">Verification pending</span>
      </div>
    );
  }
  
  // Default: Not verified, show verification button for all users
  return (
    <div className="flex items-center">
      <VerificationBadge status="not_verified" size="sm" />
      <Link to="/verification" className="ml-2 text-xs text-primary hover:underline">
        Get Verified
      </Link>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);

  // Get user's tokens
  const { data: tokenData, isLoading: isTokenLoading } = useQuery<{ tokens: number }>({
    queryKey: ['/api/tokens'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Get user's reward activities
  const { data: rewardActivities, isLoading: isRewardLoading } = useQuery<any[]>({
    queryKey: ['/api/rewards/history'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });
  
  // Get user's current emotion
  const { data: emotionData, isLoading: isEmotionLoading } = useQuery<{ emotion: EmotionType }>({
    queryKey: ['/api/emotion'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
    onSuccess: (data) => {
      if (data?.emotion) {
        setSelectedEmotion(data.emotion);
      }
    }
  });
  
  // Mutation for updating user emotion
  const updateEmotionMutation = useMutation({
    mutationFn: async (emotion: EmotionType) => {
      const response = await apiRequest('POST', '/api/emotion', { emotion });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedEmotion(data.emotion);
      
      if (data.tokensEarned > 0) {
        toast({
          title: "Emotion Updated!",
          description: `You earned ${data.tokensEarned} tokens for updating your mood.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Emotion Updated!",
          description: "Your mood has been updated successfully.",
        });
      }
      
      // Invalidate queries that depend on emotion
      queryClient.invalidateQueries({ queryKey: ['/api/emotion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update emotion",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Handle emotion button click
  const handleEmotionChange = (emotion: EmotionType) => {
    updateEmotionMutation.mutate(emotion);
  };

  const isLoading = isAuthLoading || isTokenLoading || isRewardLoading || isEmotionLoading;

  // If not authenticated, redirect to auth page
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-500 mb-8">Manage your profile, view rewards, and track achievements</p>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="home" className="space-y-8">
          <TabsList className="grid grid-cols-8 w-full max-w-5xl">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Subscription Card */}
            <ProfileSubscriptionCard />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfilePictureForm />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your personal account details and token balance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium">{user?.username}</p>
                      <VerificationStatusSection />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Token Balance</h3>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {tokenData?.tokens || 0}
                      </div>
                      <span className="font-medium">Emotion Tokens</span>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link to="/profile/notifications" className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                            <Bell className="h-4 w-4" />
                          </div>
                          <span>View All Notifications</span>
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                    <p className="text-gray-700">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  

                </CardContent>
              </Card>
            </div>

            <ProfileInformationForm />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reward Activity</CardTitle>
                  <CardDescription>
                    History of your most recent token earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rewardActivities && rewardActivities.length > 0 ? (
                    <div className="space-y-4">
                      {rewardActivities.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-500">{formatDateTime(activity.createdAt)}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50">
                            +{activity.tokensEarned} tokens
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No reward activity to display yet.</p>
                      <p className="text-sm mt-1">
                        Complete challenges and use the app to earn tokens!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <ProfileSecurityTab />
          </TabsContent>
          
          <TabsContent value="data">
            <AccountDataManagement />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesDisplay />
          </TabsContent>

          <TabsContent value="challenges">
            <ChallengeList />
          </TabsContent>

          <TabsContent value="streaks">
            <StreakCalendar />
          </TabsContent>
          
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Welcome, {user?.firstName || user?.username}
                  </CardTitle>
                  <CardDescription>
                    Your personal dashboard and emotion intelligence center
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <Heart className="h-5 w-5 text-rose-500 mr-2" />
                      How are you feeling today?
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Track your emotions to get matched with others who share similar feelings
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 ${selectedEmotion === 'happy' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}`}
                        onClick={() => handleEmotionChange('happy')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">😊</span>
                        <span className="text-xs">Happy</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 ${selectedEmotion === 'sad' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
                        onClick={() => handleEmotionChange('sad')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">😢</span>
                        <span className="text-xs">Sad</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${selectedEmotion === 'angry' ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                        onClick={() => handleEmotionChange('angry')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">😠</span>
                        <span className="text-xs">Angry</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 ${selectedEmotion === 'anxious' ? 'bg-purple-50 text-purple-600 border-purple-200' : ''}`}
                        onClick={() => handleEmotionChange('anxious')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">😰</span>
                        <span className="text-xs">Anxious</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-green-50 hover:text-green-600 hover:border-green-200 ${selectedEmotion === 'excited' ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
                        onClick={() => handleEmotionChange('excited')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">🤩</span>
                        <span className="text-xs">Excited</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center py-3 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-200 ${selectedEmotion === 'neutral' ? 'bg-gray-50 text-gray-600 border-gray-200' : ''}`}
                        onClick={() => handleEmotionChange('neutral')}
                        disabled={updateEmotionMutation.isPending}
                      >
                        <span className="text-2xl mb-1">😐</span>
                        <span className="text-xs">Neutral</span>
                      </Button>
                      {updateEmotionMutation.isPending && (
                        <div className="col-span-3 md:col-span-6 flex justify-center mt-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-500">Updating emotion...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white h-auto py-4 flex flex-col">
                      <span className="text-lg font-medium">Find Connections</span>
                      <span className="text-xs font-normal mt-1">Match with others feeling the same way</span>
                    </Button>
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col">
                      <span className="text-lg font-medium">Open Journal</span>
                      <span className="text-xs font-normal mt-1">Record your emotional journey</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    Your Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tokens</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-700">
                      {tokenData?.tokens || 0}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Streak</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-400/20 to-blue-500/20 text-blue-700">
                      3 days
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active NFTs</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-pink-400/20 to-purple-500/20 text-purple-700">
                      4
                    </Badge>
                  </div>
                  
                  <div className="w-full mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link to="/nft-collection">
                        View NFT Collection
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Flame className="h-4 w-4 mr-2 text-orange-500" />
                    Active Challenges
                  </CardTitle>
                  <CardDescription>
                    Complete challenges to earn tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-card rounded-md p-3 shadow-sm border">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">7-Day Emotion Tracking</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          3/7 Days
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-md p-3 shadow-sm border">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Connect with 5 People</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          2/5 People
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-md p-3 shadow-sm border">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Complete Profile</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          70% Done
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                    Emotion Trends
                  </CardTitle>
                  <CardDescription>
                    Your recent emotional patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px] flex items-center justify-center text-center p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                    <div className="text-muted-foreground">
                      <BarChart className="h-10 w-10 mb-2 mx-auto text-slate-400" />
                      <p>Emotional data will appear here as you track your moods over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <ProfileMetrics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}