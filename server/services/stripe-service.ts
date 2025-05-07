import Stripe from 'stripe';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { users, premiumPlans, PremiumPlanType, StripeSubscriptionStatus } from '@shared/schema';

// This service will be initialized with the API key when available
let stripeClient: Stripe | null = null;

// Price IDs for different plans (to be configured in Stripe dashboard)
const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
  family: process.env.STRIPE_FAMILY_PRICE_ID || 'price_family',
  'family-lifetime': process.env.STRIPE_FAMILY_LIFETIME_PRICE_ID || 'price_family_lifetime',
};

export function initializeStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe functionality will be limited.');
    return false;
  }

  try {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Stripe:', error);
    return false;
  }
}

// Safely access the Stripe client
function getStripeClient(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe client not initialized. Call initializeStripe() first.');
  }
  return stripeClient;
}

// Create or retrieve a Stripe customer for a user
export async function getOrCreateCustomer(userId: number): Promise<string> {
  const stripe = getStripeClient();
  
  // First check if user already has a customer ID
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // If user already has a customer ID, return it
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  
  // Otherwise create a new customer
  const customerData: Stripe.CustomerCreateParams = {
    email: user.email || undefined,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
    metadata: {
      userId: userId.toString(),
    },
  };
  
  const customer = await stripe.customers.create(customerData);
  
  // Update user with new customer ID
  await db.update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId));
  
  return customer.id;
}

// Create a checkout session for subscription
export async function createCheckoutSession(
  userId: number,
  planType: PremiumPlanType,
  interval: 'monthly' | 'yearly' | 'family' | 'family-lifetime',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripeClient();
  
  // Get or create customer
  const customerId = await getOrCreateCustomer(userId);
  
  // Create checkout session
  const priceId = STRIPE_PRICE_IDS[interval];
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: interval === 'family-lifetime' ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      planType,
      interval,
    },
  });
  
  return session.url || '';
}

// Process webhook events from Stripe
export async function handleWebhookEvent(
  signature: string,
  payload: Buffer
): Promise<{ status: string; message: string }> {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(payload.toString(), signature, webhookSecret);
  } catch (err) {
    return { status: 'error', message: `Webhook signature verification failed: ${err.message}` };
  }
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
  
  return { status: 'success', message: `Webhook processed: ${event.type}` };
}

