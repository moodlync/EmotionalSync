import { Link } from 'wouter';
import Layout from '@/components/layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Trophy, 
  Sparkles, 
  Gift, 
  BarChart3,
  LucideIcon, 
  Heart, 
  Coins,
  HelpCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function TokenPoolInfoPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Token Pool System</h1>
          <p className="text-muted-foreground mb-6">
            Earn NFTs, mint them with tokens, and contribute to the community pool
          </p>
          
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="pool">Token Pool</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <SystemOverview />
            </TabsContent>
            
            <TabsContent value="nfts" className="mt-6">
              <NftExplanation />
            </TabsContent>
            
            <TabsContent value="pool" className="mt-6">
              <PoolMechanics />
            </TabsContent>
            
            <TabsContent value="faq" className="mt-6">
              <FrequentlyAskedQuestions />
            </TabsContent>
          </Tabs>
          
          <div className="mt-10 border-t pt-8">
            <div className="text-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/nft-collection">
                  <BarChart3 className="h-5 w-5" />
                  Go to NFT Dashboard
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                View your collection, mint new NFTs, and contribute to the token pool
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SystemOverview() {
  const features = [
    {
      icon: Sparkles,
      title: "Earn NFTs",
      description: "Earn NFTs by hitting emotional milestones in your MoodSync journey."
    },
    {
      icon: Coins,
      title: "Mint Them",
      description: "Use your accumulated tokens to mint NFTs and activate their special bonuses."
    },
    {
      icon: Flame,
      title: "Burn for Impact",
      description: "Burn minted NFTs to contribute to the community token pool."
    },
    {
      icon: Trophy,
      title: "Get Ranked",
      description: "Top contributors receive rewards when the pool reaches its target."
    },
    {
      icon: Heart,
      title: "Support Charity",
      description: "15% of each pool distribution goes to mental health organizations."
    },
    {
      icon: Gift,
      title: "Gift NFTs",
      description: "Share your emotional milestones with friends (one-time per NFT)."
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-card to-accent/10 border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-3">How It Works</h2>
        <p className="mb-6">
          The MoodSync Token Pool System is a unique way to reward community participation while making a real-world impact. Here's how it works in a nutshell:
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon} 
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-3">Example User Journey</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-4">
              <div className="font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded mr-2">Day 7</span>
                <span>Earning Your First NFT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You complete a 7-day streak of emotional journaling and earn your first unminted NFT: 
                <span className="text-foreground font-medium">"Consistency Seed"</span>.
                A notification appears congratulating you on your achievement.
              </p>
            </div>
            
            <div className="p-4">
              <div className="font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded mr-2">Day 10</span>
                <span>Minting Your NFT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                With 350 tokens saved up, you mint your "Consistency Seed" NFT. This activates its 
                bonus: <span className="text-foreground font-medium">+5% token earnings for 1 week</span>. 
                You share your achievement on social media.
              </p>
            </div>
            
            <div className="p-4">
              <div className="font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded mr-2">Day 30</span>
                <span>Contributing to the Pool</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You decide to burn two of your minted NFTs, contributing 700 tokens to the community 
                pool. This bumps you to <span className="text-foreground font-medium">rank #32 on the leaderboard</span>,
                placing you in the top 50 contributors.
              </p>
            </div>
            
            <div className="p-4">
              <div className="font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded mr-2">Pool Goal Met</span>
                <span>Receiving Rewards</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The pool reaches its 1,000,000 token target. As a top 50 contributor, you receive 
                <span className="text-foreground font-medium"> 8,500 tokens</span> as a reward. 
                You also receive a notification that your contribution helped donate $150 to mental health charities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <div className="flex items-start">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function NftExplanation() {
  const nftTypes = [
    {
      name: "Consistency Seed",
      rarity: "Uncommon",
      emotion: "Neutral",
      earned: "7-day journal streak",
      bonus: "+5% token earnings for 1 week"
    },
    {
      name: "Breakthrough Spark",
      rarity: "Rare",
      emotion: "Happy",
      earned: "First major emotional insight",
      bonus: "Unlocks special journal templates"
    },
    {
      name: "Resilience Stone",
      rarity: "Uncommon",
      emotion: "Sad",
      earned: "Tracking sad emotions for 5 days",
      bonus: "+10% tokens for tracking difficult emotions"
    },
    {
      name: "Community Star",
      rarity: "Rare",
      emotion: "Excited",
      earned: "Helping 10 other community members",
      bonus: "Highlighted comments in community forums"
    },
    {
      name: "Mindfulness Master",
      rarity: "Legendary",
      emotion: "Neutral",
      earned: "Completing 30 mindfulness exercises",
      bonus: "Exclusive meditation content + 20% token bonus"
    }
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            About Emotional NFTs
          </CardTitle>
          <CardDescription>
            Digital collectibles representing your emotional milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            MoodSync's Emotional NFTs are digital collectibles that represent significant emotional milestones in your wellness journey. 
            Unlike traditional NFTs, these are <span className="font-medium">Soulbound Tokens</span> - meaning they're tied to your 
            emotional journey and represent your personal growth.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                How to Earn NFTs
              </h3>
              <p className="text-sm text-muted-foreground">
                NFTs are automatically generated based on your activity in the app. Keep an eye on your 
                notifications for announcements about new NFTs you've earned through your emotional journey.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                How to Mint NFTs
              </h3>
              <p className="text-sm text-muted-foreground">
                Minting an NFT costs 350 tokens. Once minted, its bonuses become active, allowing you to 
                benefit from special features, increased token earnings, or exclusive content access.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Evolution Mechanics
              </h3>
              <p className="text-sm text-muted-foreground">
                NFTs evolve as you continue your emotional journey, with visuals that transform based on your 
                progress. Higher evolution levels grant improved bonuses and rarer visual effects.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Gifting & Privacy
              </h3>
              <p className="text-sm text-muted-foreground">
                Each minted NFT can be gifted once to another user. All NFTs employ Zero-Knowledge Proofs to allow 
                you to prove ownership without revealing private emotional data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Examples of Emotional NFTs</CardTitle>
          <CardDescription>
            These are some of the NFTs you can earn on your emotional wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-3 px-4">NFT Name</th>
                  <th className="text-left py-3 px-4">Rarity</th>
                  <th className="text-left py-3 px-4">Emotion</th>
                  <th className="text-left py-3 px-4">How to Earn</th>
                  <th className="text-left py-3 px-4">Bonus Effect</th>
                </tr>
              </thead>
              <tbody>
                {nftTypes.map((nft, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="py-3 px-4 font-medium">{nft.name}</td>
                    <td className="py-3 px-4">{nft.rarity}</td>
                    <td className="py-3 px-4">{nft.emotion}</td>
                    <td className="py-3 px-4">{nft.earned}</td>
                    <td className="py-3 px-4">{nft.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This is just a small sampling of the many NFTs that can be earned. New NFT types are 
            regularly added to reflect different emotional milestones and achievements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PoolMechanics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Token Pool Mechanics
          </CardTitle>
          <CardDescription>
            How the community token pool works and rewards contributors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Token Pool is a community-driven system where users can contribute by burning their minted NFTs. 
            When the pool reaches its target, rewards are distributed to top contributors and charities.
          </p>
          
          <div className="border rounded-lg p-5 space-y-4">
            <h3 className="font-medium text-lg">Key Numbers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">BURN VALUE</div>
                <div className="text-xl font-semibold">350 tokens</div>
                <div className="text-xs text-muted-foreground mt-1">per NFT burned</div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">POOL TARGET</div>
                <div className="text-xl font-semibold">1,000,000 tokens</div>
                <div className="text-xs text-muted-foreground mt-1">before distribution</div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">TOP CONTRIBUTORS</div>
                <div className="text-xl font-semibold">85% of pool</div>
                <div className="text-xs text-muted-foreground mt-1">to top 50 contributors</div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">CHARITY DONATION</div>
                <div className="text-xl font-semibold">15% of pool</div>
                <div className="text-xs text-muted-foreground mt-1">to mental health organizations</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">How Distribution Works</h3>
            
            <ol className="space-y-3 list-decimal pl-5">
              <li>
                <span className="font-medium">Contribution Phase:</span> Users burn their minted NFTs, adding 350 tokens per NFT to the pool.
              </li>
              <li>
                <span className="font-medium">Leaderboard Tracking:</span> A real-time leaderboard tracks all contributors and their rankings.
              </li>
              <li>
                <span className="font-medium">Distribution Trigger:</span> When the pool reaches 1,000,000 tokens, distribution is prepared.
              </li>
              <li>
                <span className="font-medium">Top 50 Rewards:</span> The top 50 contributors each receive 8,500 tokens (17,000 total per contributor).
              </li>
              <li>
                <span className="font-medium">Charity Impact:</span> 15% of the pool (150,000 tokens) is converted to real money at a rate of $0.0010 per token and donated to mental health organizations.
              </li>
              <li>
                <span className="font-medium">New Round:</span> A new pool round begins automatically with the same mechanics.
              </li>
            </ol>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-2 mr-3">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Why Participate?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  By burning NFTs, you not only contribute to mental health charities but also have the chance 
                  to multiply your token investment if you rank in the top 50. For example, burning 2 NFTs (700 tokens) 
                  could reward you with 8,500 tokens - a 12x return.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transparency & Tracking</CardTitle>
          <CardDescription>
            How we ensure fair and transparent pool operation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Real-Time Leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                The token pool leaderboard is updated in real-time, showing the rank, 
                username, and token amount for all contributors. Your current position is 
                highlighted for easy reference.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Burn Transaction Records</h3>
              <p className="text-sm text-muted-foreground">
                Every NFT burn transaction is recorded and visible in your activity history. 
                Each contribution shows the NFT details, token amount, and timestamp.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Charity Donation Reports</h3>
              <p className="text-sm text-muted-foreground">
                When pool distributions occur, detailed reports are published showing 
                exactly how much was donated to which mental health organizations, complete with 
                transaction receipts.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Distribution Notifications</h3>
              <p className="text-sm text-muted-foreground">
                All users receive notifications when a pool distribution occurs, with personalized 
                information for contributors about their rewards and the charity impact they helped create.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" asChild className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium">
            <Link to="/nft-collection">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Current Pool Status
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function FrequentlyAskedQuestions() {
  const faqs = [
    {
      question: "How do I earn emotional NFTs?",
      answer: "Emotional NFTs are automatically generated based on your activities within the app. This includes maintaining journal streaks, reaching emotional insights, completing challenges, and hitting other emotional wellness milestones. You'll receive notifications when new NFTs are available."
    },
    {
      question: "What's the difference between minted and unminted NFTs?",
      answer: "Unminted NFTs are earned but not yet activated. They don't provide any bonuses until you mint them by spending 350 emotion tokens. Once minted, NFTs activate their special bonuses, can be displayed in your profile, and can be burned or gifted."
    },
    {
      question: "How do I benefit from burning my NFTs?",
      answer: "When you burn a minted NFT, you contribute 350 tokens to the community pool and improve your ranking on the contributor leaderboard. If you rank in the top 50 contributors when the pool hits its target, you'll receive 8,500 tokens - which is more than 24x the original contribution."
    },
    {
      question: "Can I transfer my NFTs to external wallets?",
      answer: "No, MoodSync's Emotional NFTs are Soulbound Tokens, meaning they're tied to your emotional journey within the platform. While you can gift each NFT once to another MoodSync user, they cannot be transferred to external wallets or marketplaces."
    },
    {
      question: "Do NFTs reveal my private emotional data?",
      answer: "No, your privacy is protected. While NFTs represent emotional milestones, they use Zero-Knowledge Proofs that allow you to prove ownership and achievement without revealing the private details of your emotional data. You control visibility settings for all your NFTs."
    },
    {
      question: "How are charity organizations selected?",
      answer: "The mental health organizations that receive donations are selected quarterly through community voting. Premium members can nominate organizations, and all users can vote on which ones will receive donations in the upcoming period. All selected organizations must have verifiable non-profit status and transparent operations."
    },
    {
      question: "What happens if I'm not in the top 50 contributors?",
      answer: "While the top 50 contributors receive token rewards, all contributors benefit from the charitable impact their burned NFTs create. Additionally, contributing to the pool earns you special badges visible on your profile, and you'll be credited in the charity impact reports."
    },
    {
      question: "Can I earn tokens back after burning an NFT?",
      answer: "Yes! If you rank in the top 50 contributors when the pool reaches its target, you'll receive 8,500 tokens in distribution - significantly more than the 350 tokens it cost to burn each NFT. This creates an incentive to participate in the community pool."
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/20 rounded-xl p-6 border">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Common questions about the NFT and token pool system
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/10 py-4">
              <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-muted/20 rounded-xl p-6 border mt-8">
        <h3 className="font-semibold mb-2">Still Have Questions?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you have other questions about the NFT collection or token pool system, check out our detailed help center or reach out to support.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90" asChild>
            <Link href="/help-center">
              <ExternalLink className="h-4 w-4" />
              Help Center
            </Link>
          </Button>
          <Button variant="secondary" className="gap-2 border border-primary/30" asChild>
            <Link href="/contact-support">
              <HelpCircle className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}