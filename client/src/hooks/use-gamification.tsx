import { createContext, ReactNode, useContext } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult
} from '@tanstack/react-query';
import { EmotionType } from '@/lib/emotions';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  GamificationProfile,
  Challenge,
  Achievement,
  LeaderboardEntry,
  ActivityCompletionResult,
  AchievementClaimResult,
  StreakInfo
} from '@/types/gamification-types';

interface GamificationContextType {
  profile: GamificationProfile | null;
  isLoadingProfile: boolean;
  
  challenges: Challenge[] | null;
  isLoadingChallenges: boolean;
  
  achievements: Achievement[] | null;
  isLoadingAchievements: boolean;
  
  leaderboard: LeaderboardEntry[] | null;
  isLoadingLeaderboard: boolean;
  
  completeChallengeActivity: (activityId: string) => Promise<ActivityCompletionResult>;
  claimAchievementReward: (achievementId: string) => Promise<AchievementClaimResult>;
  checkInStreak: (emotion: EmotionType) => Promise<StreakInfo>;
}

// Default context value
const defaultContextValue: GamificationContextType = {
  profile: null,
  isLoadingProfile: false,
  challenges: null,
  isLoadingChallenges: false,
  achievements: null,
  isLoadingAchievements: false,
  leaderboard: null,
  isLoadingLeaderboard: false,
  completeChallengeActivity: async () => ({ success: false, error: 'Provider not initialized' } as any),
  claimAchievementReward: async () => ({ success: false, error: 'Provider not initialized' } as any),
  checkInStreak: async () => ({ success: false, error: 'Provider not initialized' } as any)
};

export const GamificationContext = createContext<GamificationContextType>(defaultContextValue);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Fetch profile data
  const {
    data: profile,
    isLoading: isLoadingProfile
  } = useQuery<GamificationProfile>({
    queryKey: ['/api/gamification/profile'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch challenges
  const {
    data: challenges,
    isLoading: isLoadingChallenges
  } = useQuery<Challenge[]>({
    queryKey: ['/api/gamification/challenges'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch achievements
  const {
    data: achievements,
    isLoading: isLoadingAchievements
  } = useQuery<Achievement[]>({
    queryKey: ['/api/gamification/achievements'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch leaderboard
  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/gamification/leaderboard'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Complete challenge activity mutation
  const completeChallengeActivityMutation = useMutation<ActivityCompletionResult, Error, string>({
    mutationFn: async (activityId: string) => {
      const res = await apiRequest('POST', '/api/gamification/complete-activity', { activityId });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update activity',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Claim achievement reward mutation
  const claimAchievementRewardMutation = useMutation<AchievementClaimResult, Error, string>({
    mutationFn: async (achievementId: string) => {
      const res = await apiRequest('POST', '/api/gamification/claim-achievement', { achievementId });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to claim achievement',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Check-in streak mutation
  const checkInStreakMutation = useMutation<StreakInfo, Error, EmotionType>({
    mutationFn: async (emotion: EmotionType) => {
      const res = await apiRequest('POST', '/api/gamification/check-in', { emotion });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/achievements'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update streak',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Complete a challenge activity
  const completeChallengeActivity = async (activityId: string): Promise<ActivityCompletionResult> => {
    return completeChallengeActivityMutation.mutateAsync(activityId);
  };

  // Claim an achievement reward
  const claimAchievementReward = async (achievementId: string): Promise<AchievementClaimResult> => {
    return claimAchievementRewardMutation.mutateAsync(achievementId);
  };

  // Check in for daily streak
  const checkInStreak = async (emotion: EmotionType): Promise<StreakInfo> => {
    return checkInStreakMutation.mutateAsync(emotion);
  };

  return (
    <GamificationContext.Provider
      value={{
        profile: profile || null,
        isLoadingProfile,
        challenges: challenges || null,
        isLoadingChallenges,
        achievements: achievements || null,
        isLoadingAchievements,
        leaderboard: leaderboard || null,
        isLoadingLeaderboard,
        completeChallengeActivity,
        claimAchievementReward,
        checkInStreak
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  return context;
}