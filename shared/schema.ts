import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type EmotionType = "happy" | "sad" | "angry" | "anxious" | "excited" | "neutral" | "joy" | "sadness" | "anger" | "surprise" | "surprised";
export type OnlineStatus = "online" | "offline" | "away" | "busy";
export type ImpressionColor = "amber" | "blue" | "green" | "purple" | "red" | "teal" | "pink" | "orange" | "indigo" | "gray";
export type ImpressionSound = "ocean" | "rainfall" | "forest" | "vinyl" | "cityscape" | "heartbeat" | "wind" | "thunder" | "birds" | "silence";
export type ImpressionVibration = "gentle" | "pulsing" | "intense" | "rhythmic" | "wave" | "escalating" | "staccato" | "continuous" | "none";
export type RewardActivityType = "journal_entry" | "chat_participation" | "emotion_update" | "daily_login" | "help_others" | "challenge_completion" | "badge_earned" | "token_transfer" | "video_post" | "video_like" | "video_comment" | "video_share" | "game_completion" | "milestone_share";
export type TokenTransferType = "family" | "general" | "system" | "friend" | "help" | "charity" | "gofundme" | "crisalfund" | "nft_purchase";
export type TokenTransferStatus = "pending" | "completed" | "failed" | "canceled";

export type NftRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Unique";
export type NftCategory = "emotional" | "wellness" | "achievement" | "milestone" | "custom";
export type ChallengeDifficulty = "easy" | "moderate" | "hard" | "extreme";
export type VideoCategory = "mental_health" | "wellness" | "motivation" | "meditation" | "exercise" | "nutrition" | "sleep" | "mindfulness" | "other";
export type GameCategory = "puzzle" | "relaxation" | "meditation" | "focus" | "memory" | "creativity" | "word" | "pattern" | "breathing" | "positive_affirmation";
export type GameDifficulty = "beginner" | "intermediate" | "advanced";
export type ActivityType = "work" | "study" | "exercise" | "social" | "family" | "rest" | "entertainment" | "meditation" | "outdoors" | "home" | "other";
export type VerificationStatus = "not_verified" | "pending" | "verified";
export type SubscriptionTier = "free" | "trial" | "premium" | "family" | "lifetime";

// Tokenomics constants
export const TOKEN_CONVERSION_RATE = 0.0010; // $0.0010 per token
export const MIN_REDEMPTION_TOKENS = 10000; // Minimum tokens required for redemption

// Premium access by token requirements
export const PREMIUM_ACCESS_TOKENS = {
  ONE_WEEK: 2500,
  TWO_WEEKS: 4500,
  THREE_WEEKS: 7000,
  FOUR_WEEKS: 10000
};
export type VerificationPaymentPlan = "monthly" | "yearly";
export type VerificationDocumentType = "passport" | "drivers_license" | "national_id" | "state_id" | "birth_certificate" | "social_security" | "health_card" | "medicare_card" | "citizenship_card" | "biometric_residence" | "residence_permit" | "certificate_citizenship" | "other";
export type AuthProviderType = "local" | "google" | "facebook" | "apple";

export type GenderType = "male" | "female" | "non_binary" | "other" | "prefer_not_to_say";
export type PaymentProvider = "paypal" | "stripe";
export type StripeSubscriptionStatus = "active" | "past_due" | "unpaid" | "canceled" | "incomplete" | "incomplete_expired" | "trialing";
export type PremiumPlanType = "individual" | "family";
export type FamilyRelationshipType = "parent" | "child" | "spouse" | "sibling" | "grandparent" | "other";
export type FamilyRelationshipStatus = "pending" | "accepted" | "rejected";
export type TokenActionType = "redeem" | "transfer" | "donate";

// Admin-related types
export type AdminRole = "admin" | "moderator" | "support" | "finance";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "escalated";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "account" | "payment" | "refund" | "technical" | "feature_request" | "bug_report" | "content" | "other";
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";
export type AdminActionType = "user_ban" | "user_unban" | "content_removal" | "warning_issued" | "payment_processed" | "refund_processed" | "account_recovery" | "challenge_approval" | "support_response";
export type FeedbackStatus = "new" | "reviewed" | "in_progress" | "implemented" | "declined";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  gender: text("gender").$type<GenderType>(),
  state: text("state"),
  country: text("country"),
  emotionTokens: integer("emotion_tokens").default(0).notNull(),
  isPremium: boolean("is_premium").default(false),
  premiumPlanType: text("premium_plan_type").$type<PremiumPlanType>(),
  premiumExpiryDate: timestamp("premium_expiry_date"),
  isInTrialPeriod: boolean("is_in_trial_period").default(false),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  subscriptionCancelled: boolean("subscription_cancelled").default(false),
  subscriptionCancelledAt: timestamp("subscription_cancelled_at"),
  familyPlanOwnerId: integer("family_plan_owner_id").references(() => users.id),
  allowMoodTracking: boolean("allow_mood_tracking").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  profilePicture: text("profile_picture"),
  ipAddress: text("ip_address"),
  lastLogin: timestamp("last_login"),
  status: text("status").$type<OnlineStatus>().default("offline"),
  lastActiveAt: timestamp("last_active_at"),
  paypalEmail: text("paypal_email"),
  // Stripe data - PCI compliant (no actual card data stored)
  stripeCustomerId: text("stripe_customer_id"), // Safe to store - reference to customer in Stripe
  stripeSubscriptionId: text("stripe_subscription_id"), // Safe to store - reference to subscription in Stripe
  stripeLastFour: text("stripe_last_four"), // Safe to store - last 4 digits only
  stripeCardBrand: text("stripe_card_brand"), // Safe to store - card type (Visa, MC, etc)
  stripeCardExpiry: text("stripe_card_expiry"), // Safe to store - MM/YY format
  stripePaymentMethodId: text("stripe_payment_method_id"), // Safe to store - payment method token
  // Legacy field for compatibility
  stripeAccountId: text("stripe_account_id"),
  preferredPaymentMethod: text("preferred_payment_method").$type<PaymentProvider>(),
  preferredCurrency: text("preferred_currency").default("USD"),
  verificationStatus: text("verification_status").$type<VerificationStatus>().default("not_verified"),
  verifiedAt: timestamp("verified_at"),
  verificationExpiresAt: timestamp("verification_expires_at"),
  verificationPaymentPlan: text("verification_payment_plan"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes"),
  twoFactorRecoveryKey: text("two_factor_recovery_key"),
  twoFactorVerified: boolean("two_factor_verified").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
  referralCount: integer("referral_count").default(0),
  followerCount: integer("follower_count").default(0),
  videoCount: integer("video_count").default(0),
  totalVideoViews: integer("total_video_views").default(0),
  totalVideoLikes: integer("total_video_likes").default(0),
  totalVideoComments: integer("total_video_comments").default(0),
  totalVideoShares: integer("total_video_shares").default(0),
  totalVideoDownloads: integer("total_video_downloads").default(0),
  accountDeletionRequested: boolean("account_deletion_requested").default(false),
  accountDeletionRequestedAt: timestamp("account_deletion_requested_at"),
  accountDeletionScheduledAt: timestamp("account_deletion_scheduled_at"),
  dataDeletionRequested: boolean("data_deletion_requested").default(false),
  dataDeletionRequestedAt: timestamp("data_deletion_requested_at"),
  dataDeletionScheduledAt: timestamp("data_deletion_scheduled_at"),
});

