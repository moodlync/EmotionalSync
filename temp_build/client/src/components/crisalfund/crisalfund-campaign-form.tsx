import { useState } from "react";
import { Coins, PlusCircle, CheckCircle2, BadgeCheck, Search, ArrowUpDown, BarChart3, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Campaign {
  id: number;
  userId: number;
  username: string;
  title: string;
  description: string;
  reasonForFund: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date | null;
  imageUrl?: string;
  isVerified: boolean;
  donorCount: number;
  category: string;
}

interface CrisalFundCampaignFormProps {
  tokenBalance: number;
  onDonate: (campaignId: number, amount: number) => void;
  onCreateCampaign: (campaignData: Partial<Campaign>) => void;
  isPremiumUser: boolean;
}

const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  reasonForFund: z.string().min(20, "Please provide a reason why you've created this fund").max(500, "Reason must be less than 500 characters"),
  targetAmount: z.coerce.number().min(100, "Target amount must be at least 100").max(100000, "Target amount must be less than 100,000"),
  category: z.string().min(1, "Please select a category"),
  endDate: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and tax declaration to create a fund",
  }),
});

// Mock campaigns for demo
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    userId: 2,
    username: "MeditationMaster",
    title: "Help with Medical Bills",
    description: "I'm facing unexpected medical expenses after being diagnosed with anxiety disorder. Any support would help me get the treatment I need.",
    reasonForFund: "I lost my health insurance recently and need support for therapy sessions that are essential for my recovery.",
    targetAmount: 5000,
    currentAmount: 3250,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isVerified: true,
    donorCount: 43,
    category: "Medical",
  },
  {
    id: 2,
    userId: 3,
    username: "WellnessWarrior",
    title: "Help Me Finish My Degree",
    description: "I've been struggling with financial hardship while trying to complete my psychology degree. Your support would help me focus on my studies.",
    reasonForFund: "I've been working two jobs to pay for school, and it's taking a toll on my mental health. This fund would allow me to reduce my work hours.",
    targetAmount: 3500,
    currentAmount: 980,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: null,
    isVerified: true,
    donorCount: 18,
    category: "Education",
  },
  {
    id: 3,
    userId: 4,
    username: "EmotionalSupport",
    title: "Support for Family Crisis",
    description: "Our family is going through a difficult time with multiple challenges. We need community support to get through this period.",
    reasonForFund: "My parent was recently diagnosed with a serious illness, and I've had to take time off work to provide care, creating financial strain.",
    targetAmount: 2000,
    currentAmount: 1875,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    isVerified: false,
    donorCount: 32,
    category: "Crisis Support",
  },
];

const categories = [
  "Mental Health",
  "Emotional Support",
  "Therapy",
  "Education",
  "Crisis Support",
  "Family Support",
  "Medical",
  "Housing",
  "Food Insecurity",
  "Transportation",
  "Utilities",
  "Other",
];

