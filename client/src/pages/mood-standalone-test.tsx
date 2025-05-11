import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { EmotionType } from '@/types/imprints';
import MoodDirectAccess from '@/components/mood-direct-access';
import { Button } from '@/components/ui/button';

// Simplified standalone version that doesn't depend on context providers
export default function MoodStandaloneTest() {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('Neutral' as EmotionType);
  const [bgColor, setBgColor] = useState('#E0E0E0');
  const [textColor, setTextColor] = useState('#424242');
  
  // Color mapping for emotions
  const emotionColors: Record<string, { bg: string, text: string }> = {
    'Joy': { bg: '#FFDE7D', text: '#7A4100' },
    'Sadness': { bg: '#A0C4FF', text: '#2A3C5F' },
    'Anger': { bg: '#FF7D7D', text: '#6F0000' },
    'Anxiety': { bg: '#FFD39A', text: '#704200' },
    'Excitement': { bg: '#FFA9F9', text: '#6A008D' },
    'Neutral': { bg: '#E0E0E0', text: '#424242' },
    'Hope': { bg: '#B5FFD8', text: '#0B5437' },
    'Love': { bg: '#FF9A9A', text: '#8B0000' },
    'Contentment': { bg: '#ADECA8', text: '#0B5F08' },
    'Surprise': { bg: '#E5A9FF', text: '#4B0082' },
  };
  
  // Update colors when emotion changes
  useEffect(() => {
    const colorInfo = emotionColors[currentEmotion] || emotionColors.Neutral;
    setBgColor(colorInfo.bg);
    setTextColor(colorInfo.text);
  }, [currentEmotion]);
  
  const handleSelectEmotion = (emotion: EmotionType) => {
    console.log('Selected emotion:', emotion);
    setCurrentEmotion(emotion);
  };
  
  const handleRandomEmotion = () => {
    const emotions = Object.keys(emotionColors) as EmotionType[];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    handleSelectEmotion(randomEmotion);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Mood Functions - Standalone Test</h1>
      
      <div className="mb-8">
        <MoodDirectAccess onSelectEmotion={handleSelectEmotion} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Mood</CardTitle>
            <CardDescription>
              This displays your currently selected mood
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full h-40 rounded-md flex items-center justify-center" 
              style={{ background: bgColor, color: textColor }}
            >
              <span className="text-2xl font-bold">{currentEmotion}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRandomEmotion} className="w-full">
              Set Random Emotion
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Current values of state variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify({
                currentEmotion,
                backgroundColor: bgColor,
                textColor,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}