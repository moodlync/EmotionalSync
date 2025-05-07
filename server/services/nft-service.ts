import { EmotionType } from '@shared/schema';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  rarity: string;
  completedActivity: string;
  timestamp: number;
}

const RARITY_LEVELS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

/**
 * Service responsible for NFT-related operations
 */
export class NFTService {
  /**
   * Generate an NFT based on user's mood and activity
   * @param userId The ID of the user
   * @param emotion The current emotion of the user
   * @param activityType The type of activity completed
   * @returns The generated NFT data
   */
  static async generateNFT(userId: number, emotion: EmotionType, activityType: string): Promise<any> {
    try {
      // Get user data to make NFT more personalized
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user is premium (NFTs are for premium users only)
      if (!user.isPremium) {
        throw new Error('NFTs are only available for premium members');
      }
      
      // Get user's emotional data history to enhance NFT generation
      const emotionalHistory = await storage.getEmotionalJournalEntries(userId);
      const userLevel = await storage.getUserLevel(userId);
      const userChallenges = await storage.getUserCompletedChallenges(userId);
      
      // Calculate rarity based on activity frequency and user level
      const rarity = this.calculateRarity(userLevel, emotionalHistory.length, userChallenges.length);
      
      // Generate NFT metadata
      const nftMetadata = this.createNFTMetadata(user.username, emotion, activityType, rarity);
      
      // Store NFT in database
      const nftId = await storage.createEmotionalNFT({
        userId,
        tokenId: uuidv4(),
        metadata: JSON.stringify(nftMetadata),
        emotion,
        rarity: nftMetadata.rarity,
        activityType,
        createdAt: new Date(),
        imageUrl: nftMetadata.image
      });
      
      // Add notification for user
      await storage.createNotification({
        userId,
        type: 'NFT_EARNED',
        title: 'New Emotional NFT Earned!',
        content: `You've earned a new ${nftMetadata.rarity} ${emotion} NFT for completing ${activityType}.`,
        icon: 'award',
        isRead: false,
        readAt: null,
        isPushSent: false,
        isEmailSent: false,
        createdAt: new Date()
      });
      
      // Return the NFT data
      return {
        id: nftId,
        ...nftMetadata
      };
    } catch (error) {
      console.error('Error generating NFT:', error);
      throw error;
    }
  }
  
  /**
   * Create NFT metadata based on user data
   */
  private static createNFTMetadata(username: string, emotion: EmotionType, activity: string, rarity: string): NFTMetadata {
    // Determine NFT name and description based on emotion
    let name = '';
    let description = '';
    let imageUrl = '';
    
    switch(emotion) {
      case 'happy':
      case 'joy':
        name = `Joy Crystal: ${this.capitalizeName(username)}'s Happiness`;
        description = `This NFT captures the pure joy experienced by ${username} after ${activity}. The vibrant colors represent happiness with a unique pattern generated from their emotional data.`;
        imageUrl = '/assets/emotional-nfts/joy-nft.jpg';
        break;
      case 'sad':
      case 'sadness':  
        name = `Melancholy Echo: ${this.capitalizeName(username)}'s Journey`;
        description = `A representation of ${username}'s moments of reflection and sadness, transformed into a beautiful memory. This NFT embodies the journey through challenging emotions.`;
        imageUrl = '/assets/emotional-nfts/sad-nft.jpg';
        break;
      case 'angry':
      case 'anger':
        name = `Ember Forge: ${this.capitalizeName(username)}'s Passion`;
        description = `Born from moments of intensity, this NFT channels ${username}'s passion and determination. The dynamic patterns symbolize the transformative power of strong emotions.`;
        imageUrl = '/assets/emotional-nfts/anger-nft.jpg';
        break;
      case 'surprise':
      case 'surprised':
        name = `Wonder Prism: ${this.capitalizeName(username)}'s Discovery`;
        description = `This NFT captures the moment of pure surprise and wonder experienced by ${username}. Each element represents a flash of insight or unexpected joy.`;
        imageUrl = '/assets/emotional-nfts/surprise-nft.jpg';
        break;
      default:
        name = `Emotional Spectrum: ${this.capitalizeName(username)}'s Journey`;
        description = `A unique NFT representing ${username}'s emotional journey. This digital collectible evolves over time as more emotional milestones are reached.`;
        imageUrl = '/assets/emotional-nfts/emotional-nfts-main.jpg';
    }
    
    // Create the metadata
    return {
      name,
      description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Emotion', value: this.capitalizeFirstLetter(emotion) },
        { trait_type: 'Activity', value: this.capitalizeFirstLetter(activity) },
        { trait_type: 'Rarity', value: rarity }
      ],
      rarity,
      completedActivity: activity,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculate NFT rarity based on user activity and level
   */
  private static calculateRarity(userLevel: number, journalCount: number, challengesCompleted: number): string {
    // Base score calculated from user stats
    let rarityScore = (userLevel * 2) + (journalCount * 0.5) + (challengesCompleted * 3);
    
    // Add some randomness (weighted towards common)
    const randomFactor = Math.random() * 100;
    rarityScore += randomFactor;
    
    // Determine rarity based on score
    if (rarityScore > 200) return RARITY_LEVELS[4]; // Legendary
    if (rarityScore > 150) return RARITY_LEVELS[3]; // Epic
    if (rarityScore > 100) return RARITY_LEVELS[2]; // Rare
    if (rarityScore > 50) return RARITY_LEVELS[1];  // Uncommon
    return RARITY_LEVELS[0]; // Common
  }
  
  private static capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  private static capitalizeName(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(part => this.capitalizeFirstLetter(part))
      .join(' ');
  }
}