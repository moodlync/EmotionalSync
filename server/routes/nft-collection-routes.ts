import { Router, Request, Response } from 'express';
import { storage } from '../storage';

// Create router
const router = Router();

// Define NFT types using the existing structure
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

// Get user's NFTs by status
router.get('/user/nfts/:status', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { status } = req.params;
    if (!['unminted', 'minted', 'burned', 'all'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status parameter' });
    }

    // This implementation provides mock NFT data for demonstration
    // In a production environment, this would retrieve data from the database
    const mockNfts: EmotionalNft[] = generateMockNfts(req.user!.id, status);
    res.json(mockNfts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Function to generate mock NFT data with our custom images
function generateMockNfts(userId: number, status: string): EmotionalNft[] {
  const mocknfts: EmotionalNft[] = [
    {
      id: 1,
      userId,
      tokenId: `joy-${userId}-${Date.now()}`,
      name: "Joy Essence",
      description: "Awarded for maintaining a 7-day streak of joy entries in your emotional journal. This NFT radiates positive energy.",
      imageUrl: "/assets/attached_assets/individual Emotional NFt 1.jpg",
      emotion: "joy",
      rarity: "uncommon",
      activityType: "seven_day_joy_streak",
      mintStatus: status === 'all' || status === 'unminted' ? 'unminted' : status as 'minted' | 'burned',
      tokenValue: 350,
      isDisplayed: false,
      evolutionLevel: 1,
      bonusGranted: "+8% token earnings for activities done in joyful state",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      userId,
      tokenId: `reflection-${userId}-${Date.now()}`,
      name: "Reflection Tree",
      description: "Evolved from Consistency Seed after 30 days of journaling. This NFT reflects your growing emotional awareness.",
      imageUrl: "/assets/attached_assets/Create a very unique image for Emotional NFTs_Exclusive Digital Collectibles_Premium members earn unique NFTs that evolve with your emotional journey.jpg",
      emotion: "varied",
      rarity: "rare",
      activityType: "thirty_day_journal_streak",
      mintStatus: status === 'all' || status === 'minted' ? 'minted' : 'unminted',
      mintedAt: status === 'minted' ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      tokenValue: 550,
      isDisplayed: true,
      evolutionLevel: 2,
      bonusGranted: "+10% token earnings for 2 weeks",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      userId,
      tokenId: `anger-${userId}-${Date.now()}`,
      name: "Anger Management",
      description: "Earned by successfully managing and reducing anger patterns over time. Represents emotional growth and control.",
      imageUrl: "/assets/attached_assets/individual for Anger Emotional NFt.jpg",
      emotion: "anger",
      rarity: "epic",
      activityType: "anger_management_success",
      mintStatus: status === 'all' || status === 'burned' ? 'burned' : 'unminted',
      mintedAt: status === 'burned' ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      burnedAt: status === 'burned' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      tokenValue: 750,
      isDisplayed: false,
      evolutionLevel: 3,
      bonusGranted: "Access to special anger management resources",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      userId,
      tokenId: `surprise-${userId}-${Date.now()}`,
      name: "Surprise Discovery",
      description: "Awarded when you discover unexpected emotional patterns through consistent journaling and self-reflection.",
      imageUrl: "/assets/attached_assets/individual for Surprise Emotional NFt.jpg",
      emotion: "surprise",
      rarity: "uncommon",
      activityType: "pattern_discovery",
      mintStatus: status === 'all' || (status === 'unminted' && Math.random() > 0.5) ? 'unminted' : 'minted',
      mintedAt: status === 'minted' ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      tokenValue: 350,
      isDisplayed: false,
      evolutionLevel: 1,
      bonusGranted: "+5% discovery bonus for finding new emotional insights",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      userId,
      tokenId: `melancholy-${userId}-${Date.now()}`,
      name: "Melancholy Mastery",
      description: "Created after overcoming periods of sadness through healthy coping mechanisms. A visual reminder of your resilience.",
      imageUrl: "/assets/attached_assets/individual bad mood Emotional NFt 2.jpg",
      emotion: "sadness",
      rarity: "legendary",
      activityType: "sadness_overcome",
      mintStatus: status === 'all' ? (Math.random() > 0.5 ? 'minted' : 'unminted') : status as 'minted' | 'burned' | 'unminted',
      mintedAt: status === 'minted' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      tokenValue: 1000,
      isDisplayed: status === 'minted',
      evolutionLevel: 3,
      bonusGranted: "Permanent +5% boost to all emotional growth rewards",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Filter based on status
  if (status !== 'all') {
    return mocknfts.filter(nft => nft.mintStatus === status);
  }
  
  return mocknfts;
}

// Check for new NFTs (automatically run on login/daily activity)
router.post('/user/nfts/check-new', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Mock implementation - would normally check user activities and generate new NFTs
    const messages = [
      "You've earned a new 'Joy Essence' NFT for maintaining positive emotions!",
      "Congratulations! You've unlocked a 'Surprise Discovery' NFT by finding unexpected emotional patterns."
    ];
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mint an NFT
router.post('/user/nfts/:id/mint', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Mock implementation - would normally update NFT status in database
    res.json({ success: true, message: 'NFT successfully minted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Burn an NFT to contribute to the token pool
router.post('/user/nfts/:id/burn', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Mock implementation - would normally update NFT status in database
    res.json({ 
      success: true, 
      message: 'NFT successfully burned and contributed to the token pool' 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Gift an NFT to another user
router.post('/user/nfts/:id/gift', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }
    
    // Mock implementation - would normally update NFT ownership in database  
    res.json({ success: true, message: 'NFT successfully gifted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;