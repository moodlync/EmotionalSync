import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  Flame, 
  Sparkles,
  Zap,
  Target,
  HeartHandshake,
  Crown,
  ArrowUpRight,
  AlertCircle,
  InfoIcon
} from 'lucide-react';
import { useState } from 'react';

// Pool stats type definition
interface PoolStats {
  totalTokens: number;
  targetTokens: number;
  progress: number;
  distributionRound: number;
  totalContributors: number;
  nextDistributionDate: string;
  todayBurned: number;
  topContributorUsername: string;
  topContributorTokens: number;
  charityImpact: number;
  userRank: number | null;
  userTokensBurned: number;
  projectedRankAfterBurn: number | null;
}

// Top contributor type definition
interface TopContributor {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string;
  tokensBurned: number;
  rank: number;
}

export default function TokenPoolStats({ userId }: { userId?: number }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch pool stats
  const { 
    data: poolStats, 
    isLoading: isLoadingStats 
  } = useQuery<PoolStats>({
    queryKey: ['/api/token-pool/stats', userId],
    queryFn: async () => {
      const res = await fetch('/api/token-pool/stats');
      if (!res.ok) {
        throw new Error('Failed to fetch pool stats');
      }
      return res.json();
    }
  });
  
  // Fetch top contributors
  const { 
    data: contributors, 
    isLoading: isLoadingContributors 
  } = useQuery<TopContributor[]>({
    queryKey: ['/api/token-pool/top-contributors'],
    queryFn: async () => {
      const res = await fetch('/api/token-pool/top-contributors?limit=10');
      if (!res.ok) {
        throw new Error('Failed to fetch top contributors');
      }
      return res.json();
    }
  });

  // Format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : poolStats ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Pool Progress
                </CardTitle>
                <CardDescription>
                  Round {poolStats.distributionRound}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatNumber(poolStats.totalTokens)} tokens</span>
                    <span>{formatNumber(poolStats.targetTokens)} target</span>
                  </div>
                  <Progress value={poolStats.progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Next distribution: {formatDate(poolStats.nextDistributionDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <HeartHandshake className="h-5 w-5 mr-2 text-pink-500" />
                  Community Impact
                </CardTitle>
                <CardDescription>
                  Charity donations from burn pool
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold">{formatCurrency(poolStats.charityImpact)}</span>
                  <Badge variant="outline" className="text-xs">Estimated impact</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  {poolStats.totalContributors} contributors total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-orange-500" />
                  Today's Burns
                </CardTitle>
                <CardDescription>
                  NFTs burned in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold">+{formatNumber(poolStats.todayBurned)}</span>
                  <div>
                    <Badge variant="outline" className="text-xs flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Tokens today
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <Award className="h-3.5 w-3.5 inline mr-1" />
                  Top contributor: {poolStats.topContributorUsername}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="col-span-1 md:col-span-3">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-center py-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mr-3" />
                <p>Failed to load token pool data. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="overview">Pool Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Top Contributors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Token Pool System</CardTitle>
              <CardDescription>How burned NFTs benefit the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <InfoIcon className="h-4 w-4 mr-2 text-primary" />
                    What is the Token Pool?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The Token Pool is a community fund created when members burn their Emotional NFTs.
                    Each burned NFT contributes 350 tokens to the pool, which is distributed once it reaches
                    the target amount.
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>
                      <span className="text-foreground">85%</span> of tokens are distributed to top contributors
                    </li>
                    <li>
                      <span className="text-foreground">15%</span> is donated to mental health organizations
                    </li>
                  </ul>
                </div>
                
                {userId && poolStats?.userRank !== null && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                      Your Pool Contribution Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Your Rank</p>
                        <p className="text-2xl font-bold flex items-center">
                          #{poolStats.userRank}
                          {poolStats.userRank <= 10 && (
                            <Crown className="h-4 w-4 ml-1 text-yellow-400" />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tokens Contributed</p>
                        <p className="text-2xl font-bold">{formatNumber(poolStats.userTokensBurned)}</p>
                      </div>
                    </div>
                    
                    {poolStats.projectedRankAfterBurn !== null && (
                      <div className="flex items-center text-sm">
                        <Sparkles className="h-4 w-4 mr-1 text-yellow-400" />
                        Burn another NFT to reach rank #{poolStats.projectedRankAfterBurn}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <Flame className="h-6 w-6 text-red-500 mr-3" />
                    <div>
                      <h4 className="font-medium">Burn NFTs</h4>
                      <p className="text-sm text-muted-foreground">
                        Contribute to the pool by burning NFTs you no longer need
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Zap className="h-6 w-6 text-amber-500 mr-3" />
                    <div>
                      <h4 className="font-medium">Get Rewards</h4>
                      <p className="text-sm text-muted-foreground">
                        Top contributors receive bonus tokens at distribution time
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <HeartHandshake className="h-6 w-6 text-pink-500 mr-3" />
                    <div>
                      <h4 className="font-medium">Support Charities</h4>
                      <p className="text-sm text-muted-foreground">
                        A portion of all pools is donated to mental health charities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Go to Collection to Burn NFTs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Top Pool Contributors
              </CardTitle>
              <CardDescription>
                Users who have burned the most NFTs this round
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingContributors ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4 space-y-1 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : contributors?.length ? (
                <div className="space-y-4">
                  {contributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-slate-100 text-slate-700' : 
                        index === 2 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {contributor.profilePicture ? (
                          <img 
                            src={contributor.profilePicture} 
                            alt={contributor.username} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                        ) : (
                          <span className="font-bold">{contributor.rank}</span>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium flex items-center">
                          {contributor.username}
                          {index === 0 && <Crown className="h-4 w-4 ml-1 text-yellow-500" />}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(contributor.tokensBurned)} tokens contributed
                        </p>
                      </div>
                      <Badge variant={index < 3 ? "default" : "outline"} className="ml-auto">
                        #{contributor.rank}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No contributors data available</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm" className="text-xs">
                View Full Leaderboard
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}