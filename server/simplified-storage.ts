import { type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface ISimplifiedStorage {
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
  
  sessionStore: session.Store;
}

export class SimpleMemStorage implements ISimplifiedStorage {
  private users: Map<number, User> = new Map();
  private currentId: number = 1;
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