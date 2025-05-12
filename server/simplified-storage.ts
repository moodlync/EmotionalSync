import { type User, type InsertUser, EmotionType } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface ISimplifiedStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { 
    username: string; 
    password: string; 
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    ipAddress?: string | null;
  }): Promise<User>;
  
  // Add "not implemented" stubs for interface compatibility
  // User emotion
  getUserEmotion?(userId: number): Promise<EmotionType | undefined>;
  updateUserEmotion?(userId: number, emotion: EmotionType): Promise<void>;
  
  // Admin
  getAdminUserByUsername?(username: string): Promise<any | undefined>;
  
  // Notifications
  getNotificationsByUserId?(userId: number): Promise<any[]>;
  getNotificationById?(id: number): Promise<any | undefined>;
  markNotificationAsRead?(id: number): Promise<boolean>;
  markAllNotificationsAsRead?(userId: number): Promise<boolean>;
  createNotification?(notification: any): Promise<any>;
  
  // Token and rewards
  addUserTokens?(userId: number, amount: number): Promise<number>;
  getUserTokens?(userId: number): Promise<number>;
  createRewardActivity?(userId: number, type: string, amount: number, description: string): Promise<any>;
  getRewardActivities?(userId: number): Promise<any[]>;
  transferTokens?(fromUserId: number, toUserId: number, amount: number): Promise<boolean>;
  
  // Journal and emotion tracking
  createJournalEntry?(userId: number, data: any): Promise<any>;
  getJournalEntries?(userId: number, limit?: number): Promise<any[]>;
  getUsersByEmotion?(emotion: EmotionType, limit?: number): Promise<User[]>;
  getGlobalEmotionData?(): Promise<any>;
  
  // Gamification
  getGamificationProfile?(userId: number): Promise<any>;
  getGamificationChallenges?(): Promise<any[]>;
  getGamificationAchievements?(userId: number): Promise<any[]>;
  getGamificationLeaderboard?(limit?: number): Promise<any[]>;
  completeGamificationActivity?(userId: number, activityType: string, data?: any): Promise<any>;
  claimAchievementReward?(userId: number, achievementId: number): Promise<any>;
  checkInStreak?(userId: number): Promise<number>;
  
  // User challenges
  createUserChallenge?(data: any): Promise<any>;
  getUserCreatedChallenges?(userId: number): Promise<any[]>;
  getPublicUserCreatedChallenges?(): Promise<any[]>;
  getUserChallengeProgress?(userId: number, challengeId: number): Promise<any>;
  recordChallengeProgress?(userId: number, challengeId: number, progress: number): Promise<any>;
  
  // Premium features
  isUserInActiveTrial?(userId: number): Promise<boolean>;
  checkAndExpireTrials?(): Promise<void>;
  
  // Chat
  getChatRooms?(filter?: any): Promise<any[]>;
  
  // Session management
  sessionStore: session.Store;
}

