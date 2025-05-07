import express, { Request, Response } from 'express';
import { z } from 'zod';
import stripeService from '../services/stripe-service';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

// Middleware to ensure user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

const router = express.Router();

// Initialize Stripe
stripeService.initializeStripe();

// Create a checkout session for subscription
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      planInterval: z.enum(['monthly', 'yearly', 'family', 'family-lifetime']),
      planType: z.enum(['individual', 'family']),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    });

    const { planInterval, planType, successUrl, cancelUrl } = schema.parse(req.body);

    const sessionUrl = await stripeService.createCheckoutSession(
      req.user!.id,
      planType,
      planInterval,
      successUrl,
      cancelUrl
    );

    res.json({ url: sessionUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create a payment intent for one-time payments
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().optional().default('usd'),
      metadata: z.record(z.string()).optional(),
    });

    const { amount, currency, metadata } = schema.parse(req.body);

    const paymentIntent = await stripeService.createPaymentIntent(
      req.user!.id,
      amount,
      currency,
      metadata
    );

    res.json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get customer payment methods
router.get('/payment-methods', requireAuth, async (req, res) => {
  try {
    const paymentMethods = await stripeService.getCustomerPaymentMethods(req.user!.id);
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get subscription details
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await stripeService.getSubscriptionDetails(req.user!.id);
    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(400).json({ error: error.message });
  }
});

// Cancel subscription at period end
router.post('/cancel-subscription', requireAuth, async (req, res) => {
  try {
    const result = await stripeService.cancelSubscription(req.user!.id);
    res.json(result);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update subscription (change plan)
router.post('/update-subscription', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      planInterval: z.enum(['monthly', 'yearly', 'family']),
    });

    const { planInterval } = schema.parse(req.body);

    const result = await stripeService.updateSubscription(req.user!.id, planInterval);
    res.json(result);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(400).json({ error: error.message });
  }
});

// Webhook handler (no authentication needed, uses Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).send('Missing stripe-signature header');
  }

  try {
    const result = await stripeService.handleWebhookEvent(signature, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

// For admin use - immediately cancel a subscription and revoke access
router.post('/admin/cancel-subscription', async (req, res) => {
  try {
    // Check if admin is authenticated
    // @ts-ignore - Accessing adminUser from request (set by requireAdmin middleware)
    if (!req.adminUser) {
      return res.status(403).json({ error: 'Admin authentication required' });
    }
    
    const schema = z.object({
      userId: z.number().int().positive(),
    });

    const { userId } = schema.parse(req.body);

    const result = await stripeService.cancelSubscriptionImmediately(userId);
    res.json(result);
  } catch (error) {
    console.error('Error immediately canceling subscription:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;