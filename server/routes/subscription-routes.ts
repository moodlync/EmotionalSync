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
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get current subscription status
router.get('/api/subscription', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's subscription from storage
    const subscription = await storage.getUserSubscription(userId);
    
    // If there's no subscription, return free tier
    if (!subscription) {
      return res.json({
        tier: 'free',
        isActive: false,
        expiryDate: null
      });
    }
    
    // Return subscription data
    res.json({
      tier: subscription.tier,
      isActive: subscription.status === 'active',
      expiryDate: subscription.expiresAt,
      startDate: subscription.startedAt,
      autoRenew: subscription.autoRenew,
      paymentMethod: subscription.paymentMethod
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Start a free trial for the selected plan
router.post('/api/subscription/trial', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const schema = z.object({
      tier: z.string().default('gold'), // Default to gold tier if not specified
      trialDays: z.number().int().min(1).max(30).optional().default(14)
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if user already has an active subscription
    const existingSubscription = await storage.getUserSubscription(userId);
    
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }
    
    // Check if user already used a trial
    if (req.user!.hadPremiumTrial) {
      return res.status(400).json({ error: 'User already used their trial period' });
    }
    
    // Calculate expiry date based on trial days
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + validatedData.trialDays);
    
    // Create subscription with trial status
    const subscription = await storage.createOrUpdateSubscription({
      userId,
      tier: validatedData.tier, // Use the selected tier instead of 'trial'
      status: 'trialing', // Mark as trialing instead of active
      startedAt: now,
      expiresAt: expiryDate,
      autoRenew: true, // Default to auto-renew after trial
      paymentMethod: null,
      lastBilledAt: null,
      cancelledAt: null
    });
    
    // Update user to reflect they've had a trial
    await storage.updateUser(userId, { hadPremiumTrial: true });
    
    // Return subscription data
    res.status(201).json({
      tier: subscription.tier,
      isActive: true, // During trial, considered active
      isTrial: true,
      expiryDate: subscription.expiresAt,
      startDate: subscription.startedAt
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Upgrade to premium subscription
router.post('/api/subscription/premium', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const schema = z.object({
      tier: z.string(), // Accept any tier from our plan options including gold, platinum, diamond, etc.
      paymentMethod: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Calculate subscription period based on tier
    const now = new Date();
    let expiryDate: Date | null = new Date();
    
    // Set expiry date based on tier and billing cycle
    if (validatedData.tier.includes('lifetime')) {
      expiryDate = null; // Lifetime plans don't expire
    } else if (validatedData.tier.includes('5year')) {
      // 5-year billing cycle
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    } else if (validatedData.tier.includes('yearly')) {
      // Yearly billing cycle
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      // Default to monthly billing cycle
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    // Create or update subscription
    const subscription = await storage.createOrUpdateSubscription({
      userId,
      tier: validatedData.tier,
      status: 'active',
      startedAt: now,
      expiresAt: expiryDate,
      autoRenew: !validatedData.tier.includes('lifetime'), // Lifetime doesn't auto-renew
      paymentMethod: validatedData.paymentMethod || null,
      lastBilledAt: now,
      cancelledAt: null
    });
    
    // Return subscription data
    res.status(200).json({
      tier: subscription.tier,
      isActive: subscription.status === 'active',
      expiryDate: subscription.expiresAt,
      startDate: subscription.startedAt,
      autoRenew: subscription.autoRenew
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Cancel subscription
router.post('/api/subscription/cancel', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's current subscription
    const existingSubscription = await storage.getUserSubscription(userId);
    
    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    if (existingSubscription.status !== 'active') {
      return res.status(400).json({ error: 'Subscription is not active' });
    }
    
    // For lifetime subscriptions, don't allow cancellation
    if (existingSubscription.tier.includes('lifetime')) {
      return res.status(400).json({ error: 'Lifetime subscriptions cannot be cancelled' });
    }
    
    // Update subscription status
    const now = new Date();
    const updatedSubscription = await storage.createOrUpdateSubscription({
      ...existingSubscription,
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: now
    });
    
    // Return updated subscription
    res.status(200).json({
      tier: updatedSubscription.tier,
      isActive: false,
      expiryDate: updatedSubscription.expiresAt,
      cancelledAt: updatedSubscription.cancelledAt
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;