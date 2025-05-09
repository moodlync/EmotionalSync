import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, Lock, Crown, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

// Define feature sets for each subscription tier
const featureSets = {
  free: [
    {
      id: 'emotion-tracking',
      title: 'Emotion Tracking',
      description: 'Track your emotions and see your emotional journey over time',
      icon: <span className="text-2xl">😊</span>,
      cta: 'Track Now',
      path: '/',
      available: true
    },
    {
      id: 'journal',
      title: 'Emotional Journal',
      description: 'Record your feelings and reflections in a private journal',
      icon: <span className="text-2xl">📝</span>,
      cta: 'Write Entry',
      path: '/',
      available: true
    },
    {
      id: 'global-map',
      title: 'Global Emotion Map',
      description: 'View anonymized emotional data from around the world',
      icon: <span className="text-2xl">🌎</span>,
      cta: 'Explore Map',
      path: '/',
      available: true
    },
    {
      id: 'basic-challenges',
      title: 'Basic Challenges',
      description: 'Participate in free challenges to earn tokens',
      icon: <span className="text-2xl">🏆</span>,
      cta: 'View Challenges',
      path: '/user-challenges',
      available: true
    },
    {
      id: 'token-rewards',
      title: 'Token Rewards',
      description: 'Earn tokens for regular activities and engagement',
      icon: <span className="text-2xl">🪙</span>,
      cta: 'View Tokens',
      path: '/tokens',
      available: true
    },
    {
      id: 'premium-features',
      title: 'Premium Features',
      description: 'Unlock advanced features with a premium subscription',
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      cta: 'Go Premium',
      path: '/premium',
      available: false,
      premium: true
    }
  ],
  trial: [
    {
      id: 'emotion-tracking',
      title: 'Enhanced Emotion Tracking',
      description: 'Track your emotions with more detailed analysis and insights',
      icon: <span className="text-2xl">😊</span>,
      cta: 'Track Now',
      path: '/',
      available: true
    },
    {
      id: 'journal',
      title: 'Premium Journal',
      description: 'Enhanced journaling with templates and AI-powered insights',
      icon: <span className="text-2xl">📝</span>,
      cta: 'Write Entry',
      path: '/',
      available: true
    },
    {
      id: 'global-map',
      title: 'Interactive Global Map',
      description: 'Detailed emotional insights from around the world with filters',
      icon: <span className="text-2xl">🌎</span>,
      cta: 'Explore Map',
      path: '/',
      available: true
    },
    {
      id: 'premium-chat',
      title: 'Premium Chat Rooms',
      description: 'Access exclusive chat rooms with verified members',
      icon: <span className="text-2xl">💬</span>,
      cta: 'Join Chats',
      path: '/premium/chat',
      available: true,
      new: true
    },
    {
      id: 'emotional-imprints',
      title: 'Emotional Imprints',
      description: 'Create and share multi-sensory snapshots of your emotional state',
      icon: <span className="text-2xl">🎨</span>,
      cta: 'Create Imprint',
      path: '/emotional-imprints',
      available: true,
      new: true
    },
    {
      id: 'continue-premium',
      title: 'Continue Premium Experience',
      description: 'Your trial will end soon. Subscribe to keep premium features',
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      cta: 'Subscribe Now',
      path: '/premium',
      available: true,
      premium: true
    }
  ],
  premium: [
    {
      id: 'ai-companion',
      title: 'AI Companion',
      description: 'Get personalized emotional support from your AI companion',
      icon: <span className="text-2xl">🤖</span>,
      cta: 'Talk Now',
      path: '/',
      available: true,
      premium: true
    },
    {
      id: 'emotional-imprints',
      title: 'Emotional Imprints',
      description: 'Create and share multi-sensory snapshots of your emotional state',
      icon: <span className="text-2xl">🎨</span>,
      cta: 'Create Imprint',
      path: '/emotional-imprints',
      available: true,
      premium: true
    },
    {
      id: 'nft-collection',
      title: 'Emotional NFTs',
      description: 'Earn and collect unique NFTs representing your emotional journey',
      icon: <span className="text-2xl">🏅</span>,
      cta: 'View Collection',
      path: '/nft-collection',
      available: true,
      premium: true
    },
    {
      id: 'premium-chat',
      title: 'Premium Chat Rooms',
      description: 'Access exclusive chat rooms with verified members',
      icon: <span className="text-2xl">💬</span>,
      cta: 'Join Chats',
      path: '/premium/chat',
      available: true,
      premium: true
    },
    {
      id: 'video-editor',
      title: 'AI Video Editor',
      description: 'Create and edit professional videos with our AI-powered tools',
      icon: <span className="text-2xl">🎬</span>,
      cta: 'Create Video',
      path: '/video-editor',
      available: true,
      premium: true
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your emotional patterns with interactive charts',
      icon: <span className="text-2xl">📊</span>,
      cta: 'View Analytics',
      path: '/profile',
      available: true,
      premium: true
    }
  ],
  family: [
    {
      id: 'family-monitoring',
      title: 'Family Monitoring',
      description: 'Monitor your family members\' moods (with consent)',
      icon: <span className="text-2xl">👨‍👩‍👧‍👦</span>,
      cta: 'Manage Family',
      path: '/family',
      available: true,
      premium: true
    },
    {
      id: 'ai-companion',
      title: 'Family AI Companion',
      description: 'AI support for the whole family with personalized guidance',
      icon: <span className="text-2xl">🤖</span>,
      cta: 'Talk Now',
      path: '/',
      available: true,
      premium: true
    },
    {
      id: 'emotional-imprints',
      title: 'Family Imprints',
      description: 'Create and share multi-sensory snapshots with family members',
      icon: <span className="text-2xl">🎨</span>,
      cta: 'Create Imprint',
      path: '/emotional-imprints',
      available: true,
      premium: true
    },
    {
      id: 'nft-collection',
      title: 'Family NFT Collection',
      description: 'Collect emotional NFTs as a family and track milestones together',
      icon: <span className="text-2xl">🏅</span>,
      cta: 'View Collection',
      path: '/nft-collection',
      available: true,
      premium: true
    },
    {
      id: 'family-challenges',
      title: 'Family Challenges',
      description: 'Complete challenges together as a family to earn rewards',
      icon: <span className="text-2xl">🏆</span>,
      cta: 'View Challenges',
      path: '/user-challenges',
      available: true,
      premium: true
    },
    {
      id: 'family-analytics',
      title: 'Family Analytics',
      description: 'Get detailed insights into your family\'s emotional patterns',
      icon: <span className="text-2xl">📊</span>,
      cta: 'View Analytics',
      path: '/profile',
      available: true,
      premium: true
    }
  ],
  lifetime: [
    {
      id: 'ai-companion',
      title: 'Elite AI Companion',
      description: 'Exclusive access to our most advanced AI emotional support companion',
      icon: <span className="text-2xl">🤖</span>,
      cta: 'Talk Now',
      path: '/',
      available: true,
      premium: true
    },
    {
      id: 'nft-collection',
      title: 'Lifetime NFT Collection',
      description: 'Exclusive lifetime NFTs with enhanced features and rarity',
      icon: <span className="text-2xl">🏅</span>,
      cta: 'View Collection',
      path: '/nft-collection',
      available: true,
      premium: true
    },
    {
      id: 'emotional-imprints',
      title: 'Premium Emotional Imprints',
      description: 'Create unlimited imprints with exclusive lifetime-only effects',
      icon: <span className="text-2xl">🎨</span>,
      cta: 'Create Imprint',
      path: '/emotional-imprints',
      available: true,
      premium: true
    },
    {
      id: 'custom-themes',
      title: 'Custom Themes',
      description: 'Personalize your MoodSync experience with exclusive themes',
      icon: <span className="text-2xl">🎨</span>,
      cta: 'Customize',
      path: '/profile',
      available: true,
      premium: true
    },
    {
      id: 'advanced-analytics',
      title: 'Lifetime Analytics',
      description: 'Track your lifetime emotional journey with advanced analytics',
      icon: <span className="text-2xl">📊</span>,
      cta: 'View Analytics',
      path: '/profile',
      available: true,
      premium: true
    },
    {
      id: 'token-pool',
      title: 'Token Pool Access',
      description: 'Exclusive access to contribute to and benefit from the token pool',
      icon: <span className="text-2xl">🏦</span>,
      cta: 'Access Pool',
      path: '/token-pool-info',
      available: true,
      premium: true
    }
  ]
};

