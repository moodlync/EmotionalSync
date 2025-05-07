import express from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * Search API endpoint for finding content across the application
 * Searches across users, challenges, articles, and features
 */
router.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.json({ results: [] });
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Get results from different sources
    const [users, challenges, features, pages] = await Promise.all([
      storage.searchUsers(normalizedQuery),
      storage.searchChallenges(normalizedQuery),
      searchFeatures(normalizedQuery),
      searchPages(normalizedQuery)
    ]);
    
    // Combine all results
    const results = [
      ...users.map(user => ({
        id: user.id,
        title: user.username,
        description: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'MoodLync User',
        url: `/profile/${user.id}`,
        type: 'user' as const
      })),
      ...challenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        url: `/challenges/${challenge.id}`,
        type: 'challenge' as const
      })),
      ...features,
      ...pages
    ];
    
    return res.json({ results });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search for premium features
 */
function searchFeatures(query: string) {
  const features = [
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your emotional patterns and progress with interactive charts.',
      url: '/premium/analytics',
      type: 'feature' as const
    },
    {
      id: 'family-plan',
      title: 'Family Plan Access',
      description: 'Monitor family members\' moods (with consent) and help them navigate emotional challenges.',
      url: '/premium/family',
      type: 'feature' as const
    },
    {
      id: 'ai-video',
      title: 'AI Video Editor',
      description: 'Create and edit professional videos with our AI-powered tools to express your emotions visually.',
      url: '/premium/ai-video',
      type: 'feature' as const
    },
    {
      id: 'nft-collection',
      title: 'Emotional NFTs',
      description: 'Earn unique NFTs that evolve with your emotional journey.',
      url: '/nft-collection',
      type: 'feature' as const
    },
    {
      id: 'verification',
      title: 'Premium Verification',
      description: 'Get verified with a premium badge to build trust and credibility in the community.',
      url: '/premium/verify',
      type: 'feature' as const
    },
    {
      id: 'therapeutic-ai',
      title: 'Therapeutic AI Companion',
      description: 'Access an AI companion that offers supportive guidance based on your emotional state.',
      url: '/premium/ai-companion',
      type: 'feature' as const
    }
  ];
  
  return features.filter(feature => 
    feature.title.toLowerCase().includes(query) || 
    feature.description.toLowerCase().includes(query)
  );
}

/**
 * Search for application pages
 */
function searchPages(query: string) {
  const pages = [
    {
      id: 'home',
      title: 'Home',
      description: 'Return to the MoodLync dashboard and view your current emotional state.',
      url: '/',
      type: 'page' as const
    },
    {
      id: 'premium',
      title: 'Premium Features',
      description: 'Explore the premium features and subscription options to enhance your MoodLync experience.',
      url: '/premium',
      type: 'page' as const
    },
    {
      id: 'token-pool',
      title: 'Token Pool Information',
      description: 'Learn about the MoodLync token pool, contributions, and community initiatives.',
      url: '/token-pool-info',
      type: 'page' as const
    },
    {
      id: 'emotion-map',
      title: 'Global Emotion Map',
      description: 'Visualize emotional patterns around the world and discover collective moods in different regions.',
      url: '/emotion-map',
      type: 'page' as const
    },
    {
      id: 'mood-rooms',
      title: 'Mood-Based Chat Rooms',
      description: 'Join conversations with people sharing similar emotional experiences for authentic discussions.',
      url: '/mood-rooms',
      type: 'page' as const
    },
    {
      id: 'emotion-journal',
      title: 'Emotional Journal',
      description: 'Record and track your emotions over time to gain insights into your emotional patterns.',
      url: '/journal',
      type: 'page' as const
    },
    {
      id: 'roadmap',
      title: 'MoodLync Roadmap',
      description: 'View our development roadmap and upcoming features for the MoodLync platform.',
      url: '/roadmap',
      type: 'page' as const
    },
    {
      id: 'premium-comparison',
      title: 'Premium Plans Comparison',
      description: 'Compare different premium plans and pricing options for MoodLync.',
      url: '/premium/compare',
      type: 'page' as const
    },
    {
      id: 'challenges',
      title: 'Emotional Challenges',
      description: 'Complete challenges to improve your emotional wellness and earn tokens.',
      url: '/challenges',
      type: 'page' as const
    },
    {
      id: 'friends',
      title: 'Friend Book',
      description: 'Connect with friends and manage your social connections with privacy controls.',
      url: '/friends',
      type: 'page' as const
    }
  ];
  
  return pages.filter(page => 
    page.title.toLowerCase().includes(query) || 
    page.description.toLowerCase().includes(query)
  );
}

export default router;