export default function CrisalFundCampaignForm({ 
  tokenBalance, 
  onDonate, 
  onCreateCampaign,
  isPremiumUser 
}: CrisalFundCampaignFormProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [donateDialogOpen, setDonateDialogOpen] = useState<boolean>(false);
  const [taxFormOpen, setTaxFormOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      reasonForFund: "",
      targetAmount: 100,
      category: "",
      endDate: "",
      termsAccepted: false,
    },
  });

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return b.startDate.getTime() - a.startDate.getTime();
      case "popular":
        return b.donorCount - a.donorCount;
      case "funded":
        return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
      default:
        return 0;
    }
  });

  const handleDonateSubmit = () => {
    if (!selectedCampaign) return;
    
    const amount = Number(donationAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > tokenBalance) {
      toast({
        title: "Insufficient tokens",
        description: "You don't have enough tokens for this donation.",
        variant: "destructive",
      });
      return;
    }

    onDonate(selectedCampaign.id, amount);
    
    toast({
      title: "Donation successful!",
      description: `You've donated ${amount} tokens to ${selectedCampaign.title}. Thank you for your support!`,
    });
    
    setDonationAmount("");
    setSelectedCampaign(null);
    setDonateDialogOpen(false);
  };

  const handleCreateSubmit = (data: z.infer<typeof campaignFormSchema>) => {
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "Creating funds is only available for premium users with a monthly, quarterly, yearly, lifetime or family plan subscription.",
        variant: "destructive",
      });
      return;
    }
    
    // Show tax form after initial submission
    setTaxFormOpen(true);
  };
  
  const handleTaxFormSubmit = () => {
    const data = form.getValues();
    
    const campaignData: Partial<Campaign> = {
      title: data.title,
      description: data.description,
      reasonForFund: data.reasonForFund,
      targetAmount: data.targetAmount,
      category: data.category,
      endDate: data.endDate ? new Date(data.endDate) : null,
      currency: "USD",
      status: "active",
      startDate: new Date(),
    };
    
    onCreateCampaign(campaignData);
    
    toast({
      title: "Fund created successfully!",
      description: "Your CrisalFund has been created and will appear on the home page for community support.",
    });
    
    setTaxFormOpen(false);
    form.reset();
    setCreateDialogOpen(false);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const calculateDaysLeft = (endDate: Date | null): string => {
    if (!endDate) return "No end date";
    
    const timeLeft = endDate.getTime() - Date.now();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    return daysLeft > 0 ? `${daysLeft} days left` : "Ended";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              CrisalFund
            </CardTitle>
            <CardDescription>
              Request support from the community when you're facing a personal crisis
            </CardDescription>
          </div>
          {isPremiumUser ? (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Create Fund
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create CrisalFund</DialogTitle>
                  <DialogDescription>
                    Share your situation with the community and request support during difficult times
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fund Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief title explaining your need" {...field} />
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
                          <FormLabel>Situation Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your current situation and how the funds will help" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reasonForFund"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why you created this fund</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why you've created this fund and what led to your current situation" 
                              className="min-h-[80px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Amount (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" min={100} {...field} />
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
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map(category => (
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
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank for an ongoing fund
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Tax and Legal Declaration
                            </FormLabel>
                            <FormDescription>
                              I understand that I am responsible for any applicable taxes on funds received and that MoodSync is not liable for any taxation purposes or fraudulent activity. Creating a fund will require additional verification.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Continue</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Create Fund
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Premium Feature</h4>
                  <p className="text-sm text-muted-foreground">
                    Creating a CrisalFund is only available to premium subscribers with a monthly, quarterly, yearly, lifetime, or family plan.
                  </p>
                  <Button className="w-full mt-2" variant="default" size="sm">
                    Upgrade to Premium
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tax form dialog */}
        <Dialog open={taxFormOpen} onOpenChange={setTaxFormOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Tax Declaration Form</DialogTitle>
              <DialogDescription>
                Please provide the following information for tax and identification purposes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Legal Name</Label>
                <Input id="fullName" placeholder="Enter your full legal name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / Social Security Number</Label>
                <Input id="taxId" placeholder="Enter your tax ID number" type="password" />
                <p className="text-xs text-muted-foreground">This information is securely stored and only used for tax reporting purposes.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Legal Address</Label>
                <Textarea id="address" placeholder="Enter your full legal address" />
              </div>
              
              <div className="space-y-1 rounded-md border p-4 bg-muted/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Important Tax Information</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      By submitting this form, you acknowledge that funds received may be considered taxable income in your jurisdiction. MoodSync is not responsible for any tax liabilities or reporting requirements that may arise from your fundraising activities. You also confirm that all information provided in your fund description is truthful and accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaxFormOpen(false)}>Cancel</Button>
              <Button onClick={handleTaxFormSubmit}>Submit and Create Fund</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search funds..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select defaultValue="recent" onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Most Recent</span>
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Most Popular</span>
                </div>
              </SelectItem>
              <SelectItem value="funded">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Most Funded</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-4">
          {sortedCampaigns.length > 0 ? (
            sortedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{campaign.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{campaign.username}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(campaign.startDate)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={campaign.isVerified ? "outline" : "secondary"} className="flex items-center gap-1">
                      {campaign.isVerified ? (
                        <>
                          <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <span>Pending Verification</span>
                      )}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        <span className="font-medium">${campaign.currentAmount.toLocaleString()}</span> raised of ${campaign.targetAmount.toLocaleString()}
                      </span>
                      <span>{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%</span>
                    </div>
                    <Progress value={(campaign.currentAmount / campaign.targetAmount) * 100} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{campaign.category}</Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      {campaign.donorCount} supporter{campaign.donorCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      {calculateDaysLeft(campaign.endDate)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Dialog open={donateDialogOpen && selectedCampaign?.id === campaign.id} onOpenChange={(open) => {
                      setDonateDialogOpen(open);
                      if (open) setSelectedCampaign(campaign);
                      else setSelectedCampaign(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="default" className="gap-1.5">
                          <Coins className="h-4 w-4" />
                          Donate Tokens
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Donate to {campaign.title}</DialogTitle>
                          <DialogDescription>
                            Support {campaign.username} with token donation
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="donation-amount">Donation Amount (Tokens)</Label>
                            <Input
                              id="donation-amount"
                              type="number"
                              placeholder="Enter token amount"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              min={1}
                            />
                            <p className="text-xs text-muted-foreground">
                              Your current balance: {tokenBalance} tokens
                            </p>
                          </div>
                          
                          <div className="space-y-1 rounded-md border p-4">
                            <div className="font-medium">Why This Fund Matters</div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {campaign.reasonForFund}
                            </p>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDonateDialogOpen(false);
                              setSelectedCampaign(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleDonateSubmit} disabled={!donationAmount || Number(donationAmount) <= 0}>
                            <Coins className="h-4 w-4 mr-2" />
                            Donate Now
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" size="sm">
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active funds found matching your search.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}