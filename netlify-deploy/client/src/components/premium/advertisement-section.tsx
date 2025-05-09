import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CalendarIcon, Plus, ImagePlus, Eye, Edit, Trash, Clock, Check, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Advertisement validation schema
const advertisementSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100, { message: 'Title cannot exceed 100 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }).max(1000, { message: 'Description cannot exceed 1000 characters' }),
  type: z.enum(['health_service', 'wellness_program', 'mental_health', 'nutrition', 'fitness', 'other'], { 
    required_error: 'Please select a category for your advertisement' 
  }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for your image' }).optional().or(z.literal('')),
  websiteUrl: z.string().url({ message: 'Please enter a valid URL for your website' }).optional().or(z.literal('')),
  contactEmail: z.string().email({ message: 'Please enter a valid email address' }).optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  locationDetails: z.string().optional(),
  budget: z.string().optional(),
  additionalNotes: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Type definition from schema
type AdvertisementFormValues = z.infer<typeof advertisementSchema>;

// Advertisement type from backend
type Advertisement = {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: 'health_service' | 'wellness_program' | 'mental_health' | 'nutrition' | 'fitness' | 'other';
  imageUrl: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  locationDetails: string | null;
  budget: string | null;
  additionalNotes: string | null;
  status: 'pending_payment' | 'published' | 'expired' | 'rejected';
  createdAt: string;
  updatedAt: string;
  startDate: string | null;
  endDate: string | null;
  viewCount: number;
  bookingCount: number;
  paymentProvider: 'stripe' | 'paypal' | null;
  paymentTransactionId: string | null;
  isVerified: boolean;
};

type Booking = {
  id: number;
  advertisementId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
  notes: string | null;
  contactDetails: string;
  locationDetails: string | null;
  requestedStartDate: string | null;
  requestedEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string | null;
  };
  advertisement?: Advertisement;
};

// Helper to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'PPP');
};

const getStatusBadgeColor = (status: Advertisement['status']) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'pending_payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBookingStatusBadgeColor = (status: Booking['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'canceled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Type mapping for display
const advertisementTypes = {
  health_service: 'Health Service',
  wellness_program: 'Wellness Program',
  mental_health: 'Mental Health',
  nutrition: 'Nutrition',
  fitness: 'Fitness',
  other: 'Other'
};

