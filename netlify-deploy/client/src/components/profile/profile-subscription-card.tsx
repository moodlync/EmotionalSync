import { useSubscription } from '@/hooks/use-subscription';
import { TierFeature } from '@/hooks/use-subscription';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Crown,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

export function ProfileSubscriptionCard() {
  const { 
    tier, 
    status, 
    isActive, 
    isTrialing,
    isLifetime,
    daysRemaining, 
    expiryDate,
    subscriptionDetails,
    cancelSubscriptionMutation 
  } = useSubscription();
  
  const [autoRenew, setAutoRenew] = useState(true);
  
  // Get premium features (ones that are available)
  const availableFeatures = subscriptionDetails?.features.filter(f => f.available) || [];
  
  // Get all features for comparison
  const allFeatures = subscriptionDetails?.features || [];
  
  // Format the subscription expiry date
  const formattedExpiryDate = expiryDate 
    ? format(expiryDate, 'MMMM d, yyyy')
    : 'N/A';
  
  const formattedStartDate = subscriptionDetails?.startDate
    ? format(subscriptionDetails.startDate, 'MMMM d, yyyy')
    : 'N/A';
  
  // Determine the badge color based on the subscription status
  const getBadgeVariant = () => {
    if (isLifetime) return "purple";
    if (isTrialing) return "yellow";
    if (isActive) return "green";
    return "destructive";
  };
  
  // Get the subscription status text
  const getStatusText = () => {
    if (isLifetime) return "Lifetime";
    if (isTrialing) return "Trial";
    if (isActive) return "Active";
    return "Inactive";
  };
  
  // Handle the cancellation of the subscription
  const handleCancel = () => {
    cancelSubscriptionMutation.mutate();
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Subscription
              {tier !== 'free' && <Crown className="h-5 w-5 text-amber-500" />}
            </CardTitle>
            <CardDescription>
              View and manage your subscription details
            </CardDescription>
          </div>
          
          {tier !== 'free' && (
            <Badge 
              variant={getBadgeVariant() as "default" | "secondary" | "destructive" | "outline"} 
              className="ml-auto"
            >
              {getStatusText()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {tier === 'free' ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You are currently on the free plan.
              Upgrade to unlock premium features.
            </p>
            <Button className="w-full sm:w-auto" variant="default">
              View Premium Plans
            </Button>
          </div>
        ) : (
          <>
            {/* Subscription Details */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  PLAN DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} 
                      {isTrialing && ' (Trial)'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">{subscriptionDetails?.price}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Started On</p>
                    <p className="text-sm text-muted-foreground">{formattedStartDate}</p>
                  </div>
                  
                  {!isLifetime && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {isTrialing ? 'Trial Ends On' : 'Next Billing Date'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {formattedExpiryDate}
                        {daysRemaining !== null && daysRemaining <= 5 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Your subscription {isTrialing ? 'trial' : 'period'} ends in {daysRemaining} days</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {!isLifetime && (
                    <div className="space-y-1 col-span-2">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="auto-renew" className="flex flex-col space-y-1 cursor-pointer">
                          <span>Auto-renew subscription</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            {autoRenew 
                              ? 'Your subscription will automatically renew' 
                              : 'Your subscription will expire at the end of the current period'}
                          </span>
                        </Label>
                        <Switch
                          id="auto-renew"
                          checked={autoRenew}
                          onCheckedChange={setAutoRenew}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Payment Method */}
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                PAYMENT METHOD
              </h3>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="bg-background p-2 rounded">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/25</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <span className="sr-only">Edit payment method</span>
                  Edit
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Included Features */}
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                INCLUDED FEATURES
              </h3>
              <div className="grid gap-2">
                {availableFeatures.length > 0 ? (
                  availableFeatures.map((feature: TierFeature) => (
                    <div 
                      key={feature.id} 
                      className="flex items-start gap-2 p-2 rounded-md transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No premium features available</p>
                )}
              </div>
            </div>
            
            {/* Unavailable Features */}
            {allFeatures.filter(f => !f.available).length > 0 && (
              <>
                <Separator />
                <div className="grid gap-2">
                  <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    UPGRADE TO UNLOCK
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Features available in higher tier plans</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="grid gap-2">
                    {allFeatures
                      .filter(f => !f.available)
                      .slice(0, 3) // Show only the first 3 unavailable features
                      .map((feature: TierFeature) => (
                        <div 
                          key={feature.id} 
                          className="flex items-start gap-2 p-2 rounded-md text-muted-foreground"
                        >
                          <XCircle className="h-5 w-5 text-muted mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{feature.name}</p>
                            <p className="text-xs">{feature.description}</p>
                          </div>
                        </div>
                      ))
                    }
                    {allFeatures.filter(f => !f.available).length > 3 && (
                      <Button variant="ghost" size="sm" className="mt-1 text-xs" asChild>
                        <a href="/premium">
                          View {allFeatures.filter(f => !f.available).length - 3} more features <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      
      {tier !== 'free' && !isLifetime && (
        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {isTrialing 
              ? 'Your subscription will automatically start after the trial ends.'
              : 'You can cancel your subscription at any time.'}
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isTrialing 
                    ? `Your trial will end immediately and you'll lose access to premium features.`
                    : `You'll still have access to premium features until ${formattedExpiryDate}, but won't be charged again.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  {cancelSubscriptionMutation.isPending 
                    ? 'Cancelling...'
                    : 'Yes, Cancel Subscription'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}