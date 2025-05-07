import { EmotionType } from "@/lib/emotions";

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeCategory = 'tracking' | 'journal' | 'social' | 'ai' | 'exploration' | 'challenges';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  reward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  isUnlocked: boolean;
  reward: number;
  icon: string;
  progressCurrent: number;
  progressTarget: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  level: number;
  achievementCount: number;
  streak: number;
  rank: number;
}

export interface GamificationProfile {
  id: number;
  level: number;
  experience: number;
  points: number;
  achievements: string[];
  completedChallenges: string[];
  badges: string[];
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
}

export interface StreakInfo {
  streakIncreased: boolean;
  streakReset?: boolean;
  currentStreak: number;
  longestStreak: number;
  tokensAwarded: number;
  achievementUnlocked?: Achievement | null;
}

export interface ActivityCompletionResult {
  challenge: Challenge;
  tokensAwarded: number;
  levelUp: boolean;
  newLevel?: number;
  achievementUnlocked?: Achievement | null;
}

export interface AchievementClaimResult {
  achievement: Achievement;
  tokensAwarded: number;
  levelUp: boolean;
  newLevel: number;
}