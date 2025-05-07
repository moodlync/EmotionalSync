import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Calendar, Bell, Palette, Users, Shield, Zap, 
  HomeIcon, Sparkles, Clock, CreditCard, AlertCircle, CalendarClock,
  Heart, UserPlus, RefreshCw, HeartHandshake, ArrowRightLeft, Download, Gift, Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: string;
  savings?: string;
  features: string[];
  popular?: boolean;
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
  const [selectedPlan, setSelectedPlan] = useState<string>('trial');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'creditcard' | 'paypal' | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [planType, setPlanType] = useState<'individual' | 'family'>('individual');
  
  // Mock subscription data - in a real app, this would come from your backend
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  
  // For demo purposes only - in a real app, you'd get this from your backend
  const demoSubscription: SubscriptionInfo = {
    id: 'sub_123456789',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    plan: 'monthly',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
  };

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
      popular: true
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      popular: true
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
    setProcessingPlan(planId);
    setShowPaymentDialog(true);
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
  };
  
  const handlePayment = () => {
    // In a real application, this would process the payment using Stripe, PayPal, etc.
    console.log(`Processing payment for ${processingPlan} plan using ${paymentMethod}`);
    
    // Simulate successful payment and subscription creation
    setTimeout(() => {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
      
      setSubscriptionInfo({
        id: `sub_${Math.random().toString(36).substring(2, 15)}`,
        status: 'trialing',
        currentPeriodEnd: trialEndDate,
        plan: processingPlan || 'trial',
        startDate: new Date()
      });
      
      setShowPaymentDialog(false);
      setProcessingPlan(null);
      setPaymentMethod(null);
    }, 1500);
  };
  
  const handleCancelSubscription = () => {
    // In a real application, this would call your backend to cancel the subscription
    if (subscriptionInfo) {
      // Calculate the end date (current period end)
      const cancelAtDate = subscriptionInfo.currentPeriodEnd;
      
      // Update subscription status to show it's been canceled
      setSubscriptionInfo({
        ...subscriptionInfo,
        status: 'canceled',
        cancelAt: cancelAtDate
      });
      
      setShowManageDialog(false);
    }
  };

  return (
    <div className="space-y-8">
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
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 rounded-full">
          Premium Features
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">Enhance Your Emotional Journey</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Unlock premium features to deepen your emotional awareness and connections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="bg-card/50 border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
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
      <div className="mt-16 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Select the plan that works best for you and start your premium journey today
          </p>
        </div>

        <Tabs 
          defaultValue="individual" 
          className="w-full" 
          value={planType}
          onValueChange={(value) => setPlanType(value as 'individual' | 'family')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" className="py-3">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Individual Plans
              </span>
            </TabsTrigger>
            <TabsTrigger value="family" className="py-3">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Family Plans
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="space-y-6">
            {/* Individual Trial */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/30 rounded-xl overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mb-2">Limited Time Offer</Badge>
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-1">14-Day Free Trial</h3>
                  <p className="text-amber-700 dark:text-amber-400 mb-3">Try all premium features without payment or commitment</p>
                  <ul className="space-y-1.5">
                    {individualPricingOptions[0].features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-amber-700 dark:text-amber-400">
                        <Check className="h-4 w-4 text-amber-600 dark:text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber-800 dark:text-amber-300">FREE</span>
                    <p className="text-xs text-amber-600 dark:text-amber-500">No credit card required</p>
                  </div>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
                    onClick={() => {
                      setSelectedPlan('trial');
                      setShowPaymentDialog(true);
                      setProcessingPlan('trial');
                    }}
                  >
                    {processingPlan === 'trial' ? (
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
            
            {/* Individual Plan Duration Tabs */}
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
                <TabsTrigger value="5year">5-Year</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gold Monthly */}
                  <Card className="overflow-hidden border-amber-200 dark:border-amber-800/50">
                    <CardHeader className="bg-gradient-to-b from-amber-50 to-transparent dark:from-amber-900/20 dark:to-transparent">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-amber-800 dark:text-amber-300">Gold</CardTitle>
                        <span className="text-lg font-bold text-amber-800 dark:text-amber-300">${individualPricingOptions.find(p => p.id === 'gold-monthly')?.price.replace('$', '')}</span>
                      </div>
                      <CardDescription>{individualPricingOptions.find(p => p.id === 'gold-monthly')?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {individualPricingOptions.find(p => p.id === 'gold-monthly')?.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => {
                          setSelectedPlan('gold-monthly');
                          setShowPaymentDialog(true);
                          setProcessingPlan('gold-monthly');
                        }}
                      >
                        {processingPlan === 'gold-monthly' ? (
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
                  
                  {/* Platinum Monthly */}
                  <Card className="overflow-hidden border-violet-200 dark:border-violet-800/50">
                    <CardHeader className="bg-gradient-to-b from-violet-50 to-transparent dark:from-violet-900/20 dark:to-transparent">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-violet-800 dark:text-violet-300">Platinum</CardTitle>
                        <span className="text-lg font-bold text-violet-800 dark:text-violet-300">${individualPricingOptions.find(p => p.id === 'platinum-monthly')?.price.replace('$', '')}</span>
                      </div>
                      <CardDescription>{individualPricingOptions.find(p => p.id === 'platinum-monthly')?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {individualPricingOptions.find(p => p.id === 'platinum-monthly')?.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-violet-500 mr-2 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-violet-500 hover:bg-violet-600 text-white"
                        onClick={() => {
                          setSelectedPlan('platinum-monthly');
                          setShowPaymentDialog(true);
                          setProcessingPlan('platinum-monthly');
                        }}
                      >
                        {processingPlan === 'platinum-monthly' ? (
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
                  
                  {/* Diamond Monthly */}
                  <Card className="overflow-hidden border-cyan-200 dark:border-cyan-800/50">
                    <CardHeader className="bg-gradient-to-b from-cyan-50 to-transparent dark:from-cyan-900/20 dark:to-transparent">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-cyan-800 dark:text-cyan-300">Diamond</CardTitle>
                        <span className="text-lg font-bold text-cyan-800 dark:text-cyan-300">${individualPricingOptions.find(p => p.id === 'diamond-monthly')?.price.replace('$', '')}</span>
                      </div>
                      <CardDescription>{individualPricingOptions.find(p => p.id === 'diamond-monthly')?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {individualPricingOptions.find(p => p.id === 'diamond-monthly')?.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-cyan-500 mr-2 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={() => {
                          setSelectedPlan('diamond-monthly');
                          setShowPaymentDialog(true);
                          setProcessingPlan('diamond-monthly');
                        }}
                      >
                        {processingPlan === 'diamond-monthly' ? (
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
                  
                  {/* Legacy Monthly */}
                  <Card className="overflow-hidden border-indigo-200 dark:border-indigo-800/50">
                    <CardHeader className="bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-indigo-800 dark:text-indigo-300">Legacy</CardTitle>
                        <span className="text-lg font-bold text-indigo-800 dark:text-indigo-300">${individualPricingOptions.find(p => p.id === 'legacy-monthly')?.price.replace('$', '')}</span>
                      </div>
                      <CardDescription>{individualPricingOptions.find(p => p.id === 'legacy-monthly')?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {individualPricingOptions.find(p => p.id === 'legacy-monthly')?.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={() => {
                          setSelectedPlan('legacy-monthly');
                          setShowPaymentDialog(true);
                          setProcessingPlan('legacy-monthly');
                        }}
                      >
                        {processingPlan === 'legacy-monthly' ? (
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
                </div>
              </TabsContent>
              
              <TabsContent value="yearly" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gold Yearly */}
                  <Card className="overflow-hidden border-amber-200 dark:border-amber-800/50">
                    <CardHeader className="bg-gradient-to-b from-amber-50 to-transparent dark:from-amber-900/20 dark:to-transparent">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-amber-800 dark:text-amber-300">Gold Yearly</CardTitle>
                        <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mb-2">Save ${individualPricingOptions.find(p => p.id === 'gold-yearly')?.savings?.replace('Save $', '').replace('/mo', '')}/mo</Badge>
                      </div>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-amber-800 dark:text-amber-300">${individualPricingOptions.find(p => p.id === 'gold-yearly')?.price.replace('$', '')}</span>
                        <span className="text-sm text-muted-foreground ml-1">per year</span>
                      </div>
                      <CardDescription>{individualPricingOptions.find(p => p.id === 'gold-yearly')?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {individualPricingOptions.find(p => p.id === 'gold-yearly')?.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => {
                          setSelectedPlan('gold-yearly');
                          setShowPaymentDialog(true);
                          setProcessingPlan('gold-yearly');
                        }}
                      >
                        {processingPlan === 'gold-yearly' ? (
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
                  
                  {/* Other yearly plans would go here */}
                </div>
              </TabsContent>
              
              <TabsContent value="5year" className="space-y-6">
                <div className="col-span-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    5-Year Plans
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our 5-year plans offer the best long-term value with maximum savings. Choose from Gold ($249.99), Platinum ($369.99), Diamond ($499.99), or Legacy ($699.99) tiers.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
              <p className="flex items-start">
                <Info className="h-5 w-5 mr-2 shrink-0" />
                All plans include a 30-day money-back guarantee. You can cancel or change your subscription at any time.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="family" className="space-y-6">
            {/* Family Plans Description */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Family Plans
              </h3>
              <p className="text-blue-700 dark:text-blue-500">
                Share the MoodSync experience with up to 6 family members. Monitor family members' emotional health (with consent) and build stronger connections.
              </p>
            </div>
            
            {/* Family Trial Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/70 dark:from-indigo-900/20 dark:to-indigo-800/10 border border-indigo-200 dark:border-indigo-800/30 rounded-xl overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mb-2">Family Offer</Badge>
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-1">Family 14-Day Free Trial</h3>
                  <p className="text-indigo-700 dark:text-indigo-400 mb-3">Experience premium family features without commitment</p>
                  <ul className="space-y-1.5">
                    {familyPricingOptions[0].features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-indigo-700 dark:text-indigo-400">
                        <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">FREE</span>
                    <p className="text-xs text-indigo-600 dark:text-indigo-500">No credit card required</p>
                  </div>
                  <Button 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" 
                    onClick={() => {
                      setSelectedPlan('family-trial');
                      setShowPaymentDialog(true);
                      setProcessingPlan('family-trial');
                    }}
                  >
                    {processingPlan === 'family-trial' ? (
                      <>
                        <span className="animate-spin mr-1">
                          <RefreshCw className="h-4 w-4" />
                        </span>
                        Processing...
                      </>
                    ) : (
                      'Start Family Trial'
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Family Plan Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold border-b">Plan</th>
                    <th className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold border-b">Monthly</th>
                    <th className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold border-b">Yearly</th>
                    <th className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold border-b">5-Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 border-b text-blue-700 dark:text-blue-400 font-medium">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-amber-400 mr-2"></div>
                        Family Gold
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$14.99</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-gold-monthly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$149.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $5/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-gold-yearly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$299.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $10/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-gold-5year');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 border-b text-blue-700 dark:text-blue-400 font-medium">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-cyan-400 mr-2"></div>
                        Family Diamond
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$19.99</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-diamond-monthly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$249.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $10.84/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-diamond-yearly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$449.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $12.50/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-diamond-5year');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 border-b text-blue-700 dark:text-blue-400 font-medium">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-indigo-400 mr-2"></div>
                        Family Legacy
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$24.99</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-legacy-monthly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$399.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $20.83/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-legacy-yearly');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <div className="font-semibold">$699.99</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Save $23.33/mo</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 text-xs"
                        onClick={() => {
                          setSelectedPlan('family-legacy-5year');
                          setShowPaymentDialog(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Please select your preferred payment method to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Plan: {processingPlan}</h3>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className={`justify-start ${paymentMethod === 'creditcard' ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => setPaymentMethod('creditcard')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Credit or Debit Card</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`justify-start ${paymentMethod === 'paypal' ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42c-.871 5.767-5.184 7.355-9.611 7.355H9.34l-1.12 7.13a.638.638 0 0 1-.63.514H4.981l-.031.198c-.072.432.253.823.69.823h4.601c.524 0 .969-.382 1.05-.9l1.052-6.59c.023-.14.047-.288.077-.437.982-5.052 4.347-6.797 8.646-6.797h2.19c.524 0 .968-.382 1.05-.9L24.11.901C24.109.901 22.029 6.055 21.222 6.917z" />
                  </svg>
                  <span>PayPal</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!paymentMethod || processingPlan === null}
              className={!paymentMethod || processingPlan === null ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Continue
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
              {subscriptionInfo && (
                <span>
                  You're currently on the <strong>{subscriptionInfo.plan}</strong> plan.
                  {subscriptionInfo.status === 'canceled' ? (
                    <span className="text-red-500 block mt-1">
                      Your subscription will end on {subscriptionInfo.cancelAt?.toLocaleDateString()}.
                    </span>
                  ) : null}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setShowManageDialog(false);
                  // Here you would show a dialog to change plans
                }}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                <span>Change Plan</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // In a real app this would download the invoice
                  alert('Downloading invoices...');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                <span>Download Invoices</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // In a real app this would show payment method management
                  alert('Managing payment methods...');
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Manage Payment Methods</span>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleCancelSubscription}
                disabled={subscriptionInfo?.status === 'canceled'}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Cancel Subscription</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowManageDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}