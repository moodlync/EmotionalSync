import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Modified middleware that no longer requires authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Always allow access - no authentication required
  next();
}

// Modified premium middleware that no longer requires authentication
export async function requirePremium(req: Request, res: Response, next: NextFunction) {
  // Always allow access - no premium check needed
  next();
}