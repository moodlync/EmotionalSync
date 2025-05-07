import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, RefreshCw, Plus, FilePlus, Check, X, CalendarDays } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const createQuoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userId: z.number().optional().nullable(),
  ticketId: z.number().optional().nullable(),
  services: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0)
    })
  ).optional(),
  totalAmount: z.number().min(0.01, "Total amount must be greater than 0"),
  currency: z.string().default("USD"),
  validUntil: z.string(), // Date in ISO format
  notes: z.string().optional(),
  terms: z.string().optional()
});

type QuoteFormData = z.infer<typeof createQuoteSchema>;

export default function AdminQuotesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Fetch quotes
  const {
    data: quotes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/admin/quotes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/quotes");
      
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      
      return response.json();
    }
  });
  
  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiRequest("POST", "/api/admin/quotes", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quote");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotes"] });
      toast({
        title: "Quote created",
        description: "The quote has been created successfully",
      });
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create quote",
        variant: "destructive",
      });
    }
  });
  
  // Form for creating new quotes
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      title: "",
      description: "",
      userId: null,
      ticketId: null,
      services: [{ name: "", description: "", price: 0 }],
      totalAmount: 0,
      currency: "USD",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      notes: "",
      terms: "Payment due within 14 days of acceptance. All services provided are subject to our standard terms and conditions."
    }
  });
  
  const onSubmit = (data: QuoteFormData) => {
    // Calculate total if not provided
    if (!data.totalAmount && data.services?.length) {
      data.totalAmount = data.services.reduce((sum, service) => sum + service.price, 0);
    }
    
    createQuoteMutation.mutateAsync(data);
  };
  
  const addService = () => {
    const services = form.getValues().services || [];
    form.setValue('services', [...services, { name: "", description: "", price: 0 }]);
  };
  
  const removeService = (index: number) => {
    const services = form.getValues().services || [];
    if (services.length > 1) {
      services.splice(index, 1);
      form.setValue('services', [...services]);
      
      // Recalculate total
      const newTotal = services.reduce((sum, service) => sum + service.price, 0);
      form.setValue('totalAmount', newTotal);
    }
  };
  
  // Filter quotes by search query and status
  const filteredQuotes = quotes ? quotes.filter(quote => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.description && quote.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (quote.userId && quote.userId.toString().includes(searchQuery)) ||
      (quote.ticketId && quote.ticketId.toString().includes(searchQuery));
    
    // Filter by status
    const matchesStatus = statusFilter === "" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-amber-100 text-amber-800";
      case 'accepted':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'expired':
        return "bg-gray-100 text-gray-800";
      case 'canceled':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          <p>Error loading quotes</p>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
            <p className="text-muted-foreground">
              Manage price quotes for users and services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Quote</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Quote</DialogTitle>
                  <DialogDescription>
                    Create a quote for services or custom work
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quote Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Custom Premium Features" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Detailed description of the quote..." className="min-h-[120px]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>User ID (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="User ID" 
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="ticketId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ticket ID (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="Related ticket" 
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="validUntil"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valid Until</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name="totalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Currency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                      <SelectItem value="GBP">GBP</SelectItem>
                                      <SelectItem value="CAD">CAD</SelectItem>
                                      <SelectItem value="AUD">AUD</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Services</h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addService}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Service
                          </Button>
                        </div>
                        
                        {form.watch('services')?.map((_, index) => (
                          <div key={index} className="space-y-2 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Service #{index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(index)}
                                disabled={form.watch('services')?.length <= 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name={`services.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., Custom Development" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`services.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Brief description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`services.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      placeholder="0.00" 
                                      onChange={(e) => {
                                        // Update this service's price
                                        field.onChange(parseFloat(e.target.value));
                                        
                                        // Recalculate total
                                        const services = form.getValues().services || [];
                                        services[index].price = parseFloat(e.target.value);
                                        const newTotal = services.reduce((sum, service) => sum + service.price, 0);
                                        form.setValue('totalAmount', newTotal);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        
                        <FormField
                          control={form.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Terms & Conditions</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="min-h-[80px]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Any additional information..." className="min-h-[80px]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createQuoteMutation.isPending}
                      >
                        {createQuoteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Quote"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="h-8 gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search quotes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredQuotes.length > 0 ? (
            filteredQuotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{quote.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                  <CardDescription>
                    {quote.userId && (
                      <span className="flex items-center gap-1 text-xs">
                        User #{quote.userId}
                      </span>
                    )}
                    {quote.ticketId && (
                      <span className="flex items-center gap-1 text-xs">
                        Ticket #{quote.ticketId}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  <p className="text-sm line-clamp-2 mb-4">{quote.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      <span className="text-lg">{quote.totalAmount.toFixed(2)}</span> {quote.currency}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {quote.acceptedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted on: {new Date(quote.acceptedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      View Details
                    </Button>
                    
                    {quote.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Accepted
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
              <FilePlus className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No quotes found</h3>
              <p className="mt-1">Create a new quote to get started</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        {selectedQuote && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quote #{selectedQuote.id}</DialogTitle>
              <DialogDescription>
                Created on {new Date(selectedQuote.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedQuote.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusBadgeColor(selectedQuote.status)}`}>
                      {selectedQuote.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {selectedQuote.totalAmount.toFixed(2)} {selectedQuote.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valid until: {new Date(selectedQuote.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm">{selectedQuote.description}</p>
              </div>
              
              {selectedQuote.services && selectedQuote.services.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Services</h3>
                  <div className="rounded-md border divide-y">
                    {selectedQuote.services.map((service, index) => (
                      <div key={index} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right font-medium">
                            {service.price.toFixed(2)} {selectedQuote.currency}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(selectedQuote.userId || selectedQuote.ticketId) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedQuote.userId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">User</h3>
                      <p className="text-sm">#{selectedQuote.userId}</p>
                    </div>
                  )}
                  
                  {selectedQuote.ticketId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Related Ticket</h3>
                      <p className="text-sm">#{selectedQuote.ticketId}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedQuote.terms && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Terms & Conditions</h3>
                  <p className="text-sm">{selectedQuote.terms}</p>
                </div>
              )}
              
              {selectedQuote.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Additional Notes</h3>
                  <p className="text-sm">{selectedQuote.notes}</p>
                </div>
              )}
              
              {selectedQuote.acceptedAt && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Accepted On</h3>
                  <p className="text-sm">{new Date(selectedQuote.acceptedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            
            {selectedQuote.status === 'pending' && (
              <DialogFooter className="gap-2">
                <Button variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancel Quote
                </Button>
                <Button variant="default">
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Accepted
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}