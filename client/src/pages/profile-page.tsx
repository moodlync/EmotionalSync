import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Award, Flame, Settings, Clock, BarChart, Shield, Lock, ShieldCheck, Bell, Database } from 'lucide-react';
import { Redirect, Link } from 'wouter';
import ProfilePictureForm from '@/components/profile/profile-picture-form';
import ProfileSecurityTab from '@/components/profile/profile-security-tab';
import AccountDataManagement from '@/components/profile/account-data-management';
import BadgesDisplay from '@/components/gamification/badges-display';
import ChallengeList from '@/components/gamification/challenge-list';
import StreakCalendar from '@/components/gamification/streak-calendar';
import { ProfileMetrics } from '@/components/profile/profile-metrics';
import { VerificationBadge } from '@/components/verification/verification-badge';
import { Button } from '@/components/ui/button';

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

  const isLoading = isAuthLoading || isTokenLoading || isRewardLoading;

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
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid grid-cols-7 w-full max-w-5xl">
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
          
          <TabsContent value="analytics">
            <ProfileMetrics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}