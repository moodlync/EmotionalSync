import { EmotionType } from "@/types/imprints";
import { 
  getEmotionEmoji, 
  normalizeEmotion, 
  primaryEmotionsList 
} from '@/lib/emotion-bridge';

interface EmotionWheelProps {
  onSelectEmotion: (emotion: EmotionType) => void;
}

// Define emotion data structure
interface EmotionData {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
}

// Define a subset of EmotionType that we actually support in the wheel
type WheelEmotionType = 'Joy' | 'Sadness' | 'Anger' | 'Anxiety' | 'Excitement' | 'Neutral';

// Create consistent emotion data
const emotionData: Record<WheelEmotionType, EmotionData> = {
  Joy: {
    id: "Joy",
    name: "Joy",
    emoji: "😊",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-yellow-200",
    textColor: "text-yellow-800"
  },
  Sadness: {
    id: "Sadness",
    name: "Sadness",
    emoji: "😢",
    icon: "M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-blue-300",
    textColor: "text-white"
  },
  Anger: {
    id: "Anger",
    name: "Anger",
    emoji: "😠",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-red-500",
    textColor: "text-white"
  },
  Anxiety: {
    id: "Anxiety",
    name: "Anxiety",
    emoji: "😰",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-purple-400",
    textColor: "text-white"
  },
  Excitement: {
    id: "Excitement",
    name: "Excitement",
    emoji: "🤩",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-orange-400",
    textColor: "text-white"
  },
  Neutral: {
    id: "Neutral",
    name: "Neutral",
    emoji: "😐",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    backgroundColor: "bg-gray-400",
    textColor: "text-white"
  }
};

export default function EmotionWheel({ onSelectEmotion }: EmotionWheelProps) {
  // Position information for each emotion in the wheel
  const emotionPositions: Record<WheelEmotionType, {[key: string]: number}> = {
    Joy: { top: 0, left: 80 },
    Sadness: { top: 60, right: 0 },
    Anger: { bottom: 60, right: 0 },
    Anxiety: { bottom: 0, left: 80 },
    Excitement: { bottom: 60, left: 0 },
    Neutral: { top: 60, left: 0 }
  };

  // Handle emotion selection with proper normalization
  const handleSelectEmotion = (emotion: string) => {
    // Ensure consistent format using our emotion bridge
    const normalizedEmotion = normalizeEmotion(emotion);
    console.log(`Emotion wheel: selected ${emotion}, normalized to ${normalizedEmotion}`);
    
    // Add debug info to help track the emotion through the pipeline
    console.log({
      originalEmotion: emotion,
      normalizedEmotion: normalizedEmotion,
      emotionType: typeof normalizedEmotion,
      isValid: primaryEmotionsList.includes(normalizedEmotion as any)
    });
    
    // Pass the normalized emotion to the parent component
    onSelectEmotion(normalizedEmotion);
  };

  return (
    <div className="emotion-wheel my-8">
      {Object.entries(emotionData).map(([key, emotion]) => {
        const wheelEmotionType = key as WheelEmotionType;
        
        // Get position for this emotion (now properly typed)
        const position = emotionPositions[wheelEmotionType];
        
        // Create style object based on position
        const style: React.CSSProperties = {};
        
        // Safely add CSS properties
        if ('top' in position) style.top = position.top;
        if ('bottom' in position) style.bottom = position.bottom;
        if ('left' in position) style.left = position.left;
        if ('right' in position) style.right = position.right;

        return (
          <div
            key={emotion.id}
            className={`emotion-segment ${emotion.backgroundColor} ${emotion.textColor}`}
            style={style}
            onClick={() => handleSelectEmotion(emotion.id)}
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8 mb-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={emotion.icon}
                />
              </svg>
              <span className="text-2xl mb-1">{emotion.emoji}</span>
              <span className="font-medium">{emotion.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
