import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Calendar, Bell, Palette, Users, Shield, Zap, 
  HomeIcon, Sparkles, Clock, CreditCard, AlertCircle, CalendarClock,
  Heart, UserPlus, RefreshCw, HeartHandshake, ArrowRightLeft, Download, Gift, Info,
  Gem, Crown, ArrowBigUp, X, User
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: string;
  savings?: string;
  features: string[];
  popular?: boolean;
  highlighted?: boolean;
  tier?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface SubscriptionInfo {
  id: string;
  status: 'active' | 'trialing' | 'canceled' | 'ended';
  currentPeriodEnd: Date;
  plan: string;
  startDate: Date;
  cancelAt?: Date;
}

export default function PremiumPlans() {
  const { user } = useAuth();
  const { 
    tier, 
    isActive, 
    isTrial, 
    isLifetime, 
    expiryDate, 
    startTrialMutation, 
    upgradeSubscriptionMutation, 
    cancelSubscriptionMutation 
  } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('trial');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'creditcard' | 'paypal' | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [planType, setPlanType] = useState<'individual' | 'family'>('individual');
  const { toast } = useToast();
  
  // Convert subscription data to the format expected by the component
  const subscriptionInfo: SubscriptionInfo | null = isActive || isTrial ? {
    id: `sub_${user?.id}`,
    status: isActive ? 'active' : 'trialing',
    currentPeriodEnd: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    plan: tier,
    startDate: new Date(),
  } : null;

  // Define updated pricing options as per new requirements
  const individualPricingOptions: PricingOption[] = [
    {
      id: 'trial',
      name: '14-Day Free Trial',
      description: 'Try all premium features without commitment',
      price: 'Free',
      features: [
        'Access to all premium features for 14 days',
        'No credit card required',
        'Downgrade to free plan after trial',
        'No commitment required'
      ],
      popular: true,
      icon: <Gift className="h-5 w-5" />
    },
    {
      id: 'gold-monthly',
      name: 'Gold Monthly',
      description: 'Core premium features for casual users',
      price: '$6.99',
      features: [
        'All core features',
        'AI-powered features',
        'Premium content access',
        'Cancel anytime'
      ],
      tier: 'gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'gold-yearly',
      name: 'Gold Yearly',
      description: 'Save with a yearly subscription',
      price: '$79.99',
      savings: 'Save $3.99/mo',
      features: [
        'All core features',
        'AI-powered features',
        'Premium content access',
        'Greater savings'
      ],
      tier: 'gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'gold-5year',
      name: 'Gold 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$249.99',
      savings: 'Save $4.16/mo',
      features: [
        'All core features',
        'AI-powered features',
        'Premium content access',
        'Maximum savings'
      ],
      tier: 'gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'platinum-monthly',
      name: 'Platinum Monthly',
      description: 'Enhanced features for dedicated users',
      price: '$9.99',
      features: [
        'All Gold features',
        'Global Mood Map access',
        'Priority support',
        'Enhanced token rewards'
      ],
      tier: 'platinum',
      color: 'violet',
      icon: <Gem className="h-5 w-5" />
    },
    {
      id: 'platinum-yearly',
      name: 'Platinum Yearly',
      description: 'Save with a yearly subscription',
      price: '$109.99',
      savings: 'Save $3.83/mo',
      features: [
        'All Gold features',
        'Global Mood Map access',
        'Priority support',
        'Enhanced token rewards'
      ],
      tier: 'platinum',
      color: 'violet',
      icon: <Gem className="h-5 w-5" />
    },
    {
      id: 'platinum-5year',
      name: 'Platinum 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$369.99',
      savings: 'Save $4.50/mo',
      features: [
        'All Gold features',
        'Global Mood Map access',
        'Priority support',
        'Enhanced token rewards'
      ],
      tier: 'platinum',
      color: 'violet',
      icon: <Gem className="h-5 w-5" />
    },
    {
      id: 'diamond-monthly',
      name: 'Diamond Monthly',
      description: 'Premium experience for power users',
      price: '$14.99',
      features: [
        'All Platinum features',
        'Time Machine Journal',
        'VIP challenges',
        'Exclusive NFT collections'
      ],
      tier: 'diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'diamond-yearly',
      name: 'Diamond Yearly',
      description: 'Save with a yearly subscription',
      price: '$149.99',
      savings: 'Save $4.99/mo',
      features: [
        'All Platinum features',
        'Time Machine Journal',
        'VIP challenges',
        'Exclusive NFT collections'
      ],
      tier: 'diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'diamond-5year',
      name: 'Diamond 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$499.99',
      savings: 'Save $6.66/mo',
      features: [
        'All Platinum features',
        'Time Machine Journal',
        'VIP challenges',
        'Exclusive NFT collections'
      ],
      tier: 'diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'legacy-monthly',
      name: 'Legacy Monthly',
      description: 'Ultimate MoodSync experience',
      price: '$19.99',
      features: [
        'All Diamond features',
        'All Advanced tools',
        'First access to new features',
        'Personal emotional insights'
      ],
      tier: 'legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'legacy-yearly',
      name: 'Legacy Yearly',
      description: 'Save with a yearly subscription',
      price: '$219.99',
      savings: 'Save $6.67/mo',
      features: [
        'All Diamond features',
        'All Advanced tools',
        'First access to new features',
        'Personal emotional insights'
      ],
      tier: 'legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'legacy-5year',
      name: 'Legacy 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$699.99',
      savings: 'Save $8.33/mo',
      features: [
        'All Diamond features',
        'All Advanced tools',
        'First access to new features',
        'Personal emotional insights'
      ],
      tier: 'legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
  ];
  
  const familyPricingOptions: PricingOption[] = [
    {
      id: 'family-trial',
      name: 'Family 14-Day Trial',
      description: 'Try all family plan features',
      price: 'Free',
      features: [
        'Access for up to 6 family members',
        'All premium features for 14 days',
        'No credit card required',
        'Downgrade to free plan after trial'
      ],
      popular: true,
      icon: <Gift className="h-5 w-5" />
    },
    {
      id: 'family-gold-monthly',
      name: 'Family Gold Monthly',
      description: 'Core features for the whole family',
      price: '$14.99',
      features: [
        'Access for up to 6 family members',
        'All core features',
        'AI-powered features',
        'Premium content access'
      ],
      tier: 'family-gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'family-gold-yearly',
      name: 'Family Gold Yearly',
      description: 'Save with a yearly subscription',
      price: '$149.99',
      savings: 'Save $5/mo',
      features: [
        'Access for up to 6 family members',
        'All core features',
        'AI-powered features',
        'Premium content access'
      ],
      tier: 'family-gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'family-gold-5year',
      name: 'Family Gold 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$299.99',
      savings: 'Save $10/mo',
      features: [
        'Access for up to 6 family members',
        'All core features',
        'AI-powered features',
        'Premium content access'
      ],
      tier: 'family-gold',
      color: 'amber',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'family-diamond-monthly',
      name: 'Family Diamond Monthly',
      description: 'Enhanced features for the whole family',
      price: '$19.99',
      features: [
        'Access for up to 6 family members',
        'All Gold features',
        'Time Machine Journal',
        'VIP challenges'
      ],
      tier: 'family-diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'family-diamond-yearly',
      name: 'Family Diamond Yearly',
      description: 'Save with a yearly subscription',
      price: '$249.99',
      savings: 'Save $10.84/mo',
      features: [
        'Access for up to 6 family members',
        'All Gold features',
        'Time Machine Journal',
        'VIP challenges'
      ],
      tier: 'family-diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'family-diamond-5year',
      name: 'Family Diamond 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$449.99',
      savings: 'Save $12.50/mo',
      features: [
        'Access for up to 6 family members',
        'All Gold features',
        'Time Machine Journal',
        'VIP challenges'
      ],
      tier: 'family-diamond',
      color: 'blue',
      icon: <ArrowBigUp className="h-5 w-5" />,
      highlighted: true
    },
    {
      id: 'family-legacy-monthly',
      name: 'Family Legacy Monthly',
      description: 'Ultimate family experience',
      price: '$24.99',
      features: [
        'Access for up to 6 family members',
        'All Diamond features',
        'All Advanced tools',
        'First access to new features'
      ],
      tier: 'family-legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'family-legacy-yearly',
      name: 'Family Legacy Yearly',
      description: 'Save with a yearly subscription',
      price: '$399.99',
      savings: 'Save $20.83/mo',
      features: [
        'Access for up to 6 family members',
        'All Diamond features',
        'All Advanced tools',
        'First access to new features'
      ],
      tier: 'family-legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'family-legacy-5year',
      name: 'Family Legacy 5-Year',
      description: 'Maximum savings for long-term users',
      price: '$699.99',
      savings: 'Save $23.33/mo',
      features: [
        'Access for up to 6 family members',
        'All Diamond features',
        'All Advanced tools',
        'First access to new features'
      ],
      tier: 'family-legacy',
      color: 'purple',
      icon: <Crown className="h-5 w-5" />
    },
  ];
  
  // Get the appropriate pricing options based on the selected plan type
  const pricingOptions = planType === 'individual' ? individualPricingOptions : familyPricingOptions;
  
  const premiumFeatures = [
    {
      title: 'Social Sharing',
      description: 'Share your thoughts with friends and family with privacy controls',
      icon: <Users className="h-5 w-5 text-primary" />
    },
    {
      title: 'Dynamic Theme Colors',
      description: 'App appearance changes based on your current emotional state',
      icon: <Palette className="h-5 w-5 text-primary" />
    },
    {
      title: 'Multiple Daily Check-ins',
      description: 'Log your emotions multiple times throughout the day',
      icon: <Calendar className="h-5 w-5 text-primary" />
    },
    {
      title: 'Multi-channel Reminders',
      description: 'Receive notifications via mobile, WhatsApp, or email',
      icon: <Bell className="h-5 w-5 text-primary" />
    },
    {
      title: 'Wellness Content',
      description: 'Personalized tips and exercises based on your emotional state',
      icon: <Sparkles className="h-5 w-5 text-primary" />
    },
    {
      title: 'Enhanced Privacy',
      description: 'Advanced controls to protect your emotional data',
      icon: <Shield className="h-5 w-5 text-primary" />
    },
    {
      title: 'Ad-free Experience',
      description: 'Enjoy MoodSync without any advertisements',
      icon: <Zap className="h-5 w-5 text-primary" />
    },
    {
      title: 'Smart Home Integration',
      description: 'Connect with smart devices to enhance your emotional environment',
      icon: <HomeIcon className="h-5 w-5 text-primary" />
    }
  ];

  const handleSubscribe = (planId: string) => {
    // For free trial plans, start trial directly without payment
    if (planId === 'trial' || planId === 'family-trial') {
      startTrialMutation.mutate({
        tier: planId === 'family-trial' ? 'family' : 'premium',
        duration: 14, // 14-day trial
      }, {
        onSuccess: () => {
          toast({
            title: 'Trial Started',
            description: 'Your 14-day trial has been activated successfully.',
            variant: 'default',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error Starting Trial',
            description: error.message || 'An error occurred while starting your trial.',
            variant: 'destructive',
          });
        }
      });
    } else {
      // For paid plans, show payment dialog
      setProcessingPlan(planId);
      setShowPaymentDialog(true);
    }
  };

  const handlePayment = () => {
    // Process payment and upgrade subscription
    if (processingPlan) {
      // Extract tier and billing cycle from the plan ID
      const [planType, billingCycle] = processingPlan.split('-');
      
      // Determine duration in months
      let durationMonths = 1; // default monthly
      if (billingCycle === 'yearly') {
        durationMonths = 12;
      } else if (billingCycle === '5year') {
        durationMonths = 60;
      }
      
      // Map the plan type to the allowed tier types
      let tierValue: 'premium' | 'family' | 'lifetime';
      if (planType.includes('family')) {
        tierValue = 'family';
      } else if (planType.includes('lifetime')) {
        tierValue = 'lifetime';
      } else {
        tierValue = 'premium';
      }
      
      upgradeSubscriptionMutation.mutate(
        {
          tier: tierValue,
          durationMonths: durationMonths,
          paymentMethod: paymentMethod || 'creditcard'
        },
        {
          onSuccess: () => {
            toast({
              title: 'Subscription Upgraded',
              description: 'Your subscription has been upgraded successfully.',
              variant: 'default',
            });
            setShowPaymentDialog(false);
            setProcessingPlan(null);
            setPaymentMethod(null);
          },
          onError: (error) => {
            toast({
              title: 'Payment Failed',
              description: error.message || 'An error occurred during payment processing.',
              variant: 'destructive',
            });
          }
        }
      );
    }
  };
  
  const handleCancelSubscription = () => {
    // Call the API to cancel the subscription
    cancelSubscriptionMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Subscription Canceled',
          description: 'Your subscription has been canceled and will remain active until the end of the current billing period.',
          variant: 'default',
        });
        setShowManageDialog(false);
      },
      onError: (error) => {
        toast({
          title: 'Error Canceling Subscription',
          description: error.message || 'An error occurred while canceling your subscription.',
          variant: 'destructive',
        });
      }
    });
  };

  // Helper function to render subscription tier card
  const renderPlanCard = (plan: PricingOption, cycle: string) => {
    const planId = plan.id;
    const isCurrentPlan = isActive && tier === plan.tier;
    
    // Pre-defined color maps for consistent styling
    const getColorClasses = (colorName: string) => {
      switch(colorName) {
        case 'amber': return {
          border: 'border-amber-300 dark:border-amber-700',
          highlight: 'border-amber-400 dark:border-amber-600',
          bgGradient: 'from-amber-100 to-transparent dark:from-amber-900/30 dark:to-transparent',
          iconBg: 'bg-amber-100 dark:bg-amber-900/40',
          textTitle: 'text-amber-800 dark:text-amber-300',
          textPrice: 'text-amber-800 dark:text-amber-300',
          textFeature: 'text-amber-700 dark:text-amber-400',
          textSavings: 'text-amber-600 dark:text-amber-400',
          checkIcon: 'text-amber-500',
          buttonBg: 'bg-amber-500 hover:bg-amber-600',
          badgeBg: 'bg-amber-500',
          shadow: 'shadow-amber-200/50 dark:shadow-amber-900/30'
        };
        case 'violet': return {
          border: 'border-violet-300 dark:border-violet-700',
          highlight: 'border-violet-400 dark:border-violet-600',
          bgGradient: 'from-violet-100 to-transparent dark:from-violet-900/30 dark:to-transparent',
          iconBg: 'bg-violet-100 dark:bg-violet-900/40',
          textTitle: 'text-violet-800 dark:text-violet-300',
          textPrice: 'text-violet-800 dark:text-violet-300',
          textFeature: 'text-violet-700 dark:text-violet-400',
          textSavings: 'text-violet-600 dark:text-violet-400',
          checkIcon: 'text-violet-500',
          buttonBg: 'bg-violet-500 hover:bg-violet-600',
          badgeBg: 'bg-violet-500',
          shadow: 'shadow-violet-200/50 dark:shadow-violet-900/30'
        };
        case 'blue': return {
          border: 'border-blue-300 dark:border-blue-700',
          highlight: 'border-blue-400 dark:border-blue-600',
          bgGradient: 'from-blue-100 to-transparent dark:from-blue-900/30 dark:to-transparent',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          textTitle: 'text-blue-800 dark:text-blue-300',
          textPrice: 'text-blue-800 dark:text-blue-300',
          textFeature: 'text-blue-700 dark:text-blue-400',
          textSavings: 'text-blue-600 dark:text-blue-400',
          checkIcon: 'text-blue-500',
          buttonBg: 'bg-blue-500 hover:bg-blue-600',
          badgeBg: 'bg-blue-500',
          shadow: 'shadow-blue-200/50 dark:shadow-blue-900/30'
        };
        case 'purple': return {
          border: 'border-purple-300 dark:border-purple-700',
          highlight: 'border-purple-400 dark:border-purple-600',
          bgGradient: 'from-purple-100 to-transparent dark:from-purple-900/30 dark:to-transparent',
          iconBg: 'bg-purple-100 dark:bg-purple-900/40',
          textTitle: 'text-purple-800 dark:text-purple-300',
          textPrice: 'text-purple-800 dark:text-purple-300',
          textFeature: 'text-purple-700 dark:text-purple-400',
          textSavings: 'text-purple-600 dark:text-purple-400',
          checkIcon: 'text-purple-500',
          buttonBg: 'bg-purple-500 hover:bg-purple-600',
          badgeBg: 'bg-purple-500',
          shadow: 'shadow-purple-200/50 dark:shadow-purple-900/30'
        };
        default: return {
          border: 'border-primary/40 dark:border-primary/40',
          highlight: 'border-primary/70 dark:border-primary/70',
          bgGradient: 'from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent',
          iconBg: 'bg-primary/10 dark:bg-primary/20',
          textTitle: 'text-primary dark:text-primary',
          textPrice: 'text-primary dark:text-primary',
          textFeature: 'text-primary/90 dark:text-primary/90',
          textSavings: 'text-primary/80 dark:text-primary/80',
          checkIcon: 'text-primary',
          buttonBg: 'bg-primary hover:bg-primary/90',
          badgeBg: 'bg-primary',
          shadow: 'shadow-primary/30 dark:shadow-primary/20'
        };
      }
    };
    
    const colorClass = getColorClasses(plan.color || 'primary');
    
    // Set up classes based on highlight state and current plan
    const cardColorClass = isCurrentPlan
      ? 'border-green-400 dark:border-green-600 shadow-md dark:shadow-lg shadow-green-200/50 dark:shadow-green-900/30'
      : plan.highlighted 
        ? `${colorClass.highlight} shadow-md dark:shadow-lg ${colorClass.shadow}` 
        : colorClass.border;
    
    const headerClass = `bg-gradient-to-b ${colorClass.bgGradient}`;
    
    return (
      <Card className={`overflow-hidden border-2 ${cardColorClass} h-full flex flex-col transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg`} key={planId}>
        {/* Badge area */}
        <div className="absolute top-0 right-0 flex flex-row gap-1">
          {plan.highlighted && (
            <div className={`${colorClass.badgeBg} text-white text-xs font-semibold px-2 py-1 rounded-bl-md`}>
              POPULAR
            </div>
          )}
          {isCurrentPlan && (
            <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-md flex items-center gap-1">
              <Check className="h-3 w-3" />
              CURRENT
            </div>
          )}
        </div>
        
        <CardHeader className={headerClass}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-full p-2 ${colorClass.iconBg}`}>
                {plan.icon}
              </div>
              <CardTitle className={colorClass.textTitle}>
                {plan.name.split(' ')[0]}
              </CardTitle>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${colorClass.textPrice}`}>
                {plan.price}
              </span>
              {cycle !== 'monthly' && plan.savings && (
                <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  {plan.savings}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4 flex-grow">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm group">
                <div className="mr-2 mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Check className={`h-3 w-3 ${colorClass.checkIcon}`} />
                </div>
                <span className={colorClass.textFeature}>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pt-4">
          <Button 
            className={`w-full ${isCurrentPlan ? 'bg-green-500 hover:bg-green-600' : colorClass.buttonBg} text-white`}
            onClick={() => handleSubscribe(planId)}
            disabled={isCurrentPlan || upgradeSubscriptionMutation.isPending}
          >
            {processingPlan === planId ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : isCurrentPlan ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Current Plan
              </span>
            ) : (
              'Subscribe'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // The main comparison table for each cycle
  const renderComparisonTable = (cycle: string) => {
    const filteredPlans = planType === 'individual' 
      ? individualPricingOptions.filter(p => p.id.includes(cycle) && p.id !== 'trial')
      : familyPricingOptions.filter(p => p.id.includes(cycle) && p.id !== 'family-trial');

    // Create title for the table based on plan type and billing cycle
    const tableTitleText = `${planType === 'individual' ? 'Individual' : 'Family'} Plan - ${
      cycle === 'monthly' ? 'Monthly' : 
      cycle === 'yearly' ? 'Annual' : 
      '5-Year'
    } Billing`;

    const tableDescriptionText = planType === 'individual' 
      ? 'Premium features for a single user' 
      : 'Share premium features with up to 6 family members';

    // Different styling for individual vs family tables
    const tableColors = planType === 'individual' 
      ? {
          border: 'border-gray-200 dark:border-gray-800',
          background: 'bg-white dark:bg-gray-950',
          headerBg: 'bg-gray-50 dark:bg-gray-900',
          rowBg: 'bg-gray-50/50 dark:bg-gray-900/50',
          icon: <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        }
      : {
          border: 'border-blue-200 dark:border-blue-800/50',
          background: 'bg-blue-50/30 dark:bg-blue-950/30',
          headerBg: 'bg-blue-100/50 dark:bg-blue-900/30',
          rowBg: 'bg-blue-50/40 dark:bg-blue-900/40',
          icon: <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className={`text-xl font-semibold ${
            planType === 'individual' 
              ? 'text-gray-900 dark:text-gray-100' 
              : 'text-blue-800 dark:text-blue-300'
          }`}>
            {tableTitleText}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {tableDescriptionText}
          </p>
          <p className="text-muted-foreground text-sm">
            {cycle === 'monthly' 
              ? 'Billed monthly with maximum flexibility' 
              : cycle === 'yearly' 
                ? 'Annual billing for better savings' 
                : '5-year billing for maximum savings'}
          </p>
        </div>
        
        <div className={`overflow-x-auto rounded-lg shadow-sm border ${tableColors.background} ${tableColors.border}`}>
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b-2 ${tableColors.border}`}>
                <th className={`p-4 text-left ${tableColors.headerBg} font-medium`}>
                  <div className="flex items-center gap-2">
                    {tableColors.icon}
                    <span className="font-semibold">Feature</span>
                  </div>
                </th>
                {filteredPlans.map((plan) => {
                  const isCurrentPlan = isActive && tier === plan.tier;
                  
                  return (
                    <th key={plan.id} className={`p-4 text-center ${
                      isCurrentPlan
                        ? 'bg-green-50/50 dark:bg-green-900/20 border-b-2 border-green-400 dark:border-green-600'
                        : plan.highlighted 
                          ? `bg-${plan.color || 'blue'}-50/50 dark:bg-${plan.color || 'blue'}-900/20` 
                          : tableColors.headerBg
                    }`}>
                      <div className="flex flex-col items-center relative">
                        {isCurrentPlan && (
                          <Badge className="absolute -top-3 -left-1 bg-green-500 text-white px-2 py-0.5 text-[10px] font-bold">
                            CURRENT PLAN
                          </Badge>
                        )}
                        {plan.highlighted && (
                          <Badge className="absolute -top-3 -right-1 bg-primary text-white px-2 py-0.5 text-[10px] font-bold">
                            POPULAR
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`rounded-full p-1.5 ${
                            plan.color 
                              ? `bg-${plan.color}-100 dark:bg-${plan.color}-900/40`
                              : 'bg-primary/10 dark:bg-primary/20'
                          }`}>
                            {plan.icon}
                          </div>
                          <span className={`font-bold text-lg ${
                            plan.color 
                              ? `text-${plan.color}-700 dark:text-${plan.color}-400`
                              : 'text-primary dark:text-primary'
                          }`}>
                            {plan.name.split(' ')[0]}
                          </span>
                        </div>
                        
                        <div className="text-xl font-bold">{plan.price}</div>
                        
                        {cycle !== 'monthly' && plan.savings && (
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          >
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Features comparison */}
              {[
                "Access to core features",
                "Premium content",
                "AI-powered features",
                "Priority support",
                "Global Mood Map",
                "Enhanced token rewards",
                "Exclusive NFT collections",
                "VIP challenges",
                "Time Machine Journal",
                "Advanced tools access",
                "First access to new features",
                "Personal emotional insights"
              ].map((feature, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? tableColors.rowBg : ""} hover:bg-muted/10 transition-colors`}>
                  <td className={`p-4 font-medium border-b ${tableColors.border}`}>
                    <div className="flex items-center gap-2">
                      {idx < 3 && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                      {idx >= 3 && idx < 6 && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                      {idx >= 6 && idx < 9 && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                      {idx >= 9 && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                      <span className="text-sm">{feature}</span>
                    </div>
                    
                    {planType === 'family' && idx < 3 && (
                      <Badge variant="outline" className="ml-6 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        <Users className="h-3 w-3 mr-1" />
                        Family Shared
                      </Badge>
                    )}
                  </td>
                  
                  {filteredPlans.map((plan) => {
                    const isCurrentPlan = isActive && tier === plan.tier;
                    let hasFeature = true;
                    
                    // Logic to determine if this plan has this feature
                    if (plan.tier?.includes('gold') && idx > 2) hasFeature = false;
                    if (plan.tier?.includes('platinum') && idx > 5) hasFeature = false;
                    if (plan.tier?.includes('diamond') && idx > 8) hasFeature = false;
                    
                    // Determine styling for the cell
                    const cellClass = isCurrentPlan
                      ? 'bg-green-50/30 dark:bg-green-900/10'
                      : plan.highlighted && hasFeature
                        ? `bg-${plan.color || 'blue'}-50/20 dark:bg-${plan.color || 'blue'}-900/10`
                        : '';
                    
                    return (
                      <td key={plan.id} className={`p-4 text-center border-b ${tableColors.border} ${cellClass}`}>
                        {hasFeature ? (
                          <div className="flex items-center justify-center">
                            <div className={`w-6 h-6 rounded-full ${
                              plan.color 
                                ? `bg-${plan.color}-50/70 dark:bg-${plan.color}-900/30`
                                : 'bg-green-50 dark:bg-green-900/20'
                            } flex items-center justify-center`}>
                              <Check className={`h-3.5 w-3.5 ${
                                plan.color 
                                  ? `text-${plan.color}-500 dark:text-${plan.color}-400`
                                  : 'text-green-500 dark:text-green-400'
                              }`} />
                            </div>
                          </div>
                        ) : (
                          <X className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Action row */}
              <tr>
                <td className={`p-4 ${tableColors.headerBg} font-medium`}>Subscribe</td>
                {filteredPlans.map((plan) => {
                  const isCurrentPlan = isActive && tier === plan.tier;
                  
                  return (
                    <td key={plan.id} className={`p-4 text-center ${
                      isCurrentPlan
                        ? 'bg-green-50/50 dark:bg-green-900/20'
                        : plan.highlighted 
                          ? `bg-${plan.color || 'blue'}-50/50 dark:bg-${plan.color || 'blue'}-900/20` 
                          : tableColors.headerBg
                    }`}>
                      <Button 
                        className={`w-full ${
                          isCurrentPlan
                            ? 'bg-green-500 hover:bg-green-600'
                            : `bg-${plan.color || 'primary'}-500 hover:bg-${plan.color || 'primary'}-600`
                        } text-white`}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrentPlan}
                      >
                        {processingPlan === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        ) : isCurrentPlan ? (
                          <span className="flex items-center justify-center gap-2">
                            <Check className="h-4 w-4" />
                            Current Plan
                          </span>
                        ) : (
                          'Subscribe'
                        )}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Current Subscription Status */}
      {subscriptionInfo && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Active Subscription</h3>
              <p className="text-green-700 dark:text-green-500">
                You're subscribed to the {subscriptionInfo.plan} plan until{' '}
                {subscriptionInfo.currentPeriodEnd.toLocaleDateString()}
              </p>
            </div>
            <Button onClick={() => setShowManageDialog(true)} variant="outline" className="border-green-500 text-green-700 dark:border-green-600 dark:text-green-500">
              Manage Subscription
            </Button>
          </div>
        </div>
      )}

      {/* Premium Features Grid */}
      <div className="text-center space-y-6">
        <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 rounded-full">
          Premium Features
        </Badge>
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Enhance Your Emotional Journey
        </h2>
        <p className="text-muted-foreground max-w-[700px] mx-auto text-lg">
          Unlock premium features to deepen your emotional awareness and create meaningful connections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="bg-card/50 border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Plan Selection Tabs */}
      <div className="mt-20 space-y-8">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Choose Your Perfect Plan
          </h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto text-lg">
            Select the plan that works best for you and start your premium journey today
          </p>
        </div>

        <Tabs 
          defaultValue="individual" 
          className="w-full" 
          value={planType}
          onValueChange={(value) => setPlanType(value as 'individual' | 'family')}
        >
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-xl font-semibold mb-4">Plan Type</h3>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="individual" className="py-3 px-6">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Individual Plans
                </span>
              </TabsTrigger>
              <TabsTrigger value="family" className="py-3 px-6">
                <span className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4" />
                  Family Plans
                </span>
              </TabsTrigger>
            </TabsList>
            <div className="text-muted-foreground text-sm mb-2">
              {planType === "individual" ? 
                "Access premium features for yourself" : 
                "Share premium features with up to 6 family members"}
            </div>
          </div>
          
          {/* Trial Banner specific to plan type */}
          <div className="mb-10">
            <div className={`bg-gradient-to-r ${
              planType === 'individual' 
                ? 'from-amber-50 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800/30' 
                : 'from-blue-50 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800/30'
            } border rounded-xl overflow-hidden shadow-md`}>
              <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                <div className="flex-1">
                  <Badge variant="secondary" className={`${
                    planType === 'individual'
                      ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  } mb-2`}>
                    Limited Time Offer
                  </Badge>
                  <h3 className={`text-2xl font-bold ${
                    planType === 'individual'
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-blue-800 dark:text-blue-300'
                  } mb-2`}>
                    14-Day Free Trial - {planType === 'individual' ? 'Individual' : 'Family'} Plan
                  </h3>
                  <p className={`${
                    planType === 'individual'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-blue-700 dark:text-blue-400'
                  } mb-4`}>
                    {planType === 'individual' 
                      ? 'Try all premium features without payment or commitment'
                      : 'Share premium features with up to 6 family members'}
                  </p>
                  <ul className="space-y-2 grid md:grid-cols-2 gap-x-6 gap-y-2">
                    {(planType === 'individual' ? 
                      individualPricingOptions.find(p => p.id === 'trial')?.features : 
                      familyPricingOptions.find(p => p.id === 'family-trial')?.features
                    )?.map((feature, index) => (
                      <li key={index} className={`flex items-start text-sm ${
                        planType === 'individual'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}>
                        <Check className={`h-4 w-4 ${
                          planType === 'individual'
                            ? 'text-amber-600 dark:text-amber-500'
                            : 'text-blue-600 dark:text-blue-500'
                        } mr-2 shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:min-w-[180px] flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${
                      planType === 'individual'
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-blue-800 dark:text-blue-300'
                    }`}>FREE</span>
                    <p className={`text-xs ${
                      planType === 'individual'
                        ? 'text-amber-600 dark:text-amber-500'
                        : 'text-blue-600 dark:text-blue-500'
                    }`}>No credit card required</p>
                  </div>
                  <Button 
                    className={`w-full ${
                      planType === 'individual'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-6`}
                    onClick={() => handleSubscribe(planType === 'individual' ? 'trial' : 'family-trial')}
                  >
                    {processingPlan === (planType === 'individual' ? 'trial' : 'family-trial') ? (
                      <>
                        <span className="animate-spin mr-1">
                          <RefreshCw className="h-4 w-4" />
                        </span>
                        Processing...
                      </>
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Period Tabs */}
          <Tabs defaultValue="monthly" className="w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Billing Cycle</h3>
              <p className="text-muted-foreground text-sm mb-2">Choose your preferred payment schedule</p>
            </div>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="monthly" className="py-3">
                <span className="flex items-center gap-2 justify-center">
                  <CalendarClock className="h-4 w-4" />
                  Monthly
                </span>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="py-3">
                <span className="flex items-center gap-2 justify-center">
                  <Calendar className="h-4 w-4" />
                  Yearly
                </span>
              </TabsTrigger>
              <TabsTrigger value="5year" className="py-3">
                <span className="flex items-center gap-2 justify-center">
                  <Star className="h-4 w-4" />
                  5-Year
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly">
              {renderComparisonTable('monthly')}
            </TabsContent>
            
            <TabsContent value="yearly">
              {renderComparisonTable('yearly')}
            </TabsContent>
            
            <TabsContent value="5year">
              {renderComparisonTable('5year')}
            </TabsContent>
          </Tabs>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'creditcard' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('creditcard')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Credit Card</h4>
                  <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or American Express</p>
                </div>
              </div>
            </div>
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-[#0070ba] flex items-center justify-center font-bold">P</div>
                <div>
                  <h4 className="font-medium">PayPal</h4>
                  <p className="text-sm text-muted-foreground">Fast, secure payment with PayPal</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => {
              setShowPaymentDialog(false);
              setProcessingPlan(null);
              setPaymentMethod(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!paymentMethod || !processingPlan}
              className="bg-primary"
            >
              {upgradeSubscriptionMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Your Subscription</DialogTitle>
            <DialogDescription>
              Review and manage your current subscription details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {subscriptionInfo && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">Current Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.plan.charAt(0).toUpperCase() + subscriptionInfo.plan.slice(1)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <div className="flex items-center">
                    <Badge variant="outline" className={
                      subscriptionInfo.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : subscriptionInfo.status === 'trialing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    }>
                      {subscriptionInfo.status.charAt(0).toUpperCase() + subscriptionInfo.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Start Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Next Billing Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.currentPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
                {subscriptionInfo.cancelAt && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Cancellation Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionInfo.cancelAt.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending || (subscriptionInfo?.status === 'canceled')}
            >
              {cancelSubscriptionMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
            <Button onClick={() => setShowManageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}