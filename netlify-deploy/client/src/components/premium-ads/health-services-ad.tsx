import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Info,
  MegaphoneIcon,
  PhoneCall,
  Upload,
  User,
  Users,
  Video,
  Mail
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Types for health services ad data
interface HealthServicesAd {
  id: string;
  userId: number;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUnit: 'session' | 'hour' | 'month' | 'package';
  location?: string;
  availability?: string[];
  contactEmail?: string;
  contactPhone?: string;
  isOnline: boolean;
  isPremium: boolean;
  createdAt: Date;
  imageUrl?: string;
}

// Type for booking request
interface BookingRequest {
  id: string;
  adId: string;
  userId: number;
  userName: string;
  userAge: number;
  userGender: string;
  serviceRequested: string;
  preferredTime: string;
  preferredDays: string[];
  phoneNumber: string;
  message: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: Date;
}

// Sample data
const sampleAds: HealthServicesAd[] = [
  {
    id: 'ad1',
    userId: 1,
    title: 'Mindfulness & Meditation Coaching',
    category: 'Mental Wellness',
    description: 'One-on-one mindfulness coaching sessions to reduce stress, improve focus, and enhance your emotional wellbeing. Personalized techniques and practices tailored to your specific needs.',
    price: 45,
    priceUnit: 'session',
    availability: ['Weekday evenings', 'Saturday mornings'],
    contactEmail: 'mindful@example.com',
    isOnline: true,
    isPremium: true,
    createdAt: new Date('2025-03-15'),
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG1lZGl0YXRpb258ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'ad2',
    userId: 2,
    title: 'Holistic Nutrition Consultation',
    category: 'Nutrition',
    description: 'Comprehensive nutrition plans designed to support emotional and physical wellbeing. Focus on mood-enhancing foods, energy balance, and sustainable eating habits.',
    price: 60,
    priceUnit: 'hour',
    location: 'Downtown Wellness Center',
    contactPhone: '555-123-4567',
    isOnline: false,
    isPremium: true,
    createdAt: new Date('2025-03-20'),
  },
  {
    id: 'ad3',
    userId: 3,
    title: 'Emotional Resilience Coaching',
    category: 'Mental Wellness',
    description: 'Learn practical techniques to build emotional resilience, manage stress, and navigate life\'s challenges with greater ease. Personalized approach based on your unique emotional patterns.',
    price: 55,
    priceUnit: 'session',
    availability: ['Monday-Friday, 9am-5pm'],
    contactEmail: 'resilience@example.com',
    isOnline: true,
    isPremium: true,
    createdAt: new Date('2025-03-10'),
  }
];

const mockBookingRequests: BookingRequest[] = [
  {
    id: 'book1',
    adId: 'ad1',
    userId: 4,
    userName: 'Emma Wilson',
    userAge: 32,
    userGender: 'Female',
    serviceRequested: 'Mindfulness Coaching',
    preferredTime: 'Evenings after 6pm',
    preferredDays: ['Tuesday', 'Thursday'],
    phoneNumber: '555-987-6543',
    message: 'I need help with stress management and anxiety. Looking for mindfulness techniques.',
    status: 'pending',
    createdAt: new Date('2025-04-02')
  }
];

// Category options for health services
const serviceCategories = [
  'Mental Wellness',
  'Physical Therapy',
  'Nutrition',
  'Yoga & Movement',
  'Meditation',
  'Life Coaching',
  'Counseling',
  'Holistic Health',
  'Fitness Training',
  'Other'
];

// Price unit options
const priceUnitOptions = [
  { value: 'session', label: 'Per Session' },
  { value: 'hour', label: 'Per Hour' },
  { value: 'month', label: 'Per Month' },
  { value: 'package', label: 'Package Price' },
];

// Week days for availability selection
const weekDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Form schema for creating a health services ad
const createAdSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100),
  category: z.string().min(1, { message: 'Please select a category' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }).max(500),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number',
  }),
  priceUnit: z.string().min(1, { message: 'Please select a price unit' }),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  contactEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  availability: z.array(z.string()).optional(),
});

type CreateAdFormValues = z.infer<typeof createAdSchema>;

