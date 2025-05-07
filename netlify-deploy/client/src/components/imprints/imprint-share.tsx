import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  EmotionalImprint,
  ImprintRecipient,
  ShareImprintFormData
} from '@/types/imprints';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, SearchIcon, Users, Send, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Form validation schema
const shareImprintSchema = z.object({
  receiverId: z.string().min(1, "Recipient is required"),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
});

interface ImprintShareProps {
  imprint: EmotionalImprint;
  onSuccess?: () => void;
}

const ImprintShare: React.FC<ImprintShareProps> = ({
  imprint,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<ImprintRecipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<ImprintRecipient[]>([]);
  
  // Initialize form
  const form = useForm<ShareImprintFormData>({
    resolver: zodResolver(shareImprintSchema),
    defaultValues: {
      receiverId: '',
      message: '',
      isAnonymous: false,
    },
  });
  
  // Query to fetch potential recipients (friends/connections)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users/connections'],
    queryFn: getQueryFn({ on401: "throw" }),
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setRecipients(data);
        setFilteredRecipients(data);
      }
    },
    onError: (error) => {
      console.error('Error fetching recipients:', error);
      toast({
        title: 'Failed to load connections',
        description: 'Could not load your connections. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Filter recipients when search term changes
  useEffect(() => {
    if (recipients.length > 0) {
      if (searchTerm.trim() === '') {
        setFilteredRecipients(recipients);
      } else {
        const filtered = recipients.filter(r => 
          r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.firstName && r.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.lastName && r.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredRecipients(filtered);
      }
    }
  }, [searchTerm, recipients]);
  
  // Share imprint mutation
  const shareMutation = useMutation({
    mutationFn: async (data: ShareImprintFormData) => {
      const response = await apiRequest('POST', `/api/emotional-imprints/${imprint.id}/share`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Imprint Shared',
        description: form.getValues('isAnonymous') 
          ? 'Your emotional imprint has been shared anonymously.' 
          : 'Your emotional imprint has been shared successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints/shared'] });
      
      // Reset form and call success callback
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Share Failed',
        description: `Failed to share imprint: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ShareImprintFormData) => {
    shareMutation.mutate(data);
  };
  
  // Find the selected recipient
  const selectedRecipient = recipients.find(r => r.id.toString() === form.watch('receiverId'));
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Share Emotional Imprint</DialogTitle>
        <DialogDescription>
          Share your emotional experience with a friend or connection.
        </DialogDescription>
      </DialogHeader>
      
      {/* Mini imprint preview */}
      <div className="my-4">
        <Card className="p-3 flex items-center gap-3 bg-accent/50">
          <div 
            className="w-10 h-10 rounded-full" 
            style={{ 
              backgroundColor: imprint.colorCode ? imprint.colorCode : '#e2e8f0'
            }}
          />
          <div className="flex flex-col flex-1">
            <div className="font-medium">{imprint.name}</div>
            <div className="text-xs text-muted-foreground">
              {imprint.description ? (
                imprint.description.length > 50 
                  ? `${imprint.description.substring(0, 50)}...` 
                  : imprint.description
              ) : 'No description'}
            </div>
          </div>
          <Badge variant="outline">{imprint.emotion}</Badge>
        </Card>
      </div>
      
      <Separator className="my-4" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Search Recipients */}
          <div className="space-y-2">
            <label htmlFor="search-recipients" className="text-sm font-medium">
              Find a recipient
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-recipients"
                placeholder="Search by name, username, or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Recipient selection */}
          <FormField
            control={form.control}
            name="receiverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recipient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredRecipients.length === 0 ? (
                      <div className="flex flex-col items-center p-2 text-sm text-muted-foreground">
                        <Users className="h-10 w-10 mb-2 opacity-20" />
                        <p>No recipients found</p>
                      </div>
                    ) : (
                      filteredRecipients.map((recipient) => (
                        <SelectItem 
                          key={recipient.id} 
                          value={recipient.id.toString()}
                          className="flex items-center py-1.5"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={recipient.profilePicture || ''} />
                              <AvatarFallback className="text-xs">
                                {recipient.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {recipient.firstName && recipient.lastName
                              ? `${recipient.firstName} ${recipient.lastName} (${recipient.username})`
                              : recipient.username}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Message field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a personal message to go with your emotional imprint..."
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Your message will be sent along with the emotional imprint.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Anonymous option */}
          <FormField
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Send Anonymously
                  </FormLabel>
                  <FormDescription>
                    Your identity will not be revealed to the recipient
                  </FormDescription>
                </div>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    {field.value ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Preview of how it will appear */}
          {form.watch('receiverId') && (
            <div className="rounded-lg border p-4 bg-accent/10">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  {form.watch('isAnonymous') ? (
                    <AvatarFallback className="bg-muted">?</AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={user?.profilePicture || ''} />
                      <AvatarFallback>
                        {user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {form.watch('isAnonymous') ? 'Anonymous' : user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.watch('message') || 'No message'}
                  </p>
                  <div 
                    className="h-2 w-16 rounded-full mt-1"
                    style={{ 
                      backgroundColor: imprint.colorCode || '#e2e8f0',
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={shareMutation.isPending}
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Share Imprint
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default ImprintShare;