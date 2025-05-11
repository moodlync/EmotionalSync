import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmotionType } from '@/types/imprints';

// Define a subset of emotions we want to use
const commonEmotions: EmotionType[] = [
  'Joy', 'Sadness', 'Anger', 'Anxiety', 
  'Excitement', 'Neutral', 'Hope', 'Love',
  'Contentment', 'Surprise'
];

interface MoodDirectAccessProps {
  onSelectEmotion: (emotion: EmotionType) => void;
}

export default function MoodDirectAccess({ onSelectEmotion }: MoodDirectAccessProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);

  const handleEmotionClick = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
    onSelectEmotion(emotion);
  };

  // Colors for different emotions
  const emotionColors: Record<string, string> = {
    'Joy': 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300',
    'Sadness': 'bg-blue-300 text-white hover:bg-blue-400',
    'Anger': 'bg-red-500 text-white hover:bg-red-600',
    'Anxiety': 'bg-purple-400 text-white hover:bg-purple-500',
    'Excitement': 'bg-orange-400 text-white hover:bg-orange-500',
    'Neutral': 'bg-gray-400 text-white hover:bg-gray-500',
    'Hope': 'bg-green-400 text-white hover:bg-green-500',
    'Love': 'bg-pink-400 text-white hover:bg-pink-500',
    'Contentment': 'bg-teal-400 text-white hover:bg-teal-500',
    'Surprise': 'bg-indigo-400 text-white hover:bg-indigo-500',
    'default': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };

  // Emoji for different emotions
  const emotionEmojis: Record<string, string> = {
    'Joy': '😊',
    'Sadness': '😢',
    'Anger': '😠',
    'Anxiety': '😰',
    'Excitement': '🤩',
    'Neutral': '😐',
    'Hope': '🌈',
    'Love': '❤️',
    'Contentment': '😌',
    'Surprise': '😲',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Mood Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {commonEmotions.map((emotion) => (
            <Button
              key={emotion}
              variant="outline"
              className={`${emotionColors[emotion] || emotionColors.default} ${selectedEmotion === emotion ? 'ring-2 ring-offset-2' : ''}`}
              onClick={() => handleEmotionClick(emotion)}
            >
              <span className="mr-2">{emotionEmojis[emotion] || '😶'}</span>
              {emotion}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}