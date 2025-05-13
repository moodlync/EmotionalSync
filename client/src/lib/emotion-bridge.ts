/**
 * Emotion Bridge - Centralizes emotion state management across components
 * 
 * This module handles:
 * 1. Synchronizing emotion state between components via events
 * 2. Persisting emotion state to localStorage for page reloads
 * 3. Providing hooks and utilities for emotion data consistency
 */

import { emotions, validateEmotion, getEmotionIcon } from './emotions';

// Types
export interface MoodData {
  emotion: string;
  intensity: number;
  timestamp: string;
}

// Export the emotion colors for use in mood context
export const emotionColors = {
  default: {
    bg: '#E0E0E0', // Default neutral background
    text: '#333333'
  },
  happy: {
    bg: '#FFD700',
    text: '#333333',
    gradient: ['#FFD700', '#FFA500']
  },
  sad: {
    bg: '#A0C4FF',
    text: '#333333',
    gradient: ['#A0C4FF', '#6B8EAE']
  },
  angry: {
    bg: '#FF7D7D',
    text: '#FFFFFF',
    gradient: ['#FF7D7D', '#DB4B4B']
  },
  anxious: {
    bg: '#FFD39A',
    text: '#333333',
    gradient: ['#FFD39A', '#E6B56D']
  },
  excited: {
    bg: '#FFA9F9',
    text: '#333333',
    gradient: ['#FFA9F9', '#E980E1']
  },
  neutral: {
    bg: '#E0E0E0',
    text: '#333333',
    gradient: ['#E0E0E0', '#C0C0C0']
  }
};

/**
 * Get emotion colors by emotion name
 * @param emotion The emotion to get colors for
 * @returns The color object for the specified emotion
 */
export function getEmotionColors(emotion: string) {
  const normalizedEmotion = validateEmotion(emotion.toLowerCase());
  return emotionColors[normalizedEmotion] || emotionColors.default;
}

// Storage key for local state
const MOOD_STORAGE_KEY = 'moodlync_current_mood';

// Event names for pub/sub pattern
export const MOOD_UPDATE_EVENT = 'moodlync:mood-update';

/**
 * Saves mood data to localStorage and dispatches an update event
 * @param moodDataOrEmotion Either a MoodData object or a string representing the emotion
 * @param intensity Optional intensity value (1-10) when passing emotion as string
 */
export function syncMoodData(moodDataOrEmotion: MoodData | string, intensity?: number): void {
  let moodData: MoodData;
  
  // Handle legacy format
  if (typeof moodDataOrEmotion === 'string') {
    moodData = {
      emotion: moodDataOrEmotion,
      intensity: intensity ?? 5,
      timestamp: new Date().toISOString()
    };
  } else {
    moodData = moodDataOrEmotion;
  }
  
  // Save to localStorage
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(moodData));
  
  // Broadcast event for other components
  const event = new CustomEvent(MOOD_UPDATE_EVENT, { detail: moodData });
  window.dispatchEvent(event);
  
  console.log("Mood data synced:", moodData);
}

/**
 * Legacy support for different format
 */
export function capitalizedToLowercase(emotion: string): string {
  if (!emotion) return 'neutral';
  return emotion.toLowerCase();
}

/**
 * Legacy support for emotion wheel component
 */
export function getEmotionEmoji(emotion: string): string {
  // Forward to emotions library - using import instead of require for ES modules
  return getEmotionIcon(emotion);
}

/**
 * Legacy support for primary emotions list
 */
export const primaryEmotionsList = [
  "happy", "sad", "angry", "anxious", "excited", "neutral"
];

/**
 * Retrieves mood data from localStorage
 */
export function getMoodData(): MoodData | null {
  try {
    const storedData = localStorage.getItem(MOOD_STORAGE_KEY);
    if (!storedData) return null;
    
    return JSON.parse(storedData) as MoodData;
  } catch (e) {
    console.error("Error retrieving mood data:", e);
    return null;
  }
}

/**
 * Get the current mood (alias for getMoodData for backward compatibility)
 */
export function getCurrentMood(): MoodData | null {
  return getMoodData();
}

/**
 * Subscribes to mood update events
 */
export function subscribeMoodUpdates(callback: (moodData: MoodData) => void): () => void {
  const handler = (event: CustomEvent) => callback(event.detail);
  
  // Add event listener
  window.addEventListener(MOOD_UPDATE_EVENT, handler as EventListener);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener(MOOD_UPDATE_EVENT, handler as EventListener);
  };
}

/**
 * Normalizes emotion strings for consistent formatting
 * @param emotion The emotion string to normalize
 * @param preserveCase Optional: If true, preserves the case of the emotion (default: false)
 * @returns The normalized emotion string
 */
export function normalizeEmotion(emotion: string, preserveCase: boolean = false): string {
  if (!emotion) return "neutral";
  
  // Convert to lowercase first
  const normalized = emotion.toLowerCase();
  
  // Check if it's a valid emotion
  const validEmotions = ["happy", "sad", "angry", "anxious", "excited", "neutral"];
  if (!validEmotions.includes(normalized)) {
    console.warn(`Unknown emotion: ${emotion}, defaulting to neutral`);
    return preserveCase ? "neutral" : "Neutral";
  }
  
  // Format appropriately based on preserveCase
  return preserveCase 
    ? normalized 
    : normalized.charAt(0).toUpperCase() + normalized.slice(1);
}