export default function DynamicFeatures() {
  const { tier, isActive, isTrial, hasSpecialAccess } = useSubscription();
  const [, navigate] = useLocation();
  
  // Determine which feature set to show based on subscription tier
  const getFeatureSet = () => {
    if (hasSpecialAccess) return featureSets.lifetime;
    if (tier === 'lifetime') return featureSets.lifetime;
    if (tier === 'family') return featureSets.family;
    if (tier === 'premium') return featureSets.premium;
    if (tier === 'trial') return featureSets.trial;
    return featureSets.free;
  };
  
  const features = getFeatureSet();
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Features</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {hasSpecialAccess ? (
            <>You have special developer access to all premium features.</>
          ) : tier === 'free' ? (
            <>Explore these features or upgrade to premium for more.</>
          ) : tier === 'trial' ? (
            <>Enjoy these premium features during your trial period.</>
          ) : tier === 'lifetime' ? (
            <>Thank you for being a lifetime member. Enjoy exclusive features.</>
          ) : tier === 'family' ? (
            <>Your family plan gives you access to these special features.</>
          ) : (
            <>Your premium subscription unlocks these enhanced features.</>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card 
            key={feature.id} 
            className={`overflow-hidden transition-all hover:shadow-md ${
              feature.premium ? 'border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-amber-950/20' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="mr-2">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    {feature.title}
                    {feature.premium && (
                      <Badge variant="outline" className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-300 border-0 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {feature.new && (
                      <Badge variant="outline" className="ml-2 bg-gradient-to-r from-blue-500 to-indigo-500 border-0 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="mt-1">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={feature.available ? "default" : "outline"} 
                className={`w-full ${!feature.available ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' : feature.premium ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white border-0' : ''}`}
                onClick={() => navigate(feature.path)}
              >
                {feature.available ? (
                  <>
                    {feature.premium && <Sparkles className="h-4 w-4 mr-1.5" />}
                    {feature.cta}
                    {feature.available && <Check className="h-4 w-4 ml-1.5" />}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1.5" />
                    Upgrade to Access
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}