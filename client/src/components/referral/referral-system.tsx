import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Copy, Share2, CheckCircle, RefreshCcw, Users, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Define types
type ReferralStatus = 'pending' | 'registered' | 'converted' | 'expired';

interface Referral {
  id: number;
  referrerUserId: number;
  referredUserId: number | null;
  referralEmail: string | null;
  referralCode: string;
  status: ReferralStatus;
  createdAt: string;
  expiresAt: string;
  referredUser?: {
    id: number;
    username: string;
    isPremium: boolean;
  }
}

interface ReferralStatistics {
  total: number;
  pending: number;
  registered: number;
  converted: number;
  expired: number;
  conversionRate: number;
  referralLink: string;
  convertedCount: number;
  bountyEligible: boolean;
  nextBountyTokens: number;
  referralsUntilNextBounty: number;
}

// Referral Bounty Tracker component
const ReferralBountyTracker = () => {
  const { data: stats, isLoading, error } = useQuery<ReferralStatistics>({
    queryKey: ['/api/referrals/statistics'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const claimBountyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/referrals/claim-bounty');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Bounty Claimed!',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
      
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/referrals/statistics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to claim bounty',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error loading referral statistics</p>
      </div>
    );
  }

  const progressPercentage = stats.convertedCount >= 5 
    ? 100 
    : Math.floor((stats.convertedCount / 5) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" /> Referral Bounty
            </CardTitle>
            <CardDescription>
              Refer premium members and earn token rewards
            </CardDescription>
          </div>
          <Badge className="bg-primary">{stats.convertedCount}/5 Premium Referrals</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="text-sm space-y-2 mb-6">
          <p>Earn <span className="font-semibold">{stats.nextBountyTokens} tokens</span> when you successfully refer 5 premium members!</p>
          {stats.convertedCount > 0 && stats.convertedCount < 5 && (
            <p className="text-muted-foreground">You need {5 - stats.convertedCount} more premium referrals to claim your bounty.</p>
          )}
        </div>
        
        <Button 
          onClick={() => claimBountyMutation.mutate()} 
          disabled={!stats.bountyEligible || claimBountyMutation.isPending}
          className="w-full"
          variant={stats.bountyEligible ? "default" : "outline"}
        >
          {claimBountyMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : stats.bountyEligible ? (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Claim {stats.nextBountyTokens} Tokens
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Keep Inviting Friends
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const ReferralStatus = ({ status }: { status: ReferralStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'registered':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'converted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Invited';
      case 'registered':
        return 'Joined';
      case 'converted':
        return 'Premium';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} px-2 py-1 text-xs font-medium`}>
      {getStatusText()}
    </Badge>
  );
};

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const ReferralForm = () => {
  const { user } = useAuth();
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const referralMutation = useMutation({
    mutationFn: async (values: EmailFormValues) => {
      const response = await apiRequest('POST', '/api/referrals', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Referral sent!',
        description: 'Your friend has been invited to join MoodSync.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/statistics'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send referral',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: EmailFormValues) => {
    referralMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Friend's Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="friend@example.com"
                  {...field}
                  disabled={referralMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                We'll send your friend an invitation to join MoodSync.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={referralMutation.isPending}
        >
          {referralMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Invitation'
          )}
        </Button>
      </form>
    </Form>
  );
};

const ReferralList = () => {
  const { data: referrals, isLoading, error } = useQuery<Referral[]>({
    queryKey: ['/api/referrals'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const convertMutation = useMutation({
    mutationFn: async (referralId: number) => {
      const response = await apiRequest('POST', `/api/referrals/${referralId}/convert`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Referral converted!',
        description: 'Your friend is now marked as a premium user.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/statistics'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to convert referral',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error loading referrals</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/referrals'] })}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No referrals yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start inviting friends to join MoodSync!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <Card key={referral.id} className="overflow-hidden">
          <CardHeader className="p-4 bg-primary-foreground/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">
                  {referral.referredUser ? referral.referredUser.username : referral.referralEmail}
                </CardTitle>
                <CardDescription>
                  Invited on {new Date(referral.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <ReferralStatus status={referral.status} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Referral Code: <span className="font-mono text-xs bg-muted p-1 rounded">{referral.referralCode}</span>
            </p>
            {referral.status === 'registered' && !referral.referredUser?.isPremium && (
              <Button
                size="sm"
                onClick={() => convertMutation.mutate(referral.id)}
                disabled={convertMutation.isPending}
              >
                {convertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Mark as Premium
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ReferralStats = () => {
  const { data: stats, isLoading, error } = useQuery<ReferralStatistics>({
    queryKey: ['/api/referrals/statistics'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const copyToClipboard = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: 'Copied!',
            description: 'Referral link copied to clipboard',
          });
        })
        .catch(() => {
          toast({
            title: 'Failed to copy',
            description: 'Please try again',
            variant: 'destructive',
          });
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error loading statistics</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/referrals/statistics'] })}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Registered</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.registered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Converted</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{(stats.conversionRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with friends to invite them to MoodSync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={stats.referralLink}
              className="font-mono text-sm bg-primary-foreground"
            />
            <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy link">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Share link">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Referral Link</DialogTitle>
                  <DialogDescription>
                    Invite friends to join MoodSync using these sharing options
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] hover:text-[#1DA1F2] border-[#1DA1F2]/20"
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?text=Join me on MoodSync, the emotion-based social network!&url=${encodeURIComponent(stats.referralLink)}`, '_blank');
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] hover:text-[#1877F2] border-[#1877F2]/20"
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.referralLink)}`, '_blank');
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                    </svg>
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] hover:text-[#25D366] border-[#25D366]/20"
                    onClick={() => {
                      window.open(`https://wa.me/?text=Join me on MoodSync, the emotion-based social network! ${encodeURIComponent(stats.referralLink)}`, '_blank');
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.241-.579-.486-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.992 0C5.438 0 .102 5.335.1 11.892c-.001 2.096.546 4.142 1.588 5.945L0 24l6.304-1.654a11.881 11.881 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-[#EA4335]/10 hover:bg-[#EA4335]/20 text-[#EA4335] hover:text-[#EA4335] border-[#EA4335]/20"
                    onClick={() => {
                      window.open(`mailto:?subject=Join me on MoodSync&body=I'm using MoodSync to connect with people based on emotions. Join me using this link: ${stats.referralLink}`, '_blank');
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] hover:text-[#0A66C2] border-[#0A66C2]/20"
                    onClick={() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats.referralLink)}`, '_blank');
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 hover:text-purple-500 border-purple-500/20"
                    onClick={() => {
                      navigator.clipboard.writeText(stats.referralLink);
                      toast({
                        title: 'Copied!',
                        description: 'Referral link copied to clipboard',
                      });
                      setShowShareDialog(false);
                    }}
                  >
                    <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copy Link
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-md border border-blue-100 dark:border-blue-900">
            <h3 className="text-sm font-semibold mb-2">Quick Share</h3>
            <div className="flex space-x-2 justify-around">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=Join me on MoodSync, the emotion-based social network!&url=${encodeURIComponent(stats.referralLink)}`, '_blank');
                }}
                title="Share on Twitter"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2]"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.referralLink)}`, '_blank');
                }}
                title="Share on Facebook"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]"
                onClick={() => {
                  window.open(`https://wa.me/?text=Join me on MoodSync, the emotion-based social network! ${encodeURIComponent(stats.referralLink)}`, '_blank');
                }}
                title="Share on WhatsApp"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.241-.579-.486-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.992 0C5.438 0 .102 5.335.1 11.892c-.001 2.096.546 4.142 1.588 5.945L0 24l6.304-1.654a11.881 11.881 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2]"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats.referralLink)}`, '_blank');
                }}
                title="Share on LinkedIn"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#EA4335]/10 hover:bg-[#EA4335]/20 text-[#EA4335]"
                onClick={() => {
                  window.open(`mailto:?subject=Join me on MoodSync&body=I'm using MoodSync to connect with people based on emotions. Join me using this link: ${stats.referralLink}`, '_blank');
                }}
                title="Share via Email"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground mb-2">Referral Progress</p>
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs">
              <span>{stats.registered} joined</span>
              <span>{stats.converted} premium</span>
            </div>
            <Progress value={(stats.converted / Math.max(5, stats.total)) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Get 5 friends to join as premium members to earn rewards!</p>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export function ReferralSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return <div>Please login to access the referral system</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referrals</h2>
          <p className="text-muted-foreground">
            Invite friends to MoodSync and earn rewards
          </p>
        </div>
        <Trophy className="h-12 w-12 text-primary/40" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="bounty">Earn Bounty</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-6">
          <ReferralStats />
        </TabsContent>
        <TabsContent value="bounty" className="pt-6">
          <ReferralBountyTracker />
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Referral Bounty Program</h3>
            <p className="text-sm mb-3">Earn tokens by inviting your friends to become premium members!</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">500</Badge>
                <div>
                  <p className="font-medium">Monthly/Quarterly Premium</p>
                  <p className="text-xs text-muted-foreground">Earn 500 tokens when 5 friends you refer subscribe to a monthly or quarterly premium plan</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">750</Badge>
                <div>
                  <p className="font-medium">Lifetime/Family Plans</p>
                  <p className="text-xs text-muted-foreground">Earn 750 tokens when 5 friends you refer subscribe to a lifetime or family subscription plan</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">1000</Badge>
                <div>
                  <p className="font-medium">Lifetime Family Plans</p>
                  <p className="text-xs text-muted-foreground">Earn 1000 tokens when 5 friends you refer subscribe to a lifetime family subscription plan</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="invite" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite a Friend</CardTitle>
              <CardDescription>
                Enter your friend's email to send them an invitation to join MoodSync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReferralForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="referrals" className="pt-6">
          <ReferralList />
        </TabsContent>
      </Tabs>
    </div>
  );
}