import express from 'express';
import { z } from 'zod';
import { stripeService } from '../services/stripe-service';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth-middleware';

const router = express.Router();

// Initialize Stripe
stripeService.initializeStripe();

/**
 * Create a payment intent for one-time payments
 * This includes premium features, NFT purchases, etc.
 */
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      planType: z.string().optional(),
      metadata: z.record(z.string()).optional()
    });

    const { amount, planType, metadata } = schema.parse(req.body);

    // Create a payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      req.user.id,
      amount,
      'usd',
      {
        ...metadata,
        userId: req.user.id.toString(),
        planType: planType || 'one-time'
      }
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Create a checkout session for subscription-based payments
 */
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      planInterval: z.enum(['monthly', 'yearly', 'family', 'family-lifetime']),
      planType: z.enum(['individual', 'family']),
      successUrl: z.string().url(),
      cancelUrl: z.string().url()
    });

    const { planInterval, planType, successUrl, cancelUrl } = schema.parse(req.body);

    const sessionUrl = await stripeService.createCheckoutSession(
      req.user.id,
      planType,
      planInterval,
      successUrl,
      cancelUrl
    );

    res.json({ url: sessionUrl });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Verify a payment and activate premium features
 */
router.post('/verify-payment', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      paymentIntentId: z.string()
    });

    const { paymentIntentId } = schema.parse(req.body);

    // Verify the payment with Stripe
    const paymentInfo = await stripeService.verifyPayment(paymentIntentId);
    
    if (!paymentInfo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
    // Get the plan type from the payment metadata
    const planType = paymentInfo.metadata?.planType || 'monthly';
    
    // Activate the user's premium subscription
    const startDate = new Date();
    const endDate = new Date();
    
    // Set the subscription end date based on the plan type
    switch (planType) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'family':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'family-lifetime':
        // Set to a far future date for lifetime subscriptions
        endDate.setFullYear(endDate.getFullYear() + 99);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Store subscription details
    await storage.activateUserPremium(
      req.user.id,
      planType,
      startDate,
      endDate,
      paymentInfo.id
    );
    
    // Add welcome NFT for new premium subscribers
    if (planType !== 'family') {
      try {
        await storage.createEmotionalNft({
          userId: req.user.id,
          title: "Premium Membership NFT",
          description: "A special NFT commemorating your premium membership",
          imageUrl: "/assets/nfts/premium-member.svg",
          rarity: "rare",
          emotion: "happy",
          createdAt: new Date(),
          mintedAt: new Date(),
          metadataUrl: null,
          isSoulbound: true,
          tokenId: `premium-${req.user.id}-${Date.now()}`,
          attributes: {
            membership: "premium",
            edition: "welcome"
          }
        });
      } catch (nftError) {
        console.error('Error creating welcome NFT:', nftError);
        // Continue anyway - this is not critical
      }
    }
    
    res.json({
      success: true,
      subscription: {
        planType,
        startDate,
        endDate
      }
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('Missing Stripe signature or webhook secret');
      return res.status(400).send('Webhook Error: Missing signature');
    }
    
    const event = await stripeService.handleWebhookEvent(req.body, signature);
    
    // Process the event based on its type
    console.log(`Webhook received: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Payment was successful, update user account as needed
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
        
      case 'payment_intent.payment_failed':
        // Payment failed, handle accordingly
        const failedPayment = event.data.object;
        console.log(`PaymentIntent failed: ${failedPayment.id}`);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Subscription was created or updated
        const subscription = event.data.object;
        console.log(`Subscription ${event.type === 'customer.subscription.created' ? 'created' : 'updated'}: ${subscription.id}`);
        break;
        
      case 'customer.subscription.deleted':
        // Subscription was cancelled
        const cancelledSubscription = event.data.object;
        console.log(`Subscription cancelled: ${cancelledSubscription.id}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;