export const emotions = pgTable("emotions", {
  userId: integer("user_id").notNull().references(() => users.id),
  emotion: text("emotion").notNull().$type<EmotionType>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emotion: text("emotion").notNull().$type<EmotionType>(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emotion: text("emotion").notNull().$type<EmotionType>(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  isPrivate: boolean("is_private").default(false),
  maxParticipants: integer("max_participants").default(50),
  themeColor: text("theme_color").default("#6366f1"),
});

export const rewardActivities = pgTable("reward_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull().$type<RewardActivityType>(),
  tokensEarned: integer("tokens_earned").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  category: text("category").notNull(),
  tier: text("tier").notNull(), // bronze, silver, gold, platinum
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatRoomParticipants = pgTable("chat_room_participants", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().$type<ChallengeDifficulty>(),
  tokenReward: integer("token_reward").notNull(),
  targetValue: integer("target_value").notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  isUserCreated: boolean("is_user_created").default(false),
  isPublic: boolean("is_public").default(true),
  completionCount: integer("completion_count").default(0),
  approvalStatus: text("approval_status").default("approved"), // approved, pending, rejected
  tags: text("tags"), // comma-separated tags for searching
});

export type RedemptionStatus = "pending" | "processing" | "completed" | "failed" | "canceled";
export type RedemptionType = "cash" | "donation" | "transfer";
export type ReferralStatus = "pending" | "registered" | "converted" | "expired";
export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type ContentVisibility = "public" | "friends" | "private";
export type MessageType = "text" | "emoji" | "voice" | "image" | "video";
export type NotificationType = 
  | "friend_request" 
  | "message" 
  | "token_received" 
  | "token_sent" 
  | "challenge_completed" 
  | "challenge_created" 
  | "badge_earned" 
  | "verification_status" 
  | "milestone_reached" 
  | "family_request" 
  | "premium_expiring" 
  | "system_announcement"
  | "nft_received"
  | "nft_created"
  | "nft_earned"
  | "account_deletion"
  | "data_deletion"
  | "subscription";

export type DeletionRequestType = "account" | "data";
export type DeletionRequestStatus = "pending" | "processing" | "completed" | "canceled";

export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull().$type<VerificationDocumentType>(),
  documentNumber: text("document_number").notNull(),
  documentUrl: text("document_url"),
  expirationDate: timestamp("expiration_date"),
  issuedBy: text("issued_by"),
  issuedDate: timestamp("issued_date"),
  verificationStatus: text("verification_status").notNull().$type<VerificationStatus>().default("pending"),
  verifierNotes: text("verifier_notes"),
  verifiedBy: integer("verified_by").references(() => adminUsers.id),
  verifiedAt: timestamp("verified_at"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  rejectionReason: text("rejection_reason"),
});

export const tokenRedemptions = pgTable("token_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tokensRedeemed: integer("tokens_redeemed").notNull(),
  cashAmount: numeric("cash_amount").notNull(),
  status: text("status").notNull().$type<RedemptionStatus>(),
  redemptionType: text("redemption_type").notNull().$type<RedemptionType>(),
  recipientInfo: text("recipient_info"), // PayPal email, donation organization, or user ID for transfers
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

export const familyRelationships = pgTable("family_relationships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  relatedUserId: integer("related_user_id").notNull().references(() => users.id),
  relationshipType: text("relationship_type").notNull().$type<FamilyRelationshipType>(),
  status: text("status").default("pending").notNull().$type<FamilyRelationshipStatus>(),
  canViewMood: boolean("can_view_mood").default(false),
  canViewJournal: boolean("can_view_journal").default(false),
  canReceiveAlerts: boolean("can_receive_alerts").default(false),
  canTransferTokens: boolean("can_transfer_tokens").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  notes: text("notes"),
});

export const tokenTransfers = pgTable("token_transfers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull().$type<TokenTransferType>().default("general"),
  status: text("status").notNull().$type<TokenTransferStatus>().default("completed"),
  timestamp: timestamp("timestamp").defaultNow(),
  notes: text("notes"),
});

export const premiumPlans = pgTable("premium_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planType: text("plan_type").notNull().$type<PremiumPlanType>(),
  startDate: timestamp("start_date").defaultNow(),
  paymentAmount: numeric("payment_amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  memberLimit: integer("member_limit").default(5),
  isLifetime: boolean("is_lifetime").default(false),
  nextBillingDate: timestamp("next_billing_date"),
  status: text("status").default("active").notNull(),
  paymentMethod: text("payment_method").$type<PaymentProvider>(),
  paymentDetails: text("payment_details"),
  isTrial: boolean("is_trial").default(false),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  // Stripe-specific fields
  stripePriceId: text("stripe_price_id"), // ID of the Stripe price object
  stripeSubscriptionId: text("stripe_subscription_id"), // ID of the Stripe subscription
  stripeSubscriptionStatus: text("stripe_subscription_status").$type<StripeSubscriptionStatus>(), // Status of the subscription in Stripe
  stripePeriodEnd: timestamp("stripe_period_end"), // End of the current billing period
  stripeCanceledAt: timestamp("stripe_canceled_at"), // When the subscription was canceled (if applicable)
  stripeMetadata: text("stripe_metadata"), // JSON string containing additional metadata
});