// Form schema for booking a service
const bookingSchema = z.object({
  userName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  userAge: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Age must be a positive number',
  }),
  userGender: z.string().min(1, { message: 'Please select a gender' }),
  serviceRequested: z.string().min(5, { message: 'Please specify the service you need' }),
  preferredTime: z.string().min(3, { message: 'Please specify preferred time' }),
  preferredDays: z.array(z.string()).min(1, { message: 'Please select at least one day' }),
  phoneNumber: z.string().min(5, { message: 'Please enter a valid phone number' }),
  message: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function HealthServicesAdsSection() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedAd, setSelectedAd] = useState<HealthServicesAd | null>(null);
  const [adPreview, setAdPreview] = useState<Partial<HealthServicesAd> | null>(null);
  const [bookingAd, setBookingAd] = useState<HealthServicesAd | null>(null);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(mockBookingRequests);
  const [myAds, setMyAds] = useState<HealthServicesAd[]>([]);
  
  const createAdForm = useForm<CreateAdFormValues>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      price: '',
      priceUnit: 'session',
      location: '',
      isOnline: false,
      contactEmail: user?.email || '',
      contactPhone: '',
      availability: [],
    },
  });
  
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      userName: user?.firstName || '',
      userAge: '',
      userGender: '',
      serviceRequested: '',
      preferredTime: '',
      preferredDays: [],
      phoneNumber: '',
      message: '',
    },
  });
  
  const handleAdSubmit = (data: CreateAdFormValues) => {
    // Here we would usually send this to the API
    console.log('Ad submission data:', data);
    
    // Show payment confirmation dialog
    setAdPreview({
      id: 'preview',
      userId: user?.id || 0,
      title: data.title,
      category: data.category,
      description: data.description,
      price: Number(data.price),
      priceUnit: data.priceUnit as any,
      location: data.location,
      availability: data.availability,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      isOnline: data.isOnline,
      isPremium: true,
      createdAt: new Date(),
    });
  };
  
  const handleBookingSubmit = (data: BookingFormValues) => {
    if (!bookingAd) return;
    
    // Create a new booking request
    const newBooking: BookingRequest = {
      id: `book${Date.now()}`,
      adId: bookingAd.id,
      userId: user?.id || 0,
      userName: data.userName,
      userAge: Number(data.userAge),
      userGender: data.userGender,
      serviceRequested: data.serviceRequested,
      preferredTime: data.preferredTime,
      preferredDays: data.preferredDays,
      phoneNumber: data.phoneNumber,
      message: data.message || '',
      status: 'pending',
      createdAt: new Date()
    };
    
    // Add to booking requests (in a real app, this would be sent to the server)
    setBookingRequests([...bookingRequests, newBooking]);
    
    // Show confirmation toast
    toast({
      title: 'Booking Request Sent',
      description: 'The service provider will be notified of your request.',
    });
    
    // Close the dialog
    setBookingAd(null);
    
    // Reset form
    bookingForm.reset();
  };
  
  const handleAdPayment = () => {
    // In a real app, this would process the payment
    if (adPreview) {
      // Add to my ads list
      const newAd: HealthServicesAd = {
        ...adPreview,
        id: `myAd${Date.now()}`,
        createdAt: new Date(),
        isPremium: true,
      } as HealthServicesAd;
      
      setMyAds([...myAds, newAd]);
      
      // Show confirmation
      toast({
        title: 'Advertisement Created',
        description: 'Your ad has been published successfully.',
      });
      
      // Reset form and close preview
      createAdForm.reset();
      setAdPreview(null);
      
      // Switch to My Ads tab
      setActiveTab('myAds');
    }
  };
  
  const handleAcceptBooking = (bookingId: string) => {
    setBookingRequests(
      bookingRequests.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' } 
          : booking
      )
    );
    
    toast({
      title: 'Booking Accepted',
      description: 'The client has been notified that you accepted their booking.'
    });
  };
  
  const handleDeclineBooking = (bookingId: string) => {
    setBookingRequests(
      bookingRequests.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'declined' } 
          : booking
      )
    );
    
    toast({
      title: 'Booking Declined',
      description: 'The client has been notified that you declined their booking.'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-indigo-400 to-teal-600 text-white border-0">
          Premium Feature
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-transparent bg-clip-text">
          Health Services Marketplace
        </h2>
        
        <p className="text-gray-600 max-w-3xl mx-auto mb-4">
          Connect with health professionals or offer your own wellness services to the community.
          Premium members can both discover and advertise health-related services.
        </p>
        
        {!isPremium && (
          <Alert className="max-w-2xl mx-auto border-amber-200 bg-amber-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This marketplace is exclusively for premium members. Upgrade your account to access these features.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full mb-8"
      >
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-3 gap-1">
            <TabsTrigger value="browse">
              Browse Services
            </TabsTrigger>
            <TabsTrigger value="create" disabled={!isPremium}>
              Create Ad
            </TabsTrigger>
            <TabsTrigger value="myAds" disabled={!isPremium}>
              My Ads & Bookings
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Browse Services Tab */}
        <TabsContent value="browse" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden hover:shadow-md transition-all">
                {ad.imageUrl && (
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-100">
                      {ad.category}
                    </Badge>
                    {ad.isOnline && (
                      <Badge variant="outline" className="font-normal bg-green-50 text-green-700 border-green-100">
                        Online Available
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-2">{ad.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {ad.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-primary">
                      ${ad.price}<span className="text-sm font-normal text-gray-500">/{ad.priceUnit}</span>
                    </div>
                    
                    {ad.location && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        In-person
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full"
                    onClick={() => setSelectedAd(ad)}
                    disabled={!isPremium}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {!isPremium && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Upgrade to premium to view full details and book health services.
              </p>
              <Button variant="default">
                Upgrade to Premium
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Create Ad Tab */}
        <TabsContent value="create" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Health Services Advertisement</CardTitle>
              <CardDescription>
                Share your expertise with the community. A one-time fee of $5 will be charged to publish your advertisement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createAdForm}>
                <form onSubmit={createAdForm.handleSubmit(handleAdSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={createAdForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mindfulness Coaching Sessions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createAdForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createAdForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the services you offer..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about your expertise and how your services can help others.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={createAdForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                                $
                              </span>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                className="rounded-l-none" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createAdForm.control}
                      name="priceUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Unit</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a price unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priceUnitOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={createAdForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createAdForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 555-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={createAdForm.control}
                      name="isOnline"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available Online</FormLabel>
                            <FormDescription>
                              Select if you offer virtual services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createAdForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Location (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Downtown Wellness Center" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Where clients can find you if offering in-person services
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createAdForm.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability (Optional)</FormLabel>
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`day-${day}`}
                                checked={field.value?.includes(day) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, day]);
                                  } else {
                                    field.onChange(currentValue.filter(d => d !== day));
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Label htmlFor={`day-${day}`} className="text-sm">
                                {day.substring(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormDescription>
                          Select the days when you're typically available
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4">
                    <Button type="submit" className="w-full md:w-auto">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </Form>
              
              {/* Ad preview and payment dialog */}
              <Dialog open={!!adPreview} onOpenChange={(open) => !open && setAdPreview(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Advertisement</DialogTitle>
                    <DialogDescription>
                      Review your ad details before publishing. A one-time fee of $5 will be charged.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {adPreview && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{adPreview.title}</h4>
                        <Badge variant="outline" className="mt-1">
                          {adPreview.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{adPreview.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">${adPreview.price}/{adPreview.priceUnit}</span>
                        <Badge variant={adPreview.isOnline ? "default" : "outline"}>
                          {adPreview.isOnline ? "Online Available" : "In-person Only"}
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Publishing Fee:</span>
                        <span className="font-semibold">$5.00</span>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="sm:justify-start">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button 
                        variant="outline" 
                        onClick={() => setAdPreview(null)}
                      >
                        Edit Ad
                      </Button>
                      <Button 
                        onClick={handleAdPayment}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay & Publish
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Ads & Bookings Tab */}
        <TabsContent value="myAds" className="mt-0">
          {myAds.length === 0 && bookingRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <MegaphoneIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Advertisements Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                You haven't created any health service advertisements yet. Create your first ad to connect with people who might benefit from your expertise.
              </p>
              <Button onClick={() => setActiveTab('create')}>
                Create Your First Ad
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* My Ads Section */}
              {myAds.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">My Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myAds.map((ad) => (
                      <Card key={ad.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                              {ad.category}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                              Active
                            </Badge>
                          </div>
                          <CardTitle className="mt-2">{ad.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
                          <div className="flex justify-between">
                            <span className="font-medium">${ad.price}/{ad.priceUnit}</span>
                            <span className="text-sm text-gray-500">
                              Published {ad.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Heart className="h-4 w-4 mr-2" />
                            Stats
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Booking Requests Section */}
              {bookingRequests.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Booking Requests</h3>
                  <div className="space-y-4">
                    {bookingRequests.map((booking) => {
                      const relatedAd = [...sampleAds, ...myAds].find(ad => ad.id === booking.adId);
                      
                      return (
                        <Card key={booking.id} className={cn(
                          "overflow-hidden border-l-4",
                          booking.status === 'pending' ? "border-l-amber-400" :
                          booking.status === 'confirmed' ? "border-l-green-500" :
                          "border-l-red-400"
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  booking.status === 'pending' ? "bg-amber-100 text-amber-800 border-amber-200" :
                                  booking.status === 'confirmed' ? "bg-green-100 text-green-800 border-green-200" :
                                  "bg-red-100 text-red-800 border-red-200"
                                )}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {booking.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                For: {relatedAd?.title || 'Unknown Service'}
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pb-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Client:</span>
                                  <span className="text-sm">{booking.userName}, {booking.userAge}, {booking.userGender}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Heart className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Service:</span>
                                  <span className="text-sm">{booking.serviceRequested}</span>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Days:</span>
                                  <span className="text-sm">{booking.preferredDays.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Time:</span>
                                  <span className="text-sm">{booking.preferredTime}</span>
                                </div>
                              </div>
                            </div>
                            
                            {booking.message && (
                              <div className="bg-gray-50 rounded-md p-3 text-sm">
                                <p className="text-gray-600">{booking.message}</p>
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter className={cn(
                            "flex gap-2",
                            booking.status !== 'pending' && "opacity-50"
                          )}>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleDeclineBooking(booking.id)}
                              disabled={booking.status !== 'pending'}
                            >
                              Decline
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={() => handleAcceptBooking(booking.id)}
                              disabled={booking.status !== 'pending'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Ad Detail Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={(open) => !open && setSelectedAd(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAd?.title}</DialogTitle>
            <DialogDescription>
              {selectedAd?.category}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAd && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                {selectedAd.imageUrl && (
                  <div className="w-full h-64 overflow-hidden rounded-md">
                    <img 
                      src={selectedAd.imageUrl} 
                      alt={selectedAd.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-lg mb-2">About This Service</h4>
                    <p className="text-gray-700">{selectedAd.description}</p>
                    
                    {selectedAd.availability && selectedAd.availability.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-1">Availability:</h5>
                        <p className="text-sm text-gray-600">{selectedAd.availability.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-l-0 md:border-l md:pl-4">
                    <h4 className="font-semibold text-lg mb-2">Service Details</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-medium text-xl">${selectedAd.price}/{selectedAd.priceUnit}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Service Type</div>
                        <div className="font-medium flex items-center">
                          {selectedAd.isOnline && <Video className="h-4 w-4 mr-1.5 text-green-600" />}
                          {selectedAd.location && <Info className="h-4 w-4 mr-1.5 text-blue-600" />}
                          {selectedAd.isOnline && selectedAd.location 
                            ? 'Online & In-person' 
                            : selectedAd.isOnline 
                              ? 'Online Sessions' 
                              : 'In-person Only'
                          }
                        </div>
                        {selectedAd.location && (
                          <div className="text-sm text-gray-600 mt-1">{selectedAd.location}</div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Contact</div>
                        {selectedAd.contactEmail && (
                          <div className="font-medium flex items-center my-1">
                            <Mail className="h-4 w-4 mr-1.5 text-gray-600" />
                            {selectedAd.contactEmail}
                          </div>
                        )}
                        {selectedAd.contactPhone && (
                          <div className="font-medium flex items-center">
                            <PhoneCall className="h-4 w-4 mr-1.5 text-gray-600" />
                            {selectedAd.contactPhone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-6"
                      onClick={() => {
                        setSelectedAd(null);
                        setBookingAd(selectedAd);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book this Service
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Booking Dialog */}
      <Dialog open={!!bookingAd} onOpenChange={(open) => !open && setBookingAd(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book: {bookingAd?.title}</DialogTitle>
            <DialogDescription>
              Please provide your details to request this service
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bookingForm}>
            <form onSubmit={bookingForm.handleSubmit(handleBookingSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={bookingForm.control}
                    name="userAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={bookingForm.control}
                    name="userGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
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
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={bookingForm.control}
                name="serviceRequested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Requested</FormLabel>
                    <FormControl>
                      <Input placeholder="What specific service do you need?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bookingForm.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mornings, After 6pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookingForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="For booking confirmation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={bookingForm.control}
                name="preferredDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Days</FormLabel>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`booking-day-${day}`}
                            checked={field.value?.includes(day) || false}
                            onChange={(e) => {
                              const currentValue = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValue, day]);
                              } else {
                                field.onChange(currentValue.filter(d => d !== day));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`booking-day-${day}`} className="text-sm">
                            {day.substring(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bookingForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details about your needs..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Request Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}