import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function CheckoutSuccess() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get the payment_intent from the URL
    const url = new URL(window.location.href);
    const paymentIntentId = url.searchParams.get('payment_intent');
    const redirectStatus = url.searchParams.get('redirect_status');

    if (paymentIntentId && redirectStatus === 'succeeded') {
      // Check if this is a simulated payment (starts with sim_)
      if (paymentIntentId.startsWith('sim_')) {
        // This is a simulated payment, directly mark as success
        setTimeout(() => {
          setSuccess(true);
          toast({
            title: 'Subscription Activated!',
            description: 'Welcome to MoodSync Premium! Your subscription is now active.',
          });
          setProcessing(false);
        }, 1000);
      } else {
        // This is a real Stripe payment, verify it on the server
        apiRequest('POST', '/api/payments/verify-payment', { paymentIntentId })
          .then(response => {
            if (!response.ok) {
              throw new Error('Payment verification failed');
            }
            return response.json();
          })
          .then(data => {
            setSuccess(true);
            toast({
              title: 'Subscription Activated!',
              description: 'Welcome to MoodSync Premium! Your subscription is now active.',
            });
          })
          .catch(error => {
            console.error('Verification error:', error);
            toast({
              variant: 'destructive',
              title: 'Verification Failed',
              description: 'There was a problem verifying your payment. Please contact support.',
            });
          })
          .finally(() => {
            setProcessing(false);
          });
      }
    } else if (redirectStatus === 'failed') {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Your payment was not successful. Please try again.',
      });
      setProcessing(false);
    } else {
      // No payment info in URL
      setProcessing(false);
    }
  }, [toast]);

  const handleContinue = () => {
    setLocation('/premium');
  };

  if (processing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center text-gray-500">
              Please wait while we confirm your payment and activate your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Star className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {success ? 'Welcome to MoodSync Premium!' : 'Thank You'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {success ? (
            <>
              <p>Your premium subscription has been successfully activated.</p>
              <p>You now have access to exclusive features including:</p>
              <ul className="text-left list-disc pl-6 space-y-1">
                <li>Emotion NFTs collectibles</li>
                <li>Premium mood backgrounds</li>
                <li>Verified profile badge</li>
                <li>Advanced analytics</li>
                <li>Ad-free experience</li>
              </ul>
            </>
          ) : (
            <p>
              We've received your request, but there may have been an issue with the payment
              processing. If your subscription doesn't activate within a few minutes,
              please contact support.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleContinue} className="w-full">
            {success ? 'Continue to Premium Features' : 'Return to Home'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}