export const userChallengeCompletions = pgTable("user_challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  completedAt: timestamp("completed_at").defaultNow(),
  creatorRewarded: boolean("creator_rewarded").default(false),
  userRewarded: boolean("user_rewarded").default(false),
  notes: text("notes"),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: integer("referrer_user_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  referralEmail: text("referral_email"),
  referredUserId: integer("referred_user_id").references(() => users.id),
  status: text("status").default("pending").notNull().$type<ReferralStatus>(),
  createdAt: timestamp("created_at").defaultNow(),
  registeredAt: timestamp("registered_at"),
  convertedAt: timestamp("converted_at"),
  expiresAt: timestamp("expires_at"),
  tokenReward: integer("token_reward").default(50),
  premiumDaysReward: integer("premium_days_reward").default(0),
  notes: text("notes"),
});

// NFT-related tables
export const nftCollections = pgTable("nft_collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isPremiumOnly: boolean("is_premium_only").default(true),
  tokenRequirement: integer("token_requirement"),
  totalSupply: integer("total_supply").notNull(),
  category: text("category").$type<NftCategory>().notNull(),
});

export const nftItems = pgTable("nft_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => nftCollections.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rarity: text("rarity").$type<NftRarity>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  tokenPrice: integer("token_price"), // Cost in emotion tokens
  totalMinted: integer("total_minted").default(0),
  maxSupply: integer("max_supply"),
  attributes: json("attributes"),
  animationUrl: text("animation_url"),
  externalUrl: text("external_url"),
});

export const userNfts = pgTable("user_nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  nftItemId: integer("nft_item_id").notNull().references(() => nftItems.id),
  acquiredAt: timestamp("acquired_at").defaultNow(),
  tokensPaid: integer("tokens_paid"),
  serialNumber: integer("serial_number").notNull(), // For limited edition NFTs
  isDisplayed: boolean("is_displayed").default(false),
  transferrable: boolean("transferrable").default(true),
  lastTransferredAt: timestamp("last_transferred_at"),
  transactionHash: text("transaction_hash"), // For blockchain integration in the future
});

export const nftTransfers = pgTable("nft_transfers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  nftId: integer("nft_id").notNull().references(() => userNfts.id),
  transferredAt: timestamp("transferred_at").defaultNow(),
  tokensInvolved: integer("tokens_involved").default(0),
  notes: text("notes"),
});

export const emotionalNfts = pgTable("emotional_nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tokenId: text("token_id").notNull().unique(),
  metadata: text("metadata").notNull(), // JSON string containing NFT metadata
  emotion: text("emotion").$type<EmotionType>().notNull(),
  rarity: text("rarity").$type<NftRarity>().notNull(),
  activityType: text("activity_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url").notNull(),
  isDisplayed: boolean("is_displayed").default(false),
  evolutionLevel: integer("evolution_level").default(1),
  lastEvolvedAt: timestamp("last_evolved_at"),
  bonusGranted: text("bonus_granted"), // Bonus effect description (if any)
  expiresAt: timestamp("expires_at"), // For time-limited NFTs
  mintStatus: text("mint_status").default("unminted"), // unminted, minted, burned
  mintedAt: timestamp("minted_at"),
  tokensCost: integer("tokens_cost").default(350), // Default cost is 350 tokens
  burnedAt: timestamp("burned_at"),
});

// Token Pool System
export const tokenPool = pgTable("token_pool", {
  id: serial("id").primaryKey(),
  totalTokens: integer("total_tokens").default(0).notNull(),
  targetTokens: integer("target_tokens").default(1000000).notNull(), // Default target of 1,000,000 tokens
  distributionRound: integer("distribution_round").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastDistributionAt: timestamp("last_distribution_at"),
  nextDistributionDate: timestamp("next_distribution_date"),
  status: text("status").default("active").notNull(), // active, distributing, paused
  charityPercentage: integer("charity_percentage").default(15).notNull(), // Percentage allocated to charity
  topContributorsPercentage: integer("top_contributors_percentage").default(85).notNull(), // Percentage to top contributors
  maxTopContributors: integer("max_top_contributors").default(50).notNull(), // Number of top contributors who get rewards
});

export const poolContributions = pgTable("pool_contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  nftId: integer("nft_id").notNull().references(() => emotionalNfts.id),
  tokenAmount: integer("token_amount").notNull(), // Typically 350 tokens per NFT
  contributionDate: timestamp("contribution_date").defaultNow(),
  poolRound: integer("pool_round").notNull(), // Which distribution round this belongs to
  transactionType: text("transaction_type").default("burn").notNull(), // burn, charity, system
  notes: text("notes"),
});

export const poolDistributions = pgTable("pool_distributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  poolRound: integer("pool_round").notNull(),
  distributionDate: timestamp("distribution_date").defaultNow(),
  tokenAmount: integer("token_amount").notNull(),
  rank: integer("rank"), // User's rank in that distribution round
  isCharity: boolean("is_charity").default(false), // Whether this distribution is to charity
  charityName: text("charity_name"), 
  transactionId: text("transaction_id"), // For tracking the transfer
  status: text("status").default("completed").notNull(), // pending, completed, failed
});

export const moodGames = pgTable("mood_games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull().$type<GameCategory>(),
  difficulty: text("difficulty").notNull().$type<GameDifficulty>(),
  tokenReward: integer("token_reward").default(2),
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  helpsMood: text("helps_mood").$type<EmotionType[]>().array(),
  isActive: boolean("is_active").default(true),
  playCount: integer("play_count").default(0),
  averageRating: numeric("average_rating"),
  bgMusicUrl: text("bg_music_url"),
  isPremiumOnly: boolean("is_premium_only").default(true),
});

export const userGamePlays = pgTable("user_game_plays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => moodGames.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  moodBefore: text("mood_before").$type<EmotionType>(),
  moodAfter: text("mood_after").$type<EmotionType>(),
  userRating: integer("user_rating"),
  feedbackNote: text("feedback_note"),
  tokensEarned: integer("tokens_earned"),
});

export const customMoodTags = pgTable("custom_mood_tags", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tagName: text("tag_name").notNull(),
  tagDescription: text("tag_description"),
  baseEmotion: text("base_emotion").$type<EmotionType>(),
  color: text("color").default("#6366f1"),
  icon: text("icon").default("😊"),
  createdAt: timestamp("created_at").defaultNow(),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
});

