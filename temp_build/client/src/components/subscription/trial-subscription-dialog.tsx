import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Calendar, Info, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { add } from 'date-fns';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  last4?: string;
}

interface TrialSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  planTier: string;
  planPrice: string;
}

export function TrialSubscriptionDialog({
  open,
  onOpenChange,
  planId,
  planName,
  planTier,
  planPrice
}: TrialSubscriptionDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  
  const { startTrialMutation } = useSubscription();
  const { toast } = useToast();
  
  // Mock payment methods - in production, these would come from the user's stored payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      name: 'Credit Card',
      description: 'Visa ending in 4242',
      last4: '4242',
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      id: 'new-card',
      name: 'Add New Payment Method',
      description: 'Add a new credit card or payment method',
      icon: <Calendar className="h-4 w-4" />
    }
  ];
  
  // Calculate trial end date (14 days from now)
  const trialEndDate = add(new Date(), { days: 14 });
  const formattedTrialEndDate = trialEndDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleSubmit = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: 'Payment method required',
        description: 'Please select a payment method to continue.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!termsAccepted) {
      toast({
        title: 'Terms acceptance required',
        description: 'Please accept the trial terms to continue.',
        variant: 'destructive'
      });
      return;
    }
    
    // Start the trial with the selected plan tier
    startTrialMutation.mutate(
      { tier: planTier as 'premium' | 'family' | 'lifetime' },
      {
        onSuccess: () => {
          toast({
            title: 'Trial started successfully',
            description: `Your 14-day free trial of ${planName} has been started.`,
            variant: 'default'
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: 'Error starting trial',
            description: error.message || 'An error occurred while starting your trial. Please try again.',
            variant: 'destructive'
          });
        }
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Start Your 14-Day Free Trial</DialogTitle>
          <DialogDescription>
            Try {planName} with no commitment for 14 days
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Selected Plan Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Selected Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{planName}</h3>
                  <p className="text-sm text-muted-foreground">{planPrice} (billed after trial)</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  14-Day Free Trial
                </Badge>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
                <div className="flex">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-blue-700">
                    Your trial will end on <span className="font-medium">{formattedTrialEndDate}</span>, 
                    after which your selected payment method will be automatically charged {planPrice} unless canceled.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Method Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Method</CardTitle>
              <CardDescription>
                Select a payment method to use after your trial ends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedPaymentMethod} 
                onValueChange={(value) => {
                  setSelectedPaymentMethod(value);
                  if (value === 'new-card') {
                    setShowAddPaymentMethod(true);
                  } else {
                    setShowAddPaymentMethod(false);
                  }
                }}
              >
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center space-x-2 rounded-md border p-3 mb-3 ${
                      selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex flex-1 items-center cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-100 p-2 rounded-md">
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {showAddPaymentMethod && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                  <h4 className="font-medium mb-2">Add New Payment Method</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    In a production environment, this would be a form to collect payment details.
                    For this demo, we'll simulate adding a new payment method.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-md bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span>Credit Card</span>
                        </div>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="p-3 border rounded-md bg-white opacity-50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>PayPal</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Terms Acknowledgment */}
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-snug text-gray-600"
                >
                  I understand that my payment method will be automatically charged {planPrice} when my 
                  free trial ends on {formattedTrialEndDate} unless I cancel before that date.
                </Label>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100 text-sm">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-amber-700">
                  You can cancel your trial at any time before {formattedTrialEndDate} with no charge.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-first"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPaymentMethod || !termsAccepted || startTrialMutation.isPending}
            className="w-full sm:w-auto"
          >
            {startTrialMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Trial...
              </>
            ) : (
              "Start 14-Day Free Trial"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}