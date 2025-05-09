import { useSubscription } from '@/hooks/use-subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Check, Crown, Clock, AlertCircle, ChevronRight, 
  Star, CreditCard, Users, Calendar, Gift 
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

export default function SubscriptionStatusSection() {
  const { 
    tier, 
    status, 
    isActive, 
    isTrialing,
    isLifetime,
    expiryDate,
    daysRemaining,
    subscriptionDetails,
    isLoading
  } = useSubscription();
  
  // If user has free tier, show upgrade option
  if (tier === 'free') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Upgrade to unlock premium features and enhance your emotional journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 p-5 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Free Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You're currently using the free version of MoodSync.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm">Basic emotion tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm">Limited journal entries</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm">Essential insights and reports</span>
              </li>
            </ul>
            <Button asChild className="w-full">
              <Link to="/premium">
                Upgrade to Premium
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="p-4 rounded-lg border border-dashed">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Try Premium Free</h4>
                <p className="text-sm text-muted-foreground">
                  Start a 14-day free trial and experience all premium features
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Loading your subscription information...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Extract values from subscriptionDetails
  const {
    startDate = null,
    price: paymentAmount = 0,
    currency = 'USD',
    memberLimit = 1,
    paymentMethod = null,
  } = subscriptionDetails || {};
  
  // Determine plan type based on tier
  const planType = tier === 'family' ? 'family' : 'premium';
  const isTrial = isTrialing;
  
  // Format dates
  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : 'N/A';
  const formattedExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A';
  
  // Determine badge styling based on subscription type
  const getBadgeVariant = () => {
    if (isLifetime) return "default";
    if (isTrial) return "yellow";
    return "blue";
  };
  
  // Get status icon
  const getStatusIcon = () => {
    if (isLifetime) return <Star className="h-4 w-4" />;
    if (isTrial) return <Clock className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };
  
  // Get status text
  const getStatusText = () => {
    if (isLifetime) return "Lifetime";
    if (isTrial) return "Trial";
    return "Active";
  };
  
  // Format plan name for display
  const formatPlanName = (plan: string) => {
    if (!plan) return 'Premium';
    if (plan === 'individual') return 'Premium Individual';
    if (plan === 'family') return 'Premium Family';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          {isTrial 
            ? "You're currently on a free trial" 
            : isLifetime 
              ? "You have lifetime access to premium features" 
              : "Your premium subscription is active"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
              <div className="flex items-center mt-1">
                <p className="text-lg font-medium mr-2">
                  {formatPlanName(planType)}
                </p>
                <Badge variant={getBadgeVariant() as any} className="flex items-center gap-1">
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                <p className="text-base">{formattedStartDate}</p>
              </div>
              
              {!isLifetime && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {isTrial ? 'Trial Ends' : 'Next Billing'}
                  </h4>
                  <p className="text-base">{formattedExpiryDate}</p>
                </div>
              )}
            </div>
            
            {planType === 'family' && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Family Members</h4>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">Up to {memberLimit} accounts</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column */}
          <div className="md:text-right">
            {!isLifetime && paymentMethod && typeof paymentMethod === 'object' && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                <div className="flex items-center mt-1 md:justify-end">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">
                    {paymentMethod.brand || 'Card'} •••• {paymentMethod.last4 || '****'}
                  </p>
                </div>
                {paymentMethod.expiry && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires {paymentMethod.expiry}
                  </p>
                )}
              </div>
            )}
            
            {!isLifetime && paymentAmount > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {isTrial ? 'Price after trial' : 'Subscription Price'}
                </h4>
                <p className="text-base font-medium">
                  {paymentAmount.toFixed(2)} {currency}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          {/* Trial-specific messaging */}
          {isTrial && (
            <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 mb-2">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-500">
                    Trial Period Active
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your free trial ends on {formattedExpiryDate}. Enjoy full premium access during this period.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button asChild variant="outline">
            <Link to="/premium">
              View Subscription Options
            </Link>
          </Button>
          
          <Button asChild>
            <Link to="/settings/billing">
              Manage Subscription
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}