export const userMoodTrends = pgTable("user_mood_trends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  predominantMood: text("predominant_mood").$type<EmotionType>(),
  activityType: text("activity_type").$type<ActivityType>(),
  moodScore: integer("mood_score").notNull(), // 1-10 scale
  notes: text("notes"),
  recommendedGameCategory: text("recommended_game_category").$type<GameCategory>(),
  customMoodTagId: integer("custom_mood_tag_id").references(() => customMoodTags.id),
  weatherConditions: text("weather_conditions"),
  sleepHours: numeric("sleep_hours"),
  physicalActivity: text("physical_activity"),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  startTime: timestamp("start_time").defaultNow(),
  lastActiveTime: timestamp("last_active_time").defaultNow(),
  endTime: timestamp("end_time"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  device: text("device"),
  browser: text("browser"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  loginAt: timestamp("login_at"),
  status: text("status").$type<OnlineStatus>().default("online"),
});

export const moodMatches = pgTable("mood_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchedUserId: integer("matched_user_id").notNull().references(() => users.id),
  score: integer("score").notNull(), // 0-100 compatibility score
  userEmotion: text("user_emotion").$type<EmotionType>().notNull(),
  matchedUserEmotion: text("matched_user_emotion").$type<EmotionType>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Matches can expire after some time
  status: text("status").default("active").notNull(), // active, connected, expired, rejected
  lastInteractionAt: timestamp("last_interaction_at"),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
});

// Admin backend tables
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().$type<AdminRole>(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  permissions: json("permissions").$type<string[]>(),
  avatarUrl: text("avatar_url"),
  contactPhone: text("contact_phone"),
  department: text("department"),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().$type<TicketCategory>(),
  priority: text("priority").default("medium").notNull().$type<TicketPriority>(),
  status: text("status").default("open").notNull().$type<TicketStatus>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  assignedTo: integer("assigned_to").references(() => adminUsers.id),
  attachments: json("attachments").$type<string[]>(),
  relatedTicketId: integer("related_ticket_id").references(() => supportTickets.id),
  isSystemGenerated: boolean("is_system_generated").default(false),
  lastResponseAt: timestamp("last_response_at"),
  timeToResolve: integer("time_to_resolve"), // In hours
});

export const ticketResponses = pgTable("ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  responderId: integer("responder_id"), // Can be userId or adminId
  isAdminResponse: boolean("is_admin_response").default(false),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  attachments: json("attachments").$type<string[]>(),
  isHelpful: boolean("is_helpful"),
  isSystemGenerated: boolean("is_system_generated").default(false),
});

export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  reason: text("reason").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  transactionId: text("transaction_id"),
  paymentMethod: text("payment_method").$type<PaymentProvider>(),
  status: text("status").default("pending").notNull().$type<RefundStatus>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  processedBy: integer("processed_by").references(() => adminUsers.id),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  evidence: json("evidence").$type<string[]>(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull().$type<NotificationType>(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
  actionLink: text("action_link"),
  sourceId: integer("source_id"), // Can reference different entities based on notification type
  sourceType: text("source_type"), // The table name this notification relates to
  icon: text("icon"), // Icon name for the notification
  isPushSent: boolean("is_push_sent").default(false),
  isEmailSent: boolean("is_email_sent").default(false),
});

export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  actionType: text("action_type").notNull().$type<AdminActionType>(),
  targetId: integer("target_id"), // Could be userId, ticketId, etc.
  targetType: text("target_type").notNull(), // "user", "ticket", "refund", etc.
  actionDetails: json("action_details"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").default("completed"),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  adminId: integer("admin_id").references(() => adminUsers.id),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  services: json("services").$type<{name: string, price: number}[]>(),
  totalAmount: numeric("total_amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected, expired
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  notes: text("notes"),
  terms: text("terms"),
});

export const videoPosts = pgTable("video_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  originalVideoUrl: text("original_video_url"), // For storing the original video before edits
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // In seconds
  category: text("category").$type<VideoCategory>().notNull(),
  tags: text("tags"), // comma-separated tags
  isPublic: boolean("is_public").default(true),
  allowComments: boolean("allow_comments").default(true),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  downloadCount: integer("download_count").default(0),
  shareCount: integer("share_count").default(0),
  followCount: integer("follow_count").default(0),
  isLiveStream: boolean("is_live_stream").default(false),
  streamKey: text("stream_key"), // For live streaming
  streamStatus: text("stream_status"), // active, ended, scheduled
  scheduledStart: timestamp("scheduled_start"), // For scheduled streams
  resolution: text("resolution"), // e.g., "1920x1080"
  hasAiEnhancement: boolean("has_ai_enhancement").default(false),
  aiEnhancementDetails: text("ai_enhancement_details"), // JSON string of applied AI enhancements
  editorVersion: text("editor_version"), // To keep track of which editor version was used
  editHistory: text("edit_history"), // JSON string of edit history
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  status: text("status").default("active").notNull(), // active, pending, removed, processing
});

// Social media features for videos
export const videoLikes = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoComments = pgTable("video_comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  parentCommentId: integer("parent_comment_id").references(() => videoComments.id), // For nested comments
  content: text("content").notNull(),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isEdited: boolean("is_edited").default(false),
  isHidden: boolean("is_hidden").default(false),
});

