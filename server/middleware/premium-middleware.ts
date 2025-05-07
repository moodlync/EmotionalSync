import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require premium membership for API routes
 * If user is not premium, returns 403 Forbidden
 * 
 * Note: This middleware must be used AFTER requireAuth middleware
 */
export function requirePremium(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const isPremium = req.user.isPremium;
  const isInTrial = checkTrialStatus(req.user);
  
  if (!isPremium && !isInTrial) {
    return res.status(403).json({ 
      error: 'Premium membership required',
      message: 'This feature requires a premium subscription'
    });
  }
  
  next();
}

/**
 * Check if user has an active trial period
 * Returns true if the user is in an active trial period
 */
function checkTrialStatus(user: any): boolean {
  if (!user.isInTrialPeriod) {
    return false;
  }
  
  // Check if trial is still valid by comparing end date with current date
  if (user.trialEndDate) {
    const now = new Date();
    const trialEnd = new Date(user.trialEndDate);
    
    if (now > trialEnd) {
      return false; // Trial has expired
    }
    
    return true; // Trial is still active
  }
  
  return false; // No trial end date
}