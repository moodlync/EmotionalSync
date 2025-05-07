import { useState } from "react";
import { Coins, PlusCircle, CheckCircle2, BadgeCheck, Search, ArrowUpDown, BarChart3 } from "lucide-react";
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

interface Campaign {
  id: number;
  userId: number;
  username: string;
  title: string;
  description: string;
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

interface GoFundMeCampaignFormProps {
  tokenBalance: number;
  onDonate: (campaignId: number, amount: number) => void;
  onCreateCampaign: (campaignData: Partial<Campaign>) => void;
  isPremiumUser: boolean;
}

const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  targetAmount: z.coerce.number().min(100, "Target amount must be at least 100").max(100000, "Target amount must be less than 100,000"),
  category: z.string().min(1, "Please select a category"),
  endDate: z.string().optional(),
});

// Mock campaigns for demo
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    userId: 2,
    username: "MeditationMaster",
    title: "Mental Health Awareness Workshop Series",
    description: "Raising funds to organize a series of workshops on mental health awareness in underserved communities.",
    targetAmount: 5000,
    currentAmount: 3250,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isVerified: true,
    donorCount: 43,
    category: "Mental Health",
  },
  {
    id: 2,
    userId: 3,
    username: "WellnessWarrior",
    title: "Support for Anxiety Recovery Program",
    description: "Help fund a specialized anxiety recovery program for young adults facing pandemic-related stress.",
    targetAmount: 3500,
    currentAmount: 980,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: null,
    isVerified: true,
    donorCount: 18,
    category: "Therapy",
  },
  {
    id: 3,
    userId: 4,
    username: "EmotionalSupport",
    title: "Emotional Intelligence Books for Schools",
    description: "Providing emotional intelligence resources to underfunded schools to help children develop healthy emotional skills.",
    targetAmount: 2000,
    currentAmount: 1875,
    currency: "USD",
    status: "active",
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    isVerified: false,
    donorCount: 32,
    category: "Education",
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
  "Research",
  "Community",
  "Other",
];

export default function GoFundMeCampaignForm({ 
  tokenBalance, 
  onDonate, 
  onCreateCampaign,
  isPremiumUser 
}: GoFundMeCampaignFormProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [donateDialogOpen, setDonateDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAmount: 100,
      category: "",
      endDate: "",
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

  const onCreateSubmit = (data: z.infer<typeof campaignFormSchema>) => {
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "Creating campaigns is only available for premium users.",
        variant: "destructive",
      });
      return;
    }
    
    const campaignData: Partial<Campaign> = {
      title: data.title,
      description: data.description,
      targetAmount: data.targetAmount,
      category: data.category,
      endDate: data.endDate ? new Date(data.endDate) : null,
      currency: "USD",
      status: "active",
      startDate: new Date(),
    };
    
    onCreateCampaign(campaignData);
    
    toast({
      title: "Campaign created!",
      description: "Your fundraising campaign has been created successfully.",
    });
    
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
              Community Fundraisers
            </CardTitle>
            <CardDescription>
              Support community members' worthy causes with token donations
            </CardDescription>
          </div>
          {isPremiumUser && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create Fundraising Campaign</DialogTitle>
                  <DialogDescription>
                    Set up your campaign to gather support from the community
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Give your campaign a clear, descriptive name" {...field} />
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
                            <Textarea 
                              placeholder="Explain your campaign's purpose and how the funds will be used" 
                              className="min-h-[120px]" 
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
                            Leave blank for an ongoing campaign
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Create Campaign</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
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
                          Started {formatDate(campaign.startDate)}
                        </div>
                      </div>
                    </div>
                    {campaign.isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${campaign.currentAmount.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        of ${campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(campaign.currentAmount / campaign.targetAmount) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{campaign.donorCount} donors</span>
                      <span>{calculateDaysLeft(campaign.endDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{campaign.category}</Badge>
                    <Badge variant="outline" className={
                      campaign.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      campaign.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      campaign.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="p-4 bg-secondary/30">
                  <Dialog open={donateDialogOpen && selectedCampaign?.id === campaign.id} onOpenChange={
                    (open) => {
                      setDonateDialogOpen(open);
                      if (open) setSelectedCampaign(campaign);
                      else setSelectedCampaign(null);
                    }
                  }>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={campaign.status !== 'active'}>
                        <Coins className="h-4 w-4 mr-2" />
                        Donate Tokens
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Donate to Campaign</DialogTitle>
                        <DialogDescription>
                          Support "{campaign.title}" by donating tokens
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Your token balance</div>
                          <div className="font-bold flex items-center">
                            <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                            {tokenBalance}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label htmlFor="donation-amount">Donation Amount</Label>
                          <Input
                            id="donation-amount"
                            type="number"
                            placeholder="Enter amount of tokens"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            min={1}
                            max={tokenBalance}
                          />
                          <p className="text-xs text-muted-foreground">
                            Each token is worth approximately $0.005 USD
                          </p>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleDonateSubmit}
                          disabled={!donationAmount || Number(donationAmount) <= 0 || Number(donationAmount) > tokenBalance}
                        >
                          Complete Donation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No campaigns found</div>
              <p className="text-sm">
                {searchQuery ? 
                  "Try adjusting your search criteria" : 
                  "Be the first to create a community fundraiser"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}