export const videoFollows = pgTable("video_follows", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoSaves = pgTable("video_saves", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoDownloads = pgTable("video_downloads", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: text("ip_address"),
});

// User following/follower system
export const userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followedId: integer("followed_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});



export const insertUserSchema = createInsertSchema(users).pick({
  firstName: true,
  middleName: true,
  lastName: true,
  username: true,
  email: true,
  password: true,
  gender: true,
  state: true,
  country: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  userId: true,
  sessionToken: true,
  ipAddress: true,
  userAgent: true,
  device: true,
  browser: true,
  location: true,
  startTime: true,
  lastActiveTime: true,
  status: true,
});

export const insertEmotionSchema = createInsertSchema(emotions).pick({
  emotion: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  emotion: true,
  note: true,
});

export const insertRewardActivitySchema = createInsertSchema(rewardActivities).pick({
  userId: true,
  activityType: true,
  tokensEarned: true,
  description: true,
});

// NFT-related schemas
export const insertNftCollectionSchema = createInsertSchema(nftCollections).pick({
  name: true,
  description: true,
  coverImage: true,
  createdBy: true, 
  isActive: true,
  isPremiumOnly: true,
  tokenRequirement: true,
  totalSupply: true,
  category: true,
});

export const insertNftItemSchema = createInsertSchema(nftItems).pick({
  collectionId: true,
  name: true,
  description: true,
  imageUrl: true,
  rarity: true,
  createdBy: true,
  tokenPrice: true,
  maxSupply: true,
  attributes: true,
  animationUrl: true,
  externalUrl: true,
});

export const insertUserNftSchema = createInsertSchema(userNfts).pick({
  userId: true,
  nftItemId: true,
  tokensPaid: true,
  serialNumber: true,
  isDisplayed: true,
  transferrable: true,
  transactionHash: true,
});

export const insertNftTransferSchema = createInsertSchema(nftTransfers).pick({
  fromUserId: true,
  toUserId: true,
  nftId: true,
  tokensInvolved: true,
  notes: true,
});

export const insertEmotionalNftSchema = createInsertSchema(emotionalNfts).pick({
  userId: true, 
  tokenId: true,
  metadata: true,
  emotion: true, 
  rarity: true,
  activityType: true,
  imageUrl: true,
  isDisplayed: true,
  evolutionLevel: true,
  bonusGranted: true,
  expiresAt: true,
  mintStatus: true,
  tokensCost: true,
});

// Token Pool System schemas
export const insertTokenPoolSchema = createInsertSchema(tokenPool).pick({
  totalTokens: true,
  targetTokens: true,
  distributionRound: true,
  status: true,
  charityPercentage: true,
  topContributorsPercentage: true,
  maxTopContributors: true,
});

export const insertPoolContributionSchema = createInsertSchema(poolContributions).pick({
  userId: true,
  nftId: true,
  tokenAmount: true,
  poolRound: true,
  transactionType: true,
  notes: true,
});

export const insertPoolDistributionSchema = createInsertSchema(poolDistributions).pick({
  userId: true,
  poolRound: true,
  tokenAmount: true,
  rank: true,
  isCharity: true,
  charityName: true,
  transactionId: true,
  status: true,
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  iconUrl: true,
  category: true,
  tier: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  category: true,
  difficulty: true,
  tokenReward: true,
  targetValue: true,
  iconUrl: true,
  isUserCreated: true,
  isPublic: true,
  tags: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  profilePicture: true,
  paypalEmail: true,
  stripeAccountId: true,
  preferredPaymentMethod: true,
  preferredCurrency: true,
  isPremium: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  content: true,
  actionLink: true,
  sourceId: true,
  sourceType: true,
  icon: true,
  expiresAt: true,
});

export const insertTokenRedemptionSchema = createInsertSchema(tokenRedemptions).pick({
  tokensRedeemed: true,
  cashAmount: true,
  redemptionType: true,
  recipientInfo: true,
  currency: true,
  notes: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).pick({
  name: true,
  description: true,
  emotion: true,
  isPrivate: true,
  maxParticipants: true,
  themeColor: true,
});

export const insertBlockedUserSchema = createInsertSchema(blockedUsers).pick({
  blockedUserId: true,
  reason: true,
});

export const insertChatRoomParticipantSchema = createInsertSchema(chatRoomParticipants).pick({
  chatRoomId: true,
  userId: true,
  isAdmin: true,
});

export const insertFamilyRelationshipSchema = createInsertSchema(familyRelationships).pick({
  userId: true,
  relatedUserId: true,
  relationshipType: true,
  status: true,
  canViewMood: true,
  canViewJournal: true,
  canReceiveAlerts: true,
  canTransferTokens: true,
  notes: true,
});

export const insertTokenTransferSchema = createInsertSchema(tokenTransfers).pick({
  fromUserId: true,
  toUserId: true,
  amount: true,
  type: true,
  status: true,
  notes: true,
});

export const insertPremiumPlanSchema = createInsertSchema(premiumPlans).pick({
  userId: true,
  planType: true,
  paymentAmount: true,
  currency: true,
  memberLimit: true,
  isLifetime: true,
  nextBillingDate: true,
  status: true,
  paymentMethod: true,
  paymentDetails: true,
  isTrial: true,
  trialStartDate: true,
  trialEndDate: true,
});

export const insertUserChallengeCompletionSchema = createInsertSchema(userChallengeCompletions).pick({
  userId: true,
  challengeId: true,
  notes: true,
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerUserId: true,
  referralCode: true,
  referralEmail: true,
  referredUserId: true,
  tokenReward: true,
  premiumDaysReward: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;
export type Emotion = typeof emotions.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertRewardActivity = z.infer<typeof insertRewardActivitySchema>;
export type RewardActivity = typeof rewardActivities.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertTokenRedemption = z.infer<typeof insertTokenRedemptionSchema>;
export type TokenRedemption = typeof tokenRedemptions.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertChatRoomParticipant = z.infer<typeof insertChatRoomParticipantSchema>;
export type ChatRoomParticipant = typeof chatRoomParticipants.$inferSelect;
export type InsertFamilyRelationship = z.infer<typeof insertFamilyRelationshipSchema>;
export type FamilyRelationship = typeof familyRelationships.$inferSelect;
export type InsertPremiumPlan = z.infer<typeof insertPremiumPlanSchema>;
export type PremiumPlan = typeof premiumPlans.$inferSelect;
export type InsertUserChallengeCompletion = z.infer<typeof insertUserChallengeCompletionSchema>;
export type UserChallengeCompletion = typeof userChallengeCompletions.$inferSelect;
// Add insert schemas for admin-related tables
export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  permissions: true,
  avatarUrl: true,
  contactPhone: true,
  department: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  subject: true,
  description: true,
  category: true,
  priority: true,
  attachments: true,
  relatedTicketId: true,
});

export const insertTicketResponseSchema = createInsertSchema(ticketResponses).pick({
  ticketId: true,
  responderId: true,
  isAdminResponse: true,
  content: true,
  attachments: true,
  isHelpful: true,
});

export const insertRefundRequestSchema = createInsertSchema(refundRequests).pick({
  userId: true,
  ticketId: true,
  reason: true,
  amount: true,
  currency: true,
  transactionId: true,
  paymentMethod: true,
  notes: true,
  evidence: true,
});

export const insertAdminActionSchema = createInsertSchema(adminActions).pick({
  adminId: true,
  actionType: true,
  targetId: true,
  targetType: true,
  actionDetails: true,
  reason: true,
  ipAddress: true,
  userAgent: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  userId: true,
  adminId: true,
  ticketId: true,
  title: true,
  description: true,
  services: true,
  totalAmount: true,
  currency: true,
  validUntil: true,
  notes: true,
  terms: true,
});

export const insertVideoPostSchema = createInsertSchema(videoPosts).pick({
  userId: true,
  title: true,
  description: true,
  videoUrl: true,
  originalVideoUrl: true,
  thumbnailUrl: true,
  duration: true,
  category: true,
  tags: true,
  isPublic: true,
  allowComments: true,
  isLiveStream: true,
  streamKey: true,
  streamStatus: true,
  scheduledStart: true,
  resolution: true,
  hasAiEnhancement: true,
  aiEnhancementDetails: true,
  editorVersion: true,
  editHistory: true,
});

// Social media interaction schemas
export const insertVideoLikeSchema = createInsertSchema(videoLikes).pick({
  videoId: true,
  userId: true,
});

export const insertVideoCommentSchema = createInsertSchema(videoComments).pick({
  videoId: true,
  userId: true,
  parentCommentId: true,
  content: true,
});

// Deletion requests table
export const deletionRequests = pgTable("deletion_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull().$type<DeletionRequestType>(),
  requestedAt: timestamp("requested_at").defaultNow(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  processedAt: timestamp("processed_at"),
  status: text("status").notNull().$type<DeletionRequestStatus>(),
  processorId: integer("processor_id").references(() => adminUsers.id),
  userEmail: text("user_email"),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  notes: text("notes"),
});

export const insertDeletionRequestSchema = createInsertSchema(deletionRequests).pick({
  userId: true,
  type: true,
  scheduledAt: true,
  status: true,
  userEmail: true,
  notificationSent: true,
  notes: true,
});

export const insertVideoFollowSchema = createInsertSchema(videoFollows).pick({
  videoId: true,
  userId: true,
});

export const insertVideoSaveSchema = createInsertSchema(videoSaves).pick({
  videoId: true,
  userId: true,
});

export const insertVideoDownloadSchema = createInsertSchema(videoDownloads).pick({
  videoId: true,
  userId: true,
  ipAddress: true,
});

// Export schema for user follows
export const insertUserFollowSchema = createInsertSchema(userFollows).pick({
  followerId: true,
  followedId: true,
});



export const insertMoodMatchSchema = createInsertSchema(moodMatches).pick({
  userId: true,
  matchedUserId: true,
  score: true,
  userEmotion: true,
  matchedUserEmotion: true,
  expiresAt: true,
  status: true,
});

// Export types for deletion requests
export type InsertDeletionRequest = z.infer<typeof insertDeletionRequestSchema>;
export type DeletionRequest = typeof deletionRequests.$inferSelect;

// Export types for admin-related tables
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertTicketResponse = z.infer<typeof insertTicketResponseSchema>;
export type TicketResponse = typeof ticketResponses.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;
export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertTokenTransfer = z.infer<typeof insertTokenTransferSchema>;
export type TokenTransfer = typeof tokenTransfers.$inferSelect;
export type InsertVideoPost = z.infer<typeof insertVideoPostSchema>;
export type VideoPost = typeof videoPosts.$inferSelect;

// Social media interaction types
export type InsertVideoLike = z.infer<typeof insertVideoLikeSchema>;
export type VideoLike = typeof videoLikes.$inferSelect;
export type InsertVideoComment = z.infer<typeof insertVideoCommentSchema>;
export type VideoComment = typeof videoComments.$inferSelect;
export type InsertVideoFollow = z.infer<typeof insertVideoFollowSchema>;
export type VideoFollow = typeof videoFollows.$inferSelect;
export type InsertVideoSave = z.infer<typeof insertVideoSaveSchema>;
export type VideoSave = typeof videoSaves.$inferSelect;
export type InsertVideoDownload = z.infer<typeof insertVideoDownloadSchema>;
export type VideoDownload = typeof videoDownloads.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

// NFT-related types
export type InsertNftCollection = z.infer<typeof insertNftCollectionSchema>;
export type NftCollection = typeof nftCollections.$inferSelect;
export type InsertNftItem = z.infer<typeof insertNftItemSchema>;
export type NftItem = typeof nftItems.$inferSelect;
export type InsertUserNft = z.infer<typeof insertUserNftSchema>;
export type UserNft = typeof userNfts.$inferSelect;
export type InsertNftTransfer = z.infer<typeof insertNftTransferSchema>;
export type InsertEmotionalNft = z.infer<typeof insertEmotionalNftSchema>;
export type EmotionalNft = typeof emotionalNfts.$inferSelect;

// Token Pool System types
export type InsertTokenPool = z.infer<typeof insertTokenPoolSchema>;
export type TokenPool = typeof tokenPool.$inferSelect;
export type InsertPoolContribution = z.infer<typeof insertPoolContributionSchema>;
export type PoolContribution = typeof poolContributions.$inferSelect;
export type InsertPoolDistribution = z.infer<typeof insertPoolDistributionSchema>;
export type PoolDistribution = typeof poolDistributions.$inferSelect;
export type NftTransfer = typeof nftTransfers.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertMoodMatch = z.infer<typeof insertMoodMatchSchema>;
export type MoodMatch = typeof moodMatches.$inferSelect;

// Social sharing types
export type SocialPlatform = "twitter" | "facebook" | "linkedin" | "whatsapp" | "telegram" | "email" | "pinterest" | "reddit" | "copy_link";

export const milestoneShares = pgTable("milestone_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  milestone: integer("milestone").notNull(),
  platform: text("platform").notNull().$type<SocialPlatform>(),
  shareUrl: text("share_url").notNull(),
  shareMessage: text("share_message"),
  tokensAwarded: integer("tokens_awarded").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  shareDate: timestamp("share_date").defaultNow(),
  ipAddress: text("ip_address"),
  trackingId: text("tracking_id").notNull(),
});

// Advertisement-related schemas and types
export type AdvertisementType = "health_service" | "wellness_program" | "mental_health" | "nutrition" | "fitness" | "other";
export type AdvertisementStatus = "pending_payment" | "published" | "expired" | "rejected";

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull().$type<AdvertisementType>(),
  price: numeric("price"),
  priceUnit: text("price_unit").default("per session"), // per session, per hour, per month, etc.
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  imageUrl: text("image_url"),
  status: text("status").notNull().$type<AdvertisementStatus>().default("pending_payment"),
  paymentStatus: boolean("payment_status").default(false),
  paymentMethod: text("payment_method").$type<PaymentProvider>(),
  paymentTransactionId: text("payment_transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at"),
  availableDays: json("available_days").$type<string[]>(),
  availableHours: text("available_hours"),
  qualifications: text("qualifications"),
  website: text("website"),
  viewCount: integer("view_count").default(0),
  bookingCount: integer("booking_count").default(0),
});

