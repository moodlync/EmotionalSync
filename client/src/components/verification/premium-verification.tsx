import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  CalendarIcon, 
  CheckCircle, 
  CreditCard, 
  Globe, 
  Home, 
  Lock, 
  ShieldCheck, 
  Upload, 
  User as UserIcon,
  FileCheck,
  BadgeCheck,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Identity verification form schema
const verificationFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  middleName: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "Please select a date of birth.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().min(1, {
    message: "State is required.",
  }),
  zipCode: z.string().min(3, {
    message: "Postal/ZIP code is required.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  idType1: z.string({
    required_error: "Please select a primary ID type.",
  }),
  idType2: z.string({
    required_error: "Please select a secondary ID type.",
  }),
  verificationPlan: z.enum(["monthly", "yearly"]),
});

// ID Types by country
const idTypesByCountry: Record<string, string[]> = {
  "US": [
    "Passport",
    "Driver's License",
    "State ID Card",
    "Social Security Card",
    "Birth Certificate",
    "Military ID"
  ],
  "CA": [
    "Passport",
    "Driver's License",
    "Provincial ID Card",
    "Health Card",
    "Birth Certificate",
    "Citizenship Card"
  ],
  "UK": [
    "Passport",
    "Driving Licence",
    "National ID Card",
    "Biometric Residence Permit",
    "Birth Certificate",
    "Council Tax Bill"
  ],
  "AU": [
    "Passport",
    "Driver's License",
    "Medicare Card",
    "Birth Certificate",
    "Citizenship Certificate",
    "ImmiCard"
  ],
  "default": [
    "Passport",
    "National ID Card",
    "Driver's License",
    "Birth Certificate",
    "Residence Permit",
    "Voter ID Card"
  ]
};

// Common countries list
const commonCountries = [
  "US", "CA", "UK", "AU", "DE", "FR", "IT", "ES", "JP", "CN", 
  "IN", "BR", "MX", "RU", "ZA", "NG", "EG", "SA", "AE", "SG"
];

// Country names for display
const countryNames: Record<string, string> = {
  "US": "United States",
  "CA": "Canada",
  "UK": "United Kingdom",
  "AU": "Australia",
  "DE": "Germany",
  "FR": "France",
  "IT": "Italy",
  "ES": "Spain",
  "JP": "Japan",
  "CN": "China",
  "IN": "India",
  "BR": "Brazil",
  "MX": "Mexico",
  "RU": "Russia",
  "ZA": "South Africa",
  "NG": "Nigeria",
  "EG": "Egypt",
  "SA": "Saudi Arabia",
  "AE": "United Arab Emirates",
  "SG": "Singapore"
};

// US States for the form
const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// Canadian provinces
const caProvinces = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
];

// Australian states
const auStates = [
  "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"
];

// UK regions
const ukRegions = [
  "England", "Scotland", "Wales", "Northern Ireland"
];

// Verification plan details
const verificationPlans = [
  {
    id: "monthly",
    name: "Monthly Verification",
    price: "$2.99",
    period: "per month",
    features: [
      "Identity verification badge",
      "Enhanced trust score",
      "Priority customer support",
      "Monthly verification reviews"
    ]
  },
  {
    id: "yearly",
    name: "Annual Verification",
    price: "$19.99",
    period: "per year",
    savings: "$15.89 saved compared to monthly",
    features: [
      "All monthly benefits",
      "Discounted annual rate",
      "Extended verification period",
      "Fewer reverification requirements"
    ]
  }
];