// Handlers for different webhook events
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripeClient();
  
  if (!session.metadata?.userId) {
    console.error('Missing userId in session metadata');
    return;
  }
  
  const userId = parseInt(session.metadata.userId, 10);
  
  if (session.mode === 'subscription' && session.subscription) {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Update the user's premium status
    await updateUserSubscription(userId, subscription);
  } else if (session.mode === 'payment') {
    // Handle one-time payment (lifetime plan)
    const planType = session.metadata.planType as PremiumPlanType || 'family';
    
    // Calculate expiry (far in the future for lifetime)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 99); // 99 years from now
    
    // Update user as premium with lifetime subscription
    await db.update(users)
      .set({
        isPremium: true,
        premiumPlanType: planType,
        premiumExpiryDate: expiryDate,
      })
      .where(eq(users.id, userId));
    
    // Create a premium plan record
    await db.insert(premiumPlans)
      .values({
        userId,
        planType,
        paymentAmount: session.amount_total ? session.amount_total / 100 : 399.99, // Convert cents to dollars
        currency: session.currency?.toUpperCase() || 'USD',
        isLifetime: true,
        memberLimit: planType === 'family' ? 5 : 1,
        status: 'active',
        paymentMethod: 'stripe',
        paymentDetails: JSON.stringify({
          sessionId: session.id,
          paymentIntent: session.payment_intent,
        }),
      });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!subscription.metadata?.userId) {
    // Try to find the customer and get userId from there
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (!customer.metadata?.userId) {
      console.error('Unable to determine userId for subscription', subscription.id);
      return;
    }
    
    const userId = parseInt(customer.metadata.userId, 10);
    await updateUserSubscription(userId, subscription);
  } else {
    const userId = parseInt(subscription.metadata.userId, 10);
    await updateUserSubscription(userId, subscription);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find the user with this subscription ID
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(eq(premiumPlans.stripeSubscriptionId, subscription.id));
  
  if (!premiumPlan) {
    console.error('Premium plan not found for subscription', subscription.id);
    return;
  }
  
  // Update premium plan status
  await db.update(premiumPlans)
    .set({
      status: 'canceled',
      stripeSubscriptionStatus: 'canceled' as StripeSubscriptionStatus,
    })
    .where(eq(premiumPlans.id, premiumPlan.id));
  
  // Update user premium status
  await db.update(users)
    .set({
      isPremium: false,
      subscriptionCancelled: true,
      subscriptionCancelledAt: new Date(),
    })
    .where(eq(users.id, premiumPlan.userId));
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Find the user with this subscription ID
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(eq(premiumPlans.stripeSubscriptionId, subscription.id));
  
  if (!premiumPlan) {
    console.error('Premium plan not found for subscription', subscription.id);
    return;
  }
  
  // Update next billing date
  const nextBillingDate = new Date(subscription.current_period_end * 1000);
  
  await db.update(premiumPlans)
    .set({
      nextBillingDate,
      stripePeriodEnd: nextBillingDate,
    })
    .where(eq(premiumPlans.id, premiumPlan.id));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Find the user with this subscription ID
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(eq(premiumPlans.stripeSubscriptionId, invoice.subscription as string));
  
  if (!premiumPlan) {
    console.error('Premium plan not found for subscription', invoice.subscription);
    return;
  }
  
  // Update status to past_due
  await db.update(premiumPlans)
    .set({
      stripeSubscriptionStatus: 'past_due' as StripeSubscriptionStatus,
    })
    .where(eq(premiumPlans.id, premiumPlan.id));
}

// Helper function to update user subscription details
async function updateUserSubscription(userId: number, subscription: Stripe.Subscription) {
  // Get the payment method details
  const stripe = getStripeClient();
  let cardBrand: string | undefined;
  let lastFour: string | undefined;
  let expiry: string | undefined;
  let paymentMethodId: string | undefined;
  
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method as string
      );
      
      if (paymentMethod.type === 'card' && paymentMethod.card) {
        cardBrand = paymentMethod.card.brand;
        lastFour = paymentMethod.card.last4;
        expiry = `${paymentMethod.card.exp_month.toString().padStart(2, '0')}/${paymentMethod.card.exp_year.toString().slice(-2)}`;
        paymentMethodId = paymentMethod.id;
      }
    } catch (error) {
      console.error('Error retrieving payment method:', error);
    }
  }
  
  // Map Stripe status to our status
  const subscriptionStatus = subscription.status as StripeSubscriptionStatus;
  const isPremium = ['active', 'trialing'].includes(subscriptionStatus);
  
  // Find existing premium plan
  const [existingPlan] = await db
    .select()
    .from(premiumPlans)
    .where(
      and(
        eq(premiumPlans.userId, userId),
        eq(premiumPlans.stripeSubscriptionId, subscription.id)
      )
    );
  
  // Determine plan type from the product or metadata
  const planTypeMapping = {
    'monthly': 'individual' as PremiumPlanType,
    'yearly': 'individual' as PremiumPlanType,
    'family': 'family' as PremiumPlanType,
    'family-lifetime': 'family' as PremiumPlanType
  };
  
  // Get the price item (first one in the array)
  const item = subscription.items.data[0];
  if (!item) {
    console.error('No items found in subscription', subscription.id);
    return;
  }
  
  // Get the product details
  const product = await stripe.products.retrieve(item.price.product as string);
  const interval = item.price.recurring?.interval || 'month';
  const planType = planTypeMapping[subscription.metadata?.interval as keyof typeof planTypeMapping] || 'individual';
  
  // Calculate expiry date
  const expiryDate = new Date(subscription.current_period_end * 1000);
  
  // Update user premium status
  await db.update(users)
    .set({
      isPremium,
      premiumPlanType: planType,
      premiumExpiryDate: expiryDate,
      isInTrialPeriod: subscription.status === 'trialing',
      trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      stripeLastFour: lastFour,
      stripeCardBrand: cardBrand,
      stripeCardExpiry: expiry,
      stripePaymentMethodId: paymentMethodId,
    })
    .where(eq(users.id, userId));
  
  // Update or create premium plan
  if (existingPlan) {
    await db.update(premiumPlans)
      .set({
        status: isPremium ? 'active' : 'canceled', 
        stripeSubscriptionStatus: subscriptionStatus,
        stripePriceId: item.price.id,
        stripePeriodEnd: expiryDate,
        nextBillingDate: expiryDate,
        stripeCanceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        stripeMetadata: JSON.stringify(subscription.metadata),
        paymentAmount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
        currency: item.price.currency.toUpperCase(),
        isTrial: subscription.status === 'trialing',
        trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      })
      .where(eq(premiumPlans.id, existingPlan.id));
  } else {
    // Create new premium plan
    await db.insert(premiumPlans)
      .values({
        userId,
        planType,
        startDate: new Date(subscription.start_date * 1000),
        paymentAmount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
        currency: item.price.currency.toUpperCase(),
        memberLimit: planType === 'family' ? 5 : 1,
        isLifetime: false,
        nextBillingDate: expiryDate,
        status: isPremium ? 'active' : 'canceled',
        paymentMethod: 'stripe',
        isTrial: subscription.status === 'trialing',
        trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        stripePriceId: item.price.id,
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscriptionStatus,
        stripePeriodEnd: expiryDate,
        stripeCanceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        stripeMetadata: JSON.stringify(subscription.metadata),
      });
  }
}

