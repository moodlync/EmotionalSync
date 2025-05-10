import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Auth import removed
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define subscription tier types with all variations
export type SubscriptionTier = 
  | 'free' 
  | 'trial' 
  | 'premium' 
  | 'family' 
  | 'family-diamond' 
  | 'family-legacy'
  | 'lifetime';

// Define subscription status types - adding 'trialing' to match server status
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

// Define payload types for mutations
type StartTrialPayload = {
  tier?: 'premium' | 'family' | 'lifetime';
  duration?: number;
};

type UpgradeSubscriptionPayload = {
  tier: 'premium' | 'family' | 'lifetime';
  durationMonths?: number;
  paymentMethod?: string;
};

// Define available features for each tier
export interface TierFeature {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  startDate: Date | null;
  expiryDate: Date | null;
  daysRemaining: number | null;
  features: TierFeature[];
  paymentMethod?: string;
  autoRenew: boolean;
  price?: string;
}

// Define the subscription context type
type SubscriptionContextType = {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  isActive: boolean;
  isTrial: boolean;
  isTrialing: boolean; // Specifically for "trialing" status
  isLifetime: boolean;
  expiryDate: Date | null;
  daysRemaining: number | null;
  hasSpecialAccess: boolean;
  subscriptionDetails: SubscriptionDetails | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Utility functions
  hasFeatureAccess: (featureId: string) => boolean;
  
  // Mutation methods
  startTrialMutation: ReturnType<typeof useStartTrialMutation>;
  upgradeSubscriptionMutation: ReturnType<typeof useUpgradeSubscriptionMutation>;
  cancelSubscriptionMutation: ReturnType<typeof useCancelSubscriptionMutation>;
};

