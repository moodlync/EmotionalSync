// Emotion bridge module to fix the naming inconsistencies between emotion types

import { EmotionType } from "@/types/imprints";

// Types using capitalized format (from types/imprints.ts)
export type CapitalizedEmotionType = EmotionType;

// Types using lowercase format (from lib/emotions.ts)
export type LowercaseEmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'neutral';

// Primary emotions present in both systems
export const primaryEmotions = ['Joy', 'Sadness', 'Anger', 'Anxiety', 'Excitement', 'Neutral'] as const;

// Mapping from lowercase to capitalized
export const lowercaseToCapitalized: Record<LowercaseEmotionType, CapitalizedEmotionType> = {
  'happy': 'Joy',
  'sad': 'Sadness',
  'angry': 'Anger',
  'anxious': 'Anxiety',
  'excited': 'Excitement',
  'neutral': 'Neutral'
};

// Mapping from capitalized to lowercase
export const capitalizedToLowercase: Record<string, LowercaseEmotionType> = {
  'Joy': 'happy',
  'Sadness': 'sad',
  'Anger': 'angry',
  'Anxiety': 'anxious',
  'Excitement': 'excited',
  'Neutral': 'neutral'
};

// Convert lowercase emotion to capitalized format
export function toCapitalized(emotion: LowercaseEmotionType): CapitalizedEmotionType {
  return lowercaseToCapitalized[emotion];
}

// Convert capitalized emotion to lowercase format
export function toLowercase(emotion: CapitalizedEmotionType): LowercaseEmotionType | undefined {
  return capitalizedToLowercase[emotion] as LowercaseEmotionType;
}

// Type guard to check if a string is a valid CapitalizedEmotionType
export function isCapitalizedEmotion(emotion: string): emotion is CapitalizedEmotionType {
  return Object.keys(capitalizedToLowercase).includes(emotion);
}

// Type guard to check if a string is a valid LowercaseEmotionType
export function isLowercaseEmotion(emotion: string): emotion is LowercaseEmotionType {
  return Object.keys(lowercaseToCapitalized).includes(emotion);
}

// Emotion color mappings for different emotions
export const emotionColors: Record<string, { bg: string, text: string, gradient: string[] }> = {
  Joy: { 
    bg: '#FFDE7D', 
    text: '#7A4100',
    gradient: ['#FFC837', '#FF8008'] 
  },
  Sadness: { 
    bg: '#A0C4FF', 
    text: '#2A3C5F',
    gradient: ['#9BAFD9', '#6D83B9'] 
  },
  Anger: { 
    bg: '#FF7D7D', 
    text: '#6F0000',
    gradient: ['#FF4141', '#D10000'] 
  },
  Anxiety: { 
    bg: '#FFD39A', 
    text: '#704200',
    gradient: ['#FFB75E', '#ED8F03'] 
  },
  Excitement: { 
    bg: '#FFA9F9', 
    text: '#6A008D',
    gradient: ['#FF67FF', '#C840FF'] 
  },
  Neutral: { 
    bg: '#E0E0E0', 
    text: '#424242',
    gradient: ['#BDBDBD', '#9E9E9E'] 
  },
  // Add other emotions mappings
  Hope: { 
    bg: '#B5FFD8', 
    text: '#0B5437',
    gradient: ['#84FAB0', '#1BC47D'] 
  },
  Surprise: { 
    bg: '#E5A9FF', 
    text: '#4B0082',
    gradient: ['#D373FF', '#9F00FF'] 
  },
  Fear: { 
    bg: '#C8C8FF', 
    text: '#00008B',
    gradient: ['#9E9EFF', '#6A6AFF'] 
  },
  Love: { 
    bg: '#FF9A9A', 
    text: '#8B0000',
    gradient: ['#FF6B6B', '#FF3333'] 
  },
  Contentment: { 
    bg: '#ADECA8', 
    text: '#0B5F08',
    gradient: ['#7AE073', '#38B632'] 
  },
  // Default for any other emotions
  default: { 
    bg: '#E0E0E0', 
    text: '#424242',
    gradient: ['#BDBDBD', '#9E9E9E'] 
  }
};

// Get emotion color data regardless of format
export function getEmotionColors(emotion: string) {
  // First check if it's a capitalized format
  if (emotionColors[emotion]) {
    return emotionColors[emotion];
  }
  
  // If it's lowercase, try to convert
  if (isLowercaseEmotion(emotion as LowercaseEmotionType)) {
    const capitalizedEmotion = toCapitalized(emotion as LowercaseEmotionType);
    return emotionColors[capitalizedEmotion];
  }
  
  // Default fallback
  return emotionColors.default;
}

// Get emoji for an emotion
export function getEmotionEmoji(emotion: string): string {
  const normalizedEmotion = isLowercaseEmotion(emotion as LowercaseEmotionType) 
    ? toCapitalized(emotion as LowercaseEmotionType)
    : emotion;
    
  switch(normalizedEmotion) {
    case 'Joy': return '😊';
    case 'Sadness': return '😢';
    case 'Anger': return '😠';
    case 'Anxiety': return '😰';
    case 'Excitement': return '🤩';
    case 'Neutral': return '😐';
    case 'Hope': return '🌟';
    case 'Love': return '❤️';
    case 'Surprise': return '😲';
    case 'Fear': return '😨';
    case 'Contentment': return '😌';
    default: return '😐';
  }
}

// The six primary emotions that are present in both the emotion wheel and the mood selector
export const primaryEmotionsList = ['Joy', 'Sadness', 'Anger', 'Anxiety', 'Excitement', 'Neutral'];

// Get a standardized emotion type regardless of input format
export function normalizeEmotion(emotion: string): CapitalizedEmotionType {
  if (isCapitalizedEmotion(emotion as CapitalizedEmotionType)) {
    return emotion as CapitalizedEmotionType;
  }
  
  if (isLowercaseEmotion(emotion as LowercaseEmotionType)) {
    return toCapitalized(emotion as LowercaseEmotionType);
  }
  
  // If we can't determine the format, default to Neutral
  return 'Neutral';
}