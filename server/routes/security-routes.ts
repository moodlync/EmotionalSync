import { Request, Response, Router } from 'express';
import { securityService } from '../services/security-service';
import { storage } from '../storage';
import { encryptText, decryptText, hashText, generateToken } from '../encryption';
import QRCode from 'qrcode';

const router = Router();

// Authentication middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Premium middleware
async function requirePremium(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = req.user;
  if (!user.isPremium) {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  
  next();
}

// Two-factor authentication setup
router.post('/two-factor/setup', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Check if 2FA is already enabled
    const existingData = await securityService.getTwoFactorData(userId);
    if (existingData && existingData.enabled) {
      return res.status(400).json({ error: 'Two-factor authentication is already enabled' });
    }
    
    // Generate secret, backup codes, and recovery key
    const { secret, backupCodes, recoveryKey } = await securityService.setupTwoFactorAuth(userId);
    
    // Generate QR code for the TOTP secret
    const otpAuthUrl = `otpauth://totp/MoodLync:${req.user.username}?secret=${secret}&issuer=MoodLync`;
    const qrCode = await QRCode.toDataURL(otpAuthUrl);
    
    // Log the security event
    await securityService.logSecurityEvent(
      userId,
      'two_factor_setup_initiated',
      true,
      req.ip,
      req.headers['user-agent'] || null
    );
    
    res.json({
      secret,
      qrCode,
      backupCodes,
      recoveryKey
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: 'Failed to set up two-factor authentication' });
  }
});

// Verify and enable two-factor authentication
router.post('/two-factor/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const verified = await securityService.verifyTwoFactorToken(userId, token);
    if (!verified) {
      // Log the failed verification attempt
      await securityService.logSecurityEvent(
        userId,
        'two_factor_verification_failed',
        false,
        req.ip,
        req.headers['user-agent'] || null
      );
      
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Enable 2FA for the user
    // In a real implementation, this would update the user's 2FA status in the database
    
    // Log the successful verification
    await securityService.logSecurityEvent(
      userId,
      'two_factor_enabled',
      true,
      req.ip,
      req.headers['user-agent'] || null
    );
    
    res.json({ enabled: true });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Disable two-factor authentication
router.post('/two-factor/disable', requireAuth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Verify password
    // In a real implementation, this would verify the user's password
    
    // Disable 2FA
    await securityService.disableTwoFactorAuth(userId);
    
    // Log the event
    await securityService.logSecurityEvent(
      userId,
      'two_factor_disabled',
      true,
      req.ip,
      req.headers['user-agent'] || null
    );
    
    res.json({ disabled: true });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Failed to disable two-factor authentication' });
  }
});

// Request data export
router.post('/data-export', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Check rate limit
    const rateLimited = !(await securityService.checkRateLimit(`data_export:${userId}`, 2, 86400)); // 2 requests per day
    if (rateLimited) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    // Create a token for the data export
    const token = await securityService.createSecurityToken(userId, 'DATA_EXPORT', 24); // 24 hour expiry
    
    // Send an email with the token
    // In a real implementation, this would send an email to the user
    
    // Log the event
    await securityService.logSecurityEvent(
      userId,
      'data_export_requested',
      true,
      req.ip,
      req.headers['user-agent'] || null,
      { tokenId: token.id }
    );
    
    res.json({ message: 'Data export request received. You will receive an email with instructions.' });
  } catch (error) {
    console.error('Error requesting data export:', error);
    res.status(500).json({ error: 'Failed to request data export' });
  }
});

// Request account deletion
router.post('/account-deletion', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Create a token for the account deletion
    const token = await securityService.createSecurityToken(userId, 'ACCOUNT_DELETION', 24); // 24 hour expiry
    
    // Schedule account deletion
    // In a real implementation, this would set a deletion date in the database
    
    // Send an email with the token
    // In a real implementation, this would send an email to the user
    
    // Log the event
    await securityService.logSecurityEvent(
      userId,
      'account_deletion_requested',
      true,
      req.ip,
      req.headers['user-agent'] || null,
      { tokenId: token.id }
    );
    
    res.json({ message: 'Account deletion request received. You will receive an email with instructions.' });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ error: 'Failed to request account deletion' });
  }
});

// Change password
router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Verify current password
    // In a real implementation, this would verify the user's current password
    
    // Update the password
    // In a real implementation, this would update the user's password in the database
    
    // Log the event
    await securityService.logSecurityEvent(
      userId,
      'password_changed',
      true,
      req.ip,
      req.headers['user-agent'] || null
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get security dashboard data
router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get user's security settings
    const twoFactorData = await securityService.getTwoFactorData(userId);
    
    // Mock data for demonstration
    const securityScore = 85;
    const lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const recentEvents = [
      {
        type: 'login_success',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      },
      {
        type: 'password_changed',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
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
    console.error('Error fetching security dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch security dashboard' });
  }
});

// Get security events
router.get('/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get security events
    // In a real implementation, this would fetch the user's security events from the database
    
    // Mock data for demonstration
    const events = [
      {
        id: '1',
        type: 'login_success',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      },
      {
        id: '2',
        type: 'password_changed',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      },
      {
        id: '3',
        type: 'two_factor_enabled',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }
    ];
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

export default router;