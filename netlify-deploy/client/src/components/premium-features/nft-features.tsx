import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { NftCollection, NftItem, UserNft } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Gift, Star, Trophy, Crown, ExternalLink, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for Emotion NFTs as described in the document
const mockCollections: NftCollection[] = [
  {
    id: 1,
    name: "Emotional Milestones",
    description: "Soulbound NFTs marking significant emotional growth achievements in your MoodSync journey. These evolve based on your progress.",
    coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2742&auto=format&fit=crop",
    createdAt: new Date(),
    createdBy: 1,
    isActive: true,
    isPremiumOnly: true,
    tokenRequirement: 300,
    totalSupply: 1000,
    category: "milestone"
  },
  {
    id: 2,
    name: "Resilience Collection",
    description: "Dynamic NFTs that evolve as you overcome emotional challenges and demonstrate resilience in your wellness journey.",
    coverImage: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2940&auto=format&fit=crop",
    createdAt: new Date(),
    createdBy: 1,
    isActive: true,
    isPremiumOnly: true,
    tokenRequirement: 500,
    totalSupply: 500,
    category: "achievement"
  },
  {
    id: 3,
    name: "Harmony Collection",
    description: "Commemorative NFTs celebrating your commitment to mental wellness and family harmony through the MoodSync platform.",
    coverImage: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?q=80&w=2787&auto=format&fit=crop",
    createdAt: new Date(),
    createdBy: 1,
    isActive: true,
    isPremiumOnly: true,
    tokenRequirement: 450,
    totalSupply: 750,
    category: "wellness"
  }
];

