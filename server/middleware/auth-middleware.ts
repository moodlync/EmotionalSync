import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to require authentication for API routes
 * If user is not authenticated, returns 401 Unauthorized
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Middleware to require admin authentication
 * If user is not an admin, returns 403 Forbidden
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user is admin - assuming admins have isPremium and isVerified flags
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}