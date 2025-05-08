import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { hashPassword } from "./auth";
import { storage } from "./storage";
import { testController } from "./test-controller";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

// Note: Account and subscription management routes are imported dynamically in registerRoutes function

// Since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { AdminUser } from "@shared/schema";

// Extend Express Request interface to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

// Middleware functions are defined below
import { 
  EmotionType, 
  RewardActivityType, 
  ChallengeDifficulty, 
  RedemptionType, 
  RedemptionStatus,
  ReferralStatus,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  RefundStatus,
  AdminRole,
  AdminActionType,
  VideoCategory,
  insertTokenRedemptionSchema,
  insertChallengeSchema,
  insertAdminUserSchema,
  insertSupportTicketSchema,
  insertTicketResponseSchema,
  insertRefundRequestSchema,
  insertAdminActionSchema,
  insertQuoteSchema,
  insertVideoPostSchema
} from "@shared/schema";

// Import two-factor authentication utilities
import { 
  generateTwoFactorSetup, 
  verifyToken, 
  verifyBackupCode, 
  verifyRecoveryKey,
  TwoFactorSetup 
} from "./two-factor";

// Set up multer for file uploads
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads/images');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Set up multer for video uploads with larger file size limit
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads/videos');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'video-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    // Accept only video files
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/ogg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only video files (MP4, MOV, AVI, WebM, OGG) are allowed'));
    }
    cb(null, true);
  }
});

interface Client {
  id: number;
  socket: WebSocket;
  emotion: EmotionType;
}

// Middleware function to check if a user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Middleware function to check if a user is premium
async function requirePremium(req: Request, res: Response, next: Function) {
  // Skip check if there's no user (should be caught by requireAuth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You need to be logged in to access this feature.' 
    });
  }
  
  // If the user is premium, allow access immediately
  if (req.user.isPremium) {
    return next();
  }
  
  // If not premium, check if the user is in an active trial period
  try {
    const isInActiveTrial = await storage.isUserInActiveTrial(req.user.id);
    
    if (isInActiveTrial) {
      // User is in trial period, allow access
      return next();
    }
    
    // User is neither premium nor in trial, deny access
    return res.status(403).json({ 
      error: 'Premium required',
      message: 'This feature is only available to premium members. Upgrade to premium or start a free trial to access this feature.' 
    });
  } catch (error) {
    console.error('Error checking trial status:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while checking your premium status.' 
    });
  }
}

// Middleware to check if a user is an admin
async function requireAdmin(req: Request, res: Response, next: Function) {
  try {
    // If admin session is already established in the request, proceed
    if (req.adminUser) {
      console.log("Admin user found in request, proceeding with access");
      return next();
    }
    
    // Check if admin session exists in the Express session
    // @ts-ignore - Accessing adminUser from session
    if (req.session && req.session.adminUser) {
      console.log("Admin user found in session, restoring to request");
      // @ts-ignore - Restoring from session to request
      req.adminUser = req.session.adminUser;
      return next();
    }
    
    // If regular user is authenticated, check if they have admin privileges
    if (req.isAuthenticated()) {
      console.log("Regular user authenticated, checking for admin privileges");
      const adminUser = await storage.getAdminUserByUsername(req.user.username);
      
      if (adminUser && adminUser.isActive) {
        console.log("User has admin privileges, granting access");
        req.adminUser = adminUser;
        
        // Save to session for future requests
        // @ts-ignore - Adding adminUser to session
        req.session.adminUser = adminUser;
        req.session.save();
        
        return next();
      }
    }
    
    // No admin session found, deny access
    console.log("Admin authentication failed, access denied");
    return res.status(401).json({ 
      error: 'Admin authentication required',
      message: 'Please log in to access admin features.'
    });
  } catch (error) {
    console.error('Error in admin authentication:', error);
    return res.status(500).json({ error: 'Server error during admin authentication' });
  }
}

