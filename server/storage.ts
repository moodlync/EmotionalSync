import {
  users,
  type User,
  type InsertUser,
  type Badge,
  type UserBadge,
  type Challenge,
  type InsertChallenge,
  type TokenRedemption,
  type InsertTokenRedemption,
  type UserChallengeCompletion,
  type InsertUserChallengeCompletion,
  type AdminUser,
  type InsertAdminUser,
  type SupportTicket,
  type InsertSupportTicket,
  type TicketResponse,
  type InsertTicketResponse,
  type RefundRequest,
  type InsertRefundRequest,
  type AdminAction,
  type InsertAdminAction,
  type Quote,
  type InsertQuote,
  type VideoPost,
  type InsertVideoPost,
  type VideoLike,
  type InsertVideoLike,
  type VideoComment,
  type InsertVideoComment,
  type VideoFollow,
  type InsertVideoFollow,
  type VideoSave, 
  type InsertVideoSave,
  type VideoDownload,
  type InsertVideoDownload,
  type UserFollow,
  type InsertUserFollow,
  type UserSession,
  type InsertUserSession,
  type MoodMatch,
  type InsertMoodMatch,
  type EmotionalImprint,
  type InsertEmotionalImprint,
  type EmotionalImprintInteraction,
  type InsertEmotionalImprintInteraction,
  type Advertisement,
  type InsertAdvertisement,
  type AdvertisementBooking,
  type InsertAdvertisementBooking,
  userPosts,
  postComments,
  postReactions,
  type ContentVisibility,
  type DeletionRequest,
  type InsertDeletionRequest,
  deletionRequests,
  emotionalNfts,
  type Notification,
  type InsertNotification,
  type NotificationType,
  NftRarity,
  EmotionType,
  OnlineStatus,
  RewardActivityType,
  ChallengeDifficulty,
  RedemptionStatus,
  RedemptionType,
  PaymentProvider,
  VideoCategory,
  GenderType,
  AdminRole,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  AdvertisementType,
  AdvertisementStatus,
  RefundStatus,
  AdminActionType,
  ImpressionColor,
  ImpressionSound,
  ImpressionVibration
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the chat room type
interface ChatRoom {
  id: number;
  name: string;
  description: string;
  emotion: EmotionType;
  participants: number;
  avatars: string[];
}

// Define the journal entry type
interface JournalEntry {
  id: number;
  userId: number;
  emotion: EmotionType;
  note: string;
  createdAt: string;
}

// Define the global emotion data type
interface RegionData {
  name: string;
  dominant: EmotionType;
  percentage: number;
}

// Define the user with emotion type
interface UserWithEmotion {
  id: number;
  username: string;
  emotion: EmotionType;
  lastActive: string;
  avatarUrl?: string;
}

// Define reward activity type
interface RewardActivity {
  id: number;
  userId: number;
  activityType: RewardActivityType;
  tokensEarned: number;
  description: string;
  createdAt: string;
}

// Define emotional NFT type
interface EmotionalNFT {
  id: number;
  userId: number;
  tokenId: string;
  metadata: string;
  emotion: EmotionType;
  rarity: NftRarity;
  activityType: string;
  createdAt: Date;
  imageUrl: string;
  isDisplayed: boolean;
  evolutionLevel: number;
  lastEvolvedAt?: Date;
  bonusGranted?: string;
  expiresAt?: Date;
}

// modify the interface with any CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserByIpAddress(ipAddress: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  createUser(user: InsertUser & { ipAddress?: string }): Promise<User>;
  updateUser(userId: number, userData: Partial<User>): Promise<User>;
  removeUser(userId: number): Promise<boolean>;
  
  // Trial management
  startFreeTrial(userId: number, trialDays: number): Promise<User>;
  isUserInActiveTrial(userId: number): Promise<boolean>;
  checkAndExpireTrials(): Promise<void>;
  
  // User session management
  createUserSession(sessionData: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  updateUserSessionStatus(sessionToken: string, status: OnlineStatus): Promise<UserSession>;
  updateUserSessionActivity(sessionToken: string): Promise<UserSession>;
  closeUserSession(sessionToken: string): Promise<UserSession | undefined>;
  getUserActiveSessions(userId: number): Promise<UserSession[]>;
  getActiveUsers(): Promise<User[]>;
  
  // Mood matching
  findMoodMatches(userId: number, emotion: EmotionType): Promise<MoodMatch[]>;
  createMoodMatch(matchData: InsertMoodMatch): Promise<MoodMatch>;
  getUserMoodMatches(userId: number): Promise<MoodMatch[]>;
  updateMoodMatchStatus(matchId: number, status: string): Promise<MoodMatch>;
  acceptMoodMatch(matchId: number): Promise<MoodMatch>;
  rejectMoodMatch(matchId: number): Promise<MoodMatch>;
  
  // Emotion tracking
  updateUserEmotion(userId: number, emotion: EmotionType): Promise<void>;
  getUserEmotion(userId: number): Promise<EmotionType | undefined>;
  getUsersByEmotion(emotion: EmotionType): Promise<UserWithEmotion[]>;
  createJournalEntry(userId: number, emotion: EmotionType, note: string): Promise<JournalEntry>;
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getChatRooms(): Promise<ChatRoom[]>;
  createChatRoom(userId: number, chatRoom: InsertChatRoom): Promise<ChatRoom>;
  updateChatRoom(chatRoomId: number, updates: Partial<InsertChatRoom>): Promise<ChatRoom>;
  deleteChatRoom(chatRoomId: number): Promise<boolean>;
  
  // Subscription management
  getUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  updateUserSubscription(userId: number, data: Partial<UserSubscription>): Promise<UserSubscription>;
  getChatRoomById(chatRoomId: number): Promise<ChatRoom | undefined>;
  getPrivateChatRoomsByUserId(userId: number): Promise<ChatRoom[]>;
  
  // Account and data deletion management
  createDeletionRequest(data: InsertDeletionRequest): Promise<DeletionRequest>;
  getDeletionRequests(): Promise<DeletionRequest[]>;
  getDeletionRequestsByUser(userId: number): Promise<DeletionRequest[]>;
  updateDeletionRequest(requestId: number, updates: Partial<DeletionRequest>): Promise<DeletionRequest>;
  
  // Subscription management methods
  updateSubscriptionStatus(userId: number, isCancelled: boolean, cancelledAt?: Date | null): Promise<User>;
  setPremiumExpiryDate(userId: number, expiryDate: Date): Promise<User>;
  
  // Chat Room Participants methods
  addChatRoomParticipant(chatRoomId: number, userId: number, isAdmin?: boolean): Promise<ChatRoomParticipant>;
  removeChatRoomParticipant(chatRoomId: number, userId: number): Promise<boolean>;
  getChatRoomParticipants(chatRoomId: number): Promise<(ChatRoomParticipant & { user: User })[]>;
  isUserInChatRoom(chatRoomId: number, userId: number): Promise<boolean>;
  
  // User Blocking methods
  blockUser(userId: number, blockedUserId: number, reason?: string): Promise<BlockedUser>;
  unblockUser(userId: number, blockedUserId: number): Promise<boolean>;
  getBlockedUsers(userId: number): Promise<(BlockedUser & { blockedUser: User })[]>;
  isUserBlocked(userId: number, blockedUserId: number): Promise<boolean>;
  
  getGlobalEmotionData(): Promise<RegionData[]>;
  
  // Reward-related methods
  getUserTokens(userId: number): Promise<number>;
  addUserTokens(userId: number, tokens: number): Promise<number>;
  transferTokens(fromUserId: number, toUserId: number, amount: number, notes?: string): Promise<{
    fromUser: User;
    toUser: User;
    amount: number;
    timestamp: Date;
  }>;
  createRewardActivity(userId: number, activityType: RewardActivityType, tokens: number, description: string): Promise<RewardActivity>;
  getRewardActivities(userId: number): Promise<RewardActivity[]>;
  
  // Gamification-related methods
  getGamificationProfile(userId: number): Promise<any>;
  getGamificationChallenges(): Promise<any[]>;
  getGamificationAchievements(): Promise<any[]>;
  getGamificationLeaderboard(): Promise<any[]>;
  completeGamificationActivity(userId: number, activityId: string): Promise<any>;
  claimAchievementReward(userId: number, achievementId: string): Promise<any>;
  checkInStreak(userId: number, emotion: EmotionType): Promise<any>;
  getRecentActiveGamificationProfiles(): Promise<any[]>;
  incrementChallengeProgress(userId: number, challengeId: string, amount: number): Promise<any>;
  
  // Profile picture related methods
  updateUserProfilePicture(userId: number, profilePicture: string): Promise<User>;
  
  // Milestone sharing methods
  createMilestoneShare(shareData: InsertMilestoneShare): Promise<MilestoneShare>;
  getUserMilestoneShares(userId: number): Promise<MilestoneShare[]>;
  hasUserSharedMilestone(userId: number, milestone: number): Promise<boolean>;
  updateMilestoneShareTokens(shareId: number, tokensAwarded: number): Promise<MilestoneShare>;
  incrementMilestoneShareClicks(trackingId: string): Promise<MilestoneShare>;
  incrementMilestoneShareConversions(trackingId: string): Promise<MilestoneShare>;
  
  // Badge related methods
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;
  
  // Enhanced challenge methods
  getChallengesByDifficulty(difficulty: ChallengeDifficulty): Promise<Challenge[]>;
  completeChallenge(userId: number, challengeId: number): Promise<{
    challenge: Challenge;
    tokensAwarded: number;
    badgeAwarded?: Badge;
  }>;
  
  // Premium user challenge creation
  createUserChallenge(userId: number, challengeData: InsertChallenge): Promise<Challenge>;
  getUserCreatedChallenges(userId: number): Promise<Challenge[]>;
  recordChallengeProgress(userId: number, challengeId: number, notes?: string): Promise<UserChallengeCompletion>;
  getChallengeCompletions(challengeId: number): Promise<UserChallengeCompletion[]>;
  getUserChallengeProgress(userId: number, challengeId: number): Promise<number>;
  getPublicUserCreatedChallenges(): Promise<Challenge[]>;
  rewardChallengeCreator(challengeId: number, completerId: number): Promise<{
    creator: User;
    completer: User;
    tokensAwarded: number;
  } | null>;
  
  // Premium user and subscription methods
  updateUserPremiumStatus(userId: number, isPremium: boolean, planType?: PremiumPlanType): Promise<User>;
  updateUserPaymentDetails(userId: number, paymentProvider: PaymentProvider, accountInfo: string): Promise<User>;
  updateSubscriptionStatus(userId: number, isCancelled: boolean): Promise<User>;
  setPremiumExpiryDate(userId: number, expiryDate: Date): Promise<User>;
  
  // Family plan methods
  createPremiumPlan(userId: number, planData: InsertPremiumPlan): Promise<PremiumPlan>;
  getUserPremiumPlan(userId: number): Promise<PremiumPlan | undefined>;
  addFamilyMember(userId: number, familyMemberData: InsertFamilyRelationship): Promise<FamilyRelationship>;
  getFamilyMembers(userId: number): Promise<(FamilyRelationship & { relatedUser: User })[]>;
  updateFamilyMember(relationshipId: number, updates: Partial<InsertFamilyRelationship>): Promise<FamilyRelationship>;
  removeFamilyMember(relationshipId: number): Promise<boolean>;
  updateMoodTrackingConsent(userId: number, allowMoodTracking: boolean): Promise<User>;
  getFamilyMoodData(userId: number): Promise<{
    familyMember: User;
    currentMood: EmotionType;
    lastUpdated: string;
    moodHistory: { emotion: EmotionType; timestamp: string }[];
  }[]>;
  
  // Video posts methods for premium users
  createVideoPost(userId: number, videoPostData: InsertVideoPost): Promise<VideoPost>;
  
  // Community and support features
  getCommunityPosts(filter: string, userId: number): Promise<Array<any>>;
  getCommunityPostById(postId: number): Promise<any | undefined>;
  createCommunityPost(userId: number, postData: any): Promise<any>;
  updateCommunityPost(postId: number, updates: any): Promise<any>;
  deleteCommunityPost(postId: number): Promise<boolean>;
  getPostComments(postId: number): Promise<Array<any>>;
  createPostComment(postId: number, userId: number, content: string): Promise<any>;
  deletePostComment(postId: number, commentId: number): Promise<boolean>;
  likePost(postId: number, userId: number): Promise<{ postId: number; userId: number; likeCount: number }>;
  unlikePost(postId: number, userId: number): Promise<{ postId: number; userId: number; likeCount: number }>;
  checkFriendship(userId: number, otherUserId: number): Promise<boolean>;
  getSupportGroups(): Promise<any[]>;
  getExpertTips(category?: string): Promise<any[]>;
  
  // NFT Token Pool System
  createTokenPool(data: InsertTokenPool): Promise<TokenPool>;
  updateTokenPool(poolId: number, data: Partial<TokenPool>): Promise<TokenPool>;
  getCurrentTokenPool(): Promise<TokenPool | null>;
  getTokenPoolById(poolId: number): Promise<TokenPool | null>;
  getTopPoolContributors(poolRound: number, limit: number): Promise<{userId: number, username: string, totalContribution: number}[]>;
  createPoolContribution(data: InsertPoolContribution): Promise<PoolContribution>;
  getPoolContributionsByUser(userId: number, poolRound: number): Promise<PoolContribution[]>;
  getUserPoolContributionStats(userId: number, poolRound: number): Promise<{totalContribution: number, rank: number, contributionCount: number}>;
  createPoolDistribution(data: InsertPoolDistribution): Promise<PoolDistribution>;
  getPoolDistributionsByUser(userId: number): Promise<PoolDistribution[]>;
  getEmotionalNft(nftId: number): Promise<EmotionalNft | null>;
  getUserEmotionalNfts(userId: number): Promise<EmotionalNft[]>;
  createEmotionalNft(data: InsertEmotionalNft): Promise<EmotionalNft>;
  updateEmotionalNft(nftId: number, data: Partial<EmotionalNft>): Promise<EmotionalNft>;
  getVideoPost(postId: number): Promise<VideoPost | undefined>;
  getUserVideoPosts(userId: number): Promise<VideoPost[]>;
  getAllPublicVideoPosts(): Promise<VideoPost[]>;
  getVideoPostsByCategory(category: VideoCategory): Promise<VideoPost[]>;
  updateVideoPost(postId: number, updates: Partial<InsertVideoPost>): Promise<VideoPost>;
  deleteVideoPost(postId: number): Promise<boolean>;
  incrementVideoPostViews(postId: number): Promise<VideoPost>;
  incrementVideoPostLikes(postId: number): Promise<VideoPost>;
  incrementVideoPostShares(postId: number): Promise<VideoPost>;
  incrementVideoPostComments(postId: number): Promise<VideoPost>;
  incrementVideoPostDownloads(postId: number): Promise<VideoPost>;
  incrementVideoPostFollows(postId: number): Promise<VideoPost>;
  
  // Video social interaction methods
  likeVideo(userId: number, videoId: number): Promise<VideoLike>;
  unlikeVideo(userId: number, videoId: number): Promise<boolean>;
  isVideoLikedByUser(userId: number, videoId: number): Promise<boolean>;
  getVideoLikes(videoId: number): Promise<VideoLike[]>;
  
  commentOnVideo(userId: number, videoId: number, commentData: InsertVideoComment): Promise<VideoComment>;
  getVideoComments(videoId: number): Promise<(VideoComment & {user: User})[]>;
  getCommentReplies(commentId: number): Promise<VideoComment[]>;
  editVideoComment(commentId: number, content: string): Promise<VideoComment>;
  deleteVideoComment(commentId: number): Promise<boolean>;
  
  followVideo(userId: number, videoId: number): Promise<VideoFollow>;
  unfollowVideo(userId: number, videoId: number): Promise<boolean>;
  getVideoFollowers(videoId: number): Promise<(VideoFollow & {user: User})[]>;
  isVideoFollowedByUser(userId: number, videoId: number): Promise<boolean>;
  
  saveVideo(userId: number, videoId: number): Promise<VideoSave>;
  unsaveVideo(userId: number, videoId: number): Promise<boolean>;
  getUserSavedVideos(userId: number): Promise<(VideoSave & {video: VideoPost})[]>;
  isVideoSavedByUser(userId: number, videoId: number): Promise<boolean>;
  
  downloadVideo(userId: number, videoId: number, ipAddress?: string): Promise<VideoDownload>;
  getUserDownloadedVideos(userId: number): Promise<(VideoDownload & {video: VideoPost})[]>;
  getVideoDownloads(videoId: number): Promise<VideoDownload[]>;
  
  // User profile social metrics methods
  updateUserVideoStats(userId: number): Promise<{
    videoCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalDownloads: number;
  }>;
  
  // User follows methods
  followUser(followerId: number, followedId: number): Promise<UserFollow>;
  unfollowUser(followerId: number, followedId: number): Promise<boolean>;
  getUserFollowers(userId: number): Promise<(UserFollow & {follower: User})[]>;
  getUserFollowing(userId: number): Promise<(UserFollow & {followed: User})[]>;
  isUserFollowedByUser(followerId: number, followedId: number): Promise<boolean>;
  updateUserFollowerCount(userId: number): Promise<User>;
  
  // Notification methods
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<boolean>;
  sendSystemNotification(
    userIds: number[], 
    title: string, 
    content: string, 
    type: NotificationType,
    actionLink?: string,
    icon?: string
  ): Promise<Notification[]>;
  
  // User session management
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  updateUserSessionStatus(sessionToken: string, status: OnlineStatus): Promise<UserSession>;
  updateUserSessionActivity(sessionToken: string): Promise<UserSession>;
  closeUserSession(sessionToken: string): Promise<UserSession | undefined>;
  getUserActiveSessions(userId: number): Promise<UserSession[]>;
  updateUserStatus(userId: number, status: OnlineStatus): Promise<User>;
  getActiveUsers(): Promise<User[]>;
  
  // Mood-based matching algorithm
  findMoodMatches(userId: number, emotion: EmotionType): Promise<MoodMatch[]>;
  createMoodMatch(matchData: InsertMoodMatch): Promise<MoodMatch>;
  getUserMoodMatches(userId: number): Promise<(MoodMatch & { matchedUser: User })[]>;
  updateMoodMatchStatus(matchId: number, status: string): Promise<MoodMatch>;
  acceptMoodMatch(matchId: number): Promise<MoodMatch>;
  rejectMoodMatch(matchId: number): Promise<MoodMatch>;
  calculateMoodCompatibility(userEmotion: EmotionType, otherEmotion: EmotionType): Promise<number>;
  
  // Token redemption methods
  createTokenRedemption(userId: number, redemptionData: InsertTokenRedemption): Promise<TokenRedemption>;
  getUserTokenRedemptions(userId: number): Promise<TokenRedemption[]>;
  updateTokenRedemptionStatus(redemptionId: number, status: RedemptionStatus): Promise<TokenRedemption>;
  getEligibleForRedemption(userId: number): Promise<{
    eligible: boolean;
    tokenBalance: number;
    conversionRate: number;
    minimumTokens: number;
    estimatedCashAmount: number;
  }>;
  
  // Referral methods
  createReferral(referrerUserId: number, referredUserId: number | null, referralEmail: string | null, referralCode: string): Promise<Referral>;
  getReferralsByUser(userId: number): Promise<Referral[]>;
  updateReferralStatus(referralId: number, status: ReferralStatus): Promise<Referral | null>;
  getReferralByCode(referralCode: string): Promise<Referral | null>;
  checkAndAwardReferralBounty(userId: number): Promise<{
    awarded: boolean;
    tokensAwarded: number;
    currentReferralCount: number;
  }>;
  getReferralStatistics(userId: number): Promise<{
    totalReferrals: number;
    pendingReferrals: number;
    registeredReferrals: number;
    convertedReferrals: number;
    expiredReferrals: number;
    totalTokensEarned: number;
    convertedCount: number;
    bountyEligible: boolean;
    nextBountyTokens: number;
    referralsUntilNextBounty: number;
  }>;
  
  // Admin User Management methods
  createAdminUser(adminData: InsertAdminUser): Promise<AdminUser>;
  getAdminUser(adminId: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  updateAdminUser(adminId: number, updates: Partial<InsertAdminUser>): Promise<AdminUser>;
  deleteAdminUser(adminId: number): Promise<boolean>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
  // Support Ticket methods
  createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(ticketId: number): Promise<SupportTicket | undefined>;
  updateSupportTicket(ticketId: number, updates: Partial<InsertSupportTicket> & { status?: TicketStatus, assignedTo?: number }): Promise<SupportTicket>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(filters?: { status?: TicketStatus, category?: TicketCategory, priority?: TicketPriority, assignedTo?: number }): Promise<SupportTicket[]>;
  
  // Ticket Response methods
  createTicketResponse(responseData: InsertTicketResponse): Promise<TicketResponse>;
  getTicketResponses(ticketId: number): Promise<TicketResponse[]>;
  markResponseHelpful(responseId: number, isHelpful: boolean): Promise<TicketResponse>;
  
  // Refund Request methods
  createRefundRequest(refundData: InsertRefundRequest): Promise<RefundRequest>;
  getRefundRequest(refundId: number): Promise<RefundRequest | undefined>;
  updateRefundRequest(refundId: number, updates: { status?: RefundStatus, notes?: string, processedBy?: number }): Promise<RefundRequest>;
  getRefundRequestsByUser(userId: number): Promise<RefundRequest[]>;
  getAllRefundRequests(filters?: { status?: RefundStatus }): Promise<RefundRequest[]>;
  
  // Admin Actions methods
  createAdminAction(actionData: InsertAdminAction): Promise<AdminAction>;
  getAdminActions(adminId: number): Promise<AdminAction[]>;
  getActionsByTarget(targetType: string, targetId: number): Promise<AdminAction[]>;
  getAllAdminActions(limit?: number): Promise<AdminAction[]>;
  
  // Quote methods
  createQuote(quoteData: InsertQuote): Promise<Quote>;
  getQuote(quoteId: number): Promise<Quote | undefined>;
  updateQuoteStatus(quoteId: number, status: string, acceptedAt?: Date): Promise<Quote>;
  getUserQuotes(userId: number): Promise<Quote[]>;
  getQuotesByTicket(ticketId: number): Promise<Quote[]>;
  
  // Verification Document methods
  createVerificationDocument(documentData: {
    userId: number;
    documentType: string;
    documentNumber: string;
    documentUrl?: string;
    expirationDate?: Date;
    issuedBy?: string;
    issuedDate?: Date;
    verificationStatus: "pending" | "verified" | "not_verified";
    submittedAt: Date;
  }): Promise<any>;
  
  getVerificationDocumentsByUser(userId: number): Promise<any[]>;
  updateVerificationDocumentStatus(
    documentId: number, 
    status: "pending" | "verified" | "not_verified", 
    verifiedBy?: number,
    verifierNotes?: string
  ): Promise<any>;
  
  // Admin Dashboard methods
  getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    openTickets: number;
    pendingRefunds: number;
    usersByEmotion: Record<EmotionType, number>;
    recentTickets: SupportTicket[];
    recentRefunds: RefundRequest[];
  }>;
  
  // Advertisement methods
  createAdvertisement(userId: number, data: InsertAdvertisement): Promise<Advertisement>;
  getAdvertisementById(id: number): Promise<Advertisement | undefined>;
  getUserAdvertisements(userId: number): Promise<Advertisement[]>;
  getAllPublishedAdvertisements(): Promise<(Advertisement & { user: User })[]>;
  getAdvertisementsByType(type: AdvertisementType): Promise<(Advertisement & { user: User })[]>;
  updateAdvertisement(id: number, data: Partial<InsertAdvertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: number): Promise<boolean>;
  updateAdvertisementStatus(id: number, status: AdvertisementStatus): Promise<Advertisement>;
  incrementAdvertisementViewCount(id: number): Promise<Advertisement>;
  createAdvertisementPayment(id: number, provider: PaymentProvider, transactionId: string): Promise<Advertisement>;
  
  // Advertisement booking methods
  createAdvertisementBooking(data: InsertAdvertisementBooking): Promise<AdvertisementBooking>;
  getAdvertisementBookingById(id: number): Promise<AdvertisementBooking | undefined>;
  getAdvertisementBookings(advertisementId: number): Promise<(AdvertisementBooking & { user: User })[]>;
  getUserBookings(userId: number): Promise<(AdvertisementBooking & { advertisement: Advertisement })[]>;
  updateAdvertisementBookingStatus(id: number, status: string): Promise<AdvertisementBooking>;
  updateBookingLocationDetails(id: number, locationDetails: string): Promise<AdvertisementBooking>;
  incrementAdvertisementBookingCount(advertisementId: number): Promise<Advertisement>;
  
  // Emotional Imprints methods (premium feature)
  createEmotionalImprint(data: InsertEmotionalImprint): Promise<EmotionalImprint>;
  getEmotionalImprint(id: number): Promise<EmotionalImprint | undefined>;
  getUserEmotionalImprints(userId: number): Promise<EmotionalImprint[]>;
  getPublicEmotionalImprints(): Promise<EmotionalImprint[]>;
  getEmotionalImprintTemplates(): Promise<EmotionalImprint[]>;
  updateEmotionalImprint(id: number, updates: Partial<InsertEmotionalImprint>): Promise<EmotionalImprint>;
  deleteEmotionalImprint(id: number): Promise<boolean>;
  createEmotionalImprintInteraction(data: InsertEmotionalImprintInteraction): Promise<EmotionalImprintInteraction>;
  getEmotionalImprintInteractions(imprintId: number): Promise<(EmotionalImprintInteraction & { receiver: User })[]>;
  getReceivedEmotionalImprints(userId: number): Promise<(EmotionalImprintInteraction & { imprint: EmotionalImprint, sender?: User })[]>;
  
  // Notification methods
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<boolean>;
  sendSystemNotification(
    userIds: number[],
    title: string,
    content: string,
    type: NotificationType,
    actionLink?: string,
    icon?: string
  ): Promise<Notification[]>;
  
  // Subscription management methods
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  updateUserSubscription(userId: number, data: Partial<Subscription>): Promise<Subscription>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private nextDeletionRequestId = 1;
  private nextCommunityPostId = 1;
  private nextPostCommentId = 1;
  private nextPostReactionId = 1;
  
  // Make these properties accessible to test-controller.ts
  public users: Map<number, User> = new Map();
  public userEmotions: Map<number, EmotionType> = new Map();
  public journalEntries: Map<number, JournalEntry[]> = new Map();
  public notifications: Map<number, Notification> = new Map();
  public userNotifications: Map<number, number[]> = new Map(); // userId -> notificationIds
  public deletionRequests: Map<number, DeletionRequest> = new Map();
  public userDeletionRequests: Map<number, number[]> = new Map(); // userId -> deletionRequestIds
  
  // Community feature maps
  public communityPosts: Map<number, any> = new Map(); // postId -> Post
  public postComments: Map<number, any[]> = new Map(); // postId -> Comments[]
  public postReactions: Map<number, Map<number, any>> = new Map(); // postId -> Map<userId, Reaction>
  public supportGroups: any[] = [];
  public expertTips: any[] = [];
  
  // NFT Pool System storage
  private nextTokenPoolId = 1;
  private nextEmotionalNftId = 1;
  private nextPoolContributionId = 1;
  private nextPoolDistributionId = 1;
  public tokenPools: Map<number, TokenPool> = new Map();
  public emotionalNfts: Map<number, EmotionalNft> = new Map();
  public userEmotionalNfts: Map<number, number[]> = new Map(); // userId -> nftIds
  public poolContributions: Map<number, PoolContribution> = new Map();
  public userPoolContributions: Map<number, number[]> = new Map(); // userId -> contributionIds
  public poolDistributions: Map<number, PoolDistribution> = new Map();
  public userPoolDistributions: Map<number, number[]> = new Map(); // userId -> distributionIds
  
  // Subscription storage
  private nextSubscriptionId = 1;
  public subscriptions: Map<number, Subscription> = new Map(); // userId -> subscription
  
  // Custom mood tags and insights
  private nextCustomMoodTagId = 1;
  public customMoodTags: Map<number, CustomMoodTag[]> = new Map(); // userId -> custom mood tags
  public weeklyMoodReports: Map<number, WeeklyMoodReport[]> = new Map(); // userId -> weekly reports
  // User Session Management methods
  async createUserSession(sessionData: InsertUserSession): Promise<UserSession> {
    const session: UserSession = {
      id: this.sessionId++,
      ...sessionData,
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
    
    this.userSessions.set(sessionData.sessionToken, session);
    
    // Add to user active sessions map
    if (!this.userActiveSessions.has(sessionData.userId)) {
      this.userActiveSessions.set(sessionData.userId, []);
    }
    this.userActiveSessions.get(sessionData.userId)!.push(session);
    
    // Update user status to online
    this.updateUserStatus(sessionData.userId, "online");
    
    return session;
  }
  
  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    return this.userSessions.get(sessionToken);
  }
  
  async updateUserSessionStatus(sessionToken: string, status: OnlineStatus): Promise<UserSession> {
    if (!this.userSessions.has(sessionToken)) {
      throw new Error("Session not found");
    }
    
    const session = this.userSessions.get(sessionToken)!;
    session.status = status;
    session.lastActiveTime = new Date();
    this.userSessions.set(sessionToken, session);
    
    // Update user status if this is their most recent session
    const userSessions = this.userActiveSessions.get(session.userId) || [];
    const mostRecentSession = userSessions.sort((a, b) => 
      (b.lastActiveTime?.getTime() || 0) - (a.lastActiveTime?.getTime() || 0)
    )[0];
    
    if (mostRecentSession && mostRecentSession.sessionToken === sessionToken) {
      this.updateUserStatus(session.userId, status);
    }
    
    return session;
  }
  
  async updateUserSessionActivity(sessionToken: string): Promise<UserSession> {
    if (!this.userSessions.has(sessionToken)) {
      throw new Error("Session not found");
    }
    
    const session = this.userSessions.get(sessionToken)!;
    session.lastActiveTime = new Date();
    this.userSessions.set(sessionToken, session);
    
    // Update the user's last active timestamp
    if (this.users.has(session.userId)) {
      const user = this.users.get(session.userId)!;
      user.lastActiveAt = new Date();
      this.users.set(session.userId, user);
    }
    
    return session;
  }
  
  async closeUserSession(sessionToken: string): Promise<UserSession | undefined> {
    if (!this.userSessions.has(sessionToken)) {
      return undefined;
    }
    
    const session = this.userSessions.get(sessionToken)!;
    session.status = "offline";
    session.endedAt = new Date();
    
    // Remove from active sessions
    if (this.userActiveSessions.has(session.userId)) {
      const sessions = this.userActiveSessions.get(session.userId)!;
      const filteredSessions = sessions.filter(s => s.sessionToken !== sessionToken);
      this.userActiveSessions.set(session.userId, filteredSessions);
      
      // Update user status if they have no more active sessions
      if (filteredSessions.length === 0) {
        this.updateUserStatus(session.userId, "offline");
      }
    }
    
    return session;
  }
  
  async getUserActiveSessions(userId: number): Promise<UserSession[]> {
    return this.userActiveSessions.get(userId) || [];
  }
  
  async updateUserStatus(userId: number, status: OnlineStatus): Promise<User> {
    if (!this.users.has(userId)) {
      throw new Error("User not found");
    }
    
    const user = this.users.get(userId)!;
    user.status = status;
    user.lastActiveAt = new Date();
    this.users.set(userId, user);
    
    return user;
  }
  
  async getActiveUsers(): Promise<User[]> {
    const result: User[] = [];
    
    for (const [id, user] of this.users.entries()) {
      if (user.status === "online" || user.status === "away" || user.status === "busy") {
        result.push(user);
      }
    }
    
    return result;
  }
  
  // Mood-based matching algorithm methods
  async findMoodMatches(userId: number, emotion: EmotionType): Promise<MoodMatch[]> {
    // Get all users with their emotions
    const allMatches: MoodMatch[] = [];
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Find users with compatible emotions and create matches
    for (const [otherId, otherEmotion] of this.userEmotions.entries()) {
      // Don't match with self
      if (otherId === userId) continue;
      
      // Calculate compatibility score
      const score = await this.calculateMoodCompatibility(emotion, otherEmotion);
      
      // Only include matches with reasonable compatibility (above 40%)
      if (score > 0.4) {
        const otherUser = this.users.get(otherId);
        
        // Only match with active users
        if (otherUser && (otherUser.status === "online" || otherUser.status === "away")) {
          const match: MoodMatch = {
            id: this.matchId++,
            userId,
            matchedUserId: otherId,
            score,
            userEmotion: emotion,
            matchedUserEmotion: otherEmotion,
            status: "pending",
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
          };
          
          allMatches.push(match);
          
          // Add to mood matches map
          if (!this.moodMatches.has(userId)) {
            this.moodMatches.set(userId, []);
          }
          this.moodMatches.get(userId)!.push(match);
        }
      }
    }
    
    // Sort by compatibility score (highest first)
    return allMatches.sort((a, b) => b.score - a.score);
  }
  
  async createMoodMatch(matchData: InsertMoodMatch): Promise<MoodMatch> {
    const match: MoodMatch = {
      id: this.matchId++,
      ...matchData,
      createdAt: new Date()
    };
    
    // Add to mood matches map for both users
    if (!this.moodMatches.has(matchData.userId)) {
      this.moodMatches.set(matchData.userId, []);
    }
    this.moodMatches.get(matchData.userId)!.push(match);
    
    return match;
  }
  
  async getUserMoodMatches(userId: number): Promise<(MoodMatch & { matchedUser: User })[]> {
    const matches = this.moodMatches.get(userId) || [];
    
    return matches.map(match => {
      const matchedUser = this.users.get(match.matchedUserId)!;
      return {
        ...match,
        matchedUser
      };
    });
  }
  
  async getMoodMatch(matchId: number): Promise<MoodMatch | undefined> {
    // Find the match in all user match lists
    for (const [userId, matches] of this.moodMatches.entries()) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        return match;
      }
    }
    
    return undefined;
  }
  
  async updateMoodMatchStatus(matchId: number, status: string): Promise<MoodMatch> {
    // Find the match in all user match lists
    for (const [userId, matches] of this.moodMatches.entries()) {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex !== -1) {
        matches[matchIndex].status = status;
        matches[matchIndex].lastInteractionAt = new Date();
        
        if (status === "accepted") {
          matches[matchIndex].acceptedAt = new Date();
        } else if (status === "rejected") {
          matches[matchIndex].rejectedAt = new Date();
        }
        
        return matches[matchIndex];
      }
    }
    
    throw new Error("Match not found");
  }
  
  async acceptMoodMatch(matchId: number): Promise<MoodMatch> {
    return this.updateMoodMatchStatus(matchId, "accepted");
  }
  
  async rejectMoodMatch(matchId: number): Promise<MoodMatch> {
    return this.updateMoodMatchStatus(matchId, "rejected");
  }
  
  async calculateMoodCompatibility(userEmotion: EmotionType, otherEmotion: EmotionType): Promise<number> {
    // Define emotion compatibility matrix
    const compatibilityMatrix: Record<EmotionType, Record<EmotionType, number>> = {
      happy: {
        happy: 0.9,    // Happy users match well with other happy users
        sad: 0.3,      // Happy users can help sad users
        angry: 0.2,    // Happy users might calm angry users
        anxious: 0.4,  // Happy users can reassure anxious users
        excited: 0.8,  // Happy and excited are compatible
        neutral: 0.6   // Happy users can engage with neutral users
      },
      sad: {
        happy: 0.3,    // Sad users might be uplifted by happy users
        sad: 0.7,      // Sad users understand each other's feelings
        angry: 0.2,    // Sad and angry don't mix well
        anxious: 0.5,  // Sad and anxious can relate to negative emotions
        excited: 0.1,  // Excited energy might overwhelm sad users
        neutral: 0.4   // Neutral is a balanced match for sad
      },
      angry: {
        happy: 0.2,    // Happy might seem dismissive to angry users
        sad: 0.2,      // Sad might bring angry users down further
        angry: 0.3,    // Two angry users might escalate each other
        anxious: 0.2,  // Angry might overwhelm anxious
        excited: 0.2,  // Excited energy might clash with anger
        neutral: 0.5   // Neutral can be a calming influence
      },
      anxious: {
        happy: 0.4,    // Happy can be reassuring to anxious
        sad: 0.5,      // Both experience difficult emotions
        angry: 0.2,    // Angry might increase anxiety
        anxious: 0.6,  // Can relate to each other's feelings
        excited: 0.3,  // Excited energy might increase anxiety
        neutral: 0.7   // Neutral is calming for anxious
      },
      excited: {
        happy: 0.8,    // Both positive, high energy
        sad: 0.1,      // Different energy levels
        angry: 0.2,    // Clash of emotions
        anxious: 0.3,  // Might be overwhelming
        excited: 0.9,  // Great match in energy
        neutral: 0.5   // Balanced match
      },
      neutral: {
        happy: 0.6,    // Good balance
        sad: 0.4,      // Can provide stability
        angry: 0.5,    // Can be calming
        anxious: 0.7,  // Can be reassuring
        excited: 0.5,  // Can balance energy
        neutral: 0.7   // Comfortable match
      }
    };
    
    // Return the compatibility score from the matrix
    return compatibilityMatrix[userEmotion][otherEmotion];
  }
  
  // Notification methods
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.notificationId++,
      ...notificationData,
      createdAt: new Date(),
      readAt: null,
      isRead: false,
      isPushSent: false,
      isEmailSent: false
    };
    
    // Save notification
    this.notifications.set(notification.id, notification);
    
    // Add to user notifications
    if (!this.userNotifications.has(notification.userId)) {
      this.userNotifications.set(notification.userId, []);
    }
    this.userNotifications.get(notification.userId)!.push(notification.id);
    
    return notification;
  }
  
  async getNotifications(userId: number): Promise<Notification[]> {
    const notificationIds = this.userNotifications.get(userId) || [];
    const notifications: Notification[] = [];
    
    for (const id of notificationIds) {
      const notification = this.notifications.get(id);
      if (notification) {
        notifications.push(notification);
      }
    }
    
    // Sort by creation date (newest first)
    return notifications.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const notifications = await this.getNotifications(userId);
    return notifications.filter(n => !n.isRead).length;
  }
  
  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    
    return notification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const notificationIds = this.userNotifications.get(userId) || [];
    
    for (const id of notificationIds) {
      const notification = this.notifications.get(id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        this.notifications.set(id, notification);
      }
    }
  }
  
  async deleteNotification(notificationId: number): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return false;
    }
    
    // Remove notification from map
    this.notifications.delete(notificationId);
    
    // Update user notifications
    const userNotifications = this.userNotifications.get(notification.userId) || [];
    const updatedNotifications = userNotifications.filter(id => id !== notificationId);
    this.userNotifications.set(notification.userId, updatedNotifications);
    
    return true;
  }
  
  async sendSystemNotification(
    userIds: number[],
    title: string,
    content: string,
    type: NotificationType,
    actionLink?: string,
    icon?: string
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      // Check if user exists
      if (!this.users.has(userId)) {
        continue;
      }
      
      const notification = await this.createNotification({
        userId,
        type,
        title,
        content,
        icon: icon || null,
        actionLink: actionLink || null,
        sourceId: null,
        sourceType: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
  // These fields are now public
  private rewardActivities: Map<number, RewardActivity[]>;
  private userTokens: Map<number, number>;
  private globalEmotionData: RegionData[];
  private chatRooms: ChatRoom[];
  private chatRoomParticipants: Map<number, ChatRoomParticipant[]>;
  private blockedUsers: Map<number, BlockedUser[]>;
  
  // Family plan data structures
  private familyRelationships: Map<number, FamilyRelationship[]>;
  private premiumPlans: Map<number, PremiumPlan>;
  private moodHistory: Map<number, { emotion: EmotionType; timestamp: string }[]>;
  private referrals: Map<number, Referral[]>;
  private tokenTransfers: Map<number, TokenTransfer[]>;

  // Video posts data structures
  private videoPosts: Map<number, VideoPost>;
  private userVideoPosts: Map<number, number[]>; // userId -> array of video post IDs

  // Emotional Imprints data structures
  private emotionalImprints: Map<number, EmotionalImprint>;
  private userEmotionalImprints: Map<number, number[]>; // userId -> array of imprint IDs
  private emotionalImprintInteractions: Map<number, EmotionalImprintInteraction[]>; // imprintId -> interactions
  private receivedEmotionalImprints: Map<number, number[]>; // userId -> array of interaction IDs
  private emotionalImprintId: number = 1;
  private imprintInteractionId: number = 1;
  private postId: number;
  
  // Advertisement data structures
  private advertisements: Map<number, Advertisement>;
  private userAdvertisements: Map<number, number[]>; // userId -> array of advertisement IDs
  private advertisementBookings: Map<number, AdvertisementBooking[]>; // advertisementId -> array of bookings
  private advertisementId: number;
  private bookingId: number;
  
  // Video social data structures
  private videoLikes: Map<number, VideoLike[]>; // videoId -> VideoLike[]
  private videoComments: Map<number, VideoComment[]>; // videoId -> VideoComment[]
  private videoFollows: Map<number, VideoFollow[]>; // videoId -> VideoFollow[]
  private videoSaves: Map<number, VideoSave[]>; // userId -> VideoSave[]
  private videoDownloads: Map<number, VideoDownload[]>; // videoId -> VideoDownload[]
  
  // User follows data structures
  private userFollowers: Map<number, UserFollow[]>; // userId -> UserFollow[] (where followedId = userId)
  private userFollowing: Map<number, UserFollow[]>; // userId -> UserFollow[] (where followerId = userId)
  
  // User sessions and online status tracking
  private userSessions: Map<string, UserSession>; // sessionToken -> UserSession
  private userActiveSessions: Map<number, UserSession[]>; // userId -> UserSession[]
  private sessionId: number;
  
  // Mood matching data structures
  private moodMatches: Map<number, MoodMatch[]>; // userId -> MoodMatch[]
  private matchId: number;
  
  // Gamification data structures
  private userProfiles: Map<number, any>;
  private challenges: any[];
  private achievements: any[];
  private leaderboard: any[];
  private userStreaks: Map<number, { current: number, longest: number, lastCheckIn: string }>;
  private badges: Badge[];
  private userBadges: Map<number, number[]>;
  
  // User challenge data structures
  private userCreatedChallenges: Map<number, Challenge[]>; // Map of userId -> created challenges
  private userChallengeProgress: Map<string, number>; // Map of userId_challengeId -> progress value
  private userChallengeCompletions: Map<number, UserChallengeCompletion[]>; // Map of challengeId -> completions
  private challengeId: number;
  private completionId: number;
  
  // Token redemption data structures
  private tokenRedemptions: Map<number, TokenRedemption[]>;
  private redemptionConversionRate: number;
  private redemptionMinimumTokens: number;
  
  // Admin backend data structures
  private adminUsers: Map<number, AdminUser>;
  private supportTickets: Map<number, SupportTicket>;
  private ticketResponses: Map<number, TicketResponse[]>;
  private refundRequests: Map<number, RefundRequest>;
  private adminActions: Map<number, AdminAction[]>;
  private quotes: Map<number, Quote>;
  private verificationDocuments: Map<number, any>; // Map of userId -> verification documents
  private docId: number;
  
  sessionStore: session.Store;
  currentId: number;
  private entryId: number;
  private rewardId: number;
  private redemptionId: number;
  private adminId: number;
  private ticketId: number;
  private responseId: number;
  private refundId: number;
  private actionId: number;
  private quoteId: number;
  private notificationId: number;

  constructor() {
    // These public fields are already initialized in the class declaration
    this.rewardActivities = new Map();
    this.userTokens = new Map();
    this.userProfiles = new Map();
    
    // Initialize sample support groups
    this.supportGroups = [
      {
        id: 1,
        name: "Anxiety Support Circle",
        description: "A safe space to share experiences and coping strategies for anxiety",
        members: 24,
        nextMeeting: "2025-05-15T18:00:00Z",
        emotion: "anxious"
      },
      {
        id: 2,
        name: "Happiness Practice Group",
        description: "Daily practices and discussions to cultivate lasting happiness",
        members: 42,
        nextMeeting: "2025-05-10T16:30:00Z",
        emotion: "happy"
      },
      {
        id: 3,
        name: "Grief & Loss Support",
        description: "Support for those navigating the complex journey of grief",
        members: 18,
        nextMeeting: "2025-05-12T19:00:00Z",
        emotion: "sad"
      }
    ];
    
    // Initialize sample expert tips
    this.expertTips = [
      {
        id: 1,
        title: "Managing Anxiety Through Mindfulness",
        content: "Practicing mindfulness for just 5 minutes a day can help reduce anxiety by bringing your focus to the present moment",
        author: "Dr. Sarah Chen",
        category: "anxiety",
        postedAt: "2025-05-01T12:00:00Z"
      },
      {
        id: 2,
        title: "Building Emotional Resilience",
        content: "Emotional resilience can be strengthened through positive self-talk, maintaining social connections, and practicing self-care",
        author: "Dr. James Wilson",
        category: "resilience",
        postedAt: "2025-05-03T14:30:00Z"
      },
      {
        id: 3,
        title: "The Science of Happiness",
        content: "Research shows that expressing gratitude, engaging in acts of kindness, and maintaining social bonds significantly increase happiness levels",
        author: "Dr. Maya Rodriguez",
        category: "happiness",
        postedAt: "2025-05-05T09:15:00Z"
      }
    ];
    this.userStreaks = new Map();
    this.challenges = [];
    this.achievements = [];
    this.leaderboard = [];
    this.userBadges = new Map();
    this.tokenRedemptions = new Map();
    this.chatRoomParticipants = new Map();
    this.blockedUsers = new Map();
    this.familyRelationships = new Map();
    this.premiumPlans = new Map();
    this.moodHistory = new Map();
    this.referrals = new Map();
    this.tokenTransfers = new Map();
    
    // Initialize notification maps
    this.notifications = new Map();
    this.userNotifications = new Map();
    this.notificationId = 1;
    
    // Initialize video posts maps
    this.videoPosts = new Map();
    this.userVideoPosts = new Map();
    this.postId = 1;
    
    // Initialize emotional imprints maps
    this.emotionalImprints = new Map();
    this.userEmotionalImprints = new Map();
    this.emotionalImprintInteractions = new Map();
    this.receivedEmotionalImprints = new Map();
    this.emotionalImprintId = 1;
    this.imprintInteractionId = 1;
    
    // Initialize video social maps
    this.videoLikes = new Map(); // videoId -> VideoLike[]
    this.videoComments = new Map(); // videoId -> VideoComment[]
    this.videoFollows = new Map(); // videoId -> VideoFollow[]
    this.videoSaves = new Map(); // userId -> VideoSave[]
    this.videoDownloads = new Map(); // videoId -> VideoDownload[]
    
    // Initialize user follows maps
    this.userFollowers = new Map(); // userId -> UserFollow[] (where followedId = userId)
    this.userFollowing = new Map(); // userId -> UserFollow[] (where followerId = userId)
    
    // Initialize user sessions and mood matches maps
    this.userSessions = new Map();
    this.userActiveSessions = new Map();
    this.moodMatches = new Map();
    this.sessionId = 1;
    this.matchId = 1;
    
    // Initialize deletion request maps
    this.deletionRequests = new Map();
    this.userDeletionRequests = new Map();
    this.nextDeletionRequestId = 1;
    
    // Initialize user challenge maps
    this.userCreatedChallenges = new Map();
    this.userChallengeProgress = new Map();
    this.userChallengeCompletions = new Map();
    this.challengeId = 1001; // Start from 1001 to distinguish from predefined challenges
    this.completionId = 1;
    
    // Initialize admin backend data structures
    this.adminUsers = new Map();

    // First ensure the adminId is at least 1
    if (this.adminId < 1) {
      this.adminId = 1;
    }
    
    // Create a default admin user for system administration
    const defaultAdminId = this.adminId++;
    const defaultAdmin: AdminUser = {
      id: defaultAdminId,
      username: 'admin',
      password: 'Queanbeyan@9', // Password is stored securely in production
      email: 'admin@moodsync.app',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as AdminRole,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      permissions: ['users.view', 'users.edit', 'content.view', 'content.edit', 'system.view', 'system.edit'],
      avatarUrl: null,
      contactPhone: null,
      department: null
    };
    
    // Explicitly set the ID to 1 to ensure it's not null
    defaultAdmin.id = 1;
    
    // Store admin user in the map with the ID as key
    this.adminUsers.set(1, defaultAdmin);
    console.log('Default admin account created successfully');
    
    // Add Sagar as an admin user with the same credentials used for the regular user account
    const sagarAdminId = this.adminId++;
    const sagarAdmin: AdminUser = {
      id: sagarAdminId,
      username: 'admin',
      password: 'Queanbeyan@9', // Updated to username 'admin' with the same password
      email: 'sagar@moodsync.app',
      firstName: 'Sagar',
      lastName: 'Admin',
      role: 'SUPER_ADMIN' as AdminRole, // Updated role to ensure full access
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      permissions: ['users.view', 'users.edit', 'content.view', 'content.edit', 'system.view', 'system.edit'],
      avatarUrl: null,
      contactPhone: null,
      department: null
    };
    
    // Store Sagar admin user in the map
    this.adminUsers.set(sagarAdminId, sagarAdmin);
    console.log('Sagar admin account created successfully');
    
    this.supportTickets = new Map();
    this.ticketResponses = new Map();
    this.refundRequests = new Map();
    this.adminActions = new Map();
    this.quotes = new Map();
    this.verificationDocuments = new Map();
    this.docId = 1;
    
    // Initialize advertisement data structures
    this.advertisements = new Map();
    this.userAdvertisements = new Map();
    this.advertisementBookings = new Map();
    this.advertisementId = 1;
    this.bookingId = 1;
    
    this.redemptionConversionRate = 0.005; // 1 token = $0.005 USD
    this.redemptionMinimumTokens = 1000; // Minimum 1000 tokens (= $5) for redemption
    this.currentId = 1;
    this.entryId = 1;
    this.rewardId = 1;
    this.redemptionId = 1;
    this.adminId = 1;
    this.ticketId = 1;
    this.responseId = 1;
    this.refundId = 1;
    this.actionId = 1;
    this.quoteId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize badges first so we can assign them to test user
    this.badges = [
      {
        id: 1,
        name: 'Bronze Mood Tracker',
        description: 'Complete 5 easy challenges',
        iconUrl: '🥉',
        category: 'challenges',
        tier: 'bronze',
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Silver Emotion Master',
        description: 'Complete 5 moderate challenges',
        iconUrl: '🥈',
        category: 'challenges',
        tier: 'silver',
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Gold Wellness Champion',
        description: 'Complete 5 hard challenges',
        iconUrl: '🥇',
        category: 'challenges',
        tier: 'gold',
        createdAt: new Date()
      },
      {
        id: 4,
        name: 'Platinum Mindfulness Guru',
        description: 'Complete 5 extreme challenges',
        iconUrl: '💎',
        category: 'challenges',
        tier: 'platinum',
        createdAt: new Date()
      }
    ];
    
    // Create a test developer account directly here
    // Hashed password for developer account authentication (created using hashPassword function)
    const testPassword = "9ce9b7b4132122b73b1f80a41001df457f4d13a001b033c602e91ec40223e0c7340ffe3aae42f01da9a8134a4add3c96e47a019d9fae4bd46dfe940dfa479c55.dc29782f9d99afe8c07f5befc57410d4";
    
    // Add the test account with premium features
    const testUserId = this.currentId++;
    const testUser: User = {
      id: testUserId,
      username: 'test',
      password: testPassword,
      email: 'developer@moodsync.app',
      firstName: 'Developer',
      lastName: 'Access',
      middleName: null,
      gender: 'other' as GenderType,
      state: 'Development',
      country: 'MoodLync',
      emotionTokens: 25000, // High token count for testing
      isPremium: true,
      premiumPlanType: 'lifetime' as PremiumPlanType,
      premiumExpiryDate: new Date(2099, 11, 31), // Far in the future
      familyPlanOwnerId: null,
      allowMoodTracking: false,
      createdAt: new Date(),
      profilePicture: null,
      lastLogin: new Date(),
      ipAddress: '127.0.0.1',
      paypalEmail: null,
      stripeAccountId: null,
      preferredPaymentMethod: null,
      preferredCurrency: 'USD',
      referralCode: 'testdev123',
      referredBy: null,
      referralCount: 0,
      followerCount: 0,
      videoCount: 0,
      totalVideoViews: 0,
      totalVideoLikes: 0,
      totalVideoComments: 0,
      totalVideoShares: 0,
      totalVideoDownloads: 0,
      verificationStatus: 'verified' as 'verified',
      verifiedAt: new Date(),
      verificationExpiresAt: new Date(2099, 11, 31),
      verificationPaymentPlan: 'lifetime' as 'lifetime',
      verificationMethod: 'developer',
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryKeys: null,
      isVerified: true,
      locationData: null,
      blockedUsers: null
    };
    
    // Add the test user to the users map
    this.users.set(testUserId, testUser);
    
    // Set default emotion for test user
    this.userEmotions.set(testUserId, 'happy');
    
    // Award all badges to test user
    if (!this.userBadges.has(testUserId)) {
      this.userBadges.set(testUserId, []);
    }
    
    // Create badge entries for the test user
    for (const badge of this.badges) {
      this.userBadges.get(testUserId)!.push({
        id: Date.now() + badge.id,
        userId: testUserId,
        badgeId: badge.id,
        awardedAt: new Date()
      });
    }
    
    console.log('Developer test account created successfully');

    // Create a special admin user account with username "Sagar" for testing premium features
    // Hashed password for "Queanbeyan@9" created using hashPassword function
    const sagarPassword = "815c9ab892d02634dff20d07cc1674bf86f4daf933a979341b468d5038b332d687b3d36695d4bbdfdfd964f3d33b5aba69778930fc45cca0411a24157d603b75.dc2c95b5b34ac7f3507e32bfb86a5129";
    
    // Add the Sagar account with premium features
    const sagarUserId = this.currentId++;
    const sagarUser: User = {
      id: sagarUserId,
      username: 'Sagar',
      password: sagarPassword,
      email: 'sagar@moodsync.app',
      firstName: 'Sagar',
      lastName: 'Admin',
      middleName: null,
      gender: 'male' as GenderType,
      state: 'NSW',
      country: 'Australia',
      emotionTokens: 50000, // High token count for admin testing
      isPremium: true,
      premiumPlanType: 'lifetime' as PremiumPlanType,
      premiumExpiryDate: new Date(2099, 11, 31), // Far in the future
      familyPlanOwnerId: null,
      allowMoodTracking: false,
      createdAt: new Date(),
      profilePicture: null,
      lastLogin: new Date(),
      ipAddress: '127.0.0.1',
      paypalEmail: null,
      stripeAccountId: null,
      preferredPaymentMethod: null,
      preferredCurrency: 'AUD',
      referralCode: 'sagaradmin123',
      referredBy: null,
      referralCount: 0,
      followerCount: 0,
      videoCount: 0,
      totalVideoViews: 0,
      totalVideoLikes: 0,
      totalVideoComments: 0,
      totalVideoShares: 0,
      totalVideoDownloads: 0,
      verificationStatus: 'verified' as 'verified',
      verifiedAt: new Date(),
      verificationExpiresAt: new Date(2099, 11, 31),
      verificationPaymentPlan: 'lifetime' as 'lifetime',
      verificationMethod: 'admin',
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryKeys: null,
      isVerified: true,
      locationData: null,
      blockedUsers: null
    };
    
    // Add the Sagar user to the users map
    this.users.set(sagarUserId, sagarUser);
    
    // Set default emotion for Sagar user
    this.userEmotions.set(sagarUserId, 'happy');
    
    // Award all badges to Sagar user
    if (!this.userBadges.has(sagarUserId)) {
      this.userBadges.set(sagarUserId, []);
    }
    
    // Create badge entries for the Sagar user
    for (const badge of this.badges) {
      this.userBadges.get(sagarUserId)!.push({
        id: Date.now() + badge.id,
        userId: sagarUserId,
        badgeId: badge.id,
        awardedAt: new Date()
      });
    }
    
    console.log('Sagar admin account created successfully');

    // Initialize predefined chat rooms
    this.chatRooms = [
      {
        id: 1,
        name: 'Just Chilling',
        description: 'A place for people who are just feeling neutral and want to chat about their day.',
        emotion: 'neutral',
        participants: 24,
        avatars: []
      },
      {
        id: 2,
        name: 'Late-Night Overthinkers',
        description: 'Can\'t sleep? Mind racing? You\'re not alone. Join others who are awake and anxious too.',
        emotion: 'anxious',
        participants: 18,
        avatars: []
      },
      {
        id: 3,
        name: 'Sudden Burst of Happiness',
        description: 'Having an amazing day? Share your joy with others who are feeling on top of the world!',
        emotion: 'happy',
        participants: 37,
        avatars: []
      },
      {
        id: 4,
        name: 'Comfort Corner',
        description: 'A safe space for those feeling down. Share, listen, and find comfort in community.',
        emotion: 'sad',
        participants: 15,
        avatars: []
      },
      {
        id: 5,
        name: 'Venting Space',
        description: 'A place to express your frustration and anger in a healthy, supportive environment.',
        emotion: 'angry',
        participants: 10,
        avatars: []
      },
      {
        id: 6,
        name: 'Energy Exchange',
        description: 'Share your enthusiasm and excitement with others who are feeling the same energy!',
        emotion: 'excited',
        participants: 28,
        avatars: []
      }
    ];

    // Initialize preset global emotion data
    this.globalEmotionData = [
      { name: 'Tokyo', dominant: 'happy', percentage: 65 },
      { name: 'New York', dominant: 'anxious', percentage: 42 },
      { name: 'London', dominant: 'sad', percentage: 38 },
      { name: 'Paris', dominant: 'excited', percentage: 51 },
      { name: 'Sydney', dominant: 'neutral', percentage: 47 },
      { name: 'Rio de Janeiro', dominant: 'excited', percentage: 62 }
    ];
    
    // Initialize sample challenges
    this.challenges = [
      // Easy Challenges
      {
        id: 'e1',
        title: 'Emotional Explorer',
        description: 'Track 5 different emotions in a week',
        category: 'tracking',
        difficulty: 'easy',
        tokenReward: 50,
        targetValue: 5,
        iconUrl: '🧭',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'e2',
        title: 'Mindful Moment',
        description: 'Log your current emotion for 3 consecutive days',
        category: 'daily',
        difficulty: 'easy',
        tokenReward: 30,
        targetValue: 3,
        iconUrl: '🧘',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'e3',
        title: 'Global Citizen',
        description: 'Check the global emotion map for 5 days',
        category: 'exploration',
        difficulty: 'easy',
        tokenReward: 40,
        targetValue: 5,
        iconUrl: '🌍',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'e4',
        title: 'Emotion Notes',
        description: 'Create your first journal entry reflecting on your emotions',
        category: 'journal',
        difficulty: 'easy',
        tokenReward: 25,
        targetValue: 1,
        iconUrl: '📝',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'e5',
        title: 'Connection Seeker',
        description: 'Find a mood match with someone feeling the same emotion',
        category: 'social',
        difficulty: 'easy',
        tokenReward: 35,
        targetValue: 1,
        iconUrl: '🔍',
        isCompleted: false,
        progress: 0
      },
      
      // Moderate Challenges
      {
        id: 'm1',
        title: 'Journaling Journey',
        description: 'Create a journal entry 5 days in a row',
        category: 'journal',
        difficulty: 'moderate',
        tokenReward: 75,
        targetValue: 5,
        iconUrl: '📔',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'm2',
        title: 'Social Butterfly',
        description: 'Join 5 different mood-based chat rooms',
        category: 'social',
        difficulty: 'moderate',
        tokenReward: 80,
        targetValue: 5,
        iconUrl: '🦋',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'm3',
        title: 'Mood Pattern Tracker',
        description: 'Record your emotions at different times of the day for a week',
        category: 'tracking',
        difficulty: 'moderate',
        tokenReward: 90,
        targetValue: 7,
        iconUrl: '📊',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'm4',
        title: 'Emotional Support',
        description: 'Provide helpful responses to 3 users in chat rooms',
        category: 'social',
        difficulty: 'moderate',
        tokenReward: 85,
        targetValue: 3,
        iconUrl: '🤝',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'm5',
        title: 'Positivity Streaker',
        description: 'Maintain a positive emotion for 3 consecutive days',
        category: 'tracking',
        difficulty: 'moderate',
        tokenReward: 70,
        targetValue: 3,
        iconUrl: '✨',
        isCompleted: false,
        progress: 0
      },
      
      // Hard Challenges
      {
        id: 'h1',
        title: 'Emotional Wisdom',
        description: 'Have 10 conversations with the AI companion about different emotions',
        category: 'ai',
        difficulty: 'hard',
        tokenReward: 120,
        targetValue: 10,
        iconUrl: '🧠',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'h2',
        title: 'Emotion Mastery',
        description: 'Track all 8 core emotions in the application',
        category: 'tracking',
        difficulty: 'hard',
        tokenReward: 150,
        targetValue: 8,
        iconUrl: '🎭',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'h3',
        title: 'Emotion Transformation',
        description: 'Document shifting from a negative to positive emotion in your journal 5 times',
        category: 'journal',
        difficulty: 'hard',
        tokenReward: 140,
        targetValue: 5,
        iconUrl: '🔄',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'h4',
        title: 'Community Builder',
        description: 'Create a chat room and attract 10 participants',
        category: 'social',
        difficulty: 'hard',
        tokenReward: 130,
        targetValue: 10,
        iconUrl: '🏗️',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'h5',
        title: 'Streak Master',
        description: 'Log your emotions for 14 consecutive days',
        category: 'daily',
        difficulty: 'hard',
        tokenReward: 160,
        targetValue: 14,
        iconUrl: '🔥',
        isCompleted: false,
        progress: 0
      },
      
      // Extreme Challenges
      {
        id: 'x1',
        title: 'Emotional Intelligence Guru',
        description: 'Complete 30 days of daily emotion tracking without missing a day',
        category: 'daily',
        difficulty: 'extreme',
        tokenReward: 300,
        targetValue: 30,
        iconUrl: '👑',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'x2',
        title: 'Social Wellness Ambassador',
        description: 'Help 25 users through meaningful conversations in chat rooms',
        category: 'social',
        difficulty: 'extreme',
        tokenReward: 350,
        targetValue: 25,
        iconUrl: '🏅',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'x3',
        title: 'Emotional Journal Master',
        description: 'Create 50 detailed journal entries about your emotional journey',
        category: 'journal',
        difficulty: 'extreme',
        tokenReward: 400,
        targetValue: 50,
        iconUrl: '📚',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'x4',
        title: 'Emotional Balance Achiever',
        description: 'Maintain an equal distribution of positive and negative emotions for a month',
        category: 'tracking',
        difficulty: 'extreme',
        tokenReward: 450,
        targetValue: 30,
        iconUrl: '⚖️',
        isCompleted: false,
        progress: 0
      },
      {
        id: 'x5',
        title: 'MoodSync Pioneer',
        description: 'Use every feature in the app at least once and maintain a 45-day streak',
        category: 'exploration',
        difficulty: 'extreme',
        tokenReward: 500,
        targetValue: 45,
        iconUrl: '🚀',
        isCompleted: false,
        progress: 0
      }
    ];
    
    // Initialize sample achievements
    this.achievements = [
      {
        id: 'a1',
        title: 'Reflection Master',
        description: 'Create 10 journal entries',
        category: 'journal',
        isUnlocked: false,
        reward: 100,
        icon: '🏆',
        progressCurrent: 0,
        progressTarget: 10
      },
      {
        id: 'a2',
        title: 'Consistency Champion',
        description: 'Log your emotions for 7 consecutive days',
        category: 'tracking',
        isUnlocked: false,
        reward: 150,
        icon: '⭐',
        progressCurrent: 0,
        progressTarget: 7
      },
      {
        id: 'a3',
        title: 'Emotional Intelligence',
        description: 'Experience and log all 6 core emotions',
        category: 'awareness',
        isUnlocked: false,
        reward: 120,
        icon: '🧩',
        progressCurrent: 0,
        progressTarget: 6
      },
      {
        id: 'a4',
        title: 'Community Supporter',
        description: 'Participate in 15 chat room discussions',
        category: 'social',
        isUnlocked: false,
        reward: 200,
        icon: '👥',
        progressCurrent: 0,
        progressTarget: 15
      },
      {
        id: 'a5',
        title: 'Wellness Seeker',
        description: 'Complete 5 different challenges',
        category: 'challenges',
        isUnlocked: false,
        reward: 250,
        icon: '🏅',
        progressCurrent: 0,
        progressTarget: 5
      }
    ];
    
    // Initialize sample leaderboard data
    this.leaderboard = [
      { 
        id: 1, 
        username: 'EmotionMaster', 
        points: 1250, 
        level: 8, 
        achievementCount: 12,
        streak: 14,
        rank: 1
      },
      { 
        id: 2, 
        username: 'MindfulSoul', 
        points: 1120, 
        level: 7, 
        achievementCount: 10,
        streak: 18,
        rank: 2
      },
      { 
        id: 3, 
        username: 'HappyVibes', 
        points: 980, 
        level: 6, 
        achievementCount: 8,
        streak: 9,
        rank: 3
      },
      { 
        id: 4, 
        username: 'CalmPresence', 
        points: 840, 
        level: 5, 
        achievementCount: 7,
        streak: 5,
        rank: 4
      },
      { 
        id: 5, 
        username: 'EmotionExplorer', 
        points: 720, 
        level: 4, 
        achievementCount: 5,
        streak: 3,
        rank: 5
      }
    ];
    
    // Badges are already initialized above
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async findUserByIpAddress(ipAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.ipAddress === ipAddress,
    );
  }
  
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Update user fields 
    const updatedUser = { ...user, ...userData };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  // Trial management methods
  
  /**
   * Start a free trial for a user
   * @param userId The user ID to start the trial for
   * @param trialDays Number of days the trial should last (default: 14)
   * @returns Updated user object with trial information
   */
  async startFreeTrial(userId: number, trialDays: number = 14): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // If user is already premium, don't start a trial
    if (user.isPremium) {
      throw new Error('User already has a premium subscription');
    }
    
    // If user already has an active trial, don't start a new one
    if (user.isInTrialPeriod) {
      throw new Error('User already has an active trial');
    }
    
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    
    // Update user with trial information
    const updatedUser = await this.updateUser(userId, {
      isInTrialPeriod: true,
      trialStartDate,
      trialEndDate
    });
    
    // Also create a record in the premium plans table
    await this.createPremiumPlan(userId, {
      planType: 'family',
      paymentAmount: 0, // Free trial
      currency: 'USD',
      memberLimit: 5,
      isLifetime: false,
      isTrial: true,
      trialStartDate,
      trialEndDate
    });
    
    return updatedUser;
  }
  
  /**
   * Check if a user is currently in an active trial period
   * @param userId The user ID to check
   * @returns Boolean indicating if the user is in an active trial
   */
  async isUserInActiveTrial(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) {
      return false;
    }
    
    // If user is not in trial period, return false
    if (!user.isInTrialPeriod) {
      return false;
    }
    
    // If trial end date is not set, return false
    if (!user.trialEndDate) {
      return false;
    }
    
    // Check if trial is still active (current date is before end date)
    const now = new Date();
    return now < new Date(user.trialEndDate);
  }
  
  /**
   * Check for expired trials and update user records
   * Should be called periodically (e.g., by a cron job)
   */
  async checkAndExpireTrials(): Promise<void> {
    const now = new Date();
    
    // Loop through all users to find expired trials
    for (const [userId, user] of this.users.entries()) {
      // Skip users who aren't in a trial period
      if (!user.isInTrialPeriod || !user.trialEndDate) {
        continue;
      }
      
      // Check if trial has expired
      if (now >= new Date(user.trialEndDate)) {
        // Trial expired - update user record
        await this.updateUser(userId, {
          isInTrialPeriod: false,
          // Keep the trial dates for record-keeping
        });
        
        // Notify user about trial expiration
        await this.createNotification({
          userId,
          title: "Free Trial Expired",
          content: "Your 14-day free trial has ended. Upgrade to a premium plan to continue enjoying all premium features.",
          type: "subscription",
          actionLink: "/premium",
          icon: "crown"
        });
      }
    }
  }
  
  async removeUser(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) {
      return false;
    }
    
    // Remove user and related data
    this.users.delete(userId);
    
    // Return success
    return true;
  }
  
  async searchUsers(query: string): Promise<User[]> {
    // Convert query to lowercase for case-insensitive search
    const lowercaseQuery = query.toLowerCase();
    
    // Search for users by username, email, firstName, or lastName
    return Array.from(this.users.values()).filter(user => {
      // Don't include users without a username (shouldn't happen, but just in case)
      if (!user.username) return false;
      
      // Check if the query matches any of the user fields
      const matchesUsername = user.username.toLowerCase().includes(lowercaseQuery);
      const matchesEmail = user.email?.toLowerCase().includes(lowercaseQuery);
      const matchesFirstName = user.firstName?.toLowerCase().includes(lowercaseQuery);
      const matchesLastName = user.lastName?.toLowerCase().includes(lowercaseQuery);
      
      return matchesUsername || matchesEmail || matchesFirstName || matchesLastName;
    });
  }

  // Helper method to generate a unique referral code
  private generateReferralCode(username: string): string {
    // Mix username with a timestamp and random string for uniqueness
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const baseCode = username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toLowerCase();
    
    return `${baseCode}${timestamp.substr(-4)}${randomStr}`;
  }
  


  async createUser(insertUser: InsertUser & { ipAddress?: string, referredBy?: string }): Promise<User> {
    const id = this.currentId++;
    
    // Generate a unique referral code for this user
    const referralCode = this.generateReferralCode(insertUser.username);
    
    // Check if user was referred by another user
    let referredById: number | null = null;
    if (insertUser.referredBy) {
      // Find the referring user by their referral code
      const referrer = Array.from(this.users.values()).find(
        user => user.referralCode === insertUser.referredBy
      );
      
      if (referrer) {
        referredById = referrer.id;
        
        // Update the referrer's count and reward them
        const updatedReferrer = { ...referrer, referralCount: (referrer.referralCount || 0) + 1 };
        this.users.set(referrer.id, updatedReferrer);
        
        // Add tokens to the referrer as reward
        await this.addUserTokens(referrer.id, 50);
        
        // Create reward activity record
        await this.createRewardActivity(
          referrer.id,
          "help_others",
          50,
          'Referred a new user to MoodLync'
        );
        
        // Create a referral record
        if (insertUser.email) {
          await this.createReferral(referrer.id, id, insertUser.email, referralCode);
        }
      }
    }
    
    const user: User = { 
      id, 
      firstName: insertUser.firstName || null,
      middleName: insertUser.middleName || null,
      lastName: insertUser.lastName || null,
      username: insertUser.username,
      email: insertUser.email || null,
      password: insertUser.password,
      gender: insertUser.gender || null,
      state: insertUser.state || null,
      country: insertUser.country || null,
      emotionTokens: 0,
      isPremium: false,
      premiumPlanType: null,
      familyPlanOwnerId: null,
      allowMoodTracking: false,
      createdAt: new Date(),
      profilePicture: null,
      lastLogin: new Date(),
      ipAddress: insertUser.ipAddress || null,
      paypalEmail: null,
      stripeAccountId: null,
      preferredPaymentMethod: null,
      preferredCurrency: "USD",
      referralCode,
      referredBy: referredById,
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
    
    // Set default emotion for new users
    this.userEmotions.set(id, 'neutral');
    
    return user;
  }
  
  // Referral methods implementation
  async createReferral(referrerUserId: number, referredUserId: number | null, referralEmail: string | null, referralCode: string): Promise<Referral> {
    const referrer = await this.getUser(referrerUserId);
    if (!referrer) throw new Error(`Referrer user with ID ${referrerUserId} not found`);
    
    // Create expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const referral: Referral = {
      id: Date.now(),
      referrerUserId,
      referralCode,
      referralEmail,
      referredUserId,
      status: referredUserId ? 'registered' : 'pending',
      createdAt: new Date(),
      registeredAt: referredUserId ? new Date() : null,
      convertedAt: null,
      expiresAt,
      tokenReward: 50,
      premiumDaysReward: 0,
      notes: null
    };
    
    // Add to referrals map
    if (!this.referrals.has(referrerUserId)) {
      this.referrals.set(referrerUserId, []);
    }
    this.referrals.get(referrerUserId)!.push(referral);
    
    return referral;
  }
  
  async getReferralsByUser(userId: number): Promise<Referral[]> {
    return this.referrals.get(userId) || [];
  }
  
  async updateReferralStatus(referralId: number, status: ReferralStatus): Promise<Referral | null> {
    // Find the referral in all users' referral lists
    for (const [userId, userReferrals] of this.referrals.entries()) {
      const referralIndex = userReferrals.findIndex(ref => ref.id === referralId);
      
      if (referralIndex !== -1) {
        const referral = userReferrals[referralIndex];
        
        // Update status and date fields
        const updatedReferral = {
          ...referral,
          status,
          registeredAt: status === 'registered' ? new Date() : referral.registeredAt,
          convertedAt: status === 'converted' ? new Date() : referral.convertedAt
        };
        
        // Update in the map
        userReferrals[referralIndex] = updatedReferral;
        this.referrals.set(userId, userReferrals);
        
        // If the status is 'converted', grant premium rewards to the referrer
        if (status === 'converted') {
          const user = await this.getUser(userId);
          if (user) {
            // Grant free premium days if configured
            if (updatedReferral.premiumDaysReward > 0) {
              // Implementation for extending premium duration would go here
            }
            
            // Add tokens to the referrer
            if (updatedReferral.tokenReward > 0) {
              await this.addUserTokens(userId, updatedReferral.tokenReward);
              
              // Create reward activity record
              await this.createRewardActivity(
                userId,
                "help_others",
                updatedReferral.tokenReward,
                'Referral converted to premium user'
              );
              
              // Check if the user has reached a bounty threshold (5 premium referrals)
              // This will automatically award the bounty if they qualify
              await this.checkAndAwardReferralBounty(userId
              );
            }
          }
        }
        
        return updatedReferral;
      }
    }
    
    return null;
  }
  
  async getReferralByCode(referralCode: string): Promise<Referral | null> {
    // Search all users' referral lists for the code
    for (const userReferrals of this.referrals.values()) {
      const referral = userReferrals.find(ref => ref.referralCode === referralCode);
      if (referral) {
        return referral;
      }
    }
    
    return null;
  }
  
  async getReferralStatistics(userId: number): Promise<{
    totalReferrals: number;
    pendingReferrals: number;
    registeredReferrals: number;
    convertedReferrals: number;
    expiredReferrals: number;
    totalTokensEarned: number;
    convertedCount: number;
    bountyEligible: boolean;
    nextBountyTokens: number;
    referralsUntilNextBounty: number;
  }> {
    const referrals = this.referrals.get(userId) || [];
    const user = await this.getUser(userId);
    
    const convertedReferrals = referrals.filter(ref => ref.status === 'converted').length;
    
    const statistics = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(ref => ref.status === 'pending').length,
      registeredReferrals: referrals.filter(ref => ref.status === 'registered').length,
      convertedReferrals: convertedReferrals,
      expiredReferrals: referrals.filter(ref => ref.status === 'expired').length,
      totalTokensEarned: referrals
        .filter(ref => ref.status === 'converted')
        .reduce((total, ref) => total + ref.tokenReward, 0),
      convertedCount: convertedReferrals,
      bountyEligible: false,
      nextBountyTokens: 0,
      referralsUntilNextBounty: 5
    };
    
    // Check if user is premium to determine bounty eligibility
    if (user?.isPremium) {
      // Determine bounty amount based on plan type and if they have a lifetime plan
      const plan = this.premiumPlans.get(userId);
      const isLifetime = plan?.isLifetime || false;
      const isPlanFamily = plan?.planType === 'family';
      
      // Calculate next bounty threshold (every 5 premium referrals)
      const thresholdMultiple = Math.floor(convertedReferrals / 5);
      const nextThreshold = (thresholdMultiple + 1) * 5;
      
      // Check if user has already received a bounty for current threshold
      const userTransfers = this.tokenTransfers.get(userId) || [];
      
      // Filter bounties to find the highest referral count that has been rewarded
      const bountyTransfers = userTransfers.filter(t => 
        t.source === 'referral_bounty' && t.notes?.includes('referral bounty')
      );
      
      // Calculate how many successful conversions until next bounty
      statistics.referralsUntilNextBounty = nextThreshold - convertedReferrals;
      
      // Determine if user is eligible for a bounty (5+ conversions and hasn't received the bounty yet)
      statistics.bountyEligible = convertedReferrals >= 5 && 
        (bountyTransfers.length === 0 || bountyTransfers.length < thresholdMultiple);
      
      // Determine next bounty token amount based on plan type
      if (isPlanFamily && isLifetime) {
        statistics.nextBountyTokens = 1000; // Lifetime family plan gets 1000 tokens
      } else if (isPlanFamily) {
        statistics.nextBountyTokens = 750; // Regular family plan gets 750 tokens
      } else if (isLifetime) {
        statistics.nextBountyTokens = 750; // Lifetime individual plan gets 750 tokens
      } else if (user.isPremium) {
        statistics.nextBountyTokens = 500; // Regular premium gets 500 tokens
      }
    }
    
    return statistics;
  }
  
  /**
   * Checks if a user has reached the referral bounty threshold (5 premium conversions)
   * and awards the bounty if they qualify and haven't received it yet
   */
  async checkAndAwardReferralBounty(userId: number): Promise<{
    awarded: boolean;
    tokensAwarded: number;
    currentReferralCount: number;
  }> {
    try {
      // Get all of the user's referrals
      const referrals = this.referrals.get(userId) || [];
      
      // Count how many have been converted to premium
      const convertedCount = referrals.filter(ref => ref.status === 'converted').length;
      
      // Check if user is a premium member
      const user = await this.getUser(userId);
      if (!user || !user.isPremium) {
        return {
          awarded: false,
          tokensAwarded: 0,
          currentReferralCount: convertedCount
        };
      }
      
      // Get user's premium plan details
      const plan = this.premiumPlans.get(userId);
      const isLifetime = plan?.isLifetime || false;
      const isPlanFamily = plan?.planType === 'family';
      
      // Calculate bounty threshold and determine if it's been reached
      const thresholdMultiple = Math.floor(convertedCount / 5);
      
      if (thresholdMultiple < 1) {
        // Not enough referrals yet
        return {
          awarded: false,
          tokensAwarded: 0,
          currentReferralCount: convertedCount
        };
      }
      
      // Check if they've already received a referral bounty for this threshold
      const userTransfers = this.tokenTransfers.get(userId) || [];
      
      // Filter bounties to find how many have been awarded
      const bountyTransfers = userTransfers.filter(t => 
        t.source === 'referral_bounty' && t.notes?.includes('referral bounty')
      );
      
      // If they already received as many bounties as thresholds passed, no new bounty
      if (bountyTransfers.length >= thresholdMultiple) {
        return {
          awarded: false,
          tokensAwarded: 0,
          currentReferralCount: convertedCount
        };
      }
      
      // Determine token amount based on premium plan type
      let tokensToAward = 500; // Default for regular premium
      
      if (isPlanFamily && isLifetime) {
        tokensToAward = 1000; // Lifetime family plan gets 1000 tokens
      } else if (isPlanFamily) {
        tokensToAward = 750; // Regular family plan gets 750 tokens  
      } else if (isLifetime) {
        tokensToAward = 750; // Lifetime individual plan gets 750 tokens
      }
      
      // Award the tokens
      const tokenTransfer = {
        id: Math.floor(Math.random() * 1000000), // Generate a random ID
        userId: userId,
        fromUserId: 0, // System
        toUserId: userId,
        amount: tokensToAward,
        type: 'reward',
        status: 'completed',
        timestamp: new Date(),
        source: 'referral_bounty',
        notes: `Referral bounty for successfully referring ${5 * (bountyTransfers.length + 1)} premium members`,
        createdAt: new Date(),
      };
      
      // Add the transfer to the user's records
      const transfers = this.tokenTransfers.get(userId) || [];
      transfers.push(tokenTransfer);
      this.tokenTransfers.set(userId, transfers);
      
      // Update user's token balance
      user.emotionTokens += tokensToAward;
      this.users.set(userId, user);
      
      return {
        awarded: true,
        tokensAwarded: tokensToAward,
        currentReferralCount: convertedCount
      };
    } catch (error) {
      console.error('Error checking referral bounty:', error);
      return {
        awarded: false,
        tokensAwarded: 0,
        currentReferralCount: 0
      };
    }
  }

  async updateUserEmotion(userId: number, emotion: EmotionType): Promise<void> {
    this.userEmotions.set(userId, emotion);
  }

  async getUserEmotion(userId: number): Promise<EmotionType | undefined> {
    return this.userEmotions.get(userId);
  }

  async getUsersByEmotion(emotion: EmotionType): Promise<UserWithEmotion[]> {
    // Dummy data for users with the same emotion
    const users: UserWithEmotion[] = [];
    for (const [userId, userEmotion] of this.userEmotions.entries()) {
      if (userEmotion === emotion) {
        const user = await this.getUser(userId);
        if (user) {
          users.push({
            id: userId,
            username: user.username,
            emotion: userEmotion,
            lastActive: "Just now",
            avatarUrl: user.profilePicture || undefined
          });
        }
      }
    }
    return users;
  }

  async createJournalEntry(userId: number, emotion: EmotionType, note: string): Promise<JournalEntry> {
    const id = this.entryId++;
    const entry: JournalEntry = {
      id,
      userId,
      emotion,
      note,
      createdAt: new Date().toISOString()
    };
    
    if (!this.journalEntries.has(userId)) {
      this.journalEntries.set(userId, []);
    }
    
    this.journalEntries.get(userId)?.push(entry);
    
    // Reward tokens for creating a journal entry
    await this.addUserTokens(userId, 2);
    
    // Create reward activity record
    await this.createRewardActivity(
      userId,
      "journal_entry",
      2,
      "Created a journal entry"
    );
    
    return entry;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return this.journalEntries.get(userId) || [];
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return this.chatRooms;
  }
  
  async createChatRoom(userId: number, chatRoom: InsertChatRoom): Promise<ChatRoom> {
    const id = this.chatRooms.length + 1;
    
    const newChatRoom: ChatRoom = {
      id,
      ...chatRoom,
      createdBy: userId,
      createdAt: new Date(),
      avatars: []
    };
    
    this.chatRooms.push(newChatRoom);
    
    // Add creator as an admin participant
    await this.addChatRoomParticipant(id, userId, true);
    
    return newChatRoom;
  }
  
  async updateChatRoom(chatRoomId: number, updates: Partial<InsertChatRoom>): Promise<ChatRoom> {
    const chatRoomIndex = this.chatRooms.findIndex(room => room.id === chatRoomId);
    
    if (chatRoomIndex === -1) {
      throw new Error(`Chat room with ID ${chatRoomId} not found`);
    }
    
    const updatedChatRoom = {
      ...this.chatRooms[chatRoomIndex],
      ...updates
    };
    
    this.chatRooms[chatRoomIndex] = updatedChatRoom;
    
    return updatedChatRoom;
  }
  
  async deleteChatRoom(chatRoomId: number): Promise<boolean> {
    const initialLength = this.chatRooms.length;
    this.chatRooms = this.chatRooms.filter(room => room.id !== chatRoomId);
    
    // Also remove all participants
    this.chatRoomParticipants.delete(chatRoomId);
    
    return this.chatRooms.length < initialLength;
  }
  
  async getChatRoomById(chatRoomId: number): Promise<ChatRoom | undefined> {
    return this.chatRooms.find(room => room.id === chatRoomId);
  }
  
  async getPrivateChatRoomsByUserId(userId: number): Promise<ChatRoom[]> {
    // Get all chat room IDs where the user is a participant
    const userChatRoomIds = Array.from(this.chatRoomParticipants.entries())
      .filter(([_, participants]) => participants.some(p => p.userId === userId))
      .map(([chatRoomId, _]) => chatRoomId);
    
    // Return only private chat rooms
    return this.chatRooms.filter(room => 
      room.isPrivate && userChatRoomIds.includes(room.id)
    );
  }
  
  // Chat Room Participants methods
  async addChatRoomParticipant(chatRoomId: number, userId: number, isAdmin: boolean = false): Promise<ChatRoomParticipant> {
    // Check if the chat room exists
    const chatRoom = await this.getChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw new Error(`Chat room with ID ${chatRoomId} not found`);
    }
    
    // Check if the user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Check if the user is already a participant
    if (await this.isUserInChatRoom(chatRoomId, userId)) {
      throw new Error(`User ${userId} is already a participant in chat room ${chatRoomId}`);
    }
    
    // Create a new participant entry
    const participant: ChatRoomParticipant = {
      id: Date.now(), // Using timestamp as a unique ID
      chatRoomId,
      userId,
      isAdmin,
      joinedAt: new Date()
    };
    
    // Add the participant to the map
    if (!this.chatRoomParticipants.has(chatRoomId)) {
      this.chatRoomParticipants.set(chatRoomId, []);
    }
    this.chatRoomParticipants.get(chatRoomId)?.push(participant);
    
    return participant;
  }
  
  async removeChatRoomParticipant(chatRoomId: number, userId: number): Promise<boolean> {
    if (!this.chatRoomParticipants.has(chatRoomId)) {
      return false;
    }
    
    const initialLength = this.chatRoomParticipants.get(chatRoomId)?.length || 0;
    
    const participants = this.chatRoomParticipants.get(chatRoomId)?.filter(
      p => p.userId !== userId
    ) || [];
    
    this.chatRoomParticipants.set(chatRoomId, participants);
    
    return (participants.length < initialLength);
  }
  
  async getChatRoomParticipants(chatRoomId: number): Promise<(ChatRoomParticipant & { user: User })[]> {
    const participants = this.chatRoomParticipants.get(chatRoomId) || [];
    
    // Get the user details for each participant
    const participantsWithUser = await Promise.all(
      participants.map(async (participant) => {
        const user = await this.getUser(participant.userId);
        return {
          ...participant,
          user: user as User // We know this user exists because we validated during addChatRoomParticipant
        };
      })
    );
    
    return participantsWithUser;
  }
  
  async isUserInChatRoom(chatRoomId: number, userId: number): Promise<boolean> {
    const participants = this.chatRoomParticipants.get(chatRoomId) || [];
    return participants.some(p => p.userId === userId);
  }
  
  // User Blocking methods
  async blockUser(userId: number, blockedUserId: number, reason?: string): Promise<BlockedUser> {
    // Check if the user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Check if the blocked user exists
    const blockedUser = await this.getUser(blockedUserId);
    if (!blockedUser) {
      throw new Error(`User with ID ${blockedUserId} not found`);
    }
    
    // Check if the user is already blocked
    if (await this.isUserBlocked(userId, blockedUserId)) {
      throw new Error(`User ${blockedUserId} is already blocked by user ${userId}`);
    }
    
    // Create a new block entry
    const blockEntry: BlockedUser = {
      id: Date.now(), // Using timestamp as a unique ID
      userId,
      blockedUserId,
      reason: reason || null,
      createdAt: new Date()
    };
    
    // Add the block to the map
    if (!this.blockedUsers.has(userId)) {
      this.blockedUsers.set(userId, []);
    }
    this.blockedUsers.get(userId)?.push(blockEntry);
    
    return blockEntry;
  }
  
  async unblockUser(userId: number, blockedUserId: number): Promise<boolean> {
    if (!this.blockedUsers.has(userId)) {
      return false;
    }
    
    const initialLength = this.blockedUsers.get(userId)?.length || 0;
    
    const blocks = this.blockedUsers.get(userId)?.filter(
      b => b.blockedUserId !== blockedUserId
    ) || [];
    
    this.blockedUsers.set(userId, blocks);
    
    return (blocks.length < initialLength);
  }
  
  async getBlockedUsers(userId: number): Promise<(BlockedUser & { blockedUser: User })[]> {
    const blocks = this.blockedUsers.get(userId) || [];
    
    // Get the user details for each blocked user
    const blocksWithUser = await Promise.all(
      blocks.map(async (block) => {
        const user = await this.getUser(block.blockedUserId);
        return {
          ...block,
          blockedUser: user as User // We know this user exists because we validated during blockUser
        };
      })
    );
    
    return blocksWithUser;
  }
  
  async isUserBlocked(userId: number, blockedUserId: number): Promise<boolean> {
    const blocks = this.blockedUsers.get(userId) || [];
    return blocks.some(b => b.blockedUserId === blockedUserId);
  }

  async getGlobalEmotionData(): Promise<RegionData[]> {
    return this.globalEmotionData;
  }

  async getUserTokens(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    return user.emotionTokens;
  }

  async addUserTokens(userId: number, tokens: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    user.emotionTokens += tokens;
    this.users.set(userId, user);
    
    return user.emotionTokens;
  }
  
  async transferTokens(fromUserId: number, toUserId: number, amount: number, notes?: string): Promise<{
    fromUser: User;
    toUser: User;
    amount: number;
    timestamp: Date;
    transfer: TokenTransfer;
  }> {
    // Validate both users exist
    const fromUser = await this.getUser(fromUserId);
    if (!fromUser) throw new Error(`Sender with ID ${fromUserId} not found`);
    
    const toUser = await this.getUser(toUserId);
    if (!toUser) throw new Error(`Recipient with ID ${toUserId} not found`);
    
    // Validate amount is positive
    if (amount <= 0) throw new Error('Transfer amount must be greater than zero');
    
    // Validate sender has enough tokens
    if (fromUser.emotionTokens < amount) {
      throw new Error(`Insufficient tokens. Available: ${fromUser.emotionTokens}, Requested: ${amount}`);
    }
    
    // Check if the users are in a family relationship, if not in direct family, validate permissions
    let isInFamilyRelationship = false;
    let canTransferTokens = false;
    
    // Check if the recipient is the primary account holder for the sender
    if (fromUser.familyPlanOwnerId === toUserId) {
      isInFamilyRelationship = true;
      canTransferTokens = true; // Non-premium family members can transfer to primary account
    } 
    // Or check if the sender is the primary account holder for the recipient
    else if (toUser.familyPlanOwnerId === fromUserId) {
      // Get the relationship to check if token transfers are allowed
      const relationship = await this.getFamilyRelationship(fromUserId, toUserId);
      isInFamilyRelationship = true;
      canTransferTokens = relationship?.canTransferTokens || false;
      
      if (!canTransferTokens) {
        throw new Error(`Token transfers to this family member are not enabled`);
      }
    }
    
    // For non-family transfers, ensure the sender is not attempting a high volume transfer 
    // to prevent abuse (unless they're premium or in a family relationship)
    if (!isInFamilyRelationship && !fromUser.isPremium && amount > 100) {
      throw new Error(`Non-premium users can only transfer up to 100 tokens to non-family members. Requested: ${amount}`);
    }
    
    // Process the transfer
    fromUser.emotionTokens -= amount;
    toUser.emotionTokens += amount;
    
    // Update user records
    this.users.set(fromUserId, fromUser);
    this.users.set(toUserId, toUser);
    
    // Record the transfer in the transfer history
    const timestamp = new Date();
    const transfer: TokenTransfer = {
      id: Date.now(),
      fromUserId,
      toUserId,
      amount,
      timestamp,
      notes: notes || null,
      type: isInFamilyRelationship ? 'family' : 'general',
      status: 'completed'
    };
    
    // Add to transfer history for both users
    if (!this.tokenTransfers.has(fromUserId)) {
      this.tokenTransfers.set(fromUserId, []);
    }
    this.tokenTransfers.get(fromUserId)?.push(transfer);
    
    // Also record it for the recipient
    if (!this.tokenTransfers.has(toUserId)) {
      this.tokenTransfers.set(toUserId, []);
    }
    this.tokenTransfers.get(toUserId)?.push(transfer);
    
    // Create reward activities to track the transfer
    await this.createRewardActivity(
      fromUserId,
      'token_transfer',
      -amount, // Negative amount for the sender
      `Sent ${amount} tokens to ${toUser.username}`
    );
    
    await this.createRewardActivity(
      toUserId,
      'token_transfer',
      amount,
      `Received ${amount} tokens from ${fromUser.username}`
    );
    
    return {
      fromUser,
      toUser,
      amount,
      timestamp,
      transfer
    };
  }
  
  async getTokenTransfers(userId: number): Promise<TokenTransfer[]> {
    return this.tokenTransfers.get(userId) || [];
  }
  
  async getTokenTransfersByType(userId: number, type: 'family' | 'general'): Promise<TokenTransfer[]> {
    const transfers = this.tokenTransfers.get(userId) || [];
    return transfers.filter(transfer => transfer.type === type);
  }
  
  async canTransferTokensToUser(fromUserId: number, toUserId: number): Promise<{ canTransfer: boolean; reason?: string }> {
    // Get both users
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUser(toUserId);
    
    if (!fromUser) {
      return { canTransfer: false, reason: `User with ID ${fromUserId} not found` };
    }
    
    if (!toUser) {
      return { canTransfer: false, reason: `User with ID ${toUserId} not found` };
    }
    
    // Check if the users are blocked
    if (await this.isUserBlocked(fromUserId, toUserId)) {
      return { canTransfer: false, reason: 'You have blocked this user' };
    }
    
    if (await this.isUserBlocked(toUserId, fromUserId)) {
      return { canTransfer: false, reason: 'This user has blocked you' };
    }
    
    // Check family relationship for primary account holder
    if (fromUser.familyPlanOwnerId === toUserId) {
      return { canTransfer: true }; // Non-premium family members can always transfer to primary account
    }
    
    // Check if sender is primary account holder for recipient
    if (toUser.familyPlanOwnerId === fromUserId) {
      const relationship = await this.getFamilyRelationship(fromUserId, toUserId);
      if (relationship && relationship.status === 'accepted') {
        if (relationship.canTransferTokens) {
          return { canTransfer: true };
        } else {
          return { canTransfer: false, reason: 'Token transfers are not enabled for this family member' };
        }
      }
    }
    
    // All other transfers are allowed with reasonable limits
    return { canTransfer: true };
  }

  async createRewardActivity(userId: number, activityType: RewardActivityType, tokens: number, description: string): Promise<RewardActivity> {
    const id = this.rewardId++;
    const activity: RewardActivity = {
      id,
      userId,
      activityType,
      tokensEarned: tokens,
      description,
      createdAt: new Date().toISOString()
    };
    
    if (!this.rewardActivities.has(userId)) {
      this.rewardActivities.set(userId, []);
    }
    
    this.rewardActivities.get(userId)?.push(activity);
    
    return activity;
  }

  async getRewardActivities(userId: number): Promise<RewardActivity[]> {
    return this.rewardActivities.get(userId) || [];
  }

  async getGamificationProfile(userId: number): Promise<any> {
    // Create default profile if it doesn't exist
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        username: 'User' + userId,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        achievementsCount: 0,
        completedChallenges: [],
        achievements: [],
        badges: []
      });
    }
    
    return this.userProfiles.get(userId);
  }

  async getGamificationChallenges(): Promise<any[]> {
    return this.challenges;
  }

  async getGamificationAchievements(): Promise<any[]> {
    return this.achievements;
  }

  async getGamificationLeaderboard(): Promise<any[]> {
    return this.leaderboard;
  }

  async completeGamificationActivity(userId: number, activityId: string): Promise<any> {
    const challenge = this.challenges.find(c => c.id === activityId);
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${activityId} not found`);
    }
    
    // Create default profile if it doesn't exist
    if (!this.userProfiles.has(userId)) {
      await this.getGamificationProfile(userId);
    }
    
    const profile = this.userProfiles.get(userId);
    
    // Check if already completed
    if (profile.completedChallenges.includes(activityId)) {
      return {
        alreadyCompleted: true,
        activityId,
        profile
      };
    }
    
    // Add to completed challenges
    profile.completedChallenges.push(activityId);
    
    // Reward tokens
    const tokens = challenge.tokenReward || 10;
    await this.addUserTokens(userId, tokens);
    
    // Create reward activity
    await this.createRewardActivity(
      userId,
      'challenge_completion',
      tokens,
      `Completed challenge: ${challenge.title}`
    );
    
    // Update points and experience
    profile.points += tokens;
    profile.experience += tokens;
    
    // Check for level up
    let levelUp = false;
    let newLevel = profile.level;
    
    if (profile.experience >= profile.nextLevelExp) {
      newLevel = profile.level + 1;
      profile.level = newLevel;
      profile.nextLevelExp = newLevel * 100; // Simple level progression
      levelUp = true;
    }
    
    // Check if any achievements are unlocked
    let achievementUnlocked = null;
    
    for (const achievement of this.achievements) {
      if (achievement.category === 'challenges' && !achievement.isUnlocked) {
        achievement.progressCurrent = profile.completedChallenges.length;
        
        if (achievement.progressCurrent >= achievement.progressTarget) {
          achievement.isUnlocked = true;
          profile.achievementsCount++;
          achievementUnlocked = achievement;
          
          // Reward tokens for achievement
          await this.addUserTokens(userId, achievement.reward);
          await this.createRewardActivity(
            userId,
            'badge_earned',
            achievement.reward,
            `Unlocked achievement: ${achievement.title}`
          );
        }
      }
    }
    
    // Save updated profile
    this.userProfiles.set(userId, profile);
    
    return {
      isCompleted: true,
      activityId,
      tokensAwarded: tokens,
      levelUp,
      newLevel,
      achievementUnlocked
    };
  }

  async claimAchievementReward(userId: number, achievementId: string): Promise<any> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    
    if (!achievement) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }
    
    // Check if achievement is unlocked
    if (!achievement.isUnlocked) {
      throw new Error(`Achievement is not unlocked yet`);
    }
    
    // Check if reward is already claimed
    if (achievement.rewardClaimed) {
      throw new Error(`Reward for this achievement has already been claimed`);
    }
    
    // Mark as claimed
    achievement.rewardClaimed = true;
    
    // Reward tokens
    const tokens = achievement.reward || 0;
    await this.addUserTokens(userId, tokens);
    
    // Create reward activity
    await this.createRewardActivity(
      userId,
      'badge_earned',
      tokens,
      `Claimed achievement reward: ${achievement.title}`
    );
    
    return {
      achievement,
      tokensAwarded: tokens
    };
  }

  async checkInStreak(userId: number, emotion: EmotionType): Promise<any> {
    // Get or create user streak data
    if (!this.userStreaks.has(userId)) {
      this.userStreaks.set(userId, {
        current: 0,
        longest: 0,
        lastCheckIn: ""
      });
    }
    
    const streakData = this.userStreaks.get(userId)!;
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if already checked in today
    if (streakData.lastCheckIn === today) {
      return {
        current: streakData.current,
        longest: streakData.longest,
        alreadyCheckedIn: true,
        tokensAwarded: 0
      };
    }
    
    // Check if this is a consecutive day (or first check-in)
    const lastDate = streakData.lastCheckIn ? new Date(streakData.lastCheckIn) : null;
    const isConsecutive = lastDate 
      ? (now.getTime() - lastDate.getTime()) <= (36 * 60 * 60 * 1000) // Within 36 hours to allow for different check-in times
      : true; // First time is always "consecutive"
    
    // Update streak
    if (isConsecutive) {
      streakData.current += 1;
      
      if (streakData.current > streakData.longest) {
        streakData.longest = streakData.current;
      }
    } else {
      // Streak broken
      streakData.current = 1;
    }
    
    streakData.lastCheckIn = today;
    
    // Save updated streak data
    this.userStreaks.set(userId, streakData);
    
    // Reward tokens based on streak
    let tokensAwarded = 1; // Base token for checking in
    
    if (streakData.current >= 7) {
      tokensAwarded += 3; // Extra tokens for 7+ day streak
    } else if (streakData.current >= 3) {
      tokensAwarded += 1; // Extra token for 3+ day streak
    }
    
    await this.addUserTokens(userId, tokensAwarded);
    
    // Create reward activity
    await this.createRewardActivity(
      userId,
      'daily_login',
      tokensAwarded,
      `Daily check-in streak: ${streakData.current} days`
    );
    
    // Also update user's emotion
    await this.updateUserEmotion(userId, emotion);
    
    return {
      current: streakData.current,
      longest: streakData.longest,
      tokensAwarded,
      isConsecutive
    };
  }

  async getRecentActiveGamificationProfiles(): Promise<any[]> {
    // Just return top 5 leaderboard entries for simplicity
    return this.leaderboard.slice(0, 5);
  }

  async incrementChallengeProgress(userId: number, challengeId: string, amount: number): Promise<any> {
    const challenge = this.challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }
    
    // Update progress
    challenge.progress = Math.min(challenge.targetValue, (challenge.progress || 0) + amount);
    
    // Check if completed
    const isCompleted = challenge.progress >= challenge.targetValue;
    challenge.isCompleted = isCompleted;
    
    // If completed, give user the reward
    if (isCompleted && !challenge.rewardClaimed) {
      challenge.rewardClaimed = true;
      return this.completeGamificationActivity(userId, challengeId);
    }
    
    return {
      challenge,
      isCompleted,
      progress: challenge.progress,
      target: challenge.targetValue
    };
  }
  
  // Premium user challenge creation methods
  
  async createUserChallenge(userId: number, challengeData: InsertChallenge): Promise<Challenge> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isPremium) {
      throw new Error('Only premium users can create challenges');
    }
    
    // Create a new challenge with user as creator
    const id = this.challengeId++;
    const challenge: Challenge = {
      id,
      title: challengeData.title,
      description: challengeData.description,
      category: challengeData.category,
      difficulty: challengeData.difficulty,
      targetValue: challengeData.targetValue || 1,
      tokenReward: 1, // Fixed token reward for completing a user-created challenge
      isUserCreated: true,
      isPublic: challengeData.isPublic ?? true,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: challengeData.tags || null
    };
    
    // Add to user's created challenges
    if (!this.userCreatedChallenges.has(userId)) {
      this.userCreatedChallenges.set(userId, []);
    }
    this.userCreatedChallenges.get(userId)!.push(challenge);
    
    return challenge;
  }
  
  async getUserCreatedChallenges(userId: number): Promise<Challenge[]> {
    return this.userCreatedChallenges.get(userId) || [];
  }
  
  async getPublicUserCreatedChallenges(): Promise<Challenge[]> {
    // Get all challenges from all users that are marked as public
    const allChallenges: Challenge[] = [];
    
    for (const challenges of this.userCreatedChallenges.values()) {
      allChallenges.push(...challenges.filter(c => c.isPublic));
    }
    
    return allChallenges;
  }
  
  async recordChallengeProgress(userId: number, challengeId: number, notes?: string): Promise<UserChallengeCompletion> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Try to find a system challenge first
    let challenge = this.challenges.find(c => c.id === challengeId.toString());
    
    // If not found, look in user-created challenges
    if (!challenge) {
      for (const challenges of this.userCreatedChallenges.values()) {
        const found = challenges.find(c => c.id === challengeId);
        if (found) {
          challenge = found;
          break;
        }
      }
    }
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    // Generate unique progress key
    const progressKey = `${userId}_${challengeId}`;
    
    // Get current progress
    let currentProgress = this.userChallengeProgress.get(progressKey) || 0;
    
    // Increment progress
    currentProgress += 1;
    this.userChallengeProgress.set(progressKey, currentProgress);
    
    // Create a completion record
    const completion: UserChallengeCompletion = {
      id: this.completionId++,
      userId,
      challengeId,
      progressValue: 1, // Each record is for +1 progress
      notes: notes || null,
      createdAt: new Date(),
      completedAt: currentProgress >= challenge.targetValue ? new Date() : null
    };
    
    // Store the completion
    if (!this.userChallengeCompletions.has(challengeId)) {
      this.userChallengeCompletions.set(challengeId, []);
    }
    this.userChallengeCompletions.get(challengeId)!.push(completion);
    
    // If this progress increment completes the challenge, give reward
    if (currentProgress === challenge.targetValue) {
      // User gets 1 token for completing a challenge
      await this.addUserTokens(userId, 1);
      await this.createRewardActivity(
        userId,
        'challenge_completion',
        1,
        `Completed challenge: ${challenge.title}`
      );
      
      // If this is a user-created challenge, reward the creator
      if (challenge.isUserCreated && challenge.createdBy) {
        await this.rewardChallengeCreator(challengeId, userId);
      }
    }
    
    return completion;
  }
  
  async getChallengeCompletions(challengeId: number): Promise<UserChallengeCompletion[]> {
    return this.userChallengeCompletions.get(challengeId) || [];
  }
  
  async getUserChallengeProgress(userId: number, challengeId: number): Promise<number> {
    const progressKey = `${userId}_${challengeId}`;
    return this.userChallengeProgress.get(progressKey) || 0;
  }
  
  async rewardChallengeCreator(challengeId: number, completerId: number): Promise<{
    creator: User;
    completer: User;
    tokensAwarded: number;
  } | null> {
    // Find the challenge
    let challenge: Challenge | undefined;
    
    for (const [creatorId, challenges] of this.userCreatedChallenges.entries()) {
      const found = challenges.find(c => c.id === challengeId);
      if (found) {
        challenge = found;
        break;
      }
    }
    
    if (!challenge || !challenge.createdBy) {
      return null;
    }
    
    // Make sure creator and completer are different people
    if (challenge.createdBy === completerId) {
      return null;
    }
    
    const creator = await this.getUser(challenge.createdBy);
    const completer = await this.getUser(completerId);
    
    if (!creator || !completer) {
      return null;
    }
    
    // Give the creator 3 tokens
    const tokensAwarded = 3;
    await this.addUserTokens(challenge.createdBy, tokensAwarded);
    
    // Log this as a reward activity
    await this.createRewardActivity(
      challenge.createdBy,
      'help_others', // Categorize as helping others
      tokensAwarded,
      `${completer.username} completed your challenge: ${challenge.title}`
    );
    
    return {
      creator,
      completer,
      tokensAwarded
    };
  }

  // Profile picture related methods
  async updateUserProfilePicture(userId: number, profilePicture: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Update profile picture
    user.profilePicture = profilePicture;
    this.users.set(userId, user);
    
    return user;
  }
  
  // Badge related methods
  async getBadges(): Promise<Badge[]> {
    return this.badges;
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    const badgeIds = this.userBadges.get(userId) || [];
    return this.badges.filter(badge => badgeIds.includes(badge.id));
  }
  
  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    // Get the badge
    const badge = this.badges.find(b => b.id === badgeId);
    
    if (!badge) {
      throw new Error(`Badge with ID ${badgeId} not found`);
    }
    
    // Create default user profile if doesn't exist
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        username: 'User' + userId,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        achievementsCount: 0,
        completedChallenges: [],
        achievements: [],
        badges: []
      });
    }
    
    // Create user badges array if it doesn't exist
    if (!this.userBadges.has(userId)) {
      this.userBadges.set(userId, []);
    }
    
    const userBadgeIds = this.userBadges.get(userId)!;
    
    // Check if user already has this badge
    if (!userBadgeIds.includes(badgeId)) {
      userBadgeIds.push(badgeId);
      
      // Add badge to user's profile
      const profile = this.userProfiles.get(userId);
      if (profile && profile.badges) {
        profile.badges.push(badgeId);
      }
      
      // Reward tokens based on badge tier
      let tokensAwarded = 0;
      switch (badge.tier) {
        case 'bronze':
          tokensAwarded = 20;
          break;
        case 'silver':
          tokensAwarded = 50;
          break;
        case 'gold':
          tokensAwarded = 100;
          break;
        case 'platinum':
          tokensAwarded = 200;
          break;
      }
      
      if (tokensAwarded > 0) {
        await this.addUserTokens(userId, tokensAwarded);
        await this.createRewardActivity(
          userId,
          'badge_earned',
          tokensAwarded,
          `Earned ${tokensAwarded} tokens for receiving the ${badge.name} badge`
        );
      }
    }
    
    // Return user badge entity
    return {
      id: Date.now(),
      userId,
      badgeId,
      earnedAt: new Date()
    };
  }
  
  // Enhanced challenge methods
  async getChallengesByDifficulty(difficulty: ChallengeDifficulty): Promise<Challenge[]> {
    // Update existing challenges to have a proper difficulty values
    this.challenges.forEach(challenge => {
      if (challenge.difficulty === 'medium') {
        challenge.difficulty = 'moderate';
      }
    });
    
    return this.challenges.filter(c => c.difficulty === difficulty) as Challenge[];
  }
  
  async completeChallenge(userId: number, challengeId: number): Promise<{
    challenge: Challenge;
    tokensAwarded: number;
    badgeAwarded?: Badge;
  }> {
    // Find the challenge by ID
    const challenge = this.challenges.find(c => c.id === String(challengeId));
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }
    
    // Set the challenge as completed
    challenge.isCompleted = true;
    challenge.progress = challenge.targetValue;
    
    // Award tokens based on difficulty
    let tokensAwarded = 0;
    
    switch (challenge.difficulty) {
      case 'easy':
        tokensAwarded = 2;
        break;
      case 'moderate':
        tokensAwarded = 3;
        break;
      case 'hard':
        tokensAwarded = 5;
        break;
      case 'extreme':
        tokensAwarded = 7;
        break;
      default:
        tokensAwarded = 2;
    }
    
    // Add tokens to user's balance
    await this.addUserTokens(userId, tokensAwarded);
    
    // Create a reward activity
    await this.createRewardActivity(
      userId,
      'challenge_completion',
      tokensAwarded,
      `Earned ${tokensAwarded} tokens for completing ${challenge.title} (${challenge.difficulty} difficulty)`
    );
    
    // Create default user profile if doesn't exist
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        username: 'User' + userId,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        achievementsCount: 0,
        completedChallenges: [],
        achievements: [],
        badges: []
      });
    }
    
    const profile = this.userProfiles.get(userId);
    
    // Add to completed challenges
    if (!profile.completedChallenges.includes(challenge.id)) {
      profile.completedChallenges.push(challenge.id);
    }
    
    // Update experience and points
    profile.experience += tokensAwarded;
    profile.points += tokensAwarded;
    
    // Check for level up
    if (profile.experience >= profile.nextLevelExp) {
      profile.level += 1;
      profile.nextLevelExp = profile.level * 100; // Simple level progression
    }
    
    // Check if the user should be awarded a badge
    let badgeAwarded: Badge | undefined;
    
    // Count completed challenges by difficulty
    const completedByDifficulty: Record<ChallengeDifficulty, number> = {
      'easy': 0,
      'moderate': 0,
      'hard': 0,
      'extreme': 0
    };
    
    // Count all completed challenges
    for (const challengeId of profile.completedChallenges) {
      const chal = this.challenges.find(c => c.id === challengeId);
      if (chal) {
        const difficulty = chal.difficulty === 'medium' ? 'moderate' : chal.difficulty;
        if (completedByDifficulty[difficulty as ChallengeDifficulty] !== undefined) {
          completedByDifficulty[difficulty as ChallengeDifficulty]++;
        }
      }
    }
    
    // Check if user qualifies for any badge
    if (completedByDifficulty.easy >= 5) {
      const bronzeBadge = this.badges.find(b => b.tier === 'bronze');
      if (bronzeBadge) {
        const userBadges = this.userBadges.get(userId) || [];
        if (!userBadges.includes(bronzeBadge.id)) {
          await this.awardBadge(userId, bronzeBadge.id);
          badgeAwarded = bronzeBadge;
        }
      }
    }
    
    if (completedByDifficulty.moderate >= 5) {
      const silverBadge = this.badges.find(b => b.tier === 'silver');
      if (silverBadge) {
        const userBadges = this.userBadges.get(userId) || [];
        if (!userBadges.includes(silverBadge.id)) {
          await this.awardBadge(userId, silverBadge.id);
          badgeAwarded = silverBadge;
        }
      }
    }
    
    if (completedByDifficulty.hard >= 5) {
      const goldBadge = this.badges.find(b => b.tier === 'gold');
      if (goldBadge) {
        const userBadges = this.userBadges.get(userId) || [];
        if (!userBadges.includes(goldBadge.id)) {
          await this.awardBadge(userId, goldBadge.id);
          badgeAwarded = goldBadge;
        }
      }
    }
    
    if (completedByDifficulty.extreme >= 5) {
      const platinumBadge = this.badges.find(b => b.tier === 'platinum');
      if (platinumBadge) {
        const userBadges = this.userBadges.get(userId) || [];
        if (!userBadges.includes(platinumBadge.id)) {
          await this.awardBadge(userId, platinumBadge.id);
          badgeAwarded = platinumBadge;
        }
      }
    }
    
    // Save updated profile
    this.userProfiles.set(userId, profile);
    
    return {
      challenge: challenge as unknown as Challenge,
      tokensAwarded,
      badgeAwarded
    };
  }

  // Premium user methods
  
  // Token redemption methods
  async createTokenRedemption(userId: number, redemptionData: InsertTokenRedemption): Promise<TokenRedemption> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Check if user has enough tokens
    const tokensToRedeem = Number(redemptionData.tokensRedeemed);
    if (user.emotionTokens < tokensToRedeem) {
      throw new Error(`Not enough tokens. Required: ${tokensToRedeem}, Available: ${user.emotionTokens}`);
    }
    
    // Deduct tokens from user's balance
    user.emotionTokens -= tokensToRedeem;
    this.users.set(userId, user);
    
    // Create redemption record
    const id = this.redemptionId++;
    const redemption: TokenRedemption = {
      id,
      userId,
      tokensRedeemed: tokensToRedeem,
      cashAmount: redemptionData.cashAmount,
      status: "pending",
      redemptionType: redemptionData.redemptionType as RedemptionType,
      recipientInfo: redemptionData.recipientInfo || null,
      currency: redemptionData.currency || "USD",
      createdAt: new Date(),
      processedAt: null,
      notes: redemptionData.notes || null
    };
    
    // Add to user's redemptions
    if (!this.tokenRedemptions.has(userId)) {
      this.tokenRedemptions.set(userId, []);
    }
    
    this.tokenRedemptions.get(userId)?.push(redemption);
    
    return redemption;
  }
  
  async getUserTokenRedemptions(userId: number): Promise<TokenRedemption[]> {
    // Ensure the tokenRedemptions map has an entry for this user
    if (!this.tokenRedemptions.has(userId)) {
      this.tokenRedemptions.set(userId, []);
    }
    return this.tokenRedemptions.get(userId) || [];
  }
  
  async updateTokenRedemptionStatus(redemptionId: number, status: RedemptionStatus): Promise<TokenRedemption> {
    // Find the redemption across all users
    let foundRedemption: TokenRedemption | undefined;
    let userId: number | undefined;
    
    for (const [id, redemptions] of this.tokenRedemptions.entries()) {
      const redemption = redemptions.find(r => r.id === redemptionId);
      if (redemption) {
        foundRedemption = redemption;
        userId = id;
        break;
      }
    }
    
    if (!foundRedemption || !userId) {
      throw new Error(`Redemption with ID ${redemptionId} not found`);
    }
    
    // Update the status
    foundRedemption.status = status;
    
    // If completed or failed, add processed timestamp
    if (status === "completed" || status === "failed") {
      foundRedemption.processedAt = new Date();
    }
    
    // If canceled, refund the tokens to the user
    if (status === "canceled") {
      const user = await this.getUser(userId);
      if (user) {
        user.emotionTokens += foundRedemption.tokensRedeemed;
        this.users.set(userId, user);
      }
    }
    
    // Update in the map
    const userRedemptions = this.tokenRedemptions.get(userId);
    if (userRedemptions) {
      const index = userRedemptions.findIndex(r => r.id === redemptionId);
      if (index !== -1) {
        userRedemptions[index] = foundRedemption;
        this.tokenRedemptions.set(userId, userRedemptions);
      }
    }
    
    return foundRedemption;
  }
  
  async getEligibleForRedemption(userId: number): Promise<{
    eligible: boolean;
    tokenBalance: number;
    conversionRate: number;
    minimumTokens: number;
    estimatedCashAmount: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const tokenBalance = user.emotionTokens;
    const eligible = tokenBalance >= this.redemptionMinimumTokens;
    const estimatedCashAmount = tokenBalance * this.redemptionConversionRate;
    
    return {
      eligible,
      tokenBalance,
      conversionRate: this.redemptionConversionRate,
      minimumTokens: this.redemptionMinimumTokens,
      estimatedCashAmount
    };
  }
  
  // Premium user methods
  async updateUserPremiumStatus(userId: number, isPremium: boolean, planType?: PremiumPlanType): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.isPremium = isPremium;
    if (planType) {
      user.premiumPlanType = planType;
    }
    this.users.set(userId, user);
    return user;
  }
  
  async updateUserPaymentDetails(userId: number, paymentProvider: PaymentProvider, accountInfo: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    if (paymentProvider === 'paypal') {
      user.paypalEmail = accountInfo;
    } else if (paymentProvider === 'stripe') {
      user.stripeAccountId = accountInfo;
    }
    
    user.preferredPaymentMethod = paymentProvider;
    this.users.set(userId, user);
    return user;
  }
  
  // Family plan methods
  async createPremiumPlan(userId: number, planData: InsertPremiumPlan): Promise<PremiumPlan> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const plan: PremiumPlan = {
      id: Date.now(),
      userId,
      planType: planData.planType,
      startDate: new Date(),
      paymentAmount: planData.paymentAmount.toString(),
      currency: planData.currency || "USD",
      memberLimit: planData.memberLimit || 5,
      isLifetime: planData.isLifetime || false,
      nextBillingDate: planData.nextBillingDate || null,
      status: planData.status || "active",
      paymentMethod: planData.paymentMethod || null,
      paymentDetails: planData.paymentDetails || null
    };
    
    this.premiumPlans.set(userId, plan);
    
    // Update user's premium status
    await this.updateUserPremiumStatus(userId, true, planData.planType);
    
    return plan;
  }
  
  async getUserPremiumPlan(userId: number): Promise<PremiumPlan | undefined> {
    return this.premiumPlans.get(userId);
  }
  
  async addFamilyMember(userId: number, familyMemberData: InsertFamilyRelationship): Promise<FamilyRelationship> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const relatedUser = await this.getUser(familyMemberData.relatedUserId);
    if (!relatedUser) {
      throw new Error(`Related user with ID ${familyMemberData.relatedUserId} not found`);
    }
    
    // Verify the user has a family plan
    const plan = await this.getUserPremiumPlan(userId);
    if (!plan || plan.planType !== 'family') {
      throw new Error(`User ${userId} does not have an active family plan`);
    }
    
    // Check if we're at the member limit
    const existingMembers = await this.getFamilyMembers(userId);
    if (existingMembers.length >= plan.memberLimit) {
      throw new Error(`Family plan member limit (${plan.memberLimit}) reached`);
    }
    
    // Create relationship
    const relationship: FamilyRelationship = {
      id: Date.now(),
      userId,
      relatedUserId: familyMemberData.relatedUserId,
      relationshipType: familyMemberData.relationshipType,
      status: familyMemberData.status || 'pending',
      canViewMood: familyMemberData.canViewMood || false,
      canViewJournal: familyMemberData.canViewJournal || false,
      canReceiveAlerts: familyMemberData.canReceiveAlerts || false,
      canTransferTokens: familyMemberData.canTransferTokens || false,
      createdAt: new Date(),
      updatedAt: null,
      notes: familyMemberData.notes || null
    };
    
    if (!this.familyRelationships.has(userId)) {
      this.familyRelationships.set(userId, []);
    }
    
    this.familyRelationships.get(userId)?.push(relationship);
    
    // Only update the related user to indicate they're part of a family plan
    // if the relationship is accepted (not pending)
    if (relationship.status === 'accepted') {
      relatedUser.familyPlanOwnerId = userId;
      this.users.set(familyMemberData.relatedUserId, relatedUser);
    }
    
    return relationship;
  }
  
  async getFamilyRelationships(userId: number): Promise<FamilyRelationship[]> {
    return this.familyRelationships.get(userId) || [];
  }
  
  async getUsersWithFamilyRelationship(userId: number): Promise<User[]> {
    const relationships = this.familyRelationships.get(userId) || [];
    const users: User[] = [];
    
    for (const relationship of relationships) {
      if (relationship.status === 'accepted') {
        const user = await this.getUser(relationship.relatedUserId);
        if (user) {
          users.push(user);
        }
      }
    }
    
    return users;
  }
  
  async getFamilyRelationship(userId: number, relatedUserId: number): Promise<FamilyRelationship | null> {
    const relationships = this.familyRelationships.get(userId) || [];
    const relationship = relationships.find(r => r.relatedUserId === relatedUserId);
    return relationship || null;
  }
  
  async updateFamilyRelationshipStatus(id: number, status: FamilyRelationshipStatus): Promise<FamilyRelationship> {
    // Find the relationship by id in any user's relationships
    let foundRelationship: FamilyRelationship | null = null;
    let foundUserId: number | null = null;
    
    for (const [userId, relationships] of this.familyRelationships.entries()) {
      const relationship = relationships.find(r => r.id === id);
      if (relationship) {
        foundRelationship = relationship;
        foundUserId = userId;
        break;
      }
    }
    
    if (!foundRelationship || foundUserId === null) {
      throw new Error(`Family relationship with ID ${id} not found`);
    }
    
    // Update the relationship status
    foundRelationship.status = status;
    foundRelationship.updatedAt = new Date();
    
    // If the relationship is now accepted, update the related user's familyPlanOwnerId
    if (status === 'accepted') {
      const relatedUser = await this.getUser(foundRelationship.relatedUserId);
      if (relatedUser) {
        relatedUser.familyPlanOwnerId = foundUserId;
        this.users.set(foundRelationship.relatedUserId, relatedUser);
      }
    } else if (status === 'rejected') {
      // If rejected, remove the familyPlanOwnerId if it was previously set
      const relatedUser = await this.getUser(foundRelationship.relatedUserId);
      if (relatedUser && relatedUser.familyPlanOwnerId === foundUserId) {
        relatedUser.familyPlanOwnerId = null;
        this.users.set(foundRelationship.relatedUserId, relatedUser);
      }
    }
    
    return foundRelationship;
  }
  
  async getFamilyMembers(userId: number): Promise<(FamilyRelationship & { relatedUser: User })[]> {
    const relationships = this.familyRelationships.get(userId) || [];
    
    // Get the user details for each family member
    const membersWithDetails = await Promise.all(
      relationships.map(async (relationship) => {
        const user = await this.getUser(relationship.relatedUserId);
        return {
          ...relationship,
          relatedUser: user as User // We know this user exists because we validated during addFamilyMember
        };
      })
    );
    
    return membersWithDetails;
  }
  
  async updateFamilyMember(relationshipId: number, updates: Partial<InsertFamilyRelationship>): Promise<FamilyRelationship> {
    // Find which user has this relationship
    let foundRelationship: FamilyRelationship | undefined;
    let ownerId: number | undefined;
    
    for (const [userId, relationships] of this.familyRelationships.entries()) {
      const relationship = relationships.find(r => r.id === relationshipId);
      if (relationship) {
        foundRelationship = relationship;
        ownerId = userId;
        break;
      }
    }
    
    if (!foundRelationship || !ownerId) {
      throw new Error(`Family relationship with ID ${relationshipId} not found`);
    }
    
    // Update the relationship
    const updatedRelationship = {
      ...foundRelationship,
      relationshipType: updates.relationshipType || foundRelationship.relationshipType,
      canViewMood: updates.canViewMood !== undefined ? updates.canViewMood : foundRelationship.canViewMood,
      canViewJournal: updates.canViewJournal !== undefined ? updates.canViewJournal : foundRelationship.canViewJournal,
      canReceiveAlerts: updates.canReceiveAlerts !== undefined ? updates.canReceiveAlerts : foundRelationship.canReceiveAlerts
    };
    
    // Replace the old relationship in the array
    const relationships = this.familyRelationships.get(ownerId) || [];
    const updatedRelationships = relationships.map(r => 
      r.id === relationshipId ? updatedRelationship : r
    );
    
    this.familyRelationships.set(ownerId, updatedRelationships);
    
    return updatedRelationship;
  }
  
  async removeFamilyMember(relationshipId: number): Promise<boolean> {
    // Find which user has this relationship
    let foundIndex: number = -1;
    let ownerId: number | undefined;
    
    for (const [userId, relationships] of this.familyRelationships.entries()) {
      const index = relationships.findIndex(r => r.id === relationshipId);
      if (index !== -1) {
        foundIndex = index;
        ownerId = userId;
        break;
      }
    }
    
    if (foundIndex === -1 || !ownerId) {
      return false;
    }
    
    const relationships = this.familyRelationships.get(ownerId) || [];
    
    // Get the related user ID before removing the relationship
    const relatedUserId = relationships[foundIndex].relatedUserId;
    
    // Remove the relationship
    relationships.splice(foundIndex, 1);
    this.familyRelationships.set(ownerId, relationships);
    
    // Update the related user to remove the family plan owner reference
    const relatedUser = await this.getUser(relatedUserId);
    if (relatedUser) {
      relatedUser.familyPlanOwnerId = null;
      this.users.set(relatedUserId, relatedUser);
    }
    
    return true;
  }
  
  async updateMoodTrackingConsent(userId: number, allowMoodTracking: boolean): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.allowMoodTracking = allowMoodTracking;
    this.users.set(userId, user);
    
    return user;
  }
  
  async getFamilyMoodData(userId: number): Promise<{
    familyMember: User;
    currentMood: EmotionType;
    lastUpdated: string;
    moodHistory: { emotion: EmotionType; timestamp: string }[];
  }[]> {
    // Get all family members
    const familyMembers = await this.getFamilyMembers(userId);
    
    // Filter only those who have allowed mood tracking
    const consentingMembers = familyMembers.filter(member => member.relatedUser.allowMoodTracking);
    
    // For each consenting member, get their mood data
    const moodData = await Promise.all(
      consentingMembers.map(async (member) => {
        const memberId = member.relatedUser.id;
        const currentMood = await this.getUserEmotion(memberId) || 'neutral';
        const history = this.moodHistory.get(memberId) || [];
        
        return {
          familyMember: member.relatedUser,
          currentMood,
          lastUpdated: new Date().toISOString(), // In a real app, this would be the timestamp of the mood update
          moodHistory: history
        };
      })
    );
    
    return moodData;
  }
  
  /******************************
   * ADMIN USER MANAGEMENT METHODS
   ******************************/
  
  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const id = this.adminId++;
    
    // Create the admin user object
    const adminUser: AdminUser = {
      id,
      username: adminData.username,
      email: adminData.email,
      password: adminData.password, // In a real app, this would be hashed
      firstName: adminData.firstName || null,
      lastName: adminData.lastName || null,
      role: adminData.role,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      permissions: adminData.permissions || [],
      avatarUrl: adminData.avatarUrl || null,
      contactPhone: adminData.contactPhone || null,
      department: adminData.department || null
    };
    
    // Save the admin user
    this.adminUsers.set(id, adminUser);
    
    return adminUser;
  }
  
  async getAdminUser(adminId: number): Promise<AdminUser | undefined> {
    return this.adminUsers.get(adminId);
  }
  
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (admin) => admin.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async updateAdminUser(adminId: number, updates: Partial<InsertAdminUser>): Promise<AdminUser> {
    const adminUser = this.adminUsers.get(adminId);
    
    if (!adminUser) {
      throw new Error(`Admin user with ID ${adminId} not found`);
    }
    
    // Apply the updates
    const updatedAdmin: AdminUser = {
      ...adminUser,
      ...updates,
      // Ensure we don't overwrite ID and creation date
      id: adminUser.id,
      createdAt: adminUser.createdAt
    };
    
    // Save the updated admin user
    this.adminUsers.set(adminId, updatedAdmin);
    
    return updatedAdmin;
  }
  
  async deleteAdminUser(adminId: number): Promise<boolean> {
    const adminUser = this.adminUsers.get(adminId);
    
    if (!adminUser) {
      return false;
    }
    
    // Delete the admin user
    return this.adminUsers.delete(adminId);
  }
  
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values());
  }
  
  /******************************
   * SUPPORT TICKET METHODS
   ******************************/
   
  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.ticketId++;
    
    // Create the support ticket object
    const ticket: SupportTicket = {
      id,
      userId: ticketData.userId,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || 'medium',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: null,
      attachments: ticketData.attachments || [],
      relatedTicketId: ticketData.relatedTicketId || null,
      isSystemGenerated: false,
      lastResponseAt: null,
      timeToResolve: null
    };
    
    // Save the ticket
    this.supportTickets.set(id, ticket);
    
    return ticket;
  }
  
  async getSupportTicket(ticketId: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(ticketId);
  }
  
  async updateSupportTicket(
    ticketId: number, 
    updates: Partial<InsertSupportTicket> & { status?: TicketStatus, assignedTo?: number }
  ): Promise<SupportTicket> {
    const ticket = this.supportTickets.get(ticketId);
    
    if (!ticket) {
      throw new Error(`Support ticket with ID ${ticketId} not found`);
    }
    
    // Apply the updates
    const updatedTicket: SupportTicket = {
      ...ticket,
      ...updates,
      // Ensure we don't overwrite ID and creation date
      id: ticket.id,
      createdAt: ticket.createdAt,
      updatedAt: new Date()
    };
    
    // If status changed to resolved or closed, calculate resolution time
    if ((updates.status === 'resolved' || updates.status === 'closed') && 
        ticket.status !== 'resolved' && ticket.status !== 'closed') {
      const timeToResolve = Math.floor(
        (new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
      ); // Time in hours
      updatedTicket.timeToResolve = timeToResolve;
    }
    
    // Save the updated ticket
    this.supportTickets.set(ticketId, updatedTicket);
    
    return updatedTicket;
  }
  
  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAllSupportTickets(
    filters?: { 
      status?: TicketStatus, 
      category?: TicketCategory, 
      priority?: TicketPriority, 
      assignedTo?: number 
    }
  ): Promise<SupportTicket[]> {
    let tickets = Array.from(this.supportTickets.values());
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(ticket => ticket.status === filters.status);
      }
      
      if (filters.category) {
        tickets = tickets.filter(ticket => ticket.category === filters.category);
      }
      
      if (filters.priority) {
        tickets = tickets.filter(ticket => ticket.priority === filters.priority);
      }
      
      if (filters.assignedTo) {
        tickets = tickets.filter(ticket => ticket.assignedTo === filters.assignedTo);
      }
    }
    
    // Sort by created date (newest first)
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /******************************
   * TICKET RESPONSE METHODS
   ******************************/
   
  async createTicketResponse(responseData: InsertTicketResponse): Promise<TicketResponse> {
    const id = this.responseId++;
    
    // Create the ticket response object
    const response: TicketResponse = {
      id,
      ticketId: responseData.ticketId,
      responderId: responseData.responderId,
      isAdminResponse: responseData.isAdminResponse || false,
      content: responseData.content,
      createdAt: new Date(),
      attachments: responseData.attachments || [],
      isHelpful: responseData.isHelpful || null,
      isSystemGenerated: false
    };
    
    // Get existing responses for this ticket or initialize empty array
    const ticketResponses = this.ticketResponses.get(responseData.ticketId) || [];
    
    // Add the new response
    ticketResponses.push(response);
    
    // Update the ticket's lastResponseAt time
    const ticket = this.supportTickets.get(responseData.ticketId);
    if (ticket) {
      ticket.lastResponseAt = new Date();
      ticket.updatedAt = new Date();
      
      // If the ticket is 'open' and this is an admin response, change status to 'in_progress'
      if (ticket.status === 'open' && responseData.isAdminResponse) {
        ticket.status = 'in_progress';
      }
      
      this.supportTickets.set(responseData.ticketId, ticket);
    }
    
    // Save the responses
    this.ticketResponses.set(responseData.ticketId, ticketResponses);
    
    return response;
  }
  
  async getTicketResponses(ticketId: number): Promise<TicketResponse[]> {
    return (this.ticketResponses.get(ticketId) || [])
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async markResponseHelpful(responseId: number, isHelpful: boolean): Promise<TicketResponse> {
    // Find the response in all ticket responses
    for (const [ticketId, responses] of this.ticketResponses.entries()) {
      const responseIndex = responses.findIndex(r => r.id === responseId);
      
      if (responseIndex !== -1) {
        // Update the response
        responses[responseIndex].isHelpful = isHelpful;
        
        // Save back to the map
        this.ticketResponses.set(ticketId, responses);
        
        return responses[responseIndex];
      }
    }
    
    throw new Error(`Response with ID ${responseId} not found`);
  }
  
  /******************************
   * REFUND REQUEST METHODS
   ******************************/
   
  async createRefundRequest(refundData: InsertRefundRequest): Promise<RefundRequest> {
    const id = this.refundId++;
    
    // Create the refund request object
    const refundRequest: RefundRequest = {
      id,
      userId: refundData.userId,
      ticketId: refundData.ticketId || null,
      reason: refundData.reason,
      amount: refundData.amount,
      currency: refundData.currency || 'USD',
      transactionId: refundData.transactionId || null,
      paymentMethod: refundData.paymentMethod || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      processedBy: null,
      processedAt: null,
      notes: refundData.notes || null,
      evidence: refundData.evidence || []
    };
    
    // Save the refund request
    this.refundRequests.set(id, refundRequest);
    
    return refundRequest;
  }
  
  async getRefundRequest(refundId: number): Promise<RefundRequest | undefined> {
    return this.refundRequests.get(refundId);
  }
  
  async updateRefundRequest(
    refundId: number, 
    updates: { status?: RefundStatus, notes?: string, processedBy?: number }
  ): Promise<RefundRequest> {
    const refundRequest = this.refundRequests.get(refundId);
    
    if (!refundRequest) {
      throw new Error(`Refund request with ID ${refundId} not found`);
    }
    
    // Apply the updates
    const updatedRequest: RefundRequest = {
      ...refundRequest,
      ...updates,
      updatedAt: new Date()
    };
    
    // If status changed to processed or approved, update processed time
    if ((updates.status === 'processed' || updates.status === 'approved') && 
        refundRequest.status !== 'processed' && refundRequest.status !== 'approved') {
      updatedRequest.processedAt = new Date();
    }
    
    // Save the updated request
    this.refundRequests.set(refundId, updatedRequest);
    
    return updatedRequest;
  }
  
  async getRefundRequestsByUser(userId: number): Promise<RefundRequest[]> {
    return Array.from(this.refundRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAllRefundRequests(filters?: { status?: RefundStatus }): Promise<RefundRequest[]> {
    let requests = Array.from(this.refundRequests.values());
    
    // Apply filters if provided
    if (filters?.status) {
      requests = requests.filter(request => request.status === filters.status);
    }
    
    // Sort by created date (newest first)
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /******************************
   * ADMIN ACTIONS METHODS
   ******************************/
   
  async createAdminAction(actionData: InsertAdminAction): Promise<AdminAction> {
    const id = this.actionId++;
    
    // Create the admin action object
    const adminAction: AdminAction = {
      id,
      adminId: actionData.adminId,
      actionType: actionData.actionType,
      targetId: actionData.targetId || null,
      targetType: actionData.targetType,
      actionDetails: actionData.actionDetails || null,
      reason: actionData.reason || null,
      createdAt: new Date(),
      ipAddress: actionData.ipAddress || null,
      userAgent: actionData.userAgent || null,
      status: 'completed'
    };
    
    // Get existing actions for this admin or initialize empty array
    const adminActions = this.adminActions.get(actionData.adminId) || [];
    
    // Add the new action
    adminActions.push(adminAction);
    
    // Save the actions
    this.adminActions.set(actionData.adminId, adminActions);
    
    return adminAction;
  }
  
  async getAdminActions(adminId: number): Promise<AdminAction[]> {
    return (this.adminActions.get(adminId) || [])
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getActionsByTarget(targetType: string, targetId: number): Promise<AdminAction[]> {
    let allActions: AdminAction[] = [];
    
    // Collect all actions from all admins
    for (const adminActions of this.adminActions.values()) {
      allActions = [...allActions, ...adminActions];
    }
    
    // Filter by target type and ID
    return allActions
      .filter(action => action.targetType === targetType && action.targetId === targetId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAllAdminActions(limit?: number): Promise<AdminAction[]> {
    let allActions: AdminAction[] = [];
    
    // Collect all actions from all admins
    for (const adminActions of this.adminActions.values()) {
      allActions = [...allActions, ...adminActions];
    }
    
    // Sort by creation date (newest first)
    allActions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply limit if provided
    if (limit && limit > 0) {
      return allActions.slice(0, limit);
    }
    
    return allActions;
  }
  
  /******************************
   * QUOTE METHODS
   ******************************/
   
  async createQuote(quoteData: InsertQuote): Promise<Quote> {
    const id = this.quoteId++;
    
    // Create the quote object
    const quote: Quote = {
      id,
      userId: quoteData.userId || null,
      adminId: quoteData.adminId || null,
      ticketId: quoteData.ticketId || null,
      title: quoteData.title,
      description: quoteData.description,
      services: quoteData.services || [],
      totalAmount: quoteData.totalAmount,
      currency: quoteData.currency || 'USD',
      validUntil: quoteData.validUntil,
      status: 'pending',
      createdAt: new Date(),
      acceptedAt: null,
      notes: quoteData.notes || null,
      terms: quoteData.terms || null
    };
    
    // Save the quote
    this.quotes.set(id, quote);
    
    return quote;
  }
  
  async getQuote(quoteId: number): Promise<Quote | undefined> {
    return this.quotes.get(quoteId);
  }
  
  async updateQuoteStatus(quoteId: number, status: string, acceptedAt?: Date): Promise<Quote> {
    const quote = this.quotes.get(quoteId);
    
    if (!quote) {
      throw new Error(`Quote with ID ${quoteId} not found`);
    }
    
    // Apply the updates
    const updatedQuote: Quote = {
      ...quote,
      status
    };
    
    // If status is 'accepted', update acceptedAt
    if (status === 'accepted') {
      updatedQuote.acceptedAt = acceptedAt || new Date();
    }
    
    // Save the updated quote
    this.quotes.set(quoteId, updatedQuote);
    
    return updatedQuote;
  }
  
  async getUserQuotes(userId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getQuotesByTicket(ticketId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.ticketId === ticketId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /******************************
   * ADMIN DASHBOARD METHODS
   ******************************/
   
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    openTickets: number;
    pendingRefunds: number;
    usersByEmotion: Record<EmotionType, number>;
    recentTickets: SupportTicket[];
    recentRefunds: RefundRequest[];
  }> {
    // Calculate total users
    const totalUsers = this.users.size;
    
    // Calculate active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = Array.from(this.users.values())
      .filter(user => user.lastLogin && new Date(user.lastLogin) >= thirtyDaysAgo)
      .length;
    
    // Calculate premium users
    const premiumUsers = Array.from(this.users.values())
      .filter(user => user.isPremium)
      .length;
    
    // Set total revenue to 0 until app goes live
    const totalRevenue = 0;
    
    // Calculate open tickets
    const openTickets = Array.from(this.supportTickets.values())
      .filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress')
      .length;
    
    // Calculate pending refunds
    const pendingRefunds = Array.from(this.refundRequests.values())
      .filter(refund => refund.status === 'pending')
      .length;
    
    // Calculate users by emotion
    const usersByEmotion: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      neutral: 0
    };
    
    for (const emotion of this.userEmotions.values()) {
      usersByEmotion[emotion]++;
    }
    
    // Get recent tickets (5 most recent)
    const recentTickets = Array.from(this.supportTickets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    // Get recent refunds (5 most recent)
    const recentRefunds = Array.from(this.refundRequests.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenue,
      openTickets,
      pendingRefunds,
      usersByEmotion,
      recentTickets,
      recentRefunds
    };
  }

  // Video Posts methods for premium users
  async createVideoPost(userId: number, videoPostData: InsertVideoPost): Promise<VideoPost> {
    const id = this.postId++;
    const now = new Date();
    
    const videoPost: VideoPost = {
      id,
      userId,
      title: videoPostData.title,
      description: videoPostData.description || "",
      videoUrl: videoPostData.videoUrl,
      thumbnailUrl: videoPostData.thumbnailUrl || "",
      category: videoPostData.category,
      tags: videoPostData.tags || "",
      isPublic: videoPostData.isPublic !== undefined ? videoPostData.isPublic : true,
      allowComments: videoPostData.allowComments !== undefined ? videoPostData.allowComments : true,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      createdAt: now,
      updatedAt: now,
      status: "active"
    };
    
    this.videoPosts.set(id, videoPost);
    
    // Add to user's videos list
    if (!this.userVideoPosts.has(userId)) {
      this.userVideoPosts.set(userId, []);
    }
    
    this.userVideoPosts.get(userId)?.push(id);
    
    // Award tokens for creating health-related content (5 tokens per video)
    const user = await this.getUser(userId);
    if (user) {
      await this.createRewardActivity(userId, {
        userId,
        activityType: "video_post",
        tokensEarned: 5,
        description: `Created a new video: ${videoPost.title}`
      });
    }
    
    return videoPost;
  }

  async getVideoPost(postId: number): Promise<VideoPost | undefined> {
    return this.videoPosts.get(postId);
  }

  async getUserVideoPosts(userId: number): Promise<VideoPost[]> {
    const userVideoIds = this.userVideoPosts.get(userId) || [];
    return userVideoIds.map(id => this.videoPosts.get(id)).filter(Boolean) as VideoPost[];
  }

  async getAllPublicVideoPosts(): Promise<VideoPost[]> {
    return Array.from(this.videoPosts.values())
      .filter(post => post.isPublic && post.status === "active")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVideoPostsByCategory(category: VideoCategory): Promise<VideoPost[]> {
    return Array.from(this.videoPosts.values())
      .filter(post => post.category === category && post.isPublic && post.status === "active")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateVideoPost(postId: number, updates: Partial<InsertVideoPost>): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    const updatedPost: VideoPost = {
      ...post,
      ...updates,
      updatedAt: new Date()
    };
    
    this.videoPosts.set(postId, updatedPost);
    return updatedPost;
  }

  async deleteVideoPost(postId: number): Promise<boolean> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      return false;
    }
    
    // Instead of deleting, mark as removed
    post.status = "removed";
    post.updatedAt = new Date();
    this.videoPosts.set(postId, post);
    
    return true;
  }

  async incrementVideoPostViews(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.viewCount += 1;
    this.videoPosts.set(postId, post);
    
    // Update user's total video views stats
    await this.updateUserVideoStats(post.userId);
    
    return post;
  }

  async incrementVideoPostLikes(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.likeCount += 1;
    this.videoPosts.set(postId, post);
    
    // Update user's total video likes stats
    await this.updateUserVideoStats(post.userId);
    
    return post;
  }

  async incrementVideoPostShares(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.shareCount += 1;
    this.videoPosts.set(postId, post);
    
    // Update user's total video shares stats
    await this.updateUserVideoStats(post.userId);
    
    return post;
  }
  
  async incrementVideoPostComments(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.commentCount += 1;
    this.videoPosts.set(postId, post);
    
    // Update user's total video comments stats
    await this.updateUserVideoStats(post.userId);
    
    return post;
  }
  
  async incrementVideoPostDownloads(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.downloadCount += 1;
    this.videoPosts.set(postId, post);
    
    // Update user's total video downloads stats
    await this.updateUserVideoStats(post.userId);
    
    return post;
  }
  
  async incrementVideoPostFollows(postId: number): Promise<VideoPost> {
    const post = this.videoPosts.get(postId);
    
    if (!post) {
      throw new Error(`Video post with ID ${postId} not found`);
    }
    
    post.followCount += 1;
    this.videoPosts.set(postId, post);
    
    return post;
  }

  // Video social interaction methods
  async likeVideo(userId: number, videoId: number): Promise<VideoLike> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const video = await this.getVideoPost(videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    
    // Check if user has already liked this video
    if (await this.isVideoLikedByUser(userId, videoId)) {
      throw new Error(`User ${userId} has already liked video ${videoId}`);
    }
    
    const videoLike: VideoLike = {
      id: Date.now(),
      userId,
      videoId,
      createdAt: new Date()
    };
    
    // Add to video likes collection
    if (!this.videoLikes.has(videoId)) {
      this.videoLikes.set(videoId, []);
    }
    this.videoLikes.get(videoId)?.push(videoLike);
    
    // Increment the video's like count
    await this.incrementVideoPostLikes(videoId);
    
    return videoLike;
  }
  
  async unlikeVideo(userId: number, videoId: number): Promise<boolean> {
    if (!this.videoLikes.has(videoId)) {
      return false;
    }
    
    const likes = this.videoLikes.get(videoId) || [];
    const initialLength = likes.length;
    
    const updatedLikes = likes.filter(like => like.userId !== userId);
    this.videoLikes.set(videoId, updatedLikes);
    
    if (updatedLikes.length < initialLength) {
      // Decrement the video's like count
      const video = await this.getVideoPost(videoId);
      if (video && video.likeCount > 0) {
        video.likeCount -= 1;
        this.videoPosts.set(videoId, video);
        
        // Update user's total video likes stats
        await this.updateUserVideoStats(video.userId);
      }
      
      return true;
    }
    
    return false;
  }
  
  async isVideoLikedByUser(userId: number, videoId: number): Promise<boolean> {
    const likes = this.videoLikes.get(videoId) || [];
    return likes.some(like => like.userId === userId);
  }
  
  async getVideoLikes(videoId: number): Promise<VideoLike[]> {
    return this.videoLikes.get(videoId) || [];
  }
  
  async commentOnVideo(userId: number, videoId: number, commentData: InsertVideoComment): Promise<VideoComment> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const video = await this.getVideoPost(videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    
    const comment: VideoComment = {
      id: Date.now(),
      userId,
      videoId,
      content: commentData.content,
      parentCommentId: commentData.parentCommentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      isPinned: false,
      isHidden: false
    };
    
    // Add to video comments collection
    if (!this.videoComments.has(videoId)) {
      this.videoComments.set(videoId, []);
    }
    this.videoComments.get(videoId)?.push(comment);
    
    // Increment the video's comment count (only for top-level comments)
    if (!commentData.parentCommentId) {
      await this.incrementVideoPostComments(videoId);
    }
    
    return comment;
  }
  
  async getVideoComments(videoId: number): Promise<(VideoComment & {user: User})[]> {
    const comments = this.videoComments.get(videoId) || [];
    
    // Get top-level comments only (no replies)
    const topLevelComments = comments.filter(comment => !comment.parentCommentId);
    
    // Get the user details for each comment
    const commentsWithUser = await Promise.all(
      topLevelComments.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        return {
          ...comment,
          user: user as User
        };
      })
    );
    
    return commentsWithUser;
  }
  
  async getCommentReplies(commentId: number): Promise<VideoComment[]> {
    // Find which video this comment belongs to
    let videoId: number | null = null;
    for (const [vId, comments] of this.videoComments.entries()) {
      if (comments.some(c => c.id === commentId)) {
        videoId = vId;
        break;
      }
    }
    
    if (!videoId) {
      return [];
    }
    
    const comments = this.videoComments.get(videoId) || [];
    return comments.filter(comment => comment.parentCommentId === commentId);
  }
  
  async editVideoComment(commentId: number, content: string): Promise<VideoComment> {
    // Find the comment
    let comment: VideoComment | null = null;
    let videoId: number | null = null;
    
    for (const [vId, comments] of this.videoComments.entries()) {
      const foundComment = comments.find(c => c.id === commentId);
      if (foundComment) {
        comment = foundComment;
        videoId = vId;
        break;
      }
    }
    
    if (!comment || !videoId) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }
    
    // Update the comment
    const updatedComment = {
      ...comment,
      content,
      updatedAt: new Date(),
      isEdited: true
    };
    
    // Replace in the collection
    const comments = this.videoComments.get(videoId) || [];
    const updatedComments = comments.map(c => 
      c.id === commentId ? updatedComment : c
    );
    
    this.videoComments.set(videoId, updatedComments);
    
    return updatedComment;
  }
  
  async deleteVideoComment(commentId: number): Promise<boolean> {
    // Find the comment
    let videoId: number | null = null;
    let commentIndex = -1;
    
    for (const [vId, comments] of this.videoComments.entries()) {
      commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        videoId = vId;
        break;
      }
    }
    
    if (videoId === null || commentIndex === -1) {
      return false;
    }
    
    const comments = this.videoComments.get(videoId) || [];
    const comment = comments[commentIndex];
    
    // Check if this is a top-level comment
    const isTopLevel = !comment.parentCommentId;
    
    // Remove the comment
    comments.splice(commentIndex, 1);
    this.videoComments.set(videoId, comments);
    
    // Also remove all replies to this comment
    if (isTopLevel) {
      const updatedComments = comments.filter(c => c.parentCommentId !== commentId);
      this.videoComments.set(videoId, updatedComments);
      
      // Decrement the video's comment count
      const video = await this.getVideoPost(videoId);
      if (video && video.commentCount > 0) {
        video.commentCount -= 1;
        this.videoPosts.set(videoId, video);
        
        // Update user's total video comments stats
        await this.updateUserVideoStats(video.userId);
      }
    }
    
    return true;
  }
  
  // User profile social metrics methods
  async updateUserVideoStats(userId: number): Promise<{
    videoCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalDownloads: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get all videos posted by this user
    const userVideos = Array.from(this.videoPosts.values())
      .filter(video => video.userId === userId);
    
    // Calculate totals
    const stats = {
      videoCount: userVideos.length,
      totalViews: userVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0),
      totalLikes: userVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0),
      totalComments: userVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0),
      totalShares: userVideos.reduce((sum, video) => sum + (video.shareCount || 0), 0),
      totalDownloads: userVideos.reduce((sum, video) => sum + (video.downloadCount || 0), 0)
    };
    
    // Update the user's stats
    const updatedUser = {
      ...user,
      videoCount: stats.videoCount,
      totalVideoViews: stats.totalViews,
      totalVideoLikes: stats.totalLikes,
      totalVideoComments: stats.totalComments,
      totalVideoShares: stats.totalShares,
      totalVideoDownloads: stats.totalDownloads
    };
    
    this.users.set(userId, updatedUser);
    
    return stats;
  }
  
  // User follows methods
  async followUser(followerId: number, followedId: number): Promise<UserFollow> {
    // Check if users exist
    const follower = await this.getUser(followerId);
    if (!follower) {
      throw new Error(`Follower user with ID ${followerId} not found`);
    }
    
    const followed = await this.getUser(followedId);
    if (!followed) {
      throw new Error(`Followed user with ID ${followedId} not found`);
    }
    
    // Prevent self-following
    if (followerId === followedId) {
      throw new Error("Users cannot follow themselves");
    }
    
    // Check if already following
    if (await this.isUserFollowedByUser(followerId, followedId)) {
      throw new Error(`User ${followerId} is already following user ${followedId}`);
    }
    
    const follow: UserFollow = {
      id: Date.now(),
      followerId,
      followedId,
      createdAt: new Date()
    };
    
    // Add to following collection for follower
    if (!this.userFollowing.has(followerId)) {
      this.userFollowing.set(followerId, []);
    }
    this.userFollowing.get(followerId)?.push(follow);
    
    // Add to followers collection for followed user
    if (!this.userFollowers.has(followedId)) {
      this.userFollowers.set(followedId, []);
    }
    this.userFollowers.get(followedId)?.push(follow);
    
    // Update follower count for followed user
    await this.updateUserFollowerCount(followedId);
    
    return follow;
  }
  
  async unfollowUser(followerId: number, followedId: number): Promise<boolean> {
    // Check if the follow relationship exists in both maps
    const followingList = this.userFollowing.get(followerId) || [];
    const followersList = this.userFollowers.get(followedId) || [];
    
    const followingIndex = followingList.findIndex(
      f => f.followerId === followerId && f.followedId === followedId
    );
    
    const followersIndex = followersList.findIndex(
      f => f.followerId === followerId && f.followedId === followedId
    );
    
    if (followingIndex === -1 || followersIndex === -1) {
      return false; // Not following
    }
    
    // Remove the follow relationship from both maps
    followingList.splice(followingIndex, 1);
    followersList.splice(followersIndex, 1);
    
    this.userFollowing.set(followerId, followingList);
    this.userFollowers.set(followedId, followersList);
    
    // Update follower count for followed user
    await this.updateUserFollowerCount(followedId);
    
    return true;
  }
  
  async getUserFollowers(userId: number): Promise<(UserFollow & {follower: User})[]> {
    const followers = this.userFollowers.get(userId) || [];
    
    // Get the user details for each follower
    const followersWithUser = await Promise.all(
      followers.map(async (follow) => {
        const user = await this.getUser(follow.followerId);
        return {
          ...follow,
          follower: user as User
        };
      })
    );
    
    return followersWithUser;
  }
  
  async getUserFollowing(userId: number): Promise<(UserFollow & {followed: User})[]> {
    const following = this.userFollowing.get(userId) || [];
    
    // Get the user details for each followed user
    const followingWithUser = await Promise.all(
      following.map(async (follow) => {
        const user = await this.getUser(follow.followedId);
        return {
          ...follow,
          followed: user as User
        };
      })
    );
    
    return followingWithUser;
  }
  
  async isUserFollowedByUser(followerId: number, followedId: number): Promise<boolean> {
    const following = this.userFollowing.get(followerId) || [];
    return following.some(f => f.followedId === followedId);
  }
  
  async updateUserFollowerCount(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const followers = this.userFollowers.get(userId) || [];
    const followerCount = followers.length;
    
    const updatedUser = {
      ...user,
      followerCount
    };
    
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  // Video save and download methods
  async saveVideo(userId: number, videoId: number): Promise<VideoSave> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const video = await this.getVideoPost(videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    
    // Check if user has already saved this video
    if (await this.isVideoSavedByUser(userId, videoId)) {
      throw new Error(`User ${userId} has already saved video ${videoId}`);
    }
    
    const videoSave: VideoSave = {
      id: Date.now(),
      userId,
      videoId,
      createdAt: new Date()
    };
    
    // Add to video saves collection
    if (!this.videoSaves.has(userId)) {
      this.videoSaves.set(userId, []);
    }
    this.videoSaves.get(userId)?.push(videoSave);
    
    return videoSave;
  }
  
  async unsaveVideo(userId: number, videoId: number): Promise<boolean> {
    if (!this.videoSaves.has(userId)) {
      return false;
    }
    
    const saves = this.videoSaves.get(userId) || [];
    const initialLength = saves.length;
    
    const updatedSaves = saves.filter(save => save.videoId !== videoId);
    this.videoSaves.set(userId, updatedSaves);
    
    return updatedSaves.length < initialLength;
  }
  
  async getUserSavedVideos(userId: number): Promise<(VideoSave & {video: VideoPost})[]> {
    const saves = this.videoSaves.get(userId) || [];
    
    // Get the video details for each save
    const savesWithVideo = await Promise.all(
      saves.map(async (save) => {
        const video = await this.getVideoPost(save.videoId);
        return {
          ...save,
          video: video as VideoPost
        };
      })
    );
    
    return savesWithVideo;
  }
  
  async isVideoSavedByUser(userId: number, videoId: number): Promise<boolean> {
    const saves = this.videoSaves.get(userId) || [];
    return saves.some(save => save.videoId === videoId);
  }
  
  async downloadVideo(userId: number, videoId: number, ipAddress?: string): Promise<VideoDownload> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const video = await this.getVideoPost(videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    
    const videoDownload: VideoDownload = {
      id: Date.now(),
      userId,
      videoId,
      ipAddress: ipAddress || null,
      createdAt: new Date()
    };
    
    // Add to video downloads collection
    if (!this.videoDownloads.has(videoId)) {
      this.videoDownloads.set(videoId, []);
    }
    this.videoDownloads.get(videoId)?.push(videoDownload);
    
    // Increment the video's download count
    await this.incrementVideoPostDownloads(videoId);
    
    return videoDownload;
  }
  
  async getUserDownloadedVideos(userId: number): Promise<(VideoDownload & {video: VideoPost})[]> {
    const downloads: VideoDownload[] = [];
    
    // Collect all downloads for this user from all videos
    for (const [videoId, videoDownloads] of this.videoDownloads.entries()) {
      downloads.push(...videoDownloads.filter(d => d.userId === userId));
    }
    
    // Get the video details for each download
    const downloadsWithVideo = await Promise.all(
      downloads.map(async (download) => {
        const video = await this.getVideoPost(download.videoId);
        return {
          ...download,
          video: video as VideoPost
        };
      })
    );
    
    return downloadsWithVideo;
  }
  
  async getVideoDownloads(videoId: number): Promise<VideoDownload[]> {
    return this.videoDownloads.get(videoId) || [];
  }
  
  async followVideo(userId: number, videoId: number): Promise<VideoFollow> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const video = await this.getVideoPost(videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    
    // Check if user has already followed this video
    if (await this.isVideoFollowedByUser(userId, videoId)) {
      throw new Error(`User ${userId} has already followed video ${videoId}`);
    }
    
    const videoFollow: VideoFollow = {
      id: Date.now(),
      userId,
      videoId,
      createdAt: new Date()
    };
    
    // Add to video follows collection
    if (!this.videoFollows.has(videoId)) {
      this.videoFollows.set(videoId, []);
    }
    this.videoFollows.get(videoId)?.push(videoFollow);
    
    // Increment the video's follow count
    await this.incrementVideoPostFollows(videoId);
    
    return videoFollow;
  }
  
  async unfollowVideo(userId: number, videoId: number): Promise<boolean> {
    if (!this.videoFollows.has(videoId)) {
      return false;
    }
    
    const follows = this.videoFollows.get(videoId) || [];
    const initialLength = follows.length;
    
    const updatedFollows = follows.filter(follow => follow.userId !== userId);
    this.videoFollows.set(videoId, updatedFollows);
    
    if (updatedFollows.length < initialLength) {
      // Decrement the video's follow count
      const video = await this.getVideoPost(videoId);
      if (video && video.followCount > 0) {
        video.followCount -= 1;
        this.videoPosts.set(videoId, video);
      }
      
      return true;
    }
    
    return false;
  }
  
  async getVideoFollowers(videoId: number): Promise<(VideoFollow & {user: User})[]> {
    const follows = this.videoFollows.get(videoId) || [];
    
    // Get the user details for each follower
    const followsWithUser = await Promise.all(
      follows.map(async (follow) => {
        const user = await this.getUser(follow.userId);
        return {
          ...follow,
          user: user as User
        };
      })
    );
    
    return followsWithUser;
  }
  
  async isVideoFollowedByUser(userId: number, videoId: number): Promise<boolean> {
    const follows = this.videoFollows.get(videoId) || [];
    return follows.some(follow => follow.userId === userId);
  }
  
  // Advertisement methods
  async createAdvertisement(userId: number, data: InsertAdvertisement): Promise<Advertisement> {
    const id = this.advertisementId++;
    const now = new Date();
    
    const advertisement: Advertisement = {
      id,
      userId,
      createdAt: now,
      updatedAt: now,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || null,
      websiteUrl: data.websiteUrl || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      type: data.type,
      paymentProvider: data.paymentProvider || null,
      paymentTransactionId: data.paymentTransactionId || null,
      status: data.status || 'pending_payment',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      viewCount: 0,
      bookingCount: 0,
      locationDetails: data.locationDetails || null,
      budget: data.budget || null,
      additionalNotes: data.additionalNotes || null,
      isVerified: false
    };
    
    this.advertisements.set(id, advertisement);
    
    // Add to user's advertisements list
    if (!this.userAdvertisements.has(userId)) {
      this.userAdvertisements.set(userId, []);
    }
    this.userAdvertisements.get(userId)?.push(id);
    
    return advertisement;
  }
  
  async getAdvertisementById(id: number): Promise<Advertisement | undefined> {
    return this.advertisements.get(id);
  }
  
  async getUserAdvertisements(userId: number): Promise<Advertisement[]> {
    const adIds = this.userAdvertisements.get(userId) || [];
    return adIds.map(id => this.advertisements.get(id)).filter(Boolean) as Advertisement[];
  }
  
  async getAllPublishedAdvertisements(): Promise<(Advertisement & { user: User })[]> {
    const ads = Array.from(this.advertisements.values())
      .filter(ad => ad.status === 'published');
      
    return Promise.all(ads.map(async ad => {
      const user = await this.getUser(ad.userId);
      return { ...ad, user: user as User };
    }));
  }
  
  async getAdvertisementsByType(type: AdvertisementType): Promise<(Advertisement & { user: User })[]> {
    const ads = Array.from(this.advertisements.values())
      .filter(ad => ad.status === 'published' && ad.type === type);
      
    return Promise.all(ads.map(async ad => {
      const user = await this.getUser(ad.userId);
      return { ...ad, user: user as User };
    }));
  }
  
  async updateAdvertisement(id: number, data: Partial<InsertAdvertisement>): Promise<Advertisement> {
    const ad = this.advertisements.get(id);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    
    const updatedAd: Advertisement = {
      ...ad,
      ...data,
      updatedAt: new Date()
    };
    
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }
  
  async deleteAdvertisement(id: number): Promise<boolean> {
    const ad = this.advertisements.get(id);
    if (!ad) {
      return false;
    }
    
    // Remove from advertisements map
    this.advertisements.delete(id);
    
    // Remove from user's advertisements list
    const userAds = this.userAdvertisements.get(ad.userId);
    if (userAds) {
      const updatedUserAds = userAds.filter(adId => adId !== id);
      this.userAdvertisements.set(ad.userId, updatedUserAds);
    }
    
    return true;
  }
  
  async updateAdvertisementStatus(id: number, status: AdvertisementStatus): Promise<Advertisement> {
    const ad = this.advertisements.get(id);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    
    const updatedAd: Advertisement = {
      ...ad,
      status,
      updatedAt: new Date()
    };
    
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }
  
  async incrementAdvertisementViewCount(id: number): Promise<Advertisement> {
    const ad = this.advertisements.get(id);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    
    const updatedAd: Advertisement = {
      ...ad,
      viewCount: ad.viewCount + 1,
      updatedAt: new Date()
    };
    
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }
  
  async createAdvertisementPayment(id: number, provider: PaymentProvider, transactionId: string): Promise<Advertisement> {
    const ad = this.advertisements.get(id);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    
    const updatedAd: Advertisement = {
      ...ad,
      paymentProvider: provider,
      paymentTransactionId: transactionId,
      status: 'published',
      updatedAt: new Date()
    };
    
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }
  
  // Advertisement booking methods
  async createAdvertisementBooking(data: InsertAdvertisementBooking): Promise<AdvertisementBooking> {
    const id = this.bookingId++;
    const now = new Date();
    
    const booking: AdvertisementBooking = {
      id,
      advertisementId: data.advertisementId,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
      status: data.status || 'pending',
      notes: data.notes || null,
      contactDetails: data.contactDetails || null,
      locationDetails: data.locationDetails || null,
      requestedStartDate: data.requestedStartDate || null,
      requestedEndDate: data.requestedEndDate || null
    };
    
    // Add to advertisementBookings map
    if (!this.advertisementBookings.has(data.advertisementId)) {
      this.advertisementBookings.set(data.advertisementId, []);
    }
    this.advertisementBookings.get(data.advertisementId)?.push(booking);
    
    // Increment booking count on the advertisement
    await this.incrementAdvertisementBookingCount(data.advertisementId);
    
    return booking;
  }
  
  async getAdvertisementBookingById(id: number): Promise<AdvertisementBooking | undefined> {
    for (const [_, bookings] of this.advertisementBookings.entries()) {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        return booking;
      }
    }
    return undefined;
  }
  
  async getAdvertisementBookings(advertisementId: number): Promise<(AdvertisementBooking & { user: User })[]> {
    const bookings = this.advertisementBookings.get(advertisementId) || [];
    
    return Promise.all(bookings.map(async booking => {
      const user = await this.getUser(booking.userId);
      return { ...booking, user: user as User };
    }));
  }
  
  async getUserBookings(userId: number): Promise<(AdvertisementBooking & { advertisement: Advertisement })[]> {
    const allBookings: AdvertisementBooking[] = [];
    
    // Collect all bookings from all advertisements
    for (const [_, bookings] of this.advertisementBookings.entries()) {
      allBookings.push(...bookings);
    }
    
    // Filter for bookings by this user
    const userBookings = allBookings.filter(booking => booking.userId === userId);
    
    // Add advertisement details to each booking
    return Promise.all(userBookings.map(async booking => {
      const ad = await this.getAdvertisementById(booking.advertisementId);
      return { ...booking, advertisement: ad as Advertisement };
    }));
  }
  
  async updateAdvertisementBookingStatus(id: number, status: string): Promise<AdvertisementBooking> {
    for (const [adId, bookings] of this.advertisementBookings.entries()) {
      const index = bookings.findIndex(b => b.id === id);
      
      if (index !== -1) {
        const updatedBooking: AdvertisementBooking = {
          ...bookings[index],
          status,
          updatedAt: new Date()
        };
        
        bookings[index] = updatedBooking;
        this.advertisementBookings.set(adId, bookings);
        
        return updatedBooking;
      }
    }
    
    throw new Error('Booking not found');
  }
  
  async updateBookingLocationDetails(id: number, locationDetails: string): Promise<AdvertisementBooking> {
    for (const [adId, bookings] of this.advertisementBookings.entries()) {
      const index = bookings.findIndex(b => b.id === id);
      
      if (index !== -1) {
        const updatedBooking: AdvertisementBooking = {
          ...bookings[index],
          locationDetails,
          updatedAt: new Date()
        };
        
        bookings[index] = updatedBooking;
        this.advertisementBookings.set(adId, bookings);
        
        return updatedBooking;
      }
    }
    
    throw new Error('Booking not found');
  }
  
  async incrementAdvertisementBookingCount(advertisementId: number): Promise<Advertisement> {
    const ad = this.advertisements.get(advertisementId);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    
    const updatedAd: Advertisement = {
      ...ad,
      bookingCount: ad.bookingCount + 1,
      updatedAt: new Date()
    };
    
    this.advertisements.set(advertisementId, updatedAd);
    return updatedAd;
  }

  // Emotional Imprints methods (premium feature)
  async createEmotionalImprint(data: InsertEmotionalImprint): Promise<EmotionalImprint> {
    // Check if user is premium
    const user = await this.getUser(data.userId);
    if (!user) {
      throw new Error(`User ${data.userId} not found`);
    }
    
    if (!user.isPremium) {
      throw new Error('Emotional Imprints are a premium feature');
    }
    
    const imprint: EmotionalImprint = {
      id: this.emotionalImprintId++,
      createdAt: new Date(),
      ...data
    };
    
    // Add to imprints map
    this.emotionalImprints.set(imprint.id, imprint);
    
    // Add to user imprints map
    if (!this.userEmotionalImprints.has(data.userId)) {
      this.userEmotionalImprints.set(data.userId, []);
    }
    this.userEmotionalImprints.get(data.userId)!.push(imprint.id);
    
    return imprint;
  }
  
  async getEmotionalImprint(id: number): Promise<EmotionalImprint | undefined> {
    return this.emotionalImprints.get(id);
  }
  
  async getUserEmotionalImprints(userId: number): Promise<EmotionalImprint[]> {
    const imprintIds = this.userEmotionalImprints.get(userId) || [];
    return imprintIds
      .map(id => this.emotionalImprints.get(id)!)
      .filter(Boolean);
  }
  
  async getPublicEmotionalImprints(): Promise<EmotionalImprint[]> {
    const imprints: EmotionalImprint[] = [];
    
    for (const imprint of this.emotionalImprints.values()) {
      if (imprint.isPublic) {
        imprints.push(imprint);
      }
    }
    
    return imprints;
  }
  
  async getEmotionalImprintTemplates(): Promise<EmotionalImprint[]> {
    const templates: EmotionalImprint[] = [];
    
    for (const imprint of this.emotionalImprints.values()) {
      if (imprint.isTemplate) {
        templates.push(imprint);
      }
    }
    
    return templates;
  }
  
  async updateEmotionalImprint(id: number, updates: Partial<InsertEmotionalImprint>): Promise<EmotionalImprint> {
    const imprint = this.emotionalImprints.get(id);
    if (!imprint) {
      throw new Error(`Emotional imprint ${id} not found`);
    }
    
    // Check ownership
    const user = await this.getUser(imprint.userId);
    if (!user || !user.isPremium) {
      throw new Error('Only premium users can update emotional imprints');
    }
    
    const updatedImprint = {
      ...imprint,
      ...updates,
      id, // ensure ID doesn't change
      userId: imprint.userId, // ensure owner doesn't change
      updatedAt: new Date()
    };
    
    this.emotionalImprints.set(id, updatedImprint);
    
    return updatedImprint;
  }
  
  async deleteEmotionalImprint(id: number): Promise<boolean> {
    const imprint = this.emotionalImprints.get(id);
    if (!imprint) {
      return false;
    }
    
    // Remove from imprints map
    this.emotionalImprints.delete(id);
    
    // Remove from user imprints map
    const userImprints = this.userEmotionalImprints.get(imprint.userId);
    if (userImprints) {
      const updatedImprints = userImprints.filter(imprintId => imprintId !== id);
      this.userEmotionalImprints.set(imprint.userId, updatedImprints);
    }
    
    // Remove all interactions
    this.emotionalImprintInteractions.delete(id);
    
    return true;
  }
  
  async createEmotionalImprintInteraction(data: InsertEmotionalImprintInteraction): Promise<EmotionalImprintInteraction> {
    const imprint = await this.getEmotionalImprint(data.imprintId);
    if (!imprint) {
      throw new Error(`Emotional imprint ${data.imprintId} not found`);
    }
    
    // Check if sender is premium
    const sender = await this.getUser(data.senderId);
    if (!sender) {
      throw new Error(`Sender ${data.senderId} not found`);
    }
    
    if (!sender.isPremium) {
      throw new Error('Sending emotional imprints is a premium feature');
    }
    
    const interaction: EmotionalImprintInteraction = {
      id: this.imprintInteractionId++,
      createdAt: new Date(),
      ...data
    };
    
    // Add to interactions map
    if (!this.emotionalImprintInteractions.has(data.imprintId)) {
      this.emotionalImprintInteractions.set(data.imprintId, []);
    }
    this.emotionalImprintInteractions.get(data.imprintId)!.push(interaction);
    
    // Add to received imprints map
    if (!this.receivedEmotionalImprints.has(data.receiverId)) {
      this.receivedEmotionalImprints.set(data.receiverId, []);
    }
    this.receivedEmotionalImprints.get(data.receiverId)!.push(interaction.id);
    
    return interaction;
  }
  
  async getEmotionalImprintInteractions(imprintId: number): Promise<(EmotionalImprintInteraction & { receiver: User })[]> {
    const interactions = this.emotionalImprintInteractions.get(imprintId) || [];
    
    return Promise.all(
      interactions.map(async interaction => {
        const receiver = await this.getUser(interaction.receiverId);
        return {
          ...interaction,
          receiver: receiver!
        };
      })
    );
  }
  
  async getReceivedEmotionalImprints(userId: number): Promise<(EmotionalImprintInteraction & { imprint: EmotionalImprint, sender?: User })[]> {
    const interactionIds = this.receivedEmotionalImprints.get(userId) || [];
    const results: (EmotionalImprintInteraction & { imprint: EmotionalImprint, sender?: User })[] = [];
    
    // Collect all interactions this user has received
    for (const [imprintId, interactions] of this.emotionalImprintInteractions.entries()) {
      for (const interaction of interactions) {
        if (interaction.receiverId === userId) {
          const imprint = this.emotionalImprints.get(interaction.imprintId)!;
          
          // Get sender if not anonymous
          let sender: User | undefined;
          if (!interaction.isAnonymous) {
            sender = await this.getUser(interaction.senderId);
          }
          
          results.push({
            ...interaction,
            imprint,
            sender
          });
        }
      }
    }
    
    // Sort by creation date (newest first)
    return results.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  // Verification Document Methods
  async createVerificationDocument(documentData: {
    userId: number;
    documentType: string;
    documentNumber: string;
    documentUrl?: string;
    expirationDate?: Date;
    issuedBy?: string;
    issuedDate?: Date;
    verificationStatus: "pending" | "verified" | "not_verified";
    submittedAt: Date;
  }): Promise<any> {
    const id = this.docId++;
    
    // Create document with id
    const document = {
      id,
      ...documentData,
      verifiedAt: null,
      verifiedBy: null,
      verifierNotes: null,
    };
    
    // Get existing documents for user or initialize empty array
    const userDocuments = this.verificationDocuments.get(documentData.userId) || [];
    
    // Add new document
    userDocuments.push(document);
    
    // Update map
    this.verificationDocuments.set(documentData.userId, userDocuments);
    
    return document;
  }
  
  async getVerificationDocumentsByUser(userId: number): Promise<any[]> {
    return this.verificationDocuments.get(userId) || [];
  }
  
  async updateVerificationDocumentStatus(
    documentId: number, 
    status: "pending" | "verified" | "not_verified", 
    verifiedBy?: number,
    verifierNotes?: string
  ): Promise<any> {
    // Find the document across all users
    for (const [userId, documents] of this.verificationDocuments.entries()) {
      const documentIndex = documents.findIndex(doc => doc.id === documentId);
      
      if (documentIndex !== -1) {
        const document = documents[documentIndex];
        
        // Update document
        const updatedDocument = {
          ...document,
          verificationStatus: status,
          verifiedBy: verifiedBy || document.verifiedBy,
          verifierNotes: verifierNotes || document.verifierNotes,
          verifiedAt: status === "verified" ? new Date() : document.verifiedAt,
        };
        
        // Update in array
        documents[documentIndex] = updatedDocument;
        
        // Update map
        this.verificationDocuments.set(userId, documents);
        
        // If verified, update user's verification status
        if (status === "verified") {
          const user = this.users.get(userId);
          if (user) {
            // Count verified documents
            const verifiedDocs = documents.filter(doc => doc.verificationStatus === "verified").length;
            
            // If user has at least 2 verified documents, mark them as verified
            if (verifiedDocs >= 2) {
              this.users.set(userId, {
                ...user,
                verificationStatus: "verified",
                verifiedAt: new Date()
              });
            }
          }
        }
        
        return updatedDocument;
      }
    }
    
    return null;
  }

  // ----- Milestone Sharing Methods -----
  private milestoneShares: Map<number, MilestoneShare[]> = new Map();
  private milestoneShareId = 1;

  async createMilestoneShare(shareData: InsertMilestoneShare): Promise<MilestoneShare> {
    // Create a new milestone share record
    const milestoneShare: MilestoneShare = {
      id: this.milestoneShareId++,
      userId: shareData.userId,
      milestone: shareData.milestone,
      platform: shareData.platform,
      shareUrl: shareData.shareUrl,
      shareMessage: shareData.shareMessage || null,
      tokensAwarded: 0,
      clicks: 0,
      conversions: 0,
      shareDate: new Date(),
      ipAddress: shareData.ipAddress || null,
      trackingId: shareData.trackingId
    };

    // Get existing shares for user or initialize empty array
    const userShares = this.milestoneShares.get(shareData.userId) || [];
    
    // Add new share
    userShares.push(milestoneShare);
    
    // Update map
    this.milestoneShares.set(shareData.userId, userShares);
    
    return milestoneShare;
  }

  async getUserMilestoneShares(userId: number): Promise<MilestoneShare[]> {
    return this.milestoneShares.get(userId) || [];
  }

  async hasUserSharedMilestone(userId: number, milestone: number): Promise<boolean> {
    const userShares = this.milestoneShares.get(userId) || [];
    return userShares.some(share => share.milestone === milestone);
  }

  async updateMilestoneShareTokens(shareId: number, tokensAwarded: number): Promise<MilestoneShare> {
    // Find the milestone share across all users
    for (const [userId, shares] of this.milestoneShares.entries()) {
      const shareIndex = shares.findIndex(share => share.id === shareId);
      
      if (shareIndex !== -1) {
        // Update tokens awarded
        shares[shareIndex] = {
          ...shares[shareIndex],
          tokensAwarded
        };
        
        // Update map
        this.milestoneShares.set(userId, shares);
        
        return shares[shareIndex];
      }
    }
    
    throw new Error(`Milestone share with ID ${shareId} not found`);
  }

  async incrementMilestoneShareClicks(trackingId: string): Promise<MilestoneShare> {
    // Find the milestone share by tracking ID
    for (const [userId, shares] of this.milestoneShares.entries()) {
      const shareIndex = shares.findIndex(share => share.trackingId === trackingId);
      
      if (shareIndex !== -1) {
        // Increment clicks
        shares[shareIndex] = {
          ...shares[shareIndex],
          clicks: (shares[shareIndex].clicks || 0) + 1
        };
        
        // Update map
        this.milestoneShares.set(userId, shares);
        
        return shares[shareIndex];
      }
    }
    
    throw new Error(`Milestone share with tracking ID ${trackingId} not found`);
  }

  async incrementMilestoneShareConversions(trackingId: string): Promise<MilestoneShare> {
    // Find the milestone share by tracking ID
    for (const [userId, shares] of this.milestoneShares.entries()) {
      const shareIndex = shares.findIndex(share => share.trackingId === trackingId);
      
      if (shareIndex !== -1) {
        // Increment conversions
        shares[shareIndex] = {
          ...shares[shareIndex],
          conversions: (shares[shareIndex].conversions || 0) + 1
        };
        
        // Update map
        this.milestoneShares.set(userId, shares);
        
        return shares[shareIndex];
      }
    }
    
    throw new Error(`Milestone share with tracking ID ${trackingId} not found`);
  }

  // Subscription management methods
  async updateSubscriptionStatus(userId: number, isCancelled: boolean, cancelledAt?: Date | null): Promise<User> {
    if (!this.users.has(userId)) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const user = this.users.get(userId)!;
    
    // Update subscription cancelled status
    user.subscriptionCancelled = isCancelled;
    
    // If cancellation date is provided, set it, otherwise use current date
    if (isCancelled) {
      user.subscriptionCancelledAt = cancelledAt || new Date();
    } else {
      user.subscriptionCancelledAt = null;
    }
    
    // Update user in the map
    this.users.set(userId, user);
    
    return user;
  }
  
  async setPremiumExpiryDate(userId: number, expiryDate: Date): Promise<User> {
    if (!this.users.has(userId)) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const user = this.users.get(userId)!;
    
    // Set premium expiry date
    user.premiumExpiryDate = expiryDate;
    
    // Update user in the map
    this.users.set(userId, user);
    
    return user;
  }

  // Account and data deletion management methods
  async createDeletionRequest(data: InsertDeletionRequest): Promise<DeletionRequest> {
    const now = new Date();
    const id = this.nextDeletionRequestId++;
    
    const deletionRequest: DeletionRequest = {
      id,
      userId: data.userId,
      type: data.type,
      requestedAt: data.requestedAt || now,
      scheduledAt: data.scheduledAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      status: data.status || 'pending',
      processorId: null,
      processedAt: null,
      userEmail: data.userEmail || '',
      notificationSent: data.notificationSent || false,
      notificationSentAt: null,
      notes: data.notes || null
    };
    
    // Store the deletion request
    this.deletionRequests.set(id, deletionRequest);
    
    // Add to user's deletion requests map
    if (!this.userDeletionRequests.has(data.userId)) {
      this.userDeletionRequests.set(data.userId, []);
    }
    this.userDeletionRequests.get(data.userId)!.push(id);
    
    return deletionRequest;
  }
  
  async getDeletionRequests(): Promise<DeletionRequest[]> {
    return Array.from(this.deletionRequests.values());
  }
  
  async getDeletionRequestsByUser(userId: number): Promise<DeletionRequest[]> {
    const requestIds = this.userDeletionRequests.get(userId) || [];
    return requestIds.map(id => this.deletionRequests.get(id)).filter(Boolean) as DeletionRequest[];
  }
  
  async updateDeletionRequest(requestId: number, updates: Partial<DeletionRequest>): Promise<DeletionRequest> {
    const existingRequest = this.deletionRequests.get(requestId);
    
    if (!existingRequest) {
      throw new Error(`Deletion request with ID ${requestId} not found`);
    }
    
    const updatedRequest = { ...existingRequest, ...updates };
    this.deletionRequests.set(requestId, updatedRequest);
    
    return updatedRequest;
  }
  
  // NFT Token Pool System Methods
  async createTokenPool(data: InsertTokenPool): Promise<TokenPool> {
    const pool: TokenPool = {
      id: this.nextTokenPoolId++,
      createdAt: new Date(),
      ...data
    };
    
    this.tokenPools.set(pool.id, pool);
    return pool;
  }
  
  async updateTokenPool(poolId: number, data: Partial<TokenPool>): Promise<TokenPool> {
    if (!this.tokenPools.has(poolId)) {
      throw new Error('Token pool not found');
    }
    
    const pool = this.tokenPools.get(poolId)!;
    const updatedPool = {
      ...pool,
      ...data
    };
    
    this.tokenPools.set(poolId, updatedPool);
    return updatedPool;
  }
  
  async getCurrentTokenPool(): Promise<TokenPool | null> {
    // Find the active pool with the highest distribution round
    let currentPool: TokenPool | null = null;
    let maxRound = 0;
    
    for (const pool of this.tokenPools.values()) {
      if (pool.status === 'active' && pool.distributionRound > maxRound) {
        currentPool = pool;
        maxRound = pool.distributionRound;
      }
    }
    
    return currentPool;
  }
  
  async getTokenPoolById(poolId: number): Promise<TokenPool | null> {
    return this.tokenPools.get(poolId) || null;
  }
  
  async getTopPoolContributors(poolRound: number, limit: number): Promise<{userId: number, username: string, totalContribution: number}[]> {
    // Create a map to track total contribution by user
    const userContributions = new Map<number, number>();
    
    // Sum up all contributions for the specified round
    for (const contribution of this.poolContributions.values()) {
      if (contribution.poolRound === poolRound) {
        const currentTotal = userContributions.get(contribution.userId) || 0;
        userContributions.set(contribution.userId, currentTotal + contribution.tokenAmount);
      }
    }
    
    // Convert to array, sort by contribution amount in descending order, and limit
    const topContributors = Array.from(userContributions.entries())
      .map(([userId, totalContribution]) => {
        const user = this.users.get(userId);
        return {
          userId,
          username: user?.username || `User-${userId}`,
          totalContribution
        };
      })
      .sort((a, b) => b.totalContribution - a.totalContribution)
      .slice(0, limit);
    
    return topContributors;
  }
  
  async createPoolContribution(data: InsertPoolContribution): Promise<PoolContribution> {
    const contribution: PoolContribution = {
      id: this.nextPoolContributionId++,
      createdAt: new Date(),
      ...data
    };
    
    this.poolContributions.set(contribution.id, contribution);
    
    // Add to user contributions map
    if (!this.userPoolContributions.has(data.userId)) {
      this.userPoolContributions.set(data.userId, []);
    }
    this.userPoolContributions.get(data.userId)!.push(contribution.id);
    
    return contribution;
  }
  
  async getPoolContributionsByUser(userId: number, poolRound: number): Promise<PoolContribution[]> {
    const contributionIds = this.userPoolContributions.get(userId) || [];
    const contributions: PoolContribution[] = [];
    
    for (const id of contributionIds) {
      const contribution = this.poolContributions.get(id);
      if (contribution && contribution.poolRound === poolRound) {
        contributions.push(contribution);
      }
    }
    
    return contributions;
  }
  
  async getUserPoolContributionStats(userId: number, poolRound: number): Promise<{totalContribution: number, rank: number, contributionCount: number}> {
    // Get all contributions for the round
    const allContributors = await this.getTopPoolContributors(poolRound, 1000); // Large limit to get all
    
    // Find user's position
    const userPosition = allContributors.findIndex(c => c.userId === userId);
    const userContribution = userPosition >= 0 ? allContributors[userPosition].totalContribution : 0;
    const userRank = userPosition >= 0 ? userPosition + 1 : 0;
    
    // Get user's contribution count
    const userContributions = await this.getPoolContributionsByUser(userId, poolRound);
    
    return {
      totalContribution: userContribution,
      rank: userRank,
      contributionCount: userContributions.length
    };
  }
  
  async createPoolDistribution(data: InsertPoolDistribution): Promise<PoolDistribution> {
    const distribution: PoolDistribution = {
      id: this.nextPoolDistributionId++,
      createdAt: new Date(),
      ...data
    };
    
    this.poolDistributions.set(distribution.id, distribution);
    
    // Add to user distributions map if it's user-specific (not charity)
    if (!data.isCharity && data.userId !== 0) {
      if (!this.userPoolDistributions.has(data.userId)) {
        this.userPoolDistributions.set(data.userId, []);
      }
      this.userPoolDistributions.get(data.userId)!.push(distribution.id);
    }
    
    return distribution;
  }
  
  async getPoolDistributionsByUser(userId: number): Promise<PoolDistribution[]> {
    const distributionIds = this.userPoolDistributions.get(userId) || [];
    const distributions: PoolDistribution[] = [];
    
    for (const id of distributionIds) {
      const distribution = this.poolDistributions.get(id);
      if (distribution) {
        distributions.push(distribution);
      }
    }
    
    return distributions;
  }
  
  async getEmotionalNft(nftId: number): Promise<EmotionalNft | null> {
    return this.emotionalNfts.get(nftId) || null;
  }
  
  async getUserEmotionalNfts(userId: number): Promise<EmotionalNft[]> {
    const nftIds = this.userEmotionalNfts.get(userId) || [];
    const nfts: EmotionalNft[] = [];
    
    for (const id of nftIds) {
      const nft = this.emotionalNfts.get(id);
      if (nft) {
        nfts.push(nft);
      }
    }
    
    return nfts;
  }
  
  async createEmotionalNft(data: InsertEmotionalNft): Promise<EmotionalNft> {
    const nft: EmotionalNft = {
      id: this.nextEmotionalNftId++,
      createdAt: new Date(),
      mintedAt: null,
      burnedAt: null,
      evolutionProgress: 0,
      isDisplayed: data.isDisplayed || false,
      evolutionLevel: data.evolutionLevel || 1,
      mintStatus: data.mintStatus || 'unminted',
      ...data
    };
    
    this.emotionalNfts.set(nft.id, nft);
    
    // Add to user NFTs map
    if (!this.userEmotionalNfts.has(data.userId)) {
      this.userEmotionalNfts.set(data.userId, []);
    }
    this.userEmotionalNfts.get(data.userId)!.push(nft.id);
    
    return nft;
  }
  
  async updateEmotionalNft(nftId: number, data: Partial<EmotionalNft>): Promise<EmotionalNft> {
    if (!this.emotionalNfts.has(nftId)) {
      throw new Error('Emotional NFT not found');
    }
    
    const nft = this.emotionalNfts.get(nftId)!;
    const updatedNft = {
      ...nft,
      ...data
    };
    
    this.emotionalNfts.set(nftId, updatedNft);
    return updatedNft;
  }
  
  // Subscription management methods
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(userId);
  }
  
  async updateUserSubscription(userId: number, data: Partial<Subscription>): Promise<Subscription> {
    // Get existing subscription or create a new one
    let subscription = this.subscriptions.get(userId);
    
    if (!subscription) {
      // Create a new subscription with default values
      subscription = {
        id: this.nextSubscriptionId++,
        userId,
        tier: 'free',
        isActive: false,
        startDate: new Date(),
        expiryDate: null,
        renewsAt: null,
        cancelledAt: null,
        hadTrialBefore: false,
        paymentMethod: null,
        lastPaymentDate: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Update the subscription with the new data
    const updatedSubscription = {
      ...subscription,
      ...data,
      updatedAt: new Date()
    };
    
    // Save the updated subscription
    this.subscriptions.set(userId, updatedSubscription);
    
    return updatedSubscription;
  }
  
  // Custom mood tags methods
  async createCustomMoodTag(tagData: InsertCustomMoodTag): Promise<CustomMoodTag> {
    const tag: CustomMoodTag = {
      id: this.nextCustomMoodTagId++,
      ...tagData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!this.customMoodTags.has(tagData.userId)) {
      this.customMoodTags.set(tagData.userId, []);
    }
    
    this.customMoodTags.get(tagData.userId)!.push(tag);
    return tag;
  }
  
  async getUserCustomMoodTags(userId: number): Promise<CustomMoodTag[]> {
    return this.customMoodTags.get(userId) || [];
  }
  
  async getCustomMoodTag(userId: number, tagId: number): Promise<CustomMoodTag | undefined> {
    const userTags = this.customMoodTags.get(userId) || [];
    return userTags.find(tag => tag.id === tagId);
  }
  
  async updateCustomMoodTag(userId: number, tagId: number, tagData: Partial<InsertCustomMoodTag>): Promise<CustomMoodTag> {
    const userTags = this.customMoodTags.get(userId) || [];
    const tagIndex = userTags.findIndex(tag => tag.id === tagId);
    
    if (tagIndex === -1) {
      throw new Error("Custom mood tag not found");
    }
    
    const updatedTag = {
      ...userTags[tagIndex],
      ...tagData,
      updatedAt: new Date()
    };
    
    userTags[tagIndex] = updatedTag;
    this.customMoodTags.set(userId, userTags);
    
    return updatedTag;
  }
  
  async deleteCustomMoodTag(userId: number, tagId: number): Promise<void> {
    const userTags = this.customMoodTags.get(userId) || [];
    const filteredTags = userTags.filter(tag => tag.id !== tagId);
    
    if (filteredTags.length === userTags.length) {
      throw new Error("Custom mood tag not found");
    }
    
    this.customMoodTags.set(userId, filteredTags);
  }
  
  // Weekly mood report methods
  async generateWeeklyMoodReport(userId: number): Promise<WeeklyMoodReport> {
    // Get user emotion records from the past week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const emotionRecords = (this.emotionRecords.get(userId) || [])
      .filter(record => record.createdAt > weekAgo && record.createdAt <= now);
      
    // Calculate predominant moods
    const emotionCounts: Record<string, number> = {};
    emotionRecords.forEach(record => {
      if (!emotionCounts[record.emotion]) {
        emotionCounts[record.emotion] = 0;
      }
      emotionCounts[record.emotion]++;
    });
    
    // Calculate percentages
    const totalRecords = emotionRecords.length || 1; // Avoid division by zero
    const predominantMoods: Record<string, number> = {};
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      predominantMoods[emotion] = Math.round((count / totalRecords) * 100);
    }
    
    // Get daily moods (most common emotion per day)
    const dailyEmotions: Record<string, EmotionType[]> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    emotionRecords.forEach(record => {
      const day = days[record.createdAt.getDay()];
      if (!dailyEmotions[day]) {
        dailyEmotions[day] = [];
      }
      dailyEmotions[day].push(record.emotion);
    });
    
    const dailyMoods: Record<string, EmotionType | null> = {};
    
    for (const [day, emotions] of Object.entries(dailyEmotions)) {
      const emotionCounts: Record<string, number> = {};
      emotions.forEach(emotion => {
        if (!emotionCounts[emotion]) {
          emotionCounts[emotion] = 0;
        }
        emotionCounts[emotion]++;
      });
      
      let maxCount = 0;
      let predominantEmotion: EmotionType | null = null;
      
      for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count;
          predominantEmotion = emotion as EmotionType;
        }
      }
      
      dailyMoods[day] = predominantEmotion;
    }
    
    // Calculate mood trends
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekRecords = (this.emotionRecords.get(userId) || [])
      .filter(record => record.createdAt > twoWeeksAgo && record.createdAt <= weekAgo);
    
    // Simple scoring system: happy/excited = 5, neutral = 3, sad/anxious/angry = 1
    const getEmotionScore = (emotion: EmotionType): number => {
      if (emotion === 'happy' || emotion === 'excited') return 5;
      if (emotion === 'neutral') return 3;
      return 1; // sad, anxious, angry
    };
    
    const currentWeekScores = emotionRecords.map(record => getEmotionScore(record.emotion));
    const previousWeekScores = previousWeekRecords.map(record => getEmotionScore(record.emotion));
    
    const currentWeekAverage = currentWeekScores.length ? 
      currentWeekScores.reduce((sum, score) => sum + score, 0) / currentWeekScores.length : 0;
    
    const previousWeekAverage = previousWeekScores.length ? 
      previousWeekScores.reduce((sum, score) => sum + score, 0) / previousWeekScores.length : 0;
    
    const percentageChange = previousWeekAverage ? 
      ((currentWeekAverage - previousWeekAverage) / previousWeekAverage) * 100 : 0;
    
    // Generate insights based on data
    const insightsSummary = [];
    
    // Mood distribution insight
    const sortedEmotions = Object.entries(predominantMoods)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, percentage]) => `${emotion} (${percentage}%)`);
      
    if (sortedEmotions.length) {
      insightsSummary.push(`Your predominant moods this week were ${sortedEmotions.join(', ')}.`);
    } else {
      insightsSummary.push('No mood data was recorded this week. Try tracking your emotions daily for more insights.');
    }
    
    // Trend insight
    if (Math.abs(percentageChange) > 5) {
      const direction = percentageChange > 0 ? 'improved' : 'declined';
      insightsSummary.push(`Your overall mood has ${direction} by ${Math.abs(Math.round(percentageChange))}% compared to last week.`);
    } else {
      insightsSummary.push('Your overall mood has remained relatively stable compared to last week.');
    }
    
    // Generate recommendations based on data
    const recommendedActions = [];
    
    // If predominantly negative emotions
    const negativeEmotions = ['sad', 'angry', 'anxious'];
    const negativePercentage = negativeEmotions.reduce((sum, emotion) => 
      sum + (predominantMoods[emotion] || 0), 0);
      
    if (negativePercentage > 50) {
      recommendedActions.push('Consider practicing daily mindfulness or meditation to improve emotional regulation.');
      recommendedActions.push('Reach out to a friend or family member for support.');
      recommendedActions.push('Prioritize self-care activities that bring you joy.');
    }
    
    // If mood swings (multiple emotions with similar percentages)
    const topEmotions = Object.values(predominantMoods).sort((a, b) => b - a);
    if (topEmotions.length >= 3 && (topEmotions[0] - topEmotions[2] < 15)) {
      recommendedActions.push('Your emotions appear to fluctuate throughout the week. Journaling might help identify patterns.');
      recommendedActions.push('Establishing a regular routine can help stabilize mood swings.');
    }
    
    // Default recommendations
    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue tracking your emotions daily for more personalized insights.');
      recommendedActions.push('Explore the Mood Correlation feature to identify factors affecting your emotions.');
    }
    
    // Create the weekly report
    const weeklyReport: WeeklyMoodReport = {
      userId,
      weekStartDate: weekAgo,
      weekEndDate: now,
      predominantMoods,
      dailyMoods,
      moodTrends: {
        improvement: percentageChange >= 0,
        percentageChange: Math.round(Math.abs(percentageChange)),
        previousWeekAverage: Math.round(previousWeekAverage * 10) / 10,
        currentWeekAverage: Math.round(currentWeekAverage * 10) / 10
      },
      insightsSummary,
      correlationInsights: {
        weather: null, // Would require weather data integration
        sleepHours: null, // Would require sleep tracking data
        physicalActivity: null // Would require activity tracking data
      },
      recommendedActions,
      generatedAt: now
    };
    
    // Save the weekly report
    if (!this.weeklyMoodReports.has(userId)) {
      this.weeklyMoodReports.set(userId, []);
    }
    
    this.weeklyMoodReports.get(userId)!.push(weeklyReport);
    
    return weeklyReport;
  }
  
  async getUserWeeklyMoodReports(userId: number): Promise<WeeklyMoodReport[]> {
    return this.weeklyMoodReports.get(userId) || [];
  }
  
  async getLatestWeeklyMoodReport(userId: number): Promise<WeeklyMoodReport | undefined> {
    const userReports = this.weeklyMoodReports.get(userId) || [];
    
    if (userReports.length === 0) {
      return undefined;
    }
    
    // Sort by generation date (newest first)
    return userReports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0];
  }

  // Community features methods
  async getCommunityPosts(filter: string, userId: number): Promise<Array<any>> {
    const posts = Array.from(this.communityPosts.values());
    let filteredPosts = posts;
    
    // Apply filter if provided
    if (filter === 'mine') {
      filteredPosts = posts.filter(post => post.userId === userId);
    } else if (filter === 'friends') {
      // For now, just show own posts in friends filter since friend system isn't implemented yet
      filteredPosts = posts.filter(post => post.userId === userId || post.visibility === 'public');
    } else {
      // Default to showing public posts
      filteredPosts = posts.filter(post => post.visibility === 'public');
    }
    
    // Enrich posts with user info and reaction status
    const enrichedPosts = filteredPosts.map(post => {
      const user = this.users.get(post.userId);
      const userHasLiked = this.postReactions.has(post.id) && 
                          this.postReactions.get(post.id)?.has(userId);
                          
      const likeCount = this.postReactions.has(post.id) 
                      ? this.postReactions.get(post.id)?.size || 0 
                      : 0;
                      
      const commentCount = this.postComments.has(post.id) 
                         ? this.postComments.get(post.id)?.length || 0 
                         : 0;
      
      return {
        ...post,
        username: user?.username || 'Anonymous',
        profilePicture: user?.profilePicture,
        isPremium: user?.isPremium || false,
        userHasLiked: userHasLiked || false,
        likeCount,
        commentCount
      };
    });
    
    // Sort by newest first
    return enrichedPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getCommunityPostById(postId: number): Promise<any | undefined> {
    return this.communityPosts.get(postId);
  }
  
  async createCommunityPost(userId: number, postData: any): Promise<any> {
    const post = {
      id: this.nextCommunityPostId++,
      userId,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      likeCount: 0,
      commentCount: 0
    };
    
    this.communityPosts.set(post.id, post);
    return post;
  }
  
  async updateCommunityPost(postId: number, updates: any): Promise<any> {
    const post = this.communityPosts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    const updatedPost = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.communityPosts.set(postId, updatedPost);
    return updatedPost;
  }
  
  async deleteCommunityPost(postId: number): Promise<boolean> {
    const exists = this.communityPosts.has(postId);
    if (exists) {
      this.communityPosts.delete(postId);
      // Also clean up related comments and reactions
      this.postComments.delete(postId);
      this.postReactions.delete(postId);
    }
    return exists;
  }
  
  async getPostComments(postId: number): Promise<any[]> {
    const comments = this.postComments.get(postId) || [];
    
    // Enrich comments with user info
    return comments.map(comment => {
      const user = this.users.get(comment.userId);
      return {
        ...comment,
        username: user?.username || 'Anonymous',
        profilePicture: user?.profilePicture
      };
    }).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  
  async createPostComment(postId: number, userId: number, content: string): Promise<any> {
    const post = this.communityPosts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    if (!this.postComments.has(postId)) {
      this.postComments.set(postId, []);
    }
    
    const comment = {
      id: this.nextPostCommentId++,
      postId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    
    this.postComments.get(postId)!.push(comment);
    
    // Update comment count on post
    post.commentCount = (post.commentCount || 0) + 1;
    this.communityPosts.set(postId, post);
    
    const user = this.users.get(userId);
    return {
      ...comment,
      username: user?.username || 'Anonymous',
      profilePicture: user?.profilePicture
    };
  }
  
  async deletePostComment(postId: number, commentId: number): Promise<boolean> {
    if (!this.postComments.has(postId)) {
      return false;
    }
    
    const comments = this.postComments.get(postId)!;
    const initialLength = comments.length;
    const filteredComments = comments.filter(c => c.id !== commentId);
    
    if (initialLength !== filteredComments.length) {
      this.postComments.set(postId, filteredComments);
      
      // Update comment count on post
      const post = this.communityPosts.get(postId);
      if (post) {
        post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
        this.communityPosts.set(postId, post);
      }
      
      return true;
    }
    
    return false;
  }
  
  async likePost(postId: number, userId: number): Promise<{ postId: number; userId: number; likeCount: number }> {
    const post = this.communityPosts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Initialize the reactions map for this post if it doesn't exist
    if (!this.postReactions.has(postId)) {
      this.postReactions.set(postId, new Map());
    }
    
    const postReactionsMap = this.postReactions.get(postId)!;
    
    // Check if user already liked the post
    if (postReactionsMap.has(userId)) {
      return {
        postId,
        userId,
        likeCount: postReactionsMap.size
      };
    }
    
    // Add the like
    const reaction = {
      id: this.nextPostReactionId++,
      postId,
      userId,
      type: 'like',
      createdAt: new Date().toISOString()
    };
    
    postReactionsMap.set(userId, reaction);
    
    // Update like count on post
    post.likeCount = postReactionsMap.size;
    this.communityPosts.set(postId, post);
    
    return {
      postId,
      userId,
      likeCount: postReactionsMap.size
    };
  }
  
  async unlikePost(postId: number, userId: number): Promise<{ postId: number; userId: number; likeCount: number }> {
    const post = this.communityPosts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    if (!this.postReactions.has(postId)) {
      return {
        postId,
        userId,
        likeCount: 0
      };
    }
    
    const postReactionsMap = this.postReactions.get(postId)!;
    
    // Remove the reaction
    postReactionsMap.delete(userId);
    
    // Update like count on post
    post.likeCount = postReactionsMap.size;
    this.communityPosts.set(postId, post);
    
    return {
      postId,
      userId,
      likeCount: postReactionsMap.size
    };
  }
  
  async checkFriendship(userId: number, otherUserId: number): Promise<boolean> {
    // For now, just return true for simplicity
    // This would be replaced with actual friendship checking logic when implemented
    return true;
  }
  
  async getSupportGroups(): Promise<any[]> {
    return this.supportGroups;
  }
  
  async getExpertTips(category?: string): Promise<any[]> {
    if (category) {
      return this.expertTips.filter(tip => tip.category === category);
    }
    return this.expertTips;
  }
}

export const storage = new MemStorage();