import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { EmotionType } from '@/types/imprints';

interface MoodBackground {
  emotion: EmotionType;
  backgroundColor: string;
  gradientColors: string[];
  accentColor: string;
  textColor: string;
  lightBgColor: string;
}

// Emotion color mappings with gradients and text colors
const emotionColorMappings: Partial<Record<EmotionType, MoodBackground>> = {
  'Joy': {
    emotion: 'Joy',
    backgroundColor: '#FFDE7D',
    gradientColors: ['#FFC837', '#FF8008'],
    accentColor: '#FF8008',
    textColor: '#7A4100',
    lightBgColor: '#FFF5DB'
  },
  'Sadness': {
    emotion: 'Sadness',
    backgroundColor: '#A0C4FF',
    gradientColors: ['#9BAFD9', '#6D83B9'],
    accentColor: '#5A6F9E',
    textColor: '#2A3C5F',
    lightBgColor: '#E5EFFF'
  },
  'Anger': {
    emotion: 'Anger',
    backgroundColor: '#FF7D7D',
    gradientColors: ['#FF4141', '#D10000'],
    accentColor: '#D10000',
    textColor: '#6F0000',
    lightBgColor: '#FFE5E5'
  },
  'Anxiety': {
    emotion: 'Anxiety',
    backgroundColor: '#FFD39A',
    gradientColors: ['#FFB75E', '#ED8F03'],
    accentColor: '#ED8F03',
    textColor: '#704200',
    lightBgColor: '#FFF2D9'
  },
  'Serenity': {
    emotion: 'Serenity',
    backgroundColor: '#A5D8FF',
    gradientColors: ['#56CCF2', '#2F80ED'],
    accentColor: '#2F80ED',
    textColor: '#0F3B75',
    lightBgColor: '#E0F0FF'
  },
  'Excitement': {
    emotion: 'Excitement',
    backgroundColor: '#FFA9F9',
    gradientColors: ['#FF67FF', '#C840FF'],
    accentColor: '#C840FF',
    textColor: '#6A008D',
    lightBgColor: '#FFEAFF'
  },
  'Boredom': {
    emotion: 'Boredom',
    backgroundColor: '#D3D3D3',
    gradientColors: ['#BBB', '#999'],
    accentColor: '#888',
    textColor: '#444',
    lightBgColor: '#F0F0F0'
  },
  'Contentment': {
    emotion: 'Contentment',
    backgroundColor: '#ADECA8',
    gradientColors: ['#7AE073', '#38B632'],
    accentColor: '#38B632',
    textColor: '#0B5F08',
    lightBgColor: '#E6F9E5'
  },
  'Nostalgia': {
    emotion: 'Nostalgia',
    backgroundColor: '#D5AAFF',
    gradientColors: ['#B983FF', '#7B2FFF'],
    accentColor: '#7B2FFF',
    textColor: '#3F0A96',
    lightBgColor: '#F3E6FF'
  },
  'Hope': {
    emotion: 'Hope',
    backgroundColor: '#B5FFD8',
    gradientColors: ['#84FAB0', '#1BC47D'],
    accentColor: '#1BC47D',
    textColor: '#0B5437',
    lightBgColor: '#E8FFF4'
  },
  'Stress': {
    emotion: 'Stress',
    backgroundColor: '#FFBA9A',
    gradientColors: ['#FF8A65', '#F4511E'],
    accentColor: '#F4511E',
    textColor: '#7A2A0C',
    lightBgColor: '#FFEFEA'
  },
  'Neutral': {
    emotion: 'Neutral',
    backgroundColor: '#E0E0E0',
    gradientColors: ['#BDBDBD', '#9E9E9E'],
    accentColor: '#757575',
    textColor: '#424242',
    lightBgColor: '#F5F5F5'
  }
};

interface UseMoodBackgroundOptions {
  initialEmotion?: EmotionType;
  animationDuration?: number;
  disableAnimation?: boolean;
}

export function useMoodBackground({
  initialEmotion = 'Neutral',
  animationDuration = 1500,
  disableAnimation = false
}: UseMoodBackgroundOptions = {}) {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>(initialEmotion);
  const [previousEmotion, setPreviousEmotion] = useState<EmotionType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [styleObject, setStyleObject] = useState<React.CSSProperties>({});
  
  // Get emotion colors
  const getEmotionColors = useCallback((emotion: EmotionType): MoodBackground => {
    return emotionColorMappings[emotion] || emotionColorMappings['Neutral'];
  }, []);
  
  // Set emotion with transition
  const setEmotion = useCallback((newEmotion: EmotionType) => {
    if (currentEmotion === newEmotion) return;
    
    setPreviousEmotion(currentEmotion);
    setCurrentEmotion(newEmotion);
    setIsTransitioning(true);
    
    // Reset transition state after animation completes
    if (!disableAnimation && isPremium) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, animationDuration);
    } else {
      setIsTransitioning(false);
    }
  }, [currentEmotion, disableAnimation, isPremium, animationDuration]);
  
  // Update styles when emotion changes
  useEffect(() => {
    const currentColors = getEmotionColors(currentEmotion);
    const { gradientColors } = currentColors;
    
    if (!isPremium || disableAnimation) {
      // Simple background for non-premium users
      setStyleObject({
        background: currentColors.backgroundColor,
        color: currentColors.textColor,
        transition: 'none',
      });
      return;
    }
    
    // Premium user with animation
    const gradientStr = `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`;
    
    setStyleObject({
      background: gradientStr,
      color: currentColors.textColor,
      transition: isTransitioning ? `all ${animationDuration / 1000}s ease-in-out` : 'none',
    });
  }, [currentEmotion, isPremium, isTransitioning, disableAnimation, animationDuration, getEmotionColors]);
  
  return {
    currentEmotion,
    setEmotion,
    isTransitioning,
    styleObject,
    previousEmotion,
    currentColors: getEmotionColors(currentEmotion),
    isPremium
  };
}