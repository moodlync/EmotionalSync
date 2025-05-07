import { db } from '../db';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { 
  tokenPool, 
  emotionalNfts, 
  poolContributions, 
  poolDistributions,
  users,
  rewardActivities
} from '@shared/schema';
import { IStorage } from '../storage';

interface PoolStats {
  totalTokens: number;
  targetTokens: number;
  progress: number;
  distributionRound: number;
  totalContributors: number;
  nextDistributionDate: Date;
  // Enhanced statistics for dashboard
  todayBurned: number;
  topContributorUsername: string;
  topContributorTokens: number;
  charityImpact: number;
  userRank: number | null;
  userTokensBurned: number;
  projectedRankAfterBurn: number | null;
}

interface TopContributor {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string | null;
  tokensBurned: number;
  rank: number;
}

export class TokenPoolService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Get current pool statistics
   * @param userId Optional user ID to get personalized stats for
   */
  async getPoolStats(userId?: number): Promise<PoolStats> {
    const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
    
    if (!currentPool) {
      throw new Error('No active token pool found');
    }

    // Count unique contributors
    const [contributorsResult] = await db.select({
      count: sql<number>`count(distinct ${poolContributions.userId})`
    }).from(poolContributions)
    .where(eq(poolContributions.poolRound, currentPool.distributionRound));

    const totalContributors = contributorsResult?.count || 0;
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.round((currentPool.totalTokens / currentPool.targetTokens) * 100));
    
    // Ensure next distribution date exists or create a default one
    const nextDistributionDate = currentPool.nextDistributionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days in future
    
    // Get tokens burned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBurned = await this.getTodaysBurnedTokens(currentPool.distributionRound, today);
    
    // Get top contributor
    const topContributor = await this.getTopContributor(currentPool.distributionRound);
    
    // Calculate charity impact (estimated dollar value based on token amount)
    const totalDistributed = await this.getTotalCharityImpact();
    const charityImpact = totalDistributed * TOKEN_CONVERSION_RATE;
    
    // Default user-specific stats
    let userRank = null;
    let userTokensBurned = 0;
    let projectedRankAfterBurn = null;
    
    // If user ID is provided, get personalized stats
    if (userId) {
      const userStats = await this.getUserPoolStats(userId, currentPool.distributionRound);
      userRank = userStats.rank;
      userTokensBurned = userStats.tokensBurned;
      
      // Calculate projected rank if user burns another NFT (350 tokens)
      if (userRank) {
        projectedRankAfterBurn = await this.getProjectedRankAfterBurn(
          userId, 
          currentPool.distributionRound, 
          userTokensBurned,
          350
        );
      }
    }
    
    return {
      totalTokens: currentPool.totalTokens,
      targetTokens: currentPool.targetTokens,
      progress,
      distributionRound: currentPool.distributionRound,
      totalContributors,
      nextDistributionDate,
      // Enhanced statistics
      todayBurned,
      topContributorUsername: topContributor?.username || 'No one yet',
      topContributorTokens: topContributor?.tokensBurned || 0,
      charityImpact: Math.round(charityImpact * 100) / 100, // Round to 2 decimal places
      userRank,
      userTokensBurned,
      projectedRankAfterBurn
    };
  }
  
  /**
   * Get tokens burned today for the current pool round
   */
  private async getTodaysBurnedTokens(poolRound: number, today: Date): Promise<number> {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await db.select({
      total: sql<number>`sum(${poolContributions.tokenAmount})`
    })
    .from(poolContributions)
    .where(
      and(
        eq(poolContributions.poolRound, poolRound),
        sql`${poolContributions.createdAt} >= ${today.toISOString()}`,
        sql`${poolContributions.createdAt} < ${tomorrow.toISOString()}`
      )
    );
    
    return result[0]?.total || 0;
  }
  
  /**
   * Get the top contributor for the current pool round
   */
  private async getTopContributor(poolRound: number): Promise<{ username: string, tokensBurned: number } | null> {
    const contributorSums = await db.select({
      userId: poolContributions.userId,
      totalTokens: sql<number>`sum(${poolContributions.tokenAmount})`
    })
    .from(poolContributions)
    .where(eq(poolContributions.poolRound, poolRound))
    .groupBy(poolContributions.userId)
    .orderBy(desc(sql<number>`sum(${poolContributions.tokenAmount})`))
    .limit(1);
    
    if (contributorSums.length === 0) {
      return null;
    }
    
    const { userId, totalTokens } = contributorSums[0];
    const [userInfo] = await db.select({
      username: users.username
    })
    .from(users)
    .where(eq(users.id, userId));
    
    return userInfo ? {
      username: userInfo.username,
      tokensBurned: totalTokens
    } : null;
  }
  
  /**
   * Calculate the total charity impact across all distributions
   */
  private async getTotalCharityImpact(): Promise<number> {
    const result = await db.select({
      total: sql<number>`sum(${poolDistributions.tokenAmount})`
    })
    .from(poolDistributions)
    .where(eq(poolDistributions.isCharity, true));
    
    return result[0]?.total || 0;
  }
  
  /**
   * Get a specific user's pool stats including rank and tokens burned
   */
  private async getUserPoolStats(userId: number, poolRound: number): Promise<{ rank: number | null, tokensBurned: number }> {
    // Get this user's total contribution
    const [userContribution] = await db.select({
      totalTokens: sql<number>`sum(${poolContributions.tokenAmount})`
    })
    .from(poolContributions)
    .where(
      and(
        eq(poolContributions.userId, userId),
        eq(poolContributions.poolRound, poolRound)
      )
    );
    
    const userTokens = userContribution?.totalTokens || 0;
    
    // If user hasn't contributed, return null rank
    if (userTokens === 0) {
      return { rank: null, tokensBurned: 0 };
    }
    
    // Count users with more tokens than this user
    const [rankResult] = await db.select({
      rank: sql<number>`count(*) + 1`
    })
    .from(
      db.select({
        userId: poolContributions.userId,
        totalTokens: sql<number>`sum(${poolContributions.tokenAmount})`
      })
      .from(poolContributions)
      .where(eq(poolContributions.poolRound, poolRound))
      .groupBy(poolContributions.userId)
      .as('contributions')
    )
    .where(sql`contributions.totalTokens > ${userTokens}`);
    
    return {
      rank: rankResult?.rank || null,
      tokensBurned: userTokens
    };
  }
  
  /**
   * Calculate the projected rank if user burns an NFT
   */
  private async getProjectedRankAfterBurn(
    userId: number, 
    poolRound: number, 
    currentTokens: number,
    additionalTokens: number
  ): Promise<number | null> {
    const newTotal = currentTokens + additionalTokens;
    
    // Count users with more tokens than the projected new total
    const [rankResult] = await db.select({
      rank: sql<number>`count(*) + 1`
    })
    .from(
      db.select({
        userId: poolContributions.userId,
        totalTokens: sql<number>`sum(${poolContributions.tokenAmount})`
      })
      .from(poolContributions)
      .where(
        and(
          eq(poolContributions.poolRound, poolRound),
          sql`${poolContributions.userId} <> ${userId}` // Exclude this user
        )
      )
      .groupBy(poolContributions.userId)
      .as('contributions')
    )
    .where(sql`contributions.totalTokens > ${newTotal}`);
    
    return rankResult?.rank || 1;
  }

  /**
   * Get top contributors for the current distribution round
   */
  async getTopContributors(limit: number = 50): Promise<TopContributor[]> {
    const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
    
    if (!currentPool) {
      return [];
    }

    // Get contributor sums grouped by user
    const contributorSums = await db.select({
      userId: poolContributions.userId,
      totalTokens: sql<number>`sum(${poolContributions.tokenAmount})`
    })
    .from(poolContributions)
    .where(eq(poolContributions.poolRound, currentPool.distributionRound))
    .groupBy(poolContributions.userId)
    .orderBy(desc(sql<number>`sum(${poolContributions.tokenAmount})`))
    .limit(limit);

    // Get user details for these contributors
    const topContributors: TopContributor[] = [];
    
    for (let i = 0; i < contributorSums.length; i++) {
      const { userId, totalTokens } = contributorSums[i];
      const [userInfo] = await db.select({
        id: users.id,
        username: users.username,
        profilePicture: users.profilePicture
      })
      .from(users)
      .where(eq(users.id, userId));

      if (userInfo) {
        topContributors.push({
          id: i + 1, // Generate a sequential ID for the leaderboard entry
          userId: userInfo.id,
          username: userInfo.username,
          profilePicture: userInfo.profilePicture,
          tokensBurned: totalTokens,
          rank: i + 1
        });
      }
    }

    return topContributors;
  }

  /**
   * Check for and create user's unminted NFTs they have earned
   * @param userId The user ID to check for
   */
  async checkAndGenerateUnmintedNfts(userId: number): Promise<string[]> {
    // This would implement the logic to check various criteria
    // and generate unminted NFTs if conditions are met
    // For instance, check journal streaks, participation stats, etc.
    
    // This is a simplified version that could be expanded:
    const messagesToUser: string[] = [];
    
    // Example: Check if user has a 7-day journal streak
    const sevenDayStreak = await this.storage.checkUserHasJournalStreak(userId, 7);
    if (sevenDayStreak) {
      const existingNft = await this.storage.findEmotionalNftByActivityAndUser(userId, 'seven_day_streak');
      
      if (!existingNft) {
        // Generate the NFT
        await this.storage.createEmotionalNft({
          userId,
          tokenId: `streak-${userId}-${Date.now()}`,
          emotion: 'happy', // Default or determine based on user's emotion history
          rarity: 'Uncommon', 
          activityType: 'seven_day_streak',
          imageUrl: '/assets/nfts/consistency-seed.png',
          metadata: JSON.stringify({
            name: 'Consistency Seed',
            description: 'Earned by maintaining a 7-day journal streak',
            bonusEffect: '+5% token earnings for 1 week',
            evolutionPath: 'Mindfulness Tree'
          }),
          mintStatus: 'unminted'
        });
        
        messagesToUser.push("Congratulations! You've earned a \"Consistency Seed\" NFT for your 7-day journal streak.");
        
        // Record the achievement in reward activities
        await this.storage.createRewardActivity({
          userId,
          activityType: 'badge_earned',
          tokensEarned: 0.5, // Small token reward for earning the NFT
          description: 'Earned "Consistency Seed" NFT for 7-day journal streak'
        });
      }
    }
    
    // Similar checks could be implemented for other milestones
    
    return messagesToUser;
  }

  /**
   * Mint an NFT from a user's unminted collection, costing tokens
   * @param userId The user's ID
   * @param nftId The NFT to mint
   */
  async mintNft(userId: number, nftId: number): Promise<boolean> {
    // Get the user and NFT
    const user = await this.storage.getUser(userId);
    const nft = await this.storage.getEmotionalNft(nftId);
    
    if (!user || !nft) {
      throw new Error('User or NFT not found');
    }
    
    if (nft.userId !== userId) {
      throw new Error('This NFT does not belong to the user');
    }
    
    if (nft.mintStatus !== 'unminted') {
      throw new Error('This NFT is already minted or burned');
    }
    
    // Check token balance
    const requiredTokens = 350; // Standard minting cost
    if (user.emotionTokens < requiredTokens) {
      throw new Error(`Not enough tokens. Minting requires ${requiredTokens} tokens.`);
    }
    
    // Update user's token balance
    await this.storage.updateUserTokens(userId, user.emotionTokens - requiredTokens);
    
    // Update NFT status
    await this.storage.updateEmotionalNftStatus(nftId, 'minted', new Date());
    
    // Record this transaction
    await this.storage.createRewardActivity({
      userId,
      activityType: 'token_transfer',
      tokensEarned: -requiredTokens, // Negative because tokens are being spent
      description: `Minted "${JSON.parse(nft.metadata).name}" NFT`
    });
    
    return true;
  }

  /**
   * Burn an NFT to contribute to the token pool
   * @param userId The user's ID
   * @param nftId The NFT to burn
   */
  async burnNft(userId: number, nftId: number): Promise<boolean> {
    // Get the user and NFT
    const user = await this.storage.getUser(userId);
    const nft = await this.storage.getEmotionalNft(nftId);
    
    if (!user || !nft) {
      throw new Error('User or NFT not found');
    }
    
    if (nft.userId !== userId) {
      throw new Error('This NFT does not belong to the user');
    }
    
    if (nft.mintStatus !== 'minted') {
      throw new Error('This NFT must be minted before it can be burned');
    }
    
    // Get current pool
    const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
    
    if (!currentPool) {
      throw new Error('No active token pool found');
    }
    
    // Update NFT status
    await this.storage.updateEmotionalNftStatus(nftId, 'burned', new Date());
    
    // Contribute to pool
    const tokenValue = 350; // Standard value for burned NFT
    await this.storage.createPoolContribution({
      userId,
      nftId,
      tokenAmount: tokenValue,
      poolRound: currentPool.distributionRound,
      transactionType: 'burn'
    });
    
    // Update token pool total
    await db.update(tokenPool)
      .set({ 
        totalTokens: currentPool.totalTokens + tokenValue,
        // Check if we've hit the target and need to prepare for distribution
        status: currentPool.totalTokens + tokenValue >= currentPool.targetTokens ? 'distributing' : 'active'
      })
      .where(eq(tokenPool.id, currentPool.id));
    
    // If the pool has reached its target, schedule the distribution
    if (currentPool.totalTokens + tokenValue >= currentPool.targetTokens) {
      // In a real implementation, you might want to trigger a background job
      // For now, we'll just update the next distribution date
      const distributionDate = new Date();
      distributionDate.setDate(distributionDate.getDate() + 7); // Distribution in 7 days
      
      await db.update(tokenPool)
        .set({ nextDistributionDate: distributionDate })
        .where(eq(tokenPool.id, currentPool.id));
    }
    
    return true;
  }

  /**
   * Gift an NFT to another user (one-time only per NFT)
   */
  async giftNft(fromUserId: number, toUserId: number, nftId: number): Promise<boolean> {
    const nft = await this.storage.getEmotionalNft(nftId);
    
    if (!nft) {
      throw new Error('NFT not found');
    }
    
    if (nft.userId !== fromUserId) {
      throw new Error('This NFT does not belong to you');
    }
    
    if (nft.mintStatus !== 'minted') {
      throw new Error('Only minted NFTs can be gifted');
    }
    
    if (nft.giftedTo) {
      throw new Error('This NFT has already been gifted once');
    }
    
    // Update the NFT record
    await this.storage.updateEmotionalNftGift(nftId, toUserId);
    
    // Create a notification for the recipient
    await this.storage.createNotification({
      userId: toUserId,
      title: 'New NFT Gift!',
      content: `You've received "${JSON.parse(nft.metadata).name}" NFT as a gift.`,
      type: 'nft_received',
      icon: '✨'
    });
    
    return true;
  }

  /**
   * Execute token pool distribution when target is reached
   * This would typically be called by a scheduled job
   */
  async executePoolDistribution(): Promise<boolean> {
    // Get current pool
    const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
    
    if (!currentPool || currentPool.status !== 'distributing') {
      return false;
    }
    
    // Get top contributors for rewards
    const topContributors = await this.getTopContributors(currentPool.maxTopContributors);
    
    // Calculate rewards
    const topContributorsTotal = currentPool.totalTokens * (currentPool.topContributorsPercentage / 100);
    const charityTotal = currentPool.totalTokens * (currentPool.charityPercentage / 100);
    
    // Distribute to each contributor based on rank
    for (const contributor of topContributors) {
      // Each top contributor gets an equal share
      const rewardAmount = Math.floor(topContributorsTotal / currentPool.maxTopContributors);
      
      // Update user's token balance
      const user = await this.storage.getUser(contributor.userId);
      if (user) {
        await this.storage.updateUserTokens(contributor.userId, user.emotionTokens + rewardAmount);
        
        // Record distribution
        await this.storage.createPoolDistribution({
          userId: contributor.userId,
          poolRound: currentPool.distributionRound,
          tokenAmount: rewardAmount,
          rank: contributor.rank,
          isCharity: false,
          status: 'completed'
        });
        
        // Notify user
        await this.storage.createNotification({
          userId: contributor.userId,
          title: 'Pool Distribution Reward!',
          content: `You ranked #${contributor.rank} and received ${rewardAmount} tokens from the pool distribution.`,
          type: 'token_received',
          icon: '🏆'
        });
      }
    }
    
    // Record charity distribution
    // In a real system, this would trigger an actual donation
    await this.storage.createPoolDistribution({
      userId: 0, // System user or charity ID
      poolRound: currentPool.distributionRound,
      tokenAmount: Math.floor(charityTotal),
      isCharity: true,
      charityName: 'Mental Health Foundation',
      status: 'completed'
    });
    
    // Create new pool for next round
    await db.insert(tokenPool).values({
      totalTokens: 0,
      targetTokens: currentPool.targetTokens,
      distributionRound: currentPool.distributionRound + 1,
      status: 'active',
      charityPercentage: currentPool.charityPercentage,
      topContributorsPercentage: currentPool.topContributorsPercentage,
      maxTopContributors: currentPool.maxTopContributors
    });
    
    // Update old pool status
    await db.update(tokenPool)
      .set({ 
        status: 'completed',
        lastDistributionAt: new Date()
      })
      .where(eq(tokenPool.id, currentPool.id));
    
    // Broadcast to all users about the charity donation
    const users = await this.storage.getAllUsers();
    const charityAmount = Math.floor(charityTotal * TOKEN_CONVERSION_RATE * 100) / 100; // Dollar amount with 2 decimal places
    
    for (const user of users) {
      await this.storage.createNotification({
        userId: user.id,
        title: 'MoodLync Charity Impact',
        content: `The MoodLync community just donated $${charityAmount} to mental health organizations through the token pool!`,
        type: 'system_announcement',
        icon: '💙'
      });
    }
    
    return true;
  }
}

// Constants
const TOKEN_CONVERSION_RATE = 0.0010; // $0.0010 per token