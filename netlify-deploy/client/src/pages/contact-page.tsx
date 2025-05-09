import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot, AlertTriangle, Flag } from 'lucide-react';
import AISupportChat from '@/components/contact/ai-support-chat';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message cannot exceed 500 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.username || '',
      email: user?.email || '',
      subject: '',
      category: 'general',
      message: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      // In a real implementation, this would send the data to a backend API
      // For now, we'll just simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description: 'We\'ve received your message and will get back to you soon.',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send',
        description: error.message || 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  const toggleChat = () => {
    if (!showChat) {
      setShowChat(true);
      setIsChatMinimized(false);
    } else {
      setIsChatMinimized(!isChatMinimized);
    }
  };

  const closeChat = () => {
    setShowChat(false);
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          We're here to help with any questions or concerns about MoodSync
        </p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Get in Touch</h2>
            <p className="text-muted-foreground">
              Our support team is available to help you with any questions or issues.
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <Card className="bg-primary text-white">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-white mt-0.5" />
                  <div>
                    <h3 className="font-medium">AI Chat Support</h3>
                    <p className="text-sm text-white/80">Get immediate answers to common questions</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-2" 
                      onClick={toggleChat}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Alert variant="destructive" className="mb-6 border-orange-600 bg-orange-50 text-orange-900">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold flex items-center gap-1">
              ⚠️ Warning: Zero Tolerance for Abuse
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">
                At MoodSync, we prioritize a safe and supportive community. If you engage in abusive, threatening, 
                or harmful behavior through our contact channels (including chats, feedback, or support tickets):
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Immediate account suspension or permanent ban.</li>
                <li>Legal action may be taken for severe violations (e.g., threats, hate speech).</li>
                <li>All interactions are logged for moderation and security purposes.</li>
              </ul>
              <p className="mb-2">
                Need help? Contact us responsibly—we're here to listen.
              </p>
              <p className="font-medium flex items-center gap-1">
                <Flag className="h-4 w-4" /> Report Abuse: Use the 🚩 "Report" button or email <a href="mailto:trust@moodsync.app" className="underline">trust@moodsync.app</a>
              </p>
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Message subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?" 
                            className="min-h-32 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {500 - (field.value?.length || 0)} characters remaining
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto" 
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showChat && (
        <AISupportChat 
          isMinimized={isChatMinimized}
          onMinimizeToggle={() => setIsChatMinimized(!isChatMinimized)}
          onClose={closeChat}
        />
      )}
    </div>
  );
}