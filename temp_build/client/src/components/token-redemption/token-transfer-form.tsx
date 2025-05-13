import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, AlertTriangle, Search, Send } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

// Form Schema for token transfer
const TokenTransferSchema = z.object({
  recipientId: z.string().min(1, { message: "Please select a recipient" }),
  amount: z.string()
    .refine(val => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine(val => Number(val) > 0, { message: "Amount must be greater than 0" })
    .refine(val => Number(val) === Math.floor(Number(val)), { message: "Amount must be a whole number" }),
  notes: z.string().max(100).optional(),
});

export default function TokenTransferForm() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's token balance
  const { 
    data: tokenBalance,
    isLoading: isLoadingBalance,
  } = useQuery<{ tokens: number }>({
    queryKey: ['/api/tokens'],
    refetchOnWindowFocus: false,
  });

  // Search users
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useQuery<User[]>({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      return await res.json();
    },
  });

  // Form handling
  const form = useForm<z.infer<typeof TokenTransferSchema>>({
    resolver: zodResolver(TokenTransferSchema),
    defaultValues: {
      recipientId: '',
      amount: '',
      notes: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (selectedUser) {
      form.setValue('recipientId', selectedUser.id.toString());
    } else {
      form.setValue('recipientId', '');
    }
  }, [selectedUser, form]);

  // Transfer tokens mutation
  const transferMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof TokenTransferSchema>) => {
      const res = await apiRequest('POST', '/api/tokens/transfer', {
        recipientId: formData.recipientId,
        amount: Number(formData.amount),
        notes: formData.notes,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
      
      toast({
        title: "Tokens transferred successfully!",
        description: `You've sent ${form.getValues().amount} tokens to ${selectedUser?.username}.`,
        variant: "default",
      });
      
      // Reset form
      form.reset();
      setSelectedUser(null);
      setConfirmOpen(false);
    },
    onError: (error: any) => {
      setConfirmOpen(false);
      toast({
        title: "Transfer failed",
        description: error.message || "Failed to transfer tokens. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof TokenTransferSchema>) => {
    if (!selectedUser) {
      toast({
        title: "No recipient selected",
        description: "Please select a user to send tokens to.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate amount against current balance
    const amount = Number(data.amount);
    if (tokenBalance && amount > tokenBalance.tokens) {
      toast({
        title: "Insufficient tokens",
        description: `You only have ${tokenBalance.tokens} tokens available.`,
        variant: "destructive",
      });
      return;
    }
    
    // Open confirmation dialog
    setConfirmOpen(true);
  };

  const confirmTransfer = () => {
    transferMutation.mutate(form.getValues());
  };

  // Handle user search and selection
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      refetchSearch();
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSearchOpen(false);
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Transfer Tokens</h3>
        <p className="text-sm text-muted-foreground">
          Send tokens to other MoodSync users. This feature is exclusive to premium members.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Recipient Selection */}
              <FormField
                control={form.control}
                name="recipientId"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Recipient</FormLabel>
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-start w-full"
                        >
                          {selectedUser ? (
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={selectedUser.profilePicture} />
                                <AvatarFallback>{getUserInitials(selectedUser)}</AvatarFallback>
                              </Avatar>
                              <span>{selectedUser.username}</span>
                              {selectedUser.firstName && selectedUser.lastName && (
                                <span className="ml-2 text-muted-foreground">
                                  ({selectedUser.firstName} {selectedUser.lastName})
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              <span>Search for a user</span>
                            </>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full min-w-[300px]">
                        <Command>
                          <CommandInput 
                            placeholder="Search by username, name, or email"
                            onValueChange={handleSearch}
                            value={searchQuery}
                          />
                          <CommandList>
                            {isSearching && (
                              <div className="p-4 text-center text-sm">
                                Searching...
                              </div>
                            )}
                            
                            {!isSearching && searchQuery.length < 2 && (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Type at least 2 characters to search
                              </div>
                            )}
                            
                            {!isSearching && searchQuery.length >= 2 && (
                              <CommandEmpty>No users found</CommandEmpty>
                            )}
                            
                            <CommandGroup>
                              {searchResults?.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  onSelect={() => selectUser(user)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src={user.profilePicture} />
                                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div>{user.username}</div>
                                      {user.firstName && user.lastName && (
                                        <div className="text-sm text-muted-foreground">
                                          {user.firstName} {user.lastName}
                                        </div>
                                      )}
                                      {user.email && (
                                        <div className="text-xs text-muted-foreground">
                                          {user.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter amount of tokens"
                          {...field}
                          type="number"
                          min="1"
                          step="1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                          tokens
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Minimum transfer: 10 tokens</span>
                      <span>
                        Balance: {isLoadingBalance ? '...' : tokenBalance?.tokens || 0} tokens
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Note */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a personal note"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This note will be visible to the recipient
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={transferMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {transferMutation.isPending ? 'Transferring...' : 'Send Tokens'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Token Transfer</DialogTitle>
            <DialogDescription>
              Please review and confirm your token transfer details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Recipient:</Label>
              <div className="font-medium flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={selectedUser?.profilePicture} />
                  <AvatarFallback>
                    {selectedUser ? getUserInitials(selectedUser) : 'NA'}
                  </AvatarFallback>
                </Avatar>
                {selectedUser?.username}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Amount:</Label>
              <div className="font-medium">{form.getValues().amount} tokens</div>
            </div>
            
            {form.getValues().notes && (
              <div className="border-t pt-3 mt-3">
                <Label className="text-muted-foreground mb-2 block">Note:</Label>
                <div className="text-sm bg-muted p-3 rounded-md">
                  {form.getValues().notes}
                </div>
              </div>
            )}
            
            <div className="flex items-start mt-4 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-400">
                This action cannot be undone. Once sent, the tokens will be immediately transferred to the recipient.
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmOpen(false)}
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmTransfer}
              disabled={transferMutation.isPending}
              className="ml-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {transferMutation.isPending ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}