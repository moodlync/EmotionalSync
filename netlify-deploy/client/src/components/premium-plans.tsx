import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, Star, Calendar, Bell, Palette, Users, Shield, Zap, 
  HomeIcon, Sparkles, Clock, CreditCard, AlertCircle, CalendarClock,
  Heart, UserPlus, RefreshCw, HeartHandshake, ArrowRightLeft, Download, Gift
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

  // Define pricing options
  const pricingOptions: PricingOption[] = [
    {
      id: 'trial',
      name: '7-Day Free Trial',
      description: 'Try all premium features before committing',
      price: 'Free',
      features: [
        'Full premium access for 7 days',
        'No charges if cancelled during trial',
        'No commitment required'
      ],
      popular: true
    },
    {
      id: 'monthly',
      name: 'Monthly',
      description: 'Perfect for exploring premium features',
      price: '$9.99',
      features: [
        'All premium features',
        'Cancel anytime',
        'Regular updates',
        'NFT collection access'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      description: 'Get a discount with a 3-month commitment',
      price: '$14.99',
      savings: 'Save $15',
      features: [
        'All premium features',
        'Priority support',
        'Quarterly savings',
        'Daily wellness tips'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      description: 'Best value for long-term users',
      price: '$49.99',
      savings: 'Save $70',
      features: [
        'All premium features',
        'Priority support',
        'Maximum annual savings',
        'Exclusive annual NFTs'
      ]
    },
    {
      id: 'five-year',
      name: '5-Year Plan',
      description: 'Extended coverage with significant savings',
      price: '$199.99',
      savings: 'Save $299',
      features: [
        'All premium features for 5 years',
        'VIP priority support',
        'Exclusive NFT collections',
        'Yearly milestone rewards'
      ]
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      description: 'One-time payment for permanent access',
      price: '$249.99',
      features: [
        'All premium features forever',
        'Future updates included',
        'Best long-term value',
        'Exclusive lifetime NFTs'
      ]
    },
    {
      id: 'family-annual',
      name: 'Family Annual',
      description: 'Connect with loved ones and track moods with consent',
      price: '$149.99/year',
      features: [
        'All premium features for up to 5 family members',
        'Track loved ones\' moods with consent',
        'Token sharing among family members',
        'Family member management'
      ]
    },
    {
      id: 'family-five-year',
      name: 'Family 5-Year',
      description: 'Extended family coverage with significant savings',
      price: '$349.99',
      features: [
        '5-year access for up to 5 family members',
        'All premium family features',
        'Family token pooling system',
        'Exclusive family NFTs'
      ]
    },
    {
      id: 'family-lifetime',
      name: 'Family Lifetime',
      description: 'Permanent access to family features with one payment',
      price: '$499.99',
      features: [
        'Lifetime access for up to 5 family members',
        'All future updates included',
        'Family member management',
        'Best value for families'
      ]
    }
  ];

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
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 rounded-full">
          Premium Features
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">Enhance Your Emotional Journey</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Unlock premium features to deepen your emotional awareness and connections
        </p>
      </div>

      {/* Premium Features Grid */}
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

      {/* Pricing Plans */}
      <div className="mt-16 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Select the plan that works best for you and start your premium journey today
          </p>
        </div>

        <Tabs defaultValue="trial" className="w-full" value={selectedPlan} onValueChange={handleSelectPlan}>
          <div className="flex justify-center mb-8 overflow-x-auto">
            <TabsList className="grid-cols-9" style={{ gridTemplateColumns: "repeat(9, minmax(0, 1fr))" }}>
              <TabsTrigger value="trial" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Trial
              </TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
              <TabsTrigger value="five-year">5-Year</TabsTrigger>
              <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
              <TabsTrigger value="family-annual">Family Annual</TabsTrigger>
              <TabsTrigger value="family-five-year">Family 5-Year</TabsTrigger>
              <TabsTrigger value="family-lifetime">Family Lifetime</TabsTrigger>
            </TabsList>
          </div>

          {pricingOptions.map((option) => (
            <TabsContent key={option.id} value={option.id} className="space-y-4">
              <Card className={`w-full max-w-md mx-auto ${option.popular ? 'border-primary' : ''}`}>
                {option.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <Badge className="bg-primary text-white">Popular Choice</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{option.name}</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{option.price}</div>
                      {option.savings && (
                        <div className="text-sm text-green-600 font-medium">{option.savings}</div>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(option.id)}
                    variant={option.popular ? "default" : "outline"}
                  >
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Family Plan Details */}
      <Card className="border-primary/20 mt-12 overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">Family Feature</Badge>
        </div>
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Family Plan - Connect With Your Loved Ones
          </CardTitle>
          <CardDescription>
            Track and support your family members' emotional well-being with their consent
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-2">Family Plan Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Up to 5 family members included in your subscription</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Track loved ones' emotional status with their consent</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Crisis support integration for better family care</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>All premium features available for each family member</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Token sharing system for all family members</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Token redemption by primary account holder</span>
                </li>
              </ul>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => handleSelectPlan('family-annual')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  Family Annual - $149.99
                </Button>
                <Button 
                  onClick={() => handleSelectPlan('family-five-year')}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Family 5-Year - $349.99
                </Button>
                <Button 
                  onClick={() => handleSelectPlan('family-lifetime')}
                  variant="outline"
                  className="border-pink-300 text-pink-700 hover:bg-pink-50"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Family Lifetime - $499.99
                </Button>
              </div>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-dashed pt-6 md:pt-0 md:pl-6">
              <h3 className="text-lg font-medium mb-4">How To Add Family Members</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Share your referral link</p>
                    <p className="text-sm text-muted-foreground">Invite your loved ones to join MoodSync using your unique referral link</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Get their username</p>
                    <p className="text-sm text-muted-foreground">Ask them to share the username they created during registration</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Add them to your family group</p>
                    <p className="text-sm text-muted-foreground">Search for their username and send a family connection request</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                  <div>
                    <p className="font-medium">Wait for their consent</p>
                    <p className="text-sm text-muted-foreground">They must approve your request before you can see their emotional data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</div>
                  <div>
                    <p className="font-medium">Manage tokens and features</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 mt-1">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" /> <span className="text-blue-500 font-medium">Transfer</span> - Move tokens between family members
                      </span>
                      <span className="flex items-center gap-1 mt-1">
                        <Download className="h-3.5 w-3.5 text-green-500" /> <span className="text-green-500 font-medium">Redeem</span> - Exchange tokens for rewards
                      </span>
                      <span className="flex items-center gap-1 mt-1">
                        <Gift className="h-3.5 w-3.5 text-purple-500" /> <span className="text-purple-500 font-medium">Donate</span> - Give tokens to charity
                      </span>
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise/Group Plans */}
      <Card className="border-dashed border-primary/20 mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Enterprise & Group Plans
          </CardTitle>
          <CardDescription>
            Tailored packages for workplaces, healthcare providers, and organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Looking to bring MoodSync to your organization? We offer customized solutions with features like:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Team mood analytics and insights</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Wellness program integration</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Administrative dashboard and controls</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Patient/client emotional tracking</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Contact Us for a Quote</Button>
        </CardFooter>
      </Card>

      {/* Current Subscription Info */}
      {subscriptionInfo && (
        <Card className="mt-8 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Your Subscription
            </CardTitle>
            <CardDescription>
              {subscriptionInfo.status === 'trialing' 
                ? "You're currently on a free trial" 
                : subscriptionInfo.status === 'active'
                  ? "You have an active subscription"
                  : "Your subscription will end soon"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Plan</h4>
                <p className="text-lg capitalize">{subscriptionInfo.plan}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <p className="text-lg capitalize">
                  {subscriptionInfo.status === 'trialing' && (
                    <span className="text-blue-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Trial
                    </span>
                  )}
                  {subscriptionInfo.status === 'active' && (
                    <span className="text-green-500 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Active
                    </span>
                  )}
                  {subscriptionInfo.status === 'canceled' && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Ending soon
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Start Date</h4>
                <p>{subscriptionInfo.startDate.toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">
                  {subscriptionInfo.status === 'trialing' ? 'Trial Ends' : 'Current Period Ends'}
                </h4>
                <p>{subscriptionInfo.currentPeriodEnd.toLocaleDateString()}</p>
              </div>
            </div>
            
            {subscriptionInfo.cancelAt && (
              <div className="bg-orange-50 p-4 rounded-md border border-orange-200 mt-4">
                <h4 className="font-medium text-orange-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Subscription Ending Soon
                </h4>
                <p className="text-sm text-orange-600 mt-1">
                  Your subscription will end on {subscriptionInfo.cancelAt.toLocaleDateString()}. 
                  You won't be charged after this date.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!subscriptionInfo.cancelAt && (
              <Button 
                variant="outline" 
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => setShowManageDialog(true)}
              >
                Manage Subscription
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Payment & Subscription Dialogs */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              {processingPlan === 'trial' 
                ? "Enter your payment details to start your 7-day free trial. You won't be charged until the trial ends." 
                : `Complete your payment to subscribe to the ${processingPlan} plan.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Payment Method</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  variant={paymentMethod === 'creditcard' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => setPaymentMethod('creditcard')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </Button>
                <Button 
                  type="button" 
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.45 8.03c.165-.465.285-.945.285-1.425 0-2.475-2.34-4.5-5.55-4.5h-6.12c-.36 0-.69.21-.84.525L3.6 14.955c-.075.18-.06.375.03.54.09.165.255.285.435.285h2.64l-.675 3.27c-.06.18-.03.375.075.525.105.15.27.24.45.24h3.27c.36 0 .675-.24.78-.6l1.05-4.665 3.21-.015c3.21 0 5.385-2.025 5.4-4.5 0-.795-.195-1.485-.54-2.07z" />
                  </svg>
                  PayPal
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'creditcard' && (
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="card-name" className="text-sm font-medium">Name on Card</label>
                  <input
                    id="card-name"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="John Smith"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="card-number" className="text-sm font-medium">Card Number</label>
                  <input
                    id="card-number"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="expiry" className="text-sm font-medium">Expiration Date</label>
                    <input
                      id="expiry"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="cvv" className="text-sm font-medium">CVV</label>
                    <input
                      id="cvv"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'paypal' && (
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-gray-600">
                  You'll be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-700">
                {processingPlan === 'trial' 
                  ? "Your free trial will last for 7 days. If you cancel before the trial ends, you won't be charged."
                  : "You can cancel your subscription at any time. You'll only be charged for the period you've used."}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowPaymentDialog(false);
                setProcessingPlan(null);
                setPaymentMethod(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handlePayment}
              disabled={!paymentMethod}
            >
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Your Subscription</DialogTitle>
            <DialogDescription>
              You can cancel your subscription at any time. You'll still have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Plan:</span>
                  <span className="text-sm capitalize">{subscriptionInfo?.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm capitalize">{subscriptionInfo?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current period ends:</span>
                  <span className="text-sm">{subscriptionInfo?.currentPeriodEnd.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-4">
              <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                <h4 className="font-medium text-orange-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Cancel Subscription
                </h4>
                <p className="text-sm text-orange-600 mt-1">
                  If you cancel, your subscription will remain active until {subscriptionInfo?.currentPeriodEnd.toLocaleDateString()}.
                  After that, you'll lose access to premium features.
                  {subscriptionInfo?.status === 'trialing' && " Since you're on a trial, you won't be charged if you cancel now."}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowManageDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ or additional info could go here */}
    </div>
  );
}