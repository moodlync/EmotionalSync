import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Check, Clock, Gift, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';

interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  interval: 'monthly' | 'yearly' | 'lifetime';
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

export default function PremiumSubscriptionTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');

  // We'll implement a proper subscription endpoint later
  // For now, we'll use the user's premium status
  const { data: subscriptionInfo, isLoading: isLoadingSubscription } = useQuery<SubscriptionInfo | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      if (!user?.isPremium) return null;
      
      // Use the user's premium status to generate subscription info
      return {
        id: `sub_${user.id}`,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        plan: 'yearly',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      };
    },
    enabled: !!user,
  });

  // Activate premium mutation
  const activatePremiumMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate premium');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Premium Activated',
        description: 'Your premium subscription has been activated successfully!',
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Activation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Available plans
  const pricingOptions: PricingOption[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      description: 'Best for trying out premium features',
      price: '$9.99',
      interval: 'monthly',
      features: [
        'Unlimited mood tracking',
        'Advanced analytics',
        'Ad-free experience',
        'Personalized wellness content',
        'AI-powered video editor',
        'Smart home integration',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      description: 'Our most popular plan',
      price: '$89.99',
      originalPrice: '$119.88',
      interval: 'yearly',
      savings: 'Save 25%',
      features: [
        'All Monthly features',
        'Exclusive premium badges',
        'Early access to new features',
        'Priority support',
        'Enhanced data insights',
      ],
      popular: true,
    },
    {
      id: 'family',
      name: 'Family Plan',
      description: 'Support your loved ones',
      price: '$149.99',
      interval: 'yearly',
      features: [
        'All Yearly features',
        'Up to 5 family members',
        'Mood tracking with consent',
        'Token sharing between family',
        'Family wellness insights',
        'Crisis support integration',
      ],
    },
    {
      id: 'family-lifetime',
      name: 'Family Lifetime',
      description: 'Lifetime wellness for the whole family',
      price: '$399.99',
      interval: 'lifetime',
      features: [
        'All Family Plan features',
        'One-time payment',
        'Never expires',
        'Lifetime access for all members',
        'Priority family support',
        'Exclusive family activities',
      ],
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      description: 'For true commitment to emotional wellness',
      price: '$109.99',
      interval: 'lifetime',
      features: [
        'All Yearly features',
        'One-time payment',
        'Never expires',
        'Lifetime access to all future updates',
        'VIP community access',
      ],
    },
  ];

  const selectedPlanDetails = pricingOptions.find(option => option.id === selectedPlan) || pricingOptions[1];
  const [, setLocation] = useLocation();

  const handleSubscribe = () => {
    // Redirect to checkout page with the selected plan
    setLocation(`/checkout/${selectedPlan}`);
  };

  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center h-52">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user already has premium
  if (user?.isPremium || subscriptionInfo) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <CardTitle>Premium Active</CardTitle>
            </div>
            <CardDescription className="text-white/80">
              Enjoy all premium features and benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-muted/40 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionInfo?.plan.charAt(0).toUpperCase() + subscriptionInfo?.plan.slice(1) || 'Lifetime'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                
                {subscriptionInfo?.currentPeriodEnd && (
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Renews on {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Premium Benefits</h3>
                <ul className="space-y-2">
                  {pricingOptions
                    .find(option => option.id === (subscriptionInfo?.plan || 'lifetime'))
                    ?.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about your subscription or need support, our team is here to help.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For non-premium users, show subscription options
  return (
    <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <Gift className="h-4 w-4 text-blue-500" />
        <AlertTitle>Upgrade to Premium</AlertTitle>
        <AlertDescription>
          Unlock advanced features and enhanced emotional wellness tools
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={selectedPlan} onValueChange={setSelectedPlan} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="monthly"
            className={pricingOptions[0].popular ? 'relative' : ''}
          >
            {pricingOptions[0].popular && (
              <span className="absolute -top-7 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            {pricingOptions[0].name}
          </TabsTrigger>
          <TabsTrigger 
            value="yearly"
            className={pricingOptions[1].popular ? 'relative' : ''}
          >
            {pricingOptions[1].popular && (
              <span className="absolute -top-7 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            {pricingOptions[1].name}
          </TabsTrigger>
          <TabsTrigger 
            value="family"
            className={pricingOptions[2].popular ? 'relative' : ''}
          >
            {pricingOptions[2].popular && (
              <span className="absolute -top-7 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            Family
          </TabsTrigger>
          <TabsTrigger 
            value="family-lifetime"
            className={pricingOptions[3].popular ? 'relative' : ''}
          >
            {pricingOptions[3].popular && (
              <span className="absolute -top-7 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            Family Lifetime
          </TabsTrigger>
          <TabsTrigger 
            value="lifetime"
            className={pricingOptions[4].popular ? 'relative' : ''}
          >
            {pricingOptions[4].popular && (
              <span className="absolute -top-7 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            Lifetime
          </TabsTrigger>
        </TabsList>

        {pricingOptions.map(option => (
          <TabsContent key={option.id} value={option.id} className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-baseline">
                  <span className="text-3xl font-bold">{option.price}</span>
                  {option.interval !== 'lifetime' && (
                    <span className="text-sm text-muted-foreground ml-2">/{option.interval}</span>
                  )}
                </CardTitle>
                {option.originalPrice && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm line-through text-muted-foreground">{option.originalPrice}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                      {option.savings}
                    </Badge>
                  </div>
                )}
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={activatePremiumMutation.isPending}
                >
                  {activatePremiumMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Subscribe Now
                </Button>
                
                <div className="text-xs text-center text-muted-foreground">
                  Secure payment processing. Cancel anytime.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
        
        <div className="space-y-3">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-1">What happens after I subscribe?</h4>
            <p className="text-sm text-muted-foreground">
              After subscribing, you'll immediately get access to all premium features. Your subscription will automatically renew at the end of your billing period.
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Can I cancel my subscription?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-1">What's the difference between plans?</h4>
            <p className="text-sm text-muted-foreground">
              Individual plans give you access to all premium features for yourself. Family plans include all premium features plus special family-focused tools like mood tracking with consent, family token sharing, and up to 5 family members. The Yearly and Lifetime options offer significant savings compared to monthly payments.
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-1">What is the AI-powered video editor?</h4>
            <p className="text-sm text-muted-foreground">
              Our professional video editor is a premium feature that allows you to create high-quality educational and wellness videos. It includes AI tools for automatic captioning, content enhancement, background music generation, text-to-speech, and content safety filtering. All premium plans include full access to the video editor.
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-1">How does the Family Plan work?</h4>
            <p className="text-sm text-muted-foreground">
              With the Family Plan, you can invite up to 5 family members to join your plan. Family members need to consent to mood tracking, and you'll be able to see their emotional wellness data if they allow it. Family members can also transfer tokens to each other for redemption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}