export const advertisementBookings = pgTable("advertisement_bookings", {
  id: serial("id").primaryKey(),
  advertisementId: integer("advertisement_id").notNull().references(() => advertisements.id),
  userId: integer("user_id").notNull().references(() => users.id),
  requestedService: text("requested_service").notNull(),
  requestedDate: timestamp("requested_date").notNull(),
  requestedTime: text("requested_time").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, canceled, completed
  userName: text("user_name").notNull(),
  userAge: integer("user_age"),
  userGender: text("user_gender").$type<GenderType>(),
  userPhone: text("user_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  locationSent: boolean("location_sent").default(false),
  locationDetails: text("location_details"),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements, {
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description cannot exceed 1000 characters"),
  serviceType: z.enum(["health_service", "wellness_program", "mental_health", "nutrition", "fitness", "other"] as const),
  price: z.string().optional().transform(val => val ? parseFloat(val) : null),
  priceUnit: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address").optional(),
  contactPhone: z.string().optional(),
  qualifications: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  availableHours: z.string().optional(),
});

export const insertAdvertisementBookingSchema = createInsertSchema(advertisementBookings, {
  requestedService: z.string().min(5, "Please specify the service you're requesting"),
  requestedDate: z.date(),
  requestedTime: z.string(),
  userName: z.string().min(3, "Name must be at least 3 characters"),
  userAge: z.number().min(18, "You must be at least 18 years old").optional(),
  userGender: z.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"] as const).optional(),
  userPhone: z.string().optional(),
  notes: z.string().optional(),
});

// Friend Book Feature Tables
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  friendId: integer("friend_id").notNull().references(() => users.id),
  status: text("status").notNull().$type<FriendshipStatus>().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  notes: text("notes"),
});

