/**
 * Subscription routes for MoodLync
 * 
 * These routes handle subscription management for users including:
 * - Getting subscription status
 * - Starting a trial
 * - Upgrading to premium plans
 * - Cancelling subscription
 */

import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = express.Router();

// Auth middleware - ensure user is logged in
// Modified auth middleware - no longer requires authentication
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Always allow access without authentication
  next();
};

// Get current subscription status - no authentication required
router.get('/api/subscription', async (req, res) => {
  try {
    // Instead of getting user ID from req.user, use a default ID
    const userId = 1;
    
    // Return mock subscription data
    res.json({
      tier: 'premium',
      status: 'active',
      isActive: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      autoRenew: true,
      paymentMethod: 'credit_card'
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Start a free trial for the selected plan - no authentication required
router.post('/api/subscription/trial', async (req, res) => {
  try {
    // Get trial parameters from request body
    const schema = z.object({
      tier: z.string().default('premium'),
      trialDays: z.number().int().min(1).max(30).optional().default(14)
    });
    
    const validatedData = schema.safeParse(req.body);
    const tier = validatedData.success ? validatedData.data.tier : 'premium';
    const trialDays = validatedData.success ? validatedData.data.trialDays : 14;
    
    // Calculate dates for mock trial
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + trialDays);
    
    // Return mock trial subscription data
    res.status(201).json({
      tier: tier,
      isActive: true,
      isTrial: true,
      status: 'trialing',
      expiryDate: expiryDate,
      startDate: now
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Upgrade to premium subscription - no authentication required
router.post('/api/subscription/premium', async (req, res) => {
  try {
    // Get subscription details from request body
    const schema = z.object({
      tier: z.string(), // Accept any tier from our plan options
      paymentMethod: z.string().optional()
    });
    
    const validatedData = schema.safeParse(req.body);
    const tier = validatedData.success ? validatedData.data.tier : 'premium';
    
    // Calculate subscription period based on tier
    const now = new Date();
    let expiryDate: Date | null = new Date();
    
    // Set expiry date based on tier and billing cycle
    if (tier.includes('lifetime')) {
      expiryDate = null; // Lifetime plans don't expire
    } else if (tier.includes('5year')) {
      // 5-year billing cycle
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    } else if (tier.includes('yearly')) {
      // Yearly billing cycle
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      // Default to monthly billing cycle
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    // Return mock subscription data
    res.status(200).json({
      tier: tier,
      isActive: true,
      status: 'active',
      expiryDate: expiryDate,
      startDate: now,
      autoRenew: !tier.includes('lifetime') // Lifetime doesn't auto-renew
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Cancel subscription - no authentication required
router.post('/api/subscription/cancel', async (req, res) => {
  try {
    // Return mock cancellation response
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Subscription remains active until the end of billing period
    
    // Return mock cancelled subscription data
    res.status(200).json({
      tier: 'premium',
      isActive: false,
      status: 'cancelled',
      expiryDate: expiryDate,
      cancelledAt: now,
      autoRenew: false
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;