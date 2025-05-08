import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define subscription tier types
export type SubscriptionTier = 'free' | 'trial' | 'premium' | 'family' | 'lifetime';

// Define payload types for mutations
type StartTrialPayload = {
  trialDays?: number;
};

type UpgradeSubscriptionPayload = {
  tier: 'premium' | 'family' | 'lifetime';
  paymentMethod?: string;
};

// Define the subscription context type
type SubscriptionContextType = {
  tier: SubscriptionTier;
  isActive: boolean;
  isTrial: boolean;
  isLifetime: boolean;
  expiryDate: Date | null;
  hasSpecialAccess: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
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

// Provider component
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Fetch subscription data from the API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/subscription', user?.id],
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
  
  // Special users with developer access to all features
  const specialUsers = ['admin', 'sagar', 'dev', 'test'];
  const hasSpecialAccess = user ? specialUsers.includes(user.username) : false;
  
  // Parse subscription data
  const tier: SubscriptionTier = data?.tier || 'free';
  const isActive = data ? data.isActive : false;
  const isTrial = tier === 'trial';
  const isLifetime = tier === 'lifetime';
  const expiryDate = data?.expiryDate ? new Date(data.expiryDate) : null;
  
  // Initialize mutations
  const startTrialMutation = useStartTrialMutation();
  const upgradeSubscriptionMutation = useUpgradeSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();
  
  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isActive,
        isTrial,
        isLifetime,
        expiryDate,
        hasSpecialAccess,
        isLoading,
        isError,
        error,
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