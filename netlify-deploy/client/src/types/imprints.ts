import { User } from '@shared/schema';

// Define the type for emotion categories
export type EmotionCategory = 'positive' | 'negative' | 'neutral';

// Define the type for emotion options
export type EmotionType =
  | 'Joy'
  | 'Love'
  | 'Hope'
  | 'Gratitude'
  | 'Serenity'
  | 'Interest'
  | 'Amusement'
  | 'Pride'
  | 'Contentment'
  | 'Excitement'
  | 'Relief'
  | 'Anger'
  | 'Fear'
  | 'Sadness'
  | 'Disgust'
  | 'Shame'
  | 'Guilt'
  | 'Envy'
  | 'Jealousy'
  | 'Anxiety'
  | 'Grief'
  | 'Disappointment'
  | 'Surprise'
  | 'Confusion'
  | 'Nostalgia'
  | 'Anticipation'
  | 'Boredom'
  | 'Awe'
  | 'Curiosity'
  | 'Empathy'
  | 'Satisfaction'
  | 'Neutral';

// Define the type for vibration patterns
export type VibrationPatternType = 
  | 'short'
  | 'long'
  | 'double'
  | 'triple'
  | 'escalating'
  | 'heartbeat';

// Define the type for interaction types
export type ImprintInteractionType = 
  | 'view'
  | 'like'
  | 'share'
  | 'save'
  | 'comment';

// Define the type for an emotional imprint
export interface EmotionalImprint {
  id: number;
  userId: number;
  name: string;
  emotion: EmotionType;
  description?: string;
  intensity: number;
  colorCode: string;
  soundId?: string;
  vibrationPattern?: VibrationPatternType;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
  interactions?: ImprintInteraction[];
}

// Define the type for an imprint interaction
export interface ImprintInteraction {
  id: number;
  imprintId: number;
  userId: number;
  interactionType: ImprintInteractionType;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

// Define the type for a comment on an imprint
export interface ImprintComment {
  id: number;
  imprintId: number;
  userId: number;
  content: string;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

// Define the type for form data to create/update an imprint
export interface CreateImprintFormData {
  name: string;
  emotion: string;
  description?: string;
  intensity: number;
  colorCode: string;
  soundId?: string;
  vibrationPattern?: string;
  isPrivate: boolean;
}

// Define the type for form data to share an imprint
export interface ShareImprintFormData {
  receiverId: string;
  message?: string;
  isAnonymous: boolean;
}

// Define the type for a recipient when sharing imprints
export interface ImprintRecipient {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  relationship?: string;
}

// Define the type for imprint discovery settings
export interface ImprintDiscoverySettings {
  showPublicImprints: boolean;
  showFriendsImprints: boolean;
  showSimilarEmotions: boolean;
  emotionFilters: EmotionType[];
  sortBy: 'newest' | 'popular' | 'relevant';
}

// Define the type for an imprint notification
export interface ImprintNotification {
  id: number;
  userId: number;
  imprintId: number;
  type: 'like' | 'share' | 'comment' | 'mention';
  fromUserId: number;
  isRead: boolean;
  createdAt: Date;
  imprint?: EmotionalImprint;
  fromUser?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}