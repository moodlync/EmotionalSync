import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Calendar, Bell, Palette, Users, Shield, Zap, 
  HomeIcon, Sparkles, Clock, CreditCard, AlertCircle, CalendarClock,
  Heart, UserPlus, RefreshCw, HeartHandshake, ArrowRightLeft, Download, Gift, Info,
  Gem, Crown, ArrowBigUp, X
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
      
      // Map the plan type to one of the allowed tier types
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
    const cardColorClass = plan.highlighted 
      ? `border-${plan.color || 'primary'}-400 dark:border-${plan.color || 'primary'}-600 shadow-md` 
      : `border-${plan.color || 'primary'}-200 dark:border-${plan.color || 'primary'}-800/50`;
    
    const headerClass = plan.highlighted 
      ? `bg-gradient-to-b from-${plan.color || 'primary'}-100 to-transparent dark:from-${plan.color || 'primary'}-900/30 dark:to-transparent` 
      : `bg-gradient-to-b from-${plan.color || 'primary'}-50 to-transparent dark:from-${plan.color || 'primary'}-900/20 dark:to-transparent`;
    
    return (
      <Card className={`overflow-hidden ${cardColorClass} h-full flex flex-col`} key={planId}>
        {plan.highlighted && (
          <div className={`absolute top-0 right-0 bg-${plan.color || 'primary'}-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md`}>
            POPULAR
          </div>
        )}
        <CardHeader className={headerClass}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {plan.icon}
              <CardTitle className={`text-${plan.color || 'primary'}-800 dark:text-${plan.color || 'primary'}-300`}>
                {plan.name.split(' ')[0]}
              </CardTitle>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold text-${plan.color || 'primary'}-800 dark:text-${plan.color || 'primary'}-300`}>
                {plan.price}
              </span>
              {cycle !== 'monthly' && plan.savings && (
                <p className={`text-xs text-${plan.color || 'primary'}-600 dark:text-${plan.color || 'primary'}-400 mt-1`}>
                  {plan.savings}
                </p>
              )}
            </div>
          </div>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex-grow">
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className={`h-4 w-4 text-${plan.color || 'primary'}-500 mr-2 shrink-0 mt-0.5`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full bg-${plan.color || 'primary'}-500 hover:bg-${plan.color || 'primary'}-600 text-white`}
            onClick={() => handleSubscribe(planId)}
          >
            {processingPlan === planId ? (
              <>
                <span className="animate-spin mr-1">
                  <RefreshCw className="h-4 w-4" />
                </span>
                Processing...
              </>
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

    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="p-4 text-left bg-gray-50 dark:bg-gray-900 font-medium">Feature</th>
              {filteredPlans.map((plan) => (
                <th key={plan.id} className={`p-4 text-center ${plan.highlighted ? `bg-${plan.color || 'blue'}-50/50 dark:bg-${plan.color || 'blue'}-900/20` : 'bg-gray-50 dark:bg-gray-900'}`}>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      {plan.icon}
                      <span className={`font-bold text-lg text-${plan.color}-600 dark:text-${plan.color}-400`}>
                        {plan.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xl font-bold">{plan.price}</div>
                    {cycle !== 'monthly' && plan.savings && (
                      <Badge variant="outline" className={`mt-2 text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800`}>
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                </th>
              ))}
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
              <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/50" : ""}>
                <td className="p-4 font-medium border-b border-gray-200 dark:border-gray-800">{feature}</td>
                {filteredPlans.map((plan) => {
                  let hasFeature = true;
                  
                  // Logic to determine if this plan has this feature
                  if (plan.tier?.includes('gold') && idx > 3) hasFeature = false;
                  if (plan.tier?.includes('platinum') && idx > 5) hasFeature = false;
                  if (plan.tier?.includes('diamond') && idx > 8) hasFeature = false;

                  return (
                    <td key={plan.id} className={`p-4 text-center border-b border-gray-200 dark:border-gray-800 ${plan.highlighted ? `bg-${plan.color || 'blue'}-50/20 dark:bg-${plan.color || 'blue'}-900/10` : ''}`}>
                      {hasFeature ? (
                        <Check className={`h-5 w-5 mx-auto text-${plan.color || 'primary'}-500`} />
                      ) : (
                        <X className="h-5 w-5 mx-auto text-gray-300 dark:text-gray-700" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {/* Action row */}
            <tr>
              <td className="p-4 bg-gray-50 dark:bg-gray-900"></td>
              {filteredPlans.map((plan) => (
                <td key={plan.id} className={`p-4 text-center ${plan.highlighted ? `bg-${plan.color || 'blue'}-50/50 dark:bg-${plan.color || 'blue'}-900/20` : 'bg-gray-50 dark:bg-gray-900'}`}>
                  <Button 
                    className={`w-full bg-${plan.color || 'primary'}-500 hover:bg-${plan.color || 'primary'}-600 text-white`}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {processingPlan === plan.id ? 
                      <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Processing...</> : 
                      'Subscribe'}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
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
          
          {/* Common Trial Banner for both individual and family */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/30 rounded-xl overflow-hidden shadow-md">
              <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mb-2">
                    Limited Time Offer
                  </Badge>
                  <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-2">
                    14-Day Free Trial - {planType === 'individual' ? 'Individual' : 'Family'} Plan
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400 mb-4">
                    Try all premium features without payment or commitment
                  </p>
                  <ul className="space-y-2 grid md:grid-cols-2 gap-x-6 gap-y-2">
                    {(planType === 'individual' ? 
                      individualPricingOptions.find(p => p.id === 'trial')?.features : 
                      familyPricingOptions.find(p => p.id === 'family-trial')?.features
                    )?.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-amber-700 dark:text-amber-400">
                        <Check className="h-4 w-4 text-amber-600 dark:text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:min-w-[180px] flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-amber-800 dark:text-amber-300">FREE</span>
                    <p className="text-xs text-amber-600 dark:text-amber-500">No credit card required</p>
                  </div>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white px-6" 
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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="5year">5-Year</TabsTrigger>
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