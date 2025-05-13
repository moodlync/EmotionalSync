import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { EmotionType } from '@/types/imprints';
import { useToast } from '@/hooks/use-toast';
import { 
  emotionColors, 
  getEmotionColors, 
  normalizeEmotion, 
  getEmotionEmoji 
} from '@/lib/emotion-bridge';

interface MoodContextType {
  background: string;
  currentEmotion: EmotionType | null;
  intensity: number;
  isTransitioning: boolean;
  setEmotionBackground: (emotion: EmotionType, intensity?: number) => void;
  emotionEmoji: string | null;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  // Hardcoded premium status - we can change later if needed
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const { toast } = useToast();
  
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>('Neutral' as EmotionType);
  const [emotionEmoji, setEmotionEmoji] = useState<string | null>('😐');
  const [intensity, setIntensity] = useState<number>(5); // Default medium intensity
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [background, setBackground] = useState<string>(emotionColors.default.bg);
  
  // Mock premium status check - would normally use API
  useEffect(() => {
    console.log('MoodProvider initialized with premium status:', isPremium);
    
    const timer = setTimeout(() => {
      toast({
        title: "Mood System Ready",
        description: "You can now select emotions and see the background change.",
        variant: "default",
        duration: 3000,
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  const setEmotionBackground = useCallback((emotion: EmotionType, newIntensity: number = 5) => {
    console.log(`Setting emotion to: ${emotion} with intensity: ${newIntensity}`);
    
    try {
      // Ensure consistent emotion format and get color data
      const normalizedEmotion = normalizeEmotion(emotion as string);
      const colorMap = getEmotionColors(normalizedEmotion);
      const emoji = getEmotionEmoji(normalizedEmotion);
      
      // Update state
      setCurrentEmotion(normalizedEmotion);
      setEmotionEmoji(emoji);
      setIntensity(newIntensity);
      setIsTransitioning(true);
      
      // Set premium gradient background or simple background
      if (isPremium) {
        const gradientStr = `linear-gradient(135deg, ${colorMap.gradient[0]} 0%, ${colorMap.gradient[1]} 100%)`;
        setBackground(gradientStr);
      } else {
        setBackground(colorMap.bg);
      }
      
      // Show toast notification with emotion update
      toast({
        title: `Mood Updated: ${normalizedEmotion}`,
        description: `Intensity level: ${newIntensity}/10`,
        variant: "default",
        duration: 2000,
      });
      
      // Reset transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting emotion background:', error);
      toast({
        title: "Error Setting Mood",
        description: "There was a problem updating your mood. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [isPremium, toast]);
  
  const moodContextValue = {
    background,
    currentEmotion,
    emotionEmoji,
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