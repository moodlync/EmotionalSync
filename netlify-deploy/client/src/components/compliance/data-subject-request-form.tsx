import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2 } from 'lucide-react';

const requestTypeDescriptions = {
  'access': 'Receive a copy of your personal data we process',
  'rectification': 'Correct inaccurate or incomplete personal data',
  'erasure': 'Delete your personal data ("right to be forgotten")',
  'restriction': 'Restrict the processing of your personal data',
  'portability': 'Receive your data in a machine-readable format',
  'objection': 'Object to processing based on legitimate interests',
  'automated-decision': 'Review automated decisions made about you',
  'withdraw-consent': 'Withdraw previously given consent for processing'
};

const formSchema = z.object({
  requestType: z.enum([
    'access', 'rectification', 'erasure', 'restriction', 
    'portability', 'objection', 'automated-decision', 'withdraw-consent'
  ], {
    required_error: 'Please select a request type',
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  details: z.string().min(10, 'Please provide more details about your request'),
  identity: z.boolean().refine(val => val === true, {
    message: 'You must verify your identity to proceed',
  }),
  understanding: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge this to proceed',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface DataSubjectRequestFormProps {
  companyName?: string;
}

export function DataSubjectRequestForm({ companyName = 'MoodSync' }: DataSubjectRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestReference, setRequestReference] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: undefined,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      details: '',
      identity: false,
      understanding: false,
    },
  });

  function onSubmit(data: FormValues) {
    // In a real application, this would submit to an API endpoint
    console.log('Form submitted:', data);
    
    // Generate a reference number for the request
    const reference = `DSR-${Math.floor(100000 + Math.random() * 900000)}`;
    setRequestReference(reference);
    setIsSubmitted(true);
    
    toast({
      title: 'Request Submitted',
      description: `Your data subject request has been submitted. Reference: ${reference}`,
    });
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Request Submitted</CardTitle>
          <CardDescription className="text-center">
            Your data subject request has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="font-semibold">Reference Number</p>
            <p className="text-lg">{requestReference}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please keep this reference number for future communications about your request.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">What happens next?</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We'll review your request within 3 business days</li>
              <li>You'll receive an email confirmation at {form.getValues().email}</li>
              <li>We may contact you if we need additional information to verify your identity</li>
              <li>We'll process your request within 30 days as required by GDPR (or applicable law)</li>
            </ul>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription>
              If you have any questions about your request, please contact our Data Protection Officer at <a href={`mailto:dpo@${companyName.toLowerCase()}.com`} className="text-primary underline">dpo@{companyName.toLowerCase()}.com</a>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
          >
            Submit Another Request
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Data Subject Request Form</CardTitle>
        <CardDescription>
          Use this form to exercise your rights under the General Data Protection Regulation (GDPR) 
          and other applicable privacy laws.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Request Type</FormLabel>
                  <FormDescription>
                    Select the type of request you would like to make.
                  </FormDescription>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {Object.entries(requestTypeDescriptions).map(([value, description]) => (
                      <FormItem key={value} className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={value} />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-normal">
                            {value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john.doe@example.com" />
                  </FormControl>
                  <FormDescription>
                    We'll use this email to communicate with you about your request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please provide any additional details about your request that might help us process it more efficiently."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    The more specific you are, the better we can assist you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="identity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I verify that I am the data subject making this request, or I am authorized to make this request on behalf of the data subject.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="understanding"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I understand that {companyName} may need to verify my identity and may contact me for additional information to process this request.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Processing Time</AlertTitle>
              <AlertDescription className="text-blue-700">
                We'll respond to your request within 30 days, as required by applicable law. In complex cases, this period may be extended by an additional 60 days, in which case we will notify you.
              </AlertDescription>
            </Alert>
            
            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default DataSubjectRequestForm;