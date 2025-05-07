import { Router, Request, Response } from 'express';
import { TokenPoolService } from '../services/token-pool-service';
import { storage } from '../storage';

// Create token pool service instance
const tokenPoolService = new TokenPoolService(storage);
const router = Router();

// Get pool statistics
router.get('/token-pool/stats', async (req: Request, res: Response) => {
  try {
    // Pass the authenticated user ID if available for personalized stats
    const userId = req.isAuthenticated() ? req.user!.id : undefined;
    const stats = await tokenPoolService.getPoolStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get top contributors
router.get('/token-pool/top-contributors', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const contributors = await tokenPoolService.getTopContributors(limit);
    res.json(contributors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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

    const nfts = await storage.getUserNftsByStatus(req.user!.id, status === 'all' ? undefined : status);
    res.json(nfts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check for new NFTs (automatically run on login/daily activity)
router.post('/user/nfts/check-new', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const messages = await tokenPoolService.checkAndGenerateUnmintedNfts(req.user!.id);
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
    const nftId = parseInt(req.params.id);
    const success = await tokenPoolService.mintNft(req.user!.id, nftId);
    
    if (success) {
      res.json({ success: true, message: 'NFT successfully minted' });
    } else {
      res.status(500).json({ error: 'Failed to mint NFT' });
    }
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
    const nftId = parseInt(req.params.id);
    const success = await tokenPoolService.burnNft(req.user!.id, nftId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'NFT successfully burned and contributed to the token pool' 
      });
    } else {
      res.status(500).json({ error: 'Failed to burn NFT' });
    }
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
    const nftId = parseInt(req.params.id);
    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }
    
    const success = await tokenPoolService.giftNft(req.user!.id, recipientId, nftId);
    
    if (success) {
      res.json({ success: true, message: 'NFT successfully gifted' });
    } else {
      res.status(500).json({ error: 'Failed to gift NFT' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// For admin or system use: Execute token pool distribution
router.post('/admin/token-pool/distribute', async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user!.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const success = await tokenPoolService.executePoolDistribution();
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Token pool distribution successfully executed' 
      });
    } else {
      res.status(400).json({ 
        error: 'Failed to execute distribution. Pool may not be ready for distribution.' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

console.log('NFT token pool system routes registered successfully');

export default router;