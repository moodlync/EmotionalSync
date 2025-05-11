import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmotionType } from '@/types/imprints';

// Simplified emotion color mappings
const emotionColors: Record<string, { bg: string, text: string }> = {
  Joy: { bg: '#FFDE7D', text: '#7A4100' },
  Sadness: { bg: '#A0C4FF', text: '#2A3C5F' },
  Anger: { bg: '#FF7D7D', text: '#6F0000' },
  Anxiety: { bg: '#FFD39A', text: '#704200' },
  Excitement: { bg: '#FFA9F9', text: '#6A008D' },
  Neutral: { bg: '#E0E0E0', text: '#424242' },
  default: { bg: '#E0E0E0', text: '#424242' }
};

export default function MoodStandaloneTest() {
  const { toast } = useToast();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('Neutral' as EmotionType);
  const [intensity, setIntensity] = useState(5);
  const [background, setBackground] = useState(emotionColors.Neutral.bg);
  const [textColor, setTextColor] = useState(emotionColors.Neutral.text);
  
  // Available emotions for our test
  const availableEmotions: EmotionType[] = [
    'Joy',
    'Sadness', 
    'Anger', 
    'Anxiety', 
    'Excitement', 
    'Neutral'
  ] as EmotionType[];
  
  // Update background when emotion changes
  useEffect(() => {
    const colorData = emotionColors[currentEmotion] || emotionColors.default;
    setBackground(colorData.bg);
    setTextColor(colorData.text);
    
    // Log for debugging
    console.log(`Emotion updated to: ${currentEmotion}`);
  }, [currentEmotion]);
  
  // Handle emotion selection
  const handleEmotionSelect = (emotion: EmotionType) => {
    setCurrentEmotion(emotion);
    
    toast({
      title: `Mood Updated`,
      description: `Your mood has been set to ${emotion}`,
      variant: "default",
    });
  };
  
  // Set a random emotion
  const setRandomEmotion = () => {
    const randomIndex = Math.floor(Math.random() * availableEmotions.length);
    handleEmotionSelect(availableEmotions[randomIndex]);
  };
  
  // Handle intensity change
  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    
    toast({
      title: `Intensity Updated`,
      description: `Intensity level set to ${newIntensity}/10`,
      variant: "default",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        MoodLync - Standalone Mood Test
      </h1>
      
      {/* Current mood display */}
      <Card 
        className="p-6 mb-8 text-center"
        style={{ 
          backgroundColor: background,
          color: textColor,
          transition: 'background-color 0.5s ease'
        }}
      >
        <h2 className="text-2xl font-bold mb-2">Current Mood</h2>
        <div className="text-5xl mb-3">{
          currentEmotion === 'Joy' ? '😊' :
          currentEmotion === 'Sadness' ? '😢' :
          currentEmotion === 'Anger' ? '😠' :
          currentEmotion === 'Anxiety' ? '😰' :
          currentEmotion === 'Excitement' ? '🤩' :
          '😐' // Neutral
        }</div>
        <div className="text-3xl font-bold mb-3">{currentEmotion}</div>
        <div className="text-lg">Intensity: {intensity}/10</div>
      </Card>
      
      {/* Emotion selection */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-center">Select Your Mood</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {availableEmotions.map((emotion) => (
            <Button
              key={emotion}
              className="p-4 h-auto flex flex-col items-center"
              style={{ 
                backgroundColor: emotionColors[emotion]?.bg || emotionColors.default.bg,
                color: emotionColors[emotion]?.text || emotionColors.default.text
              }}
              onClick={() => handleEmotionSelect(emotion)}
              variant="outline"
            >
              <span className="text-2xl mb-1">{
                emotion === 'Joy' ? '😊' :
                emotion === 'Sadness' ? '😢' :
                emotion === 'Anger' ? '😠' :
                emotion === 'Anxiety' ? '😰' :
                emotion === 'Excitement' ? '🤩' :
                '😐' // Neutral
              }</span>
              <span>{emotion}</span>
            </Button>
          ))}
        </div>
        
        <Button 
          onClick={setRandomEmotion}
          className="w-full"
          variant="default"
        >
          Set Random Emotion
        </Button>
      </Card>
      
      {/* Intensity slider */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-center">Adjust Intensity</h2>
        
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <Button
              key={level}
              className={`p-2 ${intensity === level ? 'bg-primary text-primary-foreground' : ''}`}
              variant={intensity === level ? "default" : "outline"}
              onClick={() => handleIntensityChange(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Debug info */}
      <Card className="p-6 bg-muted">
        <h3 className="text-lg font-medium mb-2">Debug Information</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(
            {
              currentEmotion,
              intensity,
              backgroundColor: background,
              textColor
            },
            null,
            2
          )}
        </pre>
      </Card>
    </div>
  );
}