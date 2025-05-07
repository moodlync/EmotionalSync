import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, CreditCard, ArrowRight, Repeat, Gift } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import TokenTransferForm from './token-transfer-form';
import RedemptionSuccess from './redemption-success';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

// Types
type RedemptionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
type RedemptionType = 'cash' | 'donation' | 'transfer';

interface TokenRedemption {
  id: number;
  userId: number;
  tokensRedeemed: number;
  cashAmount: string;
  status: RedemptionStatus;
  redemptionType: RedemptionType;
  recipientInfo: string | null;
  currency: string;
  createdAt: Date;
  processedAt: Date | null;
  notes: string | null;
}

interface EligibilityInfo {
  eligible: boolean;
  tokenBalance: number;
  conversionRate: number;
  minimumTokens: number;
  estimatedCashAmount: number;
}

// Form schema for token redemption
const RedemptionFormSchema = z.object({
  tokensRedeemed: z.string()
    .min(1, 'Token amount is required')
    .refine(val => !isNaN(Number(val)), 'Must be a valid number')
    .refine(val => Number(val) > 0, 'Token amount must be greater than 0'),
  cashAmount: z.string(),
  redemptionType: z.enum(['cash', 'donation', 'transfer']),
  recipientInfo: z.string().optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

export default function TokenRedemptionTab() {
  const [activeTab, setActiveTab] = useState<string>('redeem');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{tokensRedeemed: number, cashAmount: string}>({
    tokensRedeemed: 0,
    cashAmount: '0.00'
  });
  const { toast } = useToast();
  
  // Get redemption eligibility
  const { 
    data: eligibilityInfo,
    isLoading: isLoadingEligibility,
    error: eligibilityError
  } = useQuery<EligibilityInfo>({
    queryKey: ['/api/token-redemption/eligibility'],
    refetchOnWindowFocus: false,
  });
  
  // Get redemption history
  const {
    data: redemptionHistory,
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery<TokenRedemption[]>({
    queryKey: ['/api/token-redemption/history'],
    refetchOnWindowFocus: false,
  });
  
  // Form handling
  const form = useForm<z.infer<typeof RedemptionFormSchema>>({
    resolver: zodResolver(RedemptionFormSchema),
    defaultValues: {
      tokensRedeemed: '',
      cashAmount: '0.00',
      redemptionType: 'cash',
      recipientInfo: '',
      currency: 'USD',
      notes: '',
    },
  });
  
  // Update cash amount when token amount changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (eligibilityInfo && values.tokensRedeemed && !isNaN(Number(values.tokensRedeemed))) {
        const tokens = Number(values.tokensRedeemed);
        const cashAmount = (tokens * 0.0010).toFixed(2);
        form.setValue('cashAmount', cashAmount);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, eligibilityInfo]);
  
  // Create token redemption mutation
  const createRedemptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof RedemptionFormSchema>) => {
      const response = await fetch('/api/token-redemption/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create redemption request');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Set success data for sharing
      setSuccessData({
        tokensRedeemed: Number(variables.tokensRedeemed),
        cashAmount: variables.cashAmount
      });
      
      // Show success component
      setShowSuccess(true);
      
      // Reset form and refresh data
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/token-redemption/eligibility'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-redemption/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Redemption Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Cancel redemption mutation
  const cancelRedemptionMutation = useMutation({
    mutationFn: async (redemptionId: number) => {
      const response = await fetch(`/api/token-redemption/${redemptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel redemption request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Redemption Canceled',
        description: 'Your token redemption request has been canceled successfully.',
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/token-redemption/eligibility'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-redemption/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof RedemptionFormSchema>) => {
    if (!eligibilityInfo?.eligible) {
      toast({
        title: 'Not Eligible',
        description: `You need at least ${eligibilityInfo?.minimumTokens || 10000} tokens to redeem.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate token amount
    const tokensToRedeem = Number(values.tokensRedeemed);
    if (tokensToRedeem > eligibilityInfo.tokenBalance) {
      toast({
        title: 'Insufficient Tokens',
        description: `You only have ${eligibilityInfo.tokenBalance} tokens available.`,
        variant: 'destructive',
      });
      return;
    }
    
    createRedemptionMutation.mutate(values);
  };
  
  const handleCancelRedemption = (redemptionId: number) => {
    if (confirm('Are you sure you want to cancel this redemption request?')) {
      cancelRedemptionMutation.mutate(redemptionId);
    }
  };
  
  const getStatusBadge = (status: RedemptionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoadingEligibility) {
    return (
      <div className="flex items-center justify-center h-52">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Get user data to check if premium
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;
  
  // Handler for closing success screen
  const handleDismissSuccess = () => {
    setShowSuccess(false);
  };
  
  // If redemption was successful, show success component
  if (showSuccess) {
    return (
      <div className="flex justify-center py-8">
        <div className="max-w-md w-full">
          <RedemptionSuccess
            tokensRedeemed={successData.tokensRedeemed}
            cashAmount={successData.cashAmount}
            onDismiss={handleDismissSuccess}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="redeem">Redeem Tokens</TabsTrigger>
          <TabsTrigger value="premium-access" disabled={isPremium}>
            <div className="flex items-center">
              {isPremium && <span className="mr-1.5 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 py-0.5 px-1.5 rounded-sm">Available</span>}
              Premium Access
            </div>
          </TabsTrigger>
          <TabsTrigger value="transfer" disabled={!isPremium}>
            <div className="flex items-center">
              {!isPremium && <span className="mr-1.5 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 py-0.5 px-1.5 rounded-sm">Premium</span>}
              Transfer Tokens
            </div>
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="premium-access" className="space-y-4 pt-4">
          {!isPremium ? (
            <Card>
              <CardHeader>
                <CardTitle>Premium Access with Tokens</CardTitle>
                <CardDescription>Use tokens to temporarily upgrade to premium features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">How It Works</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Redeem your earned tokens for temporary access to all premium features without a subscription.
                    The more tokens you use, the longer your premium access duration.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-b from-card/80 to-card hover:shadow-md transition-shadow border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">1 Week Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary mb-1">2,500</p>
                      <p className="text-sm text-muted-foreground">tokens</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={eligibilityInfo && eligibilityInfo.tokenBalance >= 2500 ? "default" : "outline"}
                        className="w-full" 
                        disabled={!eligibilityInfo || eligibilityInfo.tokenBalance < 2500}
                      >
                        {eligibilityInfo && eligibilityInfo.tokenBalance >= 2500 ? "Redeem Now" : "Not Enough Tokens"}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gradient-to-b from-card/80 to-card hover:shadow-md transition-shadow border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">2 Weeks Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary mb-1">4,500</p>
                      <p className="text-sm text-muted-foreground">tokens</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={eligibilityInfo && eligibilityInfo.tokenBalance >= 4500 ? "default" : "outline"}
                        className="w-full" 
                        disabled={!eligibilityInfo || eligibilityInfo.tokenBalance < 4500}
                      >
                        {eligibilityInfo && eligibilityInfo.tokenBalance >= 4500 ? "Redeem Now" : "Not Enough Tokens"}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gradient-to-b from-card/80 to-card hover:shadow-md transition-shadow border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">3 Weeks Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary mb-1">7,000</p>
                      <p className="text-sm text-muted-foreground">tokens</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={eligibilityInfo && eligibilityInfo.tokenBalance >= 7000 ? "default" : "outline"}
                        className="w-full" 
                        disabled={!eligibilityInfo || eligibilityInfo.tokenBalance < 7000}
                      >
                        {eligibilityInfo && eligibilityInfo.tokenBalance >= 7000 ? "Redeem Now" : "Not Enough Tokens"}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gradient-to-b from-card/80 to-card hover:shadow-md transition-shadow border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">4 Weeks Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary mb-1">10,000</p>
                      <p className="text-sm text-muted-foreground">tokens</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={eligibilityInfo && eligibilityInfo.tokenBalance >= 10000 ? "default" : "outline"}
                        className="w-full" 
                        disabled={!eligibilityInfo || eligibilityInfo.tokenBalance < 10000}
                      >
                        {eligibilityInfo && eligibilityInfo.tokenBalance >= 10000 ? "Redeem Now" : "Not Enough Tokens"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Your token balance: {eligibilityInfo?.tokenBalance || 0} tokens</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continue using MoodSync and completing challenges to earn more tokens!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">You Already Have Premium Access</h3>
                  <p className="text-muted-foreground max-w-md">
                    You're already enjoying all the premium features with your current subscription. There's no need to redeem tokens for premium access.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="transfer" className="space-y-4 pt-4">
          {!isPremium ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
                    <Repeat className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Premium Feature</h3>
                  <p className="text-muted-foreground max-w-md">
                    Token transfers are available exclusively to premium members. Upgrade to premium to send tokens to friends and family!
                  </p>
                  <Button className="mt-2" variant="default">
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <TokenTransferForm />
          )}
        </TabsContent>
        
        <TabsContent value="redeem" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Token Balance</CardTitle>
              <CardDescription>Redeem your tokens for real-world value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {eligibilityError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {eligibilityError instanceof Error ? eligibilityError.message : 'Failed to load eligibility information'}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">
                        {eligibilityInfo?.tokenBalance.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Available Tokens</div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">
                        ${((eligibilityInfo?.tokenBalance || 0) * 0.0010).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Value <span className="text-xs text-muted-foreground">($0.0010 per token)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Token Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Redemption Goal</span>
                      <span className="font-medium">
                        {eligibilityInfo?.tokenBalance || 0}/10000 tokens 
                        ({Math.min(100, Math.floor(((eligibilityInfo?.tokenBalance || 0) / 10000) * 100))}%)
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, ((eligibilityInfo?.tokenBalance || 0) / 10000) * 100)} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>10000</span>
                    </div>
                  </div>
                  
                  {/* Redeem Button - Only shown when tokens reach minimum required */}
                  {eligibilityInfo?.eligible && (
                    <div className="flex justify-center mt-2">
                      <Button 
                        className="w-full sm:w-auto" 
                        onClick={() => {
                          const minimumTokens = 10000; // Fixed at 10000 tokens
                          form.setValue('tokensRedeemed', minimumTokens.toString());
                          form.setValue('cashAmount', (minimumTokens * 0.0010).toFixed(2));
                          setActiveTab('redeem');
                          setTimeout(() => {
                            document.getElementById('redemption-form')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Redeem 10000 Tokens Now
                      </Button>
                    </div>
                  )}
                  
                  {!eligibilityInfo?.eligible && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Not Eligible</AlertTitle>
                      <AlertDescription>
                        You need at least 10000 tokens to redeem. Keep earning to reach the minimum!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {eligibilityInfo?.eligible && (
                    <Form {...form}>
                      <form id="redemption-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="tokensRedeemed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tokens to Redeem</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Enter amount of tokens" 
                                    {...field} 
                                    min={eligibilityInfo.minimumTokens}
                                    max={eligibilityInfo.tokenBalance}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Minimum: 10000 tokens
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cashAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Value</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                      $
                                    </span>
                                    <Input 
                                      className="rounded-l-none" 
                                      {...field} 
                                      disabled 
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Rate: $0.0010 per token
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="redemptionType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Redemption Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="cash" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Cash Payout
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="donation" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Donate to Charity
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="transfer" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Transfer to Another User
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch('redemptionType') !== 'cash' && (
                          <FormField
                            control={form.control}
                            name="recipientInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {form.watch('redemptionType') === 'donation' 
                                    ? 'Charity Information' 
                                    : 'Recipient Username'}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={
                                      form.watch('redemptionType') === 'donation' 
                                        ? 'Enter charity name' 
                                        : 'Enter recipient username'
                                    } 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Add any additional information" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createRedemptionMutation.isPending}
                        >
                          {createRedemptionMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit Redemption Request
                        </Button>
                      </form>
                    </Form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
              <CardDescription>Track your token redemption requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-52">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : historyError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {historyError instanceof Error ? historyError.message : 'Failed to load redemption history'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {redemptionHistory && redemptionHistory.length > 0 ? (
                    redemptionHistory.map((redemption) => (
                      <Card key={redemption.id} className="bg-muted/30">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {redemption.tokensRedeemed} Tokens
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                  (${redemption.cashAmount})
                                </span>
                              </CardTitle>
                              <CardDescription>
                                {new Date(redemption.createdAt).toLocaleDateString()} at {new Date(redemption.createdAt).toLocaleTimeString()}
                              </CardDescription>
                            </div>
                            <div>
                              {getStatusBadge(redemption.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 pb-2">
                          <div className="text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-muted-foreground">Type:</div>
                              <div className="font-medium capitalize">{redemption.redemptionType}</div>
                              
                              {redemption.recipientInfo && (
                                <>
                                  <div className="text-muted-foreground">Recipient:</div>
                                  <div className="font-medium">{redemption.recipientInfo}</div>
                                </>
                              )}
                              
                              {redemption.processedAt && (
                                <>
                                  <div className="text-muted-foreground">Processed Date:</div>
                                  <div className="font-medium">
                                    {new Date(redemption.processedAt).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                              
                              {redemption.notes && (
                                <>
                                  <div className="text-muted-foreground">Notes:</div>
                                  <div className="font-medium">{redemption.notes}</div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        
                        {redemption.status === 'pending' && (
                          <CardFooter className="p-4 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancelRedemption(redemption.id)}
                              disabled={cancelRedemptionMutation.isPending}
                            >
                              {cancelRedemptionMutation.isPending && (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Cancel Request
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No redemption history</h3>
                      <p className="text-sm max-w-md mx-auto">
                        You haven't made any token redemption requests yet. Start redeeming your tokens today!
                      </p>
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab('redeem')}
                        className="mt-2"
                      >
                        Redeem Tokens <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}