import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmotionType } from '@/types/imprints';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Direct-access component for mood functions without dependencies
// This provides a standalone implementation for mood selection

// Type definitions
interface EmotionData {
  name: EmotionType;
  emoji: string;
  background: string;
  text: string;
  description: string;
}

// Emotion color data
const emotionData: EmotionData[] = [
  { 
    name: 'Joy' as EmotionType, 
    emoji: '😊',
    background: '#FFDE7D', 
    text: '#7A4100',
    description: 'Feeling happy and content'
  },
  { 
    name: 'Sadness' as EmotionType, 
    emoji: '😢',
    background: '#A0C4FF', 
    text: '#2A3C5F',
    description: 'Feeling down or blue'
  },
  { 
    name: 'Anger' as EmotionType, 
    emoji: '😠',
    background: '#FF7D7D', 
    text: '#6F0000',
    description: 'Feeling frustrated or mad'
  },
  { 
    name: 'Anxiety' as EmotionType, 
    emoji: '😰',
    background: '#FFD39A', 
    text: '#704200',
    description: 'Feeling nervous or worried'
  },
  { 
    name: 'Excitement' as EmotionType, 
    emoji: '🤩',
    background: '#FFA9F9', 
    text: '#6A008D',
    description: 'Feeling thrilled or enthusiastic'
  },
  { 
    name: 'Neutral' as EmotionType, 
    emoji: '😐',
    background: '#E0E0E0', 
    text: '#424242',
    description: 'Feeling neither positive nor negative'
  }
];

export default function MoodDirectAccess() {
  const { toast } = useToast();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData>(emotionData[5]); // Default to Neutral
  const [intensity, setIntensity] = useState<number>(5);
  
  // Handle emotion selection
  const handleSelectEmotion = (emotion: EmotionData) => {
    console.log('Selected emotion:', emotion.name);
    setCurrentEmotion(emotion);
    
    toast({
      title: `Mood Updated: ${emotion.name}`,
      description: emotion.description,
      variant: "default",
    });
  };
  
  // Set random emotion
  const setRandomEmotion = () => {
    const randomIndex = Math.floor(Math.random() * emotionData.length);
    handleSelectEmotion(emotionData[randomIndex]);
  };
  
  // Handle intensity change
  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    
    toast({
      title: 'Intensity Updated',
      description: `Intensity set to ${newIntensity}/10`,
      variant: "default",
    });
  };
  
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Tabs defaultValue="mood" className="w-full mb-8">
        <TabsList className="w-full">
          <TabsTrigger value="mood" className="flex-1">Mood Selection</TabsTrigger>
          <TabsTrigger value="info" className="flex-1">Debug Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mood" className="pt-4">
          {/* Current mood display */}
          <Card 
            className="p-6 mb-6 flex flex-col items-center justify-center text-center"
            style={{ 
              backgroundColor: currentEmotion.background,
              color: currentEmotion.text,
              transition: 'all 0.3s ease'
            }}
          >
            <span className="text-5xl mb-2">{currentEmotion.emoji}</span>
            <h2 className="text-2xl font-bold mb-1">{currentEmotion.name}</h2>
            <p>{currentEmotion.description}</p>
            <div className="mt-3 font-medium">Intensity: {intensity}/10</div>
          </Card>
          
          {/* Emotion selection grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {emotionData.map((emotion) => (
              <Button
                key={emotion.name}
                className="p-3 h-auto flex flex-col items-center justify-center"
                style={{ 
                  backgroundColor: emotion.background,
                  color: emotion.text,
                  border: currentEmotion.name === emotion.name ? '3px solid #4D4DE3' : '1px solid rgba(0,0,0,0.1)',
                }}
                onClick={() => handleSelectEmotion(emotion)}
                variant="outline"
              >
                <span className="text-2xl mb-1">{emotion.emoji}</span>
                <span className="font-medium">{emotion.name}</span>
              </Button>
            ))}
          </div>
          
          {/* Random emotion button */}
          <Button 
            onClick={setRandomEmotion}
            className="w-full mb-6"
          >
            Set Random Emotion
          </Button>
          
          {/* Intensity selector */}
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-medium mb-3 text-center">Adjust Intensity</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <Button
                  key={level}
                  variant={intensity === level ? "default" : "outline"}
                  className="h-10"
                  onClick={() => handleIntensityChange(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="pt-4">
          <Card className="p-4 bg-muted">
            <h3 className="text-lg font-bold mb-2">Debug Information</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-auto bg-background p-3 rounded">
              {JSON.stringify({
                currentEmotion: currentEmotion.name,
                intensity: intensity,
                backgroundColor: currentEmotion.background,
                textColor: currentEmotion.text,
                description: currentEmotion.description
              }, null, 2)}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}