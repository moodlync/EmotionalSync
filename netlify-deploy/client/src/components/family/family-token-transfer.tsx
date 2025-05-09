import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCheck,
  Coins,
  Loader2,
  Users,
  SendHorizonal,
  Ban,
  AlertCircle,
} from 'lucide-react';

interface FamilyMember {
  id: number;
  relatedUserId: number;
  relationshipType: string;
  status: 'pending' | 'accepted' | 'rejected';
  canTransferTokens: boolean;
  relatedUser: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    emotionTokens: number;
  };
}

const formSchema = z.object({
  recipientId: z.string().min(1, { message: 'Please select a recipient' }),
  amount: z.string()
    .refine(val => !isNaN(Number(val)), { 
      message: 'Amount must be a number' 
    })
    .refine(val => Number(val) > 0, { 
      message: 'Amount must be greater than 0' 
    })
    .refine(val => Number(val) === Math.floor(Number(val)), { 
      message: 'Amount must be a whole number' 
    }),
  notes: z.string().max(100).optional(),
});

export default function FamilyTokenTransfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRecipient, setSelectedRecipient] = useState<FamilyMember | null>(null);

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientId: '',
      amount: '',
      notes: '',
    },
  });

  // Get family members
  const {
    data: familyMembers,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    refetchOnWindowFocus: false,
  });

  // Get token balance
  const {
    data: tokenBalance,
    isLoading: isLoadingBalance,
  } = useQuery<{ tokens: number }>({
    queryKey: ['/api/tokens'],
    refetchOnWindowFocus: false,
  });

  // Filter family members who can receive token transfers
  const eligibleRecipients = familyMembers?.filter(
    (member) => member.status === 'accepted' && member.canTransferTokens
  ) || [];

  // Handle recipient change
  const handleRecipientChange = (recipientId: string) => {
    const recipient = eligibleRecipients.find(
      (member) => member.relatedUserId.toString() === recipientId
    );
    setSelectedRecipient(recipient || null);
  };

  // Transfer tokens mutation
  const transferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/tokens/transfer', {
        recipientId: Number(data.recipientId),
        amount: Number(data.amount),
        notes: data.notes || undefined,
        type: 'family',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to transfer tokens');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tokens Transferred',
        description: `You've successfully transferred ${form.getValues().amount} tokens to ${selectedRecipient?.relatedUser.username}.`,
        variant: 'default',
      });
      
      // Reset form and invalidate queries
      form.reset();
      setSelectedRecipient(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer tokens. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    transferMutation.mutate(values);
  }

  if (isLoadingMembers || isLoadingBalance) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Family Token Transfer
        </CardTitle>
        <CardDescription>
          Transfer tokens to your family members for redemption
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eligibleRecipients.length === 0 ? (
          <div className="bg-muted p-6 rounded-lg text-center space-y-4">
            <Ban className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="font-medium text-lg">No Eligible Recipients</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {!familyMembers || familyMembers.length === 0
                  ? "You don't have any family members yet. Add family members to your plan first."
                  : familyMembers.every(m => m.status !== 'accepted')
                  ? "Your family members need to accept your invitation before you can transfer tokens."
                  : "You need to enable token transfers for your family members in the family management page."}
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Current Token Balance:</span>
                </div>
                <span className="text-xl font-bold">{tokenBalance?.tokens || 0}</span>
              </div>

              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRecipientChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select family member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eligibleRecipients.map((member) => (
                          <SelectItem key={member.relatedUserId} value={member.relatedUserId.toString()}>
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{member.relatedUser.username}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRecipient && (
                      <FormDescription>
                        {selectedRecipient.relatedUser.username} currently has {selectedRecipient.relatedUser.emotionTokens} tokens
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter token amount"
                        min="1"
                        step="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Only whole numbers allowed. Maximum: {tokenBalance?.tokens || 0} tokens
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note to the recipient"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add a personal message (max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {Number(form.watch('amount')) > (tokenBalance?.tokens || 0) && (
                <div className="flex items-start space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    You don't have enough tokens for this transfer. Maximum available: {tokenBalance?.tokens || 0}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  transferMutation.isPending || 
                  !form.watch('recipientId') || 
                  !form.watch('amount') ||
                  Number(form.watch('amount')) > (tokenBalance?.tokens || 0)
                }
              >
                {transferMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="mr-2 h-4 w-4" />
                )}
                Transfer Tokens
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}