// Create a payment intent for one-time purchases
export async function createPaymentIntent(
  userId: number,
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string }> {
  const stripe = getStripeClient();
  
  // Get or create customer
  const customerId = await getOrCreateCustomer(userId);
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata: {
      userId: userId.toString(),
      ...metadata,
    },
    payment_method_types: ['card'],
  });
  
  return { clientSecret: paymentIntent.client_secret! };
}

// Get customer payment methods
export async function getCustomerPaymentMethods(userId: number): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripeClient();
  
  // Get customer ID
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.stripeCustomerId) {
    return [];
  }
  
  // Get payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card',
  });
  
  return paymentMethods.data;
}

// Get subscription details
export async function getSubscriptionDetails(userId: number): Promise<any> {
  // Get user and premium plan
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.isPremium) {
    return { isPremium: false };
  }
  
  // Get premium plan
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(
      and(
        eq(premiumPlans.userId, userId),
        eq(premiumPlans.status, 'active')
      )
    )
    .orderBy((premiumPlans) => [{ column: premiumPlans.id, order: 'desc' }]); // Get most recent
  
  if (!premiumPlan) {
    return {
      isPremium: user.isPremium,
      planType: user.premiumPlanType,
      expiryDate: user.premiumExpiryDate,
    };
  }
  
  // Return subscription details
  return {
    isPremium: user.isPremium,
    planType: premiumPlan.planType,
    isLifetime: premiumPlan.isLifetime,
    startDate: premiumPlan.startDate,
    nextBillingDate: premiumPlan.nextBillingDate,
    paymentAmount: premiumPlan.paymentAmount,
    currency: premiumPlan.currency,
    isTrial: premiumPlan.isTrial,
    trialEndDate: premiumPlan.trialEndDate,
    memberLimit: premiumPlan.memberLimit,
    paymentMethod: {
      type: 'card',
      brand: user.stripeCardBrand,
      last4: user.stripeLastFour,
      expiry: user.stripeCardExpiry,
    },
  };
}

