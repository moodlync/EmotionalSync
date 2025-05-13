import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Eye, Check } from "lucide-react";
import { EmotionType, emotions } from '@/lib/emotions';

const themePresets = {
  happy: {
    name: 'Sunshine',
    primary: '#FFD700', // Gold
    background: '#FFFAEF', // Light cream
    accent: '#FF9500', // Orange
    textPrimary: '#4A4A4A', // Dark gray
    shadow: 'rgba(255, 215, 0, 0.2)',
  },
  sad: {
    name: 'Ocean',
    primary: '#5D8AA8', // Blue-gray
    background: '#F0F8FF', // Alice blue
    accent: '#4682B4', // Steel blue
    textPrimary: '#2C3E50', // Dark blue
    shadow: 'rgba(70, 130, 180, 0.2)',
  },
  angry: {
    name: 'Ember',
    primary: '#CD5C5C', // Indian red
    background: '#FFF0F0', // Light pink
    accent: '#B22222', // Firebrick
    textPrimary: '#4A0000', // Dark red
    shadow: 'rgba(178, 34, 34, 0.2)',
  },
  anxious: {
    name: 'Lavender',
    primary: '#9370DB', // Medium purple
    background: '#F8F4FF', // Light lavender
    accent: '#8A2BE2', // Blue violet
    textPrimary: '#4A2C42', // Dark purple
    shadow: 'rgba(147, 112, 219, 0.2)',
  },
  excited: {
    name: 'Electric',
    primary: '#FF1493', // Deep pink
    background: '#FFF0F5', // Lavender blush
    accent: '#FF00FF', // Magenta
    textPrimary: '#4A004A', // Dark magenta
    shadow: 'rgba(255, 20, 147, 0.2)',
  },
  neutral: {
    name: 'Zen',
    primary: '#6B8E23', // Olive drab
    background: '#F5F5F5', // White smoke
    accent: '#556B2F', // Dark olive green
    textPrimary: '#333333', // Dark gray
    shadow: 'rgba(107, 142, 35, 0.2)',
  },
};

export default function DynamicThemeFeature() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('happy');
  const [isPremium, setIsPremium] = useState(false);
  
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };
  
  const themes = Object.entries(emotions).map(([key, emotion]) => ({
    id: key as EmotionType,
    ...emotion,
    theme: themePresets[key as EmotionType],
  }));
  
  const selectedTheme = themePresets[selectedEmotion];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Dynamic Theme Colors</CardTitle>
        </div>
        <CardDescription>
          The app appearance changes based on your emotional state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                onClick={() => handleEmotionSelect(theme.id)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedEmotion === theme.id 
                    ? 'border-primary shadow-md scale-105' 
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div 
                  className={`h-16 flex items-center justify-center ${theme.backgroundColor}`}
                >
                  <span className={`text-2xl ${theme.id === 'happy' ? 'text-yellow-800' : 'text-white'}`}>
                    {theme.id === selectedEmotion && <Check className="h-6 w-6" />}
                  </span>
                </div>
                <div className="p-2 text-center text-sm font-medium">
                  {theme.name}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="p-4 border-b" style={{ backgroundColor: selectedTheme.background }}>
              <h3 className="font-semibold mb-2" style={{ color: selectedTheme.textPrimary }}>
                Theme Preview: {themePresets[selectedEmotion].name}
              </h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  style={{ 
                    backgroundColor: selectedTheme.primary,
                    color: '#ffffff',
                    boxShadow: `0 4px 6px ${selectedTheme.shadow}`
                  }}
                >
                  Primary Button
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  style={{ 
                    borderColor: selectedTheme.accent,
                    color: selectedTheme.accent
                  }}
                >
                  Secondary
                </Button>
              </div>
              <p 
                className="mt-3 text-sm" 
                style={{ color: selectedTheme.textPrimary }}
              >
                This is how text would appear in the {themePresets[selectedEmotion].name} theme.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="h-4 w-4 mr-1" />
          <span>Preview mode</span>
        </div>
        {isPremium ? (
          <Button variant="outline" className="border-green-500 text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Applied
          </Button>
        ) : (
          <Button variant="outline" className="border-amber-500 text-amber-600">
            Upgrade to Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}