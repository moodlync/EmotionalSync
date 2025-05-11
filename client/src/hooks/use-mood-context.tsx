import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { EmotionType } from '@/types/imprints';

interface MoodContextType {
  background: string;
  currentEmotion: EmotionType | null;
  intensity: number;
  isTransitioning: boolean;
  setEmotionBackground: (emotion: EmotionType, intensity?: number) => void;
}

const MoodContext = createContext<MoodContextType | null>(null);

// Emotion color mappings for different emotions
const emotionColors: Record<string, { bg: string, text: string, gradient: string[] }> = {
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

export function MoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isPremium = user?.isPremium || false; // Default to non-premium
  
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>('Neutral' as EmotionType);
  const [intensity, setIntensity] = useState<number>(5); // Default medium intensity
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [background, setBackground] = useState<string>(emotionColors.default.bg);
  
  const setEmotionBackground = useCallback((emotion: EmotionType, newIntensity: number = 5) => {
    // Find the color mapping for this emotion
    const colorMap = emotionColors[emotion] || emotionColors.default;
    
    setCurrentEmotion(emotion);
    setIntensity(newIntensity);
    setIsTransitioning(true);
    
    // Set premium gradient background or simple background
    if (isPremium) {
      const gradientStr = `linear-gradient(135deg, ${colorMap.gradient[0]} 0%, ${colorMap.gradient[1]} 100%)`;
      setBackground(gradientStr);
    } else {
      setBackground(colorMap.bg);
    }
    
    // Reset transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, [isPremium]);
  
  const moodContextValue = {
    background,
    currentEmotion,
    intensity,
    isTransitioning,
    setEmotionBackground
  };
  
  return (
    <MoodContext.Provider value={moodContextValue}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMoodContext() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMoodContext must be used within a MoodProvider');
  }
  return context;
}