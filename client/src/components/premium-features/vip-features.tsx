import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  BarChart4,
  Medal,
  Palette,
  Clock,
  Globe,
  Users,
  Trophy,
  ShoppingBag,
  Sparkles,
  Bot,
  Crown,
  ChevronRight,
  Lock
} from 'lucide-react';

// Define tier interfaces
interface TierFeatures {
  name: string;
  included: boolean;
  details?: string;
}

interface PriceTier {
  name: string;
  price: string;
  color: string;
  badgeColor: string;
  features: Record<string, TierFeatures>;
}

export function VipFeatures() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [activeTab, setActiveTab] = React.useState('gold');
  const [, setLocation] = useLocation();

  // VIP feature tiers
  const tiers: PriceTier[] = [
    {
      name: 'Gold',
      price: '$9.99/month',
      color: 'from-amber-400 to-amber-600',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      features: {
        aiTherapist: {
          name: 'AI Therapist Companion',
          included: true,
          details: 'Personalized CBT/DBT coaching via chat with voice mood analysis'
        },
        insights: {
          name: 'Basic Personalized Insights',
          included: true,
          details: 'Regular mood pattern reports to understand your emotional journey'
        },
        nfts: {
          name: 'Golden Emotion NFTs',
          included: true,
          details: 'Animated badges for elite milestones like "365-Day Streak"'
        },
        customization: {
          name: 'Basic Customization',
          included: true,
          details: 'Custom color themes and ambient soundscapes'
        },
        journal: {
          name: 'Time Machine Journal',
          included: true,
          details: 'Visualize growth with AI-generated "Then vs. Now" comparisons'
        },
        moodMap: {
          name: 'Global Mood Map',
          included: true,
          details: 'View emotion heatmaps by region'
        },
        family: {
          name: 'Basic Family Features',
          included: false
        },
        vipChallenges: {
          name: 'Basic VIP Challenges',
          included: true,
          details: 'Access to premium challenges with token rewards'
        },
        irlPerks: {
          name: 'Basic IRL Perks',
          included: true,
          details: 'MoodSync digital merch drops'
        },
        aiClone: {
          name: 'AI Self-Reflection',
          included: false
        },
        corporate: {
          name: 'Corporate Dashboard',
          included: false
        }
      }
    },
    {
      name: 'Platinum',
      price: '$14.99/month',
      color: 'from-slate-400 to-slate-600',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      features: {
        aiTherapist: {
          name: 'Advanced AI Therapist',
          included: true,
          details: 'Enhanced coaching with personalized exercises and progress tracking'
        },
        insights: {
          name: 'Deep Personalized Insights',
          included: true,
          details: '"Mood Genome" report with detailed analysis of emotional triggers'
        },
        nfts: {
          name: 'Premium Emotion NFTs',
          included: true,
          details: 'Enhanced animated badges with more detail and customization'
        },
        customization: {
          name: 'Advanced Customization',
          included: true,
          details: 'Custom UI design and AI avatar for mood-based chat rooms'
        },
        journal: {
          name: 'Enhanced Time Machine',
          included: true,
          details: 'Future Self letters and advanced journal analytics'
        },
        moodMap: {
          name: 'Global Mood Map+',
          included: true,
          details: 'Real-time emotion heatmaps by profession/city with crisis avoidance alerts'
        },
        family: {
          name: 'Family Plan Features',
          included: true,
          details: '"Guardian Mode" for gentle nudges when loved ones show prolonged distress'
        },
        vipChallenges: {
          name: 'Premium VIP Challenges',
          included: true,
          details: '"Emotional Marathon" 90-day quests with real prizes'
        },
        irlPerks: {
          name: 'Premium IRL Perks',
          included: true,
          details: 'MoodSync physical merch and partner discounts'
        },
        aiClone: {
          name: 'AI Self-Reflection',
          included: false
        },
        corporate: {
          name: 'Corporate Dashboard',
          included: false
        }
      }
    },
    {
      name: 'Diamond',
      price: '$17.99/month',
      color: 'from-sky-400 to-blue-600',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      features: {
        aiTherapist: {
          name: 'Elite AI Therapist',
          included: true,
          details: 'Top-tier coaching with priority response and personalized wellness program'
        },
        insights: {
          name: 'Ultimate Personalized Insights',
          included: true,
          details: 'Relationship analytics to compare moods with partner/family (with consent)'
        },
        nfts: {
          name: 'Diamond-Tier Emotion NFTs',
          included: true,
          details: '3D holographic NFTs that react to your current mood and IRL art drops'
        },
        customization: {
          name: 'Ultimate Customization',
          included: true,
          details: 'Fully customizable UI with exclusive themes only for Diamond members'
        },
        journal: {
          name: 'Ultimate Time Machine',
          included: true,
          details: 'Advanced emotional analysis with predictive mood forecasting'
        },
        moodMap: {
          name: 'Elite Global Mood Insights',
          included: true,
          details: 'Comprehensive emotional intelligence reports with personalized recommendations'
        },
        family: {
          name: 'Elite Family Features',
          included: true,
          details: 'Token gifting with 100 bonus tokens per entry and family wellness analytics'
        },
        vipChallenges: {
          name: 'Elite VIP Challenges',
          included: true,
          details: 'Exclusive challenges with premium rewards and elite leaderboards'
        },
        irlPerks: {
          name: 'Elite IRL Perks',
          included: true,
          details: 'Premium partner benefits and exclusive wellness retreat discounts'
        },
        aiClone: {
          name: 'AI Clone for Self-Reflection',
          included: true,
          details: 'Train a private AI twin that mimics your speech patterns for self-reflection'
        },
        corporate: {
          name: 'Corporate Wellness Dashboard',
          included: true,
          details: 'Anonymous workplace analytics and CEO-level reports for mental health advocacy'
        }
      }
    },
    {
      name: 'Legacy',
      price: '$499/year',
      color: 'from-purple-400 to-purple-700',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: {
        aiTherapist: {
          name: 'Premium AI Therapist',
          included: true,
          details: 'All Diamond features plus quarterly consultation with a wellness expert'
        },
        insights: {
          name: 'Legacy Insights',
          included: true,
          details: 'All Diamond features plus generational wellness tracking'
        },
        nfts: {
          name: 'Legacy Emotion NFTs',
          included: true,
          details: 'All Diamond features plus exclusive legacy-only collections'
        },
        customization: {
          name: 'Legacy Customization',
          included: true,
          details: 'All Diamond features plus dedicated UI designer consultation'
        },
        journal: {
          name: 'Legacy Time Machine',
          included: true,
          details: 'All Diamond features plus personalized children\'s book explaining your emotional growth journey'
        },
        moodMap: {
          name: 'Legacy Global Insights',
          included: true,
          details: 'All Diamond features plus participation in research initiatives'
        },
        family: {
          name: 'Legacy Family Features',
          included: true,
          details: 'All Diamond features plus up to 10 family members (standard 5)'
        },
        vipChallenges: {
          name: 'Legacy VIP Challenges',
          included: true,
          details: 'All Diamond features plus ability to create custom community challenges'
        },
        irlPerks: {
          name: 'Legacy IRL Perks',
          included: true,
          details: 'All Diamond features plus annual "MoodSync Originals" podcast feature'
        },
        aiClone: {
          name: 'Legacy AI Clone',
          included: true,
          details: 'All Diamond features plus advanced conversation simulation capabilities'
        },
        corporate: {
          name: 'Legacy Corporate Tools',
          included: true,
          details: 'All Diamond features plus enterprise-level reporting and consulting'
        }
      }
    }
  ];

  // Feature categories
  const featureCategories = [
    {
      id: 'ai',
      name: 'AI-Powered Features',
      icon: <Brain className="h-5 w-5" />,
      features: ['aiTherapist', 'aiClone']
    },
    {
      id: 'insights',
      name: 'Personalized Insights',
      icon: <BarChart4 className="h-5 w-5" />,
      features: ['insights']
    },
    {
      id: 'nfts',
      name: 'Exclusive NFTs',
      icon: <Medal className="h-5 w-5" />,
      features: ['nfts']
    },
    {
      id: 'customization',
      name: 'Advanced Customization',
      icon: <Palette className="h-5 w-5" />,
      features: ['customization']
    },
    {
      id: 'journal',
      name: 'Time Machine Journal',
      icon: <Clock className="h-5 w-5" />,
      features: ['journal']
    },
    {
      id: 'global',
      name: 'Global Mood Features',
      icon: <Globe className="h-5 w-5" />,
      features: ['moodMap']
    },
    {
      id: 'family',
      name: 'Family Plan Features',
      icon: <Users className="h-5 w-5" />,
      features: ['family']
    },
    {
      id: 'challenges',
      name: 'VIP Challenges',
      icon: <Trophy className="h-5 w-5" />,
      features: ['vipChallenges']
    },
    {
      id: 'perks',
      name: 'Real-World Perks',
      icon: <ShoppingBag className="h-5 w-5" />,
      features: ['irlPerks']
    },
    {
      id: 'corporate',
      name: 'Corporate Tools',
      icon: <BarChart4 className="h-5 w-5" />,
      features: ['corporate']
    }
  ];

  return (
    <div className="py-6">
      <div className="text-center mb-10">
        <Badge
          className="mb-2 px-3 py-1 inline-flex items-center bg-gradient-to-r from-amber-400 to-purple-600 text-white border-0"
        >
          <Crown className="h-3.5 w-3.5 mr-1" />
          Exclusive VIP Access
        </Badge>
        <h1 className="text-3xl font-bold mb-3">Premium Membership Tiers</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock exclusive features designed to enhance your emotional wellness journey with our premium membership tiers.
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-12"
      >
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-4 gap-2 p-1">
            {tiers.map((tier) => (
              <TabsTrigger
                key={tier.name.toLowerCase()}
                value={tier.name.toLowerCase()}
                className="flex flex-col items-center gap-1 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--${tier.name.toLowerCase()}-gradient-from), var(--${tier.name.toLowerCase()}-gradient-to))`,
                  color: 'transparent',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text'
                }}
                data-state={activeTab === tier.name.toLowerCase() ? 'active' : 'inactive'}
              >
                <Crown className="h-5 w-5 mb-1" />
                <span className="font-semibold">{tier.name}</span>
                <span className="text-xs opacity-90">{tier.price}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tiers.map((tier) => (
          <TabsContent
            key={tier.name.toLowerCase()}
            value={tier.name.toLowerCase()}
            className="mt-0 space-y-6"
          >
            <Card className={`border-0 overflow-hidden shadow-xl`}>
              <CardHeader className={`bg-gradient-to-r ${tier.color} text-white`}>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-2xl">{tier.name} Tier</CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {tier.price}
                  </Badge>
                </div>
                <CardDescription className="text-white/90">
                  {tier.name === 'Gold' && 'Essential premium features for enhancing your emotional wellness journey'}
                  {tier.name === 'Platinum' && 'Comprehensive premium features with enhanced capabilities and family support'}
                  {tier.name === 'Diamond' && 'Ultimate premium experience with exclusive features and advanced personalization'}
                  {tier.name === 'Legacy' && 'The complete lifetime package with all features and exclusive legacy benefits'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  {featureCategories.map((category) => {
                    // Only show categories that have at least one feature for this tier
                    const hasFeatures = category.features.some(
                      (f) => tier.features[f] && (tier.features[f].included || false)
                    );
                    
                    if (!hasFeatures) return null;
                    
                    return (
                      <div key={category.id}>
                        <h3 className="font-medium text-lg flex items-center mb-3">
                          {category.icon}
                          <span className="ml-2">{category.name}</span>
                        </h3>
                        <ul className="space-y-3">
                          {category.features.map((featureKey) => {
                            const feature = tier.features[featureKey];
                            if (!feature) return null;
                            
                            return feature.included ? (
                              <li key={featureKey} className="flex">
                                <span className="h-6 w-6 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                <div>
                                  <p className="font-medium">{feature.name}</p>
                                  {feature.details && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                      {feature.details}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ) : (
                              <li key={featureKey} className="flex opacity-50">
                                <span className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mr-2">
                                  <Lock className="h-3 w-3" />
                                </span>
                                <p className="font-medium text-gray-400">{feature.name} (Not Included)</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className={`bg-gradient-to-r ${tier.color} text-white hover:opacity-90 transition-opacity`}
                      onClick={() => setLocation('/premium')}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isPremium ? 'Upgrade to ' + tier.name : 'Subscribe Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {tier.name === 'Gold' && (
              <p className="text-center text-muted-foreground italic">
                Get started with our essential VIP features
              </p>
            )}
            
            {tier.name === 'Platinum' && (
              <p className="text-center text-muted-foreground italic">
                Our most popular tier with comprehensive features
              </p>
            )}
            
            {tier.name === 'Diamond' && (
              <p className="text-center text-muted-foreground italic">
                The ultimate premium experience with exclusive features
              </p>
            )}
            
            {tier.name === 'Legacy' && (
              <p className="text-center text-muted-foreground italic">
                Our elite tier with lifetime benefits and exclusive content
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Why Upgrade to VIP?</h2>
          <p className="text-gray-600 dark:text-gray-400">
            "Upgrade to VIP—where your emotions unlock a world even your therapist hasn't seen."
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1" /> 
              Exclusivity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Premium features that provide exceptional value in your emotional wellness journey.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-1" /> 
              Holistic
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Covers both digital experiences and real-world benefits for complete emotional support.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <Bot className="h-4 w-4 mr-1" /> 
              Ethics-First
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No "paywall therapy"—just enhanced tools to supplement your wellness journey.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setLocation('/premium')} 
              className="bg-primary hover:bg-primary/90"
            >
              <Crown className="mr-2 h-4 w-4" />
              Explore Premium Plans
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setLocation('/premium/compare')} 
              variant="outline"
            >
              Compare All Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom CSS variables for gradient colors
document.documentElement.style.setProperty('--gold-gradient-from', '#f59e0b');
document.documentElement.style.setProperty('--gold-gradient-to', '#d97706');
document.documentElement.style.setProperty('--platinum-gradient-from', '#94a3b8');
document.documentElement.style.setProperty('--platinum-gradient-to', '#64748b');
document.documentElement.style.setProperty('--diamond-gradient-from', '#38bdf8');
document.documentElement.style.setProperty('--diamond-gradient-to', '#2563eb');
document.documentElement.style.setProperty('--legacy-gradient-from', '#a855f7');
document.documentElement.style.setProperty('--legacy-gradient-to', '#7e22ce');