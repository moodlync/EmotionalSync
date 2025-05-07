import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from '@/components/common/loading-spinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// For development purposes, we'll use a mock implementation if the key isn't available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Failed",
        description: "Stripe hasn't loaded yet. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/checkout-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => setLocation('/premium')}
      >
        Cancel and Return
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [_, params] = useRoute<{ planId: string }>('/checkout/:planId');
  const planId = params?.planId || 'monthly';
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    const getPlanDetails = () => {
      switch (planId) {
        case 'monthly':
          return { 
            name: 'Monthly Premium', 
            amount: 1299, 
            interval: 'monthly',
            description: 'All premium features billed monthly'
          };
        case 'yearly':
          return { 
            name: 'Yearly Premium', 
            amount: 9999, 
            interval: 'yearly',
            description: 'Save over 35% with yearly billing'
          };
        case 'family':
          return { 
            name: 'Family Plan', 
            amount: 1999, 
            interval: 'monthly',
            description: 'Premium access for up to 5 family members'
          };
        case 'family-lifetime':
          return { 
            name: 'Family Lifetime', 
            amount: 29999, 
            interval: 'once',
            description: 'Lifetime access for the whole family'
          };
        default:
          return { 
            name: 'Premium Subscription', 
            amount: 1299, 
            interval: 'monthly',
            description: 'All premium features'
          };
      }
    };

    const planDetails = getPlanDetails();

    // Only try to create a payment intent if we have a Stripe key
    if (stripePromise) {
      setLoading(true);
      apiRequest("POST", "/api/payments/create-payment-intent", { 
        amount: planDetails.amount,
        planType: planId,
        metadata: {
          userId: user.id,
          planName: planDetails.name
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to create payment intent');
          }
          return res.json();
        })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error('Error creating payment intent:', err);
          setError('Unable to initialize payment. Please try again later.');
          toast({
            title: "Payment Setup Failed",
            description: "We couldn't set up your payment. Please try again later.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('Stripe is not configured. Please try again later.');
    }
  }, [user, planId, toast, setLocation]);

  if (!user) {
    return null; // We'll redirect in the useEffect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="mt-4 text-muted-foreground">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  // For cases where Stripe is not configured, show an alternative checkout form
  if (error || !stripePromise) {
    const simulatePurchase = () => {
      setLoading(true);
      
      // Simulate a network request
      setTimeout(() => {
        // Redirect to success page with simulated data
        const successUrl = `/checkout-success?payment_intent=sim_${Date.now()}&redirect_status=succeeded`;
        setLocation(successUrl);
      }, 1500);
    };
    
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>
              You're subscribing to the {getPlanDetails().name} plan
            </CardDescription>
            <div className="mt-2 flex justify-between items-baseline">
              <span className="text-3xl font-bold">{getPlanDetails().amount}</span>
              <span className="text-muted-foreground">{getPlanDetails().interval}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getPlanDetails().description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
              Note: Stripe integration is currently disabled. This is a simulated checkout for demonstration purposes.
            </p>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Information</h3>
              <div className="grid gap-2">
                <div className="rounded-md border px-3 py-2 text-sm bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span>Mock Credit Card</span>
                    <span>**** **** **** 4242</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={simulatePurchase}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Complete Purchase'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation('/premium')}
              disabled={loading}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Display plan details and checkout form
  const getPlanDetails = () => {
    switch (planId) {
      case 'monthly':
        return { 
          name: 'Monthly Premium', 
          amount: '$12.99', 
          interval: 'per month',
          description: 'All premium features with monthly billing'
        };
      case 'yearly':
        return { 
          name: 'Yearly Premium', 
          amount: '$99.99', 
          interval: 'per year',
          description: 'Save over 35% with yearly billing'
        };
      case 'family':
        return { 
          name: 'Family Plan', 
          amount: '$19.99', 
          interval: 'per month',
          description: 'Premium access for up to 5 family members'
        };
      case 'family-lifetime':
        return { 
          name: 'Family Lifetime', 
          amount: '$299.99', 
          interval: 'one-time',
          description: 'Lifetime access for the whole family'
        };
      default:
        return { 
          name: 'Premium Subscription', 
          amount: '$12.99', 
          interval: 'per month',
          description: 'All premium features'
        };
    }
  };

  const planDetails = getPlanDetails();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            You're subscribing to the {planDetails.name} plan
          </CardDescription>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-3xl font-bold">{planDetails.amount}</span>
            <span className="text-muted-foreground">{planDetails.interval}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {planDetails.description}
          </p>
        </CardHeader>
        <CardContent>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}