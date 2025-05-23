/**
 * MoodLync Admin Service
 * Comprehensive management system for administrators to oversee platform operations
 */

import { db } from '../db';
import { storage } from '../storage';
import { eq, and, like, desc, sql, asc, gte, lte, inArray } from 'drizzle-orm';
import { 
  users, 
  adminUsers, 
  AdminRole, 
  adminActions, 
  nftItems, 
  tokenTransfers,
  journalEntries,
  userNfts,
  userMessages
} from '@shared/schema';
import { adminActionLogs, flaggedContents } from '@shared/admin-schema';
import { encryptText, decryptText, hashText, generateToken } from '../encryption';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'admin-jwt-secret-key';
const JWT_EXPIRY = '15m'; // 15 minutes token expiry

/**
 * Admin service class for handling all admin operations
 */
export class AdminService {
  /**
   * User Management Methods
   */
  
  /**
   * Get paginated list of users with filtering options
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 20,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = params;
    
    const offset = (page - 1) * limit;
    let query = db.select().from(users);
    
    // Apply filters
    if (search) {
      query = query.where(
        sql`(${users.username} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`})`
      );
    }
    
    if (role) {
      query = query.where(eq(users.role, role));
    }
    
    if (status) {
      query = query.where(eq(users.status, status));
    }
    
    if (startDate) {
      query = query.where(gte(users.createdAt, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(users.createdAt, endDate));
    }
    
    // Count total records for pagination
    const totalCountQuery = db.select({ count: sql`count(*)` }).from(users);
    const [{ count }] = await totalCountQuery.execute();
    
    // Apply sorting and pagination
    const sortColumn = users[sortBy as keyof typeof users] || users.createdAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    query = query.limit(limit).offset(offset);
    
    const results = await query.execute();
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    };
  }
  
  /**
   * Get detailed user information including activity metrics
   */
  async getUserDetails(userId: number) {
    // Get user basic info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user metrics
    const [journalCount] = await db
      .select({ count: sql`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    
    // Calculate token balance from token transfers
    const [sentTokens] = await db
      .select({ sum: sql`COALESCE(sum(amount), 0)` })
      .from(tokenTransfers)
      .where(eq(tokenTransfers.fromUserId, userId));
    
    const [receivedTokens] = await db
      .select({ sum: sql`COALESCE(sum(amount), 0)` })
      .from(tokenTransfers)
      .where(eq(tokenTransfers.toUserId, userId));
    
    // Count NFTs owned by the user from the userNfts table
    const [nftCount] = await db
      .select({ count: sql`count(*)` })
      .from(nftItems)
      .where(eq(nftItems.createdBy, userId));
    
    // Get last login details
    const lastLogin = user.lastLogin;
    
    // Get user subscription details
    const isPremium = user.isPremium;
    const subscriptionTier = user.premiumTier;
    const subscriptionExpiresAt = user.premiumExpiresAt;
    
    const tokenBalance = (Number(receivedTokens.sum) || 0) - (Number(sentTokens.sum) || 0);
    
    return {
      ...user,
      metrics: {
        journalCount: Number(journalCount.count) || 0,
        tokenBalance: tokenBalance,
        nftCount: Number(nftCount.count) || 0,
        lastLogin,
        subscription: {
          isPremium,
          tier: subscriptionTier,
          expiresAt: subscriptionExpiresAt
        }
      }
    };
  }
  
  /**
   * Update user information
   */
  async updateUser(userId: number, data: {
    email?: string;
    role?: string;
    status?: string;
    premiumTier?: string;
    premiumExpiresAt?: Date;
    [key: string]: any;
  }, adminId: number) {
    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Update user data
    const updatedUser = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        before: existingUser,
        after: data,
        changes: Object.keys(data)
      })
    });
    
    return updatedUser[0];
  }
  
  /**
   * Study user behavior and provide insights
   */
  async studyUserBehavior(adminId: number) {
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'STUDY_USER_BEHAVIOR',
      entityType: 'SYSTEM',
      entityId: 0,
      details: JSON.stringify({ 
        timestamp: new Date(),
        studyType: 'COMPREHENSIVE'
      })
    });
    
    // In a real implementation, this would perform data analytics on user behavior
    // We'll simulate some analytics results here
    
    // 1. Get total users
    const [{ count: totalUsers }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .execute();
    
    // 2. Get active users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [{ count: activeUsers }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(gte(users.lastActivity, thirtyDaysAgo))
      .execute();
    
    // 3. Get premium conversion rate
    const [{ count: premiumUsers }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.isPremium, true))
      .execute();
    
    const premiumConversionRate = (Number(premiumUsers) / Number(totalUsers)) * 100;
    
    // 4. Get daily active users trend (simulated)
    const dailyActiveUsersTrend = [
      { date: '2025-04-30', count: 1245 },
      { date: '2025-05-01', count: 1320 },
      { date: '2025-05-02', count: 1405 },
      { date: '2025-05-03', count: 1390 },
      { date: '2025-05-04', count: 1450 },
      { date: '2025-05-05', count: 1510 },
      { date: '2025-05-06', count: 1580 },
      { date: '2025-05-07', count: 1650 },
      { date: '2025-05-08', count: 1700 }
    ];
    
    // 5. Retention metrics (simulated)
    const retentionByWeek = [
      { week: 1, rate: 75 },
      { week: 2, rate: 62 },
      { week: 3, rate: 55 },
      { week: 4, rate: 49 },
      { week: 5, rate: 43 },
      { week: 6, rate: 40 },
      { week: 7, rate: 38 },
      { week: 8, rate: 37 }
    ];
    
    // 6. Popular emotions tracked
    const emotionDistribution = [
      { emotion: 'Joy', count: 19250 },
      { emotion: 'Anxiety', count: 15730 },
      { emotion: 'Sadness', count: 12450 },
      { emotion: 'Contentment', count: 11320 },
      { emotion: 'Hope', count: 9840 },
      { emotion: 'Excitement', count: 9540 },
      { emotion: 'Anger', count: 8720 },
      { emotion: 'Serenity', count: 7650 },
      { emotion: 'Fear', count: 6840 },
      { emotion: 'Pride', count: 5930 }
    ];
    
    // 7. Token economy activity
    const tokenTransactions = [
      { type: 'Emotion Logging', count: 45230, tokens: 135690 },
      { type: 'Journal Entries', count: 12450, tokens: 62250 },
      { type: 'Challenges Completed', count: 5840, tokens: 58400 },
      { type: 'NFT Minting', count: 1520, tokens: 38000 },
      { type: 'Referrals', count: 950, tokens: 28500 }
    ];
    
    // 8. Content engagement
    const contentEngagement = [
      { contentType: 'Journal', views: 32450, interactions: 16750 },
      { contentType: 'Challenges', views: 25650, interactions: 8920 },
      { contentType: 'Wellness Tips', views: 43250, interactions: 12340 },
      { contentType: 'Mood Backgrounds', views: 18650, interactions: 7520 },
      { contentType: 'Emotion Categories', views: 56240, interactions: 21740 }
    ];
    
    // Return the study results
    return {
      timestamp: new Date(),
      studyId: generateToken(8),
      overview: {
        totalUsers: Number(totalUsers),
        activeUsers: Number(activeUsers),
        activeUserRate: (Number(activeUsers) / Number(totalUsers)) * 100,
        premiumUsers: Number(premiumUsers),
        premiumConversionRate: premiumConversionRate
      },
      trends: {
        dailyActiveUsers: dailyActiveUsersTrend,
        retentionByWeek
      },
      engagement: {
        emotionDistribution,
        contentEngagement,
        tokenTransactions
      }
    };
  }
  
  /**
   * Generate recommendations based on user behavior study
   */
  async generateStudyRecommendations(adminId: number) {
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'GENERATE_STUDY_RECOMMENDATIONS',
      entityType: 'SYSTEM',
      entityId: 0,
      details: JSON.stringify({ 
        timestamp: new Date()
      })
    });
    
    // In a real implementation, this would analyze the study data and generate recommendations
    // Here we'll provide simulated recommendations based on common patterns
    
    return {
      timestamp: new Date(),
      recommendationId: generateToken(8),
      recommendations: [
        {
          category: 'User Experience',
          title: 'Simplify Emotion Logging Process',
          description: 'Data shows users spending 20% more time than optimal on the emotion selection screen. Consider reducing the number of initial emotion options and using a two-step selection process.',
          impact: 'HIGH',
          implementation: 'MEDIUM',
          metrics: ['Emotion Log Frequency', 'Time-to-Log']
        },
        {
          category: 'Feature Enhancement',
          title: 'Expand Wellness Tips Library',
          description: 'Wellness tips have the highest engagement rate among content types, but the lowest inventory. Increasing the variety by 50% could boost overall platform engagement.',
          impact: 'MEDIUM',
          implementation: 'LOW',
          metrics: ['Content Views', 'Content Saves', 'Time in App']
        },
        {
          category: 'Retention',
          title: 'Week 3 Retention Campaign',
          description: 'Data shows a significant drop in retention during week 3. Implement a special challenge or achievement that unlocks during this period to increase motivation to return.',
          impact: 'HIGH',
          implementation: 'MEDIUM',
          metrics: ['Week 3 Retention Rate', 'Challenge Participation']
        },
        {
          category: 'Premium Conversion',
          title: 'Personalized Premium Feature Highlights',
          description: 'Users who view at least 3 premium features have a 40% higher conversion rate. Implement a guided tour of premium features tailored to users\' most tracked emotions.',
          impact: 'HIGH',
          implementation: 'MEDIUM',
          metrics: ['Premium Trial Starts', 'Conversion Rate']
        },
        {
          category: 'Content Strategy',
          title: 'Anxiety-Focused Content Expansion',
          description: 'Anxiety is the second most tracked emotion but has lower associated content engagement. Developing more anxiety-specific wellness content could address an unmet need.',
          impact: 'MEDIUM',
          implementation: 'MEDIUM',
          metrics: ['Anxiety Content Views', 'User Feedback']
        },
        {
          category: 'Community Engagement',
          title: 'Expanded Emotion-Matching Parameters',
          description: 'Users matched on both emotion type and intensity show 65% longer conversation times. Refine the matching algorithm to include additional factors like context and frequency.',
          impact: 'MEDIUM',
          implementation: 'HIGH',
          metrics: ['Conversation Duration', 'Conversation Satisfaction']
        },
        {
          category: 'Token Economy',
          title: 'Journal Entry Token Boost',
          description: 'Journal entries have high engagement but lower token generation than emotion logging. Increasing tokens for detailed journal entries could encourage more thoughtful reflection.',
          impact: 'MEDIUM',
          implementation: 'LOW',
          metrics: ['Journal Entry Length', 'Journal Entry Frequency']
        },
        {
          category: 'User Interface',
          title: 'Redesign Dashboard Emotion History',
          description: 'Users who review their emotion history have higher retention rates, but only 30% of users access this feature. Make emotion history more prominent on the dashboard.',
          impact: 'HIGH',
          implementation: 'MEDIUM',
          metrics: ['Emotion History Views', 'Retention Rate']
        }
      ]
    };
  }
  
  /**
   * Generate impersonation token for admin to access user account
   */
  async impersonateUser(userId: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate short-lived JWT for impersonation
    const token = jwt.sign(
      { 
        userId: user.id, 
        impersonatedBy: adminId,
        username: user.username,
        isImpersonation: true
      },
      JWT_SECRET,
      { expiresIn: '30m' } // Impersonation tokens valid for 30 minutes
    );
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'IMPERSONATE_USER',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        timestamp: new Date(),
        duration: '30m'
      })
    });
    
    return { token };
  }
  
  /**
   * Reset user password
   */
  async resetUserPassword(userId: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate temporary password
    const tempPassword = generateToken(12);
    const hashedPassword = await hashText(tempPassword);
    
    // Update user with new password
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        passwordResetRequired: true
      })
      .where(eq(users.id, userId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'RESET_PASSWORD',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        timestamp: new Date(),
        passwordResetRequired: true
      })
    });
    
    return { tempPassword };
  }
  
  /**
   * Reset user MFA settings
   */
  async resetUserMFA(userId: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove MFA settings
    await db
      .update(users)
      .set({ 
        mfaEnabled: false,
        mfaSecret: null
      })
      .where(eq(users.id, userId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'RESET_MFA',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        timestamp: new Date()
      })
    });
    
    return { success: true };
  }
  
  /**
   * Ban user account
   */
  async banUser(userId: number, reason: string, duration: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Calculate ban end date
    const banExpiresAt = duration === -1 
      ? null // Permanent ban
      : new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // Duration in days
    
    // Update user with ban status
    await db
      .update(users)
      .set({ 
        status: 'BANNED',
        banReason: reason,
        banExpiresAt
      })
      .where(eq(users.id, userId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'BAN_USER',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        reason,
        duration: duration === -1 ? 'PERMANENT' : `${duration} days`,
        banExpiresAt
      })
    });
    
    return { success: true };
  }
  
  /**
   * Content Moderation Methods
   */
  
  /**
   * Get paginated list of flagged content
   */
  async getFlaggedContent(params: {
    page?: number;
    limit?: number;
    status?: string;
    contentType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      contentType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;
    
    const offset = (page - 1) * limit;
    let query = db.select().from(flaggedContents);
    
    // Apply filters
    if (status) {
      query = query.where(eq(flaggedContents.status, status));
    }
    
    if (contentType) {
      query = query.where(eq(flaggedContents.contentType, contentType));
    }
    
    // Count total records for pagination
    const totalCountQuery = db.select({ count: sql`count(*)` }).from(flaggedContents);
    let countFilter = totalCountQuery;
    
    if (status) {
      countFilter = countFilter.where(eq(flaggedContents.status, status));
    }
    
    if (contentType) {
      countFilter = countFilter.where(eq(flaggedContents.contentType, contentType));
    }
    
    const [{ count }] = await countFilter.execute();
    
    // Apply sorting and pagination
    const sortColumn = flaggedContents[sortBy as keyof typeof flaggedContents] || flaggedContents.createdAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    query = query.limit(limit).offset(offset);
    
    const results = await query.execute();
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    };
  }
  
  /**
   * Approve or reject flagged content
   */
  async moderateFlaggedContent(
    flagId: number, 
    decision: 'APPROVE' | 'REJECT', 
    adminId: number,
    adminNotes?: string
  ) {
    // Get flagged content details
    const [flaggedContent] = await db
      .select()
      .from(flaggedContents)
      .where(eq(flaggedContents.id, flagId));
    
    if (!flaggedContent) {
      throw new Error('Flagged content not found');
    }
    
    // Update flagged content status
    await db
      .update(flaggedContents)
      .set({ 
        status: decision, 
        moderatedBy: adminId,
        moderatedAt: new Date(),
        adminNotes
      })
      .where(eq(flaggedContents.id, flagId));
    
    // If rejected, delete or hide the original content
    if (decision === 'REJECT') {
      switch (flaggedContent.contentType) {
        case 'JOURNAL':
          // Add isVisible field to journalEntries if it doesn't exist
          await db
            .update(journalEntries)
            .set({ note: "Content removed by moderator" })
            .where(eq(journalEntries.id, flaggedContent.contentId));
          break;
        
        case 'CHAT_MESSAGE':
          await db
            .update(userMessages)
            .set({ message: "Content removed by moderator" })
            .where(eq(userMessages.id, flaggedContent.contentId));
          break;
        
        case 'NFT_ITEM':
          // Flag the NFT as inappropriate
          await db
            .update(nftItems)
            .set({ description: "Content removed by moderator" })
            .where(eq(nftItems.id, flaggedContent.contentId));
          break;
      }
    }
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: `${decision}_FLAGGED_CONTENT`,
      entityType: 'FLAGGED_CONTENT',
      entityId: flagId,
      details: JSON.stringify({ 
        contentType: flaggedContent.contentType,
        contentId: flaggedContent.contentId,
        adminNotes
      })
    });
    
    return { success: true };
  }
  
  /**
   * Shadow ban a user for toxicity or policy violations
   */
  async shadowBanUser(userId: number, reason: string, duration: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Calculate shadow ban end date
    const shadowBanExpiresAt = duration === -1 
      ? null // Permanent shadow ban
      : new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // Duration in days
    
    // Update user with shadow ban status
    // Note: Shadow banned users can still use the platform but their content is hidden from others
    await db
      .update(users)
      .set({ 
        isShadowBanned: true,
        shadowBanReason: reason,
        shadowBanExpiresAt
      })
      .where(eq(users.id, userId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'SHADOW_BAN_USER',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        reason,
        duration: duration === -1 ? 'PERMANENT' : `${duration} days`,
        shadowBanExpiresAt
      })
    });
    
    return { success: true };
  }
  
  /**
   * NFT moderation for reviewing and approving NFT items
   */
  async getNFTsForModeration(params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      status = 'PENDING',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;
    
    const offset = (page - 1) * limit;
    let query = db.select().from(nftItems);
    
    // Apply filters
    query = query.where(eq(nftItems.status, status));
    
    // Count total records for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(nftItems)
      .where(eq(nftItems.status, status));
    
    // Apply sorting and pagination
    const sortColumn = nftItems[sortBy as keyof typeof nftItems] || nftItems.createdAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    query = query.limit(limit).offset(offset);
    
    const results = await query.execute();
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    };
  }
  
  /**
   * Approve or reject an NFT
   */
  async moderateNFT(
    nftId: number, 
    decision: 'APPROVED' | 'REJECTED', 
    adminId: number,
    adminNotes?: string
  ) {
    // Get NFT details
    const [nft] = await db
      .select()
      .from(nftItems)
      .where(eq(nftItems.id, nftId));
    
    if (!nft) {
      throw new Error('NFT not found');
    }
    
    // Update NFT status
    await db
      .update(nftItems)
      .set({ 
        status: decision, 
        moderatedBy: adminId,
        moderatedAt: new Date(),
        adminNotes
      })
      .where(eq(nftItems.id, nftId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: `${decision}_NFT`,
      entityType: 'NFT_ITEM',
      entityId: nftId,
      details: JSON.stringify({ 
        userId: nft.userId,
        collectionId: nft.collectionId,
        adminNotes
      })
    });
    
    return { success: true };
  }
  
  /**
   * Freeze a fraudulent NFT
   */
  async freezeNFT(nftId: number, reason: string, adminId: number) {
    // Get NFT details
    const [nft] = await db
      .select()
      .from(nftItems)
      .where(eq(nftItems.id, nftId));
    
    if (!nft) {
      throw new Error('NFT not found');
    }
    
    // Update NFT status to frozen
    await db
      .update(nftItems)
      .set({ 
        status: 'FROZEN', 
        frozenReason: reason,
        frozenBy: adminId,
        frozenAt: new Date()
      })
      .where(eq(nftItems.id, nftId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'FREEZE_NFT',
      entityType: 'NFT_ITEM',
      entityId: nftId,
      details: JSON.stringify({ 
        userId: nft.userId,
        collectionId: nft.collectionId,
        reason
      })
    });
    
    return { success: true };
  }
  
  /**
   * Analytics & Data Methods
   */
  
  /**
   * Get platform analytics for the admin dashboard
   */
  async getPlatformAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'day') {
    // Calculate start date based on timeframe
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Get total users count
    const [totalUsers] = await db
      .select({ count: sql`count(*)` })
      .from(users);
    
    // Get new users since start date
    const [newUsers] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(gte(users.createdAt, startDate));
    
    // Get active users since start date
    const [activeUsers] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(gte(users.lastActivity, startDate));
    
    // Get premium users count
    const [premiumUsers] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.isPremium, true));
    
    // Get banned users count
    const [bannedUsers] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.status, 'BANNED'));
    
    // Get total journals count
    const [totalJournals] = await db
      .select({ count: sql`count(*)` })
      .from(journalEntries);
    
    // Get new journals since start date
    const [newJournals] = await db
      .select({ count: sql`count(*)` })
      .from(journalEntries)
      .where(gte(journalEntries.createdAt, startDate));
    
    // Get total NFTs count
    const [totalNFTs] = await db
      .select({ count: sql`count(*)` })
      .from(nftItems);
    
    // Get new NFTs since start date
    const [newNFTs] = await db
      .select({ count: sql`count(*)` })
      .from(nftItems)
      .where(gte(nftItems.createdAt, startDate));
    
    // Get total tokens in circulation
    const [tokenCirculation] = await db
      .select({ sum: sql`sum(amount)` })
      .from(tokenTransfers)
      .where(gte(tokenTransfers.amount, 0));
    
    // Get mood distribution
    const moodDistribution = await db
      .select({
        emotion: journalEntries.emotion,
        count: sql`count(*)`
      })
      .from(journalEntries)
      .where(gte(journalEntries.createdAt, startDate))
      .groupBy(journalEntries.emotion);
    
    return {
      users: {
        total: Number(totalUsers.count),
        new: Number(newUsers.count),
        active: Number(activeUsers.count),
        premium: Number(premiumUsers.count),
        banned: Number(bannedUsers.count)
      },
      content: {
        journals: {
          total: Number(totalJournals.count),
          new: Number(newJournals.count)
        },
        nfts: {
          total: Number(totalNFTs.count),
          new: Number(newNFTs.count)
        }
      },
      tokens: {
        circulation: Number(tokenCirculation.sum) || 0
      },
      mood: moodDistribution.reduce((acc, item) => {
        acc[item.emotion] = Number(item.count);
        return acc;
      }, {} as Record<string, number>)
    };
  }
  
  /**
   * Export user data for GDPR/CCPA compliance
   */
  async exportUserData(userId: number, adminId: number) {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user journals
    const journals = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    
    // Get user NFTs
    const nfts = await db
      .select()
      .from(nftItems)
      .where(eq(nftItems.createdBy, userId));
    
    // Get token transactions
    const tokensSent = await db
      .select()
      .from(tokenTransfers)
      .where(eq(tokenTransfers.fromUserId, userId));
    
    const tokensReceived = await db
      .select()
      .from(tokenTransfers)
      .where(eq(tokenTransfers.toUserId, userId));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'EXPORT_USER_DATA',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ 
        timestamp: new Date(),
        reason: 'GDPR/CCPA Data Subject Request'
      })
    });
    
    // Compile user data export
    const userData = {
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isPremium: user.isPremium,
        premiumTier: user.premiumTier,
        premiumExpiresAt: user.premiumExpiresAt
      },
      journals,
      nfts,
      tokens: {
        sent: tokensSent,
        received: tokensReceived
      }
    };
    
    return userData;
  }
  
  /**
   * Token & NFT Economy Methods
   */
  
  /**
   * Get token pool statistics
   */
  async getTokenPoolStats() {
    // Get total tokens issued (received tokens)
    const [tokensIssued] = await db
      .select({ sum: sql`sum(amount)` })
      .from(tokenTransfers);
    
    // Get token distribution by user category
    const tokenDistribution = await db
      .select({
        userType: sql`CASE 
          WHEN ${users.isPremium} = true THEN 'PREMIUM'
          ELSE 'REGULAR'
        END`,
        sum: sql`COALESCE(SUM(CASE
          WHEN ${tokenTransfers.toUserId} = ${users.id} THEN ${tokenTransfers.amount}
          WHEN ${tokenTransfers.fromUserId} = ${users.id} THEN -${tokenTransfers.amount}
          ELSE 0
        END), 0)`
      })
      .from(users)
      .leftJoin(tokenTransfers, 
        or(
          eq(tokenTransfers.toUserId, users.id),
          eq(tokenTransfers.fromUserId, users.id)
        )
      )
      .groupBy(sql`userType`);
    
    // Get top token holders - users who received more than they sent
    const topHolders = await db
      .select({
        userId: users.id,
        username: users.username,
        balance: sql`
          COALESCE((
            SELECT SUM(amount) 
            FROM token_transfers 
            WHERE to_user_id = users.id
          ), 0) - 
          COALESCE((
            SELECT SUM(amount) 
            FROM token_transfers 
            WHERE from_user_id = users.id
          ), 0)
        `
      })
      .from(users)
      .orderBy(desc(sql`balance`))
      .limit(10);
    
    return {
      circulation: {
        issued: Number(tokensIssued.sum) || 0,
        burned: 0, // We don't burn tokens in the new model
        net: Number(tokensIssued.sum) || 0
      },
      distribution: tokenDistribution.reduce((acc, item) => {
        acc[item.userType] = Number(item.sum);
        return acc;
      }, {} as Record<string, number>),
      topHolders: topHolders.map(holder => ({
        userId: holder.userId,
        username: holder.username,
        balance: Number(holder.balance)
      }))
    };
  }
  
  /**
   * Adjust token minting rate for specific activities
   */
  async updateTokenRates(rateUpdates: {
    activityType: string;
    newRate: number;
  }[], adminId: number) {
    const { activityType, newRate } = rateUpdates[0]; // Simplified for this example
    
    // Update token rate in the database
    // This would typically update a system configuration table
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'UPDATE_TOKEN_RATE',
      entityType: 'SYSTEM_CONFIG',
      entityId: 0,
      details: JSON.stringify({ 
        activityType,
        oldRate: 0, // This would be fetched from the database
        newRate
      })
    });
    
    return { success: true };
  }
  
  /**
   * Initialize token pool split for top contributors
   */
  async initiateTokenPoolSplit(
    poolSize: number, 
    contributorCount: number, 
    donationPercentage: number,
    adminId: number
  ) {
    // Validate parameters
    if (poolSize <= 0) {
      throw new Error('Pool size must be greater than zero');
    }
    
    if (contributorCount <= 0) {
      throw new Error('Contributor count must be greater than zero');
    }
    
    if (donationPercentage < 0 || donationPercentage > 100) {
      throw new Error('Donation percentage must be between 0 and 100');
    }
    
    // Calculate amount for NGO donations
    const donationAmount = poolSize * (donationPercentage / 100);
    const distributionAmount = poolSize - donationAmount;
    
    // Get top contributors (users with highest token balances)
    const topContributors = await db
      .select({
        userId: users.id,
        username: users.username,
        balance: sql`
          COALESCE((
            SELECT SUM(amount) 
            FROM token_transfers 
            WHERE to_user_id = users.id
          ), 0) - 
          COALESCE((
            SELECT SUM(amount) 
            FROM token_transfers 
            WHERE from_user_id = users.id
          ), 0)
        `
      })
      .from(users)
      .orderBy(desc(sql`balance`))
      .limit(contributorCount);
    
    // Calculate total balance of top contributors
    const totalBalance = topContributors.reduce(
      (sum, user) => sum + Number(user.balance), 
      0
    );
    
    // Calculate token distribution based on proportional balances
    const distribution = topContributors.map(user => ({
      userId: user.userId,
      username: user.username,
      currentBalance: Number(user.balance),
      proportion: Number(user.balance) / totalBalance,
      tokensAwarded: Math.floor((Number(user.balance) / totalBalance) * distributionAmount)
    }));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'INITIATE_TOKEN_POOL_SPLIT',
      entityType: 'TOKEN_POOL',
      entityId: 0,
      details: JSON.stringify({ 
        poolSize,
        contributorCount,
        donationPercentage,
        donationAmount,
        distributionAmount,
        recipientCount: distribution.length
      })
    });
    
    // In a real implementation, you would execute the token distribution here
    
    return {
      success: true,
      poolDetails: {
        totalPool: poolSize,
        donationAmount,
        distributionAmount
      },
      distribution
    };
  }
  
  /**
   * System Operations Methods
   */
  
  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    // In a real implementation, these would be fetched from monitoring systems
    // This is a simplified example
    return {
      api: {
        uptime: 99.98,
        responseTime: 120, // ms
        errorRate: 0.02, // percentage
        requestsPerMinute: 256
      },
      database: {
        connectionPool: {
          total: 20,
          active: 12,
          idle: 8,
          waitingRequests: 0
        },
        queryPerformance: {
          avgQueryTime: 42, // ms
          slowQueries: 0.5 // percentage
        },
        encryptionStatus: 'ACTIVE'
      },
      storage: {
        usage: {
          total: 5120, // GB
          used: 2048, // GB
          free: 3072 // GB
        },
        backups: {
          lastBackup: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'SUCCESS',
          backupCount: 24
        }
      }
    };
  }
  
  /**
   * Initiate system backup
   */
  async initiateBackup(adminId: number) {
    // In a real implementation, this would trigger a backup job
    // This is a simplified example
    
    // Generate a unique backup ID
    const backupId = generateToken(8);
    
    // Generate a backup timestamp
    const initiatedAt = new Date();
    
    // Estimated completion time (15 minutes from now)
    const estimatedCompletion = new Date(Date.now() + 900000);
    
    // Create a record in the systemBackups table
    await db.insert(systemBackups).values({
      backupType: 'FULL',
      destination: 'CLOUD_STORAGE',
      initiatedBy: adminId,
      initiatedAt,
      status: 'IN_PROGRESS',
      backupId,
      encryptionStatus: 'ENCRYPTED',
      storageLocation: `backups/${backupId}`,
      retentionPeriod: 30 // 30 days retention
    });
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'INITIATE_BACKUP',
      entityType: 'SYSTEM',
      entityId: 0,
      details: JSON.stringify({ 
        timestamp: initiatedAt,
        backupType: 'FULL',
        destination: 'CLOUD_STORAGE',
        backupId
      })
    });
    
    // Simulate a backup process completion after 3 seconds
    setTimeout(async () => {
      try {
        await db
          .update(systemBackups)
          .set({ 
            status: 'COMPLETED', 
            completedAt: new Date(),
            fileSize: 1024 * 1024 * 50 + Math.floor(Math.random() * 1024 * 1024 * 10) // Random size between 50-60MB
          })
          .where(eq(systemBackups.backupId, backupId));
      } catch (error) {
        console.error('Error updating backup status:', error);
      }
    }, 3000);
    
    return {
      success: true,
      backupId,
      initiatedAt,
      estimatedCompletion
    };
  }
  
  /**
   * Get list of system backups
   */
  async getSystemBackups(params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'initiatedAt',
      sortOrder = 'desc'
    } = params;
    
    const offset = (page - 1) * limit;
    let query = db.select().from(systemBackups);
    
    // Apply filters
    if (status) {
      query = query.where(eq(systemBackups.status, status));
    }
    
    // Count total records for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(systemBackups)
      .execute();
    
    // Apply sorting and pagination
    const sortColumn = systemBackups[sortBy as keyof typeof systemBackups] || systemBackups.initiatedAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    query = query.limit(limit).offset(offset);
    
    const results = await query.execute();
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    };
  }
  
  /**
   * Get backup details by ID
   */
  async getBackupDetails(backupId: string) {
    const [backup] = await db
      .select()
      .from(systemBackups)
      .where(eq(systemBackups.backupId, backupId));
    
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    return backup;
  }
  
  /**
   * Get download URL for a backup
   */
  async getBackupDownloadUrl(backupId: string, adminId: number) {
    const [backup] = await db
      .select()
      .from(systemBackups)
      .where(eq(systemBackups.backupId, backupId));
    
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    if (backup.status !== 'COMPLETED') {
      throw new Error('Backup is not available for download');
    }
    
    // In a real implementation, this would generate a signed URL to download the backup
    const downloadUrl = `/api/admin/backups/${backupId}/download`;
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'DOWNLOAD_BACKUP',
      entityType: 'SYSTEM_BACKUP',
      entityId: backup.id,
      details: JSON.stringify({ 
        timestamp: new Date(),
        backupId
      })
    });
    
    return { downloadUrl };
  }
  
  /**
   * Audit & Compliance Methods
   */
  
  /**
   * Log admin action for audit trail
   */
  async logAdminAction(data: {
    adminId: number;
    action: string;
    entityType: string;
    entityId: number;
    details?: string;
  }) {
    const { adminId, action, entityType, entityId, details } = data;
    
    // Get admin info
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, adminId));
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    // Log action in audit trail
    const [logEntry] = await db
      .insert(adminActionLogs)
      .values({
        adminId,
        adminUsername: admin.username,
        action,
        entityType,
        entityId,
        details: details || '',
        ipAddress: '0.0.0.0', // In a real implementation, this would be the actual IP
        userAgent: 'Admin Panel', // In a real implementation, this would be the actual user agent
        timestamp: new Date()
      })
      .returning();
    
    return logEntry;
  }
  
  /**
   * Get admin action logs with filtering options
   */
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    adminId?: number;
    action?: string;
    entityType?: string;
    entityId?: number;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = params;
    
    const offset = (page - 1) * limit;
    let query = db.select().from(adminActionLogs);
    
    // Apply filters
    if (adminId) {
      query = query.where(eq(adminActionLogs.adminId, adminId));
    }
    
    if (action) {
      query = query.where(eq(adminActionLogs.action, action));
    }
    
    if (entityType) {
      query = query.where(eq(adminActionLogs.entityType, entityType));
    }
    
    if (entityId) {
      query = query.where(eq(adminActionLogs.entityId, entityId));
    }
    
    if (startDate) {
      query = query.where(gte(adminActionLogs.timestamp, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(adminActionLogs.timestamp, endDate));
    }
    
    // Count total records for pagination
    const totalCountQuery = db.select({ count: sql`count(*)` }).from(adminActionLogs);
    let countFilter = totalCountQuery;
    
    if (adminId) {
      countFilter = countFilter.where(eq(adminActionLogs.adminId, adminId));
    }
    
    if (action) {
      countFilter = countFilter.where(eq(adminActionLogs.action, action));
    }
    
    if (entityType) {
      countFilter = countFilter.where(eq(adminActionLogs.entityType, entityType));
    }
    
    if (entityId) {
      countFilter = countFilter.where(eq(adminActionLogs.entityId, entityId));
    }
    
    if (startDate) {
      countFilter = countFilter.where(gte(adminActionLogs.timestamp, startDate));
    }
    
    if (endDate) {
      countFilter = countFilter.where(lte(adminActionLogs.timestamp, endDate));
    }
    
    const [{ count }] = await countFilter.execute();
    
    // Apply sorting and pagination
    const sortColumn = adminActionLogs[sortBy as keyof typeof adminActionLogs] || adminActionLogs.timestamp;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    query = query.limit(limit).offset(offset);
    
    const results = await query.execute();
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    };
  }
  
  /**
   * Export audit logs for regulatory compliance
   */
  async exportAuditLogs(
    startDate: Date, 
    endDate: Date, 
    format: 'json' | 'csv' = 'json',
    adminId: number
  ) {
    // Get all audit logs in the date range
    const logs = await db
      .select()
      .from(adminActionLogs)
      .where(
        and(
          gte(adminActionLogs.timestamp, startDate),
          lte(adminActionLogs.timestamp, endDate)
        )
      )
      .orderBy(asc(adminActionLogs.timestamp));
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'EXPORT_AUDIT_LOGS',
      entityType: 'SYSTEM',
      entityId: 0,
      details: JSON.stringify({ 
        startDate,
        endDate,
        format,
        recordCount: logs.length
      })
    });
    
    // In a real implementation, this would format the data as JSON or CSV
    
    return {
      success: true,
      format,
      recordCount: logs.length,
      startDate,
      endDate,
      data: logs
    };
  }
  
  /**
   * ========== SEO Management Methods ==========
   */
  
  /**
   * Get all SEO configurations
   */
  async getSeoConfigurations() {
    try {
      const seoConfigs = await storage.getAllSeoConfigurations();
      return seoConfigs;
    } catch (error) {
      console.error('Error getting SEO configurations:', error);
      throw error;
    }
  }
  
  /**
   * Get SEO configuration by page key
   */
  async getSeoConfigurationByKey(pageKey: string) {
    try {
      const seoConfig = await storage.getSeoConfigurationByKey(pageKey);
      return seoConfig;
    } catch (error) {
      console.error(`Error getting SEO configuration for ${pageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Update SEO configuration for a specific page
   */
  async updateSeoConfiguration(
    pageKey: string,
    seoConfig: {
      title: string;
      description: string;
      keywords?: string[];
      ogImage?: string;
      noindex?: boolean;
    },
    adminId: number
  ) {
    try {
      const existingConfig = await storage.getSeoConfigurationByKey(pageKey);
      
      if (!existingConfig) {
        throw new Error('SEO configuration not found');
      }
      
      const updatedConfig = await storage.updateSeoConfiguration(pageKey, seoConfig);
      
      // Log admin action
      await this.logAdminAction({
        adminId,
        action: 'UPDATE_SEO_CONFIG',
        entityType: 'SEO_CONFIG',
        entityId: updatedConfig.id,
        details: JSON.stringify({
          pageKey,
          before: existingConfig,
          after: seoConfig,
          changes: Object.keys(seoConfig)
        })
      });
      
      return updatedConfig;
    } catch (error) {
      console.error(`Error updating SEO configuration for ${pageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new SEO configuration
   */
  async createSeoConfiguration(
    pageKey: string,
    seoConfig: {
      title: string;
      description: string;
      keywords?: string[];
      ogImage?: string;
      noindex?: boolean;
    },
    adminId: number
  ) {
    try {
      const existingConfig = await storage.getSeoConfigurationByKey(pageKey);
      
      if (existingConfig) {
        throw new Error('SEO configuration already exists');
      }
      
      const newConfig = await storage.createSeoConfiguration(pageKey, seoConfig);
      
      // Log admin action
      await this.logAdminAction({
        adminId,
        action: 'CREATE_SEO_CONFIG',
        entityType: 'SEO_CONFIG',
        entityId: newConfig.id,
        details: JSON.stringify({
          pageKey,
          config: seoConfig
        })
      });
      
      return newConfig;
    } catch (error) {
      console.error(`Error creating SEO configuration for ${pageKey}:`, error);
      throw error;
    }
  }
}

export const adminService = new AdminService();