// Function to automatically update certain challenges periodically
function setupAutomaticChallengeUpdates() {
  console.log("Setting up automatic challenge updates");
  
  // Update challenges every 30 minutes
  setInterval(async () => {
    try {
      console.log("Running automatic challenge updates");
      
      // Get all challenges
      const challenges = await storage.getGamificationChallenges();
      
      // Find time-based or auto-update challenges (e.g., daily logins)
      const autoUpdateChallenges = challenges.filter(challenge => 
        ['daily', 'tracking', 'login'].includes(challenge.category)
      );
      
      if (autoUpdateChallenges.length > 0) {
        console.log(`Found ${autoUpdateChallenges.length} challenges eligible for auto-update`);
        
        // Get active users who might benefit from challenge updates
        const recentProfiles = await storage.getRecentActiveGamificationProfiles();
        
        // For each eligible user, potentially update one of their challenges
        for (const profile of recentProfiles) {
          // Randomly select one challenge to update for this user
          const randomIndex = Math.floor(Math.random() * autoUpdateChallenges.length);
          const challengeToUpdate = autoUpdateChallenges[randomIndex];
          
          // Only update if not already completed
          const isCompleted = profile.completedChallenges && profile.completedChallenges.includes(challengeToUpdate.id);
          
          if (!isCompleted) {
            console.log(`Automatically updating challenge ${challengeToUpdate.id} for user ${profile.id}`);
            
            // Update the challenge progress (this is a simplified version)
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
  }, 30 * 60 * 1000); // Every 30 minutes
}

// Function to check for expired trials periodically
function setupTrialCheckSchedule() {
  console.log("Setting up automatic trial expiration checks");
  
  // Check for expired trials every hour
  setInterval(async () => {
    try {
      console.log("Running trial expiration check");
      await storage.checkAndExpireTrials();
      console.log("Trial expiration check completed");
    } catch (error) {
      console.error("Error checking for expired trials:", error);
    }
  }, 60 * 60 * 1000); // Every hour
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up account and subscription management routes
  try {
    const accountManagementRoutes = (await import('./routes/account-management')).default;
    const subscriptionRoutes = (await import('./routes/subscription-routes')).default;
    const nftPoolRoutes = (await import('./routes/nft-pool-routes')).default;
    const nftCollectionRoutes = (await import('./routes/nft-collection-routes')).default;
    const paymentRoutes = (await import('./routes/payment-routes')).default;
    
    app.use(accountManagementRoutes);
    app.use(subscriptionRoutes);
    app.use('/api', nftPoolRoutes);
    app.use('/api', nftCollectionRoutes);
    app.use('/api/payments', paymentRoutes);
    
    // Import and register admin routes
    const { registerAdminRoutes } = await import('./routes/admin-routes');
    registerAdminRoutes(app);
    
    console.log("Account and subscription management routes registered successfully");
    console.log("NFT token pool system routes registered successfully");
    console.log("NFT collection routes registered successfully");
    console.log("Payment processing routes registered successfully");
    console.log("Admin panel routes registered successfully");
  } catch (error) {
    console.error("Error registering routes:", error);
  }
  // Notification API endpoints
  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const unreadOnly = req.query.unread === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let notifications = await storage.getNotificationsByUserId(userId, unreadOnly);
      
      // Apply limit if specified
      if (limit && limit > 0 && notifications.length > limit) {
        notifications = notifications.slice(0, limit);
      }
      
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).send('Server error');
    }
  });
  
  app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).send('Notification not found');
      }
      
      if (notification.userId !== req.user!.id) {
        return res.status(403).send('Unauthorized');
      }
      
      await storage.markNotificationAsRead(notificationId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).send('Server error');
    }
  });
  
  app.post('/api/notifications/mark-all-read', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsAsRead(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).send('Server error');
    }
  });
  
  app.post('/api/notifications', requireAuth, async (req, res) => {
    try {
      const { userId, type, title, content, sourceId, sourceType, icon, actionLink } = req.body;
      
      // Only admins can create notifications for other users
      if (userId !== req.user!.id && (!req.adminUser || !req.adminUser.permissions?.includes('manage_notifications'))) {
        return res.status(403).send('Unauthorized');
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
        createdAt: new Date(),
        isRead: false,
        readAt: null,
        isPushSent: false,
        isEmailSent: false
      });
      
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).send('Server error');
    }
  });
  // Direct route for admin login page
  app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "public", "admin-login.html"));
  });
  // Set up authentication
  setupAuth(app);

  // Set up static file serving for uploads
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  const httpServer = createServer(app);
  
  // Set up WebSocket server with retry logic
  let wss: WebSocketServer;
  
  // We'll initialize this in the tryListen function in server/index.ts
  // This prevents port conflict errors by attaching to the same port
  // that the HTTP server successfully binds to
  const initializeWebSocketServer = () => {
    try {
      // If an existing WebSocket server exists, attempt to close it first
      if (wss) {
        try {
          wss.close();
          console.log('Closed existing WebSocket server');
        } catch (wsCloseError) {
          console.error('Error closing existing WebSocket server:', wsCloseError);
        }
      }
      
      // Create a new WebSocket server on the current HTTP server
      wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws',
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
    
    // Log current port number for clarity
    const address = httpServer.address();
    const port = typeof address === 'object' && address ? address.port : 'unknown';
    console.log(`WebSocket server initialized on port ${port}`);
    
    // Make the WebSocket server available to the HTTP server
    // @ts-ignore - Adding dynamic property
    httpServer.wss = wss;
    
    // Set up handlers for the WebSocket server
    setupWebSocketHandlers();
    
    return true;
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
      return false;
    }
  };
  
  // Store connected clients
  const clients: Client[] = [];
  
  // Setup automatic challenge updates
  setupAutomaticChallengeUpdates();
  
  // Setup trial expiration checks
  setupTrialCheckSchedule();

  // This function will be called after WebSocket server is initialized
  const setupWebSocketHandlers = () => {
    if (!wss) {
      console.error("WebSocket server not initialized yet");
      return;
    }
    
    wss.on('connection', (socket) => {
    console.log('WebSocket client connected');
    
    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle client messages based on type
        if (data.type === 'register' && data.userId) {
          // Register the client with their user ID
          const existingClientIndex = clients.findIndex(c => c.id === data.userId);
          
          if (existingClientIndex >= 0) {
            // Update existing client
            clients[existingClientIndex].socket = socket;
            clients[existingClientIndex].emotion = data.emotion || 'neutral';
          } else {
            // Add new client
            clients.push({
              id: data.userId,
              socket,
              emotion: data.emotion || 'neutral'
            });
          }
          
          // Send confirmation
          socket.send(JSON.stringify({
            type: 'registered',
            success: true
          }));
        }
        
        // Handle emotion updates
        else if (data.type === 'emotion_update' && data.userId && data.emotion) {
          // Update the user's emotion
          const client = clients.find(c => c.id === data.userId);
          if (client) {
            client.emotion = data.emotion;
            
            // Broadcast the update to other users with the same emotion
            clients.forEach(c => {
              if (c.id !== data.userId && c.emotion === data.emotion && c.socket.readyState === WebSocket.OPEN) {
                c.socket.send(JSON.stringify({
                  type: 'new_connection',
                  emotion: data.emotion
                }));
              }
            });
          }
        }
        
        // Handle chat room messages
        else if (data.type === 'chat_message' && data.roomId && data.userId && data.message) {
          // Find the emotion associated with this room
          const roomEmotion = data.roomEmotion;
          
          // Broadcast to all clients in the same emotion room
          clients.forEach(c => {
            if (c.emotion === roomEmotion && c.socket.readyState === WebSocket.OPEN) {
              c.socket.send(JSON.stringify({
                type: 'chat_message',
                roomId: data.roomId,
                userId: data.userId,
                username: data.username,
                message: data.message,
                encrypted: data.encrypted || false, // Pass through the encryption flag
                timestamp: new Date().toISOString(),
                avatarUrl: data.avatarUrl || null
              }));
            }
          });
          
          // Save message to database if needed
          // We store the encrypted message directly - it will be decrypted on client side
          // Note: In a full implementation, you would store this in the database
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    socket.on('close', () => {
      console.log('WebSocket client disconnected');
      // Remove client from the clients array
      const index = clients.findIndex(c => c.socket === socket);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });
  }; // End of setupWebSocketHandlers

  // API routes
  
  // User's premium status
  app.get('/api/user/premium-status', requireAuth, (req, res) => {
    // Return the user's premium status and trial days remaining if applicable
    res.json({
      isPremium: req.user?.isPremium || false,
      trialDays: req.user?.premiumTrialEnd ? Math.ceil((new Date(req.user.premiumTrialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    });
  });
  
  // Video editor premium access check
  app.get('/api/video-editor/access', requireAuth, (req, res) => {
    if (req.user?.isPremium) {
      return res.json({ hasAccess: true });
    }
    
    // Check if user has an active trial
    const hasActiveTrial = req.user?.premiumTrialEnd && new Date(req.user.premiumTrialEnd) > new Date();
    
    // For demonstration purposes, we'll consider trial users as having access
    if (hasActiveTrial) {
      return res.json({ 
        hasAccess: true, 
        isTrial: true,
        trialDays: Math.ceil((new Date(req.user.premiumTrialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      });
    }
    
    // User doesn't have premium access
    res.json({ 
      hasAccess: false,
      canStartTrial: !req.user?.hadPremiumTrial // Only allow trial if user hasn't had one before
    });
  });
  
  // User's current emotion
  app.post('/api/emotion', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const emotionSchema = z.object({
        emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'])
      });
      
      const { emotion } = emotionSchema.parse(req.body);
      
      // Get current emotion to check if it's different
      const currentEmotion = await storage.getUserEmotion(req.user.id);
      
      // Save the user's emotion
      await storage.updateUserEmotion(req.user.id, emotion);
      
      // Only reward tokens once per day for emotion updates
      // This prevents users from farming tokens by updating emotions multiple times per day
      let tokensEarned = 0;
      
      // Get today's beginning timestamp (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the user has already earned tokens for emotion update today
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedEmotionTokensToday = recentActivities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === 'emotion_update' && activityDate >= today;
      });
      
      // Only reward if they haven't earned emotion tokens today and emotion is different
      if (currentEmotion !== emotion && !hasEarnedEmotionTokensToday) {
        tokensEarned = 2; // Earn 2 tokens for updating your emotional state
        await storage.createRewardActivity(
          req.user.id,
          'emotion_update',
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
      console.error('Error updating emotion:', error);
      return res.status(400).json({ error: 'Invalid emotion data' });
    }
  });
  
  app.get('/api/emotion', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const emotion = await storage.getUserEmotion(req.user.id);
      return res.status(200).json(emotion || 'neutral');
    } catch (error) {
      console.error('Error fetching emotion:', error);
      return res.status(500).json({ error: 'Failed to fetch emotion' });
    }
  });
  
  // Journal entries
  app.post('/api/journal', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const entrySchema = z.object({
        emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral']),
        note: z.string().min(1)
      });
      
      const { emotion, note } = entrySchema.parse(req.body);
      
      // Create journal entry
      const entry = await storage.createJournalEntry(req.user.id, emotion, note);
      
      // Get today's beginning timestamp (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the user has already earned tokens for journal entry today
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedJournalTokensToday = recentActivities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === 'journal_entry' && activityDate >= today;
      });
      
      // Only reward tokens once per day for journal entries
      let tokensEarned = 0;
      if (!hasEarnedJournalTokensToday) {
        tokensEarned = 5; // Earn 5 tokens for the first journal entry of the day
        await storage.createRewardActivity(
          req.user.id,
          'journal_entry',
          tokensEarned,
          `Earned ${tokensEarned} tokens for creating a journal entry about feeling ${emotion}`
        );
      }
      
      return res.status(201).json({
        entry,
        tokensEarned
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return res.status(400).json({ error: 'Invalid journal entry data' });
    }
  });
  
  app.get('/api/journal', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const entries = await storage.getJournalEntries(req.user.id);
      return res.status(200).json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
  });
  
  // Chat rooms
  app.get('/api/chat-rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      return res.status(200).json(rooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
  });
  
  // Get users with the same emotion
  app.get('/api/users/:emotion', async (req, res) => {
    try {
      const emotionSchema = z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral']);
      const emotion = emotionSchema.parse(req.params.emotion);
      
      const users = await storage.getUsersByEmotion(emotion);
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users by emotion:', error);
      return res.status(400).json({ error: 'Invalid emotion' });
    }
  });
  
  // Global emotion data
  app.get('/api/global-emotions', async (req, res) => {
    try {
      const globalData = await storage.getGlobalEmotionData();
      return res.status(200).json(globalData);
    } catch (error) {
      console.error('Error fetching global emotion data:', error);
      return res.status(500).json({ error: 'Failed to fetch global emotion data' });
    }
  });
  
  // Rewards and Earnings
  
  // Get user's token balance
  app.get('/api/tokens', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const tokens = await storage.getUserTokens(req.user.id);
      return res.status(200).json({ tokens });
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return res.status(500).json({ error: 'Failed to fetch token balance' });
    }
  });
  
  // Transfer tokens to another user
  app.post('/api/tokens/transfer', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if user is premium
    const user = await storage.getUser(req.user.id);
    if (!user?.isPremium) {
      return res.status(403).json({ 
        error: 'Premium required',
        message: 'This feature is only available to premium members. Upgrade to premium to transfer tokens.' 
      });
    }
    
    const { recipientId, amount, notes } = req.body;
    
    if (!recipientId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Recipient ID and amount are required' 
      });
    }
    
    // Parse recipient ID to ensure it's a number
    const toUserId = parseInt(recipientId, 10);
    const tokenAmount = parseInt(amount, 10);
    
    if (isNaN(toUserId) || isNaN(tokenAmount)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Recipient ID and amount must be valid numbers' 
      });
    }
    
    if (tokenAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Transfer amount must be greater than zero' 
      });
    }
    
    if (toUserId === req.user.id) {
      return res.status(400).json({ 
        error: 'Invalid recipient',
        message: 'You cannot transfer tokens to yourself' 
      });
    }
    
    try {
      const result = await storage.transferTokens(req.user.id, toUserId, tokenAmount, notes);
      
      // Send email notifications in a real implementation
      // For now we'll just log the notification
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
      console.error('Error transferring tokens:', error);
      return res.status(400).json({ 
        error: 'Transfer failed',
        message: error instanceof Error ? error.message : 'Failed to transfer tokens' 
      });
    }
  });
  
  // Get user's reward activities history
  app.get('/api/rewards/history', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const activities = await storage.getRewardActivities(req.user.id);
      return res.status(200).json(activities);
    } catch (error) {
      console.error('Error fetching reward activities:', error);
      return res.status(500).json({ error: 'Failed to fetch reward activities' });
    }
  });
  
  // Create a new reward activity (earn tokens)
  app.post('/api/rewards/earn', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const rewardSchema = z.object({
        activityType: z.enum(['journal_entry', 'chat_participation', 'emotion_update', 'daily_login', 'help_others'] as const),
        tokensEarned: z.number().int().positive(),
        description: z.string()
      });
      
      const { activityType, tokensEarned, description } = rewardSchema.parse(req.body);
      
      // Get today's beginning timestamp (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the user has already earned tokens for this activity type today
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedTokensTodayForActivity = recentActivities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === activityType && activityDate >= today;
      });
      
      // Only reward tokens once per day for each activity type
      if (hasEarnedTokensTodayForActivity) {
        return res.status(400).json({
          error: `You've already earned tokens for ${activityType.replace('_', ' ')} today. Come back tomorrow!`,
          alreadyEarned: true
        });
      }
      
      // Create the reward activity and earn tokens
      const activity = await storage.createRewardActivity(
        req.user.id, 
        activityType, 
        tokensEarned, 
        description
      );
      
      return res.status(201).json(activity);
    } catch (error) {
      console.error('Error creating reward activity:', error);
      return res.status(400).json({ error: 'Invalid reward activity data' });
    }
  });
  
  // Gamification endpoints
  
  // Get user's gamification profile
  app.get('/api/gamification/profile', async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user.id : 1; // Use user 1 for demo if not logged in
      const profile = await storage.getGamificationProfile(userId);
      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching gamification profile:', error);
      return res.status(500).json({ error: 'Failed to fetch gamification profile' });
    }
  });
  
  // Get available challenges
  app.get('/api/gamification/challenges', async (req, res) => {
    try {
      const challenges = await storage.getGamificationChallenges();
      return res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  });
  
  // Get achievements
  app.get('/api/gamification/achievements', async (req, res) => {
    try {
      const achievements = await storage.getGamificationAchievements();
      return res.status(200).json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });
  
  // Get leaderboard
  app.get('/api/gamification/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getGamificationLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });
  
  // Complete a gamification activity/challenge
  app.post('/api/gamification/complete-activity', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const activitySchema = z.object({
        activityId: z.string()
      });
      
      const { activityId } = activitySchema.parse(req.body);
      
      const result = await storage.completeGamificationActivity(req.user.id, activityId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error completing activity:', error);
      return res.status(400).json({ error: error.message || 'Failed to complete activity' });
    }
  });
  
  // Claim achievement reward
  app.post('/api/gamification/claim-achievement', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const achievementSchema = z.object({
        achievementId: z.string()
      });
      
      const { achievementId } = achievementSchema.parse(req.body);
      
      const result = await storage.claimAchievementReward(req.user.id, achievementId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error claiming achievement reward:', error);
      return res.status(400).json({ error: error.message || 'Failed to claim achievement reward' });
    }
  });
  
  // Register daily check-in and update streak
  app.post('/api/gamification/check-in', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const checkInSchema = z.object({
        emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'])
      });
      
      const { emotion } = checkInSchema.parse(req.body);
      
      // Get today's beginning timestamp (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the user has already earned tokens for daily login today
      const recentActivities = await storage.getRewardActivities(req.user.id);
      const hasEarnedLoginTokensToday = recentActivities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        return activity.activityType === 'daily_login' && activityDate >= today;
      });
      
      // Process the streak check-in regardless of token earning
      const result = await storage.checkInStreak(req.user.id, emotion);
      
      // Only reward tokens once per day for login
      if (!hasEarnedLoginTokensToday) {
        // Create a reward activity for daily login - 3 tokens
        await storage.createRewardActivity(
          req.user.id,
          'daily_login',
          3, // Earn 3 tokens for daily login
          `Earned 3 tokens for daily check-in`
        );
        
        // Update the result to include tokens earned
        result.tokensEarned = 3;
      } else {
        // No tokens earned for subsequent logins on the same day
        result.tokensEarned = 0;
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error registering check-in:', error);
      return res.status(400).json({ error: error.message || 'Failed to register check-in' });
    }
  });
  
  // Premium User Challenge Creation and Completion Endpoints
  
  // Create a new challenge (premium users only)
  app.post('/api/challenges/create', requireAuth, requirePremium, async (req, res) => {
    try {
      const parsedData = insertChallengeSchema.parse(req.body);
      
      const challenge = await storage.createUserChallenge(req.user.id, parsedData);
      
      return res.status(201).json({
        success: true,
        challenge
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to create challenge',
        success: false
      });
    }
  });
  
  // Get challenges created by current user
  app.get('/api/challenges/my-created', requireAuth, async (req, res) => {
    try {
      const challenges = await storage.getUserCreatedChallenges(req.user.id);
      
      return res.status(200).json({
        success: true,
        challenges
      });
    } catch (error) {
      console.error('Error fetching user created challenges:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to fetch user created challenges',
        success: false
      });
    }
  });
  
  // Get all public user-created challenges
  app.get('/api/challenges/public', async (req, res) => {
    try {
      const challenges = await storage.getPublicUserCreatedChallenges();
      
      return res.status(200).json({
        success: true,
        challenges
      });
    } catch (error) {
      console.error('Error fetching public challenges:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to fetch public challenges',
        success: false
      });
    }
  });
  
  // Record progress on a challenge
  app.post('/api/challenges/:challengeId/progress', requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({
          error: 'Invalid challenge ID format',
          success: false
        });
      }
      
      const notes = req.body.notes || null;
      
      // Get current progress before recording
      const previousProgress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      
      // Record progress
      const completion = await storage.recordChallengeProgress(req.user.id, challengeId, notes);
      
      // Get updated progress
      const currentProgress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      
      // Check if the challenge was completed with this update
      const isCompleted = completion.completedAt !== null;
      
      return res.status(200).json({
        success: true,
        completion,
        previousProgress,
        currentProgress,
        isCompleted
      });
    } catch (error) {
      console.error('Error recording challenge progress:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to record challenge progress',
        success: false
      });
    }
  });
  
  // Get user's progress on a specific challenge
  app.get('/api/challenges/:challengeId/progress', requireAuth, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({
          error: 'Invalid challenge ID format',
          success: false
        });
      }
      
      const progress = await storage.getUserChallengeProgress(req.user.id, challengeId);
      
      return res.status(200).json({
        success: true,
        progress
      });
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to fetch challenge progress',
        success: false
      });
    }
  });
  
  // Profile picture endpoints
  app.put('/api/user/profile-picture', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const profilePicSchema = z.object({
        profilePicture: z.string().url()
      });
      
      const { profilePicture } = profilePicSchema.parse(req.body);
      
      const user = await storage.updateUserProfilePicture(req.user.id, profilePicture);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return res.status(400).json({ error: error.message || 'Failed to update profile picture' });
    }
  });
  
  // Shared milestone endpoint for public viewing
  app.get('/api/share/milestone', async (req, res) => {
    try {
      const { user: username, milestone, trackingId } = req.query;
      
      if (!username || !milestone) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          message: 'Username and milestone are required'
        });
      }
      
      // Get user by username
      const user = await storage.getUserByUsername(username.toString());
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'The specified user does not exist'
        });
      }
      
      const milestoneValue = parseInt(milestone.toString(), 10);
      
      // Get user token count
      const userTokens = user.emotionTokens || 0;
      
      // Create milestone data response
      const milestoneData = {
        user: {
          username: user.username,
          avatar: user.profilePicture,
          level: user.level || 1,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        },
        milestone: milestoneValue,
        currentTokens: userTokens,
        achieved: userTokens >= milestoneValue,
        trackingId: trackingId?.toString()
      };
      
      return res.status(200).json(milestoneData);
    } catch (error) {
      console.error('Error fetching milestone data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch milestone data',
        message: error instanceof Error ? error.message : 'Server error'
      });
    }
  });
  
  // Badge endpoints
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch badges' });
    }
  });
  
  app.get('/api/user/badges', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const badges = await storage.getUserBadges(req.user.id);
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch user badges' });
    }
  });
  
  // Get challenges by difficulty
  app.get('/api/challenges/:difficulty', async (req, res) => {
    try {
      const difficultySchema = z.enum(['easy', 'moderate', 'hard', 'extreme']);
      const difficulty = difficultySchema.parse(req.params.difficulty);
      
      const challenges = await storage.getChallengesByDifficulty(difficulty);
      return res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by difficulty:', error);
      return res.status(400).json({ error: error.message || 'Invalid difficulty level' });
    }
  });
  
  // Complete a challenge
  app.post('/api/challenges/:challengeId/complete', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const challengeId = parseInt(req.params.challengeId, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: 'Invalid challenge ID' });
      }
      
      const result = await storage.completeChallenge(req.user.id, challengeId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error completing challenge:', error);
      return res.status(400).json({ error: error.message || 'Failed to complete challenge' });
    }
  });

  // Profile picture upload endpoint
  app.post('/api/profile/picture', imageUpload.single('profilePicture'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Check if this is a removal request
      if (req.body.remove === 'true') {
        // Update profile picture to null
        const user = await storage.updateUserProfilePicture(req.user.id, null);
        return res.status(200).json({ 
          success: true, 
          message: 'Profile picture removed',
          profilePicture: null
        });
      }

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Create the URL for the profile picture
      const profilePictureUrl = `/uploads/${req.file.filename}`;

      // Update the user's profile picture in storage
      const user = await storage.updateUserProfilePicture(req.user.id, profilePictureUrl);

      return res.status(200).json({ 
        success: true, 
        message: 'Profile picture updated',
        profilePicture: profilePictureUrl
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return res.status(500).json({ error: 'Failed to update profile picture' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(__dirname, '../uploads', path.basename(req.url));
    res.sendFile(filePath, err => {
      if (err) {
        next(); // If file not found, continue to next middleware
      }
    });
  });

  // Badge endpoints
  // Get all badges
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      return res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Get user's badges
  app.get('/api/user/badges', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const badges = await storage.getUserBadges(req.user.id);
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return res.status(500).json({ error: 'Failed to fetch user badges' });
    }
  });

  // Challenge endpoints by difficulty
  app.get('/api/challenges/:difficulty', async (req, res) => {
    try {
      const difficultySchema = z.enum(['easy', 'moderate', 'hard', 'extreme']);
      const difficulty = difficultySchema.parse(req.params.difficulty) as ChallengeDifficulty;
      
      const challenges = await storage.getChallengesByDifficulty(difficulty);
      return res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by difficulty:', error);
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }
  });

  // Complete a challenge
  app.post('/api/challenges/complete/:challengeId', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const challengeId = parseInt(req.params.challengeId, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: 'Invalid challenge ID' });
      }

      const result = await storage.completeChallenge(req.user.id, challengeId);
      
      return res.status(200).json({
        success: true,
        challenge: result.challenge,
        tokensAwarded: result.tokensAwarded,
        badgeAwarded: result.badgeAwarded
      });
    } catch (error) {
      console.error('Error completing challenge:', error);
      return res.status(500).json({ error: 'Failed to complete challenge' });
    }
  });

  // Get user's token balance
  app.get('/api/tokens', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const tokens = await storage.getUserTokens(req.user.id);
      return res.status(200).json({ tokens });
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return res.status(500).json({ error: 'Failed to fetch user tokens' });
    }
  });

  // Get user's reward activities history
  app.get('/api/rewards/history', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const activities = await storage.getRewardActivities(req.user.id);
      return res.status(200).json(activities);
    } catch (error) {
      console.error('Error fetching reward activities:', error);
      return res.status(500).json({ error: 'Failed to fetch reward activities' });
    }
  });

  // ----- Token Redemption Endpoints -----

  // Check if user is eligible for token redemption
  app.get('/api/token-redemption/eligibility', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const eligibility = await storage.getEligibleForRedemption(req.user.id);
      return res.status(200).json(eligibility);
    } catch (error) {
      console.error('Error checking redemption eligibility:', error);
      return res.status(500).json({ 
        error: 'Failed to check redemption eligibility',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's token redemption history
  app.get('/api/token-redemption/history', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const redemptions = await storage.getUserTokenRedemptions(req.user.id);
      return res.status(200).json(redemptions);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch redemption history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create a new token redemption request
  app.post('/api/token-redemption/request', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Validate the request body using the schema from shared/schema.ts
      const validatedData = insertTokenRedemptionSchema.parse(req.body);
      
      // Create the redemption request
      const redemption = await storage.createTokenRedemption(req.user.id, validatedData);
      
      return res.status(201).json({
        success: true,
        redemption
      });
    } catch (error) {
      console.error('Error creating redemption request:', error);
      return res.status(400).json({ 
        error: 'Failed to create redemption request',
        message: error instanceof Error ? error.message : 'Invalid redemption data'
      });
    }
  });

  // Cancel a pending token redemption (only works if status is 'pending')
  app.post('/api/token-redemption/:redemptionId/cancel', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const redemptionId = parseInt(req.params.redemptionId, 10);
      if (isNaN(redemptionId)) {
        return res.status(400).json({ error: 'Invalid redemption ID' });
      }

      // First verify if the redemption belongs to the user
      const userRedemptions = await storage.getUserTokenRedemptions(req.user.id);
      const redemptionBelongsToUser = userRedemptions.some(r => r.id === redemptionId);

      if (!redemptionBelongsToUser) {
        return res.status(403).json({ error: 'You do not have permission to cancel this redemption' });
      }

      // Update the redemption status to 'canceled'
      const updatedRedemption = await storage.updateTokenRedemptionStatus(redemptionId, 'canceled');
      
      return res.status(200).json({
        success: true,
        redemption: updatedRedemption
      });
    } catch (error) {
      console.error('Error canceling redemption request:', error);
      return res.status(500).json({ 
        error: 'Failed to cancel redemption request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update premium status (simulated payment integration)
  app.post('/api/premium/activate', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // This would normally involve a payment processor
      // For now, we'll just update the user's premium status
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
      console.error('Error activating premium:', error);
      return res.status(500).json({ 
        error: 'Failed to activate premium',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update payment details
  app.post('/api/payment/update-details', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const paymentSchema = z.object({
        paymentProvider: z.enum(['paypal', 'stripe']),
        accountInfo: z.string()
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
      console.error('Error updating payment details:', error);
      return res.status(400).json({ 
        error: 'Failed to update payment details',
        message: error instanceof Error ? error.message : 'Invalid payment data'
      });
    }
  });
  
  // Premium chat rooms routes
  app.post('/api/premium/chat-rooms', requireAuth, requirePremium, async (req, res) => {
    
    try {
      const chatRoomSchema = z.object({
        name: z.string().min(3).max(50),
        description: z.string().min(10).max(200),
        emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral']),
        isPrivate: z.boolean().default(true),
        maxParticipants: z.number().int().min(2).max(100).default(20),
        themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#6366f1')
      });
      
      const chatRoomData = chatRoomSchema.parse(req.body);
      const newChatRoom = await storage.createChatRoom(req.user.id, chatRoomData);
      
      res.status(201).json({
        success: true,
        chatRoom: newChatRoom
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      return res.status(400).json({ 
        error: 'Failed to create chat room',
        message: error instanceof Error ? error.message : 'Invalid chat room data'
      });
    }
  });
  
  app.get('/api/premium/chat-rooms', requireAuth, async (req, res) => {
    try {
      const privateChatRooms = await storage.getPrivateChatRoomsByUserId(req.user.id);
      res.json(privateChatRooms);
    } catch (error) {
      console.error('Error fetching private chat rooms:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch private chat rooms',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.put('/api/premium/chat-rooms/:id', requireAuth, async (req, res) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const chatRoom = await storage.getChatRoomById(chatRoomId);
      
      if (!chatRoom) {
        return res.status(404).json({ 
          error: 'Chat room not found',
          message: `No chat room found with ID ${chatRoomId}`
        });
      }
      
      // Ensure the user is the creator of the chat room
      if (chatRoom.createdBy !== req.user.id) {
        return res.status(403).json({ 
          error: 'Permission denied',
          message: 'Only the creator can update the chat room'
        });
      }
      
      const chatRoomSchema = z.object({
        name: z.string().min(3).max(50).optional(),
        description: z.string().min(10).max(200).optional(),
        emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral']).optional(),
        maxParticipants: z.number().int().min(2).max(100).optional(),
        themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional()
      });
      
      const chatRoomUpdates = chatRoomSchema.parse(req.body);
      const updatedChatRoom = await storage.updateChatRoom(chatRoomId, chatRoomUpdates);
      
      res.json({
        success: true,
        chatRoom: updatedChatRoom
      });
    } catch (error) {
      console.error('Error updating chat room:', error);
      return res.status(400).json({ 
        error: 'Failed to update chat room',
        message: error instanceof Error ? error.message : 'Invalid chat room data'
      });
    }
  });
  
  app.delete('/api/premium/chat-rooms/:id', requireAuth, async (req, res) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const chatRoom = await storage.getChatRoomById(chatRoomId);
      
      if (!chatRoom) {
        return res.status(404).json({ 
          error: 'Chat room not found',
          message: `No chat room found with ID ${chatRoomId}`
        });
      }
      
      // Ensure the user is the creator of the chat room
      if (chatRoom.createdBy !== req.user.id) {
        return res.status(403).json({ 
          error: 'Permission denied',
          message: 'Only the creator can delete the chat room'
        });
      }
      
      const success = await storage.deleteChatRoom(chatRoomId);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Chat room successfully deleted'
        });
      } else {
        res.status(500).json({ 
          error: 'Deletion failed',
          message: 'Failed to delete chat room'
        });
      }
    } catch (error) {
      console.error('Error deleting chat room:', error);
      return res.status(500).json({ 
        error: 'Failed to delete chat room',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // User blocking routes for premium users
  app.post('/api/premium/block-user', requireAuth, requirePremium, async (req, res) => {
    
    try {
      const blockSchema = z.object({
        blockedUserId: z.number().int().positive(),
        reason: z.string().max(200).optional()
      });
      
      const { blockedUserId, reason } = blockSchema.parse(req.body);
      
      // Check if trying to block self
      if (blockedUserId === req.user.id) {
        return res.status(400).json({ 
          error: 'Invalid operation',
          message: 'You cannot block yourself'
        });
      }
      
      // Check if user exists
      const userToBlock = await storage.getUser(blockedUserId);
      if (!userToBlock) {
        return res.status(404).json({ 
          error: 'User not found',
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
      console.error('Error blocking user:', error);
      return res.status(400).json({ 
        error: 'Failed to block user',
        message: error instanceof Error ? error.message : 'Invalid data'
      });
    }
  });
  
  app.get('/api/premium/blocked-users', requireAuth, async (req, res) => {
    try {
      const blockedUsers = await storage.getBlockedUsers(req.user.id);
      
      // Format the response to only include necessary information
      const formattedBlockedUsers = blockedUsers.map(block => ({
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
      console.error('Error fetching blocked users:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch blocked users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.delete('/api/premium/blocked-users/:id', requireAuth, async (req, res) => {
    try {
      const blockedUserId = parseInt(req.params.id);
      const success = await storage.unblockUser(req.user.id, blockedUserId);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'User successfully unblocked'
        });
      } else {
        res.status(404).json({ 
          error: 'User not found',
          message: 'The specified user was not blocked or already unblocked'
        });
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      return res.status(500).json({ 
        error: 'Failed to unblock user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ----- Family Plan Routes -----
  
  // Get user's family members
  app.get('/api/family-members', requireAuth, async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers(req.user.id);
      return res.status(200).json(familyMembers);
    } catch (error) {
      console.error('Error fetching family members:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch family members',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Add a family member
  app.post('/api/family-members', requireAuth, requirePremium, async (req, res) => {
    try {
      // Validate the premium plan is a family plan
      const premiumPlan = await storage.getUserPremiumPlan(req.user.id);
      if (!premiumPlan || premiumPlan.planType !== 'family') {
        return res.status(403).json({ error: 'You need a family plan to add family members' });
      }
      
      const familySchema = z.object({
        relatedUserId: z.number(),
        relationshipType: z.enum(['parent', 'child', 'spouse', 'sibling', 'grandparent', 'other']),
        canViewMood: z.boolean().default(false),
        canViewJournal: z.boolean().default(false),
        canReceiveAlerts: z.boolean().default(false),
        canTransferTokens: z.boolean().default(false),
        notes: z.string().nullish(),
      });
      
      const validatedData = familySchema.parse(req.body);
      
      // Add the family member
      const relationship = await storage.addFamilyMember(req.user.id, {
        ...validatedData,
        userId: req.user.id,
      });
      
      return res.status(201).json(relationship);
    } catch (error) {
      console.error('Error adding family member:', error);
      return res.status(500).json({ 
        error: 'Failed to add family member',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Update family relationship
  app.patch('/api/family-members/:id', requireAuth, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      
      const updateSchema = z.object({
        canViewMood: z.boolean().optional(),
        canViewJournal: z.boolean().optional(),
        canReceiveAlerts: z.boolean().optional(),
        canTransferTokens: z.boolean().optional(),
        relationshipType: z.enum(['parent', 'child', 'spouse', 'sibling', 'grandparent', 'other']).optional(),
        notes: z.string().nullish(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update the relationship
      const relationship = await storage.updateFamilyMember(relationshipId, validatedData);
      
      return res.status(200).json(relationship);
    } catch (error) {
      console.error('Error updating family relationship:', error);
      return res.status(500).json({ 
        error: 'Failed to update family relationship',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Update family relationship status (accept/reject)
  app.patch('/api/family-members/:id/status', requireAuth, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      
      const statusSchema = z.object({
        status: z.enum(['accepted', 'rejected']),
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Update the relationship status
      const relationship = await storage.updateFamilyRelationshipStatus(relationshipId, status);
      
      return res.status(200).json(relationship);
    } catch (error) {
      console.error('Error updating family relationship status:', error);
      return res.status(500).json({ 
        error: 'Failed to update family relationship status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Remove a family member
  app.delete('/api/family-members/:id', requireAuth, async (req, res) => {
    try {
      const relationshipId = parseInt(req.params.id);
      
      // Remove the family member
      const success = await storage.removeFamilyMember(relationshipId);
      
      if (success) {
        return res.status(200).json({ message: 'Family member removed successfully' });
      } else {
        return res.status(404).json({ error: 'Family relationship not found' });
      }
    } catch (error) {
      console.error('Error removing family member:', error);
      return res.status(500).json({ 
        error: 'Failed to remove family member',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get family mood data
  app.get('/api/family-mood', requireAuth, requirePremium, async (req, res) => {
    try {
      const moodData = await storage.getFamilyMoodData(req.user.id);
      return res.status(200).json(moodData);
    } catch (error) {
      console.error('Error fetching family mood data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch family mood data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Toggle mood tracking consent
  app.patch('/api/mood-tracking-consent', requireAuth, async (req, res) => {
    try {
      const consentSchema = z.object({
        allowMoodTracking: z.boolean(),
      });
      
      const { allowMoodTracking } = consentSchema.parse(req.body);
      
      // Update the user's consent
      const user = await storage.updateMoodTrackingConsent(req.user.id, allowMoodTracking);
      
      return res.status(200).json({ 
        message: allowMoodTracking ? 'Mood tracking enabled' : 'Mood tracking disabled',
        user
      });
    } catch (error) {
      console.error('Error updating mood tracking consent:', error);
      return res.status(500).json({ 
        error: 'Failed to update mood tracking consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // ----- Token Transfer Routes -----
  
  // Get user's token transfers
  app.get('/api/token-transfers', requireAuth, async (req, res) => {
    try {
      const transfers = await storage.getTokenTransfers(req.user.id);
      return res.status(200).json(transfers);
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch token transfers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get token transfers by type
  app.get('/api/token-transfers/:type', requireAuth, async (req, res) => {
    try {
      const type = req.params.type as 'family' | 'general';
      if (type !== 'family' && type !== 'general') {
        return res.status(400).json({ error: 'Invalid transfer type. Must be either "family" or "general".' });
      }
      
      const transfers = await storage.getTokenTransfersByType(req.user.id, type);
      return res.status(200).json(transfers);
    } catch (error) {
      console.error('Error fetching token transfers by type:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch token transfers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Check if user can transfer tokens to another user
  app.get('/api/can-transfer-tokens/:userId', requireAuth, async (req, res) => {
    try {
      const toUserId = parseInt(req.params.userId);
      
      const result = await storage.canTransferTokensToUser(req.user.id, toUserId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error checking token transfer ability:', error);
      return res.status(500).json({ 
        error: 'Failed to check token transfer ability',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Transfer tokens
  app.post('/api/token-transfers', requireAuth, async (req, res) => {
    try {
      const transferSchema = z.object({
        toUserId: z.number(),
        amount: z.number().positive(),
        notes: z.string().optional(),
      });
      
      const validatedData = transferSchema.parse(req.body);
      
      // Execute the transfer
      const result = await storage.transferTokens(
        req.user.id, 
        validatedData.toUserId, 
        validatedData.amount, 
        validatedData.notes
      );
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return res.status(500).json({ 
        error: 'Failed to transfer tokens',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // ----- Milestone Sharing Routes -----
  
  // Record a milestone share
  app.post('/api/milestone-shares', requireAuth, async (req, res) => {
    try {
      const shareSchema = z.object({
        milestone: z.number().int().positive(),
        platform: z.enum(["twitter", "facebook", "linkedin", "whatsapp", "telegram", "email", "pinterest", "reddit", "copy_link"] as const),
        shareUrl: z.string().url(),
        shareMessage: z.string().optional(),
        trackingId: z.string().uuid(),
      });
      
      const validatedData = shareSchema.parse(req.body);
      
      // Add IP address from request
      const shareData = {
        ...validatedData,
        userId: req.user.id,
        ipAddress: req.ip,
      };
      
      // Create the milestone share record
      const milestoneShare = await storage.createMilestoneShare(shareData);
      
      // Award tokens for sharing (first time sharing each milestone)
      const hasSharedMilestoneBefore = await storage.hasUserSharedMilestone(req.user.id, validatedData.milestone);
      
      if (!hasSharedMilestoneBefore) {
        // Award tokens for first-time sharing of this milestone
        const tokensAwarded = 5; // Fixed amount for milestone sharing
        
        // Record the token reward
        await storage.createRewardActivity(
          req.user.id,
          'milestone_share',
          tokensAwarded,
          `Shared ${validatedData.milestone} token milestone on ${validatedData.platform}`
        );
        
        // Update the milestone share with tokens awarded
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
      console.error('Error recording milestone share:', error);
      return res.status(400).json({ 
        error: 'Failed to record milestone share',
        message: error instanceof Error ? error.message : 'Invalid share data'
      });
    }
  });
  
  // Track milestone share click
  app.get('/api/milestone-shares/:trackingId/click', async (req, res) => {
    try {
      const { trackingId } = req.params;
      
      // Record the click
      const milestoneShare = await storage.incrementMilestoneShareClicks(trackingId);
      
      // Redirect to the appropriate page (could be sign-up page with referral code)
      res.redirect('/welcome');
    } catch (error) {
      console.error('Error tracking milestone share click:', error);
      return res.status(400).json({ 
        error: 'Failed to track milestone share click',
        message: error instanceof Error ? error.message : 'Invalid tracking ID'
      });
    }
  });
  
  // Get user's milestone shares
  app.get('/api/milestone-shares', requireAuth, async (req, res) => {
    try {
      const shares = await storage.getUserMilestoneShares(req.user.id);
      return res.status(200).json(shares);
    } catch (error) {
      console.error('Error fetching user milestone shares:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch milestone shares',
        message: error instanceof Error ? error.message : 'Server error'
      });
    }
  });

  // ----- Referral System Routes -----

  // Get user's referrals
  app.get('/api/referrals', requireAuth, async (req, res) => {
    try {
      const referrals = await storage.getReferralsByUser(req.user.id);
      return res.status(200).json(referrals);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch referrals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get referral statistics
  app.get('/api/referrals/statistics', requireAuth, async (req, res) => {
    try {
      const statistics = await storage.getReferralStatistics(req.user.id);
      return res.status(200).json(statistics);
    } catch (error) {
      console.error('Error fetching referral statistics:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch referral statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Check referral bounty eligibility and claim if eligible
  app.post('/api/referrals/claim-bounty', requireAuth, requirePremium, async (req, res) => {
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
      console.error('Error claiming referral bounty:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process bounty claim',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Create a new referral (sending invitation)
  app.post('/api/referrals', requireAuth, async (req, res) => {
    try {
      const referralSchema = z.object({
        email: z.string().email(),
      });
      
      const { email } = referralSchema.parse(req.body);
      
      // Generate a unique referral code for this specific invitation
      const referralCode = req.user.referralCode;
      
      // Check if referral to this email already exists
      const existingReferrals = await storage.getReferralsByUser(req.user.id);
      const alreadyReferred = existingReferrals.some(ref => 
        ref.referralEmail?.toLowerCase() === email.toLowerCase() && 
        ref.status === 'pending'
      );
      
      if (alreadyReferred) {
        return res.status(400).json({ 
          error: 'Already referred',
          message: 'You have already sent a referral to this email address'
        });
      }
      
      // Create the referral record
      const referral = await storage.createReferral(
        req.user.id,
        null, // No referred user yet
        email,
        referralCode
      );
      
      // In a real app, you would send an email here with the referral link
      
      return res.status(201).json({
        success: true,
        referral,
        referralLink: `https://moodsync.com/join?ref=${referralCode}` // Example link format
      });
    } catch (error) {
      console.error('Error creating referral:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid data', 
          details: error.errors 
        });
      }
      return res.status(500).json({ 
        error: 'Failed to create referral',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Check referral code validity
  app.get('/api/referrals/validate/:code', async (req, res) => {
    try {
      const referralCode = req.params.code;
      
      if (!referralCode) {
        return res.status(400).json({ 
          error: 'Missing referral code',
          valid: false
        });
      }
      
      const referral = await storage.getReferralByCode(referralCode);
      
      if (!referral) {
        return res.status(404).json({ 
          error: 'Invalid referral code',
          valid: false
        });
      }
      
      // Check if the referral has expired
      if (referral.status === 'expired' || new Date(referral.expiresAt) < new Date()) {
        return res.status(400).json({ 
          error: 'Referral code has expired',
          valid: false,
          expired: true
        });
      }
      
      // Get referrer details
      const referrer = await storage.getUser(referral.referrerUserId);
      
      // Don't send back the whole user object, just relevant info
      return res.status(200).json({
        valid: true,
        referrerUsername: referrer?.username || 'Anonymous',
        code: referralCode
      });
    } catch (error) {
      console.error('Error validating referral code:', error);
      return res.status(500).json({ 
        error: 'Failed to validate referral code',
        valid: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Register using a referral code
  app.post('/api/register/referral', async (req, res, next) => {
    try {
      const registerSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        email: z.string().email(),
        referralCode: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        gender: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional()
      });
      
      const userData = registerSchema.parse(req.body);
      
      // Check if the referral code is valid
      const referral = await storage.getReferralByCode(userData.referralCode);
      
      if (!referral) {
        return res.status(400).json({ 
          error: 'Invalid referral code' 
        });
      }
      
      // Check if the referral has expired
      if (referral.status === 'expired' || new Date(referral.expiresAt) < new Date()) {
        return res.status(400).json({ 
          error: 'Referral code has expired'
        });
      }
      
      // Check for duplicate username
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check for duplicate email
      if (userData.email) {
        const existingEmail = await storage.findUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      
      // Capture IP address to prevent duplicate accounts
      let ipAddress: string | null = null;
      if (req.ip) {
        ipAddress = req.ip;
      } else if (req.headers['x-forwarded-for']) {
        const forwarded = req.headers['x-forwarded-for'];
        ipAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      } else if (req.socket.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      }
      
      // Create the user with the referral
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
        ipAddress: ipAddress || undefined,
        referredBy: userData.referralCode
      });
      
      // Update the referral status
      await storage.updateReferralStatus(referral.id, 'registered');
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        res.status(201).json({
          user,
          referral: {
            code: userData.referralCode,
            status: 'registered'
          }
        });
      });
    } catch (error) {
      console.error('Error registering with referral:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid registration data', 
          details: error.errors 
        });
      }
      next(error);
    }
  });
  
  // Convert a referral to premium status
  app.post('/api/referrals/:id/convert', requireAuth, requirePremium, async (req, res) => {
    try {
      const referralId = parseInt(req.params.id, 10);
      
      if (isNaN(referralId)) {
        return res.status(400).json({ error: 'Invalid referral ID' });
      }
      
      // Only allow converting referrals that are in 'registered' status
      const updatedReferral = await storage.updateReferralStatus(referralId, 'converted');
      
      if (!updatedReferral) {
        return res.status(404).json({ error: 'Referral not found' });
      }
      
      return res.status(200).json({
        success: true,
        referral: updatedReferral
      });
    } catch (error) {
      console.error('Error converting referral:', error);
      return res.status(500).json({ 
        error: 'Failed to convert referral',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin API routes
  
  // Admin dashboard
  app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
    try {
      // Get summary statistics for admin dashboard
      const allUsers = Array.from(storage.users.values());
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => user.lastLogin && 
        (new Date().getTime() - new Date(user.lastLogin).getTime()) < 7 * 24 * 60 * 60 * 1000).length;
      const premiumUsers = allUsers.filter(user => user.isPremium).length;
      
      // Get actual data from the database when in production
      // For the initial app launch, we'll set placeholders until real data is generated
      const openTickets = 0; // Set to 0 for initial launch
      const pendingRefunds = 0; // Set to 0 for initial launch
      const totalRevenue = 0; // Set to 0 for initial launch
      
      // Format dates properly for recent tickets
      const recentTickets = [
        // Create a few sample tickets with properly formatted dates that will show up in the UI
        { 
          id: 1, 
          title: "Account access issue", 
          status: "open", 
          category: "account",
          createdAt: new Date(), 
          formattedDate: new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        { 
          id: 2, 
          title: "Premium feature not working", 
          status: "in_progress", 
          category: "technical",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          formattedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) 
        },
        { 
          id: 3, 
          title: "Refund request", 
          status: "open", 
          category: "refund",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          formattedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
      ];
      
      // Format dates properly for recent refunds
      const recentRefunds = [
        { 
          id: 1, 
          amount: 0, 
          status: "pending", 
          createdAt: new Date(), 
          formattedDate: new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ];
      
      // Count users by emotion
      const usersByEmotion = {
        happy: 0, sad: 0, angry: 0, anxious: 0, excited: 0, neutral: 0
      };
      
      // Count emotions
      for (const [_, emotion] of storage.userEmotions) {
        if (usersByEmotion[emotion] !== undefined) {
          usersByEmotion[emotion]++;
        }
      }
      
      // Get the logged-in admin user information
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
      console.error('Error fetching admin dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
    }
  });
  
  // Admin authentication
  app.post('/api/admin/login', async (req, res) => {
    try {
      console.log('Admin login attempt:', req.body);
      
      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      });
      
      const { username, password } = loginSchema.parse(req.body);
      console.log('Admin login credentials parsed:', { username, password: '********' });
      
      // Find the admin user
      const adminUser = await storage.getAdminUserByUsername(username);
      console.log('Admin user found:', adminUser ? 'Yes' : 'No');
      
      if (!adminUser) {
        console.log('Admin login failed: User not found');
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // For this demo app, we're directly comparing passwords
      // In production, we would use a secure password hashing method
      console.log('Comparing passwords...');
      if (adminUser.password !== password) {
        console.log('Admin login failed: Password mismatch');
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      console.log('Admin login successful for user:', adminUser.username);
      
      // Update last login timestamp
      adminUser.lastLogin = new Date();
      await storage.updateAdminUser(adminUser.id, { lastLogin: adminUser.lastLogin });
      
      // Record the admin action for audit logging
      await storage.createAdminAction({
        adminId: adminUser.id,
        actionType: 'login',
        targetType: 'admin',
        targetId: adminUser.id,
        actionDetails: 'Admin login',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      // Store the admin user in the session (not just request)
      // @ts-ignore - Adding adminUser to the session
      req.session.adminUser = adminUser;
      req.adminUser = adminUser;
      
      console.log('Admin session created and stored in session');
      
      // Remove sensitive data before sending response
      const { password: _, ...safeAdminData } = adminUser;
      
      res.status(200).json(safeAdminData);
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(400).json({ 
        error: 'Invalid login data',
        message: error instanceof Error ? error.message : 'Failed to log in'
      });
    }
  });
  
  // Admin logout
  app.post('/api/admin/logout', async (req, res) => {
    try {
      // Check if there's a valid admin session first
      if (!req.adminUser) {
        return res.status(401).json({ error: 'No active admin session' });
      }
      
      // Log the logout action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'logout',
        targetType: 'admin',
        targetId: req.adminUser.id,
        actionDetails: 'Admin logout',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      // Clear the admin session
      delete req.adminUser;
      
      // Also clear from the session
      if (req.session) {
        // @ts-ignore - Removing adminUser from session
        delete req.session.adminUser;
        
        // Save the session to persist changes
        req.session.save(err => {
          if (err) {
            console.error('Error saving session during logout:', err);
          }
          console.log('Admin session cleared successfully');
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Admin logged out successfully' 
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ 
        error: 'Failed to log out',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  });
  
  // Admin user management
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const adminUsers = await storage.getAllAdminUsers();
      
      // Remove passwords from response
      const safeAdminUsers = adminUsers.map(admin => {
        const { password, ...safeAdmin } = admin;
        return safeAdmin;
      });
      
      res.status(200).json(safeAdminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ error: 'Failed to fetch admin users' });
    }
  });
  
  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      // Validate admin data
      const adminData = insertAdminUserSchema.parse(req.body);
      
      // Create new admin user
      const newAdmin = await storage.createAdminUser({
        ...adminData,
        // In a real app, you would hash the password here
        password: adminData.password
      });
      
      // Record the admin action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'create_admin',
        targetType: 'admin',
        targetId: newAdmin.id,
        actionDetails: `Admin user ${newAdmin.username} created`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      // Remove password from response
      const { password, ...safeAdminData } = newAdmin;
      
      res.status(201).json(safeAdminData);
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(400).json({ 
        error: 'Invalid admin user data',
        message: error instanceof Error ? error.message : 'Failed to create admin user'
      });
    }
  });
  
  app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      
      // Get the admin user to update
      const existingAdmin = await storage.getAdminUser(adminId);
      if (!existingAdmin) {
        return res.status(404).json({ error: 'Admin user not found' });
      }
      
      // Check if the admin is trying to update a superadmin (not allowed unless they are also a superadmin)
      if (existingAdmin.role === 'admin' && req.adminUser.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Permission denied',
          message: 'You do not have permission to update an admin with higher privileges'
        });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // Update the admin user
      const updatedAdmin = await storage.updateAdminUser(adminId, updateData);
      
      // Record the admin action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'update_admin',
        targetType: 'admin',
        targetId: adminId,
        actionDetails: `Admin user ${updatedAdmin.username} updated`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      // Remove password from response
      const { password, ...safeAdminData } = updatedAdmin;
      
      res.status(200).json(safeAdminData);
    } catch (error) {
      console.error('Error updating admin user:', error);
      res.status(400).json({ 
        error: 'Invalid admin user update data',
        message: error instanceof Error ? error.message : 'Failed to update admin user'
      });
    }
  });
  
  // Support ticket management
  app.get('/api/admin/tickets', requireAdmin, async (req, res) => {
    try {
      // Parse query parameters for filtering
      const status = req.query.status as TicketStatus | undefined;
      const category = req.query.category as TicketCategory | undefined;
      const priority = req.query.priority as TicketPriority | undefined;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;
      
      // Get tickets with optional filters
      const tickets = await storage.getAllSupportTickets({
        status,
        category,
        priority,
        assignedTo
      });
      
      res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
  });
  
  app.post('/api/admin/tickets', requireAuth, async (req, res) => {
    try {
      // Validate ticket data
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Create new support ticket
      const newTicket = await storage.createSupportTicket(ticketData);
      
      res.status(201).json(newTicket);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(400).json({ 
        error: 'Invalid support ticket data',
        message: error instanceof Error ? error.message : 'Failed to create support ticket'
      });
    }
  });
  
  app.get('/api/admin/tickets/:id', requireAuth, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Get the ticket
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      
      // Regular users can only view their own tickets
      if (!req.adminUser && ticket.userId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      // Get ticket responses
      const responses = await storage.getTicketResponses(ticketId);
      
      res.status(200).json({ ticket, responses });
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      res.status(500).json({ error: 'Failed to fetch support ticket' });
    }
  });
  
  app.patch('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Get the ticket to ensure it exists
      const existingTicket = await storage.getSupportTicket(ticketId);
      if (!existingTicket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // Update the ticket
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      
      // Record the admin action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'update_ticket',
        targetType: 'ticket',
        targetId: ticketId,
        actionDetails: `Support ticket #${ticketId} updated to status: ${updatedTicket.status}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      res.status(200).json(updatedTicket);
    } catch (error) {
      console.error('Error updating support ticket:', error);
      res.status(400).json({ 
        error: 'Invalid support ticket update data',
        message: error instanceof Error ? error.message : 'Failed to update support ticket'
      });
    }
  });
  
  // Ticket responses
  app.post('/api/admin/tickets/:id/responses', requireAuth, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Get the ticket to ensure it exists
      const existingTicket = await storage.getSupportTicket(ticketId);
      if (!existingTicket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      
      // Regular users can only respond to their own tickets
      if (!req.adminUser && existingTicket.userId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      // Validate response data
      const responseData = insertTicketResponseSchema.parse({
        ...req.body,
        ticketId,
        responderId: req.adminUser ? req.adminUser.id : req.user.id,
        isAdminResponse: !!req.adminUser
      });
      
      // Create the response
      const newResponse = await storage.createTicketResponse(responseData);
      
      // If admin response, record the admin action
      if (req.adminUser) {
        await storage.createAdminAction({
          adminId: req.adminUser.id,
          actionType: 'support_response',
          targetType: 'ticket',
          targetId: ticketId,
          actionDetails: `Admin response added to ticket #${ticketId}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || null
        });
      }
      
      res.status(201).json(newResponse);
    } catch (error) {
      console.error('Error creating ticket response:', error);
      res.status(400).json({ 
        error: 'Invalid ticket response data',
        message: error instanceof Error ? error.message : 'Failed to create ticket response'
      });
    }
  });
  
  // Mark response as helpful/not helpful
  app.patch('/api/admin/responses/:id/helpful', requireAuth, async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      
      // Validate data
      const helpfulSchema = z.object({
        isHelpful: z.boolean()
      });
      
      const { isHelpful } = helpfulSchema.parse(req.body);
      
      // Update the response
      const updatedResponse = await storage.markResponseHelpful(responseId, isHelpful);
      
      res.status(200).json(updatedResponse);
    } catch (error) {
      console.error('Error updating response helpfulness:', error);
      res.status(400).json({ 
        error: 'Invalid data',
        message: error instanceof Error ? error.message : 'Failed to update response'
      });
    }
  });
  
  // Refund requests
  app.post('/api/admin/refunds', requireAuth, async (req, res) => {
    try {
      // Validate refund request data
      const refundData = insertRefundRequestSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Create the refund request
      const newRefundRequest = await storage.createRefundRequest(refundData);
      
      res.status(201).json(newRefundRequest);
    } catch (error) {
      console.error('Error creating refund request:', error);
      res.status(400).json({ 
        error: 'Invalid refund request data',
        message: error instanceof Error ? error.message : 'Failed to create refund request'
      });
    }
  });
  
  app.get('/api/admin/refunds', requireAdmin, async (req, res) => {
    try {
      // Parse query parameters for filtering
      const status = req.query.status as RefundStatus | undefined;
      
      // Get refund requests with optional filters
      const refundRequests = await storage.getAllRefundRequests({ status });
      
      res.status(200).json(refundRequests);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      res.status(500).json({ error: 'Failed to fetch refund requests' });
    }
  });
  
  app.get('/api/admin/refunds/:id', requireAuth, async (req, res) => {
    try {
      const refundId = parseInt(req.params.id);
      
      // Get the refund request
      const refundRequest = await storage.getRefundRequest(refundId);
      
      if (!refundRequest) {
        return res.status(404).json({ error: 'Refund request not found' });
      }
      
      // Regular users can only view their own refund requests
      if (!req.adminUser && refundRequest.userId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      res.status(200).json(refundRequest);
    } catch (error) {
      console.error('Error fetching refund request:', error);
      res.status(500).json({ error: 'Failed to fetch refund request' });
    }
  });
  
  app.patch('/api/admin/refunds/:id', requireAdmin, async (req, res) => {
    try {
      const refundId = parseInt(req.params.id);
      
      // Get the refund request to ensure it exists
      const existingRefund = await storage.getRefundRequest(refundId);
      if (!existingRefund) {
        return res.status(404).json({ error: 'Refund request not found' });
      }
      
      // Validate update data
      const updateSchema = z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'processed']).optional(),
        notes: z.string().optional()
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Update the refund request
      const updatedRefund = await storage.updateRefundRequest(refundId, {
        ...updateData,
        processedBy: req.adminUser.id
      });
      
      // Record the admin action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'refund_processed',
        targetType: 'refund',
        targetId: refundId,
        actionDetails: `Refund request #${refundId} updated to status: ${updatedRefund.status}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      res.status(200).json(updatedRefund);
    } catch (error) {
      console.error('Error updating refund request:', error);
      res.status(400).json({ 
        error: 'Invalid refund request update data',
        message: error instanceof Error ? error.message : 'Failed to update refund request'
      });
    }
  });
  
  // Admin dashboard stats
  app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
    try {
      // We should always have an admin user at this point due to the requireAdmin middleware
      if (!req.adminUser) {
        console.log("No admin user found in the request after requireAdmin middleware");
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const stats = await storage.getSystemStats();
      
      // Include the admin user in the response
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
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });
  
  // Admin actions log
  app.get('/api/admin/actions', requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const adminActions = await storage.getAllAdminActions(limit);
      res.status(200).json(adminActions);
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      res.status(500).json({ error: 'Failed to fetch admin actions log' });
    }
  });
  
  // Quote management
  app.post('/api/admin/quotes', requireAdmin, async (req, res) => {
    try {
      // Validate quote data
      const quoteData = insertQuoteSchema.parse({
        ...req.body,
        adminId: req.adminUser.id
      });
      
      // Create new quote
      const newQuote = await storage.createQuote(quoteData);
      
      // Record the admin action
      await storage.createAdminAction({
        adminId: req.adminUser.id,
        actionType: 'quote_created',
        targetType: 'quote',
        targetId: newQuote.id,
        actionDetails: `Quote #${newQuote.id} created for amount ${newQuote.totalAmount} ${newQuote.currency}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
      
      res.status(201).json(newQuote);
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(400).json({ 
        error: 'Invalid quote data',
        message: error instanceof Error ? error.message : 'Failed to create quote'
      });
    }
  });
  
  app.get('/api/admin/quotes/:id', requireAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      
      // Get the quote
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Regular users can only view quotes associated with their user ID
      if (!req.adminUser && quote.userId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      res.status(200).json(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });
  
  app.patch('/api/admin/quotes/:id/status', requireAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      
      // Get the quote to ensure it exists
      const existingQuote = await storage.getQuote(quoteId);
      if (!existingQuote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Validate status update
      const statusSchema = z.object({
        status: z.enum(['pending', 'accepted', 'rejected', 'expired', 'canceled'])
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Regular users can only accept/reject quotes associated with their user ID
      if (!req.adminUser && existingQuote.userId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      // Additionally, regular users can only accept or reject, not change to other statuses
      if (!req.adminUser && status !== 'accepted' && status !== 'rejected') {
        return res.status(403).json({ 
          error: 'Permission denied',
          message: 'Regular users can only accept or reject quotes'
        });
      }
      
      // Update the quote status
      const updatedQuote = await storage.updateQuoteStatus(
        quoteId, 
        status,
        status === 'accepted' ? new Date() : undefined
      );
      
      // If an admin is making the update, record the action
      if (req.adminUser) {
        await storage.createAdminAction({
          adminId: req.adminUser.id,
          actionType: 'quote_updated',
          targetType: 'quote',
          targetId: quoteId,
          actionDetails: `Quote #${quoteId} status updated to ${status}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || null
        });
      }
      
      res.status(200).json(updatedQuote);
    } catch (error) {
      console.error('Error updating quote status:', error);
      res.status(400).json({ 
        error: 'Invalid quote status update',
        message: error instanceof Error ? error.message : 'Failed to update quote status'
      });
    }
  });
  
  // Video Posts API for premium users
  
  // Create new video post (premium users only)
  app.post('/api/videos', requireAuth, requirePremium, videoUpload.single('videoFile'), async (req, res) => {
    try {
      // Get the uploaded video file path
      const videoFile = req.file;
      
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }
      
      // Create a publicly accessible URL for the video
      const videoUrl = `/uploads/videos/${videoFile.filename}`;
      
      // If a thumbnail was provided in the request body, use it
      // Otherwise, we could generate a thumbnail here (not implemented)
      const thumbnailUrl = req.body.thumbnailUrl || '';
      
      // Combine the file data with the rest of the post data
      const videoPostData = {
        ...req.body,
        videoUrl,
        thumbnailUrl
      };
      
      const videoPost = await storage.createVideoPost(req.user.id, insertVideoPostSchema.parse(videoPostData));
      
      return res.status(201).json(videoPost);
    } catch (error) {
      console.error('Error creating video post:', error);
      return res.status(400).json({ error: 'Invalid video post data: ' + error.message });
    }
  });
  
  // Get all public video posts
  app.get('/api/videos', async (req, res) => {
    try {
      const category = req.query.category as VideoCategory | undefined;
      
      let videos;
      if (category) {
        videos = await storage.getVideoPostsByCategory(category);
      } else {
        videos = await storage.getAllPublicVideoPosts();
      }
      
      return res.status(200).json(videos);
    } catch (error) {
      console.error('Error fetching video posts:', error);
      return res.status(500).json({ error: 'Failed to fetch video posts' });
    }
  });
  
  // Get a specific video post
  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Only return non-public videos to the creator or other premium users
      if (!video.isPublic) {
        if (!req.isAuthenticated() || (!req.user.isPremium && video.userId !== req.user.id)) {
          return res.status(403).json({ 
            error: 'Premium required',
            message: 'This video is only available to premium members.' 
          });
        }
      }
      
      // Increment view count
      await storage.incrementVideoPostViews(id);
      
      return res.status(200).json(video);
    } catch (error) {
      console.error('Error fetching video post:', error);
      return res.status(500).json({ error: 'Failed to fetch video post' });
    }
  });
  
  // Get current user's video posts
  app.get('/api/my-videos', requireAuth, async (req, res) => {
    try {
      const videos = await storage.getUserVideoPosts(req.user.id);
      return res.status(200).json(videos);
    } catch (error) {
      console.error('Error fetching user video posts:', error);
      return res.status(500).json({ error: 'Failed to fetch user video posts' });
    }
  });
  
  // Update a video post (only by creator)
  app.patch('/api/videos/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Only allow the creator to update the video
      if (video.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this video' });
      }
      
      const updates = req.body;
      const updatedVideo = await storage.updateVideoPost(id, updates);
      
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error('Error updating video post:', error);
      return res.status(400).json({ error: 'Invalid update data' });
    }
  });
  
  // Delete a video post (only by creator)
  app.delete('/api/videos/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Only allow the creator to delete the video
      if (video.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this video' });
      }
      
      const result = await storage.deleteVideoPost(id);
      
      return res.status(200).json({ success: result });
    } catch (error) {
      console.error('Error deleting video post:', error);
      return res.status(500).json({ error: 'Failed to delete video post' });
    }
  });
  
  // Like a video post
  app.post('/api/videos/:id/like', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      const updatedVideo = await storage.incrementVideoPostLikes(id);
      
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error('Error liking video post:', error);
      return res.status(500).json({ error: 'Failed to like video post' });
    }
  });
  
  // Share a video post
  app.post('/api/videos/:id/share', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      const updatedVideo = await storage.incrementVideoPostShares(id);
      
      return res.status(200).json(updatedVideo);
    } catch (error) {
      console.error('Error sharing video post:', error);
      return res.status(500).json({ error: 'Failed to share video post' });
    }
  });
  
  // Like a video (with social attribution)
  app.post('/api/videos/:id/social-like', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      // Check if user has already liked the video
      const isLiked = await storage.isVideoLikedByUser(userId, videoId);
      
      if (isLiked) {
        const success = await storage.unlikeVideo(userId, videoId);
        return res.json({ liked: false, success });
      } else {
        const like = await storage.likeVideo(userId, videoId);
        return res.status(201).json({ liked: true, like });
      }
    } catch (error) {
      console.error('Error liking/unliking video:', error);
      return res.status(500).json({ error: 'Failed to process like/unlike' });
    }
  });
  
  // Check if a user has liked a video
  app.get('/api/videos/:id/like-status', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const isLiked = await storage.isVideoLikedByUser(userId, videoId);
      res.json({ liked: isLiked });
    } catch (error) {
      console.error('Error checking like status:', error);
      return res.status(500).json({ error: 'Failed to check like status' });
    }
  });
  
  // Get likes for a video
  app.get('/api/videos/:id/likes', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const likes = await storage.getVideoLikes(videoId);
      res.json(likes);
    } catch (error) {
      console.error('Error getting video likes:', error);
      return res.status(500).json({ error: 'Failed to get video likes' });
    }
  });
  
  // Comment on a video
  app.post('/api/videos/:id/comments', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      const commentData = req.body;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const comment = await storage.commentOnVideo(userId, videoId, commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error commenting on video:', error);
      return res.status(500).json({ error: 'Failed to comment on video' });
    }
  });
  
  // Get comments for a video
  app.get('/api/videos/:id/comments', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const comments = await storage.getVideoComments(videoId);
      res.json(comments);
    } catch (error) {
      console.error('Error getting video comments:', error);
      return res.status(500).json({ error: 'Failed to get video comments' });
    }
  });
  
  // Get replies to a comment
  app.get('/api/comments/:id/replies', async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      
      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }
      
      const replies = await storage.getCommentReplies(commentId);
      res.json(replies);
    } catch (error) {
      console.error('Error getting comment replies:', error);
      return res.status(500).json({ error: 'Failed to get comment replies' });
    }
  });
  
  // Edit a comment
  app.put('/api/comments/:id', requireAuth, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }
      
      if (!content) {
        return res.status(400).json({ error: 'Comment content is required' });
      }
      
      const updatedComment = await storage.editVideoComment(commentId, content);
      res.json(updatedComment);
    } catch (error) {
      console.error('Error editing comment:', error);
      return res.status(500).json({ error: 'Failed to edit comment' });
    }
  });
  
  // Delete a comment
  app.delete('/api/comments/:id', requireAuth, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      
      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }
      
      const success = await storage.deleteVideoComment(commentId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: 'Failed to delete comment' });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  });
  
  // Save/unsave a video
  app.post('/api/videos/:id/save', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      // Check if user has already saved the video
      const isSaved = await storage.isVideoSavedByUser(userId, videoId);
      
      if (isSaved) {
        const success = await storage.unsaveVideo(userId, videoId);
        return res.json({ saved: false, success });
      } else {
        const save = await storage.saveVideo(userId, videoId);
        return res.status(201).json({ saved: true, save });
      }
    } catch (error) {
      console.error('Error saving/unsaving video:', error);
      return res.status(500).json({ error: 'Failed to process save/unsave' });
    }
  });
  
  // Check if a user has saved a video
  app.get('/api/videos/:id/save-status', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const isSaved = await storage.isVideoSavedByUser(userId, videoId);
      res.json({ saved: isSaved });
    } catch (error) {
      console.error('Error checking save status:', error);
      return res.status(500).json({ error: 'Failed to check save status' });
    }
  });
  
  // Get saved videos for a user
  app.get('/api/user/saved-videos', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const savedVideos = await storage.getUserSavedVideos(userId);
      res.json(savedVideos);
    } catch (error) {
      console.error('Error getting saved videos:', error);
      return res.status(500).json({ error: 'Failed to get saved videos' });
    }
  });
  
  // Download a video
  app.post('/api/videos/:id/download', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user!.id : null;
      const ipAddress = req.ip;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const video = await storage.getVideoPost(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      if (userId) {
        await storage.downloadVideo(userId, videoId, ipAddress);
      } else {
        // For anonymous downloads, just increment the counter
        await storage.incrementVideoPostDownloads(videoId);
      }
      
      res.json({ success: true, videoUrl: video.videoUrl });
    } catch (error) {
      console.error('Error downloading video:', error);
      return res.status(500).json({ error: 'Failed to process download' });
    }
  });
  
  // User follow routes
  
  // Follow/unfollow a user
  app.post('/api/users/:id/follow', requireAuth, async (req, res) => {
    try {
      const followedId = parseInt(req.params.id);
      const followerId = req.user!.id;
      
      if (isNaN(followedId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Check if trying to follow self
      if (followerId === followedId) {
        return res.status(400).json({ error: 'You cannot follow yourself' });
      }
      
      // Check if already following
      const isFollowing = await storage.isUserFollowedByUser(followerId, followedId);
      
      if (isFollowing) {
        const success = await storage.unfollowUser(followerId, followedId);
        return res.json({ following: false, success });
      } else {
        const follow = await storage.followUser(followerId, followedId);
        return res.status(201).json({ following: true, follow });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      return res.status(500).json({ error: 'Failed to process follow/unfollow' });
    }
  });
  
  // Check if a user is following another user
  app.get('/api/users/:id/follow-status', requireAuth, async (req, res) => {
    try {
      const followedId = parseInt(req.params.id);
      const followerId = req.user!.id;
      
      if (isNaN(followedId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const isFollowing = await storage.isUserFollowedByUser(followerId, followedId);
      res.json({ following: isFollowing });
    } catch (error) {
      console.error('Error checking follow status:', error);
      return res.status(500).json({ error: 'Failed to check follow status' });
    }
  });
  
  // Get user's followers
  app.get('/api/users/:id/followers', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const followers = await storage.getUserFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error('Error getting user followers:', error);
      return res.status(500).json({ error: 'Failed to get user followers' });
    }
  });
  
  // Get users that a user is following
  app.get('/api/users/:id/following', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const following = await storage.getUserFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error('Error getting user following:', error);
      return res.status(500).json({ error: 'Failed to get user following' });
    }
  });
  
  // Video follow routes
  
  // Follow/unfollow a video
  app.post('/api/videos/:id/follow', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      // Check if already following
      const isFollowing = await storage.isVideoFollowedByUser(userId, videoId);
      
      if (isFollowing) {
        const success = await storage.unfollowVideo(userId, videoId);
        return res.json({ following: false, success });
      } else {
        const follow = await storage.followVideo(userId, videoId);
        return res.status(201).json({ following: true, follow });
      }
    } catch (error) {
      console.error('Error following/unfollowing video:', error);
      return res.status(500).json({ error: 'Failed to process follow/unfollow' });
    }
  });
  
  // Check if a user is following a video
  app.get('/api/videos/:id/follow-status', requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const isFollowing = await storage.isVideoFollowedByUser(userId, videoId);
      res.json({ following: isFollowing });
    } catch (error) {
      console.error('Error checking video follow status:', error);
      return res.status(500).json({ error: 'Failed to check video follow status' });
    }
  });
  
  // Get video followers
  app.get('/api/videos/:id/followers', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }
      
      const followers = await storage.getVideoFollowers(videoId);
      res.json(followers);
    } catch (error) {
      console.error('Error getting video followers:', error);
      return res.status(500).json({ error: 'Failed to get video followers' });
    }
  });
  
  // Get user profile analytics for premium users
  app.get('/api/user/profile-analytics', requireAuth, requirePremium, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's video stats
      const videoStats = await storage.updateUserVideoStats(userId);
      
      // Get follower count
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        followerCount: user.followerCount || 0,
        ...videoStats
      });
    } catch (error) {
      console.error('Error getting profile analytics:', error);
      return res.status(500).json({ error: 'Failed to get profile analytics' });
    }
  });

  // ====== EMOTIONAL IMPRINTS API ROUTES (PREMIUM FEATURE) ======

  // Create a new emotional imprint
  app.post('/api/emotional-imprints', requireAuth, requirePremium, async (req, res) => {
    try {
      const { name, description, emotion, colorCode, soundId, vibrationPattern, isPublic, isTemplate } = req.body;
      
      // Validate required fields
      if (!name || !emotion || !colorCode) {
        return res.status(400).json({ error: 'Missing required fields: name, emotion, and colorCode are required' });
      }
      
      // Create imprint data object
      const imprintData = {
        userId: req.user!.id,
        name,
        description: description || '',
        emotion,
        colorCode,
        soundId: soundId || null,
        vibrationPattern: vibrationPattern || null,
        isPublic: isPublic === true,
        isTemplate: isTemplate === true
      };
      
      // Create the emotional imprint
      const imprint = await storage.createEmotionalImprint(imprintData);
      
      // Return the created imprint
      res.status(201).json(imprint);
    } catch (error) {
      console.error('Error creating emotional imprint:', error);
      return res.status(500).json({ 
        error: 'Failed to create emotional imprint',
        message: error.message
      });
    }
  });
  
  // Get all emotional imprints created by the user
  app.get('/api/emotional-imprints', requireAuth, requirePremium, async (req, res) => {
    try {
      const imprints = await storage.getUserEmotionalImprints(req.user!.id);
      res.json(imprints);
    } catch (error) {
      console.error('Error getting emotional imprints:', error);
      return res.status(500).json({ error: 'Failed to get emotional imprints' });
    }
  });
  
  // Get a specific emotional imprint by id
  app.get('/api/emotional-imprints/:id', requireAuth, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: 'Invalid imprint ID' });
      }
      
      const imprint = await storage.getEmotionalImprint(imprintId);
      
      if (!imprint) {
        return res.status(404).json({ error: 'Emotional imprint not found' });
      }
      
      // Check if user has access to this imprint
      if (!imprint.isPublic && imprint.userId !== req.user!.id && !req.user!.isPremium) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'This emotional imprint is private or requires premium access' 
        });
      }
      
      res.json(imprint);
    } catch (error) {
      console.error('Error getting emotional imprint:', error);
      return res.status(500).json({ error: 'Failed to get emotional imprint' });
    }
  });
  
  // Update an emotional imprint
  app.put('/api/emotional-imprints/:id', requireAuth, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: 'Invalid imprint ID' });
      }
      
      // Get the imprint to check ownership
      const existingImprint = await storage.getEmotionalImprint(imprintId);
      
      if (!existingImprint) {
        return res.status(404).json({ error: 'Emotional imprint not found' });
      }
      
      // Verify ownership
      if (existingImprint.userId !== req.user!.id) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only update your own emotional imprints' 
        });
      }
      
      // Update the imprint
      const updatedImprint = await storage.updateEmotionalImprint(imprintId, req.body);
      
      res.json(updatedImprint);
    } catch (error) {
      console.error('Error updating emotional imprint:', error);
      return res.status(500).json({ 
        error: 'Failed to update emotional imprint',
        message: error.message
      });
    }
  });
  
  // Delete an emotional imprint
  app.delete('/api/emotional-imprints/:id', requireAuth, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: 'Invalid imprint ID' });
      }
      
      // Get the imprint to check ownership
      const existingImprint = await storage.getEmotionalImprint(imprintId);
      
      if (!existingImprint) {
        return res.status(404).json({ error: 'Emotional imprint not found' });
      }
      
      // Verify ownership
      if (existingImprint.userId !== req.user!.id) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only delete your own emotional imprints' 
        });
      }
      
      // Delete the imprint
      const result = await storage.deleteEmotionalImprint(imprintId);
      
      if (result) {
        res.json({ success: true, message: 'Emotional imprint deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete emotional imprint' });
      }
    } catch (error) {
      console.error('Error deleting emotional imprint:', error);
      return res.status(500).json({ error: 'Failed to delete emotional imprint' });
    }
  });
  
  // Get all public emotional imprints
  app.get('/api/emotional-imprints-public', requireAuth, async (req, res) => {
    try {
      const imprints = await storage.getPublicEmotionalImprints();
      res.json(imprints);
    } catch (error) {
      console.error('Error getting public emotional imprints:', error);
      return res.status(500).json({ error: 'Failed to get public emotional imprints' });
    }
  });
  
  // Get all emotional imprint templates
  app.get('/api/emotional-imprints-templates', requireAuth, requirePremium, async (req, res) => {
    try {
      const templates = await storage.getEmotionalImprintTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error getting emotional imprint templates:', error);
      return res.status(500).json({ error: 'Failed to get emotional imprint templates' });
    }
  });
  
  // Send an emotional imprint to another user
  app.post('/api/emotional-imprints/:id/share', requireAuth, requirePremium, async (req, res) => {
    try {
      const imprintId = parseInt(req.params.id);
      if (isNaN(imprintId)) {
        return res.status(400).json({ error: 'Invalid imprint ID' });
      }
      
      const { receiverId, message, isAnonymous } = req.body;
      
      if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID is required' });
      }
      
      // Verify the imprint exists
      const imprint = await storage.getEmotionalImprint(imprintId);
      if (!imprint) {
        return res.status(404).json({ error: 'Emotional imprint not found' });
      }
      
      // Create the interaction
      const interaction = await storage.createEmotionalImprintInteraction({
        imprintId,
        senderId: req.user!.id,
        receiverId,
        message: message || '',
        isAnonymous: isAnonymous === true,
        status: 'sent'
      });
      
      res.status(201).json(interaction);
    } catch (error) {
      console.error('Error sharing emotional imprint:', error);
      return res.status(500).json({ 
        error: 'Failed to share emotional imprint',
        message: error.message 
      });
    }
  });
  
  // Get received emotional imprints
  app.get('/api/emotional-imprints-received', requireAuth, async (req, res) => {
    try {
      const receivedImprints = await storage.getReceivedEmotionalImprints(req.user!.id);
      res.json(receivedImprints);
    } catch (error) {
      console.error('Error getting received emotional imprints:', error);
      return res.status(500).json({ error: 'Failed to get received emotional imprints' });
    }
  });

  // ====== SECURITY ROUTES ======
  
  // Import security routes dynamically
  try {
    import('./routes/security-routes').then(module => {
      const securityRoutes = module.default;
      app.use('/api/security', securityRoutes);
      
      // Log the security routes registration
      console.log('Security and privacy protection routes registered successfully');
    }).catch(error => {
      console.error('Error loading security routes:', error);
    });
  } catch (error) {
    console.error('Error loading security routes:', error);
  }
  
  // Existing 2FA routes will be deprecated in favor of the new security service
  // Once the security routes are fully implemented and tested, these endpoints will be removed
  
  // Setup 2FA
  app.post('/api/auth/2fa/setup', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is already enabled for this account' });
      }
      
      // Generate a new 2FA setup for the user
      const twoFactorSetup = await generateTwoFactorSetup(user.username);
      
      // Store the secret in the database - it's encrypted until the user confirms
      await storage.updateUser(userId, {
        twoFactorSecret: twoFactorSetup.secret.base32,
        twoFactorBackupCodes: JSON.stringify(twoFactorSetup.backupCodes),
        twoFactorRecoveryKey: twoFactorSetup.recoveryKey,
        // Don't enable 2FA until the user verifies a token
        twoFactorEnabled: false,
        twoFactorVerified: false
      });
      
      // Send back the setup info
      res.json({
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        secret: twoFactorSetup.secret.base32,
        backupCodes: twoFactorSetup.backupCodes,
        recoveryKey: twoFactorSetup.recoveryKey
      });
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      return res.status(500).json({ error: 'Failed to set up 2FA' });
    }
  });
  
  // Verify and enable 2FA
  app.post('/api/auth/2fa/verify', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is already enabled for this account' });
      }
      
      // Validate token through zod
      const tokenSchema = z.object({
        token: z.string().min(6).max(6)
      });
      
      const { token } = tokenSchema.parse(req.body);
      
      // Verify the token
      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: '2FA setup not initiated. Please set up 2FA first.' });
      }
      
      const isValid = verifyToken(token, user.twoFactorSecret);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Enable 2FA for the user
      await storage.updateUser(userId, {
        twoFactorEnabled: true,
        twoFactorVerified: true
      });
      
      // Send back success message
      res.json({
        success: true,
        message: 'Two-factor authentication has been enabled for your account',
        backupCodes: JSON.parse(user.twoFactorBackupCodes || '[]')
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return res.status(500).json({ error: 'Failed to verify 2FA' });
    }
  });
  
  // Disable 2FA
  app.post('/api/auth/2fa/disable', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is not enabled for this account' });
      }
      
      // Validate token or password
      const schema = z.object({
        token: z.string().min(6).max(6).optional(),
        password: z.string().optional()
      });
      
      const { token, password } = schema.parse(req.body);
      
      let isValid = false;
      
      if (token && user.twoFactorSecret) {
        // Verify with token
        isValid = verifyToken(token, user.twoFactorSecret);
      } else if (password) {
        // Verify with password
        // Note: You should implement password verification here
        // using your existing authentication functions
        // For example:
        // isValid = await comparePasswords(password, user.password);
      }
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification' });
      }
      
      // Disable 2FA for the user
      await storage.updateUser(userId, {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorRecoveryKey: null
      });
      
      // Send back success message
      res.json({
        success: true,
        message: 'Two-factor authentication has been disabled for your account'
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return res.status(500).json({ error: 'Failed to disable 2FA' });
    }
  });
  
  // Verify 2FA during login
  app.post('/api/auth/2fa/validate', async (req, res) => {
    try {
      // Validate input
      const schema = z.object({
        username: z.string(),
        token: z.string().min(6).max(6).optional(),
        backupCode: z.string().optional(),
        recoveryKey: z.string().optional()
      });
      
      const { username, token, backupCode, recoveryKey } = schema.parse(req.body);
      
      // Get the user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is not enabled for this account' });
      }
      
      let isValid = false;
      
      // Check the token if provided
      if (token && user.twoFactorSecret) {
        isValid = verifyToken(token, user.twoFactorSecret);
      }
      
      // Check backup code if provided
      else if (backupCode && user.twoFactorBackupCodes) {
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        const result = verifyBackupCode(backupCode, backupCodes);
        
        if (result.valid) {
          isValid = true;
          
          // Update the backup codes (removing the used one)
          await storage.updateUser(user.id, {
            twoFactorBackupCodes: JSON.stringify(result.remainingCodes)
          });
        }
      }
      
      // Check recovery key if provided
      else if (recoveryKey && user.twoFactorRecoveryKey) {
        isValid = verifyRecoveryKey(recoveryKey, user.twoFactorRecoveryKey);
        
        // For additional security, you might want to generate a new recovery key
        // when the current one is used and notify the user
        if (isValid) {
          const newRecoveryKey = generateRecoveryKey();
          await storage.updateUser(user.id, {
            twoFactorRecoveryKey: newRecoveryKey
          });
          
          // Here you would typically send an email to notify the user
          // that their recovery key was used and a new one was generated
        }
      }
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification' });
      }
      
      // Grant access by signing the user in
      // This would typically involve creating a new session
      req.login(user, (err) => {
        if (err) {
          console.error('Error logging in after 2FA:', err);
          return res.status(500).json({ error: 'Failed to log in after 2FA verification' });
        }
        
        res.json({
          success: true,
          message: '2FA verification successful'
        });
      });
    } catch (error) {
      console.error('Error validating 2FA:', error);
      return res.status(500).json({ error: 'Failed to validate 2FA' });
    }
  });
  
  // Get new backup codes (requires 2FA verification)
  app.post('/api/auth/2fa/new-backup-codes', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is not enabled for this account' });
      }
      
      // Validate token
      const schema = z.object({
        token: z.string().min(6).max(6)
      });
      
      const { token } = schema.parse(req.body);
      
      if (!user.twoFactorSecret || !verifyToken(token, user.twoFactorSecret)) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Generate new backup codes
      const newBackupCodes = generateBackupCodes(10);
      
      // Update in database
      await storage.updateUser(userId, {
        twoFactorBackupCodes: JSON.stringify(newBackupCodes)
      });
      
      // Return the new codes
      res.json({
        success: true,
        backupCodes: newBackupCodes
      });
    } catch (error) {
      console.error('Error generating new backup codes:', error);
      return res.status(500).json({ error: 'Failed to generate new backup codes' });
    }
  });

  // Get new recovery key (requires 2FA verification)
  app.post('/api/auth/2fa/new-recovery-key', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA is not enabled for this account' });
      }
      
      // Validate token
      const schema = z.object({
        token: z.string().min(6).max(6)
      });
      
      const { token } = schema.parse(req.body);
      
      if (!user.twoFactorSecret || !verifyToken(token, user.twoFactorSecret)) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Generate new recovery key
      const newRecoveryKey = generateRecoveryKey();
      
      // Update in database
      await storage.updateUser(userId, {
        twoFactorRecoveryKey: newRecoveryKey
      });
      
      // Return the new recovery key
      res.json({
        success: true,
        recoveryKey: newRecoveryKey
      });
    } catch (error) {
      console.error('Error generating new recovery key:', error);
      return res.status(500).json({ error: 'Failed to generate new recovery key' });
    }
  });

  // Get 2FA status
  app.get('/api/auth/2fa/status', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        enabled: user.twoFactorEnabled,
        verified: user.twoFactorVerified
      });
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      return res.status(500).json({ error: 'Failed to get 2FA status' });
    }
  });
  
  // Advertisement API endpoints
  
  // Get all advertisements by a user (only available to the user or admins)
  app.get('/api/advertisements/user/:userId', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is requesting their own advertisements or is an admin
      if (req.user?.id !== userId && !req.adminUser) {
        return res.status(403).json({ error: 'Unauthorized access to user advertisements' });
      }
      
      const advertisements = await storage.getUserAdvertisements(userId);
      res.json(advertisements);
    } catch (error) {
      console.error('Error fetching user advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });
  
  // Get all published advertisements
  app.get('/api/advertisements/published', async (req, res) => {
    try {
      const advertisements = await storage.getAllPublishedAdvertisements();
      res.json(advertisements);
    } catch (error) {
      console.error('Error fetching published advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });
  
  // Get advertisements by type
  app.get('/api/advertisements/type/:type', async (req, res) => {
    try {
      const { type } = req.params;
      
      const typeSchema = z.enum(['health_service', 'wellness_program', 'mental_health', 'nutrition', 'fitness', 'other']);
      const validatedType = typeSchema.parse(type);
      
      const advertisements = await storage.getAdvertisementsByType(validatedType);
      res.json(advertisements);
    } catch (error) {
      console.error('Error fetching advertisements by type:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid advertisement type' });
      }
      
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });
  
  // Get a single advertisement by id
  app.get('/api/advertisements/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const advertisement = await storage.getAdvertisementById(id);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      // Only return non-published advertisements to the owner or admins
      if (advertisement.status !== 'published' && 
          (!req.isAuthenticated() || (req.user?.id !== advertisement.userId && !req.adminUser))) {
        return res.status(403).json({ error: 'Unauthorized access to advertisement' });
      }
      
      // Track view if advertisement is published
      if (advertisement.status === 'published') {
        await storage.incrementAdvertisementViewCount(id);
      }
      
      res.json(advertisement);
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      res.status(500).json({ error: 'Failed to fetch advertisement' });
    }
  });
  
  // Create a new advertisement (premium users only)
  app.post('/api/advertisements', requireAuth, requirePremium, async (req, res) => {
    try {
      const adSchema = z.object({
        title: z.string().min(5).max(100),
        description: z.string().min(20).max(1000),
        type: z.enum(['health_service', 'wellness_program', 'mental_health', 'nutrition', 'fitness', 'other']),
        imageUrl: z.string().url().optional(),
        websiteUrl: z.string().url().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        locationDetails: z.string().optional(),
        budget: z.string().optional(),
        additionalNotes: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      });
      
      const adData = adSchema.parse(req.body);
      
      const advertisement = await storage.createAdvertisement(req.user.id, adData);
      res.status(201).json(advertisement);
    } catch (error) {
      console.error('Error creating advertisement:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid advertisement data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to create advertisement' });
    }
  });
  
  // Update an advertisement (owner only)
  app.patch('/api/advertisements/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify advertisement exists
      const advertisement = await storage.getAdvertisementById(id);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      // Verify user owns the advertisement or is an admin
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: 'Unauthorized to update this advertisement' });
      }
      
      const updateSchema = z.object({
        title: z.string().min(5).max(100).optional(),
        description: z.string().min(20).max(1000).optional(),
        type: z.enum(['health_service', 'wellness_program', 'mental_health', 'nutrition', 'fitness', 'other']).optional(),
        imageUrl: z.string().url().optional().nullable(),
        websiteUrl: z.string().url().optional().nullable(),
        contactEmail: z.string().email().optional().nullable(),
        contactPhone: z.string().optional().nullable(),
        locationDetails: z.string().optional().nullable(),
        budget: z.string().optional().nullable(),
        additionalNotes: z.string().optional().nullable(),
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable()
      });
      
      const updateData = updateSchema.parse(req.body);
      
      const updatedAdvertisement = await storage.updateAdvertisement(id, updateData);
      res.json(updatedAdvertisement);
    } catch (error) {
      console.error('Error updating advertisement:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid advertisement data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to update advertisement' });
    }
  });
  
  // Delete an advertisement (owner or admin only)
  app.delete('/api/advertisements/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify advertisement exists
      const advertisement = await storage.getAdvertisementById(id);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      // Verify user owns the advertisement or is an admin
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: 'Unauthorized to delete this advertisement' });
      }
      
      const success = await storage.deleteAdvertisement(id);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete advertisement' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      res.status(500).json({ error: 'Failed to delete advertisement' });
    }
  });
  
  // Process payment for an advertisement (owner only)
  app.post('/api/advertisements/:id/payment', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify advertisement exists
      const advertisement = await storage.getAdvertisementById(id);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      // Verify user owns the advertisement
      if (req.user.id !== advertisement.userId) {
        return res.status(403).json({ error: 'Unauthorized to process payment for this advertisement' });
      }
      
      const paymentSchema = z.object({
        provider: z.enum(['stripe', 'paypal']),
        transactionId: z.string()
      });
      
      const paymentData = paymentSchema.parse(req.body);
      
      const updatedAdvertisement = await storage.createAdvertisementPayment(
        id, 
        paymentData.provider, 
        paymentData.transactionId
      );
      
      res.json(updatedAdvertisement);
    } catch (error) {
      console.error('Error processing advertisement payment:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid payment data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to process advertisement payment' });
    }
  });
  
  // Advertisement booking API endpoints
  
  // Create a booking request for an advertisement
  app.post('/api/advertisements/:id/bookings', requireAuth, async (req, res) => {
    try {
      const advertisementId = parseInt(req.params.id);
      
      // Verify advertisement exists and is published
      const advertisement = await storage.getAdvertisementById(advertisementId);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      if (advertisement.status !== 'published') {
        return res.status(400).json({ error: 'Advertisement is not available for booking' });
      }
      
      const bookingSchema = z.object({
        notes: z.string().optional(),
        contactDetails: z.string(),
        locationDetails: z.string().optional(),
        requestedStartDate: z.string().optional(),
        requestedEndDate: z.string().optional()
      });
      
      const bookingData = bookingSchema.parse(req.body);
      
      const booking = await storage.createAdvertisementBooking({
        advertisementId,
        userId: req.user.id,
        status: 'pending',
        ...bookingData
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid booking data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });
  
  // Get all bookings for an advertisement (owner only)
  app.get('/api/advertisements/:id/bookings', requireAuth, async (req, res) => {
    try {
      const advertisementId = parseInt(req.params.id);
      
      // Verify advertisement exists
      const advertisement = await storage.getAdvertisementById(advertisementId);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      
      // Verify user owns the advertisement or is an admin
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: 'Unauthorized to view bookings for this advertisement' });
      }
      
      const bookings = await storage.getAdvertisementBookings(advertisementId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });
  
  // Get a user's bookings
  app.get('/api/user/bookings', requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });
  
  // Update a booking status (advertisement owner only)
  app.patch('/api/bookings/:id/status', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify booking exists
      const booking = await storage.getAdvertisementBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      // Get advertisement to check ownership
      const advertisement = await storage.getAdvertisementById(booking.advertisementId);
      
      if (!advertisement) {
        return res.status(404).json({ error: 'Associated advertisement not found' });
      }
      
      // Verify user owns the advertisement or is an admin
      if (req.user.id !== advertisement.userId && !req.adminUser) {
        return res.status(403).json({ error: 'Unauthorized to update this booking' });
      }
      
      const statusSchema = z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'completed', 'canceled'])
      });
      
      const { status } = statusSchema.parse(req.body);
      
      const updatedBooking = await storage.updateAdvertisementBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid status', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  });

  // User verification routes - now available to all users
  app.post('/api/user/verification', requireAuth, async (req, res) => {
    try {
      const { 
        firstName, lastName, middleName, dateOfBirth, 
        address, city, state, country, postalCode,
        idType1, idNumber1, idType2, idNumber2, paymentPlan 
      } = req.body;

      // Create first document
      await storage.createVerificationDocument({
        userId: req.user.id,
        documentType: idType1,
        documentNumber: idNumber1,
        verificationStatus: "pending",
        submittedAt: new Date(),
      });

      // Create second document
      await storage.createVerificationDocument({
        userId: req.user.id,
        documentType: idType2,
        documentNumber: idNumber2,
        verificationStatus: "pending",
        submittedAt: new Date(),
      });

      // Update user verification status
      await storage.updateUser(req.user.id, {
        firstName,
        lastName,
        middleName: middleName || null,
        state,
        country,
        verificationStatus: "pending",
        verificationPaymentPlan: paymentPlan,
      });

      res.status(201).json({ success: true, message: "Verification submitted successfully" });
    } catch (error) {
      console.error('Error submitting verification:', error);
      res.status(500).json({ error: 'Failed to submit verification' });
    }
  });

  // Process verification payment - now available to all users
  app.post('/api/user/verification/payment', requireAuth, async (req, res) => {
    try {
      const { plan, amount } = req.body;
      
      // Calculate expiration date - 1 month or 1 year from now
      const now = new Date();
      const expiresAt = new Date(now);
      if (plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // Update user's verification payment info
      await storage.updateUser(req.user.id, {
        verificationPaymentPlan: plan,
        verificationExpiresAt: expiresAt,
      });

      // In a real implementation, you would process the payment here

      res.json({ 
        success: true, 
        message: "Payment processed successfully",
        plan: plan,
        expiresAt: expiresAt
      });
    } catch (error) {
      console.error('Error processing verification payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  });

  // Get user verification status
  app.get('/api/user/verification/status', requireAuth, async (req, res) => {
    try {
      const documents = await storage.getVerificationDocumentsByUser(req.user.id);
      
      res.json({
        status: req.user.verificationStatus,
        verifiedAt: req.user.verifiedAt,
        expiresAt: req.user.verificationExpiresAt,
        paymentPlan: req.user.verificationPaymentPlan,
        documents: documents
      });
    } catch (error) {
      console.error('Error getting verification status:', error);
      res.status(500).json({ error: 'Failed to get verification status' });
    }
  });
  
  // Submit verification document(s) - now available to all users
  app.post('/api/user/verification/documents', requireAuth, async (req, res) => {
    try {
      const { 
        documentType, 
        documentNumber, 
        documentUrl, 
        expirationDate,
        issuedBy,
        issuedDate 
      } = req.body;
      
      // Validate required fields
      if (!documentType || !documentNumber) {
        return res.status(400).json({ error: "Document type and number are required" });
      }
      
      // Create verification document
      const document = await storage.createVerificationDocument({
        userId: req.user.id,
        documentType,
        documentNumber,
        documentUrl: documentUrl || undefined,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        issuedBy: issuedBy || undefined,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        verificationStatus: "pending",
        submittedAt: new Date(),
      });
      
      // Return created document
      res.status(201).json(document);
    } catch (error) {
      console.error("Verification submission error:", error);
      res.status(500).json({ error: "Failed to submit verification document" });
    }
  });
  
  // Admin route for updating document verification status
  app.put('/api/admin/verification/documents/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (!status || !["pending", "verified", "not_verified"].includes(status)) {
        return res.status(400).json({ error: "Valid status is required" });
      }
      
      const document = await storage.updateVerificationDocumentStatus(
        documentId,
        status as "pending" | "verified" | "not_verified",
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

  // System testing and backup API routes
  app.post('/api/system/test', requireAuth, testController.runTests);
  app.post('/api/system/backup', requireAuth, testController.createBackup);
  app.get('/api/system/backups', requireAuth, testController.getBackups);
  app.post('/api/system/restore/:backupId', requireAuth, testController.restoreBackup);
  
  // User session management
  app.post('/api/sessions', requireAuth, async (req, res) => {
    try {
      // Validate request body
      const sessionSchema = z.object({
        device: z.string().optional(),
        browser: z.string().optional(),
        ipAddress: z.string().optional(),
        location: z.string().optional()
      });
      
      const validated = sessionSchema.parse(req.body);
      
      // Create a unique session token
      const sessionToken = crypto.randomUUID();
      
      // Create the session
      const session = await storage.createUserSession({
        userId: req.user!.id,
        sessionToken,
        device: validated.device || 'Unknown',
        browser: validated.browser || 'Unknown',
        ipAddress: validated.ipAddress || req.ip || 'Unknown',
        location: validated.location,
        status: 'online',
        loginAt: new Date()
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(400).json({ error: 'Invalid session data' });
    }
  });
  
  app.get('/api/sessions', requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserActiveSessions(req.user!.id);
      res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });
  
  app.put('/api/sessions/:token/status', requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      
      // Validate request body
      const statusSchema = z.object({
        status: z.enum(['online', 'offline', 'away', 'busy'])
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Get the session
      const session = await storage.getUserSession(token);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Ensure user can only modify their own sessions
      if (session.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to modify this session' });
      }
      
      // Update session status
      const updatedSession = await storage.updateUserSessionStatus(token, status);
      
      res.status(200).json(updatedSession);
    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(400).json({ error: 'Invalid status update data' });
    }
  });
  
  app.delete('/api/sessions/:token', requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      
      // Get the session
      const session = await storage.getUserSession(token);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Ensure user can only delete their own sessions
      if (session.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to delete this session' });
      }
      
      // Close the session
      await storage.closeUserSession(token);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error closing session:', error);
      res.status(500).json({ error: 'Failed to close session' });
    }
  });
  
  // Track user activity (heartbeat)
  app.put('/api/sessions/:token/activity', requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      
      // Get the session
      const session = await storage.getUserSession(token);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Ensure user can only update their own sessions
      if (session.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to update this session' });
      }
      
      // Update session activity timestamp
      const updatedSession = await storage.updateUserSessionActivity(token);
      
      res.status(200).json(updatedSession);
    } catch (error) {
      console.error('Error updating session activity:', error);
      res.status(500).json({ error: 'Failed to update session activity' });
    }
  });
  
  app.get('/api/users/active', requireAuth, async (req, res) => {
    try {
      const activeUsers = await storage.getActiveUsers();
      
      // Don't expose sensitive information
      const sanitizedUsers = activeUsers.map(user => ({
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        status: user.status,
        lastActiveAt: user.lastActiveAt
      }));
      
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json({ error: 'Failed to fetch active users' });
    }
  });
  
  // Mood-based matching API endpoints
  app.get('/api/mood-matches', requireAuth, async (req, res) => {
    try {
      // Get the user's current emotion
      const userEmotion = await storage.getUserEmotion(req.user!.id) || 'neutral';
      
      // Find mood matches
      const matches = await storage.findMoodMatches(req.user!.id, userEmotion);
      
      // Return sanitized matches (don't expose sensitive data)
      const sanitizedMatches = matches.map(match => ({
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
      console.error('Error finding mood matches:', error);
      res.status(500).json({ error: 'Failed to find mood matches' });
    }
  });
  
  app.post('/api/mood-matches/:matchId/accept', requireAuth, async (req, res) => {
    try {
      const { matchId } = req.params;
      
      // Get the match first to verify ownership
      const match = await storage.getMoodMatch(Number(matchId));
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // Ensure user can only accept their own matches
      if (match.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to accept this match' });
      }
      
      // Accept the match using our new method
      const updatedMatch = await storage.acceptMoodMatch(Number(matchId));
      
      res.status(200).json(updatedMatch);
    } catch (error) {
      console.error('Error accepting mood match:', error);
      res.status(500).json({ error: 'Failed to accept mood match' });
    }
  });
  
  app.post('/api/mood-matches/:matchId/reject', requireAuth, async (req, res) => {
    try {
      const { matchId } = req.params;
      
      // Get the match first to verify ownership
      const match = await storage.getMoodMatch(Number(matchId));
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // Ensure user can only reject their own matches
      if (match.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to reject this match' });
      }
      
      // Reject the match using our new method
      const updatedMatch = await storage.rejectMoodMatch(Number(matchId));
      
      res.status(200).json(updatedMatch);
    } catch (error) {
      console.error('Error rejecting mood match:', error);
      res.status(500).json({ error: 'Failed to reject mood match' });
    }
  });

  // ====== NOTIFICATION API ROUTES ======
  // Get user's notifications
  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      return res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Get unread notifications count
  app.get('/api/notifications/unread-count', requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Mark notification as read
  app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      const notification = await storage.markNotificationAsRead(notificationId);
      return res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Mark all notifications as read
  app.post('/api/notifications/read-all', requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Delete notification
  app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      const result = await storage.deleteNotification(notificationId);
      if (result) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Expose the initialization function to the HTTP server
  // @ts-ignore - Adding dynamic property
  httpServer.initializeWebSocketServer = initializeWebSocketServer;
  
  return httpServer;
};