export class SimpleMemStorage implements ISimplifiedStorage {
  private users: Map<number, User> = new Map();
  private currentId: number = 1;
  private userEmotions: Map<number, EmotionType> = new Map();
  private emotionAnalysisResults: Map<number, any[]> = new Map();
  private nextEmotionAnalysisResultId = 1;
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Create a test user
    this.createUser({
      username: "test",
      password: "password123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User"
    });
  }

  // User emotion methods
  async getUserEmotion(userId: number): Promise<EmotionType | undefined> {
    return this.userEmotions.get(userId) || 'neutral';
  }

  async updateUserEmotion(userId: number, emotion: EmotionType): Promise<void> {
    this.userEmotions.set(userId, emotion);
    console.log(`Updated emotion for user ${userId} to ${emotion}`);
  }

  // Admin methods
  async getAdminUserByUsername(username: string): Promise<any | undefined> {
    // In simplified auth, we don't have admin users
    if (username === 'admin') {
      return {
        id: 0,
        username: 'admin',
        role: 'admin'
      };
    }
    return undefined;
  }

  // Notification methods
  async getNotificationsByUserId(userId: number): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async getNotificationById(id: number): Promise<any | undefined> {
    // No notifications in simplified auth
    return undefined;
  }
  
  // Perplexity API emotion analysis methods
  async saveEmotionAnalysisResult(result: any): Promise<any> {
    const newResult = {
      id: this.nextEmotionAnalysisResultId++,
      userId: result.userId,
      text: result.text,
      result: result.result,
      timestamp: result.timestamp || new Date(),
    };
    
    // Add to user's emotion analysis results
    if (!this.emotionAnalysisResults.has(result.userId)) {
      this.emotionAnalysisResults.set(result.userId, []);
    }
    
    this.emotionAnalysisResults.get(result.userId)!.push(newResult);
    
    return newResult;
  }
  
  async getEmotionAnalysisHistory(userId: number): Promise<any[]> {
    return this.emotionAnalysisResults.get(userId) || [];
  }
  
  async updateJournalWithAnalysis(journalId: number, analysisResult: any): Promise<any> {
    // In simplified storage, we just return the analysis result
    // since we don't have journal entries
    return {
      id: journalId,
      analysis: analysisResult
    };
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    // Just return success
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    // Just return success
    return true;
  }

  async createNotification(notification: any): Promise<any> {
    // Just log and return a fake notification
    console.log(`Creating notification for user ${notification.userId}: ${notification.title}`);
    return {
      id: Date.now(),
      ...notification,
      createdAt: new Date()
    };
  }

  // Token and rewards methods
  async addUserTokens(userId: number, amount: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    user.emotionTokens = (user.emotionTokens || 0) + amount;
    this.users.set(userId, user);
    
    console.log(`Added ${amount} tokens to user ${userId}. New balance: ${user.emotionTokens}`);
    return user.emotionTokens;
  }

  async getUserTokens(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    return user.emotionTokens || 0;
  }

  async createRewardActivity(userId: number, type: string, amount: number, description: string): Promise<any> {
    console.log(`Created reward activity for user ${userId}: ${description} (+${amount} tokens)`);
    return {
      id: Date.now(),
      userId,
      type,
      amount,
      description,
      createdAt: new Date()
    };
  }

  async getRewardActivities(userId: number): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async transferTokens(fromUserId: number, toUserId: number, amount: number): Promise<boolean> {
    // Just return success for simplified auth
    return true;
  }

  // Journal and emotion tracking
  async createJournalEntry(userId: number, data: any): Promise<any> {
    console.log(`Created journal entry for user ${userId}`);
    return {
      id: Date.now(),
      userId,
      ...data,
      createdAt: new Date()
    };
  }

  async getJournalEntries(userId: number, limit?: number): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async getUsersByEmotion(emotion: EmotionType, limit?: number): Promise<User[]> {
    // Return empty array for simplified auth
    return [];
  }

  async getGlobalEmotionData(): Promise<any> {
    // Return dummy data for simplified auth
    return {
      happy: 20,
      sad: 15,
      angry: 10,
      anxious: 15,
      excited: 20,
      neutral: 20
    };
  }

  // Gamification methods
  async getGamificationProfile(userId: number): Promise<any> {
    return {
      userId,
      level: 1,
      points: 0,
      streak: 0
    };
  }

  async getGamificationChallenges(): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async getGamificationAchievements(userId: number): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async getGamificationLeaderboard(limit?: number): Promise<any[]> {
    // Return empty array for simplified auth
    return [];
  }

  async completeGamificationActivity(userId: number, activityType: string, data?: any): Promise<any> {
    console.log(`Completed gamification activity for user ${userId}: ${activityType}`);
    return {
      success: true,
      pointsEarned: 0
    };
  }

  async claimAchievementReward(userId: number, achievementId: number): Promise<any> {
    // Just return success for simplified auth
    return {
      success: true,
      tokensEarned: 0
    };
  }

  async checkInStreak(userId: number): Promise<number> {
    return 1; // Return 1 for simplified auth
  }

  // User challenges
  async createUserChallenge(data: any): Promise<any> {
    return {
      id: Date.now(),
      ...data,
      createdAt: new Date()
    };
  }

  async getUserCreatedChallenges(userId: number): Promise<any[]> {
    return [];
  }

  async getPublicUserCreatedChallenges(): Promise<any[]> {
    return [];
  }

  async getUserChallengeProgress(userId: number, challengeId: number): Promise<any> {
    return {
      userId,
      challengeId,
      progress: 0,
      completed: false
    };
  }

  async recordChallengeProgress(userId: number, challengeId: number, progress: number): Promise<any> {
    return {
      userId,
      challengeId,
      progress,
      completed: progress >= 100
    };
  }

  // Premium features
  async isUserInActiveTrial(userId: number): Promise<boolean> {
    return false; // No trials in simplified auth
  }

  async checkAndExpireTrials(): Promise<void> {
    // Do nothing in simplified auth
  }

  // Chat
  async getChatRooms(filter?: any): Promise<any[]> {
    return [];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: { 
    username: string; 
    password: string; 
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    ipAddress?: string | null;
  }): Promise<User> {
    const id = this.currentId++;
    
    // Create a basic user with only the essential fields
    const user: User = { 
      id, 
      username: userData.username,
      password: userData.password,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      ipAddress: userData.ipAddress || null,
      createdAt: new Date(),
      lastLogin: new Date(),
      
      // Add required User fields with defaults
      middleName: null,
      gender: null,
      state: null,
      country: null,
      emotionTokens: 0,
      isPremium: false,
      premiumPlanType: null,
      familyPlanOwnerId: null,
      allowMoodTracking: false,
      profilePicture: null,
      paypalEmail: null,
      stripeAccountId: null,
      preferredPaymentMethod: null,
      preferredCurrency: "USD",
      referralCode: this.generateSimpleReferralCode(),
      referredBy: null,
      referralCount: 0,
      followerCount: 0,
      videoCount: 0,
      totalVideoViews: 0,
      totalVideoLikes: 0,
      totalVideoComments: 0,
      totalVideoShares: 0,
      totalVideoDownloads: 0
    };
    
    this.users.set(id, user);
    console.log(`Created user: ${user.username} (ID: ${user.id})`);
    
    return user;
  }

  private generateSimpleReferralCode(): string {
    // Simple random string generator for referral codes
    return Math.random().toString(36).substring(2, 10);
  }
}

// Create and export a singleton instance
export const simpleStorage = new SimpleMemStorage();