export function PremiumVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPremium = user?.isPremium;
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    id1: null,
    id2: null
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  
  // Get the appropriate states/provinces based on the selected country
  const getRegions = () => {
    switch(selectedCountry) {
      case "US": return usStates;
      case "CA": return caProvinces;
      case "AU": return auStates;
      case "UK": return ukRegions;
      default: return [];
    }
  };
  
  // Form definition with zod validation
  const form = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      middleName: user?.middleName || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      verificationPlan: "monthly",
    },
  });
  
  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, idType: 'id1' | 'id2') => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles({
        ...uploadedFiles,
        [idType]: e.target.files[0]
      });
      
      // Show success toast
      toast({
        title: "File uploaded",
        description: `${e.target.files[0].name} uploaded successfully.`,
      });
    }
  };
  
  // Handle country change to update ID types
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setValue("country", value);
    
    // Reset state/province when country changes
    form.setValue("state", "");
  };
  
  // Move to next step
  const handleNextStep = () => {
    // Validate current step first
    if (activeStep === 1) {
      const personalInfoFields = ["fullName", "dateOfBirth", "address", "city", "state", "zipCode", "country"];
      const isValid = personalInfoFields.every(field => {
        const value = form.getValues(field as any);
        return value !== undefined && value !== "";
      });
      
      if (!isValid) {
        // Trigger validation on the fields
        form.trigger(personalInfoFields as any);
        return;
      }
    }
    
    if (activeStep === 2) {
      const idFields = ["idType1", "idType2"];
      const isValid = idFields.every(field => {
        const value = form.getValues(field as any);
        return value !== undefined && value !== "";
      });
      
      if (!isValid) {
        form.trigger(idFields as any);
        return;
      }
      
      // Check if files are uploaded
      if (!uploadedFiles.id1 || !uploadedFiles.id2) {
        toast({
          title: "Missing documents",
          description: "Please upload both ID documents to continue.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof verificationFormSchema>) => {
    console.log(values);
    
    // Show payment dialog
    setShowPaymentDialog(true);
  };
  
  // Process payment and complete verification
  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentDialog(false);
      
      // Simulate verification process (in a real app this would take longer)
      setTimeout(() => {
        setIsVerified(true);
        
        toast({
          title: "Verification Complete",
          description: "Your account has been successfully verified!",
        });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0">
          Premium Feature
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Account Verification
        </h2>
        
        <p className="text-gray-600 max-w-2xl mx-auto mb-4">
          Increase your credibility in the community by verifying your identity. This badge shows others that your profile is authentic.
        </p>
        
        {!isPremium && (
          <Alert className="max-w-2xl mx-auto border-amber-200 bg-amber-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Account verification is exclusively available for premium members. Upgrade your account to access this feature.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {isVerified ? (
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <BadgeCheck className="h-10 w-10 text-green-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">Verification Successful!</CardTitle>
            <CardDescription>
              Your identity has been verified and your profile now shows as verified to other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Account Status</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                    Verified
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Verification Date</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(), "PPP")}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Verification Type</div>
                  <div className="text-sm text-gray-500">
                    {form.getValues("verificationPlan") === "monthly" ? "Monthly" : "Annual"} Identity Verification
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">What This Means</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your profile now displays a verification badge visible to all users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your content and interactions receive higher visibility in the community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You'll receive priority handling for support requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Other users will have increased confidence when interacting with you</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Identity Verification</CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium",
                  activeStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                )}>1</div>
                Personal Info
                <div className="mx-2 h-px w-8 bg-gray-200"></div>
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium",
                  activeStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                )}>2</div>
                ID Documents
                <div className="mx-2 h-px w-8 bg-gray-200"></div>
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium",
                  activeStep >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                )}>3</div>
                Verification Plan
              </div>
            </div>
            <CardDescription>
              {activeStep === 1 ? "Enter your personal information that matches your identification documents" : 
               activeStep === 2 ? "Upload two forms of identification to verify your identity" : 
               "Choose a verification plan and complete the process"}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6">
                {/* Step 1: Personal Information */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Legal Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First and Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Middle name or initial" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
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
                              <CalendarComponent
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
                            Must match your identification documents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select 
                              onValueChange={(value) => handleCountryChange(value)} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commonCountries.map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {countryNames[code] || code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedCountry === "US" ? "State" : 
                               selectedCountry === "CA" ? "Province" : 
                               selectedCountry === "AU" ? "State/Territory" : 
                               selectedCountry === "UK" ? "Region" : 
                               "State/Province"}
                            </FormLabel>
                            {getRegions().length > 0 ? (
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getRegions().map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input placeholder="State/Province" {...field} />
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedCountry === "US" ? "ZIP Code" : "Postal Code"}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Postal/ZIP code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 2: ID Documents */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">
                            Document Security
                          </h3>
                          <p className="text-sm text-blue-600 mt-1">
                            Your ID documents are securely encrypted and will only be used for verification purposes. 
                            We adhere to strict privacy standards and will not share your information with third parties.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="idType1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary ID Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(idTypesByCountry[selectedCountry] || idTypesByCountry.default).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Primary government-issued identification
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="idType2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary ID Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(idTypesByCountry[selectedCountry] || idTypesByCountry.default).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Secondary proof of identity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">Upload Primary ID</Label>
                        <div className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-gray-50 transition"
                             onClick={() => document.getElementById('id1Upload')?.click()}>
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <div className="text-sm font-medium">
                              {uploadedFiles.id1 ? (
                                <span className="text-green-600">{uploadedFiles.id1.name}</span>
                              ) : (
                                <span>Click to upload or take a photo</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, or PDF up to 10MB
                            </p>
                          </div>
                          <input
                            id="id1Upload"
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'id1')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Upload Secondary ID</Label>
                        <div className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-gray-50 transition"
                             onClick={() => document.getElementById('id2Upload')?.click()}>
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <div className="text-sm font-medium">
                              {uploadedFiles.id2 ? (
                                <span className="text-green-600">{uploadedFiles.id2.name}</span>
                              ) : (
                                <span>Click to upload or take a photo</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, or PDF up to 10MB
                            </p>
                          </div>
                          <input
                            id="id2Upload"
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'id2')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-2">
                      <h4 className="font-medium">ID Document Guidelines:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Documents must be valid and not expired</li>
                        <li>All details must be clearly visible</li>
                        <li>The entire document must be visible in the image</li>
                        <li>Photos should be well-lit with no glare</li>
                        <li>Name on IDs must match the name provided</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Verification Plan */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="verificationPlan"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Select Verification Plan</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {verificationPlans.map((plan) => (
                                <div key={plan.id} 
                                     className={cn(
                                       "border rounded-md p-4 cursor-pointer transition-all hover:border-blue-400",
                                       field.value === plan.id && "border-2 border-blue-500 bg-blue-50"
                                     )}
                                     onClick={() => form.setValue("verificationPlan", plan.id as any)}>
                                  <div className="flex justify-between mb-2">
                                    <div className="font-semibold">{plan.name}</div>
                                    <Badge variant={plan.id === "yearly" ? "secondary" : "outline"}>
                                      {plan.id === "yearly" ? "Best Value" : "Standard"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-baseline mb-3">
                                    <span className="text-2xl font-bold">{plan.price}</span>
                                    <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                                  </div>
                                  
                                  {plan.savings && (
                                    <div className="text-xs text-green-600 mb-3">
                                      {plan.savings}
                                    </div>
                                  )}
                                  
                                  <ul className="space-y-1">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="text-sm flex items-start">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Lock className="h-4 w-4 mr-1.5" />
                        Verification Process Overview
                      </h3>
                      <ol className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <span className="font-medium">Submit application and payment</span>
                            <p className="text-gray-500 mt-0.5">Complete form and pay verification fee</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <span className="font-medium">Automated document verification</span>
                            <p className="text-gray-500 mt-0.5">Our system checks your ID documents for validity</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <span className="font-medium">Account verification badge granted</span>
                            <p className="text-gray-500 mt-0.5">Your profile will display a verification badge</p>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                {activeStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(activeStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                
                {activeStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={!isPremium}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={!isPremium}
                    className="ml-auto"
                  >
                    Complete & Proceed to Payment
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
          
          {/* Payment Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Payment</DialogTitle>
                <DialogDescription>
                  {form.getValues("verificationPlan") === "monthly" 
                    ? "Monthly verification fee of $2.99"
                    : "Annual verification fee of $19.99"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="text-sm text-gray-700 mb-2">Verification Plan</div>
                  <div className="font-medium text-lg">
                    {form.getValues("verificationPlan") === "monthly" 
                      ? "Monthly Verification"
                      : "Annual Verification"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {form.getValues("verificationPlan") === "monthly" 
                      ? "Renews monthly at $2.99"
                      : "Renews annually at $19.99"}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="mt-1" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM / YY" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ${form.getValues("verificationPlan") === "monthly" ? "2.99" : "19.99"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
}