/**
 * Emotion Bridge - Centralizes emotion state management across components
 * 
 * This module handles:
 * 1. Synchronizing emotion state between components via events
 * 2. Persisting emotion state to localStorage for page reloads
 * 3. Providing hooks and utilities for emotion data consistency
 */

// Types
export interface MoodData {
  emotion: string;
  intensity: number;
  timestamp: string;
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
  // Forward to emotions library
  const { getEmotionIcon } = require('./emotions');
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