import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MoodBackgroundDemo } from '@/components/mood-background/mood-background-demo';
import { ProgressVisualization } from '@/components/gamification/progress-visualization';
import { TokenMilestoneConfetti } from '@/components/confetti/token-milestone-confetti';
import { EmojiReactionSystem } from '@/components/emoji-reactions/emoji-reaction-system';
import AnimatedShareButton from '@/components/share/animated-share-button';
import NftFeatures from '@/components/premium-features/nft-features';
import { WellnessTipsFeature } from '@/components/premium-features/wellness-tips-feature';
import { VipFeatures } from '@/components/premium-features/vip-features';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MoodSwingerSection } from '@/components/mood-games/mood-swinger-section';
import { HealthServicesAdsSection } from '@/components/premium-ads/health-services-ad';
import { PremiumVerification } from '@/components/verification/premium-verification';
import { 
  Crown, 
  Sparkles,
  Palette,
  Trophy,
  PartyPopper,
  SmilePlus,
  Share2,
  Fingerprint,
  ChevronRight,
  Lock, 
  AlertTriangle,
  Gamepad2 as GameController,
  LucideMessageSquare,
  ShieldCheck,
  BadgeCheck,
  MegaphoneIcon,
  Award,
  Heart,
  Leaf,
  Star
} from 'lucide-react';

export default function PremiumFeaturesPage() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [activeTab, setActiveTab] = useState('vip-features');
  const [, setLocation] = useLocation();
  
  // Premium features list with icons and descriptions
  const premiumFeatures = [
    {
      id: 'vip-features',
      title: 'VIP Features',
      description: 'Exclusive premium tiers with advanced features for enhanced emotional wellness',
      icon: <Crown className="h-5 w-5" />,
      component: <VipFeatures />
    },
    {
      id: 'mood-backgrounds',
      title: 'Mood-Synced Backgrounds',
      description: 'Dynamic background colors that transition based on your emotional state',
      icon: <Palette className="h-5 w-5" />,
      component: <MoodBackgroundDemo />
    },
    {
      id: 'progress-visualization',
      title: 'Interactive Gamification',
      description: 'Animated progress tracking and gamification elements',
      icon: <Trophy className="h-5 w-5" />,
      component: <ProgressVisualization />
    },
    {
      id: 'token-confetti',
      title: 'Celebration Effects',
      description: 'Personalized confetti bursts when reaching token milestones',
      icon: <PartyPopper className="h-5 w-5" />,
      component: <TokenMilestoneConfetti />
    },
    {
      id: 'emoji-reactions',
      title: 'Emoji Reaction System',
      description: 'Enhanced emoji reactions for more nuanced emotional responses',
      icon: <SmilePlus className="h-5 w-5" />,
      component: <EmojiReactionSystem />
    },
    {
      id: 'share-buttons',
      title: 'Animated Sharing',
      description: 'Animated social share buttons for your achievements and milestones',
      icon: <Share2 className="h-5 w-5" />,
      component: (
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-medium text-center mb-4">Share Your Achievements</h3>
          <p className="text-sm text-gray-500 mb-4">
            Share your token milestones, achievements, and emotional progress with your social networks.
          </p>
          <div className="flex justify-center">
            <AnimatedShareButton
              url={window.location.href}
              title="MoodSync Premium Feature"
              message="Check out this amazing feature on MoodSync! #EmotionalWellness"
              milestone={1000}
            />
          </div>
        </div>
      )
    },
    {
      id: 'emotional-imprints',
      title: 'Emotional Imprints',
      description: 'Create and share multi-sensory snapshots of your emotional states',
      icon: <Fingerprint className="h-5 w-5" />,
      onView: () => setLocation('/emotional-imprints')
    },
    {
      id: 'mood-swinger',
      title: 'Mood Swinger Games',
      description: 'Play games designed to calm your mind and improve your mood while earning tokens',
      icon: <GameController className="h-5 w-5" />,
      component: <MoodSwingerSection />
    },
    {
      id: 'wellness-tips',
      title: 'Daily Wellness Tips',
      description: 'Evidence-based daily tips for improving mental health and emotional wellness',
      icon: <Heart className="h-5 w-5" />,
      component: <WellnessTipsFeature />
    },
    {
      id: 'nft-collections',
      title: 'Exclusive NFTs',
      description: 'Collect, mint, and trade unique digital assets that celebrate your emotional wellness journey',
      icon: <Award className="h-5 w-5" />,
      component: <NftFeatures />
    },
    {
      id: 'health-ads',
      title: 'Health Services Ads',
      description: 'Advertise your health-related services or find services offered by other premium members',
      icon: <MegaphoneIcon className="h-5 w-5" />,
      component: <HealthServicesAdsSection />
    },
    {
      id: 'verification',
      title: 'Premium Verification',
      description: 'Verify your identity to increase credibility and trust within the community',
      icon: <BadgeCheck className="h-5 w-5" />,
      component: <PremiumVerification />
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
          Premium Features
        </Badge>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Enhance Your Emotional Journey
        </h1>
        
        <p className="text-gray-600 max-w-2xl mb-6">
          Discover the premium features that will take your emotional wellness experience to the next level with interactive animations, personalized effects, and enhanced sharing capabilities.
        </p>
        
        {!isPremium && (
          <Alert className="max-w-2xl border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You're viewing premium features in demo mode. Upgrade to premium to unlock these features.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="mb-12">
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <TabsList className="grid grid-cols-5 md:grid-cols-10 gap-1">
              {premiumFeatures.map(feature => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="flex flex-col items-center gap-1 py-3 px-3 data-[state=active]:bg-primary/10"
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {feature.icon}
                  </div>
                  <span className="text-xs text-center line-clamp-1">
                    {feature.title.split(' ')[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {premiumFeatures.map(feature => (
            <TabsContent key={feature.id} value={feature.id} className="mt-0">
              {feature.component ? (
                feature.component
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 max-w-md text-center">{feature.description}</p>
                  <Button 
                    onClick={feature.onView}
                    className="flex items-center"
                  >
                    View Feature
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Premium Plans Banner */}
      <Card className="p-8 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-0 mt-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center mb-3">
              <Crown className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
            </div>
            <p className="text-gray-600 max-w-xl">
              Unlock all premium features and take your emotional wellness journey to the next level with enhanced animations, personalized effects, and advanced tools.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
              onClick={() => setLocation('/premium')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              See Premium Plans
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/premium/compare')}
            >
              Compare Features
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}