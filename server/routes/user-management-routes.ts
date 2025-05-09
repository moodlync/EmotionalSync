/**
 * MoodLync User Management API Routes
 * These routes handle operations for managing registered users
 */
import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { NotificationType } from '@shared/schema';

/**
 * Register user management routes
 */
export function registerUserManagementRoutes(app: express.Express) {
  const router = express.Router();

  /**
   * Middleware to ensure admin access
   */
  router.use((req: Request, res: Response, next) => {
    if (!req.isAuthenticated() || !req.adminUser) {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }
    next();
  });

  /**
   * GET /api/admin/registered-users - Get all registered users
   */
  router.get('/registered-users', async (req: Request, res: Response) => {
    try {
      // Get query parameters for filtering and pagination
      const { search, page = '1', limit = '25' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let usersList = [];
      let totalUsers = 0;

      if (search) {
        // Search users by name or email
        usersList = await storage.searchUsers(search as string);
        totalUsers = usersList.length;
        
        // Handle pagination after search
        usersList = usersList.slice(offset, offset + limitNum);
      } else {
        // Get all users with pagination
        const allUsers = Array.from(storage.users.values());
        totalUsers = allUsers.length;
        
        // Sort by creation date (newest first)
        usersList = allUsers
          .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
            return dateB.getTime() - dateA.getTime();
          })
          .slice(offset, offset + limitNum);
      }

      // Format the response to include pagination info
      res.json({
        users: usersList,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalUsers / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching registered users:', error);
      res.status(500).json({ error: 'Failed to retrieve users list' });
    }
  });

  /**
   * DELETE /api/admin/users/:userId - Delete a user
   */
  router.delete('/users/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the user is a special account (admin, sagar, developer)
      if (['admin', 'sagar', 'dev', 'test'].includes(user.username)) {
        return res.status(403).json({ 
          error: 'Cannot delete system accounts. This account is protected.' 
        });
      }
      
      // Remove the user
      const removed = await storage.removeUser(userId);
      
      if (!removed) {
        return res.status(500).json({ error: 'Failed to remove user' });
      }
      
      // Log the admin action
      console.log(`Admin ${req.adminUser ? req.adminUser.username : 'Unknown'} deleted user: ${user.username} (ID: ${userId})`);
      
      res.json({ 
        success: true, 
        message: `User ${user.username} has been successfully removed from the system.` 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'An error occurred while trying to delete the user' });
    }
  });

  /**
   * POST /api/admin/send-update - Send update notification to users
   */
  router.post('/send-update', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        title: z.string().min(3).max(100),
        content: z.string().min(10).max(1000),
        // Optional parameters
        sendToAll: z.boolean().optional().default(true),
        userIds: z.array(z.number()).optional(),
        autoGenerate: z.boolean().optional().default(false)
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: result.error.format() 
        });
      }
      
      const { title, content, sendToAll, userIds, autoGenerate } = result.data;
      
      let finalTitle = title;
      let finalContent = content;
      
      // If auto-generate is true, enhance the update message
      if (autoGenerate) {
        finalTitle = `MoodLync Update: ${title}`;
        finalContent = generateUpdateContent(content);
      }
      
      // Determine which users to send to
      let targetUserIds: number[] = [];
      
      if (sendToAll) {
        // Get all user IDs
        targetUserIds = Array.from(storage.users.values()).map(user => user.id);
      } else if (userIds && userIds.length > 0) {
        targetUserIds = userIds;
      } else {
        return res.status(400).json({ 
          error: 'Either sendToAll must be true or userIds must contain at least one user ID' 
        });
      }
      
      // Send the notification
      const sentNotifications = await storage.sendSystemNotification(
        targetUserIds,
        finalTitle,
        finalContent,
        'APP_UPDATE',
        '/updates',
        'BellRing' // Icon for updates
      );
      
      res.json({
        success: true,
        message: `Update notification sent to ${sentNotifications.length} users`,
        details: {
          title: finalTitle,
          preview: finalContent.substring(0, 100) + (finalContent.length > 100 ? '...' : ''),
          recipientCount: sentNotifications.length
        }
      });
    } catch (error) {
      console.error('Error sending update notification:', error);
      res.status(500).json({ error: 'Failed to send update notification' });
    }
  });

  /**
   * Apply router to Express app
   */
  app.use('/api/admin', router);
  console.log('User management routes registered successfully');
}

/**
 * Helper function to generate nicely formatted update content
 */
function generateUpdateContent(baseContent: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `🔔 **New MoodLync Update - ${date}**

${baseContent}

---
Thank you for being part of the MoodLync community! If you have any questions about this update, please contact our support team.`;
}