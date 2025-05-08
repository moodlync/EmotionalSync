import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Middleware to ensure user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: "Authentication required" });
  }
  next();
}

// Start a free trial for a specific plan
router.post('/start-trial', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const trialDays = 14; // Fixed 14-day trial period
    const { plan = 'gold' } = req.body; // Default to gold plan if not specified
    
    // Get current user data
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    
    // Check if user is already premium
    if (user.isPremium) {
      return res.status(400).json({
        success: false,
        message: "You already have a premium subscription. No need for a trial."
      });
    }
    
    // Check if user already has an active trial
    if (user.isInTrialPeriod) {
      const isActive = await storage.isUserInActiveTrial(userId);
      
      if (isActive) {
        return res.status(400).json({
          success: false,
          message: "You already have an active trial period."
        });
      } else {
        // Trial exists but expired - can restart (optional, depends on business requirements)
        return res.status(400).json({
          success: false,
          message: "You've already used your free trial period."
        });
      }
    }
    
    // Start the trial for this user with the specified plan
    const updatedUser = await storage.startPlanTrial(userId, plan, trialDays);
    
    // Create a notification
    await storage.createNotification({
      userId,
      title: "Free Trial Started!",
      content: `You now have access to all ${plan} plan features for ${trialDays} days. Enjoy your MoodSync experience!`,
      type: "subscription",
      actionLink: "/premium/features",
      icon: "gift"
    });
    
    return res.status(200).json({
      success: true,
      message: `Your ${trialDays}-day free trial of the ${plan} plan has started.`,
      trialStarted: true,
      plan: plan,
      trialEndDate: updatedUser.trialEndDate
    });
  } catch (error: any) {
    console.error("Start trial error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start trial. Please try again later."
    });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user data to check subscription
    const user = await storage.getUser(userId);
    
    if (!user.isPremium) {
      return res.status(400).json({
        success: false,
        message: "You don't have an active premium subscription to cancel."
      });
    }
    
    // Mark subscription as cancelled but maintain access until expiry date
    await storage.updateUser(userId, {
      subscriptionCancelled: true,
      subscriptionCancelledAt: new Date(),
      // Keep the existing expiry date - subscription will expire naturally
    });
    
    // Get updated user with correct dates
    const updatedUser = await storage.getUser(userId);
    
    return res.status(200).json({
      success: true,
      message: "Your subscription has been cancelled.",
      expiresAt: updatedUser.premiumExpiryDate,
      subscriptionCancelled: true
    });
  } catch (error: any) {
    console.error("Subscription cancellation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription. Please try again later."
    });
  }
});

// Renew subscription
router.post('/renew', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user data to check subscription status
    const user = await storage.getUser(userId);
    
    if (!user.isPremium) {
      return res.status(400).json({
        success: false,
        message: "You don't have a premium subscription to renew."
      });
    }
    
    // If subscription was cancelled, reactivate it
    if (user.subscriptionCancelled) {
      // Calculate new expiry date based on current plan
      let newExpiryDate = new Date();
      
      // Determine renewal period based on plan type
      const planType = user.premiumPlanType || '';
      
      if (planType.includes('lifetime')) {
        // Lifetime plans don't expire
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 100); // Effectively forever
      } else if (planType.includes('5year') || planType.includes('fiveyear')) {
        // 5-year plans
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 5);
      } else if (planType.includes('yearly') || planType.includes('annual')) {
        // Yearly plans
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
      } else if (planType.includes('quarterly')) {
        // Quarterly plans
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
      } else {
        // Default to monthly for all other plans
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
      }
      
      await storage.updateUser(userId, {
        subscriptionCancelled: false,
        subscriptionCancelledAt: null,
        premiumExpiryDate: newExpiryDate
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Your subscription is already active and set to renew automatically."
      });
    }
    
    // Get updated user info
    const updatedUser = await storage.getUser(userId);
    
    return res.status(200).json({
      success: true,
      message: "Your subscription has been renewed successfully.",
      expiresAt: updatedUser.premiumExpiryDate,
      subscriptionCancelled: false
    });
  } catch (error: any) {
    console.error("Subscription renewal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to renew subscription. Please try again later."
    });
  }
});

// Get subscription status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user data for subscription details
    const user = await storage.getUser(userId);
    
    // Check if user is in an active trial
    const isInActiveTrial = await storage.isUserInActiveTrial(userId);
    
    return res.status(200).json({
      success: true,
      isPremium: user.isPremium,
      planType: user.premiumPlanType,
      expiresAt: user.premiumExpiryDate,
      isCancelled: user.subscriptionCancelled,
      cancelledAt: user.subscriptionCancelledAt,
      // Trial information
      isInTrialPeriod: isInActiveTrial,
      trialStartDate: user.trialStartDate,
      trialEndDate: user.trialEndDate,
      // Additional trial status
      hadTrialBefore: user.hadPremiumTrial,
      daysRemaining: isInActiveTrial && user.trialEndDate ? 
        Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
    });
  } catch (error: any) {
    console.error("Get subscription status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription status."
    });
  }
});

export default router;