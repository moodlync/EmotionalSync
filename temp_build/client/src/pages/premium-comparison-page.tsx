import React, { useState } from 'react';
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
  Star,
  Check,
  X,
  CreditCard,
  Calendar,
  Plus,
  Infinity,
  Zap,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define tier interfaces
interface TierFeature {
  name: string;
  included: boolean;
  details?: string;
}

interface PriceTier {
  id: string;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  price: {
    monthly: string;
    quarterly?: string;
    yearly: string;
    fiveYears?: string;
    lifetime: string;
  };
  popular?: boolean;
  color: string;
  gradientClass: string;
  features: Record<string, TierFeature>;
}

interface FeatureCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

// Premium plans comparison view types
type ViewType = 'individual' | 'family';
type DurationView = 'monthly' | 'quarterly' | 'yearly' | 'fiveYears' | 'lifetime';

export default function PremiumComparisonPage() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [viewType, setViewType] = useState<ViewType>('individual');
  const [durationView, setDurationView] = useState<DurationView>('monthly');
  const [, setLocation] = useLocation();

  // Individual tiers
  const individualTiers: PriceTier[] = [
    {
      id: 'trial',
      name: 'Free Trial',
      description: 'Experience the basic features of MoodSync',
      badge: 'Basic',
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
      price: {
        monthly: 'Free',
        yearly: 'Free',
        lifetime: 'Free'
      },
      color: 'gray',
      gradientClass: 'from-gray-400 to-gray-600',
      features: {
        emotionTracking: {
          name: 'Basic Emotion Tracking',
          included: true,
          details: 'Track your daily emotions with basic analytics'
        },
        journaling: {
          name: 'Simple Journal',
          included: true,
          details: 'Limited journal entries and basic templates'
        },
        moodRooms: {
          name: 'Public Mood Rooms',
          included: true,
          details: 'Access to public mood-based chat rooms'
        },
        challenges: {
          name: 'Basic Challenges',
          included: true,
          details: 'Access to standard challenges and basic rewards'
        },
        tokenEarning: {
          name: 'Basic Token Earning',
          included: true,
          details: 'Earn tokens at standard rate'
        },
        aiTherapist: {
          name: 'AI Therapist',
          included: false
        },
        insights: {
          name: 'Personalized Insights',
          included: false
        },
        nfts: {
          name: 'Emotional NFTs',
          included: false
        },
        customization: {
          name: 'Advanced Customization',
          included: false
        },
        journal: {
          name: 'Time Machine Journal',
          included: false
        },
        moodMap: {
          name: 'Global Mood Map',
          included: false
        },
        family: {
          name: 'Family Features',
          included: false
        },
        vipChallenges: {
          name: 'VIP Challenges',
          included: false
        },
        irlPerks: {
          name: 'Real-World Perks',
          included: false
        },
        aiClone: {
          name: 'AI Self-Reflection',
          included: false
        },
        videoEditor: {
          name: 'AI Video Editor',
          included: false
        },
        verification: {
          name: 'Premium Verification',
          included: false
        },
        ads: {
          name: 'Health Services Ads',
          included: false
        },
        tokenRate: {
          name: 'Token Earning Rate',
          included: true,
          details: '1x (Standard)'
        }
      }
    },
    {
      id: 'gold',
      name: 'Gold',
      description: 'Essential premium features for enhancing your emotional wellness journey',
      badge: 'Popular',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      price: {
        monthly: '$9.99/mo',
        quarterly: '$14.99/3mo',
        yearly: '$49.99/yr',
        fiveYears: '$199.99/5yr',
        lifetime: '$249.99'
      },
      popular: true,
      color: 'amber',
      gradientClass: 'from-amber-400 to-amber-600',
      features: {
        emotionTracking: {
          name: 'Advanced Emotion Tracking',
          included: true,
          details: 'Enhanced tracking with detailed analytics and patterns'
        },
        journaling: {
          name: 'Advanced Journal',
          included: true,
          details: 'Unlimited journal entries with premium templates'
        },
        moodRooms: {
          name: 'All Mood Rooms',
          included: true,
          details: 'Access to all mood-based chat rooms including private ones'
        },
        challenges: {
          name: 'Premium Challenges',
          included: true,
          details: 'Access to premium challenges with enhanced rewards'
        },
        tokenEarning: {
          name: 'Enhanced Token Earning',
          included: true,
          details: 'Earn tokens at 2x the standard rate'
        },
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
          included: false,
          details: 'Only included with yearly, 5-year and lifetime plans'
        },
        customization: {
          name: 'Basic Customization',
          included: false,
          details: 'Only included with yearly, 5-year and lifetime plans'
        },
        journal: {
          name: 'Time Machine Journal',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        moodMap: {
          name: 'Global Mood Map',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        family: {
          name: 'Basic Family Features',
          included: false
        },
        vipChallenges: {
          name: 'VIP Challenges',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        irlPerks: {
          name: 'Real-World Perks',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        aiClone: {
          name: 'AI Self-Reflection',
          included: false
        },
        videoEditor: {
          name: 'AI Video Editor',
          included: true,
          details: 'Create professional videos with basic AI editing tools'
        },
        verification: {
          name: 'Premium Verification',
          included: false,
          details: 'Only included with yearly, 5-year and lifetime plans'
        },
        ads: {
          name: 'Health Services Ads',
          included: false,
          details: 'Only included with yearly, 5-year and lifetime plans'
        },
        tokenRate: {
          name: 'Token Earning Rate',
          included: true,
          details: '2x Standard'
        }
      }
    },
    {
      id: 'platinum',
      name: 'Platinum',
      description: 'Comprehensive premium features with enhanced capabilities and family support',
      price: {
        monthly: '$14.99/mo',
        quarterly: '$29.99/3mo',
        yearly: '$79.99/yr',
        fiveYears: '$299.99/5yr',
        lifetime: '$349.99'
      },
      color: 'slate',
      gradientClass: 'from-slate-400 to-slate-600',
      features: {
        emotionTracking: {
          name: 'Professional Emotion Tracking',
          included: true,
          details: 'Full-spectrum tracking with advanced analytics and insights'
        },
        journaling: {
          name: 'Professional Journal',
          included: true,
          details: 'Enhanced journal with AI-guided reflections and premium templates'
        },
        moodRooms: {
          name: 'VIP Mood Rooms',
          included: true,
          details: 'Access to all rooms plus exclusive platinum-only rooms'
        },
        challenges: {
          name: 'Premium+ Challenges',
          included: true,
          details: 'Access to all challenges including exclusive platinum ones'
        },
        tokenEarning: {
          name: 'Superior Token Earning',
          included: true,
          details: 'Earn tokens at 3x the standard rate'
        },
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
          name: 'Time Machine Journal',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        moodMap: {
          name: 'Global Mood Map',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        family: {
          name: 'Family Plan Features',
          included: true,
          details: '"Guardian Mode" for gentle nudges when loved ones show prolonged distress'
        },
        vipChallenges: {
          name: 'VIP Challenges',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        irlPerks: {
          name: 'Real-World Perks',
          included: false,
          details: 'Available only in Diamond and Legacy tiers'
        },
        aiClone: {
          name: 'AI Self-Reflection',
          included: false
        },
        videoEditor: {
          name: 'Enhanced AI Video Editor',
          included: true,
          details: 'Create and edit professional videos with advanced AI tools'
        },
        verification: {
          name: 'Premium Verification',
          included: true,
          details: 'Get verified with a platinum premium badge'
        },
        ads: {
          name: 'Enhanced Health Services Ads',
          included: true,
          details: 'Priority advertising capabilities with enhanced visibility'
        },
        tokenRate: {
          name: 'Token Earning Rate',
          included: true,
          details: '3x Standard'
        }
      }
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: 'Ultimate premium experience with exclusive features and advanced personalization',
      price: {
        monthly: '$17.99/mo',
        quarterly: '$39.99/3mo',
        yearly: '$99.99/yr',
        fiveYears: '$399.99/5yr',
        lifetime: '$449.99'
      },
      color: 'sky',
      gradientClass: 'from-sky-400 to-blue-600',
      features: {
        emotionTracking: {
          name: 'Elite Emotion Tracking',
          included: true,
          details: 'Comprehensive tracking with predictive analytics and custom metrics'
        },
        journaling: {
          name: 'Elite Journal',
          included: true,
          details: 'Most advanced journal with custom analytics and premium features'
        },
        moodRooms: {
          name: 'Elite Mood Rooms',
          included: true,
          details: 'Access to all rooms plus ability to create custom private rooms'
        },
        challenges: {
          name: 'Elite Challenges',
          included: true,
          details: 'Access to all challenges plus ability to create custom ones'
        },
        tokenEarning: {
          name: 'Elite Token Earning',
          included: true,
          details: 'Earn tokens at 4x the standard rate'
        },
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
        videoEditor: {
          name: 'Premium AI Video Editor',
          included: true,
          details: 'Full-featured professional video editor with all AI tools'
        },
        verification: {
          name: 'Premium Verification',
          included: true,
          details: 'Get verified with a diamond premium badge'
        },
        ads: {
          name: 'Premium Health Services Ads',
          included: true,
          details: 'Top-tier advertising capabilities with maximum visibility'
        },
        tokenRate: {
          name: 'Token Earning Rate',
          included: true,
          details: '4x Standard'
        }
      }
    },
    {
      id: 'legacy',
      name: 'Legacy',
      description: 'The complete lifetime package with all features and exclusive legacy benefits',
      price: {
        monthly: 'N/A',
        yearly: '$499.99/yr',
        lifetime: '$999.99'
      },
      color: 'purple',
      gradientClass: 'from-purple-400 to-purple-700',
      features: {
        emotionTracking: {
          name: 'Legacy Emotion Tracking',
          included: true,
          details: 'The most comprehensive tracking with exclusive legacy features'
        },
        journaling: {
          name: 'Legacy Journal',
          included: true,
          details: 'Most comprehensive journal with exclusive legacy features'
        },
        moodRooms: {
          name: 'Legacy Mood Rooms',
          included: true,
          details: 'Access to all rooms plus Legacy-only private rooms'
        },
        challenges: {
          name: 'Legacy Challenges',
          included: true,
          details: 'Access to all challenges plus Legacy-only exclusive challenges'
        },
        tokenEarning: {
          name: 'Legacy Token Earning',
          included: true,
          details: 'Earn tokens at 5x the standard rate'
        },
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
        videoEditor: {
          name: 'Legacy AI Video Editor',
          included: true,
          details: 'Most advanced video editor with exclusive legacy features'
        },
        verification: {
          name: 'Premium Verification',
          included: true,
          details: 'Get verified with a legacy premium badge'
        },
        ads: {
          name: 'Legacy Health Services Ads',
          included: true,
          details: 'Most premium advertising capabilities with exclusive placement options'
        },
        tokenRate: {
          name: 'Token Earning Rate',
          included: true,
          details: '5x Standard'
        }
      }
    }
  ];

  // Family plan tiers (derived from individual tiers with modifications)
  const familyTiers: PriceTier[] = [
    {
      id: 'family-gold',
      name: 'Family Gold',
      description: 'Premium features with a 14-day free trial for the whole family (up to 5 members)',
      badge: '14-Day Free Trial',
      badgeColor: 'bg-green-100 text-green-800 border-green-200',
      price: {
        monthly: 'N/A',
        yearly: '$149.99/yr',
        fiveYears: '$349.99/5yr',
        lifetime: '$499.99'
      },
      color: 'amber',
      gradientClass: 'from-amber-400 to-amber-600',
      features: {
        ...individualTiers[1].features,
        familyMembers: {
          name: 'Family Members',
          included: true,
          details: 'Up to 5 family members with 14-day free trial'
        },
        familyDashboard: {
          name: 'Family Dashboard',
          included: true,
          details: 'Monitor family members\' moods (with consent)'
        },
        familySharing: {
          name: 'Family Token Sharing',
          included: true,
          details: 'Share tokens between family members'
        }
      }
    },
    {
      id: 'family-platinum',
      name: 'Family Platinum',
      description: 'Enhanced family features with premium capabilities',
      price: {
        monthly: 'N/A',
        yearly: '$249.99/yr',
        fiveYears: '$599.99/5yr',
        lifetime: '$699.99'
      },
      color: 'slate',
      gradientClass: 'from-slate-400 to-slate-600',
      features: {
        ...individualTiers[2].features,
        familyMembers: {
          name: 'Family Members',
          included: true,
          details: 'Up to 5 family members'
        },
        familyDashboard: {
          name: 'Enhanced Family Dashboard',
          included: true,
          details: 'Advanced monitoring with personalized suggestions'
        },
        familySharing: {
          name: 'Enhanced Family Token Sharing',
          included: true,
          details: 'Share tokens with bonuses between family members'
        }
      }
    },
    {
      id: 'family-legacy',
      name: 'Family Legacy',
      description: 'Ultimate family package with all premium features',
      badge: 'Best Value',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      price: {
        monthly: 'N/A',
        yearly: '$399.99/yr',
        fiveYears: '$899.99/5yr',
        lifetime: '$999.99'
      },
      color: 'purple',
      gradientClass: 'from-purple-400 to-purple-700',
      features: {
        ...individualTiers[4].features,
        familyMembers: {
          name: 'Extended Family Members',
          included: true,
          details: 'Up to 10 family members'
        },
        familyDashboard: {
          name: 'Legacy Family Dashboard',
          included: true,
          details: 'Comprehensive family wellness tracking and insights'
        },
        familySharing: {
          name: 'Premium Family Token Sharing',
          included: true,
          details: 'Enhanced token sharing with family bonuses and rewards'
        }
      }
    }
  ];

  // Feature categories
  const featureCategories: FeatureCategory[] = [
    {
      id: 'core',
      name: 'Core Features',
      icon: <Zap className="h-5 w-5" />,
      description: 'Essential features for your emotional wellness journey',
      features: ['emotionTracking', 'journaling', 'moodRooms', 'challenges', 'tokenEarning', 'tokenRate']
    },
    {
      id: 'ai',
      name: 'AI-Powered Features',
      icon: <Brain className="h-5 w-5" />,
      description: 'Smart features that adapt to your needs',
      features: ['aiTherapist', 'aiClone', 'videoEditor']
    },
    {
      id: 'insights',
      name: 'Personalized Insights',
      icon: <BarChart4 className="h-5 w-5" />,
      description: 'Understand your emotional patterns',
      features: ['insights']
    },
    {
      id: 'premium',
      name: 'Premium Content',
      icon: <Star className="h-5 w-5" />,
      description: 'Exclusive content and features',
      features: ['nfts', 'customization', 'verification', 'ads']
    },
    {
      id: 'advanced',
      name: 'Advanced Tools',
      icon: <Globe className="h-5 w-5" />,
      description: 'Powerful tools for deeper insights',
      features: ['journal', 'moodMap', 'vipChallenges', 'irlPerks']
    }
  ];

  // For family plans, add family category
  if (viewType === 'family') {
    featureCategories.push({
      id: 'family',
      name: 'Family Features',
      icon: <Users className="h-5 w-5" />,
      description: 'Features designed for families',
      features: ['family', 'familyMembers', 'familyDashboard', 'familySharing']
    });
  }

  // Get active tiers based on view type
  const activeTiers = viewType === 'individual' ? individualTiers : familyTiers;

  // Function to check if Gold tier Premium Content features should be enabled based on duration
  const shouldEnableGoldPremiumContent = (tierName: string, duration: DurationView): boolean => {
    if (tierName.toLowerCase() !== 'gold') return false;
    return ['yearly', 'fiveYears', 'lifetime'].includes(duration);
  };

  // Modify Gold tier features based on subscription duration
  const processedTiers = activeTiers.map(tier => {
    if (tier.id === 'gold') {
      // Create a deep copy to avoid modifying the original
      const modifiedTier = {...tier, features: {...tier.features}};
      
      // Premium Content features to update conditionally
      const premiumContentFeatures = ['nfts', 'customization', 'verification', 'ads'];
      
      premiumContentFeatures.forEach(feature => {
        if (feature in modifiedTier.features) {
          modifiedTier.features[feature] = {
            ...modifiedTier.features[feature],
            included: shouldEnableGoldPremiumContent(tier.name, durationView)
          };
          
          // Update details text based on inclusion
          if (shouldEnableGoldPremiumContent(tier.name, durationView)) {
            modifiedTier.features[feature].details = 'Included with your subscription';
          }
        }
      });
      
      return modifiedTier;
    }
    return tier;
  });

  // Function to get price display based on duration view
  const getPriceDisplay = (tier: PriceTier) => {
    switch (durationView) {
      case 'monthly':
        return tier.price.monthly;
      case 'quarterly':
        return tier.price.quarterly || 'N/A';
      case 'yearly':
        return tier.price.yearly;
      case 'fiveYears':
        return tier.price.fiveYears || 'N/A';
      case 'lifetime':
        return tier.price.lifetime;
      default:
        return tier.price.monthly;
    }
  };
  
  // Function to check if tier has free trial
  const hasFreeTrialOffer = (tier: PriceTier, currentDuration: DurationView): boolean => {
    return tier.id === 'family-gold' && currentDuration === 'yearly';
  };

  // Function to get price per month (for comparison)
  const getPricePerMonth = (tier: PriceTier) => {
    const price = getPriceDisplay(tier);
    if (price === 'Free' || price === 'N/A') return price;
    
    let numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    let perMonth = numericPrice;
    
    switch (durationView) {
      case 'quarterly':
        perMonth = numericPrice / 3;
        break;
      case 'yearly':
        perMonth = numericPrice / 12;
        break;
      case 'fiveYears':
        perMonth = numericPrice / 60;
        break;
      case 'lifetime':
        return 'One-time';
    }
    
    return perMonth.toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
          <Crown className="h-3.5 w-3.5 mr-1" />
          Premium Plans Comparison
        </Badge>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
          Choose the Perfect Plan for Your Journey
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mb-6">
          Compare our premium membership tiers to find the perfect fit for your emotional wellness needs.
          All plans include core MoodSync features plus exclusive premium benefits.
        </p>
      </div>

      {/* Plan Type Selector */}
      <div className="flex justify-center mb-8">
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as ViewType)}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center justify-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Individual Plans
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Family Plans
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Duration Selector */}
      <div className="flex justify-center mb-8">
        <Tabs
          value={durationView}
          onValueChange={(value) => setDurationView(value as DurationView)}
          className="w-full max-w-3xl"
        >
          <TabsList className="grid w-full grid-cols-5">
            {viewType === 'individual' && (
              <>
                <TabsTrigger value="monthly" className="text-xs md:text-sm">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="quarterly" className="text-xs md:text-sm">
                  Quarterly
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="yearly" className="text-xs md:text-sm">
              Yearly
              {viewType === 'individual' && <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-green-500 text-green-600">-58%</Badge>}
            </TabsTrigger>
            <TabsTrigger value="fiveYears" className="text-xs md:text-sm">
              5 Years
              {viewType === 'individual' && <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-green-500 text-green-600">-67%</Badge>}
            </TabsTrigger>
            <TabsTrigger value="lifetime" className="text-xs md:text-sm">
              Lifetime
              <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-amber-500 text-amber-600">Best</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-max">
          <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] gap-1">
            {/* Header Row */}
            <div className="p-4 bg-muted/20 rounded-tl-lg flex items-center">
              <h3 className="font-semibold text-lg">Features</h3>
            </div>
            
            {/* Plan Headers */}
            {processedTiers.map((tier) => (
              <div 
                key={tier.id}
                className={`p-4 ${tier.popular ? 'bg-primary/10 border-t-2 border-primary shadow-md -mt-1' : 'bg-muted/20'} ${tier.id === activeTiers[activeTiers.length - 1].id ? 'rounded-tr-lg' : ''}`}
              >
                <div className="text-center">
                  {tier.badge && (
                    <Badge className={`mb-2 ${tier.badgeColor || 'bg-primary/20 text-primary'}`}>
                      {tier.badge}
                    </Badge>
                  )}
                  <h3 className="font-bold text-xl">{tier.name}</h3>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {getPriceDisplay(tier)}
                    </div>
                    {getPriceDisplay(tier) !== 'Free' && getPriceDisplay(tier) !== 'N/A' && durationView !== 'lifetime' && (
                      <div className="text-sm text-muted-foreground">
                        ${getPricePerMonth(tier)}/mo
                      </div>
                    )}
                    {hasFreeTrialOffer(tier, durationView) && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        Start with a 14-day free trial
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground h-12 line-clamp-2">
                    {tier.description}
                  </p>
                  <Button 
                    className={`mt-4 w-full bg-gradient-to-r ${tier.gradientClass} text-white hover:opacity-90 transition-all`}
                    onClick={() => setLocation('/premium')}
                  >
                    {tier.id === 'trial' ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                </div>
              </div>
            ))}

            {/* Feature Categories and Rows */}
            {featureCategories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header */}
                <div className="col-span-full mt-8 mb-2">
                  <div className="flex items-center gap-2 px-4">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground px-4 mt-1">
                    {category.description}
                  </p>
                </div>

                {/* Feature Rows */}
                {category.features.map((featureKey) => {
                  // Some tiers might not have this feature at all
                  const featureExists = processedTiers.some(tier => featureKey in tier.features);
                  if (!featureExists) return null;

                  return (
                    <React.Fragment key={featureKey}>
                      {/* Feature Name */}
                      <div className="p-4 border-t flex items-center">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium">{processedTiers[0].features[featureKey]?.name || processedTiers[1].features[featureKey]?.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  {processedTiers.find(tier => 
                                    tier.features[featureKey]?.included && tier.features[featureKey]?.details
                                  )?.features[featureKey]?.details || 'No details available'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Feature Value for Each Tier */}
                      {processedTiers.map((tier) => {
                        const feature = tier.features[featureKey];
                        return (
                          <div key={`${tier.id}-${featureKey}`} className={`p-4 border-t ${tier.popular ? 'bg-primary/5' : ''} text-center`}>
                            {feature ? (
                              feature.included ? (
                                <>
                                  {feature.details ? (
                                    <div className="text-sm text-center">
                                      <Check className="h-5 w-5 text-green-500 mx-auto mb-1" />
                                      <span className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {feature.details}
                                      </span>
                                    </div>
                                  ) : (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  )}
                                </>
                              ) : (
                                <X className="h-5 w-5 text-gray-300 dark:text-gray-400 mx-auto" />
                              )
                            ) : (
                              <X className="h-5 w-5 text-gray-300 dark:text-gray-400 mx-auto" />
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="p-8 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-0 mt-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center mb-3">
              <Crown className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-bold">Ready to Upgrade?</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              Unlock all premium features and take your emotional wellness journey to the next level. Choose the plan that's right for you.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
              onClick={() => setLocation('/premium')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Compare Again
            </Button>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does the 14-day free family trial work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The Family Gold yearly plan includes a 14-day free trial period where you and up to 5 family members can access all Gold tier premium features. If you decide not to continue, you can cancel before the trial ends with no charge.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included in the free basic plan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The free basic plan gives you access to basic emotion tracking, simple journaling, public mood rooms, and standard challenges. It's a great way to experience the core features of MoodSync.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I switch between plans?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, your current plan will remain active until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What are Emotional NFTs?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Emotional NFTs are digital collectibles that represent your emotional milestones. They evolve with your journey and can unlock real-world perks and benefits. They're exclusively available to premium members.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do Family Plans work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Family Plans allow you to add up to 5 members (or 10 with Legacy) to your subscription. Each member gets their own account with premium features, and you get special family-focused tools like the Family Dashboard.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a money-back guarantee?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, we offer a 14-day money-back guarantee for all new subscriptions. If you're not satisfied with your premium experience, contact our support team within 14 days of purchase for a full refund.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens after I subscribe?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your premium features will be activated immediately after your payment is processed. You'll receive a welcome email with details about your new features and how to make the most of your premium membership.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}