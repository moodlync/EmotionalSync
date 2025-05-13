import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Search,
  Filter,
  Sparkles,
  Flame,
  Gift,
  TrendingUp,
  FolderOpen,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Check,
  Share2,
  Zap
} from 'lucide-react';

interface EmotionalNft {
  id: number;
  userId: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  emotion: string;
  rarity: string;
  activityType: string;
  mintStatus: 'unminted' | 'minted' | 'burned';
  mintedAt?: string;
  burnedAt?: string;
  tokenValue: number;
  isDisplayed: boolean;
  giftedTo?: number;
  giftedAt?: string;
  evolutionLevel: number;
  bonusGranted?: string;
  createdAt: string;
}

export default function UserNftCollection() {
  const [activeTab, setActiveTab] = useState('unminted');
  const [searchQuery, setSearchQuery] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's NFTs by status
  const { data: nfts, isLoading, error } = useQuery<EmotionalNft[]>({
    queryKey: ['/api/user/nfts', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/user/nfts/${activeTab === 'all' ? 'all' : activeTab}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch NFTs: ${res.statusText}`);
      }
      return res.json();
    }
  });

  // Check for new NFTs (runs once on component mount)
  const { mutate: checkNewNfts } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/user/nfts/check-new');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.messages && data.messages.length > 0) {
        // Show success toast for each message
        data.messages.forEach((message: string) => {
          toast({
            title: 'New NFT Earned!',
            description: message,
          });
        });
        
        // Refresh NFT data
        queryClient.invalidateQueries({queryKey: ['/api/user/nfts']});
      }
    },
    onError: (error: Error) => {
      console.error('Failed to check for new NFTs:', error);
    }
  });

  // Mint NFT mutation
  const { mutate: mintNft, isPending: isMinting } = useMutation({
    mutationFn: async (nftId: number) => {
      const res = await apiRequest('POST', `/api/user/nfts/${nftId}/mint`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'NFT Minted!',
        description: 'Your NFT has been successfully minted.',
      });
      
      // Refresh NFT data
      queryClient.invalidateQueries({queryKey: ['/api/user/nfts']});
      
      // Refresh user token balance
      queryClient.invalidateQueries({queryKey: ['/api/user']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Minting Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Burn NFT mutation
  const { mutate: burnNft, isPending: isBurning } = useMutation({
    mutationFn: async (nftId: number) => {
      const res = await apiRequest('POST', `/api/user/nfts/${nftId}/burn`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'NFT Burned!',
        description: 'Your NFT has been successfully burned and tokens contributed to the pool.',
      });
      
      // Refresh NFT data
      queryClient.invalidateQueries({queryKey: ['/api/user/nfts']});
      
      // Refresh token pool data
      queryClient.invalidateQueries({queryKey: ['/api/token-pool/stats']});
      queryClient.invalidateQueries({queryKey: ['/api/token-pool/top-contributors']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Burning Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Gift NFT mutation
  const { mutate: giftNft, isPending: isGifting } = useMutation({
    mutationFn: async ({ nftId, recipientId }: { nftId: number, recipientId: number }) => {
      const res = await apiRequest('POST', `/api/user/nfts/${nftId}/gift`, { recipientId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'NFT Gifted!',
        description: 'Your NFT has been successfully gifted to the recipient.',
      });
      
      // Refresh NFT data
      queryClient.invalidateQueries({queryKey: ['/api/user/nfts']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Gifting Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Check for new NFTs on component mount
  useEffect(() => {
    checkNewNfts();
  }, []);

  // Filter NFTs by search query and emotion
  const filteredNfts = nfts ? nfts.filter(nft => {
    const matchesSearch = searchQuery === '' || 
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEmotion = !emotionFilter || nft.emotion === emotionFilter;
    
    return matchesSearch && matchesEmotion;
  }) : [];

  // Handle minting an NFT
  const handleMintNft = (nft: EmotionalNft) => {
    if (nft.mintStatus !== 'unminted') {
      toast({
        title: 'Cannot Mint',
        description: 'This NFT is already minted or burned.',
        variant: 'destructive',
      });
      return;
    }
    
    mintNft(nft.id);
  };

  // Handle burning an NFT
  const handleBurnNft = (nft: EmotionalNft) => {
    if (nft.mintStatus !== 'minted') {
      toast({
        title: 'Cannot Burn',
        description: 'Only minted NFTs can be burned.',
        variant: 'destructive',
      });
      return;
    }
    
    burnNft(nft.id);
  };

  // Handle gifting an NFT (simplified for demo)
  const handleGiftNft = (nft: EmotionalNft) => {
    if (nft.mintStatus !== 'minted') {
      toast({
        title: 'Cannot Gift',
        description: 'Only minted NFTs can be gifted.',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real implementation, this would open a modal to select a recipient
    // For this demo, we'll simulate gifting to a hardcoded recipient ID (2)
    const recipientId = 2;
    
    giftNft({ nftId: nft.id, recipientId });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load NFTs</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({queryKey: ['/api/user/nfts']})}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="unminted" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Unminted
            </TabsTrigger>
            <TabsTrigger value="minted" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Minted
            </TabsTrigger>
            <TabsTrigger value="burned" className="flex items-center">
              <Flame className="h-4 w-4 mr-2" />
              Burned
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search NFTs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEmotionFilter(emotionFilter ? null : 'happy')}
            className={emotionFilter ? 'bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <NftLoadingSkeleton />
      ) : filteredNfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNfts.map((nft) => {
            // Calculate the appropriate glow class based on rarity
            let glowClass = '';
            if (nft.rarity === 'legendary') {
              glowClass = 'shadow-lg shadow-yellow-500/20';
            } else if (nft.rarity === 'rare') {
              glowClass = 'shadow-lg shadow-blue-500/20';
            } else if (nft.rarity === 'uncommon') {
              glowClass = 'shadow-lg shadow-green-500/20';
            }
            
            // Action button based on NFT status
            let actionButton;
            let isDisabled = isMinting || isBurning || isGifting;
            
            if (nft.mintStatus === 'unminted') {
              actionButton = (
                <Button 
                  className="w-full gap-2" 
                  onClick={() => handleMintNft(nft)}
                  disabled={isDisabled}
                >
                  <Sparkles className="h-4 w-4" />
                  Mint NFT (350 tokens)
                </Button>
              );
            } else if (nft.mintStatus === 'minted') {
              actionButton = (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => handleGiftNft(nft)}
                    disabled={isDisabled || nft.giftedTo !== undefined}
                  >
                    <Gift className="h-4 w-4 mr-1" />
                    Gift
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => handleBurnNft(nft)}
                    disabled={isDisabled}
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    Burn
                  </Button>
                </div>
              );
            } else {
              actionButton = (
                <Button variant="outline" className="w-full" disabled>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Contributed to Pool
                </Button>
              );
            }
            
            return (
              <NftCard 
                key={nft.id}
                nft={nft}
                glowClass={glowClass}
                actionButton={actionButton}
                isDisabled={isDisabled}
              />
            );
          })}
        </div>
      ) : (
        <EmptyNftState type={activeTab} searchQuery={searchQuery} />
      )}
    </div>
  );
}

interface NftCardProps {
  nft: EmotionalNft;
  glowClass: string;
  actionButton: React.ReactNode;
  isDisabled?: boolean;
}

function NftCard({ nft, glowClass, actionButton, isDisabled = false }: NftCardProps) {
  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Apply blur effect if disabled
  const disabledClass = isDisabled ? 'opacity-70 pointer-events-none' : '';
  
  return (
    <Card className={`overflow-hidden transition-all ${glowClass} ${disabledClass}`}>
      <div className="relative pt-[75%] overflow-hidden bg-muted">
        <img 
          src={nft.imageUrl} 
          alt={nft.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
        />
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant={nft.mintStatus === 'unminted' ? 'outline' : nft.mintStatus === 'minted' ? 'default' : 'secondary'} className="text-xs">
            {nft.mintStatus === 'unminted' && <Clock className="h-3 w-3 mr-1" />}
            {nft.mintStatus === 'minted' && <Sparkles className="h-3 w-3 mr-1" />}
            {nft.mintStatus === 'burned' && <Flame className="h-3 w-3 mr-1" />}
            {nft.mintStatus.charAt(0).toUpperCase() + nft.mintStatus.slice(1)}
          </Badge>
          
          <Badge variant="outline" className="capitalize text-xs">
            {nft.rarity}
          </Badge>
        </div>
        
        {nft.bonusGranted && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {nft.bonusGranted}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{nft.name}</CardTitle>
          <Badge variant="outline" className="capitalize ml-2">
            {nft.emotion}
          </Badge>
        </div>
        <CardDescription>
          {nft.activityType.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Token Value:</span>
            <span className="font-medium">{nft.tokenValue}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Evolution:</span>
            <span className="font-medium">Level {nft.evolutionLevel}</span>
          </div>
          
          {nft.mintStatus !== 'unminted' && (
            <div className="flex justify-between">
              <span>Minted:</span>
              <span className="font-medium">{formatDate(nft.mintedAt)}</span>
            </div>
          )}
          
          {nft.mintStatus === 'burned' && (
            <div className="flex justify-between">
              <span>Burned:</span>
              <span className="font-medium">{formatDate(nft.burnedAt)}</span>
            </div>
          )}
          
          {nft.giftedTo && (
            <div className="flex justify-between col-span-2">
              <span>Gifted To:</span>
              <span className="font-medium">User #{nft.giftedTo}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {actionButton}
      </CardFooter>
    </Card>
  );
}

function NftLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="pt-[75%] relative bg-muted">
            <Skeleton className="absolute inset-0" />
          </div>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyNftState({ type, searchQuery }: { type: string, searchQuery: string }) {
  let title = 'No NFTs Found';
  let description = '';
  let icon = <FolderOpen className="h-12 w-12 text-muted-foreground/50" />;
  
  if (searchQuery) {
    title = 'No matching NFTs';
    description = 'Try a different search term or filter.';
  } else {
    switch (type) {
      case 'unminted':
        title = 'No Unminted NFTs';
        description = 'Continue using the app to earn emotional milestone NFTs!';
        icon = <Clock className="h-12 w-12 text-muted-foreground/50" />;
        break;
      case 'minted':
        title = 'No Minted NFTs';
        description = 'Mint your earned NFTs to activate their bonuses.';
        icon = <Sparkles className="h-12 w-12 text-muted-foreground/50" />;
        break;
      case 'burned':
        title = 'No Burned NFTs';
        description = 'Burn your minted NFTs to contribute to the token pool.';
        icon = <Flame className="h-12 w-12 text-muted-foreground/50" />;
        break;
      case 'all':
        title = 'No NFTs in Your Collection';
        description = 'Continue using the app to earn emotional milestone NFTs!';
        break;
    }
  }
  
  return (
    <div className="text-center py-12 border rounded-lg">
      <div className="mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}