const mockItems: NftItem[] = [
  {
    id: 1,
    collectionId: 1,
    name: "Consistency Seed",
    description: "Awarded for completing a 7-day journal streak. This soulbound NFT grants +5% token earnings for 1 week.",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2940&auto=format&fit=crop",
    rarity: "common",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 350,
    maxSupply: 1000,
    attributes: {
      benefit: "+5% token earnings for 1 week",
      trigger: "7-day journal streak",
      isSoulbound: true,
      evolution: "Level 1 of 3"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 2,
    collectionId: 1,
    name: "Reflection Tree",
    description: "Evolved from Consistency Seed after 30 days of journaling. This NFT reflects your growing emotional awareness.",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2742&auto=format&fit=crop",
    rarity: "rare",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through evolution
    totalMinted: 120,
    maxSupply: 500,
    attributes: {
      benefit: "+10% token earnings for 2 weeks",
      trigger: "30-day journal streak",
      isSoulbound: true,
      evolution: "Level 2 of 3",
      previousForm: "Consistency Seed"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 3,
    collectionId: 2,
    name: "Resilience Blossom",
    description: "Awarded for 30 anxiety-free days or significant improvement in mood patterns. Grants special perks for mental wellness.",
    imageUrl: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2940&auto=format&fit=crop",
    rarity: "epic",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 65,
    maxSupply: 200,
    attributes: {
      benefit: "Free therapy session discount",
      trigger: "30 anxiety-free days",
      isSoulbound: true,
      dynamicVisual: "Changes from stormy to sunny based on progress"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 4,
    collectionId: 3,
    name: "Harmony Orb",
    description: "Legendary NFT awarded when a family plan reaches collective wellness goals. Provides group benefits for all family members.",
    imageUrl: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?q=80&w=2787&auto=format&fit=crop",
    rarity: "legendary",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through family achievement
    totalMinted: 25,
    maxSupply: 100,
    attributes: {
      benefit: "Group wellness workshop access",
      trigger: "Family plan goal achievement",
      isSoulbound: true,
      familyShared: true
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 6,
    collectionId: 2,
    name: "Joy Spark",
    description: "Earned by maintaining positive emotion states for 15 consecutive days. Evolves based on your happiness indicators.",
    imageUrl: "https://images.unsplash.com/photo-1570051008600-b34baa49e751?q=80&w=2940&auto=format&fit=crop",
    rarity: "uncommon",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 180,
    maxSupply: 800,
    attributes: {
      benefit: "+8% token rewards on happiness-related challenges",
      trigger: "15 consecutive days of positive emotions",
      isSoulbound: true,
      dynamicVisual: "Emits brighter colors based on happiness streak"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 7,
    collectionId: 2,
    name: "Serenity Pool",
    description: "Awarded for consistent meditation practice and reduced stress levels. Creates a digital peace sanctuary.",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3499?q=80&w=2940&auto=format&fit=crop",
    rarity: "rare",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 95,
    maxSupply: 400,
    attributes: {
      benefit: "Access to exclusive guided meditation content",
      trigger: "Complete 20 meditation sessions",
      isSoulbound: true,
      dynamicVisual: "Water ripples reflect your current stress levels"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 8,
    collectionId: 2,
    name: "Empathy Nexus",
    description: "Earned by helping others through community support and positive interactions. Strengthens social connections.",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2940&auto=format&fit=crop",
    rarity: "epic",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 35,
    maxSupply: 150,
    attributes: {
      benefit: "Priority matching with users sharing similar emotional journeys",
      trigger: "Help 25 other users through emotional support",
      isSoulbound: true,
      communityBoost: "Increases match quality by 20%"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 9,
    collectionId: 3,
    name: "Emotional Anchor",
    description: "Created after overcoming significant emotional challenges. This NFT serves as a visual reminder of your resilience.",
    imageUrl: "https://images.unsplash.com/photo-1516550893885-498b67da269d?q=80&w=2872&auto=format&fit=crop",
    rarity: "legendary",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 12,
    maxSupply: 50,
    attributes: {
      benefit: "Permanent +5% boost to all emotional rewards",
      trigger: "Overcome major emotional challenge (verified by AI)",
      isSoulbound: true,
      governanceRights: true
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 10,
    collectionId: 1,
    name: "Gratitude Prism",
    description: "Manifests from consistent gratitude journaling, capturing the spectrum of positive experiences in your life.",
    imageUrl: "https://images.unsplash.com/photo-1474623809196-26c1d33457cc?q=80&w=2940&auto=format&fit=crop",
    rarity: "uncommon",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through achievement
    totalMinted: 215,
    maxSupply: 750,
    attributes: {
      benefit: "Weekly token bonuses based on continued gratitude practices",
      trigger: "Record 30 gratitude entries",
      isSoulbound: true,
      visualEffect: "Changes colors based on gratitude topics"
    },
    animationUrl: null,
    externalUrl: null
  },
  {
    id: 5,
    collectionId: 1,
    name: "Wisdom Forest",
    description: "The highest form of the Consistency collection, evolved after 100 days of meaningful journaling. A testament to your commitment to self-reflection.",
    imageUrl: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=2940&auto=format&fit=crop",
    rarity: "legendary",
    createdAt: new Date(),
    createdBy: 1,
    tokenPrice: 0, // Earned through evolution
    totalMinted: 35,
    maxSupply: 200,
    attributes: {
      benefit: "+15% token earnings for 1 month and voting rights on platform features",
      trigger: "100-day journal streak",
      isSoulbound: true,
      evolution: "Level 3 of 3",
      previousForm: "Reflection Tree",
      governanceRights: true
    },
    animationUrl: null,
    externalUrl: null
  }
];

// Helper to get rarity-based styling
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "uncommon":
      return "bg-green-100 text-green-800 border-green-200";
    case "rare":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "epic":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "legendary":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "unique":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "common":
      return null;
    case "uncommon":
      return <Star className="h-3 w-3 mr-1" />;
    case "rare":
      return <Star className="h-3 w-3 mr-1" />;
    case "epic":
      return <Trophy className="h-3 w-3 mr-1" />;
    case "legendary":
      return <Crown className="h-3 w-3 mr-1" />;
    case "unique":
      return <Sparkles className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

interface NFTFeaturesProps {
  showFullCollection?: boolean;
}

export function NFTFeatures({ showFullCollection = false }: NFTFeaturesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(showFullCollection ? "all-nfts" : "collections");
  const isPremium = user?.isPremium;

  // These queries would be enabled in a real app with implemented endpoints
  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ["/api/nft/collections"],
    queryFn: async () => {
      // In a real implementation, this would fetch from an API endpoint
      // const res = await fetch("/api/nft/collections");
      // if (!res.ok) throw new Error("Failed to fetch NFT collections");
      // return await res.json();
      return mockCollections;
    },
    enabled: isPremium, // Only fetch if user is premium
  });

  // Mock user NFTs for the showcase (in a real app this would come from the backend)
  const mockUserNfts = [
    {
      id: 1,
      userId: 1,
      nftItemId: 1,
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 30)),
      mintId: "MS-CST-1001",
      status: "active",
      item: mockItems[0] // Consistency Seed NFT
    },
    {
      id: 2,
      userId: 1,
      nftItemId: 3,
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 15)),
      mintId: "MS-RBS-2045",
      status: "active",
      item: mockItems[2] // Resilience Blossom NFT
    }
  ];

  const { data: myNfts, isLoading: isLoadingMyNfts } = useQuery({
    queryKey: ["/api/nft/user"],
    queryFn: async () => {
      // In a real implementation, this would fetch from an API endpoint
      // const res = await fetch("/api/nft/user");
      // if (!res.ok) throw new Error("Failed to fetch user NFTs");
      // return await res.json();
      return mockUserNfts; // In a real app, this would be from API
    },
    enabled: isPremium, // Only fetch if user is premium
  });

  // Function to handle NFT purchase (would be a mutation in real implementation)
  const handlePurchaseNft = (item: NftItem) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "You need a premium subscription to purchase NFTs.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "NFT Purchase",
      description: `You have requested to purchase the "${item.name}" NFT for ${item.tokenPrice} tokens.`,
    });
    
    // In a real implementation, this would call a mutation to purchase the NFT
    // purchaseNftMutation.mutate({
    //   nftItemId: item.id,
    //   tokensPaid: item.tokenPrice
    // });
  };

  return (
    <div className="space-y-8">
      {!isPremium && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Premium Feature</AlertTitle>
          <AlertDescription className="text-amber-700">
            NFT collections are an exclusive feature for premium members. Upgrade your account to mint, collect, and trade NFTs.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Exclusive MoodSync NFTs</h3>
            <p className="text-muted-foreground">
              Collect, mint and trade unique digital assets that celebrate your emotional wellness journey.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigate("/nft-collection")}
            >
              <ExternalLink className="h-4 w-4" />
              Explore NFT Collection
            </Button>
            
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" disabled={!isPremium}>
              <Gift className="mr-2 h-4 w-4" />
              {isPremium ? "Claim Daily NFT Reward" : "Premium Only"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="collections" className="space-y-4">
            {isLoadingCollections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections?.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={collection.coverImage || "https://images.unsplash.com/photo-1579546929662-711aa81148cf"} 
                        alt={collection.name} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/70 hover:bg-black/80">
                          {collection.totalSupply} Items
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{collection.name}</CardTitle>
                      <CardDescription>{collection.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline" className="capitalize">
                        {collection.category}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={!isPremium}
                        onClick={() => setActiveTab("marketplace")}
                      >
                        {isPremium ? "View Collection" : <Lock className="h-4 w-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="marketplace" className="space-y-4">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">What Are Emotion NFTs?</h3>
                  <ul className="text-sm text-gray-700 space-y-2 ml-5 list-disc">
                    <li className="font-medium">
                      <span className="font-semibold">Soulbound Tokens (Non-Transferable):</span> Minted on a low-energy blockchain (e.g., Polygon) to represent your emotional milestones (e.g., "100-Day Gratitude Streak"). Cannot be sold/traded (soulbound), preventing exploitation.
                    </li>
                    <li className="font-medium">
                      <span className="font-semibold">Dynamic Visuals:</span> NFTs evolve based on user progress (e.g., a "Calm Mind NFT" changes from stormy → sunny as meditation hours increase).
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                  <div className="pl-5 space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">A. Earning NFTs</h4>
                      <div className="bg-white bg-opacity-60 rounded p-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2">Achievement</th>
                              <th className="text-left py-2">NFT Unlocked</th>
                              <th className="text-left py-2">Utility</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="py-2">7-day journal streak</td>
                              <td className="py-2">"Consistency Seed" (Common)</td>
                              <td className="py-2">+5% token earnings for 1 week</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2">30 anxiety-free days</td>
                              <td className="py-2">"Resilience Blossom" (Rare)</td>
                              <td className="py-2">Free therapy session discount</td>
                            </tr>
                            <tr>
                              <td className="py-2">Family plan goal met</td>
                              <td className="py-2">"Harmony Orb" (Legendary)</td>
                              <td className="py-2">Group wellness workshop access</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">AI-Verified: Analysis of journal entries for authenticity (no gaming the system).</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">B. Using NFTs</h4>
                      <ul className="text-sm space-y-1 ml-5 list-disc">
                        <li><span className="font-medium">Unlock Real-World Perks:</span> Show your "1-Year Sober NFT" or burn a "Kindness NFT" to donate to mental health charities.</li>
                        <li><span className="font-medium">DAO Governance:</span> Holders of rare NFTs vote on app features (e.g., new meditation themes).</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Privacy & Ethics</h3>
                  <ul className="text-sm text-gray-700 space-y-1 ml-5 list-disc">
                    <li><span className="font-medium">Zero-Knowledge Proofs (ZKPs):</span> Prove you earned an NFT without revealing private data.</li>
                    <li><span className="font-medium">Optional Visibility:</span> Hide NFTs from public profiles if desired.</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg mt-2">
                  <h4 className="font-medium text-green-800 mb-1">Why This Stands Out</h4>
                  <ul className="text-sm text-green-700 space-y-1 ml-5 list-disc">
                    <li><strong>No Speculation:</strong> Unlike crypto NFTs, these focus on personal growth, not profit.</li>
                    <li><strong>Mental Health First:</strong> Designed with psychologists to avoid addictive triggers.</li>
                    <li><strong>Planet-Friendly:</strong> Uses ~0.1% of Bitcoin's energy per transaction.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={`capitalize ${getRarityColor(item.rarity)}`}>
                              {getRarityIcon(item.rarity)}
                              {item.rarity}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rarity: {item.rarity}</p>
                            <p>Limited to {item.maxSupply} items</p>
                            {item.attributes?.evolution && (
                              <p>Evolution: {item.attributes.evolution}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {item.attributes?.isSoulbound && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-purple-300">
                          <Lock className="h-3 w-3 mr-1 text-purple-600" />
                          Soulbound
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="p-4 pb-2 flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <div className="px-4 pb-2">
                    {item.attributes?.benefit && (
                      <div className="mb-2 text-xs bg-blue-50 p-2 rounded-md">
                        <span className="font-semibold text-blue-700">Benefit:</span> {item.attributes.benefit}
                      </div>
                    )}
                    
                    {item.attributes?.trigger && (
                      <div className="mb-2 text-xs bg-green-50 p-2 rounded-md">
                        <span className="font-semibold text-green-700">How to earn:</span> {item.attributes.trigger}
                      </div>
                    )}
                    
                    {item.attributes?.previousForm && (
                      <div className="mb-2 text-xs bg-purple-50 p-2 rounded-md">
                        <span className="font-semibold text-purple-700">Evolves from:</span> {item.attributes.previousForm}
                      </div>
                    )}
                  </div>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center">
                      {item.tokenPrice > 0 ? (
                        <>
                          <svg 
                            className="h-4 w-4 mr-1 text-amber-500" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                          >
                            <path d="M12 7a.75.75 0 01.75.75v3.75h3.75a.75.75 0 110 1.5h-3.75v3.75a.75.75 0 11-1.5 0v-3.75H7.5a.75.75 0 010-1.5h3.75V7.75A.75.75 0 0112 7z" />
                            <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">{item.tokenPrice}</span>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">Earn through progress</Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      disabled={!isPremium || item.tokenPrice === 0}
                      onClick={() => handlePurchaseNft(item)}
                      className={item.tokenPrice === 0 ? "opacity-60" : ""}
                    >
                      {!isPremium ? (
                        <Lock className="h-4 w-4" />
                      ) : item.tokenPrice === 0 ? (
                        "Earn by Progress"
                      ) : (
                        "Purchase"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-nfts">
            {!isPremium ? (
              <div className="text-center py-12">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Premium Feature Locked</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Upgrade to premium to access your personal NFT collection. Premium members can collect, display and trade exclusive MoodSync NFTs.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Upgrade to Premium
                </Button>
              </div>
            ) : isLoadingMyNfts ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array(2).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="flex">
                        <Skeleton className="h-32 w-32" />
                        <div className="p-4 flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <Skeleton className="h-8 w-1/3" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : myNfts && myNfts.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Your Emotional Growth Showcase</h3>
                  <p className="text-sm text-gray-600">
                    These soulbound NFTs represent your emotional wellness journey on MoodSync. 
                    Each one is a testament to your progress and unlocks special benefits.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myNfts.map((nft) => (
                    <Card key={nft.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img 
                            src={nft.item.imageUrl} 
                            alt={nft.item.name} 
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-1 right-1">
                            <Badge className={`capitalize text-xs ${getRarityColor(nft.item.rarity)}`}>
                              {getRarityIcon(nft.item.rarity)}
                              {nft.item.rarity}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold">{nft.item.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              #{nft.mintId}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {nft.item.description}
                          </p>
                          
                          <div className="flex justify-between items-center mt-auto">
                            <div className="text-xs text-muted-foreground">
                              Acquired: {new Date(nft.acquiredAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {nft.item.attributes?.benefit && (
                        <div className="bg-indigo-50 p-2 text-xs border-t border-indigo-100">
                          <span className="font-semibold text-indigo-700">Active Benefit:</span> {nft.item.attributes.benefit}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Card className="p-6 max-w-md bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center">Ready to grow your collection?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-sm text-muted-foreground mb-4">
                        Complete emotional wellness challenges to earn more NFTs or explore the marketplace
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          onClick={() => setActiveTab("marketplace")}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          Explore More NFTs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No NFTs Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  You haven't collected any NFTs yet. Start your emotional wellness journey to earn Emotion NFTs that evolve with your progress.
                </p>
                <Button 
                  onClick={() => setActiveTab("marketplace")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Explore Marketplace
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default NFTFeatures;