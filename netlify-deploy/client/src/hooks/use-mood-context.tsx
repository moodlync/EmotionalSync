import React, { createContext, useContext, ReactNode } from 'react';
import { useMoodBackground } from './use-mood-background';
import { EmotionType } from '@/types/imprints';

interface MoodContextType {
  background: string;
  currentEmotion: EmotionType | null;
  intensity: number;
  isTransitioning: boolean;
  setEmotionBackground: (emotion: EmotionType, intensity?: number) => void;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const moodBackground = useMoodBackground();
  
  return (
    <MoodContext.Provider value={moodBackground}>
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