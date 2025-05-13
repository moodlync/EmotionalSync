import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Document types available for verification
const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'state_id', label: 'State ID Card' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'social_security', label: 'Social Security Card' },
  { value: 'health_card', label: 'Health Insurance Card' },
  { value: 'medicare_card', label: 'Medicare Card' },
  { value: 'citizenship_card', label: 'Citizenship Card' },
  { value: 'biometric_residence', label: 'Biometric Residence Permit' },
  { value: 'residence_permit', label: 'Residence Permit' },
  { value: 'certificate_citizenship', label: 'Certificate of Citizenship' },
  { value: 'other', label: 'Other Government ID' }
];

// Form schema
const formSchema = z.object({
  documentType: z.string({
    required_error: "Please select a document type",
  }),
  documentNumber: z.string({
    required_error: "Document number is required",
  }).min(3, {
    message: "Document number must be at least 3 characters",
  }),
  documentUrl: z.string().optional(),
  issuedBy: z.string().optional(),
  issuedDate: z.date().optional(),
  expirationDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user verification status
  const { data: verificationData, isLoading: isLoadingVerification } = useQuery({
    queryKey: ['/api/user/verification/status'],
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: '',
      documentNumber: '',
      documentUrl: '',
      issuedBy: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format dates for API
      const formattedValues = {
        ...values,
        issuedDate: values.issuedDate ? values.issuedDate.toISOString() : undefined,
        expirationDate: values.expirationDate ? values.expirationDate.toISOString() : undefined,
      };
      
      const response = await apiRequest(
        'POST',
        '/api/user/verification/documents',
        formattedValues
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit document');
      }
      
      // Show success message
      toast({
        title: "Document submitted successfully",
        description: "Your document has been submitted for verification. This process typically takes 1-3 business days.",
      });
      
      // Reset form
      form.reset();
      
      // Refresh verification status
      queryClient.invalidateQueries({ queryKey: ['/api/user/verification/status'] });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "There was a problem submitting your document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload (simplified for demo)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to cloud storage
      // and set the URL in the form. For demo purposes, we'll just set a placeholder.
      form.setValue('documentUrl', `uploaded_${file.name}`);
      toast({
        title: "File selected",
        description: `Selected file: ${file.name}`,
      });
    }
  };

  if (isLoadingVerification) {
    return <div className="flex items-center justify-center p-8">Loading verification status...</div>;
  }

  // If user is already verified, show status instead of form
  if (verificationData?.status === 'verified') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Your account is already verified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 text-green-700 p-4 rounded-md">
            <p className="font-medium">✅ Your account has been verified</p>
            <p className="text-sm mt-2">Verified on: {
              verificationData.verifiedAt ? 
                format(new Date(verificationData.verifiedAt), 'MMMM dd, yyyy') : 
                'Unknown'
            }</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has pending documents, show status with list of documents
  const hasPendingDocuments = verificationData?.documents?.some(
    (doc: any) => doc.verificationStatus === 'pending'
  );

  if (hasPendingDocuments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification in Progress</CardTitle>
          <CardDescription>Your documents are being verified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            <p className="font-medium">⏳ Verification in progress</p>
            <p className="text-sm mt-2">
              We are currently reviewing your submitted documents. This process typically takes 1-3 business days.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Submitted Documents:</h3>
            <ul className="space-y-2">
              {verificationData.documents.map((doc: any) => (
                <li key={doc.id} className="text-sm border rounded-md p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{
                      DOCUMENT_TYPES.find(type => type.value === doc.documentType)?.label || doc.documentType
                    }</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doc.verificationStatus === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : doc.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {doc.verificationStatus === 'pending' 
                        ? 'Pending' 
                        : doc.verificationStatus === 'verified'
                          ? 'Verified'
                          : 'Rejected'}
                    </span>
                  </div>
                  <div className="text-gray-500 mt-1">Document #{doc.documentNumber}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Submitted: {format(new Date(doc.submittedAt), 'MMM dd, yyyy')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/user/verification/status'] });
          }}>
            Refresh Status
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Otherwise, show the verification form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Verification</CardTitle>
        <CardDescription>
          Verify your account to unlock additional features. Please provide a valid government-issued ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of government-issued ID you are submitting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the ID number exactly as it appears on your document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="issuedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued By (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Issuing authority or country" {...field} />
                  </FormControl>
                  <FormDescription>
                    The authority or country that issued this document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="issuedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When was this document issued?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When does this document expire?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Document (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        className="hidden"
                        id="document-upload"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                      />
                      <Input
                        {...field}
                        placeholder="No file selected"
                        disabled
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 cursor-pointer"
                        onClick={() => document.getElementById('document-upload')?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Browse</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a clear photo or scan of your document (JPEG, PNG, or PDF). For demo purposes, file won't actually be uploaded.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}