const AdvertisementSection = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-ads');
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAd, setPaymentAd] = useState<Advertisement | null>(null);
  const [viewBookings, setViewBookings] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  // Get user's advertisements
  const { data: myAdvertisements, isLoading: adsLoading, refetch: refetchMyAds } = useQuery({
    queryKey: ['/api/advertisements/user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest('GET', `/api/advertisements/user/${user.id}`);
      return await res.json() as Advertisement[];
    },
    enabled: !!user?.id && user?.isPremium === true,
  });

  // Get bookings for selected advertisement
  const { data: adBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['/api/advertisements/bookings', selectedAd?.id],
    queryFn: async () => {
      if (!selectedAd?.id) return [];
      const res = await apiRequest('GET', `/api/advertisements/${selectedAd.id}/bookings`);
      return await res.json() as Booking[];
    },
    enabled: !!selectedAd?.id && viewBookings,
  });

  // Get user's bookings
  const { data: myBookings, isLoading: myBookingsLoading, refetch: refetchMyBookings } = useQuery({
    queryKey: ['/api/user/bookings'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest('GET', '/api/user/bookings');
      return await res.json() as Booking[];
    },
    enabled: !!user?.id && activeTab === 'my-bookings',
  });

  // Form for creating or editing an advertisement
  const form = useForm<AdvertisementFormValues>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
      imageUrl: '',
      websiteUrl: '',
      contactEmail: '',
      contactPhone: '',
      locationDetails: '',
      budget: '',
      additionalNotes: '',
      startDate: undefined,
      endDate: undefined,
    }
  });

  // Set form values when editing
  useEffect(() => {
    if (editingAd) {
      form.reset({
        title: editingAd.title,
        description: editingAd.description,
        type: editingAd.type,
        imageUrl: editingAd.imageUrl || '',
        websiteUrl: editingAd.websiteUrl || '',
        contactEmail: editingAd.contactEmail || '',
        contactPhone: editingAd.contactPhone || '',
        locationDetails: editingAd.locationDetails || '',
        budget: editingAd.budget || '',
        additionalNotes: editingAd.additionalNotes || '',
        startDate: editingAd.startDate ? new Date(editingAd.startDate) : undefined,
        endDate: editingAd.endDate ? new Date(editingAd.endDate) : undefined,
      });
      setActiveTab('create-ad');
    }
  }, [editingAd, form]);

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: async (data: AdvertisementFormValues) => {
      const res = await apiRequest('POST', '/api/advertisements', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Advertisement Created',
        description: 'Your advertisement has been created successfully and is pending payment',
      });
      form.reset();
      refetchMyAds();
      setActiveTab('my-ads');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Advertisement',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: AdvertisementFormValues }) => {
      const res = await apiRequest('PATCH', `/api/advertisements/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Advertisement Updated',
        description: 'Your advertisement has been updated successfully',
      });
      form.reset();
      setEditingAd(null);
      refetchMyAds();
      setActiveTab('my-ads');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Advertisement',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/advertisements/${id}`);
      return res.status === 204;
    },
    onSuccess: () => {
      toast({
        title: 'Advertisement Deleted',
        description: 'Your advertisement has been deleted successfully',
      });
      refetchMyAds();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Delete Advertisement',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ id, provider, transactionId }: { id: number, provider: 'stripe' | 'paypal', transactionId: string }) => {
      const res = await apiRequest('POST', `/api/advertisements/${id}/payment`, { provider, transactionId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payment Processed',
        description: 'Your advertisement has been published',
      });
      setShowPaymentForm(false);
      setPaymentAd(null);
      refetchMyAds();
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: Booking['status'] }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Booking Updated',
        description: 'The booking status has been updated',
      });
      refetchBookings();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Booking',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Book an advertisement mutation
  const bookAdvertisementMutation = useMutation({
    mutationFn: async ({ adId, data }: { adId: number, data: { contactDetails: string, notes?: string } }) => {
      const res = await apiRequest('POST', `/api/advertisements/${adId}/bookings`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Booking Created',
        description: 'Your booking request has been sent to the advertiser',
      });
      refetchMyBookings();
    },
    onError: (error: Error) => {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: AdvertisementFormValues) => {
    if (editingAd) {
      updateAdMutation.mutate({ id: editingAd.id, data });
    } else {
      createAdMutation.mutate(data);
    }
  };

  const handleDeleteAd = (id: number) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      deleteAdMutation.mutate(id);
    }
  };

  const handleViewBookings = (ad: Advertisement) => {
    setSelectedAd(ad);
    setViewBookings(true);
  };

  const handleBackToAds = () => {
    setViewBookings(false);
    setSelectedAd(null);
  };

  const handleProcessPayment = (ad: Advertisement) => {
    setPaymentAd(ad);
    setShowPaymentForm(true);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const provider = form.provider.value as 'stripe' | 'paypal';
    const transactionId = form.transactionId.value;
    
    if (!paymentAd) return;
    
    processPaymentMutation.mutate({
      id: paymentAd.id,
      provider,
      transactionId
    });
  };

  const updateBookingStatus = (bookingId: number, status: Booking['status']) => {
    updateBookingStatusMutation.mutate({ id: bookingId, status });
  };

  const handleCreateBooking = (adId: number) => {
    const contactDetails = prompt('Please enter your contact details:');
    if (!contactDetails) return;
    
    const notes = prompt('Any additional notes? (optional)');
    
    bookAdvertisementMutation.mutate({
      adId,
      data: {
        contactDetails,
        notes: notes || undefined
      }
    });
  };

  const renderAdStatusBadge = (status: Advertisement['status']) => (
    <Badge className={getStatusBadgeColor(status)}>
      {status === 'pending_payment' ? 'Pending Payment' : 
       status === 'published' ? 'Published' :
       status === 'expired' ? 'Expired' : 'Rejected'}
    </Badge>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premium Feature</CardTitle>
          <CardDescription>
            Advertisement management is a premium feature. Upgrade to premium to create and manage your advertisements.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Advertisement Management</h2>
      <p className="text-muted-foreground">
        As a premium user, you can create and manage advertisements for health-related services or programs.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Advertisement Pricing</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white rounded-lg p-3 flex-1 border border-blue-100">
            <div className="font-medium text-blue-800">Weekly Plan</div>
            <div className="text-xl font-bold my-1">$5.00</div>
            <div className="text-sm text-muted-foreground">Perfect for short-term promotions</div>
          </div>
          <div className="bg-white rounded-lg p-3 flex-1 border border-blue-100">
            <div className="font-medium text-blue-800">Monthly Plan</div>
            <div className="text-xl font-bold my-1">$12.99</div>
            <div className="text-sm text-muted-foreground">Best value for ongoing services</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="my-ads">My Advertisements</TabsTrigger>
          <TabsTrigger value="create-ad">Create Advertisement</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        </TabsList>

        {/* My Advertisements Tab */}
        <TabsContent value="my-ads">
          {viewBookings && selectedAd ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bookings for: {selectedAd.title}</h3>
                <Button variant="outline" onClick={handleBackToAds}>Back to Advertisements</Button>
              </div>

              {bookingsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : adBookings && adBookings.length > 0 ? (
                <div className="space-y-4">
                  {adBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Booking #{booking.id}</CardTitle>
                            <CardDescription>
                              From: {booking.user?.username} ({booking.user?.email})
                            </CardDescription>
                          </div>
                          <Badge className={getBookingStatusBadgeColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">Contact Details:</span> {booking.contactDetails}
                          </div>
                          {booking.notes && (
                            <div>
                              <span className="font-semibold">Notes:</span> {booking.notes}
                            </div>
                          )}
                          {booking.locationDetails && (
                            <div>
                              <span className="font-semibold">Location:</span> {booking.locationDetails}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold">Requested on:</span> {formatDate(booking.createdAt)}
                          </div>
                          {booking.requestedStartDate && (
                            <div>
                              <span className="font-semibold">Requested Start:</span> {formatDate(booking.requestedStartDate)}
                            </div>
                          )}
                          {booking.requestedEndDate && (
                            <div>
                              <span className="font-semibold">Requested End:</span> {formatDate(booking.requestedEndDate)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, 'approved')}
                              className="bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              className="bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <Check className="h-4 w-4 mr-1" /> Mark as Completed
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Bookings</CardTitle>
                    <CardDescription>
                      You don't have any bookings for this advertisement yet.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          ) : showPaymentForm && paymentAd ? (
            <Card>
              <CardHeader>
                <CardTitle>Process Payment</CardTitle>
                <CardDescription>
                  Complete payment to publish your advertisement: {paymentAd.title}
                </CardDescription>
                <div className="bg-blue-50 p-2 rounded mt-2 text-sm">
                  <p className="font-semibold text-blue-800">Choose your subscription plan:</p>
                  <p className="text-muted-foreground">Weekly ($5.00) or Monthly ($12.99)</p>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitPayment} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subscription" className="text-sm font-medium">Subscription Duration</label>
                    <select 
                      id="subscription" 
                      name="subscription" 
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select duration</option>
                      <option value="weekly">Weekly ($5.00)</option>
                      <option value="monthly">Monthly ($12.99)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="provider" className="text-sm font-medium">Payment Method</label>
                    <select 
                      id="provider" 
                      name="provider" 
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select payment method</option>
                      <option value="stripe">Credit Card (Stripe)</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="transactionId" className="text-sm font-medium">Transaction ID</label>
                    <input 
                      type="text" 
                      id="transactionId" 
                      name="transactionId" 
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter transaction ID"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      For demo purposes, enter any ID. In a real application, this would be handled by the payment provider.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentAd(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={processPaymentMutation.isPending}
                    >
                      {processPaymentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Process Payment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {adsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myAdvertisements && myAdvertisements.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {myAdvertisements.map(ad => (
                    <Card key={ad.id} className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{ad.title}</CardTitle>
                            <CardDescription>
                              {advertisementTypes[ad.type]}
                            </CardDescription>
                          </div>
                          {renderAdStatusBadge(ad.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
                          <p className="text-sm line-clamp-3">{ad.description}</p>
                          {ad.imageUrl && (
                            <div className="aspect-video overflow-hidden rounded-md">
                              <img 
                                src={ad.imageUrl} 
                                alt={ad.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><span className="font-medium">Created:</span> {formatDate(ad.createdAt)}</div>
                            <div><span className="font-medium">Views:</span> {ad.viewCount}</div>
                            {ad.status === 'published' && (
                              <div><span className="font-medium">Bookings:</span> {ad.bookingCount}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap justify-end gap-2">
                        {ad.status === 'pending_payment' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessPayment(ad)}
                          >
                            Pay Now
                          </Button>
                        )}
                        {ad.status === 'published' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewBookings(ad)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View Bookings
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingAd(ad)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Advertisements</CardTitle>
                    <CardDescription>
                      You haven't created any advertisements yet. Click the "Create Advertisement" tab to get started.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => setActiveTab('create-ad')}>
                      <Plus className="h-4 w-4 mr-2" /> Create Your First Ad
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Create Advertisement Tab */}
        <TabsContent value="create-ad">
          <Card>
            <CardHeader>
              <CardTitle>{editingAd ? 'Edit Advertisement' : 'Create a New Advertisement'}</CardTitle>
              <CardDescription>
                {editingAd 
                  ? 'Update your advertisement information below.' 
                  : 'Fill out the form below to create a new advertisement for your health or wellness service.'
                }
              </CardDescription>
              {!editingAd && (
                <div className="mt-2 text-sm p-2 bg-blue-50 rounded-md flex items-center">
                  <div className="mr-2 text-blue-800">
                    <span className="font-semibold">Advertisement pricing:</span> $5 weekly or $12.99 monthly
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter advertisement title" {...field} />
                            </FormControl>
                            <FormDescription>
                              Create a clear, concise title for your advertisement.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
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
                                <SelectItem value="health_service">Health Service</SelectItem>
                                <SelectItem value="wellness_program">Wellness Program</SelectItem>
                                <SelectItem value="mental_health">Mental Health</SelectItem>
                                <SelectItem value="nutrition">Nutrition</SelectItem>
                                <SelectItem value="fitness">Fitness</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the category that best describes your service.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              Provide a URL to an image for your advertisement (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date</FormLabel>
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date</FormLabel>
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your service or program" 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Provide detailed information about what you're offering.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="locationDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State, Country or Online" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-medium">Additional Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget/Price</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., $50/session or Free" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Provide pricing information
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any other details you'd like to share" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Add any other relevant information
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        form.reset();
                        setEditingAd(null);
                        setActiveTab('my-ads');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAdMutation.isPending || updateAdMutation.isPending}
                    >
                      {(createAdMutation.isPending || updateAdMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="my-bookings">
          {myBookingsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.advertisement?.title}</CardTitle>
                        <CardDescription>
                          {booking.advertisement?.type && advertisementTypes[booking.advertisement.type]}
                        </CardDescription>
                      </div>
                      <Badge className={getBookingStatusBadgeColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm line-clamp-2">{booking.advertisement?.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">Booked on:</span> {formatDate(booking.createdAt)}</div>
                        {booking.advertisement?.contactEmail && (
                          <div>
                            <span className="font-medium">Contact:</span> {booking.advertisement.contactEmail}
                          </div>
                        )}
                        {booking.notes && (
                          <div className="col-span-2">
                            <span className="font-medium">Your Notes:</span> {booking.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  {booking.status === 'pending' && (
                    <CardFooter className="justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => updateBookingStatus(booking.id, 'canceled')}
                      >
                        Cancel Booking
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Bookings</CardTitle>
                <CardDescription>
                  You haven't made any bookings yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvertisementSection;