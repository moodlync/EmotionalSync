import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserNftCollection from '@/components/premium-features/user-nft-collection';
import TokenPoolStats from '@/components/premium-features/token-pool-stats';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/main-layout';
import { 
  Sparkles, 
  Info, 
  Lock, 
  Crown, 
  AlertCircle 
} from 'lucide-react';

// Note: For deployment, we'll use placeholder image references
// which will be replaced with actual NFT images from the server
const emoteNft1 = '/placeholder-nft-1.jpg';
const badMoodNft = '/placeholder-nft-2.jpg';
const angerNft = '/placeholder-nft-3.jpg';
const surpriseNft = '/placeholder-nft-4.jpg';

export default function NftCollectionPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('collection');
  
  // Check if user has premium access
  const isPremium = user?.isPremium || false;

  // Get trial info if applicable
  const hasActiveTrial = user?.premiumTrialEnd && new Date(user.premiumTrialEnd) > new Date();
  const trialDaysLeft = hasActiveTrial 
    ? Math.ceil((new Date(user.premiumTrialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
    : 0;

  return (
    <MainLayout showBackButton={true} title="Emotional NFT Collection">
      <Helmet>
        <title>Emotional NFT Collection | MoodSync</title>
      </Helmet>

      <div className="container max-w-6xl mx-auto py-4 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              Emotional NFT Collection
              <Sparkles className="h-6 w-6 ml-2 text-yellow-400" />
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Collect and evolve unique digital tokens that represent your emotional journey.
              Each NFT is tied to your emotional milestones and progress in MoodSync.
            </p>
          </div>

          {isPremium ? (
            <Badge variant="outline" className="text-lg py-1 px-4 bg-gradient-to-r from-amber-200 to-yellow-400 text-black font-medium">
              <Crown className="h-4 w-4 mr-1" />
              Premium Member
            </Badge>
          ) : hasActiveTrial ? (
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="mb-1 py-1 px-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900">
                Trial Mode • {trialDaysLeft} days left
              </Badge>
              <Button variant="default" size="sm" className="mt-1">
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="mb-1 py-1 px-4 bg-muted text-muted-foreground">
                <Lock className="h-4 w-4 mr-1" />
                Premium Feature
              </Badge>
              <Button variant="default" size="sm" className="mt-1">
                Start Free Trial
              </Button>
            </div>
          )}
        </div>

        {isPremium || hasActiveTrial ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="collection">My NFT Collection</TabsTrigger>
              <TabsTrigger value="pool">Token Pool</TabsTrigger>
              <TabsTrigger value="about">About NFTs</TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="mt-0">
              <UserNftCollection />
            </TabsContent>

            <TabsContent value="pool" className="mt-0">
              <TokenPoolStats userId={user?.id} />
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>What are Emotional NFTs?</CardTitle>
                    <CardDescription>Understanding your digital collectibles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <img 
                        src={emoteNft1} 
                        alt="Joy Essence NFT" 
                        className="w-full rounded-lg shadow-md" 
                      />
                      <img 
                        src={badMoodNft} 
                        alt="Melancholy Mastery NFT" 
                        className="w-full rounded-lg shadow-md" 
                      />
                    </div>
                    
                    <p className="mb-4">
                      Emotional NFTs are unique digital collectibles that represent significant emotional milestones in your MoodSync journey. 
                      Unlike traditional NFTs, these are "soulbound" to your account and evolve as you progress.
                    </p>
                    
                    <h3 className="text-lg font-medium mb-2">Key Features:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Earn NFTs automatically by completing emotional activities</li>
                      <li>Each NFT provides unique benefits and token boosts</li>
                      <li>NFTs evolve over time as you grow emotionally</li>
                      <li>Premium members can mint, display and gift their NFTs</li>
                      <li>Burn NFTs to contribute to the community token pool</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>How To Earn & Use NFTs</CardTitle>
                    <CardDescription>Maximize your collection's value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <img 
                        src={angerNft} 
                        alt="Anger Management NFT" 
                        className="w-full rounded-lg shadow-md" 
                      />
                      <img 
                        src={surpriseNft} 
                        alt="Surprise Discovery NFT" 
                        className="w-full rounded-lg shadow-md" 
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">How to Earn NFTs:</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                      <li>Complete daily emotional check-ins consistently</li>
                      <li>Achieve emotional milestones (7-day streaks, etc.)</li>
                      <li>Demonstrate emotional growth patterns</li>
                      <li>Participate in community challenges</li>
                      <li>Reach higher emotional intelligence levels</li>
                    </ul>
                    
                    <h3 className="text-lg font-medium mb-2">Using Your NFTs:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Mint</strong>: Costs 350 tokens to make an NFT official</li>
                      <li><strong>Display</strong>: Showcase on your profile for status</li>
                      <li><strong>Gift</strong>: Share with friends to help their journey</li>
                      <li><strong>Burn</strong>: Contribute to the token pool to help the community</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                    NFT Rarity Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-1 flex items-center">
                        Common
                        <Badge variant="outline" className="ml-2">60%</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">Basic emotional milestones and regular check-ins.</p>
                      <p className="text-xs mt-2 text-primary">+5% token earning bonus</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-1 flex items-center text-green-500">
                        Uncommon
                        <Badge variant="outline" className="ml-2">25%</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">7-day streaks and emotional pattern discoveries.</p>
                      <p className="text-xs mt-2 text-green-500">+8% token earning bonus</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-1 flex items-center text-blue-500">
                        Rare
                        <Badge variant="outline" className="ml-2">10%</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">30-day streaks and significant emotional growth.</p>
                      <p className="text-xs mt-2 text-blue-500">+12% token earning bonus</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-1 flex items-center text-purple-500">
                        Legendary
                        <Badge variant="outline" className="ml-2">5%</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">Exceptional emotional mastery and personal transformation.</p>
                      <p className="text-xs mt-2 text-purple-500">+15% token earning bonus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Emotional NFTs are exclusive to premium members. Upgrade to unlock your personal NFT collection
                  that evolves with your emotional journey.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <img src={emoteNft1} alt="Joy NFT" className="w-full h-auto rounded-lg opacity-50" />
                  <img src={badMoodNft} alt="Melancholy NFT" className="w-full h-auto rounded-lg opacity-50" />
                  <img src={angerNft} alt="Anger NFT" className="w-full h-auto rounded-lg opacity-50" />
                  <img src={surpriseNft} alt="Surprise NFT" className="w-full h-auto rounded-lg opacity-50" />
                </div>
                <Button size="lg">Upgrade to Premium</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}