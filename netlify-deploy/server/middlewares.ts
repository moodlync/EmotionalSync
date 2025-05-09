import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Middleware function to check if a user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Middleware function to check if a user is premium
export async function requirePremium(req: Request, res: Response, next: NextFunction) {
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