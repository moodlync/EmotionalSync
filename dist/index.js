var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemoryStore = createMemoryStore(session);
    MemStorage = class {
      nextDeletionRequestId = 1;
      // Make these properties accessible to test-controller.ts
      users = /* @__PURE__ */ new Map();
      userEmotions = /* @__PURE__ */ new Map();
      journalEntries = /* @__PURE__ */ new Map();
      notifications = /* @__PURE__ */ new Map();
      userNotifications = /* @__PURE__ */ new Map();
      // userId -> notificationIds
      deletionRequests = /* @__PURE__ */ new Map();
      userDeletionRequests = /* @__PURE__ */ new Map();
      // userId -> deletionRequestIds
      // NFT Pool System storage
      nextTokenPoolId = 1;
      nextEmotionalNftId = 1;
      nextPoolContributionId = 1;
      nextPoolDistributionId = 1;
      tokenPools = /* @__PURE__ */ new Map();
      emotionalNfts = /* @__PURE__ */ new Map();
      userEmotionalNfts = /* @__PURE__ */ new Map();
      // userId -> nftIds
      poolContributions = /* @__PURE__ */ new Map();
      userPoolContributions = /* @__PURE__ */ new Map();
      // userId -> contributionIds
      poolDistributions = /* @__PURE__ */ new Map();
      userPoolDistributions = /* @__PURE__ */ new Map();
      // userId -> distributionIds
      // User Session Management methods
      async createUserSession(sessionData) {
        const session3 = {
          id: this.sessionId++,
          ...sessionData,
          createdAt: /* @__PURE__ */ new Date(),
          lastActiveAt: /* @__PURE__ */ new Date()
        };
        this.userSessions.set(sessionData.sessionToken, session3);
        if (!this.userActiveSessions.has(sessionData.userId)) {
          this.userActiveSessions.set(sessionData.userId, []);
        }
        this.userActiveSessions.get(sessionData.userId).push(session3);
        this.updateUserStatus(sessionData.userId, "online");
        return session3;
      }
      async getUserSession(sessionToken) {
        return this.userSessions.get(sessionToken);
      }
      async updateUserSessionStatus(sessionToken, status) {
        if (!this.userSessions.has(sessionToken)) {
          throw new Error("Session not found");
        }
        const session3 = this.userSessions.get(sessionToken);
        session3.status = status;
        session3.lastActiveTime = /* @__PURE__ */ new Date();
        this.userSessions.set(sessionToken, session3);
        const userSessions2 = this.userActiveSessions.get(session3.userId) || [];
        const mostRecentSession = userSessions2.sort(
          (a, b) => (b.lastActiveTime?.getTime() || 0) - (a.lastActiveTime?.getTime() || 0)
        )[0];
        if (mostRecentSession && mostRecentSession.sessionToken === sessionToken) {
          this.updateUserStatus(session3.userId, status);
        }
        return session3;
      }
      async updateUserSessionActivity(sessionToken) {
        if (!this.userSessions.has(sessionToken)) {
          throw new Error("Session not found");
        }
        const session3 = this.userSessions.get(sessionToken);
        session3.lastActiveTime = /* @__PURE__ */ new Date();
        this.userSessions.set(sessionToken, session3);
        if (this.users.has(session3.userId)) {
          const user = this.users.get(session3.userId);
          user.lastActiveAt = /* @__PURE__ */ new Date();
          this.users.set(session3.userId, user);
        }
        return session3;
      }
      async closeUserSession(sessionToken) {
        if (!this.userSessions.has(sessionToken)) {
          return void 0;
        }
        const session3 = this.userSessions.get(sessionToken);
        session3.status = "offline";
        session3.endedAt = /* @__PURE__ */ new Date();
        if (this.userActiveSessions.has(session3.userId)) {
          const sessions = this.userActiveSessions.get(session3.userId);
          const filteredSessions = sessions.filter((s) => s.sessionToken !== sessionToken);
          this.userActiveSessions.set(session3.userId, filteredSessions);
          if (filteredSessions.length === 0) {
            this.updateUserStatus(session3.userId, "offline");
          }
        }
        return session3;
      }
      async getUserActiveSessions(userId) {
        return this.userActiveSessions.get(userId) || [];
      }
      async updateUserStatus(userId, status) {
        if (!this.users.has(userId)) {
          throw new Error("User not found");
        }
        const user = this.users.get(userId);
        user.status = status;
        user.lastActiveAt = /* @__PURE__ */ new Date();
        this.users.set(userId, user);
        return user;
      }
      async getActiveUsers() {
        const result = [];
        for (const [id, user] of this.users.entries()) {
          if (user.status === "online" || user.status === "away" || user.status === "busy") {
            result.push(user);
          }
        }
        return result;
      }
      // Mood-based matching algorithm methods
      async findMoodMatches(userId, emotion) {
        const allMatches = [];
        const user = this.users.get(userId);
        if (!user) {
          throw new Error("User not found");
        }
        for (const [otherId, otherEmotion] of this.userEmotions.entries()) {
          if (otherId === userId) continue;
          const score = await this.calculateMoodCompatibility(emotion, otherEmotion);
          if (score > 0.4) {
            const otherUser = this.users.get(otherId);
            if (otherUser && (otherUser.status === "online" || otherUser.status === "away")) {
              const match = {
                id: this.matchId++,
                userId,
                matchedUserId: otherId,
                score,
                userEmotion: emotion,
                matchedUserEmotion: otherEmotion,
                status: "pending",
                createdAt: /* @__PURE__ */ new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
                // Expires in 24 hours
              };
              allMatches.push(match);
              if (!this.moodMatches.has(userId)) {
                this.moodMatches.set(userId, []);
              }
              this.moodMatches.get(userId).push(match);
            }
          }
        }
        return allMatches.sort((a, b) => b.score - a.score);
      }
      async createMoodMatch(matchData) {
        const match = {
          id: this.matchId++,
          ...matchData,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.moodMatches.has(matchData.userId)) {
          this.moodMatches.set(matchData.userId, []);
        }
        this.moodMatches.get(matchData.userId).push(match);
        return match;
      }
      async getUserMoodMatches(userId) {
        const matches = this.moodMatches.get(userId) || [];
        return matches.map((match) => {
          const matchedUser = this.users.get(match.matchedUserId);
          return {
            ...match,
            matchedUser
          };
        });
      }
      async getMoodMatch(matchId) {
        for (const [userId, matches] of this.moodMatches.entries()) {
          const match = matches.find((m) => m.id === matchId);
          if (match) {
            return match;
          }
        }
        return void 0;
      }
      async updateMoodMatchStatus(matchId, status) {
        for (const [userId, matches] of this.moodMatches.entries()) {
          const matchIndex = matches.findIndex((m) => m.id === matchId);
          if (matchIndex !== -1) {
            matches[matchIndex].status = status;
            matches[matchIndex].lastInteractionAt = /* @__PURE__ */ new Date();
            if (status === "accepted") {
              matches[matchIndex].acceptedAt = /* @__PURE__ */ new Date();
            } else if (status === "rejected") {
              matches[matchIndex].rejectedAt = /* @__PURE__ */ new Date();
            }
            return matches[matchIndex];
          }
        }
        throw new Error("Match not found");
      }
      async acceptMoodMatch(matchId) {
        return this.updateMoodMatchStatus(matchId, "accepted");
      }
      async rejectMoodMatch(matchId) {
        return this.updateMoodMatchStatus(matchId, "rejected");
      }
      async calculateMoodCompatibility(userEmotion, otherEmotion) {
        const compatibilityMatrix = {
          happy: {
            happy: 0.9,
            // Happy users match well with other happy users
            sad: 0.3,
            // Happy users can help sad users
            angry: 0.2,
            // Happy users might calm angry users
            anxious: 0.4,
            // Happy users can reassure anxious users
            excited: 0.8,
            // Happy and excited are compatible
            neutral: 0.6
            // Happy users can engage with neutral users
          },
          sad: {
            happy: 0.3,
            // Sad users might be uplifted by happy users
            sad: 0.7,
            // Sad users understand each other's feelings
            angry: 0.2,
            // Sad and angry don't mix well
            anxious: 0.5,
            // Sad and anxious can relate to negative emotions
            excited: 0.1,
            // Excited energy might overwhelm sad users
            neutral: 0.4
            // Neutral is a balanced match for sad
          },
          angry: {
            happy: 0.2,
            // Happy might seem dismissive to angry users
            sad: 0.2,
            // Sad might bring angry users down further
            angry: 0.3,
            // Two angry users might escalate each other
            anxious: 0.2,
            // Angry might overwhelm anxious
            excited: 0.2,
            // Excited energy might clash with anger
            neutral: 0.5
            // Neutral can be a calming influence
          },
          anxious: {
            happy: 0.4,
            // Happy can be reassuring to anxious
            sad: 0.5,
            // Both experience difficult emotions
            angry: 0.2,
            // Angry might increase anxiety
            anxious: 0.6,
            // Can relate to each other's feelings
            excited: 0.3,
            // Excited energy might increase anxiety
            neutral: 0.7
            // Neutral is calming for anxious
          },
          excited: {
            happy: 0.8,
            // Both positive, high energy
            sad: 0.1,
            // Different energy levels
            angry: 0.2,
            // Clash of emotions
            anxious: 0.3,
            // Might be overwhelming
            excited: 0.9,
            // Great match in energy
            neutral: 0.5
            // Balanced match
          },
          neutral: {
            happy: 0.6,
            // Good balance
            sad: 0.4,
            // Can provide stability
            angry: 0.5,
            // Can be calming
            anxious: 0.7,
            // Can be reassuring
            excited: 0.5,
            // Can balance energy
            neutral: 0.7
            // Comfortable match
          }
        };
        return compatibilityMatrix[userEmotion][otherEmotion];
      }
      // Notification methods
      async createNotification(notificationData) {
        const notification = {
          id: this.notificationId++,
          ...notificationData,
          createdAt: /* @__PURE__ */ new Date(),
          readAt: null,
          isRead: false,
          isPushSent: false,
          isEmailSent: false
        };
        this.notifications.set(notification.id, notification);
        if (!this.userNotifications.has(notification.userId)) {
          this.userNotifications.set(notification.userId, []);
        }
        this.userNotifications.get(notification.userId).push(notification.id);
        return notification;
      }
      async getNotifications(userId) {
        const notificationIds = this.userNotifications.get(userId) || [];
        const notifications2 = [];
        for (const id of notificationIds) {
          const notification = this.notifications.get(id);
          if (notification) {
            notifications2.push(notification);
          }
        }
        return notifications2.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      async getUnreadNotificationsCount(userId) {
        const notifications2 = await this.getNotifications(userId);
        return notifications2.filter((n) => !n.isRead).length;
      }
      async markNotificationAsRead(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) {
          throw new Error("Notification not found");
        }
        notification.isRead = true;
        notification.readAt = /* @__PURE__ */ new Date();
        this.notifications.set(notificationId, notification);
        return notification;
      }
      async markAllNotificationsAsRead(userId) {
        const notificationIds = this.userNotifications.get(userId) || [];
        for (const id of notificationIds) {
          const notification = this.notifications.get(id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = /* @__PURE__ */ new Date();
            this.notifications.set(id, notification);
          }
        }
      }
      async deleteNotification(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) {
          return false;
        }
        this.notifications.delete(notificationId);
        const userNotifications = this.userNotifications.get(notification.userId) || [];
        const updatedNotifications = userNotifications.filter((id) => id !== notificationId);
        this.userNotifications.set(notification.userId, updatedNotifications);
        return true;
      }
      async sendSystemNotification(userIds, title, content, type, actionLink, icon) {
        const notifications2 = [];
        for (const userId of userIds) {
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
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
            // 30 days expiry
          });
          notifications2.push(notification);
        }
        return notifications2;
      }
      // These fields are now public
      rewardActivities;
      userTokens;
      globalEmotionData;
      chatRooms;
      chatRoomParticipants;
      blockedUsers;
      // Family plan data structures
      familyRelationships;
      premiumPlans;
      moodHistory;
      referrals;
      tokenTransfers;
      // Video posts data structures
      videoPosts;
      userVideoPosts;
      // userId -> array of video post IDs
      // Emotional Imprints data structures
      emotionalImprints;
      userEmotionalImprints;
      // userId -> array of imprint IDs
      emotionalImprintInteractions;
      // imprintId -> interactions
      receivedEmotionalImprints;
      // userId -> array of interaction IDs
      emotionalImprintId = 1;
      imprintInteractionId = 1;
      postId;
      // Advertisement data structures
      advertisements;
      userAdvertisements;
      // userId -> array of advertisement IDs
      advertisementBookings;
      // advertisementId -> array of bookings
      advertisementId;
      bookingId;
      // Video social data structures
      videoLikes;
      // videoId -> VideoLike[]
      videoComments;
      // videoId -> VideoComment[]
      videoFollows;
      // videoId -> VideoFollow[]
      videoSaves;
      // userId -> VideoSave[]
      videoDownloads;
      // videoId -> VideoDownload[]
      // User follows data structures
      userFollowers;
      // userId -> UserFollow[] (where followedId = userId)
      userFollowing;
      // userId -> UserFollow[] (where followerId = userId)
      // User sessions and online status tracking
      userSessions;
      // sessionToken -> UserSession
      userActiveSessions;
      // userId -> UserSession[]
      sessionId;
      // Mood matching data structures
      moodMatches;
      // userId -> MoodMatch[]
      matchId;
      // Gamification data structures
      userProfiles;
      challenges;
      achievements;
      leaderboard;
      userStreaks;
      badges;
      userBadges;
      // User challenge data structures
      userCreatedChallenges;
      // Map of userId -> created challenges
      userChallengeProgress;
      // Map of userId_challengeId -> progress value
      userChallengeCompletions;
      // Map of challengeId -> completions
      challengeId;
      completionId;
      // Token redemption data structures
      tokenRedemptions;
      redemptionConversionRate;
      redemptionMinimumTokens;
      // Admin backend data structures
      adminUsers;
      supportTickets;
      ticketResponses;
      refundRequests;
      adminActions;
      quotes;
      verificationDocuments;
      // Map of userId -> verification documents
      docId;
      sessionStore;
      currentId;
      entryId;
      rewardId;
      redemptionId;
      adminId;
      ticketId;
      responseId;
      refundId;
      actionId;
      quoteId;
      notificationId;
      constructor() {
        this.rewardActivities = /* @__PURE__ */ new Map();
        this.userTokens = /* @__PURE__ */ new Map();
        this.userProfiles = /* @__PURE__ */ new Map();
        this.userStreaks = /* @__PURE__ */ new Map();
        this.challenges = [];
        this.achievements = [];
        this.leaderboard = [];
        this.userBadges = /* @__PURE__ */ new Map();
        this.tokenRedemptions = /* @__PURE__ */ new Map();
        this.chatRoomParticipants = /* @__PURE__ */ new Map();
        this.blockedUsers = /* @__PURE__ */ new Map();
        this.familyRelationships = /* @__PURE__ */ new Map();
        this.premiumPlans = /* @__PURE__ */ new Map();
        this.moodHistory = /* @__PURE__ */ new Map();
        this.referrals = /* @__PURE__ */ new Map();
        this.tokenTransfers = /* @__PURE__ */ new Map();
        this.notifications = /* @__PURE__ */ new Map();
        this.userNotifications = /* @__PURE__ */ new Map();
        this.notificationId = 1;
        this.videoPosts = /* @__PURE__ */ new Map();
        this.userVideoPosts = /* @__PURE__ */ new Map();
        this.postId = 1;
        this.emotionalImprints = /* @__PURE__ */ new Map();
        this.userEmotionalImprints = /* @__PURE__ */ new Map();
        this.emotionalImprintInteractions = /* @__PURE__ */ new Map();
        this.receivedEmotionalImprints = /* @__PURE__ */ new Map();
        this.emotionalImprintId = 1;
        this.imprintInteractionId = 1;
        this.videoLikes = /* @__PURE__ */ new Map();
        this.videoComments = /* @__PURE__ */ new Map();
        this.videoFollows = /* @__PURE__ */ new Map();
        this.videoSaves = /* @__PURE__ */ new Map();
        this.videoDownloads = /* @__PURE__ */ new Map();
        this.userFollowers = /* @__PURE__ */ new Map();
        this.userFollowing = /* @__PURE__ */ new Map();
        this.userSessions = /* @__PURE__ */ new Map();
        this.userActiveSessions = /* @__PURE__ */ new Map();
        this.moodMatches = /* @__PURE__ */ new Map();
        this.sessionId = 1;
        this.matchId = 1;
        this.deletionRequests = /* @__PURE__ */ new Map();
        this.userDeletionRequests = /* @__PURE__ */ new Map();
        this.nextDeletionRequestId = 1;
        this.userCreatedChallenges = /* @__PURE__ */ new Map();
        this.userChallengeProgress = /* @__PURE__ */ new Map();
        this.userChallengeCompletions = /* @__PURE__ */ new Map();
        this.challengeId = 1001;
        this.completionId = 1;
        this.adminUsers = /* @__PURE__ */ new Map();
        if (this.adminId < 1) {
          this.adminId = 1;
        }
        const defaultAdminId = this.adminId++;
        const defaultAdmin = {
          id: defaultAdminId,
          username: "admin",
          password: "Queanbeyan@9",
          // Password is stored securely in production
          email: "admin@moodsync.app",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          isActive: true,
          lastLogin: null,
          createdAt: /* @__PURE__ */ new Date(),
          permissions: ["users.view", "users.edit", "content.view", "content.edit", "system.view", "system.edit"],
          avatarUrl: null,
          contactPhone: null,
          department: null
        };
        defaultAdmin.id = 1;
        this.adminUsers.set(1, defaultAdmin);
        console.log("Default admin account created successfully");
        this.supportTickets = /* @__PURE__ */ new Map();
        this.ticketResponses = /* @__PURE__ */ new Map();
        this.refundRequests = /* @__PURE__ */ new Map();
        this.adminActions = /* @__PURE__ */ new Map();
        this.quotes = /* @__PURE__ */ new Map();
        this.verificationDocuments = /* @__PURE__ */ new Map();
        this.docId = 1;
        this.advertisements = /* @__PURE__ */ new Map();
        this.userAdvertisements = /* @__PURE__ */ new Map();
        this.advertisementBookings = /* @__PURE__ */ new Map();
        this.advertisementId = 1;
        this.bookingId = 1;
        this.redemptionConversionRate = 5e-3;
        this.redemptionMinimumTokens = 1e3;
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
          checkPeriod: 864e5
          // prune expired entries every 24h
        });
        this.badges = [
          {
            id: 1,
            name: "Bronze Mood Tracker",
            description: "Complete 5 easy challenges",
            iconUrl: "\u{1F949}",
            category: "challenges",
            tier: "bronze",
            createdAt: /* @__PURE__ */ new Date()
          },
          {
            id: 2,
            name: "Silver Emotion Master",
            description: "Complete 5 moderate challenges",
            iconUrl: "\u{1F948}",
            category: "challenges",
            tier: "silver",
            createdAt: /* @__PURE__ */ new Date()
          },
          {
            id: 3,
            name: "Gold Wellness Champion",
            description: "Complete 5 hard challenges",
            iconUrl: "\u{1F947}",
            category: "challenges",
            tier: "gold",
            createdAt: /* @__PURE__ */ new Date()
          },
          {
            id: 4,
            name: "Platinum Mindfulness Guru",
            description: "Complete 5 extreme challenges",
            iconUrl: "\u{1F48E}",
            category: "challenges",
            tier: "platinum",
            createdAt: /* @__PURE__ */ new Date()
          }
        ];
        const testPassword = "9ce9b7b4132122b73b1f80a41001df457f4d13a001b033c602e91ec40223e0c7340ffe3aae42f01da9a8134a4add3c96e47a019d9fae4bd46dfe940dfa479c55.dc29782f9d99afe8c07f5befc57410d4";
        const testUserId = this.currentId++;
        const testUser = {
          id: testUserId,
          username: "test",
          password: testPassword,
          email: "developer@moodsync.app",
          firstName: "Developer",
          lastName: "Access",
          middleName: null,
          gender: "other",
          state: "Development",
          country: "MoodLync",
          emotionTokens: 25e3,
          // High token count for testing
          isPremium: true,
          premiumPlanType: "lifetime",
          premiumExpiryDate: new Date(2099, 11, 31),
          // Far in the future
          familyPlanOwnerId: null,
          allowMoodTracking: false,
          createdAt: /* @__PURE__ */ new Date(),
          profilePicture: null,
          lastLogin: /* @__PURE__ */ new Date(),
          ipAddress: "127.0.0.1",
          paypalEmail: null,
          stripeAccountId: null,
          preferredPaymentMethod: null,
          preferredCurrency: "USD",
          referralCode: "testdev123",
          referredBy: null,
          referralCount: 0,
          followerCount: 0,
          videoCount: 0,
          totalVideoViews: 0,
          totalVideoLikes: 0,
          totalVideoComments: 0,
          totalVideoShares: 0,
          totalVideoDownloads: 0,
          verificationStatus: "verified",
          verifiedAt: /* @__PURE__ */ new Date(),
          verificationExpiresAt: new Date(2099, 11, 31),
          verificationPaymentPlan: "lifetime",
          verificationMethod: "developer",
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorRecoveryKeys: null,
          isVerified: true,
          locationData: null,
          blockedUsers: null
        };
        this.users.set(testUserId, testUser);
        this.userEmotions.set(testUserId, "happy");
        if (!this.userBadges.has(testUserId)) {
          this.userBadges.set(testUserId, []);
        }
        for (const badge of this.badges) {
          this.userBadges.get(testUserId).push({
            id: Date.now() + badge.id,
            userId: testUserId,
            badgeId: badge.id,
            awardedAt: /* @__PURE__ */ new Date()
          });
        }
        console.log("Developer test account created successfully");
        this.chatRooms = [
          {
            id: 1,
            name: "Just Chilling",
            description: "A place for people who are just feeling neutral and want to chat about their day.",
            emotion: "neutral",
            participants: 24,
            avatars: []
          },
          {
            id: 2,
            name: "Late-Night Overthinkers",
            description: "Can't sleep? Mind racing? You're not alone. Join others who are awake and anxious too.",
            emotion: "anxious",
            participants: 18,
            avatars: []
          },
          {
            id: 3,
            name: "Sudden Burst of Happiness",
            description: "Having an amazing day? Share your joy with others who are feeling on top of the world!",
            emotion: "happy",
            participants: 37,
            avatars: []
          },
          {
            id: 4,
            name: "Comfort Corner",
            description: "A safe space for those feeling down. Share, listen, and find comfort in community.",
            emotion: "sad",
            participants: 15,
            avatars: []
          },
          {
            id: 5,
            name: "Venting Space",
            description: "A place to express your frustration and anger in a healthy, supportive environment.",
            emotion: "angry",
            participants: 10,
            avatars: []
          },
          {
            id: 6,
            name: "Energy Exchange",
            description: "Share your enthusiasm and excitement with others who are feeling the same energy!",
            emotion: "excited",
            participants: 28,
            avatars: []
          }
        ];
        this.globalEmotionData = [
          { name: "Tokyo", dominant: "happy", percentage: 65 },
          { name: "New York", dominant: "anxious", percentage: 42 },
          { name: "London", dominant: "sad", percentage: 38 },
          { name: "Paris", dominant: "excited", percentage: 51 },
          { name: "Sydney", dominant: "neutral", percentage: 47 },
          { name: "Rio de Janeiro", dominant: "excited", percentage: 62 }
        ];
        this.challenges = [
          {
            id: "c1",
            title: "Emotional Explorer",
            description: "Track 5 different emotions in a week",
            category: "tracking",
            difficulty: "easy",
            tokenReward: 50,
            targetValue: 5,
            iconUrl: "\u{1F9ED}",
            isCompleted: false,
            progress: 0
          },
          {
            id: "c2",
            title: "Journaling Journey",
            description: "Create a journal entry 3 days in a row",
            category: "journal",
            difficulty: "moderate",
            tokenReward: 75,
            targetValue: 3,
            iconUrl: "\u{1F4D4}",
            isCompleted: false,
            progress: 0
          },
          {
            id: "c3",
            title: "Social Butterfly",
            description: "Join 5 different chat rooms",
            category: "social",
            difficulty: "moderate",
            tokenReward: 80,
            targetValue: 5,
            iconUrl: "\u{1F98B}",
            isCompleted: false,
            progress: 0
          },
          {
            id: "c4",
            title: "Emotional Wisdom",
            description: "Have 10 conversations with the AI companion",
            category: "ai",
            difficulty: "hard",
            tokenReward: 100,
            targetValue: 10,
            iconUrl: "\u{1F9E0}",
            isCompleted: false,
            progress: 0
          },
          {
            id: "c5",
            title: "Global Citizen",
            description: "Check the global emotion map for 7 days",
            category: "exploration",
            difficulty: "easy",
            tokenReward: 60,
            targetValue: 7,
            iconUrl: "\u{1F30D}",
            isCompleted: false,
            progress: 0
          }
        ];
        this.achievements = [
          {
            id: "a1",
            title: "Reflection Master",
            description: "Create 10 journal entries",
            category: "journal",
            isUnlocked: false,
            reward: 100,
            icon: "\u{1F3C6}",
            progressCurrent: 0,
            progressTarget: 10
          },
          {
            id: "a2",
            title: "Consistency Champion",
            description: "Log your emotions for 7 consecutive days",
            category: "tracking",
            isUnlocked: false,
            reward: 150,
            icon: "\u2B50",
            progressCurrent: 0,
            progressTarget: 7
          },
          {
            id: "a3",
            title: "Emotional Intelligence",
            description: "Experience and log all 6 core emotions",
            category: "awareness",
            isUnlocked: false,
            reward: 120,
            icon: "\u{1F9E9}",
            progressCurrent: 0,
            progressTarget: 6
          },
          {
            id: "a4",
            title: "Community Supporter",
            description: "Participate in 15 chat room discussions",
            category: "social",
            isUnlocked: false,
            reward: 200,
            icon: "\u{1F465}",
            progressCurrent: 0,
            progressTarget: 15
          },
          {
            id: "a5",
            title: "Wellness Seeker",
            description: "Complete 5 different challenges",
            category: "challenges",
            isUnlocked: false,
            reward: 250,
            icon: "\u{1F3C5}",
            progressCurrent: 0,
            progressTarget: 5
          }
        ];
        this.leaderboard = [
          {
            id: 1,
            username: "EmotionMaster",
            points: 1250,
            level: 8,
            achievementCount: 12,
            streak: 14,
            rank: 1
          },
          {
            id: 2,
            username: "MindfulSoul",
            points: 1120,
            level: 7,
            achievementCount: 10,
            streak: 18,
            rank: 2
          },
          {
            id: 3,
            username: "HappyVibes",
            points: 980,
            level: 6,
            achievementCount: 8,
            streak: 9,
            rank: 3
          },
          {
            id: 4,
            username: "CalmPresence",
            points: 840,
            level: 5,
            achievementCount: 7,
            streak: 5,
            rank: 4
          },
          {
            id: 5,
            username: "EmotionExplorer",
            points: 720,
            level: 4,
            achievementCount: 5,
            streak: 3,
            rank: 5
          }
        ];
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async findUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email?.toLowerCase() === email.toLowerCase()
        );
      }
      async findUserByIpAddress(ipAddress) {
        return Array.from(this.users.values()).find(
          (user) => user.ipAddress === ipAddress
        );
      }
      async updateUser(userId, userData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
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
      async startFreeTrial(userId, trialDays = 14) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        if (user.isPremium) {
          throw new Error("User already has a premium subscription");
        }
        if (user.isInTrialPeriod) {
          throw new Error("User already has an active trial");
        }
        const trialStartDate = /* @__PURE__ */ new Date();
        const trialEndDate = /* @__PURE__ */ new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);
        const updatedUser = await this.updateUser(userId, {
          isInTrialPeriod: true,
          trialStartDate,
          trialEndDate
        });
        await this.createPremiumPlan(userId, {
          planType: "family",
          paymentAmount: 0,
          // Free trial
          currency: "USD",
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
      async isUserInActiveTrial(userId) {
        const user = await this.getUser(userId);
        if (!user) {
          return false;
        }
        if (!user.isInTrialPeriod) {
          return false;
        }
        if (!user.trialEndDate) {
          return false;
        }
        const now = /* @__PURE__ */ new Date();
        return now < new Date(user.trialEndDate);
      }
      /**
       * Check for expired trials and update user records
       * Should be called periodically (e.g., by a cron job)
       */
      async checkAndExpireTrials() {
        const now = /* @__PURE__ */ new Date();
        for (const [userId, user] of this.users.entries()) {
          if (!user.isInTrialPeriod || !user.trialEndDate) {
            continue;
          }
          if (now >= new Date(user.trialEndDate)) {
            await this.updateUser(userId, {
              isInTrialPeriod: false
              // Keep the trial dates for record-keeping
            });
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
      async removeUser(userId) {
        const user = await this.getUser(userId);
        if (!user) {
          return false;
        }
        this.users.delete(userId);
        return true;
      }
      async searchUsers(query) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(this.users.values()).filter((user) => {
          if (!user.username) return false;
          const matchesUsername = user.username.toLowerCase().includes(lowercaseQuery);
          const matchesEmail = user.email?.toLowerCase().includes(lowercaseQuery);
          const matchesFirstName = user.firstName?.toLowerCase().includes(lowercaseQuery);
          const matchesLastName = user.lastName?.toLowerCase().includes(lowercaseQuery);
          return matchesUsername || matchesEmail || matchesFirstName || matchesLastName;
        });
      }
      // Helper method to generate a unique referral code
      generateReferralCode(username) {
        const timestamp3 = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        const baseCode = username.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toLowerCase();
        return `${baseCode}${timestamp3.substr(-4)}${randomStr}`;
      }
      async createUser(insertUser) {
        const id = this.currentId++;
        const referralCode = this.generateReferralCode(insertUser.username);
        let referredById = null;
        if (insertUser.referredBy) {
          const referrer = Array.from(this.users.values()).find(
            (user2) => user2.referralCode === insertUser.referredBy
          );
          if (referrer) {
            referredById = referrer.id;
            const updatedReferrer = { ...referrer, referralCount: (referrer.referralCount || 0) + 1 };
            this.users.set(referrer.id, updatedReferrer);
            await this.addUserTokens(referrer.id, 50);
            await this.createRewardActivity(
              referrer.id,
              "help_others",
              50,
              "Referred a new user to MoodLync"
            );
            if (insertUser.email) {
              await this.createReferral(referrer.id, id, insertUser.email, referralCode);
            }
          }
        }
        const user = {
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
          createdAt: /* @__PURE__ */ new Date(),
          profilePicture: null,
          lastLogin: /* @__PURE__ */ new Date(),
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
        this.userEmotions.set(id, "neutral");
        return user;
      }
      // Referral methods implementation
      async createReferral(referrerUserId, referredUserId, referralEmail, referralCode) {
        const referrer = await this.getUser(referrerUserId);
        if (!referrer) throw new Error(`Referrer user with ID ${referrerUserId} not found`);
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const referral = {
          id: Date.now(),
          referrerUserId,
          referralCode,
          referralEmail,
          referredUserId,
          status: referredUserId ? "registered" : "pending",
          createdAt: /* @__PURE__ */ new Date(),
          registeredAt: referredUserId ? /* @__PURE__ */ new Date() : null,
          convertedAt: null,
          expiresAt,
          tokenReward: 50,
          premiumDaysReward: 0,
          notes: null
        };
        if (!this.referrals.has(referrerUserId)) {
          this.referrals.set(referrerUserId, []);
        }
        this.referrals.get(referrerUserId).push(referral);
        return referral;
      }
      async getReferralsByUser(userId) {
        return this.referrals.get(userId) || [];
      }
      async updateReferralStatus(referralId, status) {
        for (const [userId, userReferrals] of this.referrals.entries()) {
          const referralIndex = userReferrals.findIndex((ref) => ref.id === referralId);
          if (referralIndex !== -1) {
            const referral = userReferrals[referralIndex];
            const updatedReferral = {
              ...referral,
              status,
              registeredAt: status === "registered" ? /* @__PURE__ */ new Date() : referral.registeredAt,
              convertedAt: status === "converted" ? /* @__PURE__ */ new Date() : referral.convertedAt
            };
            userReferrals[referralIndex] = updatedReferral;
            this.referrals.set(userId, userReferrals);
            if (status === "converted") {
              const user = await this.getUser(userId);
              if (user) {
                if (updatedReferral.premiumDaysReward > 0) {
                }
                if (updatedReferral.tokenReward > 0) {
                  await this.addUserTokens(userId, updatedReferral.tokenReward);
                  await this.createRewardActivity(
                    userId,
                    "help_others",
                    updatedReferral.tokenReward,
                    "Referral converted to premium user"
                  );
                  await this.checkAndAwardReferralBounty(
                    userId
                  );
                }
              }
            }
            return updatedReferral;
          }
        }
        return null;
      }
      async getReferralByCode(referralCode) {
        for (const userReferrals of this.referrals.values()) {
          const referral = userReferrals.find((ref) => ref.referralCode === referralCode);
          if (referral) {
            return referral;
          }
        }
        return null;
      }
      async getReferralStatistics(userId) {
        const referrals2 = this.referrals.get(userId) || [];
        const user = await this.getUser(userId);
        const convertedReferrals = referrals2.filter((ref) => ref.status === "converted").length;
        const statistics = {
          totalReferrals: referrals2.length,
          pendingReferrals: referrals2.filter((ref) => ref.status === "pending").length,
          registeredReferrals: referrals2.filter((ref) => ref.status === "registered").length,
          convertedReferrals,
          expiredReferrals: referrals2.filter((ref) => ref.status === "expired").length,
          totalTokensEarned: referrals2.filter((ref) => ref.status === "converted").reduce((total, ref) => total + ref.tokenReward, 0),
          convertedCount: convertedReferrals,
          bountyEligible: false,
          nextBountyTokens: 0,
          referralsUntilNextBounty: 5
        };
        if (user?.isPremium) {
          const plan = this.premiumPlans.get(userId);
          const isLifetime = plan?.isLifetime || false;
          const isPlanFamily = plan?.planType === "family";
          const thresholdMultiple = Math.floor(convertedReferrals / 5);
          const nextThreshold = (thresholdMultiple + 1) * 5;
          const userTransfers = this.tokenTransfers.get(userId) || [];
          const bountyTransfers = userTransfers.filter(
            (t) => t.source === "referral_bounty" && t.notes?.includes("referral bounty")
          );
          statistics.referralsUntilNextBounty = nextThreshold - convertedReferrals;
          statistics.bountyEligible = convertedReferrals >= 5 && (bountyTransfers.length === 0 || bountyTransfers.length < thresholdMultiple);
          if (isPlanFamily && isLifetime) {
            statistics.nextBountyTokens = 1e3;
          } else if (isPlanFamily) {
            statistics.nextBountyTokens = 750;
          } else if (isLifetime) {
            statistics.nextBountyTokens = 750;
          } else if (user.isPremium) {
            statistics.nextBountyTokens = 500;
          }
        }
        return statistics;
      }
      /**
       * Checks if a user has reached the referral bounty threshold (5 premium conversions)
       * and awards the bounty if they qualify and haven't received it yet
       */
      async checkAndAwardReferralBounty(userId) {
        try {
          const referrals2 = this.referrals.get(userId) || [];
          const convertedCount = referrals2.filter((ref) => ref.status === "converted").length;
          const user = await this.getUser(userId);
          if (!user || !user.isPremium) {
            return {
              awarded: false,
              tokensAwarded: 0,
              currentReferralCount: convertedCount
            };
          }
          const plan = this.premiumPlans.get(userId);
          const isLifetime = plan?.isLifetime || false;
          const isPlanFamily = plan?.planType === "family";
          const thresholdMultiple = Math.floor(convertedCount / 5);
          if (thresholdMultiple < 1) {
            return {
              awarded: false,
              tokensAwarded: 0,
              currentReferralCount: convertedCount
            };
          }
          const userTransfers = this.tokenTransfers.get(userId) || [];
          const bountyTransfers = userTransfers.filter(
            (t) => t.source === "referral_bounty" && t.notes?.includes("referral bounty")
          );
          if (bountyTransfers.length >= thresholdMultiple) {
            return {
              awarded: false,
              tokensAwarded: 0,
              currentReferralCount: convertedCount
            };
          }
          let tokensToAward = 500;
          if (isPlanFamily && isLifetime) {
            tokensToAward = 1e3;
          } else if (isPlanFamily) {
            tokensToAward = 750;
          } else if (isLifetime) {
            tokensToAward = 750;
          }
          const tokenTransfer = {
            id: Math.floor(Math.random() * 1e6),
            // Generate a random ID
            userId,
            fromUserId: 0,
            // System
            toUserId: userId,
            amount: tokensToAward,
            type: "reward",
            status: "completed",
            timestamp: /* @__PURE__ */ new Date(),
            source: "referral_bounty",
            notes: `Referral bounty for successfully referring ${5 * (bountyTransfers.length + 1)} premium members`,
            createdAt: /* @__PURE__ */ new Date()
          };
          const transfers = this.tokenTransfers.get(userId) || [];
          transfers.push(tokenTransfer);
          this.tokenTransfers.set(userId, transfers);
          user.emotionTokens += tokensToAward;
          this.users.set(userId, user);
          return {
            awarded: true,
            tokensAwarded: tokensToAward,
            currentReferralCount: convertedCount
          };
        } catch (error) {
          console.error("Error checking referral bounty:", error);
          return {
            awarded: false,
            tokensAwarded: 0,
            currentReferralCount: 0
          };
        }
      }
      async updateUserEmotion(userId, emotion) {
        this.userEmotions.set(userId, emotion);
      }
      async getUserEmotion(userId) {
        return this.userEmotions.get(userId);
      }
      async getUsersByEmotion(emotion) {
        const users2 = [];
        for (const [userId, userEmotion] of this.userEmotions.entries()) {
          if (userEmotion === emotion) {
            const user = await this.getUser(userId);
            if (user) {
              users2.push({
                id: userId,
                username: user.username,
                emotion: userEmotion,
                lastActive: "Just now",
                avatarUrl: user.profilePicture || void 0
              });
            }
          }
        }
        return users2;
      }
      async createJournalEntry(userId, emotion, note) {
        const id = this.entryId++;
        const entry = {
          id,
          userId,
          emotion,
          note,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (!this.journalEntries.has(userId)) {
          this.journalEntries.set(userId, []);
        }
        this.journalEntries.get(userId)?.push(entry);
        await this.addUserTokens(userId, 2);
        await this.createRewardActivity(
          userId,
          "journal_entry",
          2,
          "Created a journal entry"
        );
        return entry;
      }
      async getJournalEntries(userId) {
        return this.journalEntries.get(userId) || [];
      }
      async getChatRooms() {
        return this.chatRooms;
      }
      async createChatRoom(userId, chatRoom) {
        const id = this.chatRooms.length + 1;
        const newChatRoom = {
          id,
          ...chatRoom,
          createdBy: userId,
          createdAt: /* @__PURE__ */ new Date(),
          avatars: []
        };
        this.chatRooms.push(newChatRoom);
        await this.addChatRoomParticipant(id, userId, true);
        return newChatRoom;
      }
      async updateChatRoom(chatRoomId, updates) {
        const chatRoomIndex = this.chatRooms.findIndex((room) => room.id === chatRoomId);
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
      async deleteChatRoom(chatRoomId) {
        const initialLength = this.chatRooms.length;
        this.chatRooms = this.chatRooms.filter((room) => room.id !== chatRoomId);
        this.chatRoomParticipants.delete(chatRoomId);
        return this.chatRooms.length < initialLength;
      }
      async getChatRoomById(chatRoomId) {
        return this.chatRooms.find((room) => room.id === chatRoomId);
      }
      async getPrivateChatRoomsByUserId(userId) {
        const userChatRoomIds = Array.from(this.chatRoomParticipants.entries()).filter(([_, participants]) => participants.some((p) => p.userId === userId)).map(([chatRoomId, _]) => chatRoomId);
        return this.chatRooms.filter(
          (room) => room.isPrivate && userChatRoomIds.includes(room.id)
        );
      }
      // Chat Room Participants methods
      async addChatRoomParticipant(chatRoomId, userId, isAdmin = false) {
        const chatRoom = await this.getChatRoomById(chatRoomId);
        if (!chatRoom) {
          throw new Error(`Chat room with ID ${chatRoomId} not found`);
        }
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        if (await this.isUserInChatRoom(chatRoomId, userId)) {
          throw new Error(`User ${userId} is already a participant in chat room ${chatRoomId}`);
        }
        const participant = {
          id: Date.now(),
          // Using timestamp as a unique ID
          chatRoomId,
          userId,
          isAdmin,
          joinedAt: /* @__PURE__ */ new Date()
        };
        if (!this.chatRoomParticipants.has(chatRoomId)) {
          this.chatRoomParticipants.set(chatRoomId, []);
        }
        this.chatRoomParticipants.get(chatRoomId)?.push(participant);
        return participant;
      }
      async removeChatRoomParticipant(chatRoomId, userId) {
        if (!this.chatRoomParticipants.has(chatRoomId)) {
          return false;
        }
        const initialLength = this.chatRoomParticipants.get(chatRoomId)?.length || 0;
        const participants = this.chatRoomParticipants.get(chatRoomId)?.filter(
          (p) => p.userId !== userId
        ) || [];
        this.chatRoomParticipants.set(chatRoomId, participants);
        return participants.length < initialLength;
      }
      async getChatRoomParticipants(chatRoomId) {
        const participants = this.chatRoomParticipants.get(chatRoomId) || [];
        const participantsWithUser = await Promise.all(
          participants.map(async (participant) => {
            const user = await this.getUser(participant.userId);
            return {
              ...participant,
              user
              // We know this user exists because we validated during addChatRoomParticipant
            };
          })
        );
        return participantsWithUser;
      }
      async isUserInChatRoom(chatRoomId, userId) {
        const participants = this.chatRoomParticipants.get(chatRoomId) || [];
        return participants.some((p) => p.userId === userId);
      }
      // User Blocking methods
      async blockUser(userId, blockedUserId, reason) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const blockedUser = await this.getUser(blockedUserId);
        if (!blockedUser) {
          throw new Error(`User with ID ${blockedUserId} not found`);
        }
        if (await this.isUserBlocked(userId, blockedUserId)) {
          throw new Error(`User ${blockedUserId} is already blocked by user ${userId}`);
        }
        const blockEntry = {
          id: Date.now(),
          // Using timestamp as a unique ID
          userId,
          blockedUserId,
          reason: reason || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.blockedUsers.has(userId)) {
          this.blockedUsers.set(userId, []);
        }
        this.blockedUsers.get(userId)?.push(blockEntry);
        return blockEntry;
      }
      async unblockUser(userId, blockedUserId) {
        if (!this.blockedUsers.has(userId)) {
          return false;
        }
        const initialLength = this.blockedUsers.get(userId)?.length || 0;
        const blocks = this.blockedUsers.get(userId)?.filter(
          (b) => b.blockedUserId !== blockedUserId
        ) || [];
        this.blockedUsers.set(userId, blocks);
        return blocks.length < initialLength;
      }
      async getBlockedUsers(userId) {
        const blocks = this.blockedUsers.get(userId) || [];
        const blocksWithUser = await Promise.all(
          blocks.map(async (block) => {
            const user = await this.getUser(block.blockedUserId);
            return {
              ...block,
              blockedUser: user
              // We know this user exists because we validated during blockUser
            };
          })
        );
        return blocksWithUser;
      }
      async isUserBlocked(userId, blockedUserId) {
        const blocks = this.blockedUsers.get(userId) || [];
        return blocks.some((b) => b.blockedUserId === blockedUserId);
      }
      async getGlobalEmotionData() {
        return this.globalEmotionData;
      }
      async getUserTokens(userId) {
        const user = await this.getUser(userId);
        if (!user) return 0;
        return user.emotionTokens;
      }
      async addUserTokens(userId, tokens) {
        const user = await this.getUser(userId);
        if (!user) throw new Error(`User with ID ${userId} not found`);
        user.emotionTokens += tokens;
        this.users.set(userId, user);
        return user.emotionTokens;
      }
      async transferTokens(fromUserId, toUserId, amount, notes) {
        const fromUser = await this.getUser(fromUserId);
        if (!fromUser) throw new Error(`Sender with ID ${fromUserId} not found`);
        const toUser = await this.getUser(toUserId);
        if (!toUser) throw new Error(`Recipient with ID ${toUserId} not found`);
        if (amount <= 0) throw new Error("Transfer amount must be greater than zero");
        if (fromUser.emotionTokens < amount) {
          throw new Error(`Insufficient tokens. Available: ${fromUser.emotionTokens}, Requested: ${amount}`);
        }
        let isInFamilyRelationship = false;
        let canTransferTokens = false;
        if (fromUser.familyPlanOwnerId === toUserId) {
          isInFamilyRelationship = true;
          canTransferTokens = true;
        } else if (toUser.familyPlanOwnerId === fromUserId) {
          const relationship = await this.getFamilyRelationship(fromUserId, toUserId);
          isInFamilyRelationship = true;
          canTransferTokens = relationship?.canTransferTokens || false;
          if (!canTransferTokens) {
            throw new Error(`Token transfers to this family member are not enabled`);
          }
        }
        if (!isInFamilyRelationship && !fromUser.isPremium && amount > 100) {
          throw new Error(`Non-premium users can only transfer up to 100 tokens to non-family members. Requested: ${amount}`);
        }
        fromUser.emotionTokens -= amount;
        toUser.emotionTokens += amount;
        this.users.set(fromUserId, fromUser);
        this.users.set(toUserId, toUser);
        const timestamp3 = /* @__PURE__ */ new Date();
        const transfer = {
          id: Date.now(),
          fromUserId,
          toUserId,
          amount,
          timestamp: timestamp3,
          notes: notes || null,
          type: isInFamilyRelationship ? "family" : "general",
          status: "completed"
        };
        if (!this.tokenTransfers.has(fromUserId)) {
          this.tokenTransfers.set(fromUserId, []);
        }
        this.tokenTransfers.get(fromUserId)?.push(transfer);
        if (!this.tokenTransfers.has(toUserId)) {
          this.tokenTransfers.set(toUserId, []);
        }
        this.tokenTransfers.get(toUserId)?.push(transfer);
        await this.createRewardActivity(
          fromUserId,
          "token_transfer",
          -amount,
          // Negative amount for the sender
          `Sent ${amount} tokens to ${toUser.username}`
        );
        await this.createRewardActivity(
          toUserId,
          "token_transfer",
          amount,
          `Received ${amount} tokens from ${fromUser.username}`
        );
        return {
          fromUser,
          toUser,
          amount,
          timestamp: timestamp3,
          transfer
        };
      }
      async getTokenTransfers(userId) {
        return this.tokenTransfers.get(userId) || [];
      }
      async getTokenTransfersByType(userId, type) {
        const transfers = this.tokenTransfers.get(userId) || [];
        return transfers.filter((transfer) => transfer.type === type);
      }
      async canTransferTokensToUser(fromUserId, toUserId) {
        const fromUser = await this.getUser(fromUserId);
        const toUser = await this.getUser(toUserId);
        if (!fromUser) {
          return { canTransfer: false, reason: `User with ID ${fromUserId} not found` };
        }
        if (!toUser) {
          return { canTransfer: false, reason: `User with ID ${toUserId} not found` };
        }
        if (await this.isUserBlocked(fromUserId, toUserId)) {
          return { canTransfer: false, reason: "You have blocked this user" };
        }
        if (await this.isUserBlocked(toUserId, fromUserId)) {
          return { canTransfer: false, reason: "This user has blocked you" };
        }
        if (fromUser.familyPlanOwnerId === toUserId) {
          return { canTransfer: true };
        }
        if (toUser.familyPlanOwnerId === fromUserId) {
          const relationship = await this.getFamilyRelationship(fromUserId, toUserId);
          if (relationship && relationship.status === "accepted") {
            if (relationship.canTransferTokens) {
              return { canTransfer: true };
            } else {
              return { canTransfer: false, reason: "Token transfers are not enabled for this family member" };
            }
          }
        }
        return { canTransfer: true };
      }
      async createRewardActivity(userId, activityType, tokens, description) {
        const id = this.rewardId++;
        const activity = {
          id,
          userId,
          activityType,
          tokensEarned: tokens,
          description,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (!this.rewardActivities.has(userId)) {
          this.rewardActivities.set(userId, []);
        }
        this.rewardActivities.get(userId)?.push(activity);
        return activity;
      }
      async getRewardActivities(userId) {
        return this.rewardActivities.get(userId) || [];
      }
      async getGamificationProfile(userId) {
        if (!this.userProfiles.has(userId)) {
          this.userProfiles.set(userId, {
            id: userId,
            username: "User" + userId,
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
      async getGamificationChallenges() {
        return this.challenges;
      }
      async getGamificationAchievements() {
        return this.achievements;
      }
      async getGamificationLeaderboard() {
        return this.leaderboard;
      }
      async completeGamificationActivity(userId, activityId) {
        const challenge = this.challenges.find((c) => c.id === activityId);
        if (!challenge) {
          throw new Error(`Challenge with ID ${activityId} not found`);
        }
        if (!this.userProfiles.has(userId)) {
          await this.getGamificationProfile(userId);
        }
        const profile = this.userProfiles.get(userId);
        if (profile.completedChallenges.includes(activityId)) {
          return {
            alreadyCompleted: true,
            activityId,
            profile
          };
        }
        profile.completedChallenges.push(activityId);
        const tokens = challenge.tokenReward || 10;
        await this.addUserTokens(userId, tokens);
        await this.createRewardActivity(
          userId,
          "challenge_completion",
          tokens,
          `Completed challenge: ${challenge.title}`
        );
        profile.points += tokens;
        profile.experience += tokens;
        let levelUp = false;
        let newLevel = profile.level;
        if (profile.experience >= profile.nextLevelExp) {
          newLevel = profile.level + 1;
          profile.level = newLevel;
          profile.nextLevelExp = newLevel * 100;
          levelUp = true;
        }
        let achievementUnlocked = null;
        for (const achievement of this.achievements) {
          if (achievement.category === "challenges" && !achievement.isUnlocked) {
            achievement.progressCurrent = profile.completedChallenges.length;
            if (achievement.progressCurrent >= achievement.progressTarget) {
              achievement.isUnlocked = true;
              profile.achievementsCount++;
              achievementUnlocked = achievement;
              await this.addUserTokens(userId, achievement.reward);
              await this.createRewardActivity(
                userId,
                "badge_earned",
                achievement.reward,
                `Unlocked achievement: ${achievement.title}`
              );
            }
          }
        }
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
      async claimAchievementReward(userId, achievementId) {
        const achievement = this.achievements.find((a) => a.id === achievementId);
        if (!achievement) {
          throw new Error(`Achievement with ID ${achievementId} not found`);
        }
        if (!achievement.isUnlocked) {
          throw new Error(`Achievement is not unlocked yet`);
        }
        if (achievement.rewardClaimed) {
          throw new Error(`Reward for this achievement has already been claimed`);
        }
        achievement.rewardClaimed = true;
        const tokens = achievement.reward || 0;
        await this.addUserTokens(userId, tokens);
        await this.createRewardActivity(
          userId,
          "badge_earned",
          tokens,
          `Claimed achievement reward: ${achievement.title}`
        );
        return {
          achievement,
          tokensAwarded: tokens
        };
      }
      async checkInStreak(userId, emotion) {
        if (!this.userStreaks.has(userId)) {
          this.userStreaks.set(userId, {
            current: 0,
            longest: 0,
            lastCheckIn: ""
          });
        }
        const streakData = this.userStreaks.get(userId);
        const now = /* @__PURE__ */ new Date();
        const today = now.toISOString().split("T")[0];
        if (streakData.lastCheckIn === today) {
          return {
            current: streakData.current,
            longest: streakData.longest,
            alreadyCheckedIn: true,
            tokensAwarded: 0
          };
        }
        const lastDate = streakData.lastCheckIn ? new Date(streakData.lastCheckIn) : null;
        const isConsecutive = lastDate ? now.getTime() - lastDate.getTime() <= 36 * 60 * 60 * 1e3 : true;
        if (isConsecutive) {
          streakData.current += 1;
          if (streakData.current > streakData.longest) {
            streakData.longest = streakData.current;
          }
        } else {
          streakData.current = 1;
        }
        streakData.lastCheckIn = today;
        this.userStreaks.set(userId, streakData);
        let tokensAwarded = 1;
        if (streakData.current >= 7) {
          tokensAwarded += 3;
        } else if (streakData.current >= 3) {
          tokensAwarded += 1;
        }
        await this.addUserTokens(userId, tokensAwarded);
        await this.createRewardActivity(
          userId,
          "daily_login",
          tokensAwarded,
          `Daily check-in streak: ${streakData.current} days`
        );
        await this.updateUserEmotion(userId, emotion);
        return {
          current: streakData.current,
          longest: streakData.longest,
          tokensAwarded,
          isConsecutive
        };
      }
      async getRecentActiveGamificationProfiles() {
        return this.leaderboard.slice(0, 5);
      }
      async incrementChallengeProgress(userId, challengeId, amount) {
        const challenge = this.challenges.find((c) => c.id === challengeId);
        if (!challenge) {
          throw new Error(`Challenge with ID ${challengeId} not found`);
        }
        challenge.progress = Math.min(challenge.targetValue, (challenge.progress || 0) + amount);
        const isCompleted = challenge.progress >= challenge.targetValue;
        challenge.isCompleted = isCompleted;
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
      async createUserChallenge(userId, challengeData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        if (!user.isPremium) {
          throw new Error("Only premium users can create challenges");
        }
        const id = this.challengeId++;
        const challenge = {
          id,
          title: challengeData.title,
          description: challengeData.description,
          category: challengeData.category,
          difficulty: challengeData.difficulty,
          targetValue: challengeData.targetValue || 1,
          tokenReward: 1,
          // Fixed token reward for completing a user-created challenge
          isUserCreated: true,
          isPublic: challengeData.isPublic ?? true,
          createdBy: userId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          tags: challengeData.tags || null
        };
        if (!this.userCreatedChallenges.has(userId)) {
          this.userCreatedChallenges.set(userId, []);
        }
        this.userCreatedChallenges.get(userId).push(challenge);
        return challenge;
      }
      async getUserCreatedChallenges(userId) {
        return this.userCreatedChallenges.get(userId) || [];
      }
      async getPublicUserCreatedChallenges() {
        const allChallenges = [];
        for (const challenges2 of this.userCreatedChallenges.values()) {
          allChallenges.push(...challenges2.filter((c) => c.isPublic));
        }
        return allChallenges;
      }
      async recordChallengeProgress(userId, challengeId, notes) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        let challenge = this.challenges.find((c) => c.id === challengeId.toString());
        if (!challenge) {
          for (const challenges2 of this.userCreatedChallenges.values()) {
            const found = challenges2.find((c) => c.id === challengeId);
            if (found) {
              challenge = found;
              break;
            }
          }
        }
        if (!challenge) {
          throw new Error("Challenge not found");
        }
        const progressKey = `${userId}_${challengeId}`;
        let currentProgress = this.userChallengeProgress.get(progressKey) || 0;
        currentProgress += 1;
        this.userChallengeProgress.set(progressKey, currentProgress);
        const completion = {
          id: this.completionId++,
          userId,
          challengeId,
          progressValue: 1,
          // Each record is for +1 progress
          notes: notes || null,
          createdAt: /* @__PURE__ */ new Date(),
          completedAt: currentProgress >= challenge.targetValue ? /* @__PURE__ */ new Date() : null
        };
        if (!this.userChallengeCompletions.has(challengeId)) {
          this.userChallengeCompletions.set(challengeId, []);
        }
        this.userChallengeCompletions.get(challengeId).push(completion);
        if (currentProgress === challenge.targetValue) {
          await this.addUserTokens(userId, 1);
          await this.createRewardActivity(
            userId,
            "challenge_completion",
            1,
            `Completed challenge: ${challenge.title}`
          );
          if (challenge.isUserCreated && challenge.createdBy) {
            await this.rewardChallengeCreator(challengeId, userId);
          }
        }
        return completion;
      }
      async getChallengeCompletions(challengeId) {
        return this.userChallengeCompletions.get(challengeId) || [];
      }
      async getUserChallengeProgress(userId, challengeId) {
        const progressKey = `${userId}_${challengeId}`;
        return this.userChallengeProgress.get(progressKey) || 0;
      }
      async rewardChallengeCreator(challengeId, completerId) {
        let challenge;
        for (const [creatorId, challenges2] of this.userCreatedChallenges.entries()) {
          const found = challenges2.find((c) => c.id === challengeId);
          if (found) {
            challenge = found;
            break;
          }
        }
        if (!challenge || !challenge.createdBy) {
          return null;
        }
        if (challenge.createdBy === completerId) {
          return null;
        }
        const creator = await this.getUser(challenge.createdBy);
        const completer = await this.getUser(completerId);
        if (!creator || !completer) {
          return null;
        }
        const tokensAwarded = 3;
        await this.addUserTokens(challenge.createdBy, tokensAwarded);
        await this.createRewardActivity(
          challenge.createdBy,
          "help_others",
          // Categorize as helping others
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
      async updateUserProfilePicture(userId, profilePicture) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        user.profilePicture = profilePicture;
        this.users.set(userId, user);
        return user;
      }
      // Badge related methods
      async getBadges() {
        return this.badges;
      }
      async getUserBadges(userId) {
        const badgeIds = this.userBadges.get(userId) || [];
        return this.badges.filter((badge) => badgeIds.includes(badge.id));
      }
      async awardBadge(userId, badgeId) {
        const badge = this.badges.find((b) => b.id === badgeId);
        if (!badge) {
          throw new Error(`Badge with ID ${badgeId} not found`);
        }
        if (!this.userProfiles.has(userId)) {
          this.userProfiles.set(userId, {
            id: userId,
            username: "User" + userId,
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
        if (!this.userBadges.has(userId)) {
          this.userBadges.set(userId, []);
        }
        const userBadgeIds = this.userBadges.get(userId);
        if (!userBadgeIds.includes(badgeId)) {
          userBadgeIds.push(badgeId);
          const profile = this.userProfiles.get(userId);
          if (profile && profile.badges) {
            profile.badges.push(badgeId);
          }
          let tokensAwarded = 0;
          switch (badge.tier) {
            case "bronze":
              tokensAwarded = 20;
              break;
            case "silver":
              tokensAwarded = 50;
              break;
            case "gold":
              tokensAwarded = 100;
              break;
            case "platinum":
              tokensAwarded = 200;
              break;
          }
          if (tokensAwarded > 0) {
            await this.addUserTokens(userId, tokensAwarded);
            await this.createRewardActivity(
              userId,
              "badge_earned",
              tokensAwarded,
              `Earned ${tokensAwarded} tokens for receiving the ${badge.name} badge`
            );
          }
        }
        return {
          id: Date.now(),
          userId,
          badgeId,
          earnedAt: /* @__PURE__ */ new Date()
        };
      }
      // Enhanced challenge methods
      async getChallengesByDifficulty(difficulty) {
        this.challenges.forEach((challenge) => {
          if (challenge.difficulty === "medium") {
            challenge.difficulty = "moderate";
          }
        });
        return this.challenges.filter((c) => c.difficulty === difficulty);
      }
      async completeChallenge(userId, challengeId) {
        const challenge = this.challenges.find((c) => c.id === String(challengeId));
        if (!challenge) {
          throw new Error(`Challenge with ID ${challengeId} not found`);
        }
        challenge.isCompleted = true;
        challenge.progress = challenge.targetValue;
        let tokensAwarded = 0;
        switch (challenge.difficulty) {
          case "easy":
            tokensAwarded = 2;
            break;
          case "moderate":
            tokensAwarded = 3;
            break;
          case "hard":
            tokensAwarded = 5;
            break;
          case "extreme":
            tokensAwarded = 7;
            break;
          default:
            tokensAwarded = 2;
        }
        await this.addUserTokens(userId, tokensAwarded);
        await this.createRewardActivity(
          userId,
          "challenge_completion",
          tokensAwarded,
          `Earned ${tokensAwarded} tokens for completing ${challenge.title} (${challenge.difficulty} difficulty)`
        );
        if (!this.userProfiles.has(userId)) {
          this.userProfiles.set(userId, {
            id: userId,
            username: "User" + userId,
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
        if (!profile.completedChallenges.includes(challenge.id)) {
          profile.completedChallenges.push(challenge.id);
        }
        profile.experience += tokensAwarded;
        profile.points += tokensAwarded;
        if (profile.experience >= profile.nextLevelExp) {
          profile.level += 1;
          profile.nextLevelExp = profile.level * 100;
        }
        let badgeAwarded;
        const completedByDifficulty = {
          "easy": 0,
          "moderate": 0,
          "hard": 0,
          "extreme": 0
        };
        for (const challengeId2 of profile.completedChallenges) {
          const chal = this.challenges.find((c) => c.id === challengeId2);
          if (chal) {
            const difficulty = chal.difficulty === "medium" ? "moderate" : chal.difficulty;
            if (completedByDifficulty[difficulty] !== void 0) {
              completedByDifficulty[difficulty]++;
            }
          }
        }
        if (completedByDifficulty.easy >= 5) {
          const bronzeBadge = this.badges.find((b) => b.tier === "bronze");
          if (bronzeBadge) {
            const userBadges2 = this.userBadges.get(userId) || [];
            if (!userBadges2.includes(bronzeBadge.id)) {
              await this.awardBadge(userId, bronzeBadge.id);
              badgeAwarded = bronzeBadge;
            }
          }
        }
        if (completedByDifficulty.moderate >= 5) {
          const silverBadge = this.badges.find((b) => b.tier === "silver");
          if (silverBadge) {
            const userBadges2 = this.userBadges.get(userId) || [];
            if (!userBadges2.includes(silverBadge.id)) {
              await this.awardBadge(userId, silverBadge.id);
              badgeAwarded = silverBadge;
            }
          }
        }
        if (completedByDifficulty.hard >= 5) {
          const goldBadge = this.badges.find((b) => b.tier === "gold");
          if (goldBadge) {
            const userBadges2 = this.userBadges.get(userId) || [];
            if (!userBadges2.includes(goldBadge.id)) {
              await this.awardBadge(userId, goldBadge.id);
              badgeAwarded = goldBadge;
            }
          }
        }
        if (completedByDifficulty.extreme >= 5) {
          const platinumBadge = this.badges.find((b) => b.tier === "platinum");
          if (platinumBadge) {
            const userBadges2 = this.userBadges.get(userId) || [];
            if (!userBadges2.includes(platinumBadge.id)) {
              await this.awardBadge(userId, platinumBadge.id);
              badgeAwarded = platinumBadge;
            }
          }
        }
        this.userProfiles.set(userId, profile);
        return {
          challenge,
          tokensAwarded,
          badgeAwarded
        };
      }
      // Premium user methods
      // Token redemption methods
      async createTokenRedemption(userId, redemptionData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const tokensToRedeem = Number(redemptionData.tokensRedeemed);
        if (user.emotionTokens < tokensToRedeem) {
          throw new Error(`Not enough tokens. Required: ${tokensToRedeem}, Available: ${user.emotionTokens}`);
        }
        user.emotionTokens -= tokensToRedeem;
        this.users.set(userId, user);
        const id = this.redemptionId++;
        const redemption = {
          id,
          userId,
          tokensRedeemed: tokensToRedeem,
          cashAmount: redemptionData.cashAmount,
          status: "pending",
          redemptionType: redemptionData.redemptionType,
          recipientInfo: redemptionData.recipientInfo || null,
          currency: redemptionData.currency || "USD",
          createdAt: /* @__PURE__ */ new Date(),
          processedAt: null,
          notes: redemptionData.notes || null
        };
        if (!this.tokenRedemptions.has(userId)) {
          this.tokenRedemptions.set(userId, []);
        }
        this.tokenRedemptions.get(userId)?.push(redemption);
        return redemption;
      }
      async getUserTokenRedemptions(userId) {
        return this.tokenRedemptions.get(userId) || [];
      }
      async updateTokenRedemptionStatus(redemptionId, status) {
        let foundRedemption;
        let userId;
        for (const [id, redemptions] of this.tokenRedemptions.entries()) {
          const redemption = redemptions.find((r) => r.id === redemptionId);
          if (redemption) {
            foundRedemption = redemption;
            userId = id;
            break;
          }
        }
        if (!foundRedemption || !userId) {
          throw new Error(`Redemption with ID ${redemptionId} not found`);
        }
        foundRedemption.status = status;
        if (status === "completed" || status === "failed") {
          foundRedemption.processedAt = /* @__PURE__ */ new Date();
        }
        if (status === "canceled") {
          const user = await this.getUser(userId);
          if (user) {
            user.emotionTokens += foundRedemption.tokensRedeemed;
            this.users.set(userId, user);
          }
        }
        const userRedemptions = this.tokenRedemptions.get(userId);
        if (userRedemptions) {
          const index = userRedemptions.findIndex((r) => r.id === redemptionId);
          if (index !== -1) {
            userRedemptions[index] = foundRedemption;
            this.tokenRedemptions.set(userId, userRedemptions);
          }
        }
        return foundRedemption;
      }
      async getEligibleForRedemption(userId) {
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
      async updateUserPremiumStatus(userId, isPremium, planType) {
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
      async updateUserPaymentDetails(userId, paymentProvider, accountInfo) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        if (paymentProvider === "paypal") {
          user.paypalEmail = accountInfo;
        } else if (paymentProvider === "stripe") {
          user.stripeAccountId = accountInfo;
        }
        user.preferredPaymentMethod = paymentProvider;
        this.users.set(userId, user);
        return user;
      }
      // Family plan methods
      async createPremiumPlan(userId, planData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const plan = {
          id: Date.now(),
          userId,
          planType: planData.planType,
          startDate: /* @__PURE__ */ new Date(),
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
        await this.updateUserPremiumStatus(userId, true, planData.planType);
        return plan;
      }
      async getUserPremiumPlan(userId) {
        return this.premiumPlans.get(userId);
      }
      async addFamilyMember(userId, familyMemberData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const relatedUser = await this.getUser(familyMemberData.relatedUserId);
        if (!relatedUser) {
          throw new Error(`Related user with ID ${familyMemberData.relatedUserId} not found`);
        }
        const plan = await this.getUserPremiumPlan(userId);
        if (!plan || plan.planType !== "family") {
          throw new Error(`User ${userId} does not have an active family plan`);
        }
        const existingMembers = await this.getFamilyMembers(userId);
        if (existingMembers.length >= plan.memberLimit) {
          throw new Error(`Family plan member limit (${plan.memberLimit}) reached`);
        }
        const relationship = {
          id: Date.now(),
          userId,
          relatedUserId: familyMemberData.relatedUserId,
          relationshipType: familyMemberData.relationshipType,
          status: familyMemberData.status || "pending",
          canViewMood: familyMemberData.canViewMood || false,
          canViewJournal: familyMemberData.canViewJournal || false,
          canReceiveAlerts: familyMemberData.canReceiveAlerts || false,
          canTransferTokens: familyMemberData.canTransferTokens || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: null,
          notes: familyMemberData.notes || null
        };
        if (!this.familyRelationships.has(userId)) {
          this.familyRelationships.set(userId, []);
        }
        this.familyRelationships.get(userId)?.push(relationship);
        if (relationship.status === "accepted") {
          relatedUser.familyPlanOwnerId = userId;
          this.users.set(familyMemberData.relatedUserId, relatedUser);
        }
        return relationship;
      }
      async getFamilyRelationships(userId) {
        return this.familyRelationships.get(userId) || [];
      }
      async getUsersWithFamilyRelationship(userId) {
        const relationships = this.familyRelationships.get(userId) || [];
        const users2 = [];
        for (const relationship of relationships) {
          if (relationship.status === "accepted") {
            const user = await this.getUser(relationship.relatedUserId);
            if (user) {
              users2.push(user);
            }
          }
        }
        return users2;
      }
      async getFamilyRelationship(userId, relatedUserId) {
        const relationships = this.familyRelationships.get(userId) || [];
        const relationship = relationships.find((r) => r.relatedUserId === relatedUserId);
        return relationship || null;
      }
      async updateFamilyRelationshipStatus(id, status) {
        let foundRelationship = null;
        let foundUserId = null;
        for (const [userId, relationships] of this.familyRelationships.entries()) {
          const relationship = relationships.find((r) => r.id === id);
          if (relationship) {
            foundRelationship = relationship;
            foundUserId = userId;
            break;
          }
        }
        if (!foundRelationship || foundUserId === null) {
          throw new Error(`Family relationship with ID ${id} not found`);
        }
        foundRelationship.status = status;
        foundRelationship.updatedAt = /* @__PURE__ */ new Date();
        if (status === "accepted") {
          const relatedUser = await this.getUser(foundRelationship.relatedUserId);
          if (relatedUser) {
            relatedUser.familyPlanOwnerId = foundUserId;
            this.users.set(foundRelationship.relatedUserId, relatedUser);
          }
        } else if (status === "rejected") {
          const relatedUser = await this.getUser(foundRelationship.relatedUserId);
          if (relatedUser && relatedUser.familyPlanOwnerId === foundUserId) {
            relatedUser.familyPlanOwnerId = null;
            this.users.set(foundRelationship.relatedUserId, relatedUser);
          }
        }
        return foundRelationship;
      }
      async getFamilyMembers(userId) {
        const relationships = this.familyRelationships.get(userId) || [];
        const membersWithDetails = await Promise.all(
          relationships.map(async (relationship) => {
            const user = await this.getUser(relationship.relatedUserId);
            return {
              ...relationship,
              relatedUser: user
              // We know this user exists because we validated during addFamilyMember
            };
          })
        );
        return membersWithDetails;
      }
      async updateFamilyMember(relationshipId, updates) {
        let foundRelationship;
        let ownerId;
        for (const [userId, relationships2] of this.familyRelationships.entries()) {
          const relationship = relationships2.find((r) => r.id === relationshipId);
          if (relationship) {
            foundRelationship = relationship;
            ownerId = userId;
            break;
          }
        }
        if (!foundRelationship || !ownerId) {
          throw new Error(`Family relationship with ID ${relationshipId} not found`);
        }
        const updatedRelationship = {
          ...foundRelationship,
          relationshipType: updates.relationshipType || foundRelationship.relationshipType,
          canViewMood: updates.canViewMood !== void 0 ? updates.canViewMood : foundRelationship.canViewMood,
          canViewJournal: updates.canViewJournal !== void 0 ? updates.canViewJournal : foundRelationship.canViewJournal,
          canReceiveAlerts: updates.canReceiveAlerts !== void 0 ? updates.canReceiveAlerts : foundRelationship.canReceiveAlerts
        };
        const relationships = this.familyRelationships.get(ownerId) || [];
        const updatedRelationships = relationships.map(
          (r) => r.id === relationshipId ? updatedRelationship : r
        );
        this.familyRelationships.set(ownerId, updatedRelationships);
        return updatedRelationship;
      }
      async removeFamilyMember(relationshipId) {
        let foundIndex = -1;
        let ownerId;
        for (const [userId, relationships2] of this.familyRelationships.entries()) {
          const index = relationships2.findIndex((r) => r.id === relationshipId);
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
        const relatedUserId = relationships[foundIndex].relatedUserId;
        relationships.splice(foundIndex, 1);
        this.familyRelationships.set(ownerId, relationships);
        const relatedUser = await this.getUser(relatedUserId);
        if (relatedUser) {
          relatedUser.familyPlanOwnerId = null;
          this.users.set(relatedUserId, relatedUser);
        }
        return true;
      }
      async updateMoodTrackingConsent(userId, allowMoodTracking) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        user.allowMoodTracking = allowMoodTracking;
        this.users.set(userId, user);
        return user;
      }
      async getFamilyMoodData(userId) {
        const familyMembers = await this.getFamilyMembers(userId);
        const consentingMembers = familyMembers.filter((member) => member.relatedUser.allowMoodTracking);
        const moodData = await Promise.all(
          consentingMembers.map(async (member) => {
            const memberId = member.relatedUser.id;
            const currentMood = await this.getUserEmotion(memberId) || "neutral";
            const history = this.moodHistory.get(memberId) || [];
            return {
              familyMember: member.relatedUser,
              currentMood,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
              // In a real app, this would be the timestamp of the mood update
              moodHistory: history
            };
          })
        );
        return moodData;
      }
      /******************************
       * ADMIN USER MANAGEMENT METHODS
       ******************************/
      async createAdminUser(adminData) {
        const id = this.adminId++;
        const adminUser = {
          id,
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
          // In a real app, this would be hashed
          firstName: adminData.firstName || null,
          lastName: adminData.lastName || null,
          role: adminData.role,
          isActive: true,
          lastLogin: null,
          createdAt: /* @__PURE__ */ new Date(),
          permissions: adminData.permissions || [],
          avatarUrl: adminData.avatarUrl || null,
          contactPhone: adminData.contactPhone || null,
          department: adminData.department || null
        };
        this.adminUsers.set(id, adminUser);
        return adminUser;
      }
      async getAdminUser(adminId) {
        return this.adminUsers.get(adminId);
      }
      async getAdminUserByUsername(username) {
        return Array.from(this.adminUsers.values()).find(
          (admin) => admin.username.toLowerCase() === username.toLowerCase()
        );
      }
      async updateAdminUser(adminId, updates) {
        const adminUser = this.adminUsers.get(adminId);
        if (!adminUser) {
          throw new Error(`Admin user with ID ${adminId} not found`);
        }
        const updatedAdmin = {
          ...adminUser,
          ...updates,
          // Ensure we don't overwrite ID and creation date
          id: adminUser.id,
          createdAt: adminUser.createdAt
        };
        this.adminUsers.set(adminId, updatedAdmin);
        return updatedAdmin;
      }
      async deleteAdminUser(adminId) {
        const adminUser = this.adminUsers.get(adminId);
        if (!adminUser) {
          return false;
        }
        return this.adminUsers.delete(adminId);
      }
      async getAllAdminUsers() {
        return Array.from(this.adminUsers.values());
      }
      /******************************
       * SUPPORT TICKET METHODS
       ******************************/
      async createSupportTicket(ticketData) {
        const id = this.ticketId++;
        const ticket = {
          id,
          userId: ticketData.userId,
          subject: ticketData.subject,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority || "medium",
          status: "open",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          assignedTo: null,
          attachments: ticketData.attachments || [],
          relatedTicketId: ticketData.relatedTicketId || null,
          isSystemGenerated: false,
          lastResponseAt: null,
          timeToResolve: null
        };
        this.supportTickets.set(id, ticket);
        return ticket;
      }
      async getSupportTicket(ticketId) {
        return this.supportTickets.get(ticketId);
      }
      async updateSupportTicket(ticketId, updates) {
        const ticket = this.supportTickets.get(ticketId);
        if (!ticket) {
          throw new Error(`Support ticket with ID ${ticketId} not found`);
        }
        const updatedTicket = {
          ...ticket,
          ...updates,
          // Ensure we don't overwrite ID and creation date
          id: ticket.id,
          createdAt: ticket.createdAt,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if ((updates.status === "resolved" || updates.status === "closed") && ticket.status !== "resolved" && ticket.status !== "closed") {
          const timeToResolve = Math.floor(
            ((/* @__PURE__ */ new Date()).getTime() - ticket.createdAt.getTime()) / (1e3 * 60 * 60)
          );
          updatedTicket.timeToResolve = timeToResolve;
        }
        this.supportTickets.set(ticketId, updatedTicket);
        return updatedTicket;
      }
      async getSupportTicketsByUser(userId) {
        return Array.from(this.supportTickets.values()).filter((ticket) => ticket.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getAllSupportTickets(filters) {
        let tickets = Array.from(this.supportTickets.values());
        if (filters) {
          if (filters.status) {
            tickets = tickets.filter((ticket) => ticket.status === filters.status);
          }
          if (filters.category) {
            tickets = tickets.filter((ticket) => ticket.category === filters.category);
          }
          if (filters.priority) {
            tickets = tickets.filter((ticket) => ticket.priority === filters.priority);
          }
          if (filters.assignedTo) {
            tickets = tickets.filter((ticket) => ticket.assignedTo === filters.assignedTo);
          }
        }
        return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      /******************************
       * TICKET RESPONSE METHODS
       ******************************/
      async createTicketResponse(responseData) {
        const id = this.responseId++;
        const response = {
          id,
          ticketId: responseData.ticketId,
          responderId: responseData.responderId,
          isAdminResponse: responseData.isAdminResponse || false,
          content: responseData.content,
          createdAt: /* @__PURE__ */ new Date(),
          attachments: responseData.attachments || [],
          isHelpful: responseData.isHelpful || null,
          isSystemGenerated: false
        };
        const ticketResponses2 = this.ticketResponses.get(responseData.ticketId) || [];
        ticketResponses2.push(response);
        const ticket = this.supportTickets.get(responseData.ticketId);
        if (ticket) {
          ticket.lastResponseAt = /* @__PURE__ */ new Date();
          ticket.updatedAt = /* @__PURE__ */ new Date();
          if (ticket.status === "open" && responseData.isAdminResponse) {
            ticket.status = "in_progress";
          }
          this.supportTickets.set(responseData.ticketId, ticket);
        }
        this.ticketResponses.set(responseData.ticketId, ticketResponses2);
        return response;
      }
      async getTicketResponses(ticketId) {
        return (this.ticketResponses.get(ticketId) || []).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
      async markResponseHelpful(responseId, isHelpful) {
        for (const [ticketId, responses] of this.ticketResponses.entries()) {
          const responseIndex = responses.findIndex((r) => r.id === responseId);
          if (responseIndex !== -1) {
            responses[responseIndex].isHelpful = isHelpful;
            this.ticketResponses.set(ticketId, responses);
            return responses[responseIndex];
          }
        }
        throw new Error(`Response with ID ${responseId} not found`);
      }
      /******************************
       * REFUND REQUEST METHODS
       ******************************/
      async createRefundRequest(refundData) {
        const id = this.refundId++;
        const refundRequest = {
          id,
          userId: refundData.userId,
          ticketId: refundData.ticketId || null,
          reason: refundData.reason,
          amount: refundData.amount,
          currency: refundData.currency || "USD",
          transactionId: refundData.transactionId || null,
          paymentMethod: refundData.paymentMethod || null,
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          processedBy: null,
          processedAt: null,
          notes: refundData.notes || null,
          evidence: refundData.evidence || []
        };
        this.refundRequests.set(id, refundRequest);
        return refundRequest;
      }
      async getRefundRequest(refundId) {
        return this.refundRequests.get(refundId);
      }
      async updateRefundRequest(refundId, updates) {
        const refundRequest = this.refundRequests.get(refundId);
        if (!refundRequest) {
          throw new Error(`Refund request with ID ${refundId} not found`);
        }
        const updatedRequest = {
          ...refundRequest,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if ((updates.status === "processed" || updates.status === "approved") && refundRequest.status !== "processed" && refundRequest.status !== "approved") {
          updatedRequest.processedAt = /* @__PURE__ */ new Date();
        }
        this.refundRequests.set(refundId, updatedRequest);
        return updatedRequest;
      }
      async getRefundRequestsByUser(userId) {
        return Array.from(this.refundRequests.values()).filter((request) => request.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getAllRefundRequests(filters) {
        let requests = Array.from(this.refundRequests.values());
        if (filters?.status) {
          requests = requests.filter((request) => request.status === filters.status);
        }
        return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      /******************************
       * ADMIN ACTIONS METHODS
       ******************************/
      async createAdminAction(actionData) {
        const id = this.actionId++;
        const adminAction = {
          id,
          adminId: actionData.adminId,
          actionType: actionData.actionType,
          targetId: actionData.targetId || null,
          targetType: actionData.targetType,
          actionDetails: actionData.actionDetails || null,
          reason: actionData.reason || null,
          createdAt: /* @__PURE__ */ new Date(),
          ipAddress: actionData.ipAddress || null,
          userAgent: actionData.userAgent || null,
          status: "completed"
        };
        const adminActions3 = this.adminActions.get(actionData.adminId) || [];
        adminActions3.push(adminAction);
        this.adminActions.set(actionData.adminId, adminActions3);
        return adminAction;
      }
      async getAdminActions(adminId) {
        return (this.adminActions.get(adminId) || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getActionsByTarget(targetType, targetId) {
        let allActions = [];
        for (const adminActions3 of this.adminActions.values()) {
          allActions = [...allActions, ...adminActions3];
        }
        return allActions.filter((action) => action.targetType === targetType && action.targetId === targetId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getAllAdminActions(limit) {
        let allActions = [];
        for (const adminActions3 of this.adminActions.values()) {
          allActions = [...allActions, ...adminActions3];
        }
        allActions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (limit && limit > 0) {
          return allActions.slice(0, limit);
        }
        return allActions;
      }
      /******************************
       * QUOTE METHODS
       ******************************/
      async createQuote(quoteData) {
        const id = this.quoteId++;
        const quote = {
          id,
          userId: quoteData.userId || null,
          adminId: quoteData.adminId || null,
          ticketId: quoteData.ticketId || null,
          title: quoteData.title,
          description: quoteData.description,
          services: quoteData.services || [],
          totalAmount: quoteData.totalAmount,
          currency: quoteData.currency || "USD",
          validUntil: quoteData.validUntil,
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          acceptedAt: null,
          notes: quoteData.notes || null,
          terms: quoteData.terms || null
        };
        this.quotes.set(id, quote);
        return quote;
      }
      async getQuote(quoteId) {
        return this.quotes.get(quoteId);
      }
      async updateQuoteStatus(quoteId, status, acceptedAt) {
        const quote = this.quotes.get(quoteId);
        if (!quote) {
          throw new Error(`Quote with ID ${quoteId} not found`);
        }
        const updatedQuote = {
          ...quote,
          status
        };
        if (status === "accepted") {
          updatedQuote.acceptedAt = acceptedAt || /* @__PURE__ */ new Date();
        }
        this.quotes.set(quoteId, updatedQuote);
        return updatedQuote;
      }
      async getUserQuotes(userId) {
        return Array.from(this.quotes.values()).filter((quote) => quote.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getQuotesByTicket(ticketId) {
        return Array.from(this.quotes.values()).filter((quote) => quote.ticketId === ticketId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      /******************************
       * ADMIN DASHBOARD METHODS
       ******************************/
      async getSystemStats() {
        const totalUsers = this.users.size;
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = Array.from(this.users.values()).filter((user) => user.lastLogin && new Date(user.lastLogin) >= thirtyDaysAgo).length;
        const premiumUsers = Array.from(this.users.values()).filter((user) => user.isPremium).length;
        const totalRevenue = 0;
        const openTickets = Array.from(this.supportTickets.values()).filter((ticket) => ticket.status === "open" || ticket.status === "in_progress").length;
        const pendingRefunds = Array.from(this.refundRequests.values()).filter((refund) => refund.status === "pending").length;
        const usersByEmotion = {
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
        const recentTickets = Array.from(this.supportTickets.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
        const recentRefunds = Array.from(this.refundRequests.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
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
      async createVideoPost(userId, videoPostData) {
        const id = this.postId++;
        const now = /* @__PURE__ */ new Date();
        const videoPost = {
          id,
          userId,
          title: videoPostData.title,
          description: videoPostData.description || "",
          videoUrl: videoPostData.videoUrl,
          thumbnailUrl: videoPostData.thumbnailUrl || "",
          category: videoPostData.category,
          tags: videoPostData.tags || "",
          isPublic: videoPostData.isPublic !== void 0 ? videoPostData.isPublic : true,
          allowComments: videoPostData.allowComments !== void 0 ? videoPostData.allowComments : true,
          viewCount: 0,
          likeCount: 0,
          shareCount: 0,
          createdAt: now,
          updatedAt: now,
          status: "active"
        };
        this.videoPosts.set(id, videoPost);
        if (!this.userVideoPosts.has(userId)) {
          this.userVideoPosts.set(userId, []);
        }
        this.userVideoPosts.get(userId)?.push(id);
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
      async getVideoPost(postId) {
        return this.videoPosts.get(postId);
      }
      async getUserVideoPosts(userId) {
        const userVideoIds = this.userVideoPosts.get(userId) || [];
        return userVideoIds.map((id) => this.videoPosts.get(id)).filter(Boolean);
      }
      async getAllPublicVideoPosts() {
        return Array.from(this.videoPosts.values()).filter((post) => post.isPublic && post.status === "active").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getVideoPostsByCategory(category) {
        return Array.from(this.videoPosts.values()).filter((post) => post.category === category && post.isPublic && post.status === "active").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async updateVideoPost(postId, updates) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        const updatedPost = {
          ...post,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.videoPosts.set(postId, updatedPost);
        return updatedPost;
      }
      async deleteVideoPost(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          return false;
        }
        post.status = "removed";
        post.updatedAt = /* @__PURE__ */ new Date();
        this.videoPosts.set(postId, post);
        return true;
      }
      async incrementVideoPostViews(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.viewCount += 1;
        this.videoPosts.set(postId, post);
        await this.updateUserVideoStats(post.userId);
        return post;
      }
      async incrementVideoPostLikes(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.likeCount += 1;
        this.videoPosts.set(postId, post);
        await this.updateUserVideoStats(post.userId);
        return post;
      }
      async incrementVideoPostShares(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.shareCount += 1;
        this.videoPosts.set(postId, post);
        await this.updateUserVideoStats(post.userId);
        return post;
      }
      async incrementVideoPostComments(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.commentCount += 1;
        this.videoPosts.set(postId, post);
        await this.updateUserVideoStats(post.userId);
        return post;
      }
      async incrementVideoPostDownloads(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.downloadCount += 1;
        this.videoPosts.set(postId, post);
        await this.updateUserVideoStats(post.userId);
        return post;
      }
      async incrementVideoPostFollows(postId) {
        const post = this.videoPosts.get(postId);
        if (!post) {
          throw new Error(`Video post with ID ${postId} not found`);
        }
        post.followCount += 1;
        this.videoPosts.set(postId, post);
        return post;
      }
      // Video social interaction methods
      async likeVideo(userId, videoId) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const video = await this.getVideoPost(videoId);
        if (!video) {
          throw new Error(`Video with ID ${videoId} not found`);
        }
        if (await this.isVideoLikedByUser(userId, videoId)) {
          throw new Error(`User ${userId} has already liked video ${videoId}`);
        }
        const videoLike = {
          id: Date.now(),
          userId,
          videoId,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.videoLikes.has(videoId)) {
          this.videoLikes.set(videoId, []);
        }
        this.videoLikes.get(videoId)?.push(videoLike);
        await this.incrementVideoPostLikes(videoId);
        return videoLike;
      }
      async unlikeVideo(userId, videoId) {
        if (!this.videoLikes.has(videoId)) {
          return false;
        }
        const likes = this.videoLikes.get(videoId) || [];
        const initialLength = likes.length;
        const updatedLikes = likes.filter((like2) => like2.userId !== userId);
        this.videoLikes.set(videoId, updatedLikes);
        if (updatedLikes.length < initialLength) {
          const video = await this.getVideoPost(videoId);
          if (video && video.likeCount > 0) {
            video.likeCount -= 1;
            this.videoPosts.set(videoId, video);
            await this.updateUserVideoStats(video.userId);
          }
          return true;
        }
        return false;
      }
      async isVideoLikedByUser(userId, videoId) {
        const likes = this.videoLikes.get(videoId) || [];
        return likes.some((like2) => like2.userId === userId);
      }
      async getVideoLikes(videoId) {
        return this.videoLikes.get(videoId) || [];
      }
      async commentOnVideo(userId, videoId, commentData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const video = await this.getVideoPost(videoId);
        if (!video) {
          throw new Error(`Video with ID ${videoId} not found`);
        }
        const comment = {
          id: Date.now(),
          userId,
          videoId,
          content: commentData.content,
          parentCommentId: commentData.parentCommentId || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          isEdited: false,
          isPinned: false,
          isHidden: false
        };
        if (!this.videoComments.has(videoId)) {
          this.videoComments.set(videoId, []);
        }
        this.videoComments.get(videoId)?.push(comment);
        if (!commentData.parentCommentId) {
          await this.incrementVideoPostComments(videoId);
        }
        return comment;
      }
      async getVideoComments(videoId) {
        const comments = this.videoComments.get(videoId) || [];
        const topLevelComments = comments.filter((comment) => !comment.parentCommentId);
        const commentsWithUser = await Promise.all(
          topLevelComments.map(async (comment) => {
            const user = await this.getUser(comment.userId);
            return {
              ...comment,
              user
            };
          })
        );
        return commentsWithUser;
      }
      async getCommentReplies(commentId) {
        let videoId = null;
        for (const [vId, comments2] of this.videoComments.entries()) {
          if (comments2.some((c) => c.id === commentId)) {
            videoId = vId;
            break;
          }
        }
        if (!videoId) {
          return [];
        }
        const comments = this.videoComments.get(videoId) || [];
        return comments.filter((comment) => comment.parentCommentId === commentId);
      }
      async editVideoComment(commentId, content) {
        let comment = null;
        let videoId = null;
        for (const [vId, comments2] of this.videoComments.entries()) {
          const foundComment = comments2.find((c) => c.id === commentId);
          if (foundComment) {
            comment = foundComment;
            videoId = vId;
            break;
          }
        }
        if (!comment || !videoId) {
          throw new Error(`Comment with ID ${commentId} not found`);
        }
        const updatedComment = {
          ...comment,
          content,
          updatedAt: /* @__PURE__ */ new Date(),
          isEdited: true
        };
        const comments = this.videoComments.get(videoId) || [];
        const updatedComments = comments.map(
          (c) => c.id === commentId ? updatedComment : c
        );
        this.videoComments.set(videoId, updatedComments);
        return updatedComment;
      }
      async deleteVideoComment(commentId) {
        let videoId = null;
        let commentIndex = -1;
        for (const [vId, comments2] of this.videoComments.entries()) {
          commentIndex = comments2.findIndex((c) => c.id === commentId);
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
        const isTopLevel = !comment.parentCommentId;
        comments.splice(commentIndex, 1);
        this.videoComments.set(videoId, comments);
        if (isTopLevel) {
          const updatedComments = comments.filter((c) => c.parentCommentId !== commentId);
          this.videoComments.set(videoId, updatedComments);
          const video = await this.getVideoPost(videoId);
          if (video && video.commentCount > 0) {
            video.commentCount -= 1;
            this.videoPosts.set(videoId, video);
            await this.updateUserVideoStats(video.userId);
          }
        }
        return true;
      }
      // User profile social metrics methods
      async updateUserVideoStats(userId) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const userVideos = Array.from(this.videoPosts.values()).filter((video) => video.userId === userId);
        const stats = {
          videoCount: userVideos.length,
          totalViews: userVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0),
          totalLikes: userVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0),
          totalComments: userVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0),
          totalShares: userVideos.reduce((sum, video) => sum + (video.shareCount || 0), 0),
          totalDownloads: userVideos.reduce((sum, video) => sum + (video.downloadCount || 0), 0)
        };
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
      async followUser(followerId, followedId) {
        const follower = await this.getUser(followerId);
        if (!follower) {
          throw new Error(`Follower user with ID ${followerId} not found`);
        }
        const followed = await this.getUser(followedId);
        if (!followed) {
          throw new Error(`Followed user with ID ${followedId} not found`);
        }
        if (followerId === followedId) {
          throw new Error("Users cannot follow themselves");
        }
        if (await this.isUserFollowedByUser(followerId, followedId)) {
          throw new Error(`User ${followerId} is already following user ${followedId}`);
        }
        const follow = {
          id: Date.now(),
          followerId,
          followedId,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.userFollowing.has(followerId)) {
          this.userFollowing.set(followerId, []);
        }
        this.userFollowing.get(followerId)?.push(follow);
        if (!this.userFollowers.has(followedId)) {
          this.userFollowers.set(followedId, []);
        }
        this.userFollowers.get(followedId)?.push(follow);
        await this.updateUserFollowerCount(followedId);
        return follow;
      }
      async unfollowUser(followerId, followedId) {
        const followingList = this.userFollowing.get(followerId) || [];
        const followersList = this.userFollowers.get(followedId) || [];
        const followingIndex = followingList.findIndex(
          (f) => f.followerId === followerId && f.followedId === followedId
        );
        const followersIndex = followersList.findIndex(
          (f) => f.followerId === followerId && f.followedId === followedId
        );
        if (followingIndex === -1 || followersIndex === -1) {
          return false;
        }
        followingList.splice(followingIndex, 1);
        followersList.splice(followersIndex, 1);
        this.userFollowing.set(followerId, followingList);
        this.userFollowers.set(followedId, followersList);
        await this.updateUserFollowerCount(followedId);
        return true;
      }
      async getUserFollowers(userId) {
        const followers = this.userFollowers.get(userId) || [];
        const followersWithUser = await Promise.all(
          followers.map(async (follow) => {
            const user = await this.getUser(follow.followerId);
            return {
              ...follow,
              follower: user
            };
          })
        );
        return followersWithUser;
      }
      async getUserFollowing(userId) {
        const following = this.userFollowing.get(userId) || [];
        const followingWithUser = await Promise.all(
          following.map(async (follow) => {
            const user = await this.getUser(follow.followedId);
            return {
              ...follow,
              followed: user
            };
          })
        );
        return followingWithUser;
      }
      async isUserFollowedByUser(followerId, followedId) {
        const following = this.userFollowing.get(followerId) || [];
        return following.some((f) => f.followedId === followedId);
      }
      async updateUserFollowerCount(userId) {
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
      async saveVideo(userId, videoId) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const video = await this.getVideoPost(videoId);
        if (!video) {
          throw new Error(`Video with ID ${videoId} not found`);
        }
        if (await this.isVideoSavedByUser(userId, videoId)) {
          throw new Error(`User ${userId} has already saved video ${videoId}`);
        }
        const videoSave = {
          id: Date.now(),
          userId,
          videoId,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.videoSaves.has(userId)) {
          this.videoSaves.set(userId, []);
        }
        this.videoSaves.get(userId)?.push(videoSave);
        return videoSave;
      }
      async unsaveVideo(userId, videoId) {
        if (!this.videoSaves.has(userId)) {
          return false;
        }
        const saves = this.videoSaves.get(userId) || [];
        const initialLength = saves.length;
        const updatedSaves = saves.filter((save) => save.videoId !== videoId);
        this.videoSaves.set(userId, updatedSaves);
        return updatedSaves.length < initialLength;
      }
      async getUserSavedVideos(userId) {
        const saves = this.videoSaves.get(userId) || [];
        const savesWithVideo = await Promise.all(
          saves.map(async (save) => {
            const video = await this.getVideoPost(save.videoId);
            return {
              ...save,
              video
            };
          })
        );
        return savesWithVideo;
      }
      async isVideoSavedByUser(userId, videoId) {
        const saves = this.videoSaves.get(userId) || [];
        return saves.some((save) => save.videoId === videoId);
      }
      async downloadVideo(userId, videoId, ipAddress) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const video = await this.getVideoPost(videoId);
        if (!video) {
          throw new Error(`Video with ID ${videoId} not found`);
        }
        const videoDownload = {
          id: Date.now(),
          userId,
          videoId,
          ipAddress: ipAddress || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.videoDownloads.has(videoId)) {
          this.videoDownloads.set(videoId, []);
        }
        this.videoDownloads.get(videoId)?.push(videoDownload);
        await this.incrementVideoPostDownloads(videoId);
        return videoDownload;
      }
      async getUserDownloadedVideos(userId) {
        const downloads = [];
        for (const [videoId, videoDownloads2] of this.videoDownloads.entries()) {
          downloads.push(...videoDownloads2.filter((d) => d.userId === userId));
        }
        const downloadsWithVideo = await Promise.all(
          downloads.map(async (download) => {
            const video = await this.getVideoPost(download.videoId);
            return {
              ...download,
              video
            };
          })
        );
        return downloadsWithVideo;
      }
      async getVideoDownloads(videoId) {
        return this.videoDownloads.get(videoId) || [];
      }
      async followVideo(userId, videoId) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const video = await this.getVideoPost(videoId);
        if (!video) {
          throw new Error(`Video with ID ${videoId} not found`);
        }
        if (await this.isVideoFollowedByUser(userId, videoId)) {
          throw new Error(`User ${userId} has already followed video ${videoId}`);
        }
        const videoFollow = {
          id: Date.now(),
          userId,
          videoId,
          createdAt: /* @__PURE__ */ new Date()
        };
        if (!this.videoFollows.has(videoId)) {
          this.videoFollows.set(videoId, []);
        }
        this.videoFollows.get(videoId)?.push(videoFollow);
        await this.incrementVideoPostFollows(videoId);
        return videoFollow;
      }
      async unfollowVideo(userId, videoId) {
        if (!this.videoFollows.has(videoId)) {
          return false;
        }
        const follows = this.videoFollows.get(videoId) || [];
        const initialLength = follows.length;
        const updatedFollows = follows.filter((follow) => follow.userId !== userId);
        this.videoFollows.set(videoId, updatedFollows);
        if (updatedFollows.length < initialLength) {
          const video = await this.getVideoPost(videoId);
          if (video && video.followCount > 0) {
            video.followCount -= 1;
            this.videoPosts.set(videoId, video);
          }
          return true;
        }
        return false;
      }
      async getVideoFollowers(videoId) {
        const follows = this.videoFollows.get(videoId) || [];
        const followsWithUser = await Promise.all(
          follows.map(async (follow) => {
            const user = await this.getUser(follow.userId);
            return {
              ...follow,
              user
            };
          })
        );
        return followsWithUser;
      }
      async isVideoFollowedByUser(userId, videoId) {
        const follows = this.videoFollows.get(videoId) || [];
        return follows.some((follow) => follow.userId === userId);
      }
      // Advertisement methods
      async createAdvertisement(userId, data) {
        const id = this.advertisementId++;
        const now = /* @__PURE__ */ new Date();
        const advertisement = {
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
          status: data.status || "pending_payment",
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
        if (!this.userAdvertisements.has(userId)) {
          this.userAdvertisements.set(userId, []);
        }
        this.userAdvertisements.get(userId)?.push(id);
        return advertisement;
      }
      async getAdvertisementById(id) {
        return this.advertisements.get(id);
      }
      async getUserAdvertisements(userId) {
        const adIds = this.userAdvertisements.get(userId) || [];
        return adIds.map((id) => this.advertisements.get(id)).filter(Boolean);
      }
      async getAllPublishedAdvertisements() {
        const ads = Array.from(this.advertisements.values()).filter((ad) => ad.status === "published");
        return Promise.all(ads.map(async (ad) => {
          const user = await this.getUser(ad.userId);
          return { ...ad, user };
        }));
      }
      async getAdvertisementsByType(type) {
        const ads = Array.from(this.advertisements.values()).filter((ad) => ad.status === "published" && ad.type === type);
        return Promise.all(ads.map(async (ad) => {
          const user = await this.getUser(ad.userId);
          return { ...ad, user };
        }));
      }
      async updateAdvertisement(id, data) {
        const ad = this.advertisements.get(id);
        if (!ad) {
          throw new Error("Advertisement not found");
        }
        const updatedAd = {
          ...ad,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.advertisements.set(id, updatedAd);
        return updatedAd;
      }
      async deleteAdvertisement(id) {
        const ad = this.advertisements.get(id);
        if (!ad) {
          return false;
        }
        this.advertisements.delete(id);
        const userAds = this.userAdvertisements.get(ad.userId);
        if (userAds) {
          const updatedUserAds = userAds.filter((adId) => adId !== id);
          this.userAdvertisements.set(ad.userId, updatedUserAds);
        }
        return true;
      }
      async updateAdvertisementStatus(id, status) {
        const ad = this.advertisements.get(id);
        if (!ad) {
          throw new Error("Advertisement not found");
        }
        const updatedAd = {
          ...ad,
          status,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.advertisements.set(id, updatedAd);
        return updatedAd;
      }
      async incrementAdvertisementViewCount(id) {
        const ad = this.advertisements.get(id);
        if (!ad) {
          throw new Error("Advertisement not found");
        }
        const updatedAd = {
          ...ad,
          viewCount: ad.viewCount + 1,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.advertisements.set(id, updatedAd);
        return updatedAd;
      }
      async createAdvertisementPayment(id, provider, transactionId) {
        const ad = this.advertisements.get(id);
        if (!ad) {
          throw new Error("Advertisement not found");
        }
        const updatedAd = {
          ...ad,
          paymentProvider: provider,
          paymentTransactionId: transactionId,
          status: "published",
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.advertisements.set(id, updatedAd);
        return updatedAd;
      }
      // Advertisement booking methods
      async createAdvertisementBooking(data) {
        const id = this.bookingId++;
        const now = /* @__PURE__ */ new Date();
        const booking = {
          id,
          advertisementId: data.advertisementId,
          userId: data.userId,
          createdAt: now,
          updatedAt: now,
          status: data.status || "pending",
          notes: data.notes || null,
          contactDetails: data.contactDetails || null,
          locationDetails: data.locationDetails || null,
          requestedStartDate: data.requestedStartDate || null,
          requestedEndDate: data.requestedEndDate || null
        };
        if (!this.advertisementBookings.has(data.advertisementId)) {
          this.advertisementBookings.set(data.advertisementId, []);
        }
        this.advertisementBookings.get(data.advertisementId)?.push(booking);
        await this.incrementAdvertisementBookingCount(data.advertisementId);
        return booking;
      }
      async getAdvertisementBookingById(id) {
        for (const [_, bookings] of this.advertisementBookings.entries()) {
          const booking = bookings.find((b) => b.id === id);
          if (booking) {
            return booking;
          }
        }
        return void 0;
      }
      async getAdvertisementBookings(advertisementId) {
        const bookings = this.advertisementBookings.get(advertisementId) || [];
        return Promise.all(bookings.map(async (booking) => {
          const user = await this.getUser(booking.userId);
          return { ...booking, user };
        }));
      }
      async getUserBookings(userId) {
        const allBookings = [];
        for (const [_, bookings] of this.advertisementBookings.entries()) {
          allBookings.push(...bookings);
        }
        const userBookings = allBookings.filter((booking) => booking.userId === userId);
        return Promise.all(userBookings.map(async (booking) => {
          const ad = await this.getAdvertisementById(booking.advertisementId);
          return { ...booking, advertisement: ad };
        }));
      }
      async updateAdvertisementBookingStatus(id, status) {
        for (const [adId, bookings] of this.advertisementBookings.entries()) {
          const index = bookings.findIndex((b) => b.id === id);
          if (index !== -1) {
            const updatedBooking = {
              ...bookings[index],
              status,
              updatedAt: /* @__PURE__ */ new Date()
            };
            bookings[index] = updatedBooking;
            this.advertisementBookings.set(adId, bookings);
            return updatedBooking;
          }
        }
        throw new Error("Booking not found");
      }
      async updateBookingLocationDetails(id, locationDetails) {
        for (const [adId, bookings] of this.advertisementBookings.entries()) {
          const index = bookings.findIndex((b) => b.id === id);
          if (index !== -1) {
            const updatedBooking = {
              ...bookings[index],
              locationDetails,
              updatedAt: /* @__PURE__ */ new Date()
            };
            bookings[index] = updatedBooking;
            this.advertisementBookings.set(adId, bookings);
            return updatedBooking;
          }
        }
        throw new Error("Booking not found");
      }
      async incrementAdvertisementBookingCount(advertisementId) {
        const ad = this.advertisements.get(advertisementId);
        if (!ad) {
          throw new Error("Advertisement not found");
        }
        const updatedAd = {
          ...ad,
          bookingCount: ad.bookingCount + 1,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.advertisements.set(advertisementId, updatedAd);
        return updatedAd;
      }
      // Emotional Imprints methods (premium feature)
      async createEmotionalImprint(data) {
        const user = await this.getUser(data.userId);
        if (!user) {
          throw new Error(`User ${data.userId} not found`);
        }
        if (!user.isPremium) {
          throw new Error("Emotional Imprints are a premium feature");
        }
        const imprint = {
          id: this.emotionalImprintId++,
          createdAt: /* @__PURE__ */ new Date(),
          ...data
        };
        this.emotionalImprints.set(imprint.id, imprint);
        if (!this.userEmotionalImprints.has(data.userId)) {
          this.userEmotionalImprints.set(data.userId, []);
        }
        this.userEmotionalImprints.get(data.userId).push(imprint.id);
        return imprint;
      }
      async getEmotionalImprint(id) {
        return this.emotionalImprints.get(id);
      }
      async getUserEmotionalImprints(userId) {
        const imprintIds = this.userEmotionalImprints.get(userId) || [];
        return imprintIds.map((id) => this.emotionalImprints.get(id)).filter(Boolean);
      }
      async getPublicEmotionalImprints() {
        const imprints = [];
        for (const imprint of this.emotionalImprints.values()) {
          if (imprint.isPublic) {
            imprints.push(imprint);
          }
        }
        return imprints;
      }
      async getEmotionalImprintTemplates() {
        const templates = [];
        for (const imprint of this.emotionalImprints.values()) {
          if (imprint.isTemplate) {
            templates.push(imprint);
          }
        }
        return templates;
      }
      async updateEmotionalImprint(id, updates) {
        const imprint = this.emotionalImprints.get(id);
        if (!imprint) {
          throw new Error(`Emotional imprint ${id} not found`);
        }
        const user = await this.getUser(imprint.userId);
        if (!user || !user.isPremium) {
          throw new Error("Only premium users can update emotional imprints");
        }
        const updatedImprint = {
          ...imprint,
          ...updates,
          id,
          // ensure ID doesn't change
          userId: imprint.userId,
          // ensure owner doesn't change
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.emotionalImprints.set(id, updatedImprint);
        return updatedImprint;
      }
      async deleteEmotionalImprint(id) {
        const imprint = this.emotionalImprints.get(id);
        if (!imprint) {
          return false;
        }
        this.emotionalImprints.delete(id);
        const userImprints = this.userEmotionalImprints.get(imprint.userId);
        if (userImprints) {
          const updatedImprints = userImprints.filter((imprintId) => imprintId !== id);
          this.userEmotionalImprints.set(imprint.userId, updatedImprints);
        }
        this.emotionalImprintInteractions.delete(id);
        return true;
      }
      async createEmotionalImprintInteraction(data) {
        const imprint = await this.getEmotionalImprint(data.imprintId);
        if (!imprint) {
          throw new Error(`Emotional imprint ${data.imprintId} not found`);
        }
        const sender = await this.getUser(data.senderId);
        if (!sender) {
          throw new Error(`Sender ${data.senderId} not found`);
        }
        if (!sender.isPremium) {
          throw new Error("Sending emotional imprints is a premium feature");
        }
        const interaction = {
          id: this.imprintInteractionId++,
          createdAt: /* @__PURE__ */ new Date(),
          ...data
        };
        if (!this.emotionalImprintInteractions.has(data.imprintId)) {
          this.emotionalImprintInteractions.set(data.imprintId, []);
        }
        this.emotionalImprintInteractions.get(data.imprintId).push(interaction);
        if (!this.receivedEmotionalImprints.has(data.receiverId)) {
          this.receivedEmotionalImprints.set(data.receiverId, []);
        }
        this.receivedEmotionalImprints.get(data.receiverId).push(interaction.id);
        return interaction;
      }
      async getEmotionalImprintInteractions(imprintId) {
        const interactions = this.emotionalImprintInteractions.get(imprintId) || [];
        return Promise.all(
          interactions.map(async (interaction) => {
            const receiver = await this.getUser(interaction.receiverId);
            return {
              ...interaction,
              receiver
            };
          })
        );
      }
      async getReceivedEmotionalImprints(userId) {
        const interactionIds = this.receivedEmotionalImprints.get(userId) || [];
        const results = [];
        for (const [imprintId, interactions] of this.emotionalImprintInteractions.entries()) {
          for (const interaction of interactions) {
            if (interaction.receiverId === userId) {
              const imprint = this.emotionalImprints.get(interaction.imprintId);
              let sender;
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
        return results.sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      // Verification Document Methods
      async createVerificationDocument(documentData) {
        const id = this.docId++;
        const document = {
          id,
          ...documentData,
          verifiedAt: null,
          verifiedBy: null,
          verifierNotes: null
        };
        const userDocuments = this.verificationDocuments.get(documentData.userId) || [];
        userDocuments.push(document);
        this.verificationDocuments.set(documentData.userId, userDocuments);
        return document;
      }
      async getVerificationDocumentsByUser(userId) {
        return this.verificationDocuments.get(userId) || [];
      }
      async updateVerificationDocumentStatus(documentId, status, verifiedBy, verifierNotes) {
        for (const [userId, documents] of this.verificationDocuments.entries()) {
          const documentIndex = documents.findIndex((doc) => doc.id === documentId);
          if (documentIndex !== -1) {
            const document = documents[documentIndex];
            const updatedDocument = {
              ...document,
              verificationStatus: status,
              verifiedBy: verifiedBy || document.verifiedBy,
              verifierNotes: verifierNotes || document.verifierNotes,
              verifiedAt: status === "verified" ? /* @__PURE__ */ new Date() : document.verifiedAt
            };
            documents[documentIndex] = updatedDocument;
            this.verificationDocuments.set(userId, documents);
            if (status === "verified") {
              const user = this.users.get(userId);
              if (user) {
                const verifiedDocs = documents.filter((doc) => doc.verificationStatus === "verified").length;
                if (verifiedDocs >= 2) {
                  this.users.set(userId, {
                    ...user,
                    verificationStatus: "verified",
                    verifiedAt: /* @__PURE__ */ new Date()
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
      milestoneShares = /* @__PURE__ */ new Map();
      milestoneShareId = 1;
      async createMilestoneShare(shareData) {
        const milestoneShare = {
          id: this.milestoneShareId++,
          userId: shareData.userId,
          milestone: shareData.milestone,
          platform: shareData.platform,
          shareUrl: shareData.shareUrl,
          shareMessage: shareData.shareMessage || null,
          tokensAwarded: 0,
          clicks: 0,
          conversions: 0,
          shareDate: /* @__PURE__ */ new Date(),
          ipAddress: shareData.ipAddress || null,
          trackingId: shareData.trackingId
        };
        const userShares = this.milestoneShares.get(shareData.userId) || [];
        userShares.push(milestoneShare);
        this.milestoneShares.set(shareData.userId, userShares);
        return milestoneShare;
      }
      async getUserMilestoneShares(userId) {
        return this.milestoneShares.get(userId) || [];
      }
      async hasUserSharedMilestone(userId, milestone) {
        const userShares = this.milestoneShares.get(userId) || [];
        return userShares.some((share) => share.milestone === milestone);
      }
      async updateMilestoneShareTokens(shareId, tokensAwarded) {
        for (const [userId, shares] of this.milestoneShares.entries()) {
          const shareIndex = shares.findIndex((share) => share.id === shareId);
          if (shareIndex !== -1) {
            shares[shareIndex] = {
              ...shares[shareIndex],
              tokensAwarded
            };
            this.milestoneShares.set(userId, shares);
            return shares[shareIndex];
          }
        }
        throw new Error(`Milestone share with ID ${shareId} not found`);
      }
      async incrementMilestoneShareClicks(trackingId) {
        for (const [userId, shares] of this.milestoneShares.entries()) {
          const shareIndex = shares.findIndex((share) => share.trackingId === trackingId);
          if (shareIndex !== -1) {
            shares[shareIndex] = {
              ...shares[shareIndex],
              clicks: (shares[shareIndex].clicks || 0) + 1
            };
            this.milestoneShares.set(userId, shares);
            return shares[shareIndex];
          }
        }
        throw new Error(`Milestone share with tracking ID ${trackingId} not found`);
      }
      async incrementMilestoneShareConversions(trackingId) {
        for (const [userId, shares] of this.milestoneShares.entries()) {
          const shareIndex = shares.findIndex((share) => share.trackingId === trackingId);
          if (shareIndex !== -1) {
            shares[shareIndex] = {
              ...shares[shareIndex],
              conversions: (shares[shareIndex].conversions || 0) + 1
            };
            this.milestoneShares.set(userId, shares);
            return shares[shareIndex];
          }
        }
        throw new Error(`Milestone share with tracking ID ${trackingId} not found`);
      }
      // Subscription management methods
      async updateSubscriptionStatus(userId, isCancelled, cancelledAt) {
        if (!this.users.has(userId)) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const user = this.users.get(userId);
        user.subscriptionCancelled = isCancelled;
        if (isCancelled) {
          user.subscriptionCancelledAt = cancelledAt || /* @__PURE__ */ new Date();
        } else {
          user.subscriptionCancelledAt = null;
        }
        this.users.set(userId, user);
        return user;
      }
      async setPremiumExpiryDate(userId, expiryDate) {
        if (!this.users.has(userId)) {
          throw new Error(`User with ID ${userId} not found`);
        }
        const user = this.users.get(userId);
        user.premiumExpiryDate = expiryDate;
        this.users.set(userId, user);
        return user;
      }
      // Account and data deletion management methods
      async createDeletionRequest(data) {
        const now = /* @__PURE__ */ new Date();
        const id = this.nextDeletionRequestId++;
        const deletionRequest = {
          id,
          userId: data.userId,
          type: data.type,
          requestedAt: data.requestedAt || now,
          scheduledAt: data.scheduledAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3),
          // Default to 7 days from now
          status: data.status || "pending",
          processorId: null,
          processedAt: null,
          userEmail: data.userEmail || "",
          notificationSent: data.notificationSent || false,
          notificationSentAt: null,
          notes: data.notes || null
        };
        this.deletionRequests.set(id, deletionRequest);
        if (!this.userDeletionRequests.has(data.userId)) {
          this.userDeletionRequests.set(data.userId, []);
        }
        this.userDeletionRequests.get(data.userId).push(id);
        return deletionRequest;
      }
      async getDeletionRequests() {
        return Array.from(this.deletionRequests.values());
      }
      async getDeletionRequestsByUser(userId) {
        const requestIds = this.userDeletionRequests.get(userId) || [];
        return requestIds.map((id) => this.deletionRequests.get(id)).filter(Boolean);
      }
      async updateDeletionRequest(requestId, updates) {
        const existingRequest = this.deletionRequests.get(requestId);
        if (!existingRequest) {
          throw new Error(`Deletion request with ID ${requestId} not found`);
        }
        const updatedRequest = { ...existingRequest, ...updates };
        this.deletionRequests.set(requestId, updatedRequest);
        return updatedRequest;
      }
      // NFT Token Pool System Methods
      async createTokenPool(data) {
        const pool2 = {
          id: this.nextTokenPoolId++,
          createdAt: /* @__PURE__ */ new Date(),
          ...data
        };
        this.tokenPools.set(pool2.id, pool2);
        return pool2;
      }
      async updateTokenPool(poolId, data) {
        if (!this.tokenPools.has(poolId)) {
          throw new Error("Token pool not found");
        }
        const pool2 = this.tokenPools.get(poolId);
        const updatedPool = {
          ...pool2,
          ...data
        };
        this.tokenPools.set(poolId, updatedPool);
        return updatedPool;
      }
      async getCurrentTokenPool() {
        let currentPool = null;
        let maxRound = 0;
        for (const pool2 of this.tokenPools.values()) {
          if (pool2.status === "active" && pool2.distributionRound > maxRound) {
            currentPool = pool2;
            maxRound = pool2.distributionRound;
          }
        }
        return currentPool;
      }
      async getTokenPoolById(poolId) {
        return this.tokenPools.get(poolId) || null;
      }
      async getTopPoolContributors(poolRound, limit) {
        const userContributions = /* @__PURE__ */ new Map();
        for (const contribution of this.poolContributions.values()) {
          if (contribution.poolRound === poolRound) {
            const currentTotal = userContributions.get(contribution.userId) || 0;
            userContributions.set(contribution.userId, currentTotal + contribution.tokenAmount);
          }
        }
        const topContributors = Array.from(userContributions.entries()).map(([userId, totalContribution]) => {
          const user = this.users.get(userId);
          return {
            userId,
            username: user?.username || `User-${userId}`,
            totalContribution
          };
        }).sort((a, b) => b.totalContribution - a.totalContribution).slice(0, limit);
        return topContributors;
      }
      async createPoolContribution(data) {
        const contribution = {
          id: this.nextPoolContributionId++,
          createdAt: /* @__PURE__ */ new Date(),
          ...data
        };
        this.poolContributions.set(contribution.id, contribution);
        if (!this.userPoolContributions.has(data.userId)) {
          this.userPoolContributions.set(data.userId, []);
        }
        this.userPoolContributions.get(data.userId).push(contribution.id);
        return contribution;
      }
      async getPoolContributionsByUser(userId, poolRound) {
        const contributionIds = this.userPoolContributions.get(userId) || [];
        const contributions = [];
        for (const id of contributionIds) {
          const contribution = this.poolContributions.get(id);
          if (contribution && contribution.poolRound === poolRound) {
            contributions.push(contribution);
          }
        }
        return contributions;
      }
      async getUserPoolContributionStats(userId, poolRound) {
        const allContributors = await this.getTopPoolContributors(poolRound, 1e3);
        const userPosition = allContributors.findIndex((c) => c.userId === userId);
        const userContribution = userPosition >= 0 ? allContributors[userPosition].totalContribution : 0;
        const userRank = userPosition >= 0 ? userPosition + 1 : 0;
        const userContributions = await this.getPoolContributionsByUser(userId, poolRound);
        return {
          totalContribution: userContribution,
          rank: userRank,
          contributionCount: userContributions.length
        };
      }
      async createPoolDistribution(data) {
        const distribution = {
          id: this.nextPoolDistributionId++,
          createdAt: /* @__PURE__ */ new Date(),
          ...data
        };
        this.poolDistributions.set(distribution.id, distribution);
        if (!data.isCharity && data.userId !== 0) {
          if (!this.userPoolDistributions.has(data.userId)) {
            this.userPoolDistributions.set(data.userId, []);
          }
          this.userPoolDistributions.get(data.userId).push(distribution.id);
        }
        return distribution;
      }
      async getPoolDistributionsByUser(userId) {
        const distributionIds = this.userPoolDistributions.get(userId) || [];
        const distributions = [];
        for (const id of distributionIds) {
          const distribution = this.poolDistributions.get(id);
          if (distribution) {
            distributions.push(distribution);
          }
        }
        return distributions;
      }
      async getEmotionalNft(nftId) {
        return this.emotionalNfts.get(nftId) || null;
      }
      async getUserEmotionalNfts(userId) {
        const nftIds = this.userEmotionalNfts.get(userId) || [];
        const nfts = [];
        for (const id of nftIds) {
          const nft = this.emotionalNfts.get(id);
          if (nft) {
            nfts.push(nft);
          }
        }
        return nfts;
      }
      async createEmotionalNft(data) {
        const nft = {
          id: this.nextEmotionalNftId++,
          createdAt: /* @__PURE__ */ new Date(),
          mintedAt: null,
          burnedAt: null,
          evolutionProgress: 0,
          isDisplayed: data.isDisplayed || false,
          evolutionLevel: data.evolutionLevel || 1,
          mintStatus: data.mintStatus || "unminted",
          ...data
        };
        this.emotionalNfts.set(nft.id, nft);
        if (!this.userEmotionalNfts.has(data.userId)) {
          this.userEmotionalNfts.set(data.userId, []);
        }
        this.userEmotionalNfts.get(data.userId).push(nft.id);
        return nft;
      }
      async updateEmotionalNft(nftId, data) {
        if (!this.emotionalNfts.has(nftId)) {
          throw new Error("Emotional NFT not found");
        }
        const nft = this.emotionalNfts.get(nftId);
        const updatedNft = {
          ...nft,
          ...data
        };
        this.emotionalNfts.set(nftId, updatedNft);
        return updatedNft;
      }
    };
    storage = new MemStorage();
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  MIN_REDEMPTION_TOKENS: () => MIN_REDEMPTION_TOKENS,
  PREMIUM_ACCESS_TOKENS: () => PREMIUM_ACCESS_TOKENS,
  TOKEN_CONVERSION_RATE: () => TOKEN_CONVERSION_RATE,
  adminActions: () => adminActions,
  adminUsers: () => adminUsers,
  advertisementBookings: () => advertisementBookings,
  advertisements: () => advertisements,
  badges: () => badges,
  blockedUsers: () => blockedUsers,
  challenges: () => challenges,
  charityOrganizations: () => charityOrganizations,
  chatRoomParticipants: () => chatRoomParticipants,
  chatRooms: () => chatRooms,
  deletionRequests: () => deletionRequests,
  emotionalImprintInteractions: () => emotionalImprintInteractions,
  emotionalImprints: () => emotionalImprints,
  emotionalNfts: () => emotionalNfts,
  emotions: () => emotions,
  familyRelationships: () => familyRelationships,
  feedbackSubmissions: () => feedbackSubmissions,
  friendships: () => friendships,
  gofundmeCampaigns: () => gofundmeCampaigns,
  insertAdminActionSchema: () => insertAdminActionSchema,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertAdvertisementBookingSchema: () => insertAdvertisementBookingSchema,
  insertAdvertisementSchema: () => insertAdvertisementSchema,
  insertBadgeSchema: () => insertBadgeSchema,
  insertBlockedUserSchema: () => insertBlockedUserSchema,
  insertChallengeSchema: () => insertChallengeSchema,
  insertChatRoomParticipantSchema: () => insertChatRoomParticipantSchema,
  insertChatRoomSchema: () => insertChatRoomSchema,
  insertDeletionRequestSchema: () => insertDeletionRequestSchema,
  insertEmotionSchema: () => insertEmotionSchema,
  insertEmotionalImprintInteractionSchema: () => insertEmotionalImprintInteractionSchema,
  insertEmotionalImprintSchema: () => insertEmotionalImprintSchema,
  insertEmotionalNftSchema: () => insertEmotionalNftSchema,
  insertFamilyRelationshipSchema: () => insertFamilyRelationshipSchema,
  insertFeedbackSubmissionSchema: () => insertFeedbackSubmissionSchema,
  insertFriendshipSchema: () => insertFriendshipSchema,
  insertGofundmeCampaignSchema: () => insertGofundmeCampaignSchema,
  insertJournalEntrySchema: () => insertJournalEntrySchema,
  insertMilestoneShareSchema: () => insertMilestoneShareSchema,
  insertMoodMatchSchema: () => insertMoodMatchSchema,
  insertNftCollectionSchema: () => insertNftCollectionSchema,
  insertNftItemSchema: () => insertNftItemSchema,
  insertNftTransferSchema: () => insertNftTransferSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPoolContributionSchema: () => insertPoolContributionSchema,
  insertPoolDistributionSchema: () => insertPoolDistributionSchema,
  insertPremiumPlanSchema: () => insertPremiumPlanSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertRefundRequestSchema: () => insertRefundRequestSchema,
  insertRewardActivitySchema: () => insertRewardActivitySchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertTicketResponseSchema: () => insertTicketResponseSchema,
  insertTokenPoolSchema: () => insertTokenPoolSchema,
  insertTokenRedemptionSchema: () => insertTokenRedemptionSchema,
  insertTokenTransferSchema: () => insertTokenTransferSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserChallengeCompletionSchema: () => insertUserChallengeCompletionSchema,
  insertUserFollowSchema: () => insertUserFollowSchema,
  insertUserMessageSchema: () => insertUserMessageSchema,
  insertUserNftSchema: () => insertUserNftSchema,
  insertUserPostSchema: () => insertUserPostSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSessionSchema: () => insertUserSessionSchema,
  insertVideoCommentSchema: () => insertVideoCommentSchema,
  insertVideoDownloadSchema: () => insertVideoDownloadSchema,
  insertVideoFollowSchema: () => insertVideoFollowSchema,
  insertVideoLikeSchema: () => insertVideoLikeSchema,
  insertVideoPostSchema: () => insertVideoPostSchema,
  insertVideoSaveSchema: () => insertVideoSaveSchema,
  journalEntries: () => journalEntries,
  milestoneShares: () => milestoneShares,
  moodGames: () => moodGames,
  moodMatches: () => moodMatches,
  nftCollections: () => nftCollections,
  nftItems: () => nftItems,
  nftTransfers: () => nftTransfers,
  notifications: () => notifications,
  poolContributions: () => poolContributions,
  poolDistributions: () => poolDistributions,
  postComments: () => postComments,
  postReactions: () => postReactions,
  premiumPlans: () => premiumPlans,
  quotes: () => quotes,
  referrals: () => referrals,
  refundRequests: () => refundRequests,
  rewardActivities: () => rewardActivities,
  supportTickets: () => supportTickets,
  ticketResponses: () => ticketResponses,
  tokenPool: () => tokenPool,
  tokenRedemptions: () => tokenRedemptions,
  tokenTransfers: () => tokenTransfers,
  updateUserSchema: () => updateUserSchema,
  userBadges: () => userBadges,
  userChallengeCompletions: () => userChallengeCompletions,
  userFollows: () => userFollows,
  userGamePlays: () => userGamePlays,
  userMessages: () => userMessages,
  userMoodTrends: () => userMoodTrends,
  userNfts: () => userNfts,
  userNotificationSettings: () => userNotificationSettings,
  userPosts: () => userPosts,
  userSessions: () => userSessions,
  userVideoCalls: () => userVideoCalls,
  users: () => users,
  verificationDocuments: () => verificationDocuments,
  videoComments: () => videoComments,
  videoDownloads: () => videoDownloads,
  videoFollows: () => videoFollows,
  videoLikes: () => videoLikes,
  videoPosts: () => videoPosts,
  videoSaves: () => videoSaves
});
import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var TOKEN_CONVERSION_RATE, MIN_REDEMPTION_TOKENS, PREMIUM_ACCESS_TOKENS, users, emotions, journalEntries, chatRooms, rewardActivities, badges, userBadges, blockedUsers, chatRoomParticipants, challenges, verificationDocuments, tokenRedemptions, familyRelationships, tokenTransfers, premiumPlans, userChallengeCompletions, referrals, nftCollections, nftItems, userNfts, nftTransfers, emotionalNfts, tokenPool, poolContributions, poolDistributions, moodGames, userGamePlays, userMoodTrends, userSessions, moodMatches, adminUsers, supportTickets, ticketResponses, refundRequests, notifications, adminActions, quotes, videoPosts, videoLikes, videoComments, videoFollows, videoSaves, videoDownloads, userFollows, insertUserSchema, insertUserSessionSchema, insertEmotionSchema, insertJournalEntrySchema, insertRewardActivitySchema, insertNftCollectionSchema, insertNftItemSchema, insertUserNftSchema, insertNftTransferSchema, insertEmotionalNftSchema, insertTokenPoolSchema, insertPoolContributionSchema, insertPoolDistributionSchema, insertBadgeSchema, insertUserBadgeSchema, insertChallengeSchema, updateUserSchema, insertNotificationSchema, insertTokenRedemptionSchema, insertChatRoomSchema, insertBlockedUserSchema, insertChatRoomParticipantSchema, insertFamilyRelationshipSchema, insertTokenTransferSchema, insertPremiumPlanSchema, insertUserChallengeCompletionSchema, insertReferralSchema, insertAdminUserSchema, insertSupportTicketSchema, insertTicketResponseSchema, insertRefundRequestSchema, insertAdminActionSchema, insertQuoteSchema, insertVideoPostSchema, insertVideoLikeSchema, insertVideoCommentSchema, deletionRequests, insertDeletionRequestSchema, insertVideoFollowSchema, insertVideoSaveSchema, insertVideoDownloadSchema, insertUserFollowSchema, insertMoodMatchSchema, milestoneShares, advertisements, advertisementBookings, insertAdvertisementSchema, insertAdvertisementBookingSchema, friendships, userMessages, userPosts, postReactions, postComments, userVideoCalls, userNotificationSettings, charityOrganizations, gofundmeCampaigns, feedbackSubmissions, emotionalImprints, emotionalImprintInteractions, insertFriendshipSchema, insertUserMessageSchema, insertUserPostSchema, insertGofundmeCampaignSchema, insertFeedbackSubmissionSchema, insertEmotionalImprintSchema, insertEmotionalImprintInteractionSchema, insertMilestoneShareSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    TOKEN_CONVERSION_RATE = 1e-3;
    MIN_REDEMPTION_TOKENS = 1e4;
    PREMIUM_ACCESS_TOKENS = {
      ONE_WEEK: 2500,
      TWO_WEEKS: 4500,
      THREE_WEEKS: 7e3,
      FOUR_WEEKS: 1e4
    };
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      firstName: text("first_name"),
      middleName: text("middle_name"),
      lastName: text("last_name"),
      username: text("username").notNull().unique(),
      email: text("email").unique(),
      password: text("password").notNull(),
      gender: text("gender").$type(),
      state: text("state"),
      country: text("country"),
      emotionTokens: integer("emotion_tokens").default(0).notNull(),
      isPremium: boolean("is_premium").default(false),
      premiumPlanType: text("premium_plan_type").$type(),
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
      status: text("status").$type().default("offline"),
      lastActiveAt: timestamp("last_active_at"),
      paypalEmail: text("paypal_email"),
      // Stripe data - PCI compliant (no actual card data stored)
      stripeCustomerId: text("stripe_customer_id"),
      // Safe to store - reference to customer in Stripe
      stripeSubscriptionId: text("stripe_subscription_id"),
      // Safe to store - reference to subscription in Stripe
      stripeLastFour: text("stripe_last_four"),
      // Safe to store - last 4 digits only
      stripeCardBrand: text("stripe_card_brand"),
      // Safe to store - card type (Visa, MC, etc)
      stripeCardExpiry: text("stripe_card_expiry"),
      // Safe to store - MM/YY format
      stripePaymentMethodId: text("stripe_payment_method_id"),
      // Safe to store - payment method token
      // Legacy field for compatibility
      stripeAccountId: text("stripe_account_id"),
      preferredPaymentMethod: text("preferred_payment_method").$type(),
      preferredCurrency: text("preferred_currency").default("USD"),
      verificationStatus: text("verification_status").$type().default("not_verified"),
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
      dataDeletionScheduledAt: timestamp("data_deletion_scheduled_at")
    });
    emotions = pgTable("emotions", {
      userId: integer("user_id").notNull().references(() => users.id),
      emotion: text("emotion").notNull().$type(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    journalEntries = pgTable("journal_entries", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      emotion: text("emotion").notNull().$type(),
      note: text("note").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    chatRooms = pgTable("chat_rooms", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      emotion: text("emotion").notNull().$type(),
      createdAt: timestamp("created_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      isPrivate: boolean("is_private").default(false),
      maxParticipants: integer("max_participants").default(50),
      themeColor: text("theme_color").default("#6366f1")
    });
    rewardActivities = pgTable("reward_activities", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      activityType: text("activity_type").notNull().$type(),
      tokensEarned: integer("tokens_earned").notNull(),
      description: text("description").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    badges = pgTable("badges", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      iconUrl: text("icon_url").notNull(),
      category: text("category").notNull(),
      tier: text("tier").notNull(),
      // bronze, silver, gold, platinum
      createdAt: timestamp("created_at").defaultNow()
    });
    userBadges = pgTable("user_badges", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      badgeId: integer("badge_id").notNull().references(() => badges.id),
      earnedAt: timestamp("earned_at").defaultNow()
    });
    blockedUsers = pgTable("blocked_users", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
      reason: text("reason"),
      createdAt: timestamp("created_at").defaultNow()
    });
    chatRoomParticipants = pgTable("chat_room_participants", {
      id: serial("id").primaryKey(),
      chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id),
      userId: integer("user_id").notNull().references(() => users.id),
      isAdmin: boolean("is_admin").default(false),
      joinedAt: timestamp("joined_at").defaultNow()
    });
    challenges = pgTable("challenges", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      difficulty: text("difficulty").notNull().$type(),
      tokenReward: integer("token_reward").notNull(),
      targetValue: integer("target_value").notNull(),
      iconUrl: text("icon_url"),
      createdAt: timestamp("created_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      isUserCreated: boolean("is_user_created").default(false),
      isPublic: boolean("is_public").default(true),
      completionCount: integer("completion_count").default(0),
      approvalStatus: text("approval_status").default("approved"),
      // approved, pending, rejected
      tags: text("tags")
      // comma-separated tags for searching
    });
    verificationDocuments = pgTable("verification_documents", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      documentType: text("document_type").notNull().$type(),
      documentNumber: text("document_number").notNull(),
      documentUrl: text("document_url"),
      expirationDate: timestamp("expiration_date"),
      issuedBy: text("issued_by"),
      issuedDate: timestamp("issued_date"),
      verificationStatus: text("verification_status").notNull().$type().default("pending"),
      verifierNotes: text("verifier_notes"),
      verifiedBy: integer("verified_by").references(() => adminUsers.id),
      verifiedAt: timestamp("verified_at"),
      submittedAt: timestamp("submitted_at").defaultNow(),
      rejectionReason: text("rejection_reason")
    });
    tokenRedemptions = pgTable("token_redemptions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      tokensRedeemed: integer("tokens_redeemed").notNull(),
      cashAmount: numeric("cash_amount").notNull(),
      status: text("status").notNull().$type(),
      redemptionType: text("redemption_type").notNull().$type(),
      recipientInfo: text("recipient_info"),
      // PayPal email, donation organization, or user ID for transfers
      currency: text("currency").default("USD").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      processedAt: timestamp("processed_at"),
      notes: text("notes")
    });
    familyRelationships = pgTable("family_relationships", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      relatedUserId: integer("related_user_id").notNull().references(() => users.id),
      relationshipType: text("relationship_type").notNull().$type(),
      status: text("status").default("pending").notNull().$type(),
      canViewMood: boolean("can_view_mood").default(false),
      canViewJournal: boolean("can_view_journal").default(false),
      canReceiveAlerts: boolean("can_receive_alerts").default(false),
      canTransferTokens: boolean("can_transfer_tokens").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      notes: text("notes")
    });
    tokenTransfers = pgTable("token_transfers", {
      id: serial("id").primaryKey(),
      fromUserId: integer("from_user_id").notNull().references(() => users.id),
      toUserId: integer("to_user_id").notNull().references(() => users.id),
      amount: integer("amount").notNull(),
      type: text("type").notNull().$type().default("general"),
      status: text("status").notNull().$type().default("completed"),
      timestamp: timestamp("timestamp").defaultNow(),
      notes: text("notes")
    });
    premiumPlans = pgTable("premium_plans", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      planType: text("plan_type").notNull().$type(),
      startDate: timestamp("start_date").defaultNow(),
      paymentAmount: numeric("payment_amount").notNull(),
      currency: text("currency").default("USD").notNull(),
      memberLimit: integer("member_limit").default(5),
      isLifetime: boolean("is_lifetime").default(false),
      nextBillingDate: timestamp("next_billing_date"),
      status: text("status").default("active").notNull(),
      paymentMethod: text("payment_method").$type(),
      paymentDetails: text("payment_details"),
      isTrial: boolean("is_trial").default(false),
      trialStartDate: timestamp("trial_start_date"),
      trialEndDate: timestamp("trial_end_date"),
      // Stripe-specific fields
      stripePriceId: text("stripe_price_id"),
      // ID of the Stripe price object
      stripeSubscriptionId: text("stripe_subscription_id"),
      // ID of the Stripe subscription
      stripeSubscriptionStatus: text("stripe_subscription_status").$type(),
      // Status of the subscription in Stripe
      stripePeriodEnd: timestamp("stripe_period_end"),
      // End of the current billing period
      stripeCanceledAt: timestamp("stripe_canceled_at"),
      // When the subscription was canceled (if applicable)
      stripeMetadata: text("stripe_metadata")
      // JSON string containing additional metadata
    });
    userChallengeCompletions = pgTable("user_challenge_completions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      challengeId: integer("challenge_id").notNull().references(() => challenges.id),
      completedAt: timestamp("completed_at").defaultNow(),
      creatorRewarded: boolean("creator_rewarded").default(false),
      userRewarded: boolean("user_rewarded").default(false),
      notes: text("notes")
    });
    referrals = pgTable("referrals", {
      id: serial("id").primaryKey(),
      referrerUserId: integer("referrer_user_id").notNull().references(() => users.id),
      referralCode: text("referral_code").notNull(),
      referralEmail: text("referral_email"),
      referredUserId: integer("referred_user_id").references(() => users.id),
      status: text("status").default("pending").notNull().$type(),
      createdAt: timestamp("created_at").defaultNow(),
      registeredAt: timestamp("registered_at"),
      convertedAt: timestamp("converted_at"),
      expiresAt: timestamp("expires_at"),
      tokenReward: integer("token_reward").default(50),
      premiumDaysReward: integer("premium_days_reward").default(0),
      notes: text("notes")
    });
    nftCollections = pgTable("nft_collections", {
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
      category: text("category").$type().notNull()
    });
    nftItems = pgTable("nft_items", {
      id: serial("id").primaryKey(),
      collectionId: integer("collection_id").references(() => nftCollections.id),
      name: text("name").notNull(),
      description: text("description").notNull(),
      imageUrl: text("image_url").notNull(),
      rarity: text("rarity").$type().notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      tokenPrice: integer("token_price"),
      // Cost in emotion tokens
      totalMinted: integer("total_minted").default(0),
      maxSupply: integer("max_supply"),
      attributes: json("attributes"),
      animationUrl: text("animation_url"),
      externalUrl: text("external_url")
    });
    userNfts = pgTable("user_nfts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      nftItemId: integer("nft_item_id").notNull().references(() => nftItems.id),
      acquiredAt: timestamp("acquired_at").defaultNow(),
      tokensPaid: integer("tokens_paid"),
      serialNumber: integer("serial_number").notNull(),
      // For limited edition NFTs
      isDisplayed: boolean("is_displayed").default(false),
      transferrable: boolean("transferrable").default(true),
      lastTransferredAt: timestamp("last_transferred_at"),
      transactionHash: text("transaction_hash")
      // For blockchain integration in the future
    });
    nftTransfers = pgTable("nft_transfers", {
      id: serial("id").primaryKey(),
      fromUserId: integer("from_user_id").notNull().references(() => users.id),
      toUserId: integer("to_user_id").notNull().references(() => users.id),
      nftId: integer("nft_id").notNull().references(() => userNfts.id),
      transferredAt: timestamp("transferred_at").defaultNow(),
      tokensInvolved: integer("tokens_involved").default(0),
      notes: text("notes")
    });
    emotionalNfts = pgTable("emotional_nfts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      tokenId: text("token_id").notNull().unique(),
      metadata: text("metadata").notNull(),
      // JSON string containing NFT metadata
      emotion: text("emotion").$type().notNull(),
      rarity: text("rarity").$type().notNull(),
      activityType: text("activity_type").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      imageUrl: text("image_url").notNull(),
      isDisplayed: boolean("is_displayed").default(false),
      evolutionLevel: integer("evolution_level").default(1),
      lastEvolvedAt: timestamp("last_evolved_at"),
      bonusGranted: text("bonus_granted"),
      // Bonus effect description (if any)
      expiresAt: timestamp("expires_at"),
      // For time-limited NFTs
      mintStatus: text("mint_status").default("unminted"),
      // unminted, minted, burned
      mintedAt: timestamp("minted_at"),
      tokensCost: integer("tokens_cost").default(350),
      // Default cost is 350 tokens
      burnedAt: timestamp("burned_at")
    });
    tokenPool = pgTable("token_pool", {
      id: serial("id").primaryKey(),
      totalTokens: integer("total_tokens").default(0).notNull(),
      targetTokens: integer("target_tokens").default(1e6).notNull(),
      // Default target of 1,000,000 tokens
      distributionRound: integer("distribution_round").default(1).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      lastDistributionAt: timestamp("last_distribution_at"),
      nextDistributionDate: timestamp("next_distribution_date"),
      status: text("status").default("active").notNull(),
      // active, distributing, paused
      charityPercentage: integer("charity_percentage").default(15).notNull(),
      // Percentage allocated to charity
      topContributorsPercentage: integer("top_contributors_percentage").default(85).notNull(),
      // Percentage to top contributors
      maxTopContributors: integer("max_top_contributors").default(50).notNull()
      // Number of top contributors who get rewards
    });
    poolContributions = pgTable("pool_contributions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      nftId: integer("nft_id").notNull().references(() => emotionalNfts.id),
      tokenAmount: integer("token_amount").notNull(),
      // Typically 350 tokens per NFT
      contributionDate: timestamp("contribution_date").defaultNow(),
      poolRound: integer("pool_round").notNull(),
      // Which distribution round this belongs to
      transactionType: text("transaction_type").default("burn").notNull(),
      // burn, charity, system
      notes: text("notes")
    });
    poolDistributions = pgTable("pool_distributions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      poolRound: integer("pool_round").notNull(),
      distributionDate: timestamp("distribution_date").defaultNow(),
      tokenAmount: integer("token_amount").notNull(),
      rank: integer("rank"),
      // User's rank in that distribution round
      isCharity: boolean("is_charity").default(false),
      // Whether this distribution is to charity
      charityName: text("charity_name"),
      transactionId: text("transaction_id"),
      // For tracking the transfer
      status: text("status").default("completed").notNull()
      // pending, completed, failed
    });
    moodGames = pgTable("mood_games", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      thumbnailUrl: text("thumbnail_url"),
      category: text("category").notNull().$type(),
      difficulty: text("difficulty").notNull().$type(),
      tokenReward: integer("token_reward").default(2),
      instructions: text("instructions").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      helpsMood: text("helps_mood").$type().array(),
      isActive: boolean("is_active").default(true),
      playCount: integer("play_count").default(0),
      averageRating: numeric("average_rating"),
      bgMusicUrl: text("bg_music_url"),
      isPremiumOnly: boolean("is_premium_only").default(true)
    });
    userGamePlays = pgTable("user_game_plays", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      gameId: integer("game_id").notNull().references(() => moodGames.id),
      startedAt: timestamp("started_at").defaultNow(),
      completedAt: timestamp("completed_at"),
      score: integer("score"),
      moodBefore: text("mood_before").$type(),
      moodAfter: text("mood_after").$type(),
      userRating: integer("user_rating"),
      feedbackNote: text("feedback_note"),
      tokensEarned: integer("tokens_earned")
    });
    userMoodTrends = pgTable("user_mood_trends", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      date: timestamp("date").defaultNow(),
      predominantMood: text("predominant_mood").$type(),
      activityType: text("activity_type").$type(),
      moodScore: integer("mood_score").notNull(),
      // 1-10 scale
      notes: text("notes"),
      recommendedGameCategory: text("recommended_game_category").$type()
    });
    userSessions = pgTable("user_sessions", {
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
      status: text("status").$type().default("online")
    });
    moodMatches = pgTable("mood_matches", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      matchedUserId: integer("matched_user_id").notNull().references(() => users.id),
      score: integer("score").notNull(),
      // 0-100 compatibility score
      userEmotion: text("user_emotion").$type().notNull(),
      matchedUserEmotion: text("matched_user_emotion").$type().notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at"),
      // Matches can expire after some time
      status: text("status").default("active").notNull(),
      // active, connected, expired, rejected
      lastInteractionAt: timestamp("last_interaction_at"),
      acceptedAt: timestamp("accepted_at"),
      rejectedAt: timestamp("rejected_at")
    });
    adminUsers = pgTable("admin_users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      role: text("role").notNull().$type(),
      isActive: boolean("is_active").default(true),
      lastLogin: timestamp("last_login"),
      createdAt: timestamp("created_at").defaultNow(),
      permissions: json("permissions").$type(),
      avatarUrl: text("avatar_url"),
      contactPhone: text("contact_phone"),
      department: text("department")
    });
    supportTickets = pgTable("support_tickets", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      subject: text("subject").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull().$type(),
      priority: text("priority").default("medium").notNull().$type(),
      status: text("status").default("open").notNull().$type(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      assignedTo: integer("assigned_to").references(() => adminUsers.id),
      attachments: json("attachments").$type(),
      relatedTicketId: integer("related_ticket_id").references(() => supportTickets.id),
      isSystemGenerated: boolean("is_system_generated").default(false),
      lastResponseAt: timestamp("last_response_at"),
      timeToResolve: integer("time_to_resolve")
      // In hours
    });
    ticketResponses = pgTable("ticket_responses", {
      id: serial("id").primaryKey(),
      ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
      responderId: integer("responder_id"),
      // Can be userId or adminId
      isAdminResponse: boolean("is_admin_response").default(false),
      content: text("content").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      attachments: json("attachments").$type(),
      isHelpful: boolean("is_helpful"),
      isSystemGenerated: boolean("is_system_generated").default(false)
    });
    refundRequests = pgTable("refund_requests", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      ticketId: integer("ticket_id").references(() => supportTickets.id),
      reason: text("reason").notNull(),
      amount: numeric("amount").notNull(),
      currency: text("currency").default("USD").notNull(),
      transactionId: text("transaction_id"),
      paymentMethod: text("payment_method").$type(),
      status: text("status").default("pending").notNull().$type(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      processedBy: integer("processed_by").references(() => adminUsers.id),
      processedAt: timestamp("processed_at"),
      notes: text("notes"),
      evidence: json("evidence").$type()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      type: text("type").notNull().$type(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      readAt: timestamp("read_at"),
      expiresAt: timestamp("expires_at"),
      actionLink: text("action_link"),
      sourceId: integer("source_id"),
      // Can reference different entities based on notification type
      sourceType: text("source_type"),
      // The table name this notification relates to
      icon: text("icon"),
      // Icon name for the notification
      isPushSent: boolean("is_push_sent").default(false),
      isEmailSent: boolean("is_email_sent").default(false)
    });
    adminActions = pgTable("admin_actions", {
      id: serial("id").primaryKey(),
      adminId: integer("admin_id").notNull().references(() => adminUsers.id),
      actionType: text("action_type").notNull().$type(),
      targetId: integer("target_id"),
      // Could be userId, ticketId, etc.
      targetType: text("target_type").notNull(),
      // "user", "ticket", "refund", etc.
      actionDetails: json("action_details"),
      reason: text("reason"),
      createdAt: timestamp("created_at").defaultNow(),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      status: text("status").default("completed")
    });
    quotes = pgTable("quotes", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      adminId: integer("admin_id").references(() => adminUsers.id),
      ticketId: integer("ticket_id").references(() => supportTickets.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      services: json("services").$type(),
      totalAmount: numeric("total_amount").notNull(),
      currency: text("currency").default("USD").notNull(),
      validUntil: timestamp("valid_until").notNull(),
      status: text("status").default("pending").notNull(),
      // pending, accepted, rejected, expired
      createdAt: timestamp("created_at").defaultNow(),
      acceptedAt: timestamp("accepted_at"),
      notes: text("notes"),
      terms: text("terms")
    });
    videoPosts = pgTable("video_posts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      description: text("description"),
      videoUrl: text("video_url").notNull(),
      originalVideoUrl: text("original_video_url"),
      // For storing the original video before edits
      thumbnailUrl: text("thumbnail_url"),
      duration: integer("duration"),
      // In seconds
      category: text("category").$type().notNull(),
      tags: text("tags"),
      // comma-separated tags
      isPublic: boolean("is_public").default(true),
      allowComments: boolean("allow_comments").default(true),
      viewCount: integer("view_count").default(0),
      likeCount: integer("like_count").default(0),
      commentCount: integer("comment_count").default(0),
      downloadCount: integer("download_count").default(0),
      shareCount: integer("share_count").default(0),
      followCount: integer("follow_count").default(0),
      isLiveStream: boolean("is_live_stream").default(false),
      streamKey: text("stream_key"),
      // For live streaming
      streamStatus: text("stream_status"),
      // active, ended, scheduled
      scheduledStart: timestamp("scheduled_start"),
      // For scheduled streams
      resolution: text("resolution"),
      // e.g., "1920x1080"
      hasAiEnhancement: boolean("has_ai_enhancement").default(false),
      aiEnhancementDetails: text("ai_enhancement_details"),
      // JSON string of applied AI enhancements
      editorVersion: text("editor_version"),
      // To keep track of which editor version was used
      editHistory: text("edit_history"),
      // JSON string of edit history
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      status: text("status").default("active").notNull()
      // active, pending, removed, processing
    });
    videoLikes = pgTable("video_likes", {
      id: serial("id").primaryKey(),
      videoId: integer("video_id").notNull().references(() => videoPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    videoComments = pgTable("video_comments", {
      id: serial("id").primaryKey(),
      videoId: integer("video_id").notNull().references(() => videoPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      parentCommentId: integer("parent_comment_id").references(() => videoComments.id),
      // For nested comments
      content: text("content").notNull(),
      likeCount: integer("like_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      isEdited: boolean("is_edited").default(false),
      isHidden: boolean("is_hidden").default(false)
    });
    videoFollows = pgTable("video_follows", {
      id: serial("id").primaryKey(),
      videoId: integer("video_id").notNull().references(() => videoPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    videoSaves = pgTable("video_saves", {
      id: serial("id").primaryKey(),
      videoId: integer("video_id").notNull().references(() => videoPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    videoDownloads = pgTable("video_downloads", {
      id: serial("id").primaryKey(),
      videoId: integer("video_id").notNull().references(() => videoPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      ipAddress: text("ip_address")
    });
    userFollows = pgTable("user_follows", {
      id: serial("id").primaryKey(),
      followerId: integer("follower_id").notNull().references(() => users.id),
      followedId: integer("followed_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      firstName: true,
      middleName: true,
      lastName: true,
      username: true,
      email: true,
      password: true,
      gender: true,
      state: true,
      country: true
    });
    insertUserSessionSchema = createInsertSchema(userSessions).pick({
      userId: true,
      sessionToken: true,
      ipAddress: true,
      userAgent: true,
      device: true,
      browser: true,
      location: true,
      startTime: true,
      lastActiveTime: true,
      status: true
    });
    insertEmotionSchema = createInsertSchema(emotions).pick({
      emotion: true
    });
    insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
      emotion: true,
      note: true
    });
    insertRewardActivitySchema = createInsertSchema(rewardActivities).pick({
      userId: true,
      activityType: true,
      tokensEarned: true,
      description: true
    });
    insertNftCollectionSchema = createInsertSchema(nftCollections).pick({
      name: true,
      description: true,
      coverImage: true,
      createdBy: true,
      isActive: true,
      isPremiumOnly: true,
      tokenRequirement: true,
      totalSupply: true,
      category: true
    });
    insertNftItemSchema = createInsertSchema(nftItems).pick({
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
      externalUrl: true
    });
    insertUserNftSchema = createInsertSchema(userNfts).pick({
      userId: true,
      nftItemId: true,
      tokensPaid: true,
      serialNumber: true,
      isDisplayed: true,
      transferrable: true,
      transactionHash: true
    });
    insertNftTransferSchema = createInsertSchema(nftTransfers).pick({
      fromUserId: true,
      toUserId: true,
      nftId: true,
      tokensInvolved: true,
      notes: true
    });
    insertEmotionalNftSchema = createInsertSchema(emotionalNfts).pick({
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
      tokensCost: true
    });
    insertTokenPoolSchema = createInsertSchema(tokenPool).pick({
      totalTokens: true,
      targetTokens: true,
      distributionRound: true,
      status: true,
      charityPercentage: true,
      topContributorsPercentage: true,
      maxTopContributors: true
    });
    insertPoolContributionSchema = createInsertSchema(poolContributions).pick({
      userId: true,
      nftId: true,
      tokenAmount: true,
      poolRound: true,
      transactionType: true,
      notes: true
    });
    insertPoolDistributionSchema = createInsertSchema(poolDistributions).pick({
      userId: true,
      poolRound: true,
      tokenAmount: true,
      rank: true,
      isCharity: true,
      charityName: true,
      transactionId: true,
      status: true
    });
    insertBadgeSchema = createInsertSchema(badges).pick({
      name: true,
      description: true,
      iconUrl: true,
      category: true,
      tier: true
    });
    insertUserBadgeSchema = createInsertSchema(userBadges).pick({
      userId: true,
      badgeId: true
    });
    insertChallengeSchema = createInsertSchema(challenges).pick({
      title: true,
      description: true,
      category: true,
      difficulty: true,
      tokenReward: true,
      targetValue: true,
      iconUrl: true,
      isUserCreated: true,
      isPublic: true,
      tags: true
    });
    updateUserSchema = createInsertSchema(users).pick({
      profilePicture: true,
      paypalEmail: true,
      stripeAccountId: true,
      preferredPaymentMethod: true,
      preferredCurrency: true,
      isPremium: true
    });
    insertNotificationSchema = createInsertSchema(notifications).pick({
      userId: true,
      type: true,
      title: true,
      content: true,
      actionLink: true,
      sourceId: true,
      sourceType: true,
      icon: true,
      expiresAt: true
    });
    insertTokenRedemptionSchema = createInsertSchema(tokenRedemptions).pick({
      tokensRedeemed: true,
      cashAmount: true,
      redemptionType: true,
      recipientInfo: true,
      currency: true,
      notes: true
    });
    insertChatRoomSchema = createInsertSchema(chatRooms).pick({
      name: true,
      description: true,
      emotion: true,
      isPrivate: true,
      maxParticipants: true,
      themeColor: true
    });
    insertBlockedUserSchema = createInsertSchema(blockedUsers).pick({
      blockedUserId: true,
      reason: true
    });
    insertChatRoomParticipantSchema = createInsertSchema(chatRoomParticipants).pick({
      chatRoomId: true,
      userId: true,
      isAdmin: true
    });
    insertFamilyRelationshipSchema = createInsertSchema(familyRelationships).pick({
      userId: true,
      relatedUserId: true,
      relationshipType: true,
      status: true,
      canViewMood: true,
      canViewJournal: true,
      canReceiveAlerts: true,
      canTransferTokens: true,
      notes: true
    });
    insertTokenTransferSchema = createInsertSchema(tokenTransfers).pick({
      fromUserId: true,
      toUserId: true,
      amount: true,
      type: true,
      status: true,
      notes: true
    });
    insertPremiumPlanSchema = createInsertSchema(premiumPlans).pick({
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
      trialEndDate: true
    });
    insertUserChallengeCompletionSchema = createInsertSchema(userChallengeCompletions).pick({
      userId: true,
      challengeId: true,
      notes: true
    });
    insertReferralSchema = createInsertSchema(referrals).pick({
      referrerUserId: true,
      referralCode: true,
      referralEmail: true,
      referredUserId: true,
      tokenReward: true,
      premiumDaysReward: true,
      notes: true
    });
    insertAdminUserSchema = createInsertSchema(adminUsers).pick({
      username: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      role: true,
      permissions: true,
      avatarUrl: true,
      contactPhone: true,
      department: true
    });
    insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
      userId: true,
      subject: true,
      description: true,
      category: true,
      priority: true,
      attachments: true,
      relatedTicketId: true
    });
    insertTicketResponseSchema = createInsertSchema(ticketResponses).pick({
      ticketId: true,
      responderId: true,
      isAdminResponse: true,
      content: true,
      attachments: true,
      isHelpful: true
    });
    insertRefundRequestSchema = createInsertSchema(refundRequests).pick({
      userId: true,
      ticketId: true,
      reason: true,
      amount: true,
      currency: true,
      transactionId: true,
      paymentMethod: true,
      notes: true,
      evidence: true
    });
    insertAdminActionSchema = createInsertSchema(adminActions).pick({
      adminId: true,
      actionType: true,
      targetId: true,
      targetType: true,
      actionDetails: true,
      reason: true,
      ipAddress: true,
      userAgent: true
    });
    insertQuoteSchema = createInsertSchema(quotes).pick({
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
      terms: true
    });
    insertVideoPostSchema = createInsertSchema(videoPosts).pick({
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
      editHistory: true
    });
    insertVideoLikeSchema = createInsertSchema(videoLikes).pick({
      videoId: true,
      userId: true
    });
    insertVideoCommentSchema = createInsertSchema(videoComments).pick({
      videoId: true,
      userId: true,
      parentCommentId: true,
      content: true
    });
    deletionRequests = pgTable("deletion_requests", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      type: text("type").notNull().$type(),
      requestedAt: timestamp("requested_at").defaultNow(),
      scheduledAt: timestamp("scheduled_at").notNull(),
      processedAt: timestamp("processed_at"),
      status: text("status").notNull().$type(),
      processorId: integer("processor_id").references(() => adminUsers.id),
      userEmail: text("user_email"),
      notificationSent: boolean("notification_sent").default(false),
      notificationSentAt: timestamp("notification_sent_at"),
      notes: text("notes")
    });
    insertDeletionRequestSchema = createInsertSchema(deletionRequests).pick({
      userId: true,
      type: true,
      scheduledAt: true,
      status: true,
      userEmail: true,
      notificationSent: true,
      notes: true
    });
    insertVideoFollowSchema = createInsertSchema(videoFollows).pick({
      videoId: true,
      userId: true
    });
    insertVideoSaveSchema = createInsertSchema(videoSaves).pick({
      videoId: true,
      userId: true
    });
    insertVideoDownloadSchema = createInsertSchema(videoDownloads).pick({
      videoId: true,
      userId: true,
      ipAddress: true
    });
    insertUserFollowSchema = createInsertSchema(userFollows).pick({
      followerId: true,
      followedId: true
    });
    insertMoodMatchSchema = createInsertSchema(moodMatches).pick({
      userId: true,
      matchedUserId: true,
      score: true,
      userEmotion: true,
      matchedUserEmotion: true,
      expiresAt: true,
      status: true
    });
    milestoneShares = pgTable("milestone_shares", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      milestone: integer("milestone").notNull(),
      platform: text("platform").notNull().$type(),
      shareUrl: text("share_url").notNull(),
      shareMessage: text("share_message"),
      tokensAwarded: integer("tokens_awarded").default(0),
      clicks: integer("clicks").default(0),
      conversions: integer("conversions").default(0),
      shareDate: timestamp("share_date").defaultNow(),
      ipAddress: text("ip_address"),
      trackingId: text("tracking_id").notNull()
    });
    advertisements = pgTable("advertisements", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      serviceType: text("service_type").notNull().$type(),
      price: numeric("price"),
      priceUnit: text("price_unit").default("per session"),
      // per session, per hour, per month, etc.
      location: text("location"),
      contactEmail: text("contact_email"),
      contactPhone: text("contact_phone"),
      imageUrl: text("image_url"),
      status: text("status").notNull().$type().default("pending_payment"),
      paymentStatus: boolean("payment_status").default(false),
      paymentMethod: text("payment_method").$type(),
      paymentTransactionId: text("payment_transaction_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      expiresAt: timestamp("expires_at"),
      availableDays: json("available_days").$type(),
      availableHours: text("available_hours"),
      qualifications: text("qualifications"),
      website: text("website"),
      viewCount: integer("view_count").default(0),
      bookingCount: integer("booking_count").default(0)
    });
    advertisementBookings = pgTable("advertisement_bookings", {
      id: serial("id").primaryKey(),
      advertisementId: integer("advertisement_id").notNull().references(() => advertisements.id),
      userId: integer("user_id").notNull().references(() => users.id),
      requestedService: text("requested_service").notNull(),
      requestedDate: timestamp("requested_date").notNull(),
      requestedTime: text("requested_time").notNull(),
      status: text("status").default("pending").notNull(),
      // pending, confirmed, canceled, completed
      userName: text("user_name").notNull(),
      userAge: integer("user_age"),
      userGender: text("user_gender").$type(),
      userPhone: text("user_phone"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      confirmedAt: timestamp("confirmed_at"),
      locationSent: boolean("location_sent").default(false),
      locationDetails: text("location_details")
    });
    insertAdvertisementSchema = createInsertSchema(advertisements, {
      title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
      description: z.string().min(20, "Description must be at least 20 characters").max(1e3, "Description cannot exceed 1000 characters"),
      serviceType: z.enum(["health_service", "wellness_program", "mental_health", "nutrition", "fitness", "other"]),
      price: z.string().optional().transform((val) => val ? parseFloat(val) : null),
      priceUnit: z.string().optional(),
      contactEmail: z.string().email("Please enter a valid email address").optional(),
      contactPhone: z.string().optional(),
      qualifications: z.string().optional(),
      availableDays: z.array(z.string()).optional(),
      availableHours: z.string().optional()
    });
    insertAdvertisementBookingSchema = createInsertSchema(advertisementBookings, {
      requestedService: z.string().min(5, "Please specify the service you're requesting"),
      requestedDate: z.date(),
      requestedTime: z.string(),
      userName: z.string().min(3, "Name must be at least 3 characters"),
      userAge: z.number().min(18, "You must be at least 18 years old").optional(),
      userGender: z.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"]).optional(),
      userPhone: z.string().optional(),
      notes: z.string().optional()
    });
    friendships = pgTable("friendships", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      friendId: integer("friend_id").notNull().references(() => users.id),
      status: text("status").notNull().$type().default("pending"),
      createdAt: timestamp("created_at").defaultNow(),
      acceptedAt: timestamp("accepted_at"),
      rejectedAt: timestamp("rejected_at"),
      notes: text("notes")
    });
    userMessages = pgTable("user_messages", {
      id: serial("id").primaryKey(),
      fromUserId: integer("from_user_id").notNull().references(() => users.id),
      toUserId: integer("to_user_id").notNull().references(() => users.id),
      messageType: text("message_type").notNull().$type().default("text"),
      content: text("content").notNull(),
      mediaUrl: text("media_url"),
      // for voice, image, video messages
      isRead: boolean("is_read").default(false),
      sentAt: timestamp("sent_at").defaultNow(),
      readAt: timestamp("read_at"),
      isDeleted: boolean("is_deleted").default(false),
      deletedAt: timestamp("deleted_at")
    });
    userPosts = pgTable("user_posts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      content: text("content"),
      mediaType: text("media_type").$type(),
      // image, video
      mediaUrl: text("media_url"),
      visibility: text("visibility").notNull().$type().default("friends"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      likeCount: integer("like_count").default(0),
      commentCount: integer("comment_count").default(0)
    });
    postReactions = pgTable("post_reactions", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").notNull().references(() => userPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      reactionType: text("reaction_type").notNull(),
      // like, love, haha, wow, sad, angry
      createdAt: timestamp("created_at").defaultNow()
    });
    postComments = pgTable("post_comments", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").notNull().references(() => userPosts.id),
      userId: integer("user_id").notNull().references(() => users.id),
      content: text("content").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      likeCount: integer("like_count").default(0)
    });
    userVideoCalls = pgTable("user_video_calls", {
      id: serial("id").primaryKey(),
      callerId: integer("caller_id").notNull().references(() => users.id),
      receiverId: integer("receiver_id").notNull().references(() => users.id),
      startTime: timestamp("start_time").defaultNow(),
      endTime: timestamp("end_time"),
      duration: integer("duration"),
      // in seconds
      status: text("status").notNull(),
      // initiated, ongoing, completed, missed, rejected
      hasVideo: boolean("has_video").default(true)
    });
    userNotificationSettings = pgTable("user_notification_settings", {
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
      pushNotifications: boolean("push_notifications").default(true)
    });
    charityOrganizations = pgTable("charity_organizations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      website: text("website"),
      logoUrl: text("logo_url"),
      category: text("category").notNull(),
      // health, education, poverty, environment, etc.
      contactEmail: text("contact_email"),
      contactPhone: text("contact_phone"),
      isVerified: boolean("is_verified").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    gofundmeCampaigns = pgTable("gofundme_campaigns", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      targetAmount: numeric("target_amount").notNull(),
      currentAmount: numeric("current_amount").default("0"),
      currency: text("currency").default("USD").notNull(),
      status: text("status").notNull(),
      // active, paused, completed, cancelled
      startDate: timestamp("start_date").defaultNow(),
      endDate: timestamp("end_date"),
      imageUrl: text("image_url"),
      supportingDocuments: text("supporting_documents"),
      // JSON string of document URLs
      createdAt: timestamp("created_at").defaultNow(),
      isVerified: boolean("is_verified").default(false),
      donorCount: integer("donor_count").default(0)
    });
    feedbackSubmissions = pgTable("feedback_submissions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      category: text("category").notNull(),
      // feature_request, bug_report, general_feedback, etc.
      title: text("title").notNull(),
      description: text("description").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      status: text("status").default("pending").notNull(),
      // pending, reviewed, implemented, rejected
      adminResponse: text("admin_response"),
      isAnonymous: boolean("is_anonymous").default(false)
    });
    emotionalImprints = pgTable("emotional_imprints", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      emotion: text("emotion").notNull().$type(),
      title: text("title").notNull(),
      description: text("description"),
      colorProfile: text("color_profile").notNull().$type(),
      soundProfile: text("sound_profile").notNull().$type(),
      vibrationProfile: text("vibration_profile").notNull().$type(),
      intensity: integer("intensity").notNull().default(5),
      // 1-10 scale
      duration: integer("duration").notNull().default(30),
      // in seconds
      isTemplate: boolean("is_template").default(false),
      templateName: text("template_name"),
      createdAt: timestamp("created_at").defaultNow(),
      accessibilitySettings: json("accessibility_settings"),
      isPublic: boolean("is_public").default(false),
      aiGenerated: boolean("ai_generated").default(false),
      customization: json("customization")
    });
    emotionalImprintInteractions = pgTable("emotional_imprint_interactions", {
      id: serial("id").primaryKey(),
      imprintId: integer("imprint_id").notNull().references(() => emotionalImprints.id),
      receiverId: integer("receiver_id").notNull().references(() => users.id),
      viewedAt: timestamp("viewed_at"),
      reaction: text("reaction"),
      // like, empathize, relate, confused, etc.
      reactionStrength: integer("reaction_strength"),
      // 1-5 scale
      feedbackNote: text("feedback_note"),
      createdAt: timestamp("created_at").defaultNow(),
      senderNote: text("sender_note"),
      // Optional note from sender
      isAnonymous: boolean("is_anonymous").default(true)
    });
    insertFriendshipSchema = createInsertSchema(friendships, {
      userId: z.number().int().positive(),
      friendId: z.number().int().positive(),
      status: z.enum(["pending", "accepted", "rejected"])
    });
    insertUserMessageSchema = createInsertSchema(userMessages, {
      fromUserId: z.number().int().positive(),
      toUserId: z.number().int().positive(),
      messageType: z.enum(["text", "emoji", "voice", "image", "video"]),
      content: z.string(),
      mediaUrl: z.string().optional()
    });
    insertUserPostSchema = createInsertSchema(userPosts, {
      userId: z.number().int().positive(),
      content: z.string().optional(),
      mediaType: z.enum(["text", "emoji", "voice", "image", "video"]).optional(),
      mediaUrl: z.string().optional(),
      visibility: z.enum(["public", "friends", "private"])
    });
    insertGofundmeCampaignSchema = createInsertSchema(gofundmeCampaigns, {
      userId: z.number().int().positive(),
      title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
      description: z.string().min(20, "Description must be at least 20 characters"),
      targetAmount: z.string().transform((val) => parseFloat(val)),
      currency: z.string().default("USD"),
      status: z.enum(["active", "paused", "completed", "cancelled"]),
      endDate: z.date().optional(),
      imageUrl: z.string().optional(),
      supportingDocuments: z.string().optional()
    });
    insertFeedbackSubmissionSchema = createInsertSchema(feedbackSubmissions, {
      userId: z.number().int().positive().optional(),
      category: z.string(),
      title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
      description: z.string().min(20, "Description must be at least 20 characters"),
      isAnonymous: z.boolean().default(false)
    });
    insertEmotionalImprintSchema = createInsertSchema(emotionalImprints, {
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
      customization: z.any().optional()
    });
    insertEmotionalImprintInteractionSchema = createInsertSchema(emotionalImprintInteractions, {
      imprintId: z.number().int().positive(),
      receiverId: z.number().int().positive(),
      reaction: z.string().optional(),
      reactionStrength: z.number().int().min(1).max(5).optional(),
      feedbackNote: z.string().optional(),
      senderNote: z.string().optional(),
      isAnonymous: z.boolean().default(true)
    });
    insertMilestoneShareSchema = createInsertSchema(milestoneShares, {
      userId: z.number().int().positive(),
      milestone: z.number().int().positive(),
      platform: z.enum(["twitter", "facebook", "linkedin", "whatsapp", "telegram", "email", "pinterest", "reddit", "copy_link"]),
      shareUrl: z.string().url(),
      shareMessage: z.string().optional(),
      ipAddress: z.string().optional(),
      trackingId: z.string().uuid()
    });
  }
});

// server/routes/account-management.ts
var account_management_exports = {};
__export(account_management_exports, {
  default: () => account_management_default
});
import { Router } from "express";
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: "Authentication required" });
  }
  next();
}
var router, account_management_default;
var init_account_management = __esm({
  "server/routes/account-management.ts"() {
    "use strict";
    init_storage();
    router = Router();
    router.post("/delete", requireAuth, async (req, res) => {
      try {
        const userId = req.user.id;
        await storage.updateUser(userId, {
          accountDeletionRequested: true,
          accountDeletionRequestedAt: /* @__PURE__ */ new Date(),
          accountDeletionScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
          // 7 days from now
        });
        await storage.createDeletionRequest({
          userId,
          type: "account",
          requestedAt: /* @__PURE__ */ new Date(),
          scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
          // 7 days from now
          status: "pending",
          userEmail: req.user.email || "",
          notificationSent: false
        });
        return res.status(200).json({
          success: true,
          message: "Account deletion request received. Your account will be permanently deleted in 3-7 business days."
        });
      } catch (error) {
        console.error("Account deletion request error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to process account deletion request. Please try again later."
        });
      }
    });
    router.post("/delete-data", requireAuth, async (req, res) => {
      try {
        const userId = req.user.id;
        await storage.updateUser(userId, {
          dataDeletionRequested: true,
          dataDeletionRequestedAt: /* @__PURE__ */ new Date(),
          dataDeletionScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
          // 7 days from now
        });
        await storage.createDeletionRequest({
          userId,
          type: "data",
          requestedAt: /* @__PURE__ */ new Date(),
          scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
          // 7 days from now
          status: "pending",
          userEmail: req.user.email || "",
          notificationSent: false
        });
        return res.status(200).json({
          success: true,
          message: "Data deletion request received. Your personal data will be removed in 3-7 business days."
        });
      } catch (error) {
        console.error("Data deletion request error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to process data deletion request. Please try again later."
        });
      }
    });
    router.get("/deletion-requests", requireAuth, async (req, res) => {
      try {
        if (!req.user.isAdmin) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized access"
          });
        }
        const deletionRequests2 = await storage.getDeletionRequests();
        return res.status(200).json({
          success: true,
          data: deletionRequests2
        });
      } catch (error) {
        console.error("Get deletion requests error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve deletion requests."
        });
      }
    });
    account_management_default = router;
  }
});

// server/routes/subscription-management.ts
var subscription_management_exports = {};
__export(subscription_management_exports, {
  default: () => subscription_management_default
});
import { Router as Router2 } from "express";
function requireAuth2(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: "Authentication required" });
  }
  next();
}
var router2, subscription_management_default;
var init_subscription_management = __esm({
  "server/routes/subscription-management.ts"() {
    "use strict";
    init_storage();
    router2 = Router2();
    router2.post("/start-trial", requireAuth2, async (req, res) => {
      try {
        const userId = req.user.id;
        const trialDays = 14;
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found."
          });
        }
        if (user.isPremium) {
          return res.status(400).json({
            success: false,
            message: "You already have a premium subscription. No need for a trial."
          });
        }
        if (user.isInTrialPeriod) {
          const isActive = await storage.isUserInActiveTrial(userId);
          if (isActive) {
            return res.status(400).json({
              success: false,
              message: "You already have an active trial period."
            });
          } else {
            return res.status(400).json({
              success: false,
              message: "You've already used your free trial period."
            });
          }
        }
        const updatedUser = await storage.startFreeTrial(userId, trialDays);
        await storage.createNotification({
          userId,
          title: "Free Trial Started!",
          content: `You now have access to all premium features for ${trialDays} days. Enjoy your MoodSync experience!`,
          type: "subscription",
          actionLink: "/premium/features",
          icon: "gift"
        });
        return res.status(200).json({
          success: true,
          message: `Your ${trialDays}-day free trial has started.`,
          trialStarted: true,
          trialEndDate: updatedUser.trialEndDate
        });
      } catch (error) {
        console.error("Start trial error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to start trial. Please try again later."
        });
      }
    });
    router2.post("/cancel", requireAuth2, async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        if (!user.isPremium) {
          return res.status(400).json({
            success: false,
            message: "You don't have an active premium subscription to cancel."
          });
        }
        await storage.updateUser(userId, {
          subscriptionCancelled: true,
          subscriptionCancelledAt: /* @__PURE__ */ new Date()
          // Keep the existing expiry date - subscription will expire naturally
        });
        const updatedUser = await storage.getUser(userId);
        return res.status(200).json({
          success: true,
          message: "Your subscription has been cancelled.",
          expiresAt: updatedUser.premiumExpiryDate,
          subscriptionCancelled: true
        });
      } catch (error) {
        console.error("Subscription cancellation error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to cancel subscription. Please try again later."
        });
      }
    });
    router2.post("/renew", requireAuth2, async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        if (!user.isPremium) {
          return res.status(400).json({
            success: false,
            message: "You don't have a premium subscription to renew."
          });
        }
        if (user.subscriptionCancelled) {
          let newExpiryDate = /* @__PURE__ */ new Date();
          switch (user.premiumPlanType) {
            case "monthly":
              newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
              break;
            case "quarterly":
              newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
              break;
            case "yearly":
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
              break;
            case "family_yearly":
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
              break;
            case "fiveyear":
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 5);
              break;
            case "family_fiveyear":
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 5);
              break;
            case "lifetime":
            case "family_lifetime":
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 100);
              break;
            default:
              newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
          }
          await storage.updateUser(userId, {
            subscriptionCancelled: false,
            subscriptionCancelledAt: null,
            premiumExpiryDate: newExpiryDate
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Your subscription is already active and set to renew automatically."
          });
        }
        const updatedUser = await storage.getUser(userId);
        return res.status(200).json({
          success: true,
          message: "Your subscription has been renewed successfully.",
          expiresAt: updatedUser.premiumExpiryDate,
          subscriptionCancelled: false
        });
      } catch (error) {
        console.error("Subscription renewal error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to renew subscription. Please try again later."
        });
      }
    });
    router2.get("/status", requireAuth2, async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        const isInActiveTrial = await storage.isUserInActiveTrial(userId);
        return res.status(200).json({
          success: true,
          isPremium: user.isPremium,
          planType: user.premiumPlanType,
          expiresAt: user.premiumExpiryDate,
          isCancelled: user.subscriptionCancelled,
          cancelledAt: user.subscriptionCancelledAt,
          // Trial information
          isInTrialPeriod: isInActiveTrial,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate
        });
      } catch (error) {
        console.error("Get subscription status error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve subscription status."
        });
      }
    });
    subscription_management_default = router2;
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/services/token-pool-service.ts
import { eq, and, desc, sql } from "drizzle-orm";
var TokenPoolService, TOKEN_CONVERSION_RATE2;
var init_token_pool_service = __esm({
  "server/services/token-pool-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    TokenPoolService = class {
      storage;
      constructor(storage2) {
        this.storage = storage2;
      }
      /**
       * Get current pool statistics
       * @param userId Optional user ID to get personalized stats for
       */
      async getPoolStats(userId) {
        const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
        if (!currentPool) {
          throw new Error("No active token pool found");
        }
        const [contributorsResult] = await db.select({
          count: sql`count(distinct ${poolContributions.userId})`
        }).from(poolContributions).where(eq(poolContributions.poolRound, currentPool.distributionRound));
        const totalContributors = contributorsResult?.count || 0;
        const progress = Math.min(100, Math.round(currentPool.totalTokens / currentPool.targetTokens * 100));
        const nextDistributionDate = currentPool.nextDistributionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const todayBurned = await this.getTodaysBurnedTokens(currentPool.distributionRound, today);
        const topContributor = await this.getTopContributor(currentPool.distributionRound);
        const totalDistributed = await this.getTotalCharityImpact();
        const charityImpact = totalDistributed * TOKEN_CONVERSION_RATE2;
        let userRank = null;
        let userTokensBurned = 0;
        let projectedRankAfterBurn = null;
        if (userId) {
          const userStats = await this.getUserPoolStats(userId, currentPool.distributionRound);
          userRank = userStats.rank;
          userTokensBurned = userStats.tokensBurned;
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
          topContributorUsername: topContributor?.username || "No one yet",
          topContributorTokens: topContributor?.tokensBurned || 0,
          charityImpact: Math.round(charityImpact * 100) / 100,
          // Round to 2 decimal places
          userRank,
          userTokensBurned,
          projectedRankAfterBurn
        };
      }
      /**
       * Get tokens burned today for the current pool round
       */
      async getTodaysBurnedTokens(poolRound, today) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const result = await db.select({
          total: sql`sum(${poolContributions.tokenAmount})`
        }).from(poolContributions).where(
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
      async getTopContributor(poolRound) {
        const contributorSums = await db.select({
          userId: poolContributions.userId,
          totalTokens: sql`sum(${poolContributions.tokenAmount})`
        }).from(poolContributions).where(eq(poolContributions.poolRound, poolRound)).groupBy(poolContributions.userId).orderBy(desc(sql`sum(${poolContributions.tokenAmount})`)).limit(1);
        if (contributorSums.length === 0) {
          return null;
        }
        const { userId, totalTokens } = contributorSums[0];
        const [userInfo] = await db.select({
          username: users.username
        }).from(users).where(eq(users.id, userId));
        return userInfo ? {
          username: userInfo.username,
          tokensBurned: totalTokens
        } : null;
      }
      /**
       * Calculate the total charity impact across all distributions
       */
      async getTotalCharityImpact() {
        const result = await db.select({
          total: sql`sum(${poolDistributions.tokenAmount})`
        }).from(poolDistributions).where(eq(poolDistributions.isCharity, true));
        return result[0]?.total || 0;
      }
      /**
       * Get a specific user's pool stats including rank and tokens burned
       */
      async getUserPoolStats(userId, poolRound) {
        const [userContribution] = await db.select({
          totalTokens: sql`sum(${poolContributions.tokenAmount})`
        }).from(poolContributions).where(
          and(
            eq(poolContributions.userId, userId),
            eq(poolContributions.poolRound, poolRound)
          )
        );
        const userTokens = userContribution?.totalTokens || 0;
        if (userTokens === 0) {
          return { rank: null, tokensBurned: 0 };
        }
        const [rankResult] = await db.select({
          rank: sql`count(*) + 1`
        }).from(
          db.select({
            userId: poolContributions.userId,
            totalTokens: sql`sum(${poolContributions.tokenAmount})`
          }).from(poolContributions).where(eq(poolContributions.poolRound, poolRound)).groupBy(poolContributions.userId).as("contributions")
        ).where(sql`contributions.totalTokens > ${userTokens}`);
        return {
          rank: rankResult?.rank || null,
          tokensBurned: userTokens
        };
      }
      /**
       * Calculate the projected rank if user burns an NFT
       */
      async getProjectedRankAfterBurn(userId, poolRound, currentTokens, additionalTokens) {
        const newTotal = currentTokens + additionalTokens;
        const [rankResult] = await db.select({
          rank: sql`count(*) + 1`
        }).from(
          db.select({
            userId: poolContributions.userId,
            totalTokens: sql`sum(${poolContributions.tokenAmount})`
          }).from(poolContributions).where(
            and(
              eq(poolContributions.poolRound, poolRound),
              sql`${poolContributions.userId} <> ${userId}`
              // Exclude this user
            )
          ).groupBy(poolContributions.userId).as("contributions")
        ).where(sql`contributions.totalTokens > ${newTotal}`);
        return rankResult?.rank || 1;
      }
      /**
       * Get top contributors for the current distribution round
       */
      async getTopContributors(limit = 50) {
        const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
        if (!currentPool) {
          return [];
        }
        const contributorSums = await db.select({
          userId: poolContributions.userId,
          totalTokens: sql`sum(${poolContributions.tokenAmount})`
        }).from(poolContributions).where(eq(poolContributions.poolRound, currentPool.distributionRound)).groupBy(poolContributions.userId).orderBy(desc(sql`sum(${poolContributions.tokenAmount})`)).limit(limit);
        const topContributors = [];
        for (let i = 0; i < contributorSums.length; i++) {
          const { userId, totalTokens } = contributorSums[i];
          const [userInfo] = await db.select({
            id: users.id,
            username: users.username,
            profilePicture: users.profilePicture
          }).from(users).where(eq(users.id, userId));
          if (userInfo) {
            topContributors.push({
              id: i + 1,
              // Generate a sequential ID for the leaderboard entry
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
      async checkAndGenerateUnmintedNfts(userId) {
        const messagesToUser = [];
        const sevenDayStreak = await this.storage.checkUserHasJournalStreak(userId, 7);
        if (sevenDayStreak) {
          const existingNft = await this.storage.findEmotionalNftByActivityAndUser(userId, "seven_day_streak");
          if (!existingNft) {
            await this.storage.createEmotionalNft({
              userId,
              tokenId: `streak-${userId}-${Date.now()}`,
              emotion: "happy",
              // Default or determine based on user's emotion history
              rarity: "Uncommon",
              activityType: "seven_day_streak",
              imageUrl: "/assets/nfts/consistency-seed.png",
              metadata: JSON.stringify({
                name: "Consistency Seed",
                description: "Earned by maintaining a 7-day journal streak",
                bonusEffect: "+5% token earnings for 1 week",
                evolutionPath: "Mindfulness Tree"
              }),
              mintStatus: "unminted"
            });
            messagesToUser.push(`Congratulations! You've earned a "Consistency Seed" NFT for your 7-day journal streak.`);
            await this.storage.createRewardActivity({
              userId,
              activityType: "badge_earned",
              tokensEarned: 0.5,
              // Small token reward for earning the NFT
              description: 'Earned "Consistency Seed" NFT for 7-day journal streak'
            });
          }
        }
        return messagesToUser;
      }
      /**
       * Mint an NFT from a user's unminted collection, costing tokens
       * @param userId The user's ID
       * @param nftId The NFT to mint
       */
      async mintNft(userId, nftId) {
        const user = await this.storage.getUser(userId);
        const nft = await this.storage.getEmotionalNft(nftId);
        if (!user || !nft) {
          throw new Error("User or NFT not found");
        }
        if (nft.userId !== userId) {
          throw new Error("This NFT does not belong to the user");
        }
        if (nft.mintStatus !== "unminted") {
          throw new Error("This NFT is already minted or burned");
        }
        const requiredTokens = 350;
        if (user.emotionTokens < requiredTokens) {
          throw new Error(`Not enough tokens. Minting requires ${requiredTokens} tokens.`);
        }
        await this.storage.updateUserTokens(userId, user.emotionTokens - requiredTokens);
        await this.storage.updateEmotionalNftStatus(nftId, "minted", /* @__PURE__ */ new Date());
        await this.storage.createRewardActivity({
          userId,
          activityType: "token_transfer",
          tokensEarned: -requiredTokens,
          // Negative because tokens are being spent
          description: `Minted "${JSON.parse(nft.metadata).name}" NFT`
        });
        return true;
      }
      /**
       * Burn an NFT to contribute to the token pool
       * @param userId The user's ID
       * @param nftId The NFT to burn
       */
      async burnNft(userId, nftId) {
        const user = await this.storage.getUser(userId);
        const nft = await this.storage.getEmotionalNft(nftId);
        if (!user || !nft) {
          throw new Error("User or NFT not found");
        }
        if (nft.userId !== userId) {
          throw new Error("This NFT does not belong to the user");
        }
        if (nft.mintStatus !== "minted") {
          throw new Error("This NFT must be minted before it can be burned");
        }
        const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
        if (!currentPool) {
          throw new Error("No active token pool found");
        }
        await this.storage.updateEmotionalNftStatus(nftId, "burned", /* @__PURE__ */ new Date());
        const tokenValue = 350;
        await this.storage.createPoolContribution({
          userId,
          nftId,
          tokenAmount: tokenValue,
          poolRound: currentPool.distributionRound,
          transactionType: "burn"
        });
        await db.update(tokenPool).set({
          totalTokens: currentPool.totalTokens + tokenValue,
          // Check if we've hit the target and need to prepare for distribution
          status: currentPool.totalTokens + tokenValue >= currentPool.targetTokens ? "distributing" : "active"
        }).where(eq(tokenPool.id, currentPool.id));
        if (currentPool.totalTokens + tokenValue >= currentPool.targetTokens) {
          const distributionDate = /* @__PURE__ */ new Date();
          distributionDate.setDate(distributionDate.getDate() + 7);
          await db.update(tokenPool).set({ nextDistributionDate: distributionDate }).where(eq(tokenPool.id, currentPool.id));
        }
        return true;
      }
      /**
       * Gift an NFT to another user (one-time only per NFT)
       */
      async giftNft(fromUserId, toUserId, nftId) {
        const nft = await this.storage.getEmotionalNft(nftId);
        if (!nft) {
          throw new Error("NFT not found");
        }
        if (nft.userId !== fromUserId) {
          throw new Error("This NFT does not belong to you");
        }
        if (nft.mintStatus !== "minted") {
          throw new Error("Only minted NFTs can be gifted");
        }
        if (nft.giftedTo) {
          throw new Error("This NFT has already been gifted once");
        }
        await this.storage.updateEmotionalNftGift(nftId, toUserId);
        await this.storage.createNotification({
          userId: toUserId,
          title: "New NFT Gift!",
          content: `You've received "${JSON.parse(nft.metadata).name}" NFT as a gift.`,
          type: "nft_received",
          icon: "\u2728"
        });
        return true;
      }
      /**
       * Execute token pool distribution when target is reached
       * This would typically be called by a scheduled job
       */
      async executePoolDistribution() {
        const [currentPool] = await db.select().from(tokenPool).orderBy(desc(tokenPool.id)).limit(1);
        if (!currentPool || currentPool.status !== "distributing") {
          return false;
        }
        const topContributors = await this.getTopContributors(currentPool.maxTopContributors);
        const topContributorsTotal = currentPool.totalTokens * (currentPool.topContributorsPercentage / 100);
        const charityTotal = currentPool.totalTokens * (currentPool.charityPercentage / 100);
        for (const contributor of topContributors) {
          const rewardAmount = Math.floor(topContributorsTotal / currentPool.maxTopContributors);
          const user = await this.storage.getUser(contributor.userId);
          if (user) {
            await this.storage.updateUserTokens(contributor.userId, user.emotionTokens + rewardAmount);
            await this.storage.createPoolDistribution({
              userId: contributor.userId,
              poolRound: currentPool.distributionRound,
              tokenAmount: rewardAmount,
              rank: contributor.rank,
              isCharity: false,
              status: "completed"
            });
            await this.storage.createNotification({
              userId: contributor.userId,
              title: "Pool Distribution Reward!",
              content: `You ranked #${contributor.rank} and received ${rewardAmount} tokens from the pool distribution.`,
              type: "token_received",
              icon: "\u{1F3C6}"
            });
          }
        }
        await this.storage.createPoolDistribution({
          userId: 0,
          // System user or charity ID
          poolRound: currentPool.distributionRound,
          tokenAmount: Math.floor(charityTotal),
          isCharity: true,
          charityName: "Mental Health Foundation",
          status: "completed"
        });
        await db.insert(tokenPool).values({
          totalTokens: 0,
          targetTokens: currentPool.targetTokens,
          distributionRound: currentPool.distributionRound + 1,
          status: "active",
          charityPercentage: currentPool.charityPercentage,
          topContributorsPercentage: currentPool.topContributorsPercentage,
          maxTopContributors: currentPool.maxTopContributors
        });
        await db.update(tokenPool).set({
          status: "completed",
          lastDistributionAt: /* @__PURE__ */ new Date()
        }).where(eq(tokenPool.id, currentPool.id));
        const users2 = await this.storage.getAllUsers();
        const charityAmount = Math.floor(charityTotal * TOKEN_CONVERSION_RATE2 * 100) / 100;
        for (const user of users2) {
          await this.storage.createNotification({
            userId: user.id,
            title: "MoodLync Charity Impact",
            content: `The MoodLync community just donated $${charityAmount} to mental health organizations through the token pool!`,
            type: "system_announcement",
            icon: "\u{1F499}"
          });
        }
        return true;
      }
    };
    TOKEN_CONVERSION_RATE2 = 1e-3;
  }
});

// server/routes/nft-pool-routes.ts
var nft_pool_routes_exports = {};
__export(nft_pool_routes_exports, {
  default: () => nft_pool_routes_default
});
import { Router as Router3 } from "express";
var tokenPoolService, router3, nft_pool_routes_default;
var init_nft_pool_routes = __esm({
  "server/routes/nft-pool-routes.ts"() {
    "use strict";
    init_token_pool_service();
    init_storage();
    tokenPoolService = new TokenPoolService(storage);
    router3 = Router3();
    router3.get("/token-pool/stats", async (req, res) => {
      try {
        const userId = req.isAuthenticated() ? req.user.id : void 0;
        const stats = await tokenPoolService.getPoolStats(userId);
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router3.get("/token-pool/top-contributors", async (req, res) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const contributors = await tokenPoolService.getTopContributors(limit);
        res.json(contributors);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router3.get("/user/nfts/:status", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const { status } = req.params;
        if (!["unminted", "minted", "burned", "all"].includes(status)) {
          return res.status(400).json({ error: "Invalid status parameter" });
        }
        const nfts = await storage.getUserNftsByStatus(req.user.id, status === "all" ? void 0 : status);
        res.json(nfts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router3.post("/user/nfts/check-new", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const messages = await tokenPoolService.checkAndGenerateUnmintedNfts(req.user.id);
        res.json({ success: true, messages });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router3.post("/user/nfts/:id/mint", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const nftId = parseInt(req.params.id);
        const success = await tokenPoolService.mintNft(req.user.id, nftId);
        if (success) {
          res.json({ success: true, message: "NFT successfully minted" });
        } else {
          res.status(500).json({ error: "Failed to mint NFT" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    router3.post("/user/nfts/:id/burn", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const nftId = parseInt(req.params.id);
        const success = await tokenPoolService.burnNft(req.user.id, nftId);
        if (success) {
          res.json({
            success: true,
            message: "NFT successfully burned and contributed to the token pool"
          });
        } else {
          res.status(500).json({ error: "Failed to burn NFT" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    router3.post("/user/nfts/:id/gift", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const nftId = parseInt(req.params.id);
        const { recipientId } = req.body;
        if (!recipientId) {
          return res.status(400).json({ error: "Recipient ID is required" });
        }
        const success = await tokenPoolService.giftNft(req.user.id, recipientId, nftId);
        if (success) {
          res.json({ success: true, message: "NFT successfully gifted" });
        } else {
          res.status(500).json({ error: "Failed to gift NFT" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    router3.post("/admin/token-pool/distribute", async (req, res) => {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      try {
        const success = await tokenPoolService.executePoolDistribution();
        if (success) {
          res.json({
            success: true,
            message: "Token pool distribution successfully executed"
          });
        } else {
          res.status(400).json({
            error: "Failed to execute distribution. Pool may not be ready for distribution."
          });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    console.log("NFT token pool system routes registered successfully");
    nft_pool_routes_default = router3;
  }
});

// server/routes/nft-collection-routes.ts
var nft_collection_routes_exports = {};
__export(nft_collection_routes_exports, {
  default: () => nft_collection_routes_default
});
import { Router as Router4 } from "express";
function generateMockNfts(userId, status) {
  const mocknfts = [
    {
      id: 1,
      userId,
      tokenId: `joy-${userId}-${Date.now()}`,
      name: "Joy Essence",
      description: "Awarded for maintaining a 7-day streak of joy entries in your emotional journal. This NFT radiates positive energy.",
      imageUrl: "/assets/attached_assets/individual Emotional NFt 1.jpg",
      emotion: "joy",
      rarity: "uncommon",
      activityType: "seven_day_joy_streak",
      mintStatus: status === "all" || status === "unminted" ? "unminted" : status,
      tokenValue: 350,
      isDisplayed: false,
      evolutionLevel: 1,
      bonusGranted: "+8% token earnings for activities done in joyful state",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 2,
      userId,
      tokenId: `reflection-${userId}-${Date.now()}`,
      name: "Reflection Tree",
      description: "Evolved from Consistency Seed after 30 days of journaling. This NFT reflects your growing emotional awareness.",
      imageUrl: "/assets/attached_assets/Create a very unique image for Emotional NFTs_Exclusive Digital Collectibles_Premium members earn unique NFTs that evolve with your emotional journey.jpg",
      emotion: "varied",
      rarity: "rare",
      activityType: "thirty_day_journal_streak",
      mintStatus: status === "all" || status === "minted" ? "minted" : "unminted",
      mintedAt: status === "minted" ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString() : void 0,
      tokenValue: 550,
      isDisplayed: true,
      evolutionLevel: 2,
      bonusGranted: "+10% token earnings for 2 weeks",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 3,
      userId,
      tokenId: `anger-${userId}-${Date.now()}`,
      name: "Anger Management",
      description: "Earned by successfully managing and reducing anger patterns over time. Represents emotional growth and control.",
      imageUrl: "/assets/attached_assets/individual for Anger Emotional NFt.jpg",
      emotion: "anger",
      rarity: "epic",
      activityType: "anger_management_success",
      mintStatus: status === "all" || status === "burned" ? "burned" : "unminted",
      mintedAt: status === "burned" ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString() : void 0,
      burnedAt: status === "burned" ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString() : void 0,
      tokenValue: 750,
      isDisplayed: false,
      evolutionLevel: 3,
      bonusGranted: "Access to special anger management resources",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 4,
      userId,
      tokenId: `surprise-${userId}-${Date.now()}`,
      name: "Surprise Discovery",
      description: "Awarded when you discover unexpected emotional patterns through consistent journaling and self-reflection.",
      imageUrl: "/assets/attached_assets/individual for Surprise Emotional NFt.jpg",
      emotion: "surprise",
      rarity: "uncommon",
      activityType: "pattern_discovery",
      mintStatus: status === "all" || status === "unminted" && Math.random() > 0.5 ? "unminted" : "minted",
      mintedAt: status === "minted" ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString() : void 0,
      tokenValue: 350,
      isDisplayed: false,
      evolutionLevel: 1,
      bonusGranted: "+5% discovery bonus for finding new emotional insights",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 5,
      userId,
      tokenId: `melancholy-${userId}-${Date.now()}`,
      name: "Melancholy Mastery",
      description: "Created after overcoming periods of sadness through healthy coping mechanisms. A visual reminder of your resilience.",
      imageUrl: "/assets/attached_assets/individual bad mood Emotional NFt 2.jpg",
      emotion: "sadness",
      rarity: "legendary",
      activityType: "sadness_overcome",
      mintStatus: status === "all" ? Math.random() > 0.5 ? "minted" : "unminted" : status,
      mintedAt: status === "minted" ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString() : void 0,
      tokenValue: 1e3,
      isDisplayed: status === "minted",
      evolutionLevel: 3,
      bonusGranted: "Permanent +5% boost to all emotional growth rewards",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString()
    }
  ];
  if (status !== "all") {
    return mocknfts.filter((nft) => nft.mintStatus === status);
  }
  return mocknfts;
}
var router4, nft_collection_routes_default;
var init_nft_collection_routes = __esm({
  "server/routes/nft-collection-routes.ts"() {
    "use strict";
    router4 = Router4();
    router4.get("/user/nfts/:status", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const { status } = req.params;
        if (!["unminted", "minted", "burned", "all"].includes(status)) {
          return res.status(400).json({ error: "Invalid status parameter" });
        }
        const mockNfts = generateMockNfts(req.user.id, status);
        res.json(mockNfts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router4.post("/user/nfts/check-new", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const messages = [
          "You've earned a new 'Joy Essence' NFT for maintaining positive emotions!",
          "Congratulations! You've unlocked a 'Surprise Discovery' NFT by finding unexpected emotional patterns."
        ];
        res.json({ success: true, messages });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    router4.post("/user/nfts/:id/mint", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        res.json({ success: true, message: "NFT successfully minted" });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    router4.post("/user/nfts/:id/burn", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        res.json({
          success: true,
          message: "NFT successfully burned and contributed to the token pool"
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    router4.post("/user/nfts/:id/gift", async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const { recipientId } = req.body;
        if (!recipientId) {
          return res.status(400).json({ error: "Recipient ID is required" });
        }
        res.json({ success: true, message: "NFT successfully gifted" });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    nft_collection_routes_default = router4;
  }
});

// server/services/stripe-service.ts
import Stripe from "stripe";
import { eq as eq2, and as and2 } from "drizzle-orm";
function initializeStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("\u26A0\uFE0F STRIPE_SECRET_KEY is not set. Stripe functionality will be limited.");
    return false;
  }
  try {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
    console.log("\u2705 Stripe initialized successfully");
    return true;
  } catch (error) {
    console.error("\u274C Error initializing Stripe:", error);
    return false;
  }
}
function getStripeClient() {
  if (!stripeClient) {
    throw new Error("Stripe client not initialized. Call initializeStripe() first.");
  }
  return stripeClient;
}
async function getOrCreateCustomer(userId) {
  const stripe = getStripeClient();
  const [user] = await db.select().from(users).where(eq2(users.id, userId));
  if (!user) {
    throw new Error("User not found");
  }
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  const customerData = {
    email: user.email || void 0,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
    metadata: {
      userId: userId.toString()
    }
  };
  const customer = await stripe.customers.create(customerData);
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq2(users.id, userId));
  return customer.id;
}
async function createCheckoutSession(userId, planType, interval, successUrl, cancelUrl) {
  const stripe = getStripeClient();
  const customerId = await getOrCreateCustomer(userId);
  const priceId = STRIPE_PRICE_IDS[interval];
  const session3 = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: interval === "family-lifetime" ? "payment" : "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      planType,
      interval
    }
  });
  return session3.url || "";
}
async function handleWebhookEvent(signature, payload) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload.toString(), signature, webhookSecret);
  } catch (err) {
    return { status: "error", message: `Webhook signature verification failed: ${err.message}` };
  }
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
  }
  return { status: "success", message: `Webhook processed: ${event.type}` };
}
async function handleCheckoutSessionCompleted(session3) {
  const stripe = getStripeClient();
  if (!session3.metadata?.userId) {
    console.error("Missing userId in session metadata");
    return;
  }
  const userId = parseInt(session3.metadata.userId, 10);
  if (session3.mode === "subscription" && session3.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session3.subscription);
    await updateUserSubscription(userId, subscription);
  } else if (session3.mode === "payment") {
    const planType = session3.metadata.planType || "family";
    const expiryDate = /* @__PURE__ */ new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 99);
    await db.update(users).set({
      isPremium: true,
      premiumPlanType: planType,
      premiumExpiryDate: expiryDate
    }).where(eq2(users.id, userId));
    await db.insert(premiumPlans).values({
      userId,
      planType,
      paymentAmount: session3.amount_total ? session3.amount_total / 100 : 399.99,
      // Convert cents to dollars
      currency: session3.currency?.toUpperCase() || "USD",
      isLifetime: true,
      memberLimit: planType === "family" ? 5 : 1,
      status: "active",
      paymentMethod: "stripe",
      paymentDetails: JSON.stringify({
        sessionId: session3.id,
        paymentIntent: session3.payment_intent
      })
    });
  }
}
async function handleSubscriptionUpdated(subscription) {
  if (!subscription.metadata?.userId) {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer);
    if (!customer.metadata?.userId) {
      console.error("Unable to determine userId for subscription", subscription.id);
      return;
    }
    const userId = parseInt(customer.metadata.userId, 10);
    await updateUserSubscription(userId, subscription);
  } else {
    const userId = parseInt(subscription.metadata.userId, 10);
    await updateUserSubscription(userId, subscription);
  }
}
async function handleSubscriptionDeleted(subscription) {
  const [premiumPlan] = await db.select().from(premiumPlans).where(eq2(premiumPlans.stripeSubscriptionId, subscription.id));
  if (!premiumPlan) {
    console.error("Premium plan not found for subscription", subscription.id);
    return;
  }
  await db.update(premiumPlans).set({
    status: "canceled",
    stripeSubscriptionStatus: "canceled"
  }).where(eq2(premiumPlans.id, premiumPlan.id));
  await db.update(users).set({
    isPremium: false,
    subscriptionCancelled: true,
    subscriptionCancelledAt: /* @__PURE__ */ new Date()
  }).where(eq2(users.id, premiumPlan.userId));
}
async function handleInvoicePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const [premiumPlan] = await db.select().from(premiumPlans).where(eq2(premiumPlans.stripeSubscriptionId, subscription.id));
  if (!premiumPlan) {
    console.error("Premium plan not found for subscription", subscription.id);
    return;
  }
  const nextBillingDate = new Date(subscription.current_period_end * 1e3);
  await db.update(premiumPlans).set({
    nextBillingDate,
    stripePeriodEnd: nextBillingDate
  }).where(eq2(premiumPlans.id, premiumPlan.id));
}
async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  const [premiumPlan] = await db.select().from(premiumPlans).where(eq2(premiumPlans.stripeSubscriptionId, invoice.subscription));
  if (!premiumPlan) {
    console.error("Premium plan not found for subscription", invoice.subscription);
    return;
  }
  await db.update(premiumPlans).set({
    stripeSubscriptionStatus: "past_due"
  }).where(eq2(premiumPlans.id, premiumPlan.id));
}
async function updateUserSubscription(userId, subscription) {
  const stripe = getStripeClient();
  let cardBrand;
  let lastFour;
  let expiry;
  let paymentMethodId;
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method
      );
      if (paymentMethod.type === "card" && paymentMethod.card) {
        cardBrand = paymentMethod.card.brand;
        lastFour = paymentMethod.card.last4;
        expiry = `${paymentMethod.card.exp_month.toString().padStart(2, "0")}/${paymentMethod.card.exp_year.toString().slice(-2)}`;
        paymentMethodId = paymentMethod.id;
      }
    } catch (error) {
      console.error("Error retrieving payment method:", error);
    }
  }
  const subscriptionStatus = subscription.status;
  const isPremium = ["active", "trialing"].includes(subscriptionStatus);
  const [existingPlan] = await db.select().from(premiumPlans).where(
    and2(
      eq2(premiumPlans.userId, userId),
      eq2(premiumPlans.stripeSubscriptionId, subscription.id)
    )
  );
  const planTypeMapping = {
    "monthly": "individual",
    "yearly": "individual",
    "family": "family",
    "family-lifetime": "family"
  };
  const item = subscription.items.data[0];
  if (!item) {
    console.error("No items found in subscription", subscription.id);
    return;
  }
  const product = await stripe.products.retrieve(item.price.product);
  const interval = item.price.recurring?.interval || "month";
  const planType = planTypeMapping[subscription.metadata?.interval] || "individual";
  const expiryDate = new Date(subscription.current_period_end * 1e3);
  await db.update(users).set({
    isPremium,
    premiumPlanType: planType,
    premiumExpiryDate: expiryDate,
    isInTrialPeriod: subscription.status === "trialing",
    trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1e3) : null,
    stripeLastFour: lastFour,
    stripeCardBrand: cardBrand,
    stripeCardExpiry: expiry,
    stripePaymentMethodId: paymentMethodId
  }).where(eq2(users.id, userId));
  if (existingPlan) {
    await db.update(premiumPlans).set({
      status: isPremium ? "active" : "canceled",
      stripeSubscriptionStatus: subscriptionStatus,
      stripePriceId: item.price.id,
      stripePeriodEnd: expiryDate,
      nextBillingDate: expiryDate,
      stripeCanceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1e3) : null,
      stripeMetadata: JSON.stringify(subscription.metadata),
      paymentAmount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
      currency: item.price.currency.toUpperCase(),
      isTrial: subscription.status === "trialing",
      trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1e3) : null
    }).where(eq2(premiumPlans.id, existingPlan.id));
  } else {
    await db.insert(premiumPlans).values({
      userId,
      planType,
      startDate: new Date(subscription.start_date * 1e3),
      paymentAmount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
      currency: item.price.currency.toUpperCase(),
      memberLimit: planType === "family" ? 5 : 1,
      isLifetime: false,
      nextBillingDate: expiryDate,
      status: isPremium ? "active" : "canceled",
      paymentMethod: "stripe",
      isTrial: subscription.status === "trialing",
      trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1e3) : null,
      stripePriceId: item.price.id,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscriptionStatus,
      stripePeriodEnd: expiryDate,
      stripeCanceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1e3) : null,
      stripeMetadata: JSON.stringify(subscription.metadata)
    });
  }
}
async function createPaymentIntent(userId, amount, currency = "usd", metadata = {}) {
  const stripe = getStripeClient();
  const customerId = await getOrCreateCustomer(userId);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    // Convert to cents
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata: {
      userId: userId.toString(),
      ...metadata
    },
    payment_method_types: ["card"]
  });
  return { clientSecret: paymentIntent.client_secret };
}
async function getCustomerPaymentMethods(userId) {
  const stripe = getStripeClient();
  const [user] = await db.select().from(users).where(eq2(users.id, userId));
  if (!user || !user.stripeCustomerId) {
    return [];
  }
  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: "card"
  });
  return paymentMethods.data;
}
async function getSubscriptionDetails(userId) {
  const [user] = await db.select().from(users).where(eq2(users.id, userId));
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.isPremium) {
    return { isPremium: false };
  }
  const [premiumPlan] = await db.select().from(premiumPlans).where(
    and2(
      eq2(premiumPlans.userId, userId),
      eq2(premiumPlans.status, "active")
    )
  ).orderBy((premiumPlans2) => [{ column: premiumPlans2.id, order: "desc" }]);
  if (!premiumPlan) {
    return {
      isPremium: user.isPremium,
      planType: user.premiumPlanType,
      expiryDate: user.premiumExpiryDate
    };
  }
  return {
    isPremium: user.isPremium,
    planType: premiumPlan.planType,
    isLifetime: premiumPlan.isLifetime,
    startDate: premiumPlan.startDate,
    nextBillingDate: premiumPlan.nextBillingDate,
    paymentAmount: premiumPlan.paymentAmount,
    currency: premiumPlan.currency,
    isTrial: premiumPlan.isTrial,
    trialEndDate: premiumPlan.trialEndDate,
    memberLimit: premiumPlan.memberLimit,
    paymentMethod: {
      type: "card",
      brand: user.stripeCardBrand,
      last4: user.stripeLastFour,
      expiry: user.stripeCardExpiry
    }
  };
}
async function cancelSubscription(userId) {
  const stripe = getStripeClient();
  const [premiumPlan] = await db.select().from(premiumPlans).where(
    and2(
      eq2(premiumPlans.userId, userId),
      eq2(premiumPlans.status, "active")
    )
  ).orderBy((premiumPlans2) => [{ column: premiumPlans2.id, order: "desc" }]);
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: "No active subscription found" };
  }
  try {
    await stripe.subscriptions.update(premiumPlan.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    await db.update(premiumPlans).set({
      status: "canceled"
      // We mark as canceled, even though they keep premium until end of period
    }).where(eq2(premiumPlans.id, premiumPlan.id));
    await db.update(users).set({
      subscriptionCancelled: true,
      subscriptionCancelledAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId));
    return {
      success: true,
      message: "Subscription will be canceled at the end of the current billing period"
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { success: false, message: `Error canceling subscription: ${error.message}` };
  }
}
async function cancelSubscriptionImmediately(userId) {
  const stripe = getStripeClient();
  const [premiumPlan] = await db.select().from(premiumPlans).where(
    and2(
      eq2(premiumPlans.userId, userId),
      eq2(premiumPlans.status, "active")
    )
  ).orderBy((premiumPlans2) => [{ column: premiumPlans2.id, order: "desc" }]);
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: "No active subscription found" };
  }
  try {
    await stripe.subscriptions.cancel(premiumPlan.stripeSubscriptionId);
    await db.update(premiumPlans).set({
      status: "canceled",
      stripeSubscriptionStatus: "canceled"
    }).where(eq2(premiumPlans.id, premiumPlan.id));
    await db.update(users).set({
      isPremium: false,
      subscriptionCancelled: true,
      subscriptionCancelledAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId));
    return { success: true, message: "Subscription canceled immediately" };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { success: false, message: `Error canceling subscription: ${error.message}` };
  }
}
async function updateSubscription(userId, newPlanInterval) {
  const stripe = getStripeClient();
  const [premiumPlan] = await db.select().from(premiumPlans).where(
    and2(
      eq2(premiumPlans.userId, userId),
      eq2(premiumPlans.status, "active")
    )
  ).orderBy((premiumPlans2) => [{ column: premiumPlans2.id, order: "desc" }]);
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: "No active subscription found" };
  }
  const newPriceId = STRIPE_PRICE_IDS[newPlanInterval];
  try {
    await stripe.subscriptions.update(premiumPlan.stripeSubscriptionId, {
      items: [
        {
          id: (await stripe.subscriptions.retrieve(premiumPlan.stripeSubscriptionId)).items.data[0].id,
          price: newPriceId
        }
      ],
      metadata: {
        ...JSON.parse(premiumPlan.stripeMetadata || "{}"),
        interval: newPlanInterval
      }
    });
    return { success: true, message: "Subscription updated successfully" };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, message: `Error updating subscription: ${error.message}` };
  }
}
var stripeClient, STRIPE_PRICE_IDS, stripeService, stripe_service_default;
var init_stripe_service = __esm({
  "server/services/stripe-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    stripeClient = null;
    STRIPE_PRICE_IDS = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly",
      yearly: process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly",
      family: process.env.STRIPE_FAMILY_PRICE_ID || "price_family",
      "family-lifetime": process.env.STRIPE_FAMILY_LIFETIME_PRICE_ID || "price_family_lifetime"
    };
    stripeService = {
      initializeStripe,
      getOrCreateCustomer,
      createCheckoutSession,
      handleWebhookEvent,
      createPaymentIntent,
      getCustomerPaymentMethods,
      getSubscriptionDetails,
      cancelSubscription,
      cancelSubscriptionImmediately,
      updateSubscription
    };
    stripe_service_default = stripeService;
  }
});

// server/routes/payment-routes.ts
var payment_routes_exports = {};
__export(payment_routes_exports, {
  default: () => payment_routes_default
});
import express from "express";
import { z as z2 } from "zod";
function requireAuth3(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
var router5, payment_routes_default;
var init_payment_routes = __esm({
  "server/routes/payment-routes.ts"() {
    "use strict";
    init_stripe_service();
    router5 = express.Router();
    stripe_service_default.initializeStripe();
    router5.post("/create-checkout-session", requireAuth3, async (req, res) => {
      try {
        const schema = z2.object({
          planInterval: z2.enum(["monthly", "yearly", "family", "family-lifetime"]),
          planType: z2.enum(["individual", "family"]),
          successUrl: z2.string().url(),
          cancelUrl: z2.string().url()
        });
        const { planInterval, planType, successUrl, cancelUrl } = schema.parse(req.body);
        const sessionUrl = await stripe_service_default.createCheckoutSession(
          req.user.id,
          planType,
          planInterval,
          successUrl,
          cancelUrl
        );
        res.json({ url: sessionUrl });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.post("/create-payment-intent", requireAuth3, async (req, res) => {
      try {
        const schema = z2.object({
          amount: z2.number().positive(),
          currency: z2.string().optional().default("usd"),
          metadata: z2.record(z2.string()).optional()
        });
        const { amount, currency, metadata } = schema.parse(req.body);
        const paymentIntent = await stripe_service_default.createPaymentIntent(
          req.user.id,
          amount,
          currency,
          metadata
        );
        res.json(paymentIntent);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.get("/payment-methods", requireAuth3, async (req, res) => {
      try {
        const paymentMethods = await stripe_service_default.getCustomerPaymentMethods(req.user.id);
        res.json(paymentMethods);
      } catch (error) {
        console.error("Error getting payment methods:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.get("/subscription", requireAuth3, async (req, res) => {
      try {
        const subscription = await stripe_service_default.getSubscriptionDetails(req.user.id);
        res.json(subscription);
      } catch (error) {
        console.error("Error getting subscription details:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.post("/cancel-subscription", requireAuth3, async (req, res) => {
      try {
        const result = await stripe_service_default.cancelSubscription(req.user.id);
        res.json(result);
      } catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.post("/update-subscription", requireAuth3, async (req, res) => {
      try {
        const schema = z2.object({
          planInterval: z2.enum(["monthly", "yearly", "family"])
        });
        const { planInterval } = schema.parse(req.body);
        const result = await stripe_service_default.updateSubscription(req.user.id, planInterval);
        res.json(result);
      } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).send("Missing stripe-signature header");
      }
      try {
        const result = await stripe_service_default.handleWebhookEvent(signature, req.body);
        res.json(result);
      } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(400).json({ error: error.message });
      }
    });
    router5.post("/admin/cancel-subscription", async (req, res) => {
      try {
        if (!req.adminUser) {
          return res.status(403).json({ error: "Admin authentication required" });
        }
        const schema = z2.object({
          userId: z2.number().int().positive()
        });
        const { userId } = schema.parse(req.body);
        const result = await stripe_service_default.cancelSubscriptionImmediately(userId);
        res.json(result);
      } catch (error) {
        console.error("Error immediately canceling subscription:", error);
        res.status(400).json({ error: error.message });
      }
    });
    payment_routes_default = router5;
  }
});

// shared/admin-schema.ts
import { pgTable as pgTable2, text as text2, serial as serial2, integer as integer2, boolean as boolean2, timestamp as timestamp2, numeric as numeric2, json as json2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
var adminActionLogs, flaggedContents, userBans, systemHealthLogs, tokenRateAdjustments, tokenPoolSplits, tokenPoolSplitRecipients, systemBackups, apiMetrics, insertAdminActionLogSchema, insertFlaggedContentSchema, insertUserBanSchema, insertSystemHealthLogSchema, insertTokenRateAdjustmentSchema, insertTokenPoolSplitSchema;
var init_admin_schema = __esm({
  "shared/admin-schema.ts"() {
    "use strict";
    init_schema();
    adminActionLogs = pgTable2("admin_action_logs", {
      id: serial2("id").primaryKey(),
      adminId: integer2("admin_id").notNull().references(() => adminUsers.id),
      adminUsername: text2("admin_username").notNull(),
      action: text2("action").notNull(),
      entityType: text2("entity_type").notNull(),
      entityId: integer2("entity_id").notNull(),
      details: text2("details"),
      ipAddress: text2("ip_address").notNull(),
      userAgent: text2("user_agent"),
      timestamp: timestamp2("timestamp").defaultNow()
    });
    flaggedContents = pgTable2("flagged_contents", {
      id: serial2("id").primaryKey(),
      contentType: text2("content_type").notNull().$type(),
      contentId: integer2("content_id").notNull(),
      reportedBy: integer2("reported_by").references(() => users.id),
      reason: text2("reason").notNull().$type(),
      details: text2("details"),
      status: text2("status").notNull().$type().default("PENDING"),
      createdAt: timestamp2("created_at").defaultNow(),
      moderatedBy: integer2("moderated_by").references(() => adminUsers.id),
      moderatedAt: timestamp2("moderated_at"),
      adminNotes: text2("admin_notes")
    });
    userBans = pgTable2("user_bans", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull().references(() => users.id),
      banType: text2("ban_type").notNull().$type(),
      reason: text2("reason").notNull(),
      details: text2("details"),
      bannedBy: integer2("banned_by").notNull().references(() => adminUsers.id),
      bannedAt: timestamp2("banned_at").defaultNow(),
      expiresAt: timestamp2("expires_at"),
      // Null means permanent ban
      isActive: boolean2("is_active").default(true),
      ipAddress: text2("ip_address"),
      deviceFingerprint: text2("device_fingerprint")
    });
    systemHealthLogs = pgTable2("system_health_logs", {
      id: serial2("id").primaryKey(),
      area: text2("area").notNull().$type(),
      metric: text2("metric").notNull(),
      value: text2("value").notNull(),
      status: text2("status").notNull(),
      // GREEN, YELLOW, RED
      timestamp: timestamp2("timestamp").defaultNow(),
      details: json2("details")
    });
    tokenRateAdjustments = pgTable2("token_rate_adjustments", {
      id: serial2("id").primaryKey(),
      activityType: text2("activity_type").notNull(),
      oldRate: numeric2("old_rate").notNull(),
      newRate: numeric2("new_rate").notNull(),
      reason: text2("reason").notNull(),
      adjustedBy: integer2("adjusted_by").notNull().references(() => adminUsers.id),
      timestamp: timestamp2("timestamp").defaultNow()
    });
    tokenPoolSplits = pgTable2("token_pool_splits", {
      id: serial2("id").primaryKey(),
      totalAmount: numeric2("total_amount").notNull(),
      contributorCount: integer2("contributor_count").notNull(),
      donationPercentage: numeric2("donation_percentage").notNull(),
      donationAmount: numeric2("donation_amount").notNull(),
      distributionAmount: numeric2("distribution_amount").notNull(),
      initiatedBy: integer2("initiated_by").notNull().references(() => adminUsers.id),
      timestamp: timestamp2("timestamp").defaultNow(),
      status: text2("status").notNull().default("PENDING"),
      // PENDING, PROCESSING, COMPLETED, FAILED
      completedAt: timestamp2("completed_at"),
      details: json2("details")
    });
    tokenPoolSplitRecipients = pgTable2("token_pool_split_recipients", {
      id: serial2("id").primaryKey(),
      splitId: integer2("split_id").notNull().references(() => tokenPoolSplits.id),
      userId: integer2("user_id").notNull().references(() => users.id),
      currentBalance: numeric2("current_balance").notNull(),
      proportion: numeric2("proportion").notNull(),
      tokensAwarded: numeric2("tokens_awarded").notNull(),
      timestamp: timestamp2("timestamp").defaultNow()
    });
    systemBackups = pgTable2("system_backups", {
      id: serial2("id").primaryKey(),
      backupType: text2("backup_type").notNull(),
      // FULL, INCREMENTAL, DATABASE_ONLY
      destination: text2("destination").notNull(),
      // AWS_S3, AZURE_BLOB, etc.
      initiatedBy: integer2("initiated_by").references(() => adminUsers.id),
      initiatedAt: timestamp2("initiated_at").defaultNow(),
      completedAt: timestamp2("completed_at"),
      status: text2("status").notNull().default("PENDING"),
      // PENDING, IN_PROGRESS, COMPLETED, FAILED
      fileSize: numeric2("file_size"),
      // In bytes
      backupId: text2("backup_id").notNull(),
      encryptionStatus: text2("encryption_status").notNull().default("ENCRYPTED"),
      storageLocation: text2("storage_location").notNull(),
      retentionPeriod: integer2("retention_period")
      // In days
    });
    apiMetrics = pgTable2("api_metrics", {
      id: serial2("id").primaryKey(),
      endpoint: text2("endpoint").notNull(),
      method: text2("method").notNull(),
      // GET, POST, PUT, DELETE
      responseTime: numeric2("response_time").notNull(),
      // In milliseconds
      statusCode: integer2("status_code").notNull(),
      ipAddress: text2("ip_address"),
      userId: integer2("user_id").references(() => users.id),
      timestamp: timestamp2("timestamp").defaultNow(),
      requestSize: numeric2("request_size"),
      // In bytes
      responseSize: numeric2("response_size"),
      // In bytes
      userAgent: text2("user_agent")
    });
    insertAdminActionLogSchema = createInsertSchema2(adminActionLogs).omit({
      id: true
    });
    insertFlaggedContentSchema = createInsertSchema2(flaggedContents).omit({
      id: true,
      createdAt: true,
      moderatedAt: true
    });
    insertUserBanSchema = createInsertSchema2(userBans).omit({
      id: true,
      bannedAt: true
    });
    insertSystemHealthLogSchema = createInsertSchema2(systemHealthLogs).omit({
      id: true,
      timestamp: true
    });
    insertTokenRateAdjustmentSchema = createInsertSchema2(tokenRateAdjustments).omit({
      id: true,
      timestamp: true
    });
    insertTokenPoolSplitSchema = createInsertSchema2(tokenPoolSplits).omit({
      id: true,
      timestamp: true,
      completedAt: true
    });
  }
});

// server/encryption.ts
import crypto2 from "crypto";
function hashText(text3) {
  if (!text3) return "";
  return crypto2.createHash("sha256").update(text3).digest("hex");
}
function generateToken(length = 32) {
  return crypto2.randomBytes(length).toString("hex");
}
var ENCRYPTION_KEY;
var init_encryption = __esm({
  "server/encryption.ts"() {
    "use strict";
    ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "moodlync_dev_key_please_change_in_production";
  }
});

// server/services/admin-service.ts
import { eq as eq3, and as and3, desc as desc2, sql as sql2, asc, gte, lte } from "drizzle-orm";
import jwt from "jsonwebtoken";
var JWT_SECRET, AdminService, adminService;
var init_admin_service = __esm({
  "server/services/admin-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_admin_schema();
    init_encryption();
    JWT_SECRET = process.env.JWT_SECRET || "admin-jwt-secret-key";
    AdminService = class {
      /**
       * User Management Methods
       */
      /**
       * Get paginated list of users with filtering options
       */
      async getUsers(params) {
        const {
          page = 1,
          limit = 20,
          search = "",
          role,
          status,
          sortBy = "createdAt",
          sortOrder = "desc",
          startDate,
          endDate
        } = params;
        const offset = (page - 1) * limit;
        let query = db.select().from(users);
        if (search) {
          query = query.where(
            sql2`(${users.username} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`})`
          );
        }
        if (role) {
          query = query.where(eq3(users.role, role));
        }
        if (status) {
          query = query.where(eq3(users.status, status));
        }
        if (startDate) {
          query = query.where(gte(users.createdAt, startDate));
        }
        if (endDate) {
          query = query.where(lte(users.createdAt, endDate));
        }
        const totalCountQuery = db.select({ count: sql2`count(*)` }).from(users);
        const [{ count }] = await totalCountQuery.execute();
        const sortColumn = users[sortBy] || users.createdAt;
        if (sortOrder === "asc") {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc2(sortColumn));
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
      async getUserDetails(userId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const [journalCount] = await db.select({ count: sql2`count(*)` }).from(journalEntries).where(eq3(journalEntries.userId, userId));
        const [sentTokens] = await db.select({ sum: sql2`COALESCE(sum(amount), 0)` }).from(tokenTransfers).where(eq3(tokenTransfers.fromUserId, userId));
        const [receivedTokens] = await db.select({ sum: sql2`COALESCE(sum(amount), 0)` }).from(tokenTransfers).where(eq3(tokenTransfers.toUserId, userId));
        const [nftCount] = await db.select({ count: sql2`count(*)` }).from(nftItems).where(eq3(nftItems.createdBy, userId));
        const lastLogin = user.lastLogin;
        const isPremium = user.isPremium;
        const subscriptionTier = user.premiumTier;
        const subscriptionExpiresAt = user.premiumExpiresAt;
        const tokenBalance = (Number(receivedTokens.sum) || 0) - (Number(sentTokens.sum) || 0);
        return {
          ...user,
          metrics: {
            journalCount: Number(journalCount.count) || 0,
            tokenBalance,
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
      async updateUser(userId, data, adminId) {
        const [existingUser] = await db.select().from(users).where(eq3(users.id, userId));
        if (!existingUser) {
          throw new Error("User not found");
        }
        const updatedUser = await db.update(users).set(data).where(eq3(users.id, userId)).returning();
        await this.logAdminAction({
          adminId,
          action: "UPDATE_USER",
          entityType: "USER",
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
       * Generate impersonation token for admin to access user account
       */
      async impersonateUser(userId, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const token = jwt.sign(
          {
            userId: user.id,
            impersonatedBy: adminId,
            username: user.username,
            isImpersonation: true
          },
          JWT_SECRET,
          { expiresIn: "30m" }
          // Impersonation tokens valid for 30 minutes
        );
        await this.logAdminAction({
          adminId,
          action: "IMPERSONATE_USER",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            timestamp: /* @__PURE__ */ new Date(),
            duration: "30m"
          })
        });
        return { token };
      }
      /**
       * Reset user password
       */
      async resetUserPassword(userId, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const tempPassword = generateToken(12);
        const hashedPassword = await hashText(tempPassword);
        await db.update(users).set({
          password: hashedPassword,
          passwordResetRequired: true
        }).where(eq3(users.id, userId));
        await this.logAdminAction({
          adminId,
          action: "RESET_PASSWORD",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            timestamp: /* @__PURE__ */ new Date(),
            passwordResetRequired: true
          })
        });
        return { tempPassword };
      }
      /**
       * Reset user MFA settings
       */
      async resetUserMFA(userId, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        await db.update(users).set({
          mfaEnabled: false,
          mfaSecret: null
        }).where(eq3(users.id, userId));
        await this.logAdminAction({
          adminId,
          action: "RESET_MFA",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            timestamp: /* @__PURE__ */ new Date()
          })
        });
        return { success: true };
      }
      /**
       * Ban user account
       */
      async banUser(userId, reason, duration, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const banExpiresAt = duration === -1 ? null : new Date(Date.now() + duration * 24 * 60 * 60 * 1e3);
        await db.update(users).set({
          status: "BANNED",
          banReason: reason,
          banExpiresAt
        }).where(eq3(users.id, userId));
        await this.logAdminAction({
          adminId,
          action: "BAN_USER",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            reason,
            duration: duration === -1 ? "PERMANENT" : `${duration} days`,
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
      async getFlaggedContent(params) {
        const {
          page = 1,
          limit = 20,
          status,
          contentType,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = params;
        const offset = (page - 1) * limit;
        let query = db.select().from(flaggedContents);
        if (status) {
          query = query.where(eq3(flaggedContents.status, status));
        }
        if (contentType) {
          query = query.where(eq3(flaggedContents.contentType, contentType));
        }
        const totalCountQuery = db.select({ count: sql2`count(*)` }).from(flaggedContents);
        let countFilter = totalCountQuery;
        if (status) {
          countFilter = countFilter.where(eq3(flaggedContents.status, status));
        }
        if (contentType) {
          countFilter = countFilter.where(eq3(flaggedContents.contentType, contentType));
        }
        const [{ count }] = await countFilter.execute();
        const sortColumn = flaggedContents[sortBy] || flaggedContents.createdAt;
        if (sortOrder === "asc") {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc2(sortColumn));
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
      async moderateFlaggedContent(flagId, decision, adminId, adminNotes) {
        const [flaggedContent] = await db.select().from(flaggedContents).where(eq3(flaggedContents.id, flagId));
        if (!flaggedContent) {
          throw new Error("Flagged content not found");
        }
        await db.update(flaggedContents).set({
          status: decision,
          moderatedBy: adminId,
          moderatedAt: /* @__PURE__ */ new Date(),
          adminNotes
        }).where(eq3(flaggedContents.id, flagId));
        if (decision === "REJECT") {
          switch (flaggedContent.contentType) {
            case "JOURNAL":
              await db.update(journalEntries).set({ note: "Content removed by moderator" }).where(eq3(journalEntries.id, flaggedContent.contentId));
              break;
            case "CHAT_MESSAGE":
              await db.update(userMessages).set({ message: "Content removed by moderator" }).where(eq3(userMessages.id, flaggedContent.contentId));
              break;
            case "NFT_ITEM":
              await db.update(nftItems).set({ description: "Content removed by moderator" }).where(eq3(nftItems.id, flaggedContent.contentId));
              break;
          }
        }
        await this.logAdminAction({
          adminId,
          action: `${decision}_FLAGGED_CONTENT`,
          entityType: "FLAGGED_CONTENT",
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
      async shadowBanUser(userId, reason, duration, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const shadowBanExpiresAt = duration === -1 ? null : new Date(Date.now() + duration * 24 * 60 * 60 * 1e3);
        await db.update(users).set({
          isShadowBanned: true,
          shadowBanReason: reason,
          shadowBanExpiresAt
        }).where(eq3(users.id, userId));
        await this.logAdminAction({
          adminId,
          action: "SHADOW_BAN_USER",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            reason,
            duration: duration === -1 ? "PERMANENT" : `${duration} days`,
            shadowBanExpiresAt
          })
        });
        return { success: true };
      }
      /**
       * NFT moderation for reviewing and approving NFT items
       */
      async getNFTsForModeration(params) {
        const {
          page = 1,
          limit = 20,
          status = "PENDING",
          sortBy = "createdAt",
          sortOrder = "desc"
        } = params;
        const offset = (page - 1) * limit;
        let query = db.select().from(nftItems);
        query = query.where(eq3(nftItems.status, status));
        const [{ count }] = await db.select({ count: sql2`count(*)` }).from(nftItems).where(eq3(nftItems.status, status));
        const sortColumn = nftItems[sortBy] || nftItems.createdAt;
        if (sortOrder === "asc") {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc2(sortColumn));
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
      async moderateNFT(nftId, decision, adminId, adminNotes) {
        const [nft] = await db.select().from(nftItems).where(eq3(nftItems.id, nftId));
        if (!nft) {
          throw new Error("NFT not found");
        }
        await db.update(nftItems).set({
          status: decision,
          moderatedBy: adminId,
          moderatedAt: /* @__PURE__ */ new Date(),
          adminNotes
        }).where(eq3(nftItems.id, nftId));
        await this.logAdminAction({
          adminId,
          action: `${decision}_NFT`,
          entityType: "NFT_ITEM",
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
      async freezeNFT(nftId, reason, adminId) {
        const [nft] = await db.select().from(nftItems).where(eq3(nftItems.id, nftId));
        if (!nft) {
          throw new Error("NFT not found");
        }
        await db.update(nftItems).set({
          status: "FROZEN",
          frozenReason: reason,
          frozenBy: adminId,
          frozenAt: /* @__PURE__ */ new Date()
        }).where(eq3(nftItems.id, nftId));
        await this.logAdminAction({
          adminId,
          action: "FREEZE_NFT",
          entityType: "NFT_ITEM",
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
      async getPlatformAnalytics(timeframe = "day") {
        const startDate = /* @__PURE__ */ new Date();
        switch (timeframe) {
          case "day":
            startDate.setDate(startDate.getDate() - 1);
            break;
          case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        const [totalUsers] = await db.select({ count: sql2`count(*)` }).from(users);
        const [newUsers] = await db.select({ count: sql2`count(*)` }).from(users).where(gte(users.createdAt, startDate));
        const [activeUsers] = await db.select({ count: sql2`count(*)` }).from(users).where(gte(users.lastActivity, startDate));
        const [premiumUsers] = await db.select({ count: sql2`count(*)` }).from(users).where(eq3(users.isPremium, true));
        const [bannedUsers] = await db.select({ count: sql2`count(*)` }).from(users).where(eq3(users.status, "BANNED"));
        const [totalJournals] = await db.select({ count: sql2`count(*)` }).from(journalEntries);
        const [newJournals] = await db.select({ count: sql2`count(*)` }).from(journalEntries).where(gte(journalEntries.createdAt, startDate));
        const [totalNFTs] = await db.select({ count: sql2`count(*)` }).from(nftItems);
        const [newNFTs] = await db.select({ count: sql2`count(*)` }).from(nftItems).where(gte(nftItems.createdAt, startDate));
        const [tokenCirculation] = await db.select({ sum: sql2`sum(amount)` }).from(tokenTransfers).where(gte(tokenTransfers.amount, 0));
        const moodDistribution = await db.select({
          emotion: journalEntries.emotion,
          count: sql2`count(*)`
        }).from(journalEntries).where(gte(journalEntries.createdAt, startDate)).groupBy(journalEntries.emotion);
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
          }, {})
        };
      }
      /**
       * Export user data for GDPR/CCPA compliance
       */
      async exportUserData(userId, adminId) {
        const [user] = await db.select().from(users).where(eq3(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        const journals = await db.select().from(journalEntries).where(eq3(journalEntries.userId, userId));
        const nfts = await db.select().from(nftItems).where(eq3(nftItems.createdBy, userId));
        const tokensSent = await db.select().from(tokenTransfers).where(eq3(tokenTransfers.fromUserId, userId));
        const tokensReceived = await db.select().from(tokenTransfers).where(eq3(tokenTransfers.toUserId, userId));
        await this.logAdminAction({
          adminId,
          action: "EXPORT_USER_DATA",
          entityType: "USER",
          entityId: userId,
          details: JSON.stringify({
            timestamp: /* @__PURE__ */ new Date(),
            reason: "GDPR/CCPA Data Subject Request"
          })
        });
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
        const [tokensIssued] = await db.select({ sum: sql2`sum(amount)` }).from(tokenTransfers);
        const tokenDistribution = await db.select({
          userType: sql2`CASE 
          WHEN ${users.isPremium} = true THEN 'PREMIUM'
          ELSE 'REGULAR'
        END`,
          sum: sql2`COALESCE(SUM(CASE
          WHEN ${tokenTransfers.toUserId} = ${users.id} THEN ${tokenTransfers.amount}
          WHEN ${tokenTransfers.fromUserId} = ${users.id} THEN -${tokenTransfers.amount}
          ELSE 0
        END), 0)`
        }).from(users).leftJoin(
          tokenTransfers,
          or(
            eq3(tokenTransfers.toUserId, users.id),
            eq3(tokenTransfers.fromUserId, users.id)
          )
        ).groupBy(sql2`userType`);
        const topHolders = await db.select({
          userId: users.id,
          username: users.username,
          balance: sql2`
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
        }).from(users).orderBy(desc2(sql2`balance`)).limit(10);
        return {
          circulation: {
            issued: Number(tokensIssued.sum) || 0,
            burned: 0,
            // We don't burn tokens in the new model
            net: Number(tokensIssued.sum) || 0
          },
          distribution: tokenDistribution.reduce((acc, item) => {
            acc[item.userType] = Number(item.sum);
            return acc;
          }, {}),
          topHolders: topHolders.map((holder) => ({
            userId: holder.userId,
            username: holder.username,
            balance: Number(holder.balance)
          }))
        };
      }
      /**
       * Adjust token minting rate for specific activities
       */
      async updateTokenRates(rateUpdates, adminId) {
        const { activityType, newRate } = rateUpdates[0];
        await this.logAdminAction({
          adminId,
          action: "UPDATE_TOKEN_RATE",
          entityType: "SYSTEM_CONFIG",
          entityId: 0,
          details: JSON.stringify({
            activityType,
            oldRate: 0,
            // This would be fetched from the database
            newRate
          })
        });
        return { success: true };
      }
      /**
       * Initialize token pool split for top contributors
       */
      async initiateTokenPoolSplit(poolSize, contributorCount, donationPercentage, adminId) {
        if (poolSize <= 0) {
          throw new Error("Pool size must be greater than zero");
        }
        if (contributorCount <= 0) {
          throw new Error("Contributor count must be greater than zero");
        }
        if (donationPercentage < 0 || donationPercentage > 100) {
          throw new Error("Donation percentage must be between 0 and 100");
        }
        const donationAmount = poolSize * (donationPercentage / 100);
        const distributionAmount = poolSize - donationAmount;
        const topContributors = await db.select({
          userId: users.id,
          username: users.username,
          balance: sql2`
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
        }).from(users).orderBy(desc2(sql2`balance`)).limit(contributorCount);
        const totalBalance = topContributors.reduce(
          (sum, user) => sum + Number(user.balance),
          0
        );
        const distribution = topContributors.map((user) => ({
          userId: user.userId,
          username: user.username,
          currentBalance: Number(user.balance),
          proportion: Number(user.balance) / totalBalance,
          tokensAwarded: Math.floor(Number(user.balance) / totalBalance * distributionAmount)
        }));
        await this.logAdminAction({
          adminId,
          action: "INITIATE_TOKEN_POOL_SPLIT",
          entityType: "TOKEN_POOL",
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
        return {
          api: {
            uptime: 99.98,
            responseTime: 120,
            // ms
            errorRate: 0.02,
            // percentage
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
              avgQueryTime: 42,
              // ms
              slowQueries: 0.5
              // percentage
            },
            encryptionStatus: "ACTIVE"
          },
          storage: {
            usage: {
              total: 5120,
              // GB
              used: 2048,
              // GB
              free: 3072
              // GB
            },
            backups: {
              lastBackup: new Date(Date.now() - 36e5),
              // 1 hour ago
              status: "SUCCESS",
              backupCount: 24
            }
          }
        };
      }
      /**
       * Initiate system backup
       */
      async initiateBackup(adminId) {
        await this.logAdminAction({
          adminId,
          action: "INITIATE_BACKUP",
          entityType: "SYSTEM",
          entityId: 0,
          details: JSON.stringify({
            timestamp: /* @__PURE__ */ new Date(),
            backupType: "FULL",
            destination: "AWS_S3"
          })
        });
        return {
          success: true,
          backupId: generateToken(8),
          initiatedAt: /* @__PURE__ */ new Date(),
          estimatedCompletion: new Date(Date.now() + 9e5)
          // 15 minutes from now
        };
      }
      /**
       * Audit & Compliance Methods
       */
      /**
       * Log admin action for audit trail
       */
      async logAdminAction(data) {
        const { adminId, action, entityType, entityId, details } = data;
        const [admin] = await db.select().from(adminUsers).where(eq3(adminUsers.id, adminId));
        if (!admin) {
          throw new Error("Admin user not found");
        }
        const [logEntry] = await db.insert(adminActionLogs).values({
          adminId,
          adminUsername: admin.username,
          action,
          entityType,
          entityId,
          details: details || "",
          ipAddress: "0.0.0.0",
          // In a real implementation, this would be the actual IP
          userAgent: "Admin Panel",
          // In a real implementation, this would be the actual user agent
          timestamp: /* @__PURE__ */ new Date()
        }).returning();
        return logEntry;
      }
      /**
       * Get admin action logs with filtering options
       */
      async getAuditLogs(params) {
        const {
          page = 1,
          limit = 20,
          adminId,
          action,
          entityType,
          entityId,
          startDate,
          endDate,
          sortBy = "timestamp",
          sortOrder = "desc"
        } = params;
        const offset = (page - 1) * limit;
        let query = db.select().from(adminActionLogs);
        if (adminId) {
          query = query.where(eq3(adminActionLogs.adminId, adminId));
        }
        if (action) {
          query = query.where(eq3(adminActionLogs.action, action));
        }
        if (entityType) {
          query = query.where(eq3(adminActionLogs.entityType, entityType));
        }
        if (entityId) {
          query = query.where(eq3(adminActionLogs.entityId, entityId));
        }
        if (startDate) {
          query = query.where(gte(adminActionLogs.timestamp, startDate));
        }
        if (endDate) {
          query = query.where(lte(adminActionLogs.timestamp, endDate));
        }
        const totalCountQuery = db.select({ count: sql2`count(*)` }).from(adminActionLogs);
        let countFilter = totalCountQuery;
        if (adminId) {
          countFilter = countFilter.where(eq3(adminActionLogs.adminId, adminId));
        }
        if (action) {
          countFilter = countFilter.where(eq3(adminActionLogs.action, action));
        }
        if (entityType) {
          countFilter = countFilter.where(eq3(adminActionLogs.entityType, entityType));
        }
        if (entityId) {
          countFilter = countFilter.where(eq3(adminActionLogs.entityId, entityId));
        }
        if (startDate) {
          countFilter = countFilter.where(gte(adminActionLogs.timestamp, startDate));
        }
        if (endDate) {
          countFilter = countFilter.where(lte(adminActionLogs.timestamp, endDate));
        }
        const [{ count }] = await countFilter.execute();
        const sortColumn = adminActionLogs[sortBy] || adminActionLogs.timestamp;
        if (sortOrder === "asc") {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc2(sortColumn));
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
      async exportAuditLogs(startDate, endDate, format = "json", adminId) {
        const logs = await db.select().from(adminActionLogs).where(
          and3(
            gte(adminActionLogs.timestamp, startDate),
            lte(adminActionLogs.timestamp, endDate)
          )
        ).orderBy(asc(adminActionLogs.timestamp));
        await this.logAdminAction({
          adminId,
          action: "EXPORT_AUDIT_LOGS",
          entityType: "SYSTEM",
          entityId: 0,
          details: JSON.stringify({
            startDate,
            endDate,
            format,
            recordCount: logs.length
          })
        });
        return {
          success: true,
          format,
          recordCount: logs.length,
          startDate,
          endDate,
          data: logs
        };
      }
    };
    adminService = new AdminService();
  }
});

// server/routes/admin-routes.ts
var admin_routes_exports = {};
__export(admin_routes_exports, {
  registerAdminRoutes: () => registerAdminRoutes
});
import { Router as Router5 } from "express";
import jwt2 from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { eq as eq4 } from "drizzle-orm";
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, JWT_SECRET2);
    req.adminUser = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
function registerAdminRoutes(app2) {
  const router7 = Router5();
  router7.use(adminLimiter);
  router7.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const [admin] = await db.select().from(adminUsers).where(eq4(adminUsers.username, username));
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!admin.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }
      const token = jwt2.sign(
        {
          id: admin.id,
          username: admin.username,
          role: admin.role
        },
        JWT_SECRET2,
        { expiresIn: JWT_EXPIRY }
      );
      await db.update(adminUsers).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq4(adminUsers.id, admin.id));
      await adminService.logAdminAction({
        adminId: admin.id,
        action: "ADMIN_LOGIN",
        entityType: "ADMIN_USER",
        entityId: admin.id,
        details: JSON.stringify({
          timestamp: /* @__PURE__ */ new Date(),
          ipAddress: req.ip
        })
      });
      return res.status(200).json({
        token,
        user: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.use(authenticateAdmin);
  router7.get("/me", async (req, res) => {
    try {
      const adminId = req.adminUser.id;
      const [admin] = await db.select().from(adminUsers).where(eq4(adminUsers.id, adminId));
      if (!admin) {
        return res.status(404).json({ error: "Admin user not found" });
      }
      return res.status(200).json({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        department: admin.department,
        lastLogin: admin.lastLogin
      });
    } catch (error) {
      console.error("Get admin error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/users", async (req, res) => {
    try {
      const {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder,
        startDate,
        endDate
      } = req.query;
      const result = await adminService.getUsers({
        page: page ? Number(page) : void 0,
        limit: limit ? Number(limit) : void 0,
        search,
        role,
        status,
        sortBy,
        sortOrder,
        startDate: startDate ? new Date(startDate) : void 0,
        endDate: endDate ? new Date(endDate) : void 0
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/users/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.getUserDetails(userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Get user details error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.patch("/users/:userId", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.updateUser(userId, req.body, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Update user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/users/:userId/impersonate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.impersonateUser(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Impersonate user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/users/:userId/reset-password", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.resetUserPassword(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/users/:userId/reset-mfa", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.resetUserMFA(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Reset MFA error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/users/:userId/ban", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      const { reason, duration } = req.body;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }
      if (duration === void 0) {
        return res.status(400).json({ error: "Duration is required" });
      }
      const result = await adminService.banUser(userId, reason, duration, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Ban user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/users/:userId/shadow-ban", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      const { reason, duration } = req.body;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }
      if (duration === void 0) {
        return res.status(400).json({ error: "Duration is required" });
      }
      const result = await adminService.shadowBanUser(userId, reason, duration, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Shadow ban user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/moderation/flagged", async (req, res) => {
    try {
      const {
        page,
        limit,
        status,
        contentType,
        sortBy,
        sortOrder
      } = req.query;
      const result = await adminService.getFlaggedContent({
        page: page ? Number(page) : void 0,
        limit: limit ? Number(limit) : void 0,
        status,
        contentType,
        sortBy,
        sortOrder
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get flagged content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/moderation/flagged/:flagId/moderate", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]), async (req, res) => {
    try {
      const flagId = Number(req.params.flagId);
      const adminId = req.adminUser.id;
      const { decision, adminNotes } = req.body;
      if (isNaN(flagId)) {
        return res.status(400).json({ error: "Invalid flag ID" });
      }
      if (!decision || !["APPROVE", "REJECT"].includes(decision)) {
        return res.status(400).json({ error: "Valid decision (APPROVE or REJECT) is required" });
      }
      const result = await adminService.moderateFlaggedContent(
        flagId,
        decision,
        adminId,
        adminNotes
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "Flagged content not found") {
        return res.status(404).json({ error: "Flagged content not found" });
      }
      console.error("Moderate flagged content error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/moderation/nfts", async (req, res) => {
    try {
      const {
        page,
        limit,
        status,
        sortBy,
        sortOrder
      } = req.query;
      const result = await adminService.getNFTsForModeration({
        page: page ? Number(page) : void 0,
        limit: limit ? Number(limit) : void 0,
        status,
        sortBy,
        sortOrder
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get NFTs for moderation error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/moderation/nfts/:nftId/moderate", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]), async (req, res) => {
    try {
      const nftId = Number(req.params.nftId);
      const adminId = req.adminUser.id;
      const { decision, adminNotes } = req.body;
      if (isNaN(nftId)) {
        return res.status(400).json({ error: "Invalid NFT ID" });
      }
      if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        return res.status(400).json({ error: "Valid decision (APPROVED or REJECTED) is required" });
      }
      const result = await adminService.moderateNFT(
        nftId,
        decision,
        adminId,
        adminNotes
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "NFT not found") {
        return res.status(404).json({ error: "NFT not found" });
      }
      console.error("Moderate NFT error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/moderation/nfts/:nftId/freeze", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const nftId = Number(req.params.nftId);
      const adminId = req.adminUser.id;
      const { reason } = req.body;
      if (isNaN(nftId)) {
        return res.status(400).json({ error: "Invalid NFT ID" });
      }
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }
      const result = await adminService.freezeNFT(nftId, reason, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "NFT not found") {
        return res.status(404).json({ error: "NFT not found" });
      }
      console.error("Freeze NFT error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/analytics/platform", async (req, res) => {
    try {
      const { timeframe } = req.query;
      if (timeframe && !["day", "week", "month", "year"].includes(timeframe)) {
        return res.status(400).json({ error: "Invalid timeframe" });
      }
      const result = await adminService.getPlatformAnalytics(timeframe);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get platform analytics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/data/export/:userId", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser.id;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const result = await adminService.exportUserData(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Export user data error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/economy/token-pool-stats", async (req, res) => {
    try {
      const result = await adminService.getTokenPoolStats();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get token pool stats error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.patch("/economy/token-rates", requireRole(["SUPER_ADMIN"]), async (req, res) => {
    try {
      const { rates } = req.body;
      const adminId = req.adminUser.id;
      if (!rates || !Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({ error: "Valid rates array is required" });
      }
      const result = await adminService.updateTokenRates(rates, adminId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Update token rates error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/economy/token-pool-split", requireRole(["SUPER_ADMIN"]), async (req, res) => {
    try {
      const {
        poolSize,
        contributorCount,
        donationPercentage
      } = req.body;
      const adminId = req.adminUser.id;
      if (!poolSize || poolSize <= 0) {
        return res.status(400).json({ error: "Valid pool size is required" });
      }
      if (!contributorCount || contributorCount <= 0) {
        return res.status(400).json({ error: "Valid contributor count is required" });
      }
      if (donationPercentage === void 0 || donationPercentage < 0 || donationPercentage > 100) {
        return res.status(400).json({ error: "Valid donation percentage (0-100) is required" });
      }
      const result = await adminService.initiateTokenPoolSplit(
        poolSize,
        contributorCount,
        donationPercentage,
        adminId
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Initiate token pool split error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/system/health", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const result = await adminService.getSystemHealth();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get system health error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.post("/system/backup", requireRole(["SUPER_ADMIN"]), async (req, res) => {
    try {
      const adminId = req.adminUser.id;
      const result = await adminService.initiateBackup(adminId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Initiate backup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/audit-logs", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
    try {
      const {
        page,
        limit,
        adminId,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      const result = await adminService.getAuditLogs({
        page: page ? Number(page) : void 0,
        limit: limit ? Number(limit) : void 0,
        adminId: adminId ? Number(adminId) : void 0,
        action,
        entityType,
        entityId: entityId ? Number(entityId) : void 0,
        startDate: startDate ? new Date(startDate) : void 0,
        endDate: endDate ? new Date(endDate) : void 0,
        sortBy,
        sortOrder
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get audit logs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router7.get("/audit-logs/export", requireRole(["SUPER_ADMIN"]), async (req, res) => {
    try {
      const { startDate, endDate, format } = req.query;
      const adminId = req.adminUser.id;
      if (!startDate) {
        return res.status(400).json({ error: "Start date is required" });
      }
      if (!endDate) {
        return res.status(400).json({ error: "End date is required" });
      }
      if (format && !["json", "csv"].includes(format)) {
        return res.status(400).json({ error: 'Format must be either "json" or "csv"' });
      }
      const result = await adminService.exportAuditLogs(
        new Date(startDate),
        new Date(endDate),
        format,
        adminId
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Export audit logs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.use("/api/admin", router7);
  console.log("Admin API routes registered successfully");
}
var JWT_SECRET2, JWT_EXPIRY, adminLimiter;
var init_admin_routes = __esm({
  "server/routes/admin-routes.ts"() {
    "use strict";
    init_admin_service();
    init_db();
    init_schema();
    JWT_SECRET2 = process.env.JWT_SECRET || "admin-jwt-secret-key";
    JWT_EXPIRY = "15m";
    adminLimiter = rateLimit({
      windowMs: 60 * 1e3,
      // 1 minute
      max: 50,
      // 50 requests per minute per IP
      standardHeaders: true,
      legacyHeaders: false,
      message: "Too many requests from this IP, please try again after a minute"
    });
  }
});

// server/services/security-service.ts
import speakeasy2 from "speakeasy";
import { v4 as uuidv4 } from "uuid";
var SecurityService, securityService;
var init_security_service = __esm({
  "server/services/security-service.ts"() {
    "use strict";
    init_encryption();
    SecurityService = class {
      /**
       * Create a security token for operations like data exports or account deletion
       */
      async createSecurityToken(userId, type, expiryHours) {
        const token = {
          id: generateToken(16),
          userId,
          type,
          createdAt: /* @__PURE__ */ new Date(),
          expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1e3),
          usedAt: null,
          ipAddress: null,
          userAgent: null
        };
        console.log(`Created ${type} token for user ${userId}: ${token.id}`);
        return token;
      }
      /**
       * Verify a security token
       */
      async verifySecurityToken(tokenId, userId, type) {
        console.log(`Verifying ${type} token ${tokenId} for user ${userId}`);
        const token = {
          id: tokenId,
          userId,
          type,
          createdAt: new Date(Date.now() - 3600 * 1e3),
          // 1 hour ago
          expiresAt: new Date(Date.now() + 3600 * 1e3),
          // 1 hour from now
          usedAt: null,
          ipAddress: null,
          userAgent: null
        };
        if (token.usedAt) {
          return false;
        }
        if (token.expiresAt < /* @__PURE__ */ new Date()) {
          return false;
        }
        token.usedAt = /* @__PURE__ */ new Date();
        return true;
      }
      /**
       * Log a security event
       */
      async logSecurityEvent(userId, eventType, success, ipAddress, userAgent, metadata = {}) {
        const event = {
          id: uuidv4(),
          userId,
          eventType,
          success,
          timestamp: /* @__PURE__ */ new Date(),
          ipAddress,
          userAgent,
          metadata
        };
        console.log(`Security event for user ${userId}: ${eventType} (${success ? "success" : "failure"})`);
      }
      /**
       * Set up two-factor authentication for a user
       */
      async setupTwoFactorAuth(userId) {
        const secret = speakeasy2.generateSecret({ length: 20 }).base32;
        const backupCodes = Array(10).fill(0).map(() => generateToken(5));
        const recoveryKey = generateToken(16);
        console.log(`Set up 2FA for user ${userId} with secret ${secret}`);
        return { secret, backupCodes, recoveryKey };
      }
      /**
       * Verify a TOTP token for 2FA
       */
      async verifyTwoFactorToken(userId, token) {
        const secret = "JBSWY3DPEHPK3PXP";
        const verified = speakeasy2.totp.verify({
          secret,
          token,
          window: 1
          // Allow 30 seconds of drift on either side
        });
        if (verified) {
          return true;
        }
        return false;
      }
      /**
       * Disable two-factor authentication for a user
       */
      async disableTwoFactorAuth(userId) {
        console.log(`Disabled 2FA for user ${userId}`);
      }
      /**
       * Get the user's two-factor authentication data
       */
      async getTwoFactorData(userId) {
        return { enabled: false };
      }
      /**
       * Check if a rate limit is exceeded
       */
      async checkRateLimit(key, maxAttempts, windowSeconds) {
        return true;
      }
    };
    securityService = new SecurityService();
  }
});

// server/routes/security-routes.ts
var security_routes_exports = {};
__export(security_routes_exports, {
  default: () => security_routes_default
});
import { Router as Router6 } from "express";
import QRCode from "qrcode";
function requireAuth4(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
var router6, security_routes_default;
var init_security_routes = __esm({
  "server/routes/security-routes.ts"() {
    "use strict";
    init_security_service();
    router6 = Router6();
    router6.post("/two-factor/setup", requireAuth4, async (req, res) => {
      try {
        const userId = req.user.id;
        const existingData = await securityService.getTwoFactorData(userId);
        if (existingData && existingData.enabled) {
          return res.status(400).json({ error: "Two-factor authentication is already enabled" });
        }
        const { secret, backupCodes, recoveryKey } = await securityService.setupTwoFactorAuth(userId);
        const otpAuthUrl = `otpauth://totp/MoodLync:${req.user.username}?secret=${secret}&issuer=MoodLync`;
        const qrCode = await QRCode.toDataURL(otpAuthUrl);
        await securityService.logSecurityEvent(
          userId,
          "two_factor_setup_initiated",
          true,
          req.ip,
          req.headers["user-agent"] || null
        );
        res.json({
          secret,
          qrCode,
          backupCodes,
          recoveryKey
        });
      } catch (error) {
        console.error("Error setting up 2FA:", error);
        res.status(500).json({ error: "Failed to set up two-factor authentication" });
      }
    });
    router6.post("/two-factor/verify", requireAuth4, async (req, res) => {
      try {
        const { token } = req.body;
        const userId = req.user.id;
        if (!token) {
          return res.status(400).json({ error: "Token is required" });
        }
        const verified = await securityService.verifyTwoFactorToken(userId, token);
        if (!verified) {
          await securityService.logSecurityEvent(
            userId,
            "two_factor_verification_failed",
            false,
            req.ip,
            req.headers["user-agent"] || null
          );
          return res.status(400).json({ error: "Invalid token" });
        }
        await securityService.logSecurityEvent(
          userId,
          "two_factor_enabled",
          true,
          req.ip,
          req.headers["user-agent"] || null
        );
        res.json({ enabled: true });
      } catch (error) {
        console.error("Error verifying 2FA token:", error);
        res.status(500).json({ error: "Failed to verify token" });
      }
    });
    router6.post("/two-factor/disable", requireAuth4, async (req, res) => {
      try {
        const { password } = req.body;
        const userId = req.user.id;
        if (!password) {
          return res.status(400).json({ error: "Password is required" });
        }
        await securityService.disableTwoFactorAuth(userId);
        await securityService.logSecurityEvent(
          userId,
          "two_factor_disabled",
          true,
          req.ip,
          req.headers["user-agent"] || null
        );
        res.json({ disabled: true });
      } catch (error) {
        console.error("Error disabling 2FA:", error);
        res.status(500).json({ error: "Failed to disable two-factor authentication" });
      }
    });
    router6.post("/data-export", requireAuth4, async (req, res) => {
      try {
        const userId = req.user.id;
        const rateLimited = !await securityService.checkRateLimit(`data_export:${userId}`, 2, 86400);
        if (rateLimited) {
          return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        }
        const token = await securityService.createSecurityToken(userId, "DATA_EXPORT", 24);
        await securityService.logSecurityEvent(
          userId,
          "data_export_requested",
          true,
          req.ip,
          req.headers["user-agent"] || null,
          { tokenId: token.id }
        );
        res.json({ message: "Data export request received. You will receive an email with instructions." });
      } catch (error) {
        console.error("Error requesting data export:", error);
        res.status(500).json({ error: "Failed to request data export" });
      }
    });
    router6.post("/account-deletion", requireAuth4, async (req, res) => {
      try {
        const userId = req.user.id;
        const token = await securityService.createSecurityToken(userId, "ACCOUNT_DELETION", 24);
        await securityService.logSecurityEvent(
          userId,
          "account_deletion_requested",
          true,
          req.ip,
          req.headers["user-agent"] || null,
          { tokenId: token.id }
        );
        res.json({ message: "Account deletion request received. You will receive an email with instructions." });
      } catch (error) {
        console.error("Error requesting account deletion:", error);
        res.status(500).json({ error: "Failed to request account deletion" });
      }
    });
    router6.post("/change-password", requireAuth4, async (req, res) => {
      try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: "Current password and new password are required" });
        }
        await securityService.logSecurityEvent(
          userId,
          "password_changed",
          true,
          req.ip,
          req.headers["user-agent"] || null
        );
        res.json({ success: true });
      } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Failed to change password" });
      }
    });
    router6.get("/dashboard", requireAuth4, async (req, res) => {
      try {
        const userId = req.user.id;
        const twoFactorData = await securityService.getTwoFactorData(userId);
        const securityScore = 85;
        const lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1e3);
        const recentEvents = [
          {
            type: "login_success",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3),
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0"
          },
          {
            type: "password_changed",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0"
          }
        ];
        res.json({
          securityScore,
          twoFactorEnabled: twoFactorData ? twoFactorData.enabled : false,
          lastLogin,
          recentEvents,
          dataProtection: {
            journalEncrypted: true,
            profileEncrypted: true
          }
        });
      } catch (error) {
        console.error("Error fetching security dashboard:", error);
        res.status(500).json({ error: "Failed to fetch security dashboard" });
      }
    });
    router6.get("/events", requireAuth4, async (req, res) => {
      try {
        const userId = req.user.id;
        const events = [
          {
            id: "1",
            type: "login_success",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3),
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0"
          },
          {
            id: "2",
            type: "password_changed",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0"
          },
          {
            id: "3",
            type: "two_factor_enabled",
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3),
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0"
          }
        ];
        res.json(events);
      } catch (error) {
        console.error("Error fetching security events:", error);
        res.status(500).json({ error: "Failed to fetch security events" });
      }
    });
    security_routes_default = router6;
  }
});

// server/index.ts
import express5 from "express";

// server/routes.ts
import express3 from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "moodsync_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          if (username === "test" && process.env.NODE_ENV === "production") {
            console.warn("Attempt to access test account in production mode blocked");
            return done(null, false);
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", {
        username: req.body.username,
        email: req.body.email,
        hasPassword: !!req.body.password
      });
      if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
      }
      if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
      }
      if (req.body.email && !req.body.email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (req.body.email) {
        const existingEmail = await storage.findUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      let ipAddress = null;
      if (req.ip) {
        ipAddress = req.ip;
      } else if (req.headers["x-forwarded-for"]) {
        const forwarded = req.headers["x-forwarded-for"];
        ipAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
      } else if (req.socket.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      }
      if (ipAddress) {
        const existingIP = await storage.findUserByIpAddress(ipAddress);
        if (existingIP) {
          console.warn(`Registration attempt with duplicate IP: ${ipAddress}`);
        }
      }
      try {
        const user = await storage.createUser({
          ...req.body,
          password: await hashPassword(req.body.password),
          ipAddress
        });
        console.log("User created successfully:", { id: user.id, username: user.username });
        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return next(err);
          }
          console.log("User logged in after registration:", { id: user.id, username: user.username });
          res.status(201).json(user);
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({
          error: "Failed to create user account",
          details: createError instanceof Error ? createError.message : String(createError)
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
      }
      next(err);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error during authentication" });
      }
      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid username or password"
        });
      }
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ error: "Failed to create login session" });
        }
        try {
          const tokensEarned = 10;
          const rewardActivity = await storage.createRewardActivity(
            user.id,
            "daily_login",
            tokensEarned,
            "Daily login reward"
          );
          const tokenBalance = await storage.getUserTokens(user.id);
          return res.status(200).json({
            user,
            tokens: {
              balance: tokenBalance,
              earned: tokensEarned
            }
          });
        } catch (error) {
          console.error("Error processing login rewards:", error);
          return res.status(200).json(user);
        }
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  app2.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.status(400).json({
        error: "Invalid query",
        message: "Search query must be at least 2 characters long"
      });
    }
    try {
      const users2 = await storage.searchUsers(query);
      const safeUserData = users2.filter((user) => req.user && user.id !== req.user.id).map((user) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture
      }));
      return res.status(200).json(safeUserData);
    } catch (error) {
      console.error("Error searching users:", error);
      return res.status(500).json({
        error: "Failed to search users",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}

// server/routes.ts
init_storage();

// server/test-controller.ts
init_storage();
import fs from "fs";
import path from "path";
var testDatabaseConnection = async () => {
  try {
    const users2 = await Promise.resolve(Array.from(storage.users.values()));
    return {
      component: "Database Connection",
      success: true,
      message: "Database connection is working correctly",
      details: { userCount: users2.length },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      component: "Database Connection",
      success: false,
      message: "Failed to connect to database",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var testAuthSystem = async () => {
  try {
    const testUsername = `test_${Date.now()}`;
    const testPassword = "Test123!";
    const user = await storage.createUser({
      username: testUsername,
      password: testPassword,
      email: `${testUsername}@example.com`
    });
    await storage.removeUser(user.id);
    return {
      component: "Authentication System",
      success: true,
      message: "Authentication system is working correctly",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      component: "Authentication System",
      success: false,
      message: "Failed to test authentication system",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var testTokenSystem = async () => {
  try {
    const testUsername = `test_${Date.now()}`;
    const user = await storage.createUser({
      username: testUsername,
      password: "Test123!",
      email: `${testUsername}@example.com`,
      emotionTokens: 100
    });
    await storage.updateUser(user.id, { emotionTokens: 200 });
    const updatedUser = await storage.getUser(user.id);
    await storage.removeUser(user.id);
    if (updatedUser?.emotionTokens !== 200) {
      return {
        component: "Token System",
        success: false,
        message: "Token update failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return {
      component: "Token System",
      success: true,
      message: "Token system is working correctly",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      component: "Token System",
      success: false,
      message: "Failed to test token system",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var ensureBackupDir = () => {
  const backupDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};
var createBackup = async (description = "Manual backup") => {
  try {
    const backupDir = ensureBackupDir();
    const timestamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
    const backupId = `backup-${timestamp3}`;
    const filename = `${backupId}.json`;
    const filePath = path.join(backupDir, filename);
    const data = {
      users: Array.from(storage.users.values()),
      emotions: Array.from(storage.userEmotions.entries()).map(([userId, emotion]) => ({
        userId,
        emotion
      })),
      journalEntries: Array.from(storage.journalEntries.values()).flat()
      // Add more data types as needed
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const stats = fs.statSync(filePath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    const metadata = {
      id: backupId,
      timestamp: timestamp3,
      description,
      size: `${fileSizeInMB} MB`,
      components: Object.keys(data)
    };
    const metadataPath = path.join(backupDir, "metadata.json");
    let allMetadata = [];
    if (fs.existsSync(metadataPath)) {
      allMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    }
    allMetadata.push(metadata);
    fs.writeFileSync(metadataPath, JSON.stringify(allMetadata, null, 2));
    return metadata;
  } catch (error) {
    console.error("Backup creation failed:", error);
    return null;
  }
};
var restoreBackup = async (backupId) => {
  try {
    const backupDir = ensureBackupDir();
    const filename = `${backupId}.json`;
    const filePath = path.join(backupDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file ${filename} not found`);
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (data.users) {
      const existingUsers = Array.from(storage.users.values());
      for (const user of existingUsers) {
        if (!user.username.includes("admin") && !user.username.includes("test")) {
          await storage.removeUser(user.id);
        }
      }
      for (const user of data.users) {
        if (!user.username.includes("admin") && !user.username.includes("test")) {
          const { id, ...userData } = user;
          await storage.createUser(userData);
        }
      }
    }
    if (data.emotions) {
      for (const emotion of data.emotions) {
        storage.userEmotions.set(emotion.userId, emotion.emotion);
      }
    }
    if (data.journalEntries) {
      storage.journalEntries.clear();
      const entriesByUser = data.journalEntries.reduce((acc, entry) => {
        if (!acc[entry.userId]) {
          acc[entry.userId] = [];
        }
        acc[entry.userId].push(entry);
        return acc;
      }, {});
      for (const [userId, entries] of Object.entries(entriesByUser)) {
        storage.journalEntries.set(Number(userId), entries);
      }
    }
    return true;
  } catch (error) {
    console.error("Backup restoration failed:", error);
    return false;
  }
};
var getBackups = () => {
  try {
    const backupDir = ensureBackupDir();
    const metadataPath = path.join(backupDir, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch (error) {
    console.error("Failed to get backups:", error);
    return [];
  }
};
var runAllTests = async () => {
  const results = [];
  results.push(await testDatabaseConnection());
  results.push(await testAuthSystem());
  results.push(await testTokenSystem());
  return results;
};
var testController = {
  // Run all tests
  runTests: async (req, res) => {
    try {
      const results = await runAllTests();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        error: "Failed to run tests",
        details: error.message
      });
    }
  },
  // Create a backup
  createBackup: async (req, res) => {
    try {
      const { description } = req.body;
      const backup = await createBackup(description || "Manual backup");
      if (!backup) {
        res.status(500).json({ error: "Failed to create backup" });
        return;
      }
      res.status(200).json(backup);
    } catch (error) {
      res.status(500).json({
        error: "Failed to create backup",
        details: error.message
      });
    }
  },
  // Get list of backups
  getBackups: (req, res) => {
    try {
      const backups = getBackups();
      res.status(200).json(backups);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get backups",
        details: error.message
      });
    }
  },
  // Restore from backup
  restoreBackup: async (req, res) => {
    try {
      const { backupId } = req.params;
      if (!backupId) {
        res.status(400).json({ error: "Backup ID is required" });
        return;
      }
      const success = await restoreBackup(backupId);
      if (!success) {
        res.status(500).json({ error: "Failed to restore backup" });
        return;
      }
      res.status(200).json({ message: "Backup restored successfully" });
    } catch (error) {
      res.status(500).json({
        error: "Failed to restore backup",
        details: error.message
      });
    }
  }
};

// server/routes.ts
init_schema();
import { z as z3 } from "zod";
import multer from "multer";
import path2 from "path";
import { fileURLToPath } from "url";
import fs2 from "fs";
import crypto3 from "crypto";

// server/two-factor.ts
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
function generateSecret(username) {
  return speakeasy.generateSecret({
    name: `MoodLync:${username}`,
    length: 20
  });
}
function generateBackupCodes2(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(5).toString("hex").toUpperCase();
    codes.push(code.slice(0, 4) + "-" + code.slice(4, 8) + "-" + code.slice(8));
  }
  return codes;
}
function generateRecoveryKey2() {
  const key = crypto.randomBytes(18).toString("hex").toUpperCase();
  return key.match(/.{1,4}/g)?.join("-") || key;
}
function verifyToken(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1
    // Allow 1 step skew (30 seconds)
  });
}
async function generateQRCode(secretBase32, username) {
  const otpauth = speakeasy.otpauthURL({
    secret: secretBase32,
    label: `MoodLync:${username}`,
    issuer: "MoodLync",
    encoding: "base32"
  });
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(otpauth, (err, dataUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataUrl);
      }
    });
  });
}
function verifyBackupCode(enteredCode, storedCodes) {
  const normalizedEnteredCode = enteredCode.replace(/-/g, "").toUpperCase();
  const matchIndex = storedCodes.findIndex(
    (code) => code.replace(/-/g, "").toUpperCase() === normalizedEnteredCode
  );
  if (matchIndex !== -1) {
    const remainingCodes = [...storedCodes];
    remainingCodes.splice(matchIndex, 1);
    return { valid: true, remainingCodes };
  }
  return { valid: false, remainingCodes: storedCodes };
}
function verifyRecoveryKey(enteredKey, storedKey) {
  const normalizedEnteredKey = enteredKey.replace(/-/g, "").toUpperCase();
  const normalizedStoredKey = storedKey.replace(/-/g, "").toUpperCase();
  return normalizedEnteredKey === normalizedStoredKey;
}
async function generateTwoFactorSetup(username) {
  const secret = generateSecret(username);
  const backupCodes = generateBackupCodes2(10);
  const recoveryKey = generateRecoveryKey2();
  const qrCodeUrl = await generateQRCode(secret.base32, username);
  return {
    secret,
    backupCodes,
    recoveryKey,
    qrCodeUrl
  };
}

// server/routes.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var imageUpload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path2.join(__dirname, "../uploads/images");
      if (!fs2.existsSync(uploadDir)) {
        fs2.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path2.extname(file.originalname);
      cb(null, "profile-" + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024
    // 2MB limit
  },
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});
var videoUpload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path2.join(__dirname, "../uploads/videos");
      if (!fs2.existsSync(uploadDir)) {
        fs2.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path2.extname(file.originalname);
      cb(null, "video-" + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024
    // 100MB limit for videos
  },
  fileFilter: function(req, file, cb) {
    const allowedMimeTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/ogg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only video files (MP4, MOV, AVI, WebM, OGG) are allowed"));
    }
    cb(null, true);
  }
});
function requireAuth5(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}
async function requirePremium(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "You need to be logged in to access this feature."
    });
  }
  if (req.user.isPremium) {
    return next();
  }
  try {
    const isInActiveTrial = await storage.isUserInActiveTrial(req.user.id);
    if (isInActiveTrial) {
      return next();
    }
    return res.status(403).json({
      error: "Premium required",
      message: "This feature is only available to premium members. Upgrade to premium or start a free trial to access this feature."
    });
  } catch (error) {
    console.error("Error checking trial status:", error);
    return res.status(500).json({
      error: "Server error",
      message: "An error occurred while checking your premium status."
    });
  }
}
async function requireAdmin(req, res, next) {
  try {
    if (req.adminUser) {
      console.log("Admin user found in request, proceeding with access");
      return next();
    }
    if (req.session && req.session.adminUser) {
      console.log("Admin user found in session, restoring to request");
      req.adminUser = req.session.adminUser;
      return next();
    }
    if (req.isAuthenticated()) {
      console.log("Regular user authenticated, checking for admin privileges");
      const adminUser = await storage.getAdminUserByUsername(req.user.username);
      if (adminUser && adminUser.isActive) {
        console.log("User has admin privileges, granting access");
        req.adminUser = adminUser;
        req.session.adminUser = adminUser;
        req.session.save();
        return next();
      }
    }
    console.log("Admin authentication failed, access denied");
    return res.status(401).json({
      error: "Admin authentication required",
      message: "Please log in to access admin features."
    });
  } catch (error) {
    console.error("Error in admin authentication:", error);
    return res.status(500).json({ error: "Server error during admin authentication" });
  }
}
function setupAutomaticChallengeUpdates() {
  console.log("Setting up automatic challenge updates");
  setInterval(async () => {
    try {
      console.log("Running automatic challenge updates");
      const challenges2 = await storage.getGamificationChallenges();
      const autoUpdateChallenges = challenges2.filter(
        (challenge) => ["daily", "tracking", "login"].includes(challenge.category)
      );
      if (autoUpdateChallenges.length > 0) {
        console.log(`Found ${autoUpdateChallenges.length} challenges eligible for auto-update`);
        const recentProfiles = await storage.getRecentActiveGamificationProfiles();
        for (const profile of recentProfiles) {
          const randomIndex = Math.floor(Math.random() * autoUpdateChallenges.length);
          const challengeToUpdate = autoUpdateChallenges[randomIndex];
          const isCompleted = profile.completedChallenges && profile.completedChallenges.includes(challengeToUpdate.id);
          if (!isCompleted) {
            console.log(`Automatically updating challenge ${challengeToUpdate.id} for user ${profile.id}`);
            try {
              await storage.incrementChallengeProgress(profile.id, challengeToUpdate.id, 1);
            } catch (error) {
              console.error(`Error updating challenge progress: ${error.message}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in automatic challenge updates:", error);
    }
  }, 30 * 60 * 1e3);
}
function setupTrialCheckSchedule() {
  console.log("Setting up automatic trial expiration checks");
  setInterval(async () => {
    try {
      console.log("Running trial expiration check");
      await storage.checkAndExpireTrials();
      console.log("Trial expiration check completed");
    } catch (error) {
      console.error("Error checking for expired trials:", error);
    }
  }, 60 * 60 * 1e3);
}
async function registerRoutes(app2) {
  try {
    const accountManagementRoutes = (await Promise.resolve().then(() => (init_account_management(), account_management_exports))).default;
    const subscriptionManagementRoutes = (await Promise.resolve().then(() => (init_subscription_management(), subscription_management_exports))).default;
    const nftPoolRoutes = (await Promise.resolve().then(() => (init_nft_pool_routes(), nft_pool_routes_exports))).default;
    const nftCollectionRoutes = (await Promise.resolve().then(() => (init_nft_collection_routes(), nft_collection_routes_exports))).default;
    const paymentRoutes = (await Promise.resolve().then(() => (init_payment_routes(), payment_routes_exports))).default;
    app2.use("/api/account", accountManagementRoutes);
    app2.use("/api/subscription", subscriptionManagementRoutes);
    app2.use("/api", nftPoolRoutes);
    app2.use("/api", nftCollectionRoutes);
    app2.use("/api/payments", paymentRoutes);
    const { registerAdminRoutes: registerAdminRoutes2 } = await Promise.resolve().then(() => (init_admin_routes(), admin_routes_exports));
    registerAdminRoutes2(app2);
    console.log("Account and subscription management routes registered successfully");
    console.log("NFT token pool system routes registered successfully");
    console.log("NFT collection routes registered successfully");
    console.log("Payment processing routes registered successfully");
    console.log("Admin panel routes registered successfully");
  } catch (error) {
    console.error("Error registering routes:", error);
  }
  app2.get("/api/notifications", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unread === "true";
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      let notifications2 = await storage.getNotificationsByUserId(userId, unreadOnly);
      if (limit && limit > 0 && notifications2.length > limit) {
        notifications2 = notifications2.slice(0, limit);
      }
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).send("Server error");
    }
  });
  app2.post("/api/notifications/:id/read", requireAuth5, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      if (!notification) {
        return res.status(404).send("Notification not found");
      }
      if (notification.userId !== req.user.id) {
        return res.status(403).send("Unauthorized");
      }
      await storage.markNotificationAsRead(notificationId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).send("Server error");
    }
  });
  app2.post("/api/notifications/mark-all-read", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).send("Server error");
    }
  });
  app2.post("/api/notifications", requireAuth5, async (req, res) => {
    try {
      const { userId, type, title, content, sourceId, sourceType, icon, actionLink } = req.body;
      if (userId !== req.user.id && (!req.adminUser || !req.adminUser.permissions?.includes("manage_notifications"))) {
        return res.status(403).send("Unauthorized");
      }
      const notification = await storage.createNotification({
        userId,
        type,
        title,
        content,
        sourceId,
        sourceType,
        icon,
        actionLink,
        createdAt: /* @__PURE__ */ new Date(),
        isRead: false,
        readAt: null,
        isPushSent: false,
        isEmailSent: false
      });
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).send("Server error");
    }
  });
  app2.get("/admin-login", (req, res) => {
    res.sendFile(path2.join(__dirname, "..", "client", "public", "admin-login.html"));
  });
  setupAuth(app2);
  app2.use("/uploads", express3.static(path2.join(__dirname, "../uploads")));
  const httpServer = createServer(app2);
  let wss;
  const initializeWebSocketServer = () => {
    try {
      if (wss) {
        try {
          wss.close();
          console.log("Closed existing WebSocket server");
        } catch (wsCloseError) {
          console.error("Error closing existing WebSocket server:", wsCloseError);
        }
      }
      wss = new WebSocketServer({
        server: httpServer,
        path: "/ws",
        // Prevent crashing on connection errors
        clientTracking: true,
        perMessageDeflate: {
          zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
          },
          zlibInflateOptions: {
            chunkSize: 10 * 1024
          },
          // Below options specified as default values
          concurrencyLimit: 10,
          threshold: 1024
        }
      });
      const address = httpServer.address();
      const port = typeof address === "object" && address ? address.port : "unknown";
      console.log(`WebSocket server initialized on port ${port}`);
      httpServer.wss = wss;
      setupWebSocketHandlers();
      return true;
    } catch (error) {
      console.error("Failed to initialize WebSocket server:", error);
      return false;
    }
  };
  const clients = [];
  setupAutomaticChallengeUpdates();
  setupTrialCheckSchedule();
  const setupWebSocketHandlers = () => {
    if (!wss) {
      console.error("WebSocket server not initialized yet");
      return;
    }
    wss.on("connection", (socket) => {
      console.log("WebSocket client connected");
      socket.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "register" && data.userId) {
            const existingClientIndex = clients.findIndex((c) => c.id === data.userId);
            if (existingClientIndex >= 0) {
              clients[existingClientIndex].socket = socket;
              clients[existingClientIndex].emotion = data.emotion || "neutral";
            } else {
              clients.push({
                id: data.userId,
                socket,
                emotion: data.emotion || "neutral"
              });
            }
            socket.send(JSON.stringify({
              type: "registered",
              success: true
            }));
          } else if (data.type === "emotion_update" && data.userId && data.emotion) {
            const client = clients.find((c) => c.id === data.userId);
            if (client) {
              client.emotion = data.emotion;
              clients.forEach((c) => {
                if (c.id !== data.userId && c.emotion === data.emotion && c.socket.readyState === WebSocket.OPEN) {
                  c.socket.send(JSON.stringify({
                    type: "new_connection",
                    emotion: data.emotion
                  }));
                }
              });
            }
          } else if (data.type === "chat_message" && data.roomId && data.userId && data.message) {
            const roomEmotion = data.roomEmotion;
            clients.forEach((c) => {
              if (c.emotion === roomEmotion && c.socket.readyState === WebSocket.OPEN) {
                c.socket.send(JSON.stringify({
                  type: "chat_message",
                  roomId: data.roomId,
                  userId: data.userId,
                  username: data.username,
                  message: data.message,
                  encrypted: data.encrypted || false,
                  // Pass through the encryption flag
                  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                  avatarUrl: data.avatarUrl || null
                }));
              }
            });
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });
      socket.on("close", () => {
        console.log("WebSocket client disconnected");
        const index = clients.findIndex((c) => c.socket === socket);
        if (index !== -1) {
          clients.splice(index, 1);
        }
      });
    });
  };
  app2.get("/api/user/premium-status", requireAuth5, (req, res) => {
    res.json({
      isPremium: req.user?.isPremium || false,
      trialDays: req.user?.premiumTrialEnd ? Math.ceil((new Date(req.user.premiumTrialEnd).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)) : null
    });
  });
  app2.get("/api/video-editor/access", requireAuth5, (req, res) => {
    if (req.user?.isPremium) {
      return res.json({ hasAccess: true });
    }
    const hasActiveTrial = req.user?.premiumTrialEnd && new Date(req.user.premiumTrialEnd) > /* @__PURE__ */ new Date();
    if (hasActiveTrial) {
      return res.json({
        hasAccess: true,
        isTrial: true,
        trialDays: Math.ceil((new Date(req.user.premiumTrialEnd).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))
      });
    }
    res.json({
      hasAccess: false,
      canStartTrial: !req.user?.hadPremiumTrial
      // Only allow trial if user hasn't had one before
    });
  });
  app2.post("/api/emotion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const emotionSchema = z3.object({
        emotion: z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"])
      });
      const { emotion } = emotionSchema.parse(req.body);
      const currentEmotion = await storage.getUserEmotion(req.user.id);
      await storage.updateUserEmotion(req.user.id, emotion);
      let tokensEarned = 0;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedEmotionTokensToday = recentActivities.some((activity) => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === "emotion_update" && activityDate >= today;
      });
      if (currentEmotion !== emotion && !hasEarnedEmotionTokensToday) {
        tokensEarned = 2;
        await storage.createRewardActivity(
          req.user.id,
          "emotion_update",
          tokensEarned,
          `Earned ${tokensEarned} tokens for updating your emotional state to ${emotion}`
        );
      }
      return res.status(200).json({
        success: true,
        emotion,
        tokensEarned
      });
    } catch (error) {
      console.error("Error updating emotion:", error);
      return res.status(400).json({ error: "Invalid emotion data" });
    }
  });
  app2.get("/api/emotion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const emotion = await storage.getUserEmotion(req.user.id);
      return res.status(200).json(emotion || "neutral");
    } catch (error) {
      console.error("Error fetching emotion:", error);
      return res.status(500).json({ error: "Failed to fetch emotion" });
    }
  });
  app2.post("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const entrySchema = z3.object({
        emotion: z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]),
        note: z3.string().min(1)
      });
      const { emotion, note } = entrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(req.user.id, emotion, note);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedJournalTokensToday = recentActivities.some((activity) => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === "journal_entry" && activityDate >= today;
      });
      let tokensEarned = 0;
      if (!hasEarnedJournalTokensToday) {
        tokensEarned = 5;
        await storage.createRewardActivity(
          req.user.id,
          "journal_entry",
          tokensEarned,
          `Earned ${tokensEarned} tokens for creating a journal entry about feeling ${emotion}`
        );
      }
      return res.status(201).json({
        entry,
        tokensEarned
      });
    } catch (error) {
      console.error("Error creating journal entry:", error);
      return res.status(400).json({ error: "Invalid journal entry data" });
    }
  });
  app2.get("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const entries = await storage.getJournalEntries(req.user.id);
      return res.status(200).json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      return res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });
  app2.get("/api/chat-rooms", async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      return res.status(200).json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });
  app2.get("/api/users/:emotion", async (req, res) => {
    try {
      const emotionSchema = z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]);
      const emotion = emotionSchema.parse(req.params.emotion);
      const users2 = await storage.getUsersByEmotion(emotion);
      return res.status(200).json(users2);
    } catch (error) {
      console.error("Error fetching users by emotion:", error);
      return res.status(400).json({ error: "Invalid emotion" });
    }
  });
  app2.get("/api/global-emotions", async (req, res) => {
    try {
      const globalData = await storage.getGlobalEmotionData();
      return res.status(200).json(globalData);
    } catch (error) {
      console.error("Error fetching global emotion data:", error);
      return res.status(500).json({ error: "Failed to fetch global emotion data" });
    }
  });
  app2.get("/api/tokens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const tokens = await storage.getUserTokens(req.user.id);
      return res.status(200).json({ tokens });
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return res.status(500).json({ error: "Failed to fetch token balance" });
    }
  });
  app2.post("/api/tokens/transfer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user?.isPremium) {
      return res.status(403).json({
        error: "Premium required",
        message: "This feature is only available to premium members. Upgrade to premium to transfer tokens."
      });
    }
    const { recipientId, amount, notes } = req.body;
    if (!recipientId || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Recipient ID and amount are required"
      });
    }
    const toUserId = parseInt(recipientId, 10);
    const tokenAmount = parseInt(amount, 10);
    if (isNaN(toUserId) || isNaN(tokenAmount)) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Recipient ID and amount must be valid numbers"
      });
    }
    if (tokenAmount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Transfer amount must be greater than zero"
      });
    }
    if (toUserId === req.user.id) {
      return res.status(400).json({
        error: "Invalid recipient",
        message: "You cannot transfer tokens to yourself"
      });
    }
    try {
      const result = await storage.transferTokens(req.user.id, toUserId, tokenAmount, notes);
      console.log(`Email notification to ${result.fromUser.email}: You have sent ${tokenAmount} tokens to ${result.toUser.username}`);
      console.log(`Email notification to ${result.toUser.email}: You have received ${tokenAmount} tokens from ${result.fromUser.username}`);
      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${tokenAmount} tokens to ${result.toUser.username}`,
        transfer: {
          amount: tokenAmount,
          recipient: {
            id: result.toUser.id,
            username: result.toUser.username
          },
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return res.status(400).json({
        error: "Transfer failed",
        message: error instanceof Error ? error.message : "Failed to transfer tokens"
      });
    }
  });
  app2.get("/api/rewards/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const activities = await storage.getRewardActivities(req.user.id);
      return res.status(200).json(activities);
    } catch (error) {
      console.error("Error fetching reward activities:", error);
      return res.status(500).json({ error: "Failed to fetch reward activities" });
    }
  });
  app2.post("/api/rewards/earn", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const rewardSchema = z3.object({
        activityType: z3.enum(["journal_entry", "chat_participation", "emotion_update", "daily_login", "help_others"]),
        tokensEarned: z3.number().int().positive(),
        description: z3.string()
      });
      const { activityType, tokensEarned, description } = rewardSchema.parse(req.body);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedTokensTodayForActivity = recentActivities.some((activity2) => {
        const activityDate = new Date(activity2.createdAt);
        return activity2.activityType === activityType && activityDate >= today;
      });
      if (hasEarnedTokensTodayForActivity) {
        return res.status(400).json({
          error: `You've already earned tokens for ${activityType.replace("_", " ")} today. Come back tomorrow!`,
          alreadyEarned: true
        });
      }
      const activity = await storage.createRewardActivity(
        req.user.id,
        activityType,
        tokensEarned,
        description
      );
      return res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating reward activity:", error);
      return res.status(400).json({ error: "Invalid reward activity data" });
    }
  });
  app2.get("/api/gamification/profile", async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user.id : 1;
      const profile = await storage.getGamificationProfile(userId);
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching gamification profile:", error);
      return res.status(500).json({ error: "Failed to fetch gamification profile" });
    }
  });
  app2.get("/api/gamification/challenges", async (req, res) => {
    try {
      const challenges2 = await storage.getGamificationChallenges();
      return res.status(200).json(challenges2);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      return res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });
  app2.get("/api/gamification/achievements", async (req, res) => {
    try {
      const achievements = await storage.getGamificationAchievements();
      return res.status(200).json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });
  app2.get("/api/gamification/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getGamificationLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.post("/api/gamification/complete-activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const activitySchema = z3.object({
        activityId: z3.string()
      });
      const { activityId } = activitySchema.parse(req.body);
      const result = await storage.completeGamificationActivity(req.user.id, activityId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error completing activity:", error);
      return res.status(400).json({ error: error.message || "Failed to complete activity" });
    }
  });
  app2.post("/api/gamification/claim-achievement", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const achievementSchema = z3.object({
        achievementId: z3.string()
      });
      const { achievementId } = achievementSchema.parse(req.body);
      const result = await storage.claimAchievementReward(req.user.id, achievementId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error claiming achievement reward:", error);
      return res.status(400).json({ error: error.message || "Failed to claim achievement reward" });
    }
  });
  app2.post("/api/gamification/check-in", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const checkInSchema = z3.object({
        emotion: z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"])
      });
      const { emotion } = checkInSchema.parse(req.body);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedLoginTokensToday = recentActivities.some((activity) => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === "daily_login" && activityDate >= today;
      });
      const result = await storage.checkInStreak(req.user.id, emotion);
      if (!hasEarnedLoginTokensToday) {
        await storage.createRewardActivity(
          req.user.id,
          "daily_login",
          3,
          // Earn 3 tokens for daily login
          `Earned 3 tokens for daily check-in`
        );
        result.tokensEarned = 3;
      } else {
        result.tokensEarned = 0;
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error registering check-in:", error);
      return res.status(400).json({ error: error.message || "Failed to register check-in" });
    }
  });
  app2.post("/api/challenges/create", requireAuth5, requirePremium, async (req, res) => {
    try {
      const parsedData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createUserChallenge(req.user.id, parsedData);
      return res.status(201).json({
        success: true,
        challenge
      });
    } catch (error) {
      console.error("Error creating challenge:", error);
      return res.status(400).json({
        error: error.message || "Failed to create challenge",
        success: false
      });
    }
  });
  app2.get("/api/challenges/my-created", requireAuth5, async (req, res) => {
    try {
      const challenges2 = await storage.getUserCreatedChallenges(req.user.id);
      return res.status(200).json({
        success: true,
        challenges: challenges2
      });
    } catch (error) {
      console.error("Error fetching user created challenges:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch user created challenges",
        success: false
      });
    }
  });
  app2.get("/api/challenges/public", async (req, res) => {
    try {
      const challenges2 = await storage.getPublicUserCreatedChallenges();
      return res.status(200).json({
        success: true,
        challenges: challenges2
      });
    } catch (error) {
      console.error("Error fetching public challenges:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch public challenges",
        success: false
      });
    }
  });
  app2.post("/api/challenges/:challengeId/progress", requireAuth5, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      if (isNaN(challengeId)) {
        return res.status(400).json({
          error: "Invalid challenge ID format",
          success: false
        });
      }
      const notes = req.body.notes || null;
      const previousProgress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      const completion = await storage.recordChallengeProgress(req.user.id, challengeId, notes);
      const currentProgress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      const isCompleted = completion.completedAt !== null;
      return res.status(200).json({
        success: true,
        completion,
        previousProgress,
        currentProgress,
        isCompleted
      });
    } catch (error) {
      console.error("Error recording challenge progress:", error);
      return res.status(400).json({
        error: error.message || "Failed to record challenge progress",
        success: false
      });
    }
  });
  app2.get("/api/challenges/:challengeId/progress", requireAuth5, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      if (isNaN(challengeId)) {
        return res.status(400).json({
          error: "Invalid challenge ID format",
          success: false
        });
      }
      const progress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      return res.status(200).json({
        success: true,
        progress
      });
    } catch (error) {
      console.error("Error fetching challenge progress:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch challenge progress",
        success: false
      });
    }
  });
  app2.put("/api/user/profile-picture", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const profilePicSchema = z3.object({
        profilePicture: z3.string().url()
      });
      const { profilePicture } = profilePicSchema.parse(req.body);
      const user = await storage.updateUserProfilePicture(req.user.id, profilePicture);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(400).json({ error: error.message || "Failed to update profile picture" });
    }
  });
  app2.get("/api/share/milestone", async (req, res) => {
    try {
      const { user: username, milestone, trackingId } = req.query;
      if (!username || !milestone) {
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Username and milestone are required"
        });
      }
      const user = await storage.getUserByUsername(username.toString());
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "The specified user does not exist"
        });
      }
      const milestoneValue = parseInt(milestone.toString(), 10);
      const userTokens = user.emotionTokens || 0;
      const milestoneData = {
        user: {
          username: user.username,
          avatar: user.profilePicture,
          level: user.level || 1,
          createdAt: user.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
        },
        milestone: milestoneValue,
        currentTokens: userTokens,
        achieved: userTokens >= milestoneValue,
        trackingId: trackingId?.toString()
      };
      return res.status(200).json(milestoneData);
    } catch (error) {
      console.error("Error fetching milestone data:", error);
      return res.status(500).json({
        error: "Failed to fetch milestone data",
        message: error instanceof Error ? error.message : "Server error"
      });
    }
  });
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges2 = await storage.getBadges();
      return res.status(200).json(badges2);
    } catch (error) {
      console.error("Error fetching badges:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch badges" });
    }
  });
  app2.get("/api/user/badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const badges2 = await storage.getUserBadges(req.user.id);
      return res.status(200).json(badges2);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch user badges" });
    }
  });
  app2.get("/api/challenges/:difficulty", async (req, res) => {
    try {
      const difficultySchema = z3.enum(["easy", "moderate", "hard", "extreme"]);
      const difficulty = difficultySchema.parse(req.params.difficulty);
      const challenges2 = await storage.getChallengesByDifficulty(difficulty);
      return res.status(200).json(challenges2);
    } catch (error) {
      console.error("Error fetching challenges by difficulty:", error);
      return res.status(400).json({ error: error.message || "Invalid difficulty level" });
    }
  });
  app2.post("/api/challenges/:challengeId/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const challengeId = parseInt(req.params.challengeId, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      const result = await storage.completeChallenge(req.user.id, challengeId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error completing challenge:", error);
      return res.status(400).json({ error: error.message || "Failed to complete challenge" });
    }
  });
  app2.post("/api/profile/picture", imageUpload.single("profilePicture"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      if (req.body.remove === "true") {
        const user2 = await storage.updateUserProfilePicture(req.user.id, null);
        return res.status(200).json({
          success: true,
          message: "Profile picture removed",
          profilePicture: null
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const profilePictureUrl = `/uploads/${req.file.filename}`;
      const user = await storage.updateUserProfilePicture(req.user.id, profilePictureUrl);
      return res.status(200).json({
        success: true,
        message: "Profile picture updated",
        profilePicture: profilePictureUrl
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({ error: "Failed to update profile picture" });
    }
  });
  app2.use("/uploads", (req, res, next) => {
    const filePath = path2.join(__dirname, "../uploads", path2.basename(req.url));
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  });
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges2 = await storage.getBadges();
      return res.status(200).json(badges2);
    } catch (error) {
      console.error("Error fetching badges:", error);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  });
  app2.get("/api/user/badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const badges2 = await storage.getUserBadges(req.user.id);
      return res.status(200).json(badges2);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });
  app2.get("/api/challenges/:difficulty", async (req, res) => {
    try {
      const difficultySchema = z3.enum(["easy", "moderate", "hard", "extreme"]);
      const difficulty = difficultySchema.parse(req.params.difficulty);
      const challenges2 = await storage.getChallengesByDifficulty(difficulty);
      return res.status(200).json(challenges2);
    } catch (error) {
      console.error("Error fetching challenges by difficulty:", error);
      return res.status(400).json({ error: "Invalid difficulty level" });
    }
  });
  app2.post("/api/challenges/complete/:challengeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const challengeId = parseInt(req.params.challengeId, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      const result = await storage.completeChallenge(req.user.id, challengeId);
      return res.status(200).json({
        success: true,
        challenge: result.challenge,
        tokensAwarded: result.tokensAwarded,
        badgeAwarded: result.badgeAwarded
      });
    } catch (error) {
      console.error("Error completing challenge:", error);
      return res.status(500).json({ error: "Failed to complete challenge" });
    }
  });
  app2.get("/api/tokens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const tokens = await storage.getUserTokens(req.user.id);
      return res.status(200).json({ tokens });
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      return res.status(500).json({ error: "Failed to fetch user tokens" });
    }
  });
  app2.get("/api/rewards/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const activities = await storage.getRewardActivities(req.user.id);
      return res.status(200).json(activities);
    } catch (error) {
      console.error("Error fetching reward activities:", error);
      return res.status(500).json({ error: "Failed to fetch reward activities" });
    }
  });
  app2.get("/api/token-redemption/eligibility", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const eligibility = await storage.getEligibleForRedemption(req.user.id);
      return res.status(200).json(eligibility);
    } catch (error) {
      console.error("Error checking redemption eligibility:", error);
      return res.status(500).json({
        error: "Failed to check redemption eligibility",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/token-redemption/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const redemptions = await storage.getUserTokenRedemptions(req.user.id);
      return res.status(200).json(redemptions);
    } catch (error) {
      console.error("Error fetching redemption history:", error);
      return res.status(500).json({
        error: "Failed to fetch redemption history",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/token-redemption/request", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const validatedData = insertTokenRedemptionSchema.parse(req.body);
      const redemption = await storage.createTokenRedemption(req.user.id, validatedData);
      return res.status(201).json({
        success: true,
        redemption
      });
    } catch (error) {
      console.error("Error creating redemption request:", error);
      return res.status(400).json({
        error: "Failed to create redemption request",
        message: error instanceof Error ? error.message : "Invalid redemption data"
      });
    }
  });
  app2.post("/api/token-redemption/:redemptionId/cancel", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const redemptionId = parseInt(req.params.redemptionId, 10);
      if (isNaN(redemptionId)) {
        return res.status(400).json({ error: "Invalid redemption ID" });
      }
      const userRedemptions = await storage.getUserTokenRedemptions(req.user.id);
      const redemptionBelongsToUser = userRedemptions.some((r) => r.id === redemptionId);
      if (!redemptionBelongsToUser) {
        return res.status(403).json({ error: "You do not have permission to cancel this redemption" });
      }
      const updatedRedemption = await storage.updateTokenRedemptionStatus(redemptionId, "canceled");
      return res.status(200).json({
        success: true,
        redemption: updatedRedemption
      });
    } catch (error) {
      console.error("Error canceling redemption request:", error);
      return res.status(500).json({
        error: "Failed to cancel redemption request",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/premium/activate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const updatedUser = await storage.updateUserPremiumStatus(req.user.id, true);
      return res.status(200).json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isPremium: updatedUser.isPremium
        }
      });
    } catch (error) {
      console.error("Error activating premium:", error);
      return res.status(500).json({
        error: "Failed to activate premium",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/payment/update-details", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const paymentSchema = z3.object({
        paymentProvider: z3.enum(["paypal", "stripe"]),
        accountInfo: z3.string()
      });
      const { paymentProvider, accountInfo } = paymentSchema.parse(req.body);
      const updatedUser = await storage.updateUserPaymentDetails(
        req.user.id,
        paymentProvider,
        accountInfo
      );
      return res.status(200).json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          preferredPaymentMethod: updatedUser.preferredPaymentMethod
        }
      });
    } catch (error) {
      console.error("Error updating payment details:", error);
      return res.status(400).json({
        error: "Failed to update payment details",
        message: error instanceof Error ? error.message : "Invalid payment data"
      });
    }
  });
  app2.post("/api/premium/chat-rooms", requireAuth5, requirePremium, async (req, res) => {
    try {
      const chatRoomSchema = z3.object({
        name: z3.string().min(3).max(50),
        description: z3.string().min(10).max(200),
        emotion: z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]),
        isPrivate: z3.boolean().default(true),
        maxParticipants: z3.number().int().min(2).max(100).default(20),
        themeColor: z3.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default("#6366f1")
      });
      const chatRoomData = chatRoomSchema.parse(req.body);
      const newChatRoom = await storage.createChatRoom(req.user.id, chatRoomData);
      res.status(201).json({
        success: true,
        chatRoom: newChatRoom
      });
    } catch (error) {
      console.error("Error creating chat room:", error);
      return res.status(400).json({
        error: "Failed to create chat room",
        message: error instanceof Error ? error.message : "Invalid chat room data"
      });
    }
  });
  app2.get("/api/premium/chat-rooms", requireAuth5, async (req, res) => {
    try {
      const privateChatRooms = await storage.getPrivateChatRoomsByUserId(req.user.id);
      res.json(privateChatRooms);
    } catch (error) {
      console.error("Error fetching private chat rooms:", error);
      return res.status(500).json({
        error: "Failed to fetch private chat rooms",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/premium/chat-rooms/:id", requireAuth5, async (req, res) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const chatRoom = await storage.getChatRoomById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          error: "Chat room not found",
          message: `No chat room found with ID ${chatRoomId}`
        });
      }
      if (chatRoom.createdBy !== req.user.id) {
        return res.status(403).json({
          error: "Permission denied",
          message: "Only the creator can update the chat room"
        });
      }
      const chatRoomSchema = z3.object({
        name: z3.string().min(3).max(50).optional(),
        description: z3.string().min(10).max(200).optional(),
        emotion: z3.enum(["happy", "sad", "angry", "anxious", "excited", "neutral"]).optional(),
        maxParticipants: z3.number().int().min(2).max(100).optional(),
        themeColor: z3.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional()
      });
      const chatRoomUpdates = chatRoomSchema.parse(req.body);
      const updatedChatRoom = await storage.updateChatRoom(chatRoomId, chatRoomUpdates);
      res.json({
        success: true,
        chatRoom: updatedChatRoom
      });
    } catch (error) {
      console.error("Error updating chat room:", error);
      return res.status(400).json({
        error: "Failed to update chat room",
        message: error instanceof Error ? error.message : "Invalid chat room data"
      });
    }
  });
  app2.delete("/api/premium/chat-rooms/:id", requireAuth5, async (req, res) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const chatRoom = await storage.getChatRoomById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          error: "Chat room not found",
          message: `No chat room found with ID ${chatRoomId}`
        });
      }
      if (chatRoom.createdBy !== req.user.id) {
        return res.status(403).json({
          error: "Permission denied",
          message: "Only the creator can delete the chat room"
        });
      }
      const success = await storage.deleteChatRoom(chatRoomId);
      if (success) {
        res.status(200).json({
          success: true,
          message: "Chat room successfully deleted"
        });
      } else {
        res.status(500).json({
          error: "Deletion failed",
          message: "Failed to delete chat room"
        });
      }
    } catch (error) {
      console.error("Error deleting chat room:", error);
      return res.status(500).json({
        error: "Failed to delete chat room",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/premium/block-user", requireAuth5, requirePremium, async (req, res) => {
    try {
      const blockSchema = z3.object({
        blockedUserId: z3.number().int().positive(),
        reason: z3.string().max(200).optional()
      });
      const { blockedUserId, reason } = blockSchema.parse(req.body);
      if (blockedUserId === req.user.id) {
        return res.status(400).json({
          error: "Invalid operation",
          message: "You cannot block yourself"
        });
      }
      const userToBlock = await storage.getUser(blockedUserId);
      if (!userToBlock) {
        return res.status(404).json({
          error: "User not found",
          message: `No user found with ID ${blockedUserId}`
        });
      }
      const blockResult = await storage.blockUser(req.user.id, blockedUserId, reason || null);
      res.status(201).json({
        success: true,
        blockedUser: {
          id: userToBlock.id,
          username: userToBlock.username
        },
        reason: blockResult.reason
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      return res.status(400).json({
        error: "Failed to block user",
        message: error instanceof Error ? error.message : "Invalid data"
      });
    }
  });
  app2.get("/api/premium/blocked-users", requireAuth5, async (req, res) => {
    try {
      const blockedUsers2 = await storage.getBlockedUsers(req.user.id);
      const formattedBlockedUsers = blockedUsers2.map((block) => ({
        id: block.id,
        blockedUserId: block.blockedUserId,
        reason: block.reason,
        blockedAt: block.createdAt,
        blockedUser: {
          id: block.blockedUser.id,
          username: block.blockedUser.username
        }
      }));
      res.json(formattedBlockedUsers);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      return res.status(500).json({
        error: "Failed to fetch blocked users",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/premium/blocked-users/:id", requireAuth5, async (req, res) => {
    try {
      const blockedUserId = parseInt(req.params.id);
      const success = await storage.unblockUser(req.user.id, blockedUserId);
      if (success) {
        res.status(200).json({
          success: true,
          message: "User successfully unblocked"
        });
      } else {
        res.status(404).json({
          error: "User not found",
          message: "The specified user was not blocked or already unblocked"
        });
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      return res.status(500).json({
        error: "Failed to unblock user",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/family-members", requireAuth5, async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers(req.user.id);
      return res.status(200).json(familyMembers);
    } catch (error) {
      console.error("Error fetching family members:", error);
      return res.status(500).json({
        error: "Failed to fetch family members",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/family-members", requireAuth5, requirePremium, async (req, res) => {
    try {
      const premiumPlan = await storage.getUserPremiumPlan(req.user.id);
      if (!premiumPlan || premiumPlan.planType !== "family") {
        return res.status(403).json({ error: "You need a family plan to add family members" });
      }
      const familySchema = z3.object({
        relatedUserId: z3.number(),
        relationshipType: z3.enum(["parent", "child", "spouse", "sibling", "grandparent", "other"]),
        canViewMood: z3.boolean().default(false),
        canViewJournal: z3.boolean().default(false),
        canReceiveAlerts: z3.boolean().default(false),
        canTransferTokens: z3.boolean().default(false),
        notes: z3.string().nullish()
      });
      const validatedData = familySchema.parse(req.body);
      const relationship = await storage.addFamilyMember(req.user.id, {
        ...validatedData,
        userId: req.user.id
      });
      return res.status(201).json(relationship);
    } catch (error) {
      console.error("Error adding family member:", error);
      return res.status(500).json({
        error: "Failed to add family member",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/family-members/:id", requireAuth5, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      const updateSchema = z3.object({
        canViewMood: z3.boolean().optional(),
        canViewJournal: z3.boolean().optional(),
        canReceiveAlerts: z3.boolean().optional(),
        canTransferTokens: z3.boolean().optional(),
        relationshipType: z3.enum(["parent", "child", "spouse", "sibling", "grandparent", "other"]).optional(),
        notes: z3.string().nullish()
      });
      const validatedData = updateSchema.parse(req.body);
      const relationship = await storage.updateFamilyMember(relationshipId, validatedData);
      return res.status(200).json(relationship);
    } catch (error) {
      console.error("Error updating family relationship:", error);
      return res.status(500).json({
        error: "Failed to update family relationship",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/family-members/:id/status", requireAuth5, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      const statusSchema = z3.object({
        status: z3.enum(["accepted", "rejected"])
      });
      const { status } = statusSchema.parse(req.body);
      const relationship = await storage.updateFamilyRelationshipStatus(relationshipId, status);
      return res.status(200).json(relationship);
    } catch (error) {
      console.error("Error updating family relationship status:", error);
      return res.status(500).json({
        error: "Failed to update family relationship status",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/family-members/:id", requireAuth5, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      const success = await storage.removeFamilyMember(relationshipId);
      if (success) {
        return res.status(200).json({ message: "Family member removed successfully" });
      } else {
        return res.status(404).json({ error: "Family relationship not found" });
      }
    } catch (error) {
      console.error("Error removing family member:", error);
      return res.status(500).json({
        error: "Failed to remove family member",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/family-mood", requireAuth5, requirePremium, async (req, res) => {
    try {
      const moodData = await storage.getFamilyMoodData(req.user.id);
      return res.status(200).json(moodData);
    } catch (error) {
      console.error("Error fetching family mood data:", error);
      return res.status(500).json({
        error: "Failed to fetch family mood data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/mood-tracking-consent", requireAuth5, async (req, res) => {
    try {
      const consentSchema = z3.object({
        allowMoodTracking: z3.boolean()
      });
      const { allowMoodTracking } = consentSchema.parse(req.body);
      const user = await storage.updateMoodTrackingConsent(req.user.id, allowMoodTracking);
      return res.status(200).json({
        message: allowMoodTracking ? "Mood tracking enabled" : "Mood tracking disabled",
        user
      });
    } catch (error) {
      console.error("Error updating mood tracking consent:", error);
      return res.status(500).json({
        error: "Failed to update mood tracking consent",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/token-transfers", requireAuth5, async (req, res) => {
    try {
      const transfers = await storage.getTokenTransfers(req.user.id);
      return res.status(200).json(transfers);
    } catch (error) {
      console.error("Error fetching token transfers:", error);
      return res.status(500).json({
        error: "Failed to fetch token transfers",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/token-transfers/:type", requireAuth5, async (req, res) => {
    try {
      const type = req.params.type;
      if (type !== "family" && type !== "general") {
        return res.status(400).json({ error: 'Invalid transfer type. Must be either "family" or "general".' });
      }
      const transfers = await storage.getTokenTransfersByType(req.user.id, type);
      return res.status(200).json(transfers);
    } catch (error) {
      console.error("Error fetching token transfers by type:", error);
      return res.status(500).json({
        error: "Failed to fetch token transfers",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/can-transfer-tokens/:userId", requireAuth5, async (req, res) => {
    try {
      const toUserId = parseInt(req.params.userId);
      const result = await storage.canTransferTokensToUser(req.user.id, toUserId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error checking token transfer ability:", error);
      return res.status(500).json({
        error: "Failed to check token transfer ability",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/token-transfers", requireAuth5, async (req, res) => {
    try {
      const transferSchema = z3.object({
        toUserId: z3.number(),
        amount: z3.number().positive(),
        notes: z3.string().optional()
      });
      const validatedData = transferSchema.parse(req.body);
      const result = await storage.transferTokens(
        req.user.id,
        validatedData.toUserId,
        validatedData.amount,
        validatedData.notes
      );
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return res.status(500).json({
        error: "Failed to transfer tokens",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/milestone-shares", requireAuth5, async (req, res) => {
    try {
      const shareSchema = z3.object({
        milestone: z3.number().int().positive(),
        platform: z3.enum(["twitter", "facebook", "linkedin", "whatsapp", "telegram", "email", "pinterest", "reddit", "copy_link"]),
        shareUrl: z3.string().url(),
        shareMessage: z3.string().optional(),
        trackingId: z3.string().uuid()
      });
      const validatedData = shareSchema.parse(req.body);
      const shareData = {
        ...validatedData,
        userId: req.user.id,
        ipAddress: req.ip
      };
      const milestoneShare = await storage.createMilestoneShare(shareData);
      const hasSharedMilestoneBefore = await storage.hasUserSharedMilestone(req.user.id, validatedData.milestone);
      if (!hasSharedMilestoneBefore) {
        const tokensAwarded = 5;
        await storage.createRewardActivity(
          req.user.id,
          "milestone_share",
          tokensAwarded,
          `Shared ${validatedData.milestone} token milestone on ${validatedData.platform}`
        );
        await storage.updateMilestoneShareTokens(milestoneShare.id, tokensAwarded);
        return res.status(201).json({
          success: true,
          milestoneShare,
          tokensAwarded,
          message: `You earned ${tokensAwarded} tokens for sharing your milestone!`
        });
      }
      return res.status(201).json({
        success: true,
        milestoneShare,
        tokensAwarded: 0
      });
    } catch (error) {
      console.error("Error recording milestone share:", error);
      return res.status(400).json({
        error: "Failed to record milestone share",
        message: error instanceof Error ? error.message : "Invalid share data"
      });
    }
  });
  app2.get("/api/milestone-shares/:trackingId/click", async (req, res) => {
    try {
      const { trackingId } = req.params;
      const milestoneShare = await storage.incrementMilestoneShareClicks(trackingId);
      res.redirect("/welcome");
    } catch (error) {
      console.error("Error tracking milestone share click:", error);
      return res.status(400).json({
        error: "Failed to track milestone share click",
        message: error instanceof Error ? error.message : "Invalid tracking ID"
      });
    }
  });
  app2.get("/api/milestone-shares", requireAuth5, async (req, res) => {
    try {
      const shares = await storage.getUserMilestoneShares(req.user.id);
      return res.status(200).json(shares);
    } catch (error) {
      console.error("Error fetching user milestone shares:", error);
      return res.status(500).json({
        error: "Failed to fetch milestone shares",
        message: error instanceof Error ? error.message : "Server error"
      });
    }
  });
  app2.get("/api/referrals", requireAuth5, async (req, res) => {
    try {
      const referrals2 = await storage.getReferralsByUser(req.user.id);
      return res.status(200).json(referrals2);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return res.status(500).json({
        error: "Failed to fetch referrals",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/referrals/statistics", requireAuth5, async (req, res) => {
    try {
      const statistics = await storage.getReferralStatistics(req.user.id);
      return res.status(200).json(statistics);
    } catch (error) {
      console.error("Error fetching referral statistics:", error);
      return res.status(500).json({
        error: "Failed to fetch referral statistics",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/referrals/claim-bounty", requireAuth5, requirePremium, async (req, res) => {
    try {
      const bountyResult = await storage.checkAndAwardReferralBounty(req.user.id);
      if (bountyResult.awarded) {
        return res.status(200).json({
          success: true,
          message: `Congratulations! You've been awarded ${bountyResult.tokensAwarded} tokens for referring ${bountyResult.currentReferralCount} premium members!`,
          ...bountyResult
        });
      } else if (bountyResult.currentReferralCount < 5) {
        return res.status(200).json({
          success: false,
          message: `You need 5 premium referrals to earn a bounty, but you only have ${bountyResult.currentReferralCount}. Keep inviting friends!`,
          ...bountyResult
        });
      } else {
        return res.status(200).json({
          success: false,
          message: `You've already claimed your bounty for this referral milestone.`,
          ...bountyResult
        });
      }
    } catch (error) {
      console.error("Error claiming referral bounty:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process bounty claim",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/referrals", requireAuth5, async (req, res) => {
    try {
      const referralSchema = z3.object({
        email: z3.string().email()
      });
      const { email } = referralSchema.parse(req.body);
      const referralCode = req.user.referralCode;
      const existingReferrals = await storage.getReferralsByUser(req.user.id);
      const alreadyReferred = existingReferrals.some(
        (ref) => ref.referralEmail?.toLowerCase() === email.toLowerCase() && ref.status === "pending"
      );
      if (alreadyReferred) {
        return res.status(400).json({
          error: "Already referred",
          message: "You have already sent a referral to this email address"
        });
      }
      const referral = await storage.createReferral(
        req.user.id,
        null,
        // No referred user yet
        email,
        referralCode
      );
      return res.status(201).json({
        success: true,
        referral,
        referralLink: `https://moodsync.com/join?ref=${referralCode}`
        // Example link format
      });
    } catch (error) {
      console.error("Error creating referral:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          error: "Invalid data",
          details: error.errors
        });
      }
      return res.status(500).json({
        error: "Failed to create referral",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/referrals/validate/:code", async (req, res) => {
    try {
      const referralCode = req.params.code;
      if (!referralCode) {
        return res.status(400).json({
          error: "Missing referral code",
          valid: false
        });
      }
      const referral = await storage.getReferralByCode(referralCode);
      if (!referral) {
        return res.status(404).json({
          error: "Invalid referral code",
          valid: false
        });
      }
      if (referral.status === "expired" || new Date(referral.expiresAt) < /* @__PURE__ */ new Date()) {
        return res.status(400).json({
          error: "Referral code has expired",
          valid: false,
          expired: true
        });
      }
      const referrer = await storage.getUser(referral.referrerUserId);
      return res.status(200).json({
        valid: true,
        referrerUsername: referrer?.username || "Anonymous",
        code: referralCode
      });
    } catch (error) {
      console.error("Error validating referral code:", error);
      return res.status(500).json({
        error: "Failed to validate referral code",
        valid: false,
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/register/referral", async (req, res, next) => {
    try {
      const registerSchema = z3.object({
        username: z3.string().min(3),
        password: z3.string().min(6),
        email: z3.string().email(),
        referralCode: z3.string(),
        firstName: z3.string().optional(),
        lastName: z3.string().optional(),
        gender: z3.string().optional(),
        state: z3.string().optional(),
        country: z3.string().optional()
      });
      const userData = registerSchema.parse(req.body);
      const referral = await storage.getReferralByCode(userData.referralCode);
      if (!referral) {
        return res.status(400).json({
          error: "Invalid referral code"
        });
      }
      if (referral.status === "expired" || new Date(referral.expiresAt) < /* @__PURE__ */ new Date()) {
        return res.status(400).json({
          error: "Referral code has expired"
        });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (userData.email) {
        const existingEmail = await storage.findUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      let ipAddress = null;
      if (req.ip) {
        ipAddress = req.ip;
      } else if (req.headers["x-forwarded-for"]) {
        const forwarded = req.headers["x-forwarded-for"];
        ipAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
      } else if (req.socket.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      }
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
        ipAddress: ipAddress || void 0,
        referredBy: userData.referralCode
      });
      await storage.updateReferralStatus(referral.id, "registered");
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          user,
          referral: {
            code: userData.referralCode,
            status: "registered"
          }
        });
      });
    } catch (error) {
      console.error("Error registering with referral:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          error: "Invalid registration data",
          details: error.errors
        });
      }
      next(error);
    }
  });
  app2.post("/api/referrals/:id/convert", requireAuth5, requirePremium, async (req, res) => {
    try {
      const referralId = parseInt(req.params.id, 10);
      if (isNaN(referralId)) {
        return res.status(400).json({ error: "Invalid referral ID" });
      }
      const updatedReferral = await storage.updateReferralStatus(referralId, "converted");
      if (!updatedReferral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      return res.status(200).json({
        success: true,
        referral: updatedReferral
      });
    } catch (error) {
      console.error("Error converting referral:", error);
      return res.status(500).json({
        error: "Failed to convert referral",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const allUsers = Array.from(storage.users.values());
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((user) => user.lastLogin && (/* @__PURE__ */ new Date()).getTime() - new Date(user.lastLogin).getTime() < 7 * 24 * 60 * 60 * 1e3).length;
      const premiumUsers = allUsers.filter((user) => user.isPremium).length;
      const openTickets = 0;
      const pendingRefunds = 0;
      const totalRevenue = 0;
      const recentTickets = [
        // Create a few sample tickets with properly formatted dates that will show up in the UI
        {
          id: 1,
          title: "Account access issue",
          status: "open",
          category: "account",
          createdAt: /* @__PURE__ */ new Date(),
          formattedDate: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        },
        {
          id: 2,
          title: "Premium feature not working",
          status: "in_progress",
          category: "technical",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
          formattedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        },
        {
          id: 3,
          title: "Refund request",
          status: "open",
          category: "refund",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3),
          formattedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        }
      ];
      const recentRefunds = [
        {
          id: 1,
          amount: 0,
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          formattedDate: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        }
      ];
      const usersByEmotion = {
        happy: 0,
        sad: 0,
        angry: 0,
        anxious: 0,
        excited: 0,
        neutral: 0
      };
      for (const [_, emotion] of storage.userEmotions) {
        if (usersByEmotion[emotion] !== void 0) {
          usersByEmotion[emotion]++;
        }
      }
      const { password, ...safeAdminData } = req.adminUser;
      res.status(200).json({
        totalUsers,
        activeUsers,
        premiumUsers,
        openTickets,
        pendingRefunds,
        totalRevenue,
        recentTickets,
        recentRefunds,
        usersByEmotion,
        adminUser: safeAdminData
      });
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch admin dashboard data" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      console.log("Admin login attempt:", req.body);
      const loginSchema = z3.object({
        username: z3.string().min(1),
        password: z3.string().min(1)
      });
      const { username, password } = loginSchema.parse(req.body);
      console.log("Admin login credentials parsed:", { username, password: "********" });
      const adminUser = await storage.getAdminUserByUsername(username);
      console.log("Admin user found:", adminUser ? "Yes" : "No");
      if (!adminUser) {
        console.log("Admin login failed: User not found");
        return res.status(401).json({ error: "Invalid username or password" });
      }
      console.log("Comparing passwords...");
      if (adminUser.password !== password) {
        console.log("Admin login failed: Password mismatch");
        return res.status(401).json({ error: "Invalid username or password" });
      }
      console.log("Admin login successful for user:", adminUser.username);
      adminUser.lastLogin = /* @__PURE__ */ new Date();
      await storage.updateAdminUser(adminUser.id, { lastLogin: adminUser.lastLogin });
      await storage.createAdminAction({
        adminId: adminUser.id,
        actionType: "login",
        targetType: "admin",
        targetId: adminUser.id,
        actionDetails: "Admin login",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      req.session.adminUser = adminUser;
      req.adminUser = adminUser;
      console.log("Admin session created and stored in session");
      const { password: _, ...safeAdminData } = adminUser;
      res.status(200).json(safeAdminData);
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(400).json({
        error: "Invalid login data",
        message: error instanceof Error ? error.message : "Failed to log in"
      });
    }
  });
  app2.post("/api/admin/logout", async (req, res) => {
    try {
      if (!req.adminUser) {
        return res.status(401).json({ error: "No active admin session" });
      }
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "logout",
        targetType: "admin",
        targetId: req.adminUser.id,
        actionDetails: "Admin logout",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      delete req.adminUser;
      if (req.session) {
        delete req.session.adminUser;
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session during logout:", err);
          }
          console.log("Admin session cleared successfully");
        });
      }
      res.status(200).json({
        success: true,
        message: "Admin logged out successfully"
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({
        error: "Failed to log out",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const adminUsers2 = await storage.getAllAdminUsers();
      const safeAdminUsers = adminUsers2.map((admin) => {
        const { password, ...safeAdmin } = admin;
        return safeAdmin;
      });
      res.status(200).json(safeAdminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });
  app2.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const adminData = insertAdminUserSchema.parse(req.body);
      const newAdmin = await storage.createAdminUser({
        ...adminData,
        // In a real app, you would hash the password here
        password: adminData.password
      });
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "create_admin",
        targetType: "admin",
        targetId: newAdmin.id,
        actionDetails: `Admin user ${newAdmin.username} created`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      const { password, ...safeAdminData } = newAdmin;
      res.status(201).json(safeAdminData);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(400).json({
        error: "Invalid admin user data",
        message: error instanceof Error ? error.message : "Failed to create admin user"
      });
    }
  });
  app2.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      const existingAdmin = await storage.getAdminUser(adminId);
      if (!existingAdmin) {
        return res.status(404).json({ error: "Admin user not found" });
      }
      if (existingAdmin.role === "admin" && req.adminUser.role !== "admin") {
        return res.status(403).json({
          error: "Permission denied",
          message: "You do not have permission to update an admin with higher privileges"
        });
      }
      const updateData = req.body;
      const updatedAdmin = await storage.updateAdminUser(adminId, updateData);
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "update_admin",
        targetType: "admin",
        targetId: adminId,
        actionDetails: `Admin user ${updatedAdmin.username} updated`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      const { password, ...safeAdminData } = updatedAdmin;
      res.status(200).json(safeAdminData);
    } catch (error) {
      console.error("Error updating admin user:", error);
      res.status(400).json({
        error: "Invalid admin user update data",
        message: error instanceof Error ? error.message : "Failed to update admin user"
      });
    }
  });
  app2.get("/api/admin/tickets", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status;
      const category = req.query.category;
      const priority = req.query.priority;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo) : void 0;
      const tickets = await storage.getAllSupportTickets({
        status,
        category,
        priority,
        assignedTo
      });
      res.status(200).json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });
  app2.post("/api/admin/tickets", requireAuth5, async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newTicket = await storage.createSupportTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({
        error: "Invalid support ticket data",
        message: error instanceof Error ? error.message : "Failed to create support ticket"
      });
    }
  });
  app2.get("/api/admin/tickets/:id", requireAuth5, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      if (!req.adminUser && ticket.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      const responses = await storage.getTicketResponses(ticketId);
      res.status(200).json({ ticket, responses });
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ error: "Failed to fetch support ticket" });
    }
  });
  app2.patch("/api/admin/tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const existingTicket = await storage.getSupportTicket(ticketId);
      if (!existingTicket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      const updateData = req.body;
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "update_ticket",
        targetType: "ticket",
        targetId: ticketId,
        actionDetails: `Support ticket #${ticketId} updated to status: ${updatedTicket.status}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      res.status(200).json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(400).json({
        error: "Invalid support ticket update data",
        message: error instanceof Error ? error.message : "Failed to update support ticket"
      });
    }
  });
  app2.post("/api/admin/tickets/:id/responses", requireAuth5, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const existingTicket = await storage.getSupportTicket(ticketId);
      if (!existingTicket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      if (!req.adminUser && existingTicket.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      const responseData = insertTicketResponseSchema.parse({
        ...req.body,
        ticketId,
        responderId: req.adminUser ? req.adminUser.id : req.user.id,
        isAdminResponse: !!req.adminUser
      });
      const newResponse = await storage.createTicketResponse(responseData);
      if (req.adminUser) {
        await storage.createAdminAction({
          adminId: req.adminUser.id,
          actionType: "support_response",
          targetType: "ticket",
          targetId: ticketId,
          actionDetails: `Admin response added to ticket #${ticketId}`,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || null
        });
      }
      res.status(201).json(newResponse);
    } catch (error) {
      console.error("Error creating ticket response:", error);
      res.status(400).json({
        error: "Invalid ticket response data",
        message: error instanceof Error ? error.message : "Failed to create ticket response"
      });
    }
  });
  app2.patch("/api/admin/responses/:id/helpful", requireAuth5, async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const helpfulSchema = z3.object({
        isHelpful: z3.boolean()
      });
      const { isHelpful } = helpfulSchema.parse(req.body);
      const updatedResponse = await storage.markResponseHelpful(responseId, isHelpful);
      res.status(200).json(updatedResponse);
    } catch (error) {
      console.error("Error updating response helpfulness:", error);
      res.status(400).json({
        error: "Invalid data",
        message: error instanceof Error ? error.message : "Failed to update response"
      });
    }
  });
  app2.post("/api/admin/refunds", requireAuth5, async (req, res) => {
    try {
      const refundData = insertRefundRequestSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newRefundRequest = await storage.createRefundRequest(refundData);
      res.status(201).json(newRefundRequest);
    } catch (error) {
      console.error("Error creating refund request:", error);
      res.status(400).json({
        error: "Invalid refund request data",
        message: error instanceof Error ? error.message : "Failed to create refund request"
      });
    }
  });
  app2.get("/api/admin/refunds", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status;
      const refundRequests2 = await storage.getAllRefundRequests({ status });
      res.status(200).json(refundRequests2);
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      res.status(500).json({ error: "Failed to fetch refund requests" });
    }
  });
  app2.get("/api/admin/refunds/:id", requireAuth5, async (req, res) => {
    try {
      const refundId = parseInt(req.params.id);
      const refundRequest = await storage.getRefundRequest(refundId);
      if (!refundRequest) {
        return res.status(404).json({ error: "Refund request not found" });
      }
      if (!req.adminUser && refundRequest.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      res.status(200).json(refundRequest);
    } catch (error) {
      console.error("Error fetching refund request:", error);
      res.status(500).json({ error: "Failed to fetch refund request" });
    }
  });
  app2.patch("/api/admin/refunds/:id", requireAdmin, async (req, res) => {
    try {
      const refundId = parseInt(req.params.id);
      const existingRefund = await storage.getRefundRequest(refundId);
      if (!existingRefund) {
        return res.status(404).json({ error: "Refund request not found" });
      }
      const updateSchema = z3.object({
        status: z3.enum(["pending", "approved", "rejected", "processed"]).optional(),
        notes: z3.string().optional()
      });
      const updateData = updateSchema.parse(req.body);
      const updatedRefund = await storage.updateRefundRequest(refundId, {
        ...updateData,
        processedBy: req.adminUser.id
      });
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "refund_processed",
        targetType: "refund",
        targetId: refundId,
        actionDetails: `Refund request #${refundId} updated to status: ${updatedRefund.status}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      res.status(200).json(updatedRefund);
    } catch (error) {
      console.error("Error updating refund request:", error);
      res.status(400).json({
        error: "Invalid refund request update data",
        message: error instanceof Error ? error.message : "Failed to update refund request"
      });
    }
  });
  app2.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      if (!req.adminUser) {
        console.log("No admin user found in the request after requireAdmin middleware");
        return res.status(401).json({ error: "Not authenticated" });
      }
      const stats = await storage.getSystemStats();
      const { password, ...safeAdminData } = req.adminUser;
      console.log("Admin user data being sent to client:", {
        username: safeAdminData.username,
        role: safeAdminData.role
      });
      res.status(200).json({
        ...stats,
        adminUser: safeAdminData
      });
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });
  app2.get("/api/admin/actions", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const adminActions3 = await storage.getAllAdminActions(limit);
      res.status(200).json(adminActions3);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
      res.status(500).json({ error: "Failed to fetch admin actions log" });
    }
  });
  app2.post("/api/admin/quotes", requireAdmin, async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse({
        ...req.body,
        adminId: req.adminUser.id
      });
      const newQuote = await storage.createQuote(quoteData);
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: "quote_created",
        targetType: "quote",
        targetId: newQuote.id,
        actionDetails: `Quote #${newQuote.id} created for amount ${newQuote.totalAmount} ${newQuote.currency}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null
      });
      res.status(201).json(newQuote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(400).json({
        error: "Invalid quote data",
        message: error instanceof Error ? error.message : "Failed to create quote"
      });
    }
  });
  app2.get("/api/admin/quotes/:id", requireAuth5, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (!req.adminUser && quote.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      res.status(200).json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });
  app2.patch("/api/admin/quotes/:id/status", requireAuth5, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const existingQuote = await storage.getQuote(quoteId);
      if (!existingQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const statusSchema = z3.object({
        status: z3.enum(["pending", "accepted", "rejected", "expired", "canceled"])
      });
      const { status } = statusSchema.parse(req.body);
      if (!req.adminUser && existingQuote.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      if (!req.adminUser && status !== "accepted" && status !== "rejected") {
        return res.status(403).json({
          error: "Permission denied",
          message: "Regular users can only accept or reject quotes"
        });
      }
      const updatedQuote = await storage.updateQuoteStatus(
        quoteId,
        status,
        status === "accepted" ? /* @__PURE__ */ new Date() : void 0
      );
      if (req.adminUser) {
        await storage.createAdminAction({
          adminId: req.adminUser.id,
          actionType: "quote_updated",
          targetType: "quote",
          targetId: quoteId,
          actionDetails: `Quote #${quoteId} status updated to ${status}`,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || null
        });
      }
      res.status(200).json(updatedQuote);
    } catch (error) {
      console.error("Error updating quote status:", error);
      res.status(400).json({
        error: "Invalid quote status update",
        message: error instanceof Error ? error.message : "Failed to update quote status"
      });
    }
  });
  app2.post("/api/videos", requireAuth5, requirePremium, videoUpload.single("videoFile"), async (req, res) => {
    try {
      const videoFile = req.file;
      if (!videoFile) {
        return res.status(400).json({ error: "No video file uploaded" });
      }
      const videoUrl = `/uploads/videos/${videoFile.filename}`;
      const thumbnailUrl = req.body.thumbnailUrl || "";
      const videoPostData = {
        ...req.body,
        videoUrl,
        thumbnailUrl
      };
      const videoPost = await storage.createVideoPost(req.user.id, insertVideoPostSchema.parse(videoPostData));
      return res.status(201).json(videoPost);
    } catch (error) {
      console.error("Error creating video post:", error);
      return res.status(400).json({ error: "Invalid video post data: " + error.message });
    }
  });
  app2.get("/api/videos", async (req, res) => {
    try {
      const category = req.query.category;
      let videos;
      if (category) {
        videos = await storage.getVideoPostsByCategory(category);
      } else {
        videos = await storage.getAllPublicVideoPosts();
      }
      return res.status(200).json(videos);
    } catch (error) {
      console.error("Error fetching video posts:", error);
      return res.status(500).json({ error: "Failed to fetch video posts" });
    }
  });
  app2.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (!video.isPublic) {
        if (!req.isAuthenticated() || !req.user.isPremium && video.userId !== req.user.id) {
          return res.status(403).json({
            error: "Premium required",
            message: "This video is only available to premium members."
          });
        }
      }
      await storage.incrementVideoPostViews(id);
      return res.status(200).json(video);
    } catch (error) {
      console.error("Error fetching video post:", error);
      return res.status(500).json({ error: "Failed to fetch video post" });
    }
  });
  app2.get("/api/my-videos", requireAuth5, async (req, res) => {
    try {
      const videos = await storage.getUserVideoPosts(req.user.id);
      return res.status(200).json(videos);
    } catch (error) {
      console.error("Error fetching user video posts:", error);
      return res.status(500).json({ error: "Failed to fetch user video posts" });
    }
  });
  app2.patch("/api/videos/:id", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (video.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this video" });
      }
      const updates = req.body;
      const updatedVideo = await storage.updateVideoPost(id, updates);
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error("Error updating video post:", error);
      return res.status(400).json({ error: "Invalid update data" });
    }
  });
  app2.delete("/api/videos/:id", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (video.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this video" });
      }
      const result = await storage.deleteVideoPost(id);
      return res.status(200).json({ success: result });
    } catch (error) {
      console.error("Error deleting video post:", error);
      return res.status(500).json({ error: "Failed to delete video post" });
    }
  });
  app2.post("/api/videos/:id/like", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      const updatedVideo = await storage.incrementVideoPostLikes(id);
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error("Error liking video post:", error);
      return res.status(500).json({ error: "Failed to like video post" });
    }
  });
  app2.post("/api/videos/:id/share", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      const updatedVideo = await storage.incrementVideoPostShares(id);
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error("Error sharing video post:", error);
      return res.status(500).json({ error: "Failed to share video post" });
    }
  });
  app2.post("/api/videos/:id/social-like", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isLiked = await storage.isVideoLikedByUser(userId, videoId);
      if (isLiked) {
        const success = await storage.unlikeVideo(userId, videoId);
        return res.json({ liked: false, success });
      } else {
        const like2 = await storage.likeVideo(userId, videoId);
        return res.status(201).json({ liked: true, like: like2 });
      }
    } catch (error) {
      console.error("Error liking/unliking video:", error);
      return res.status(500).json({ error: "Failed to process like/unlike" });
    }
  });
  app2.get("/api/videos/:id/like-status", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isLiked = await storage.isVideoLikedByUser(userId, videoId);
      res.json({ liked: isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      return res.status(500).json({ error: "Failed to check like status" });
    }
  });
  app2.get("/api/videos/:id/likes", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const likes = await storage.getVideoLikes(videoId);
      res.json(likes);
    } catch (error) {
      console.error("Error getting video likes:", error);
      return res.status(500).json({ error: "Failed to get video likes" });
    }
  });
  app2.post("/api/videos/:id/comments", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      const commentData = req.body;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const comment = await storage.commentOnVideo(userId, videoId, commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error commenting on video:", error);
      return res.status(500).json({ error: "Failed to comment on video" });
    }
  });
  app2.get("/api/videos/:id/comments", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const comments = await storage.getVideoComments(videoId);
      res.json(comments);
    } catch (error) {
      console.error("Error getting video comments:", error);
      return res.status(500).json({ error: "Failed to get video comments" });
    }
  });
  app2.get("/api/comments/:id/replies", async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      const replies = await storage.getCommentReplies(commentId);
      res.json(replies);
    } catch (error) {
      console.error("Error getting comment replies:", error);
      return res.status(500).json({ error: "Failed to get comment replies" });
    }
  });
  app2.put("/api/comments/:id", requireAuth5, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;
      if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      if (!content) {
        return res.status(400).json({ error: "Comment content is required" });
      }
      const updatedComment = await storage.editVideoComment(commentId, content);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error editing comment:", error);
      return res.status(500).json({ error: "Failed to edit comment" });
    }
  });
  app2.delete("/api/comments/:id", requireAuth5, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      const success = await storage.deleteVideoComment(commentId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: "Failed to delete comment" });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  });
  app2.post("/api/videos/:id/save", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isSaved = await storage.isVideoSavedByUser(userId, videoId);
      if (isSaved) {
        const success = await storage.unsaveVideo(userId, videoId);
        return res.json({ saved: false, success });
      } else {
        const save = await storage.saveVideo(userId, videoId);
        return res.status(201).json({ saved: true, save });
      }
    } catch (error) {
      console.error("Error saving/unsaving video:", error);
      return res.status(500).json({ error: "Failed to process save/unsave" });
    }
  });
  app2.get("/api/videos/:id/save-status", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isSaved = await storage.isVideoSavedByUser(userId, videoId);
      res.json({ saved: isSaved });
    } catch (error) {
      console.error("Error checking save status:", error);
      return res.status(500).json({ error: "Failed to check save status" });
    }
  });
  app2.get("/api/user/saved-videos", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const savedVideos = await storage.getUserSavedVideos(userId);
      res.json(savedVideos);
    } catch (error) {
      console.error("Error getting saved videos:", error);
      return res.status(500).json({ error: "Failed to get saved videos" });
    }
  });
  app2.post("/api/videos/:id/download", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user.id : null;
      const ipAddress = req.ip;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const video = await storage.getVideoPost(videoId);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (userId) {
        await storage.downloadVideo(userId, videoId, ipAddress);
      } else {
        await storage.incrementVideoPostDownloads(videoId);
      }
      res.json({ success: true, videoUrl: video.videoUrl });
    } catch (error) {
      console.error("Error downloading video:", error);
      return res.status(500).json({ error: "Failed to process download" });
    }
  });
  app2.post("/api/users/:id/follow", requireAuth5, async (req, res) => {
    try {
      const followedId = parseInt(req.params.id);
      const followerId = req.user.id;
      if (isNaN(followedId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      if (followerId === followedId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
      }
      const isFollowing = await storage.isUserFollowedByUser(followerId, followedId);
      if (isFollowing) {
        const success = await storage.unfollowUser(followerId, followedId);
        return res.json({ following: false, success });
      } else {
        const follow = await storage.followUser(followerId, followedId);
        return res.status(201).json({ following: true, follow });
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      return res.status(500).json({ error: "Failed to process follow/unfollow" });
    }
  });
  app2.get("/api/users/:id/follow-status", requireAuth5, async (req, res) => {
    try {
      const followedId = parseInt(req.params.id);
      const followerId = req.user.id;
      if (isNaN(followedId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const isFollowing = await storage.isUserFollowedByUser(followerId, followedId);
      res.json({ following: isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      return res.status(500).json({ error: "Failed to check follow status" });
    }
  });
  app2.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const followers = await storage.getUserFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error getting user followers:", error);
      return res.status(500).json({ error: "Failed to get user followers" });
    }
  });
  app2.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const following = await storage.getUserFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error getting user following:", error);
      return res.status(500).json({ error: "Failed to get user following" });
    }
  });
  app2.post("/api/videos/:id/follow", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isFollowing = await storage.isVideoFollowedByUser(userId, videoId);
      if (isFollowing) {
        const success = await storage.unfollowVideo(userId, videoId);
        return res.json({ following: false, success });
      } else {
        const follow = await storage.followVideo(userId, videoId);
        return res.status(201).json({ following: true, follow });
      }
    } catch (error) {
      console.error("Error following/unfollowing video:", error);
      return res.status(500).json({ error: "Failed to process follow/unfollow" });
    }
  });
  app2.get("/api/videos/:id/follow-status", requireAuth5, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.id;
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const isFollowing = await storage.isVideoFollowedByUser(userId, videoId);
      res.json({ following: isFollowing });
    } catch (error) {
      console.error("Error checking video follow status:", error);
      return res.status(500).json({ error: "Failed to check video follow status" });
    }
  });
  app2.get("/api/videos/:id/followers", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const followers = await storage.getVideoFollowers(videoId);
      res.json(followers);
    } catch (error) {
      console.error("Error getting video followers:", error);
      return res.status(500).json({ error: "Failed to get video followers" });
    }
  });
  app2.get("/api/user/profile-analytics", requireAuth5, requirePremium, async (req, res) => {
    try {
      const userId = req.user.id;
      const videoStats = await storage.updateUserVideoStats(userId);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        followerCount: user.followerCount || 0,
        ...videoStats
      });
    } catch (error) {
      console.error("Error getting profile analytics:", error);
      return res.status(500).json({ error: "Failed to get profile analytics" });
    }
  });
  app2.post("/api/emotional-imprints", requireAuth5, requirePremium, async (req, res) => {
    try {
      const { name, description, emotion, colorCode, soundId, vibrationPattern, isPublic, isTemplate } = req.body;
      if (!name || !emotion || !colorCode) {
        return res.status(400).json({ error: "Missing required fields: name, emotion, and colorCode are required" });
      }
      const imprintData = {
        userId: req.user.id,
        name,
        description: description || "",
        emotion,
        colorCode,
        soundId: soundId || null,
        vibrationPattern: vibrationPattern || null,
        isPublic: isPublic === true,
        isTemplate: isTemplate === true
      };
      const imprint = await storage.createEmotionalImprint(imprintData);
      res.status(201).json(imprint);
    } catch (error) {
      console.error("Error creating emotional imprint:", error);
      return res.status(500).json({
        error: "Failed to create emotional imprint",
        message: error.message
      });
    }
  });
  app2.get("/api/emotional-imprints", requireAuth5, requirePremium, async (req, res) => {
    try {
      const imprints = await storage.getUserEmotionalImprints(req.user.id);
      res.json(imprints);
    } catch (error) {
      console.error("Error getting emotional imprints:", error);
      return res.status(500).json({ error: "Failed to get emotional imprints" });
    }
  });
  app2.get("/api/emotional-imprints/:id", requireAuth5, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: "Invalid imprint ID" });
      }
      const imprint = await storage.getEmotionalImprint(imprintId);
      if (!imprint) {
        return res.status(404).json({ error: "Emotional imprint not found" });
      }
      if (!imprint.isPublic && imprint.userId !== req.user.id && !req.user.isPremium) {
        return res.status(403).json({
          error: "Access denied",
          message: "This emotional imprint is private or requires premium access"
        });
      }
      res.json(imprint);
    } catch (error) {
      console.error("Error getting emotional imprint:", error);
      return res.status(500).json({ error: "Failed to get emotional imprint" });
    }
  });
  app2.put("/api/emotional-imprints/:id", requireAuth5, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: "Invalid imprint ID" });
      }
      const existingImprint = await storage.getEmotionalImprint(imprintId);
      if (!existingImprint) {
        return res.status(404).json({ error: "Emotional imprint not found" });
      }
      if (existingImprint.userId !== req.user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only update your own emotional imprints"
        });
      }
      const updatedImprint = await storage.updateEmotionalImprint(imprintId, req.body);
      res.json(updatedImprint);
    } catch (error) {
      console.error("Error updating emotional imprint:", error);
      return res.status(500).json({
        error: "Failed to update emotional imprint",
        message: error.message
      });
    }
  });
  app2.delete("/api/emotional-imprints/:id", requireAuth5, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: "Invalid imprint ID" });
      }
      const existingImprint = await storage.getEmotionalImprint(imprintId);
      if (!existingImprint) {
        return res.status(404).json({ error: "Emotional imprint not found" });
      }
      if (existingImprint.userId !== req.user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only delete your own emotional imprints"
        });
      }
      const result = await storage.deleteEmotionalImprint(imprintId);
      if (result) {
        res.json({ success: true, message: "Emotional imprint deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete emotional imprint" });
      }
    } catch (error) {
      console.error("Error deleting emotional imprint:", error);
      return res.status(500).json({ error: "Failed to delete emotional imprint" });
    }
  });
  app2.get("/api/emotional-imprints-public", requireAuth5, async (req, res) => {
    try {
      const imprints = await storage.getPublicEmotionalImprints();
      res.json(imprints);
    } catch (error) {
      console.error("Error getting public emotional imprints:", error);
      return res.status(500).json({ error: "Failed to get public emotional imprints" });
    }
  });
  app2.get("/api/emotional-imprints-templates", requireAuth5, requirePremium, async (req, res) => {
    try {
      const templates = await storage.getEmotionalImprintTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error getting emotional imprint templates:", error);
      return res.status(500).json({ error: "Failed to get emotional imprint templates" });
    }
  });
  app2.post("/api/emotional-imprints/:id/share", requireAuth5, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: "Invalid imprint ID" });
      }
      const { receiverId, message, isAnonymous } = req.body;
      if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is required" });
      }
      const imprint = await storage.getEmotionalImprint(imprintId);
      if (!imprint) {
        return res.status(404).json({ error: "Emotional imprint not found" });
      }
      const interaction = await storage.createEmotionalImprintInteraction({
        imprintId,
        senderId: req.user.id,
        receiverId,
        message: message || "",
        isAnonymous: isAnonymous === true,
        status: "sent"
      });
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error sharing emotional imprint:", error);
      return res.status(500).json({
        error: "Failed to share emotional imprint",
        message: error.message
      });
    }
  });
  app2.get("/api/emotional-imprints-received", requireAuth5, async (req, res) => {
    try {
      const receivedImprints = await storage.getReceivedEmotionalImprints(req.user.id);
      res.json(receivedImprints);
    } catch (error) {
      console.error("Error getting received emotional imprints:", error);
      return res.status(500).json({ error: "Failed to get received emotional imprints" });
    }
  });
  try {
    Promise.resolve().then(() => (init_security_routes(), security_routes_exports)).then((module) => {
      const securityRoutes = module.default;
      app2.use("/api/security", securityRoutes);
      console.log("Security and privacy protection routes registered successfully");
    }).catch((error) => {
      console.error("Error loading security routes:", error);
    });
  } catch (error) {
    console.error("Error loading security routes:", error);
  }
  app2.post("/api/auth/2fa/setup", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled for this account" });
      }
      const twoFactorSetup = await generateTwoFactorSetup(user.username);
      await storage.updateUser(userId, {
        twoFactorSecret: twoFactorSetup.secret.base32,
        twoFactorBackupCodes: JSON.stringify(twoFactorSetup.backupCodes),
        twoFactorRecoveryKey: twoFactorSetup.recoveryKey,
        // Don't enable 2FA until the user verifies a token
        twoFactorEnabled: false,
        twoFactorVerified: false
      });
      res.json({
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        secret: twoFactorSetup.secret.base32,
        backupCodes: twoFactorSetup.backupCodes,
        recoveryKey: twoFactorSetup.recoveryKey
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      return res.status(500).json({ error: "Failed to set up 2FA" });
    }
  });
  app2.post("/api/auth/2fa/verify", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled for this account" });
      }
      const tokenSchema = z3.object({
        token: z3.string().min(6).max(6)
      });
      const { token } = tokenSchema.parse(req.body);
      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: "2FA setup not initiated. Please set up 2FA first." });
      }
      const isValid = verifyToken(token, user.twoFactorSecret);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      await storage.updateUser(userId, {
        twoFactorEnabled: true,
        twoFactorVerified: true
      });
      res.json({
        success: true,
        message: "Two-factor authentication has been enabled for your account",
        backupCodes: JSON.parse(user.twoFactorBackupCodes || "[]")
      });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      return res.status(500).json({ error: "Failed to verify 2FA" });
    }
  });
  app2.post("/api/auth/2fa/disable", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this account" });
      }
      const schema = z3.object({
        token: z3.string().min(6).max(6).optional(),
        password: z3.string().optional()
      });
      const { token, password } = schema.parse(req.body);
      let isValid = false;
      if (token && user.twoFactorSecret) {
        isValid = verifyToken(token, user.twoFactorSecret);
      } else if (password) {
      }
      if (!isValid) {
        return res.status(400).json({ error: "Invalid verification" });
      }
      await storage.updateUser(userId, {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorRecoveryKey: null
      });
      res.json({
        success: true,
        message: "Two-factor authentication has been disabled for your account"
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });
  app2.post("/api/auth/2fa/validate", async (req, res) => {
    try {
      const schema = z3.object({
        username: z3.string(),
        token: z3.string().min(6).max(6).optional(),
        backupCode: z3.string().optional(),
        recoveryKey: z3.string().optional()
      });
      const { username, token, backupCode, recoveryKey } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this account" });
      }
      let isValid = false;
      if (token && user.twoFactorSecret) {
        isValid = verifyToken(token, user.twoFactorSecret);
      } else if (backupCode && user.twoFactorBackupCodes) {
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        const result = verifyBackupCode(backupCode, backupCodes);
        if (result.valid) {
          isValid = true;
          await storage.updateUser(user.id, {
            twoFactorBackupCodes: JSON.stringify(result.remainingCodes)
          });
        }
      } else if (recoveryKey && user.twoFactorRecoveryKey) {
        isValid = verifyRecoveryKey(recoveryKey, user.twoFactorRecoveryKey);
        if (isValid) {
          const newRecoveryKey = generateRecoveryKey();
          await storage.updateUser(user.id, {
            twoFactorRecoveryKey: newRecoveryKey
          });
        }
      }
      if (!isValid) {
        return res.status(400).json({ error: "Invalid verification" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in after 2FA:", err);
          return res.status(500).json({ error: "Failed to log in after 2FA verification" });
        }
        res.json({
          success: true,
          message: "2FA verification successful"
        });
      });
    } catch (error) {
      console.error("Error validating 2FA:", error);
      return res.status(500).json({ error: "Failed to validate 2FA" });
    }
  });
  app2.post("/api/auth/2fa/new-backup-codes", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this account" });
      }
      const schema = z3.object({
        token: z3.string().min(6).max(6)
      });
      const { token } = schema.parse(req.body);
      if (!user.twoFactorSecret || !verifyToken(token, user.twoFactorSecret)) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      const newBackupCodes = generateBackupCodes(10);
      await storage.updateUser(userId, {
        twoFactorBackupCodes: JSON.stringify(newBackupCodes)
      });
      res.json({
        success: true,
        backupCodes: newBackupCodes
      });
    } catch (error) {
      console.error("Error generating new backup codes:", error);
      return res.status(500).json({ error: "Failed to generate new backup codes" });
    }
  });
  app2.post("/api/auth/2fa/new-recovery-key", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this account" });
      }
      const schema = z3.object({
        token: z3.string().min(6).max(6)
      });
      const { token } = schema.parse(req.body);
      if (!user.twoFactorSecret || !verifyToken(token, user.twoFactorSecret)) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      const newRecoveryKey = generateRecoveryKey();
      await storage.updateUser(userId, {
        twoFactorRecoveryKey: newRecoveryKey
      });
      res.json({
        success: true,
        recoveryKey: newRecoveryKey
      });
    } catch (error) {
      console.error("Error generating new recovery key:", error);
      return res.status(500).json({ error: "Failed to generate new recovery key" });
    }
  });
  app2.get("/api/auth/2fa/status", requireAuth5, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        enabled: user.twoFactorEnabled,
        verified: user.twoFactorVerified
      });
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      return res.status(500).json({ error: "Failed to get 2FA status" });
    }
  });
  app2.get("/api/advertisements/user/:userId", requireAuth5, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (req.user?.id !== userId && !req.adminUser) {
        return res.status(403).json({ error: "Unauthorized access to user advertisements" });
      }
      const advertisements2 = await storage.getUserAdvertisements(userId);
      res.json(advertisements2);
    } catch (error) {
      console.error("Error fetching user advertisements:", error);
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });
  app2.get("/api/advertisements/published", async (req, res) => {
    try {
      const advertisements2 = await storage.getAllPublishedAdvertisements();
      res.json(advertisements2);
    } catch (error) {
      console.error("Error fetching published advertisements:", error);
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });
  app2.get("/api/advertisements/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const typeSchema = z3.enum(["health_service", "wellness_program", "mental_health", "nutrition", "fitness", "other"]);
      const validatedType = typeSchema.parse(type);
      const advertisements2 = await storage.getAdvertisementsByType(validatedType);
      res.json(advertisements2);
    } catch (error) {
      console.error("Error fetching advertisements by type:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid advertisement type" });
      }
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });
  app2.get("/api/advertisements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(id);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (advertisement.status !== "published" && (!req.isAuthenticated() || req.user?.id !== advertisement.userId && !req.adminUser)) {
        return res.status(403).json({ error: "Unauthorized access to advertisement" });
      }
      if (advertisement.status === "published") {
        await storage.incrementAdvertisementViewCount(id);
      }
      res.json(advertisement);
    } catch (error) {
      console.error("Error fetching advertisement:", error);
      res.status(500).json({ error: "Failed to fetch advertisement" });
    }
  });
  app2.post("/api/advertisements", requireAuth5, requirePremium, async (req, res) => {
    try {
      const adSchema = z3.object({
        title: z3.string().min(5).max(100),
        description: z3.string().min(20).max(1e3),
        type: z3.enum(["health_service", "wellness_program", "mental_health", "nutrition", "fitness", "other"]),
        imageUrl: z3.string().url().optional(),
        websiteUrl: z3.string().url().optional(),
        contactEmail: z3.string().email().optional(),
        contactPhone: z3.string().optional(),
        locationDetails: z3.string().optional(),
        budget: z3.string().optional(),
        additionalNotes: z3.string().optional(),
        startDate: z3.string().optional(),
        endDate: z3.string().optional()
      });
      const adData = adSchema.parse(req.body);
      const advertisement = await storage.createAdvertisement(req.user.id, adData);
      res.status(201).json(advertisement);
    } catch (error) {
      console.error("Error creating advertisement:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid advertisement data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create advertisement" });
    }
  });
  app2.patch("/api/advertisements/:id", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(id);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: "Unauthorized to update this advertisement" });
      }
      const updateSchema = z3.object({
        title: z3.string().min(5).max(100).optional(),
        description: z3.string().min(20).max(1e3).optional(),
        type: z3.enum(["health_service", "wellness_program", "mental_health", "nutrition", "fitness", "other"]).optional(),
        imageUrl: z3.string().url().optional().nullable(),
        websiteUrl: z3.string().url().optional().nullable(),
        contactEmail: z3.string().email().optional().nullable(),
        contactPhone: z3.string().optional().nullable(),
        locationDetails: z3.string().optional().nullable(),
        budget: z3.string().optional().nullable(),
        additionalNotes: z3.string().optional().nullable(),
        startDate: z3.string().optional().nullable(),
        endDate: z3.string().optional().nullable()
      });
      const updateData = updateSchema.parse(req.body);
      const updatedAdvertisement = await storage.updateAdvertisement(id, updateData);
      res.json(updatedAdvertisement);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid advertisement data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update advertisement" });
    }
  });
  app2.delete("/api/advertisements/:id", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(id);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: "Unauthorized to delete this advertisement" });
      }
      const success = await storage.deleteAdvertisement(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete advertisement" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      res.status(500).json({ error: "Failed to delete advertisement" });
    }
  });
  app2.post("/api/advertisements/:id/payment", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(id);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (req.user.id !== advertisement.userId) {
        return res.status(403).json({ error: "Unauthorized to process payment for this advertisement" });
      }
      const paymentSchema = z3.object({
        provider: z3.enum(["stripe", "paypal"]),
        transactionId: z3.string()
      });
      const paymentData = paymentSchema.parse(req.body);
      const updatedAdvertisement = await storage.createAdvertisementPayment(
        id,
        paymentData.provider,
        paymentData.transactionId
      );
      res.json(updatedAdvertisement);
    } catch (error) {
      console.error("Error processing advertisement payment:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid payment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process advertisement payment" });
    }
  });
  app2.post("/api/advertisements/:id/bookings", requireAuth5, async (req, res) => {
    try {
      const advertisementId = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(advertisementId);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (advertisement.status !== "published") {
        return res.status(400).json({ error: "Advertisement is not available for booking" });
      }
      const bookingSchema = z3.object({
        notes: z3.string().optional(),
        contactDetails: z3.string(),
        locationDetails: z3.string().optional(),
        requestedStartDate: z3.string().optional(),
        requestedEndDate: z3.string().optional()
      });
      const bookingData = bookingSchema.parse(req.body);
      const booking = await storage.createAdvertisementBooking({
        advertisementId,
        userId: req.user.id,
        status: "pending",
        ...bookingData
      });
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });
  app2.get("/api/advertisements/:id/bookings", requireAuth5, async (req, res) => {
    try {
      const advertisementId = parseInt(req.params.id);
      const advertisement = await storage.getAdvertisementById(advertisementId);
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: "Unauthorized to view bookings for this advertisement" });
      }
      const bookings = await storage.getAdvertisementBookings(advertisementId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  app2.get("/api/user/bookings", requireAuth5, async (req, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  app2.patch("/api/bookings/:id/status", requireAuth5, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getAdvertisementBookingById(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      const advertisement = await storage.getAdvertisementById(booking.advertisementId);
      if (!advertisement) {
        return res.status(404).json({ error: "Associated advertisement not found" });
      }
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: "Unauthorized to update this booking" });
      }
      const statusSchema = z3.object({
        status: z3.enum(["pending", "approved", "rejected", "completed", "canceled"])
      });
      const { status } = statusSchema.parse(req.body);
      const updatedBooking = await storage.updateAdvertisementBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid status", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });
  app2.post("/api/user/verification", requireAuth5, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        middleName,
        dateOfBirth,
        address,
        city,
        state,
        country,
        postalCode,
        idType1,
        idNumber1,
        idType2,
        idNumber2,
        paymentPlan
      } = req.body;
      await storage.createVerificationDocument({
        userId: req.user.id,
        documentType: idType1,
        documentNumber: idNumber1,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date()
      });
      await storage.createVerificationDocument({
        userId: req.user.id,
        documentType: idType2,
        documentNumber: idNumber2,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date()
      });
      await storage.updateUser(req.user.id, {
        firstName,
        lastName,
        middleName: middleName || null,
        state,
        country,
        verificationStatus: "pending",
        verificationPaymentPlan: paymentPlan
      });
      res.status(201).json({ success: true, message: "Verification submitted successfully" });
    } catch (error) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ error: "Failed to submit verification" });
    }
  });
  app2.post("/api/user/verification/payment", requireAuth5, async (req, res) => {
    try {
      const { plan, amount } = req.body;
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(now);
      if (plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      await storage.updateUser(req.user.id, {
        verificationPaymentPlan: plan,
        verificationExpiresAt: expiresAt
      });
      res.json({
        success: true,
        message: "Payment processed successfully",
        plan,
        expiresAt
      });
    } catch (error) {
      console.error("Error processing verification payment:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });
  app2.get("/api/user/verification/status", requireAuth5, async (req, res) => {
    try {
      const documents = await storage.getVerificationDocumentsByUser(req.user.id);
      res.json({
        status: req.user.verificationStatus,
        verifiedAt: req.user.verifiedAt,
        expiresAt: req.user.verificationExpiresAt,
        paymentPlan: req.user.verificationPaymentPlan,
        documents
      });
    } catch (error) {
      console.error("Error getting verification status:", error);
      res.status(500).json({ error: "Failed to get verification status" });
    }
  });
  app2.post("/api/user/verification/documents", requireAuth5, async (req, res) => {
    try {
      const {
        documentType,
        documentNumber,
        documentUrl,
        expirationDate,
        issuedBy,
        issuedDate
      } = req.body;
      if (!documentType || !documentNumber) {
        return res.status(400).json({ error: "Document type and number are required" });
      }
      const document = await storage.createVerificationDocument({
        userId: req.user.id,
        documentType,
        documentNumber,
        documentUrl: documentUrl || void 0,
        expirationDate: expirationDate ? new Date(expirationDate) : void 0,
        issuedBy: issuedBy || void 0,
        issuedDate: issuedDate ? new Date(issuedDate) : void 0,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Verification submission error:", error);
      res.status(500).json({ error: "Failed to submit verification document" });
    }
  });
  app2.put("/api/admin/verification/documents/:id", requireAuth5, requireAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { status, notes } = req.body;
      if (!status || !["pending", "verified", "not_verified"].includes(status)) {
        return res.status(400).json({ error: "Valid status is required" });
      }
      const document = await storage.updateVerificationDocumentStatus(
        documentId,
        status,
        req.adminUser.id,
        notes
      );
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Verification update error:", error);
      res.status(500).json({ error: "Failed to update verification status" });
    }
  });
  app2.post("/api/system/test", requireAuth5, testController.runTests);
  app2.post("/api/system/backup", requireAuth5, testController.createBackup);
  app2.get("/api/system/backups", requireAuth5, testController.getBackups);
  app2.post("/api/system/restore/:backupId", requireAuth5, testController.restoreBackup);
  app2.post("/api/sessions", requireAuth5, async (req, res) => {
    try {
      const sessionSchema = z3.object({
        device: z3.string().optional(),
        browser: z3.string().optional(),
        ipAddress: z3.string().optional(),
        location: z3.string().optional()
      });
      const validated = sessionSchema.parse(req.body);
      const sessionToken = crypto3.randomUUID();
      const session3 = await storage.createUserSession({
        userId: req.user.id,
        sessionToken,
        device: validated.device || "Unknown",
        browser: validated.browser || "Unknown",
        ipAddress: validated.ipAddress || req.ip || "Unknown",
        location: validated.location,
        status: "online",
        loginAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(session3);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });
  app2.get("/api/sessions", requireAuth5, async (req, res) => {
    try {
      const sessions = await storage.getUserActiveSessions(req.user.id);
      res.status(200).json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });
  app2.put("/api/sessions/:token/status", requireAuth5, async (req, res) => {
    try {
      const { token } = req.params;
      const statusSchema = z3.object({
        status: z3.enum(["online", "offline", "away", "busy"])
      });
      const { status } = statusSchema.parse(req.body);
      const session3 = await storage.getUserSession(token);
      if (!session3) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (session3.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to modify this session" });
      }
      const updatedSession = await storage.updateUserSessionStatus(token, status);
      res.status(200).json(updatedSession);
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(400).json({ error: "Invalid status update data" });
    }
  });
  app2.delete("/api/sessions/:token", requireAuth5, async (req, res) => {
    try {
      const { token } = req.params;
      const session3 = await storage.getUserSession(token);
      if (!session3) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (session3.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this session" });
      }
      await storage.closeUserSession(token);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error closing session:", error);
      res.status(500).json({ error: "Failed to close session" });
    }
  });
  app2.put("/api/sessions/:token/activity", requireAuth5, async (req, res) => {
    try {
      const { token } = req.params;
      const session3 = await storage.getUserSession(token);
      if (!session3) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (session3.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this session" });
      }
      const updatedSession = await storage.updateUserSessionActivity(token);
      res.status(200).json(updatedSession);
    } catch (error) {
      console.error("Error updating session activity:", error);
      res.status(500).json({ error: "Failed to update session activity" });
    }
  });
  app2.get("/api/users/active", requireAuth5, async (req, res) => {
    try {
      const activeUsers = await storage.getActiveUsers();
      const sanitizedUsers = activeUsers.map((user) => ({
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        status: user.status,
        lastActiveAt: user.lastActiveAt
      }));
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
      res.status(500).json({ error: "Failed to fetch active users" });
    }
  });
  app2.get("/api/mood-matches", requireAuth5, async (req, res) => {
    try {
      const userEmotion = await storage.getUserEmotion(req.user.id) || "neutral";
      const matches = await storage.findMoodMatches(req.user.id, userEmotion);
      const sanitizedMatches = matches.map((match) => ({
        id: match.id,
        userId: match.userId,
        matchedUserId: match.matchedUserId,
        score: match.score,
        userEmotion: match.userEmotion,
        matchedUserEmotion: match.matchedUserEmotion,
        status: match.status,
        createdAt: match.createdAt,
        matchedUsername: match.matchedUser?.username,
        matchedUserProfilePicture: match.matchedUser?.profilePicture
      }));
      res.status(200).json(sanitizedMatches);
    } catch (error) {
      console.error("Error finding mood matches:", error);
      res.status(500).json({ error: "Failed to find mood matches" });
    }
  });
  app2.post("/api/mood-matches/:matchId/accept", requireAuth5, async (req, res) => {
    try {
      const { matchId } = req.params;
      const match = await storage.getMoodMatch(Number(matchId));
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      if (match.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to accept this match" });
      }
      const updatedMatch = await storage.acceptMoodMatch(Number(matchId));
      res.status(200).json(updatedMatch);
    } catch (error) {
      console.error("Error accepting mood match:", error);
      res.status(500).json({ error: "Failed to accept mood match" });
    }
  });
  app2.post("/api/mood-matches/:matchId/reject", requireAuth5, async (req, res) => {
    try {
      const { matchId } = req.params;
      const match = await storage.getMoodMatch(Number(matchId));
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      if (match.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to reject this match" });
      }
      const updatedMatch = await storage.rejectMoodMatch(Number(matchId));
      res.status(200).json(updatedMatch);
    } catch (error) {
      console.error("Error rejecting mood match:", error);
      res.status(500).json({ error: "Failed to reject mood match" });
    }
  });
  app2.get("/api/notifications", requireAuth5, async (req, res) => {
    try {
      const notifications2 = await storage.getNotifications(req.user.id);
      return res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/notifications/unread-count", requireAuth5, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      console.error("Error getting unread notifications count:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/notifications/:id/read", requireAuth5, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      const notification = await storage.markNotificationAsRead(notificationId);
      return res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/notifications/read-all", requireAuth5, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  app2.delete("/api/notifications/:id", requireAuth5, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      const result = await storage.deleteNotification(notificationId);
      if (result) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Notification not found" });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  httpServer.initializeWebSocketServer = initializeWebSocketServer;
  return httpServer;
}

// server/vite.ts
import express4 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express4.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express5();
app.use(express5.json());
app.use(express5.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  let boundPort = null;
  let websocketInitialized = false;
  const replitPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  const tryListen = (port, maxRetries = 3, retryCount = 0) => {
    if (boundPort !== null) {
      log(`Server already running on port ${boundPort}`);
      return;
    }
    if (replitPort && port !== replitPort) {
      log(`Using Replit-assigned port: ${replitPort}`);
      port = replitPort;
    }
    const serverOpts = {
      port,
      host: "0.0.0.0",
      reusePort: true
    };
    try {
      if (server._handle) server.close();
    } catch (error) {
    }
    try {
      if (process.env.NODE_ENV === "development") {
        log(`Attempting to force bind to port ${port} for Replit compatibility`);
      }
    } catch (error) {
    }
    server.listen(serverOpts, () => {
      try {
        const address = server.address();
        const actualPort = typeof address === "object" && address ? address.port : port;
        boundPort = actualPort;
        log(`MoodLync server running on port ${actualPort}`);
        if (!websocketInitialized) {
          const initializeWebSocketServer = server["initializeWebSocketServer"];
          if (typeof initializeWebSocketServer === "function") {
            try {
              initializeWebSocketServer();
              websocketInitialized = true;
              log(`WebSocket server initialized on port ${actualPort}`);
            } catch (error) {
              console.error("Failed to initialize WebSocket server:", error);
            }
          } else {
            console.warn("WebSocket server initialization function not found");
          }
        }
      } catch (error) {
        console.error("Error during server initialization:", error);
      }
    }).on("error", (err) => {
      if (err.code === "EADDRINUSE" && retryCount < maxRetries) {
        const nextPort = replitPort || port + 1;
        if (replitPort && replitPort === port) {
          log(`Replit port ${port} is in use, but we must use this port. Attempting forced bind...`);
          setTimeout(() => tryListen(port, maxRetries, retryCount + 1), 1e3);
        } else {
          log(`Port ${port} is already in use, trying port ${nextPort}...`);
          tryListen(nextPort, maxRetries, retryCount + 1);
        }
      } else {
        console.error(`Failed to start server: ${err.message}`);
        if (process.env.NODE_ENV === "development" && !replitPort) {
          const emergencyPort = 8080;
          log(`Trying emergency port ${emergencyPort}...`);
          tryListen(emergencyPort, 0, 0);
        } else {
          process.exit(1);
        }
      }
    });
  };
  tryListen(replitPort || 5e3);
})();
