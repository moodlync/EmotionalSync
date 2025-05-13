/**
 * Emotion Utilities - Centralizes emotion data and display properties
 */

// Types
export type EmotionType = "happy" | "sad" | "angry" | "anxious" | "excited" | "neutral";

// Emotion Display Properties
interface EmotionProperties {
  label: string;
  description: string;
  color: string;
  icon: string;
  intensity?: number;
  
  // Legacy properties needed for backward compatibility
  name?: string;
  emoji?: string;
  message?: string;
  backgroundColor?: string;
  id?: string;
}

// Emotion Data Map
export const emotions: Record<EmotionType, EmotionProperties> = {
  happy: {
    label: "Happy",
    description: "Feeling joyful and content",
    color: "#FFD700",
    icon: "😊",
    // Legacy properties
    name: "Happy",
    emoji: "😊",
    message: "You're feeling joyful and optimistic. This is a great time to connect with others or engage in creative activities.",
    backgroundColor: "bg-yellow-400",
    id: "happy"
  },
  sad: {
    label: "Sad",
    description: "Feeling down or blue",
    color: "#A0C4FF",
    icon: "😢",
    // Legacy properties
    name: "Sad",
    emoji: "😢",
    message: "It's okay to feel sad sometimes. Consider reaching out to someone you trust or doing something that brings you comfort.",
    backgroundColor: "bg-blue-300",
    id: "sad"
  },
  angry: {
    label: "Angry",
    description: "Feeling frustrated or mad",
    color: "#FF7D7D",
    icon: "😠",
    // Legacy properties
    name: "Angry",
    emoji: "😠",
    message: "Anger is a natural response to feeling threatened or wronged. Try taking deep breaths and processing your feelings.",
    backgroundColor: "bg-red-400",
    id: "angry"
  },
  anxious: {
    label: "Anxious",
    description: "Feeling worried or nervous",
    color: "#FFD39A",
    icon: "😰",
    // Legacy properties
    name: "Anxious",
    emoji: "😰",
    message: "Feeling anxious is common. Try grounding exercises or mindfulness to help manage these feelings.",
    backgroundColor: "bg-yellow-300",
    id: "anxious"
  },
  excited: {
    label: "Excited",
    description: "Feeling energetic and enthusiastic",
    color: "#FFA9F9",
    icon: "🤩",
    // Legacy properties
    name: "Excited",
    emoji: "🤩",
    message: "Your excitement can be contagious! This is a great time to pursue new ideas or share your enthusiasm with others.",
    backgroundColor: "bg-pink-300",
    id: "excited"
  },
  neutral: {
    label: "Neutral",
    description: "Feeling balanced or indifferent",
    color: "#E0E0E0",
    icon: "😐",
    // Legacy properties
    name: "Neutral",
    emoji: "😐",
    message: "You're in a balanced emotional state. This can be a good time for reflection or making level-headed decisions.",
    backgroundColor: "bg-gray-300",
    id: "neutral"
  }
};

// Default emotion for fallback
export const DEFAULT_EMOTION: EmotionType = "neutral";

/**
 * Validates and normalizes an emotion string
 */
export function validateEmotion(emotion: string): EmotionType {
  const normalized = emotion.toLowerCase() as EmotionType;
  return emotions[normalized] ? normalized : DEFAULT_EMOTION;
}

/**
 * Gets the display label for an emotion
 */
export function getEmotionLabel(emotion: string): string {
  const normalizedEmotion = validateEmotion(emotion);
  return emotions[normalizedEmotion].label;
}

/**
 * Gets the description for an emotion
 */
export function getEmotionDescription(emotion: string): string {
  const normalizedEmotion = validateEmotion(emotion);
  return emotions[normalizedEmotion].description;
}

/**
 * Gets the color for an emotion
 */
export function getEmotionColor(emotion: string): string {
  const normalizedEmotion = validateEmotion(emotion);
  return emotions[normalizedEmotion].color;
}

/**
 * Gets the icon for an emotion
 */
export function getEmotionIcon(emotion: string): string {
  const normalizedEmotion = validateEmotion(emotion);
  return emotions[normalizedEmotion].icon;
}

/**
 * Gets all emotion data
 */
export function getAllEmotions(): Record<EmotionType, EmotionProperties> {
  return emotions;
}

/**
 * Gets all emotion names as an array
 */
export function getEmotionNames(): EmotionType[] {
  return Object.keys(emotions) as EmotionType[];
}