export const userMessages = pgTable("user_messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  messageType: text("message_type").notNull().$type<MessageType>().default("text"),
  content: text("content").notNull(),
  mediaUrl: text("media_url"), // for voice, image, video messages
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
});

export const userPosts = pgTable("user_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  mediaType: text("media_type").$type<MessageType>(), // image, video
  mediaUrl: text("media_url"),
  visibility: text("visibility").notNull().$type<ContentVisibility>().default("friends"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
});

export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => userPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reactionType: text("reaction_type").notNull(), // like, love, haha, wow, sad, angry
  createdAt: timestamp("created_at").defaultNow(),
});

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => userPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  likeCount: integer("like_count").default(0),
});

// Export already defined elsewhere

export const userVideoCalls = pgTable("user_video_calls", {
  id: serial("id").primaryKey(),
  callerId: integer("caller_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  status: text("status").notNull(), // initiated, ongoing, completed, missed, rejected
  hasVideo: boolean("has_video").default(true),
});

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  friendRequests: boolean("friend_requests").default(true),
  messages: boolean("messages").default(true),
  tokenTransfers: boolean("token_transfers").default(true),
  postComments: boolean("post_comments").default(true),
  postReactions: boolean("post_reactions").default(true),
  videoCalls: boolean("video_calls").default(true),
  systemAnnouncements: boolean("system_announcements").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
});

export const charityOrganizations = pgTable("charity_organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  logoUrl: text("logo_url"),
  category: text("category").notNull(), // health, education, poverty, environment, etc.
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gofundmeCampaigns = pgTable("gofundme_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").default("0"),
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull(), // active, paused, completed, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  imageUrl: text("image_url"),
  supportingDocuments: text("supporting_documents"), // JSON string of document URLs
  createdAt: timestamp("created_at").defaultNow(),
  isVerified: boolean("is_verified").default(false),
  donorCount: integer("donor_count").default(0),
});

export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  category: text("category").notNull(), // feature_request, bug_report, general_feedback, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("pending").notNull(), // pending, reviewed, implemented, rejected
  adminResponse: text("admin_response"),
  isAnonymous: boolean("is_anonymous").default(false),
});

export const emotionalImprints = pgTable("emotional_imprints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emotion: text("emotion").notNull().$type<EmotionType>(),
  title: text("title").notNull(),
  description: text("description"),
  colorProfile: text("color_profile").notNull().$type<ImpressionColor>(),
  soundProfile: text("sound_profile").notNull().$type<ImpressionSound>(),
  vibrationProfile: text("vibration_profile").notNull().$type<ImpressionVibration>(),
  intensity: integer("intensity").notNull().default(5), // 1-10 scale
  duration: integer("duration").notNull().default(30), // in seconds
  isTemplate: boolean("is_template").default(false),
  templateName: text("template_name"),
  createdAt: timestamp("created_at").defaultNow(),
  accessibilitySettings: json("accessibility_settings"),
  isPublic: boolean("is_public").default(false),
  aiGenerated: boolean("ai_generated").default(false),
  customization: json("customization"),
});

export const emotionalImprintInteractions = pgTable("emotional_imprint_interactions", {
  id: serial("id").primaryKey(),
  imprintId: integer("imprint_id").notNull().references(() => emotionalImprints.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id), 
  viewedAt: timestamp("viewed_at"),
  reaction: text("reaction"), // like, empathize, relate, confused, etc.
  reactionStrength: integer("reaction_strength"), // 1-5 scale
  feedbackNote: text("feedback_note"),
  createdAt: timestamp("created_at").defaultNow(),
  senderNote: text("sender_note"), // Optional note from sender
  isAnonymous: boolean("is_anonymous").default(true),
});

// Create insert schemas for the new tables
export const insertFriendshipSchema = createInsertSchema(friendships, {
  userId: z.number().int().positive(),
  friendId: z.number().int().positive(),
  status: z.enum(["pending", "accepted", "rejected"]),
});

export const insertUserMessageSchema = createInsertSchema(userMessages, {
  fromUserId: z.number().int().positive(),
  toUserId: z.number().int().positive(),
  messageType: z.enum(["text", "emoji", "voice", "image", "video"]),
  content: z.string(),
  mediaUrl: z.string().optional(),
});

export const insertUserPostSchema = createInsertSchema(userPosts, {
  userId: z.number().int().positive(),
  content: z.string().optional(),
  mediaType: z.enum(["text", "emoji", "voice", "image", "video"]).optional(),
  mediaUrl: z.string().optional(),
  visibility: z.enum(["public", "friends", "private"]),
});

export const insertGofundmeCampaignSchema = createInsertSchema(gofundmeCampaigns, {
  userId: z.number().int().positive(),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  targetAmount: z.string().transform(val => parseFloat(val)),
  currency: z.string().default("USD"),
  status: z.enum(["active", "paused", "completed", "cancelled"]),
  endDate: z.date().optional(),
  imageUrl: z.string().optional(),
  supportingDocuments: z.string().optional(),
});

export const insertFeedbackSubmissionSchema = createInsertSchema(feedbackSubmissions, {
  userId: z.number().int().positive().optional(),
  category: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  isAnonymous: z.boolean().default(false),
});

