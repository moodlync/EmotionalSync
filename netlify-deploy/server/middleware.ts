import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden. Requires admin privileges.' });
  }
  next();
};

export const requirePremium = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  
  if (!req.user?.isPremium && !req.user?.isAdmin && !req.user?.inFreeTrial) {
    // Special users with automatic premium access
    const specialUsers = ['admin', 'sagar', 'dev', 'test'];
    if (!specialUsers.includes(req.user?.username)) {
      return res.status(403).json({ 
        error: 'Premium required. Please upgrade your account to access this feature.',
        isPremiumRequired: true
      });
    }
  }
  
  next();
};