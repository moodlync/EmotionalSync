import { Router } from 'express';
import { storage } from '../storage';
import { encryptText } from '../encryption';

const router = Router();

// Middleware to ensure user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: "Authentication required" });
  }
  next();
}

// Request account deletion
router.post('/delete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Set account deletion pending in the database
    await storage.updateUser(userId, {
      accountDeletionRequested: true,
      accountDeletionRequestedAt: new Date(),
      accountDeletionScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    // Record this request in the deletion queue
    await storage.createDeletionRequest({
      userId,
      type: 'account',
      requestedAt: new Date(),
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      userEmail: req.user.email || '',
      notificationSent: false
    });
    
    // TODO: Send email confirmation (would connect to email service)
    
    return res.status(200).json({
      success: true,
      message: "Account deletion request received. Your account will be permanently deleted in 3-7 business days."
    });
  } catch (error: any) {
    console.error("Account deletion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process account deletion request. Please try again later."
    });
  }
});

// Request data deletion
router.post('/delete-data', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Set data deletion pending in the database
    await storage.updateUser(userId, {
      dataDeletionRequested: true,
      dataDeletionRequestedAt: new Date(),
      dataDeletionScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    // Record this request in the deletion queue
    await storage.createDeletionRequest({
      userId,
      type: 'data',
      requestedAt: new Date(),
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      userEmail: req.user.email || '',
      notificationSent: false
    });
    
    // TODO: Send email confirmation (would connect to email service)
    
    return res.status(200).json({
      success: true,
      message: "Data deletion request received. Your personal data will be removed in 3-7 business days."
    });
  } catch (error: any) {
    console.error("Data deletion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process data deletion request. Please try again later."
    });
  }
});

// Get all pending deletion requests (for testing/development)
router.get('/deletion-requests', requireAuth, async (req, res) => {
  try {
    // Only allow admin users to see this information
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    
    const deletionRequests = await storage.getDeletionRequests();
    
    return res.status(200).json({
      success: true,
      data: deletionRequests
    });
  } catch (error: any) {
    console.error("Get deletion requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve deletion requests."
    });
  }
});

export default router;