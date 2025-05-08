/**
 * MoodLync Admin API Routes
 * These routes expose the admin service functionality via REST endpoints
 */

import express, { Request, Response, NextFunction, Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { adminService } from '../services/admin-service';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { adminUsers, AdminRole } from '@shared/schema';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'admin-jwt-secret-key';
const JWT_EXPIRY = '15m'; // 15 minutes token expiry

// Types
interface AdminJwtPayload {
  id: number;
  username: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

// Middleware
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute'
});

/**
 * Admin authentication middleware
 */
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    req.adminUser = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based access control middleware
 */
function requireRole(roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Register admin routes
 */
export function registerAdminRoutes(app: express.Express) {
  const router = Router();

  /**
   * Apply rate limiting and authentication to all admin routes
   */
  router.use(adminLimiter);
  
  /**
   * POST /admin/login - Admin login
   */
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      // Get admin user by username
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username));
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // In a real implementation, password would be hashed and compared
      // This is simplified for the example
      if (admin.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if admin account is active
      if (!admin.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username,
          role: admin.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      
      // Update last login time
      await db
        .update(adminUsers)
        .set({ lastLogin: new Date() })
        .where(eq(adminUsers.id, admin.id));
      
      // Log admin action
      await adminService.logAdminAction({
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        entityType: 'ADMIN_USER',
        entityId: admin.id,
        details: JSON.stringify({ 
          timestamp: new Date(),
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
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * All routes below this line require admin authentication
   */
  router.use(authenticateAdmin);
  
  /**
   * GET /admin/me - Get current admin user details
   */
  router.get('/me', async (req: Request, res: Response) => {
    try {
      const adminId = req.adminUser!.id;
      
      // Get admin user details
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, adminId));
      
      if (!admin) {
        return res.status(404).json({ error: 'Admin user not found' });
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
      console.error('Get admin error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== USER MANAGEMENT ROUTES ==========
   */
  
  /**
   * GET /admin/users - Get paginated list of users with filtering options
   */
  router.get('/users', async (req: Request, res: Response) => {
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
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * GET /admin/users/:userId - Get detailed user information
   */
  router.get('/users/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.getUserDetails(userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Get user details error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * PATCH /admin/users/:userId - Update user information
   */
  router.patch('/users/:userId', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.updateUser(userId, req.body, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/users/:userId/impersonate - Impersonate a user
   */
  router.post('/users/:userId/impersonate', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.impersonateUser(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Impersonate user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/users/:userId/reset-password - Reset user password
   */
  router.post('/users/:userId/reset-password', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.resetUserPassword(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/users/:userId/reset-mfa - Reset user MFA settings
   */
  router.post('/users/:userId/reset-mfa', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.resetUserMFA(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Reset MFA error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/users/:userId/ban - Ban a user
   */
  router.post('/users/:userId/ban', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      const { reason, duration } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }
      
      if (duration === undefined) {
        return res.status(400).json({ error: 'Duration is required' });
      }
      
      const result = await adminService.banUser(userId, reason, duration, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Ban user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/users/:userId/shadow-ban - Shadow ban a user
   */
  router.post('/users/:userId/shadow-ban', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      const { reason, duration } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }
      
      if (duration === undefined) {
        return res.status(400).json({ error: 'Duration is required' });
      }
      
      const result = await adminService.shadowBanUser(userId, reason, duration, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Shadow ban user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== CONTENT MODERATION ROUTES ==========
   */
  
  /**
   * GET /admin/moderation/flagged - Get paginated list of flagged content
   */
  router.get('/moderation/flagged', async (req: Request, res: Response) => {
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
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        contentType: contentType as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get flagged content error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/moderation/flagged/:flagId/moderate - Moderate flagged content
   */
  router.post('/moderation/flagged/:flagId/moderate', requireRole(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    try {
      const flagId = Number(req.params.flagId);
      const adminId = req.adminUser!.id;
      const { decision, adminNotes } = req.body;
      
      if (isNaN(flagId)) {
        return res.status(400).json({ error: 'Invalid flag ID' });
      }
      
      if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
        return res.status(400).json({ error: 'Valid decision (APPROVE or REJECT) is required' });
      }
      
      const result = await adminService.moderateFlaggedContent(
        flagId, 
        decision, 
        adminId,
        adminNotes
      );
      
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Flagged content not found') {
        return res.status(404).json({ error: 'Flagged content not found' });
      }
      
      console.error('Moderate flagged content error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * GET /admin/moderation/nfts - Get NFTs for moderation
   */
  router.get('/moderation/nfts', async (req: Request, res: Response) => {
    try {
      const { 
        page, 
        limit, 
        status, 
        sortBy, 
        sortOrder 
      } = req.query;
      
      const result = await adminService.getNFTsForModeration({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get NFTs for moderation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/moderation/nfts/:nftId/moderate - Moderate an NFT
   */
  router.post('/moderation/nfts/:nftId/moderate', requireRole(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    try {
      const nftId = Number(req.params.nftId);
      const adminId = req.adminUser!.id;
      const { decision, adminNotes } = req.body;
      
      if (isNaN(nftId)) {
        return res.status(400).json({ error: 'Invalid NFT ID' });
      }
      
      if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
        return res.status(400).json({ error: 'Valid decision (APPROVED or REJECTED) is required' });
      }
      
      const result = await adminService.moderateNFT(
        nftId, 
        decision, 
        adminId,
        adminNotes
      );
      
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'NFT not found') {
        return res.status(404).json({ error: 'NFT not found' });
      }
      
      console.error('Moderate NFT error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/moderation/nfts/:nftId/freeze - Freeze a fraudulent NFT
   */
  router.post('/moderation/nfts/:nftId/freeze', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const nftId = Number(req.params.nftId);
      const adminId = req.adminUser!.id;
      const { reason } = req.body;
      
      if (isNaN(nftId)) {
        return res.status(400).json({ error: 'Invalid NFT ID' });
      }
      
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }
      
      const result = await adminService.freezeNFT(nftId, reason, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'NFT not found') {
        return res.status(404).json({ error: 'NFT not found' });
      }
      
      console.error('Freeze NFT error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== ANALYTICS & DATA ROUTES ==========
   */
  
  /**
   * GET /admin/analytics/platform - Get platform analytics
   */
  router.get('/analytics/platform', async (req: Request, res: Response) => {
    try {
      const { timeframe } = req.query;
      
      if (timeframe && !['day', 'week', 'month', 'year'].includes(timeframe as string)) {
        return res.status(400).json({ error: 'Invalid timeframe' });
      }
      
      const result = await adminService.getPlatformAnalytics(timeframe as 'day' | 'week' | 'month' | 'year');
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get platform analytics error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * GET /admin/data/export/:userId - Export user data for GDPR/CCPA compliance
   */
  router.get('/data/export/:userId', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const adminId = req.adminUser!.id;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const result = await adminService.exportUserData(userId, adminId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.error('Export user data error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== TOKEN & NFT ECONOMY ROUTES ==========
   */
  
  /**
   * GET /admin/economy/token-pool-stats - Get token pool statistics
   */
  router.get('/economy/token-pool-stats', async (req: Request, res: Response) => {
    try {
      const result = await adminService.getTokenPoolStats();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get token pool stats error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * PATCH /admin/economy/token-rates - Update token minting rates
   */
  router.patch('/economy/token-rates', requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
      const { rates } = req.body;
      const adminId = req.adminUser!.id;
      
      if (!rates || !Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({ error: 'Valid rates array is required' });
      }
      
      const result = await adminService.updateTokenRates(rates, adminId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Update token rates error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/economy/token-pool-split - Initiate token pool split
   */
  router.post('/economy/token-pool-split', requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
      const { 
        poolSize, 
        contributorCount, 
        donationPercentage 
      } = req.body;
      
      const adminId = req.adminUser!.id;
      
      if (!poolSize || poolSize <= 0) {
        return res.status(400).json({ error: 'Valid pool size is required' });
      }
      
      if (!contributorCount || contributorCount <= 0) {
        return res.status(400).json({ error: 'Valid contributor count is required' });
      }
      
      if (donationPercentage === undefined || donationPercentage < 0 || donationPercentage > 100) {
        return res.status(400).json({ error: 'Valid donation percentage (0-100) is required' });
      }
      
      const result = await adminService.initiateTokenPoolSplit(
        poolSize, 
        contributorCount, 
        donationPercentage,
        adminId
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Initiate token pool split error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== SYSTEM OPERATIONS ROUTES ==========
   */
  
  /**
   * GET /admin/system/health - Get system health metrics
   */
  router.get('/system/health', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const result = await adminService.getSystemHealth();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get system health error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/system/backup - Initiate system backup
   */
  router.post('/system/backup', requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
      const adminId = req.adminUser!.id;
      const result = await adminService.initiateBackup(adminId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Initiate backup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== AUDIT & COMPLIANCE ROUTES ==========
   */
  
  /**
   * GET /admin/audit-logs - Get audit logs with filtering options
   */
  router.get('/audit-logs', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
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
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        adminId: adminId ? Number(adminId) : undefined,
        action: action as string,
        entityType: entityType as string,
        entityId: entityId ? Number(entityId) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get audit logs error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * GET /admin/audit-logs/export - Export audit logs for regulatory compliance
   */
  router.get('/audit-logs/export', requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, format } = req.query;
      const adminId = req.adminUser!.id;
      
      if (!startDate) {
        return res.status(400).json({ error: 'Start date is required' });
      }
      
      if (!endDate) {
        return res.status(400).json({ error: 'End date is required' });
      }
      
      if (format && !['json', 'csv'].includes(format as string)) {
        return res.status(400).json({ error: 'Format must be either "json" or "csv"' });
      }
      
      const result = await adminService.exportAuditLogs(
        new Date(startDate as string),
        new Date(endDate as string),
        format as 'json' | 'csv',
        adminId
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Export audit logs error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * ========== SEO MANAGEMENT ROUTES ==========
   */
  
  /**
   * GET /admin/seo - Get all SEO configurations
   */
  router.get('/seo', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const result = await adminService.getSeoConfigurations();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get SEO configurations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * GET /admin/seo/:pageKey - Get SEO configuration for a specific page
   */
  router.get('/seo/:pageKey', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const pageKey = req.params.pageKey;
      const result = await adminService.getSeoConfigurationByKey(pageKey);
      
      if (!result) {
        return res.status(404).json({ error: 'SEO configuration not found' });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get SEO configuration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * PUT /admin/seo/:pageKey - Update SEO configuration for a specific page
   */
  router.put('/seo/:pageKey', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const pageKey = req.params.pageKey;
      const adminId = req.adminUser!.id;
      const seoConfig = req.body;
      
      if (!seoConfig || !seoConfig.title || !seoConfig.description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      
      const result = await adminService.updateSeoConfiguration(
        pageKey,
        seoConfig,
        adminId
      );
      
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'SEO configuration not found') {
        return res.status(404).json({ error: 'SEO configuration not found' });
      }
      
      console.error('Update SEO configuration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  /**
   * POST /admin/seo - Create a new SEO configuration
   */
  router.post('/seo', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    try {
      const adminId = req.adminUser!.id;
      const { pageKey, seoConfig } = req.body;
      
      if (!pageKey) {
        return res.status(400).json({ error: 'Page key is required' });
      }
      
      if (!seoConfig || !seoConfig.title || !seoConfig.description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      
      const result = await adminService.createSeoConfiguration(
        pageKey,
        seoConfig,
        adminId
      );
      
      return res.status(201).json(result);
    } catch (error) {
      if (error.message === 'SEO configuration already exists') {
        return res.status(409).json({ error: 'SEO configuration already exists for this page' });
      }
      
      console.error('Create SEO configuration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * Register admin router with prefix
   */
  app.use('/api/admin', router);
  
  console.log('Admin API routes registered successfully');
}