// Mutation hooks
const useStartTrialMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: StartTrialPayload = {}) => {
      const response = await apiRequest('POST', '/api/subscription/trial', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start trial');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: "Trial started!",
        description: "Your premium trial has started. Enjoy all premium features!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start trial",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

const useUpgradeSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpgradeSubscriptionPayload) => {
      const response = await apiRequest('POST', '/api/subscription/premium', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upgrade subscription');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: "Subscription upgraded!",
        description: `Your subscription has been upgraded to ${data.tier}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upgrade subscription",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

const useCancelSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel subscription",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Create the context with default values
const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Define available premium features
const ALL_PREMIUM_FEATURES: Record<string, TierFeature> = {
  // Core features
  'advanced-emotions': {
    id: 'advanced-emotions',
    name: 'Advanced Emotion Tracking',
    description: 'Track up to 50 detailed emotions with intensity levels',
    available: false
  },
  'multi-checkins': {
    id: 'multi-checkins',
    name: 'Multiple Daily Check-ins',
    description: 'Log your emotions multiple times throughout the day',
    available: false
  },
  'mood-themes': {
    id: 'mood-themes',
    name: 'Dynamic Theme Colors',
    description: 'App appearance changes based on your emotional state',
    available: false
  },
  
  // Gold tier features
  'social-sharing': {
    id: 'social-sharing',
    name: 'Social Sharing',
    description: 'Share your thoughts with friends with privacy controls',
    available: false
  },
  'custom-mood-tags': {
    id: 'custom-mood-tags',
    name: 'Custom Mood Tags',
    description: 'Create and track your own personalized emotional states',
    available: false
  },
  'premium-content': {
    id: 'premium-content',
    name: 'Premium Content Access',
    description: 'Access exclusive articles, videos, and guides',
    available: false
  },
  
  // Platinum tier features
  'global-mood-map': {
    id: 'global-mood-map',
    name: 'Global Mood Map',
    description: 'View anonymized emotional patterns from around the world',
    available: false
  },
  'priority-support': {
    id: 'priority-support',
    name: 'Priority Support',
    description: 'Get faster responses from our support team',
    available: false
  },
  'enhanced-rewards': {
    id: 'enhanced-rewards',
    name: 'Enhanced Token Rewards',
    description: '50% more tokens for daily activities',
    available: false
  },
  
  // Diamond tier features
  'time-machine': {
    id: 'time-machine',
    name: 'Time Machine Journal',
    description: 'Advanced temporal analysis of your emotional patterns',
    available: false
  },
  'vip-challenges': {
    id: 'vip-challenges',
    name: 'VIP Challenges',
    description: 'Exclusive challenges with higher rewards',
    available: false
  },
  'exclusive-nfts': {
    id: 'exclusive-nfts',
    name: 'Exclusive NFT Collections',
    description: 'Special limited-edition emotional NFTs',
    available: false
  },
  
  // Legacy tier features
  'all-advanced-tools': {
    id: 'all-advanced-tools',
    name: 'All Advanced Tools',
    description: 'Access to every premium tool in the platform',
    available: false
  },
  'early-features': {
    id: 'early-features',
    name: 'Early Access to Features',
    description: 'Try new features before they are released',
    available: false
  },
  'personal-insights': {
    id: 'personal-insights',
    name: 'Personal Emotional Insights',
    description: 'AI-powered analysis of your emotional patterns',
    available: false
  },
  
  // Family plan features
  'family-members': {
    id: 'family-members',
    name: 'Family Member Access',
    description: 'Share premium benefits with up to 6 family members',
    available: false
  },
  'family-tools': {
    id: 'family-tools',
    name: 'Family Wellness Tools',
    description: 'Special tools designed for family emotional health',
    available: false
  }
};

// Function to get features available for a specific tier
function getFeaturesForTier(tier: SubscriptionTier): TierFeature[] {
  const availableFeatures = { ...ALL_PREMIUM_FEATURES };
  
  // Free tier has no premium features
  if (tier === 'free' as any) {
    return Object.values(availableFeatures);
  }
  
  // Core premium features available to all paid tiers - all our tiers are premium
  // Cast to any to avoid type errors with 'free'
  ['advanced-emotions', 'multi-checkins', 'mood-themes'].forEach(id => {
    availableFeatures[id].available = true;
  });
  
  // Premium tier features (base premium plan)
  if (['premium', 'family', 'lifetime'].includes(tier)) {
    ['social-sharing', 'custom-mood-tags', 'premium-content'].forEach(id => {
      availableFeatures[id].available = true;
    });
  }
  
  // Enhanced premium features
  if (['premium', 'family', 'lifetime'].includes(tier)) {
    ['global-mood-map', 'priority-support', 'enhanced-rewards'].forEach(id => {
      availableFeatures[id].available = true;
    });
  }
  
  // Additional premium and family features
  if (['family', 'lifetime'].includes(tier)) {
    ['time-machine', 'vip-challenges', 'exclusive-nfts'].forEach(id => {
      availableFeatures[id].available = true;
    });
  }
  
  // Lifetime exclusive features
  if (tier === 'lifetime') {
    ['all-advanced-tools', 'early-features', 'personal-insights'].forEach(id => {
      availableFeatures[id].available = true;
    });
  }
  
  // Family plan features
  if (tier.startsWith('family-')) {
    ['family-members', 'family-tools'].forEach(id => {
      availableFeatures[id].available = true;
    });
    
    // Family Diamond
    if (tier === 'family-diamond') {
      ['time-machine', 'vip-challenges'].forEach(id => {
        availableFeatures[id].available = true;
      });
    }
    
    // Family Legacy
    if (tier === 'family-legacy') {
      ['time-machine', 'vip-challenges', 'exclusive-nfts', 
       'all-advanced-tools', 'early-features'].forEach(id => {
        availableFeatures[id].available = true;
      });
    }
  }
  
  return Object.values(availableFeatures);
}

// Get subscription details including features for a given tier
function getSubscriptionDetails(
  tier: SubscriptionTier, 
  status: SubscriptionStatus | null, 
  startDate: Date | null,
  expiryDate: Date | null, 
  daysRemaining: number | null
): SubscriptionDetails {
  const features = getFeaturesForTier(tier);
  
  // Determine price based on tier (for display purposes)
  let price = '';
  switch(tier) {
    case 'premium': price = '$9.99/month'; break;
    case 'family': price = '$19.99/month'; break;
    case 'lifetime': price = 'Lifetime Access'; break;
    case 'trial': price = 'Free Trial'; break;
    default: price = 'Free';
  }
  
  return {
    tier,
    status,
    startDate,
    expiryDate,
    daysRemaining,
    features,
    autoRenew: true, // Default to true
    price
  };
}

// Modified Provider component - no authentication required
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // No longer use auth hook
  // Instead provide default subscription data
  
  // For API endpoints that need to fetch subscription data, we'll use a static ID
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/subscription', 1],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
  
  // All users have special access since authentication is removed
  const hasSpecialAccess = true;
  
  // Default subscription data - instead of using data from the API, use hardcoded values
  const tier: SubscriptionTier = 'premium';
  const status: SubscriptionStatus = 'active';
  const isActive = true; // Always active
  const isTrial = false;
  const isTrialing = false; 
  const isLifetime = true;
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year in future
  
  // Calculate days remaining in subscription or trial
  let daysRemaining: number | null = null;
  if (expiryDate) {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
  }
  
  // Generate subscription details
  const subscriptionDetails = getSubscriptionDetails(
    tier,
    status,
    startDate,
    expiryDate,
    daysRemaining
  );
  
  // Function to check if a user has access to a specific feature
  const hasFeatureAccess = (featureId: string): boolean => {
    // Special users have access to all features
    if (hasSpecialAccess) return true;
    
    // Find the feature in the subscription details
    const feature = subscriptionDetails.features.find(f => f.id === featureId);
    
    // Only active or trialing subscriptions have access to premium features
    if (!feature || (!isActive && !isTrialing && !isLifetime)) return false;
    
    return feature.available;
  };
  
  // Initialize mutations
  const startTrialMutation = useStartTrialMutation();
  const upgradeSubscriptionMutation = useUpgradeSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();
  
  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        status,
        isActive,
        isTrial,
        isTrialing,
        isLifetime,
        expiryDate,
        daysRemaining,
        hasSpecialAccess,
        subscriptionDetails,
        isLoading,
        isError,
        error,
        hasFeatureAccess,
        startTrialMutation,
        upgradeSubscriptionMutation,
        cancelSubscriptionMutation
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook to use the subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}