// Cancel a subscription
export async function cancelSubscription(userId: number): Promise<{ success: boolean, message: string }> {
  const stripe = getStripeClient();
  
  // Get premium plan
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(
      and(
        eq(premiumPlans.userId, userId),
        eq(premiumPlans.status, 'active')
      )
    )
    .orderBy((premiumPlans) => [{ column: premiumPlans.id, order: 'desc' }]); // Get most recent
  
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: 'No active subscription found' };
  }
  
  try {
    // Cancel at period end (won't charge again, but keeps benefits until end of current period)
    await stripe.subscriptions.update(premiumPlan.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    
    // Update subscription in our database
    await db.update(premiumPlans)
      .set({
        status: 'canceled', // We mark as canceled, even though they keep premium until end of period
      })
      .where(eq(premiumPlans.id, premiumPlan.id));
    
    await db.update(users)
      .set({
        subscriptionCancelled: true,
        subscriptionCancelledAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return {
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, message: `Error canceling subscription: ${error.message}` };
  }
}

// Immediately cancel a subscription and revoke access
export async function cancelSubscriptionImmediately(
  userId: number
): Promise<{ success: boolean, message: string }> {
  const stripe = getStripeClient();
  
  // Get premium plan
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(
      and(
        eq(premiumPlans.userId, userId),
        eq(premiumPlans.status, 'active')
      )
    )
    .orderBy((premiumPlans) => [{ column: premiumPlans.id, order: 'desc' }]);
  
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: 'No active subscription found' };
  }
  
  try {
    // Cancel immediately
    await stripe.subscriptions.cancel(premiumPlan.stripeSubscriptionId);
    
    // Update subscription in our database
    await db.update(premiumPlans)
      .set({
        status: 'canceled',
        stripeSubscriptionStatus: 'canceled' as StripeSubscriptionStatus,
      })
      .where(eq(premiumPlans.id, premiumPlan.id));
    
    await db.update(users)
      .set({
        isPremium: false,
        subscriptionCancelled: true,
        subscriptionCancelledAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return { success: true, message: 'Subscription canceled immediately' };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, message: `Error canceling subscription: ${error.message}` };
  }
}

// Update a subscription (change plan)
export async function updateSubscription(
  userId: number,
  newPlanInterval: 'monthly' | 'yearly' | 'family'
): Promise<{ success: boolean, message: string }> {
  const stripe = getStripeClient();
  
  // Get premium plan
  const [premiumPlan] = await db
    .select()
    .from(premiumPlans)
    .where(
      and(
        eq(premiumPlans.userId, userId),
        eq(premiumPlans.status, 'active')
      )
    )
    .orderBy((premiumPlans) => [{ column: premiumPlans.id, order: 'desc' }]);
  
  if (!premiumPlan || !premiumPlan.stripeSubscriptionId) {
    return { success: false, message: 'No active subscription found' };
  }
  
  const newPriceId = STRIPE_PRICE_IDS[newPlanInterval];
  
  try {
    // Update the subscription
    await stripe.subscriptions.update(premiumPlan.stripeSubscriptionId, {
      items: [
        {
          id: (await stripe.subscriptions.retrieve(premiumPlan.stripeSubscriptionId)).items.data[0].id,
          price: newPriceId,
        },
      ],
      metadata: {
        ...JSON.parse(premiumPlan.stripeMetadata || '{}'),
        interval: newPlanInterval,
      },
    });
    
    return { success: true, message: 'Subscription updated successfully' };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, message: `Error updating subscription: ${error.message}` };
  }
}

// Export the Stripe service functions
export const stripeService = {
  initializeStripe,
  getOrCreateCustomer,
  createCheckoutSession,
  handleWebhookEvent,
  createPaymentIntent,
  getCustomerPaymentMethods,
  getSubscriptionDetails,
  cancelSubscription,
  cancelSubscriptionImmediately,
  updateSubscription,
};

export default stripeService;