export const insertEmotionalImprintSchema = createInsertSchema(emotionalImprints, {
  userId: z.number().int().positive(),
  emotion: z.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title cannot exceed 50 characters"),
  description: z.string().optional(),
  colorProfile: z.enum(["amber", "blue", "green", "purple", "red", "teal", "pink", "orange", "indigo", "gray"]),
  soundProfile: z.enum(["ocean", "rainfall", "forest", "vinyl", "cityscape", "heartbeat", "wind", "thunder", "birds", "silence"]),
  vibrationProfile: z.enum(["gentle", "pulsing", "intense", "rhythmic", "wave", "escalating", "staccato", "continuous", "none"]),
  intensity: z.number().int().min(1).max(10).default(5),
  duration: z.number().int().min(10).max(120).default(30),
  isTemplate: z.boolean().default(false),
  templateName: z.string().optional(),
  isPublic: z.boolean().default(false),
  aiGenerated: z.boolean().default(false),
  accessibilitySettings: z.any().optional(),
  customization: z.any().optional(),
});

export const insertEmotionalImprintInteractionSchema = createInsertSchema(emotionalImprintInteractions, {
  imprintId: z.number().int().positive(),
  receiverId: z.number().int().positive(),
  reaction: z.string().optional(),
  reactionStrength: z.number().int().min(1).max(5).optional(),
  feedbackNote: z.string().optional(),
  senderNote: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

// Export already defined elsewhere

export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;
export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserPost = z.infer<typeof insertUserPostSchema>;
export type UserPost = typeof userPosts.$inferSelect;
export type InsertGofundmeCampaign = z.infer<typeof insertGofundmeCampaignSchema>;
export type GofundmeCampaign = typeof gofundmeCampaigns.$inferSelect;
export type InsertFeedbackSubmission = z.infer<typeof insertFeedbackSubmissionSchema>;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type InsertEmotionalImprint = z.infer<typeof insertEmotionalImprintSchema>;
export type EmotionalImprint = typeof emotionalImprints.$inferSelect;
export type InsertEmotionalImprintInteraction = z.infer<typeof insertEmotionalImprintInteractionSchema>;
export type EmotionalImprintInteraction = typeof emotionalImprintInteractions.$inferSelect;

export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisementBooking = z.infer<typeof insertAdvertisementBookingSchema>;
export type AdvertisementBooking = typeof advertisementBookings.$inferSelect;
export type InsertMilestoneShare = z.infer<typeof insertMilestoneShareSchema>;
export type MilestoneShare = typeof milestoneShares.$inferSelect;

export const insertMilestoneShareSchema = createInsertSchema(milestoneShares, {
  userId: z.number().int().positive(),
  milestone: z.number().int().positive(),
  platform: z.enum(["twitter", "facebook", "linkedin", "whatsapp", "telegram", "email", "pinterest", "reddit", "copy_link"] as const),
  shareUrl: z.string().url(),
  shareMessage: z.string().optional(),
  ipAddress: z.string().optional(),
  trackingId: z.string().uuid(),
});

// User Subscription table
// Use existing customMoodTags declaration

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tier: text("tier").notNull().$type<SubscriptionTier>().default("free"),
  isActive: boolean("is_active").default(false),
  startDate: timestamp("start_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  renewsAt: timestamp("renews_at"),
  cancelledAt: timestamp("cancelled_at"),
  hadTrialBefore: boolean("had_trial_before").default(false),
  paymentMethod: text("payment_method"),
  lastPaymentDate: timestamp("last_payment_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create the insert schema for subscriptions
export const insertSubscriptionSchema = createInsertSchema(subscriptions, {
  userId: z.number().int().positive(),
  tier: z.enum(["free", "trial", "premium", "family", "lifetime"]),
  isActive: z.boolean().default(false),
  expiryDate: z.date().optional().nullable(),
  renewsAt: z.date().optional().nullable(),
  hadTrialBefore: z.boolean().default(false),
  paymentMethod: z.string().optional().nullable(),
});

// Type definitions for subscriptions
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Custom mood tags schema
export const insertCustomMoodTagSchema = createInsertSchema(customMoodTags, {
  userId: z.number().int().positive(),
  tagName: z.string().min(2).max(30),
  tagDescription: z.string().max(200).optional(),
  baseEmotion: z.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default("#6366f1"),
  icon: z.string().default("😊"),
  isActive: z.boolean().default(true),
});

export type InsertCustomMoodTag = z.infer<typeof insertCustomMoodTagSchema>;
export type CustomMoodTag = typeof customMoodTags.$inferSelect;

// Weekly mood report type
export interface WeeklyMoodReport {
  userId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  predominantMoods: Record<string, number>; // Emotion -> percentage
  dailyMoods: Record<string, EmotionType | null>; // day -> emotion
  moodTrends: {
    improvement: boolean;
    percentageChange: number;
    previousWeekAverage: number;
    currentWeekAverage: number;
  };
  insightsSummary: string[];
  correlationInsights: {
    weather: Record<string, EmotionType[]> | null;
    sleepHours: Record<string, number> | null; // hours -> average mood score
    physicalActivity: Record<string, number> | null; // activity -> average mood score
  };
  recommendedActions: string[];
  generatedAt: Date;
}

// SEO configuration schema
export const seoConfigurations = pgTable("seo_configurations", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: json("keywords").$type<string[]>().default([]),
  ogImage: text("og_image"),
  noindex: boolean("noindex").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastModifiedBy: integer("last_modified_by").references(() => adminUsers.id),
});

export const insertSeoConfigurationSchema = createInsertSchema(seoConfigurations, {
  pageKey: z.string().min(2).max(100),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(500),
  keywords: z.array(z.string()).optional().default([]),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
  lastModifiedBy: z.number().int().positive().optional(),
});

export type InsertSeoConfiguration = z.infer<typeof insertSeoConfigurationSchema>;
export type SeoConfiguration = typeof seoConfigurations.$inferSelect;

// Emotional Intelligence Quiz
export const emotionalIntelligenceResults = pgTable("emotional_intelligence_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalScore: integer("total_score").notNull(),
  categoryScores: json("category_scores").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmotionalIntelligenceResultSchema = createInsertSchema(emotionalIntelligenceResults, {
  userId: z.number().int().positive(),
  totalScore: z.number().int().min(0).max(60),
  categoryScores: z.string().min(2), // JSON stringified object
  completedAt: z.date(),
});

export type InsertEmotionalIntelligenceResult = z.infer<typeof insertEmotionalIntelligenceResultSchema>;
export type EmotionalIntelligenceResult = typeof emotionalIntelligenceResults.$inferSelect;
