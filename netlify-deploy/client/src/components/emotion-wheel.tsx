import { EmotionType, emotions } from "@/lib/emotions";

interface EmotionWheelProps {
  onSelectEmotion: (emotion: EmotionType) => void;
}

export default function EmotionWheel({ onSelectEmotion }: EmotionWheelProps) {
  // Position information for each emotion in the wheel
  const emotionPositions = {
    happy: { top: 0, left: 80 },
    sad: { top: 60, right: 0 },
    angry: { bottom: 60, right: 0 },
    anxious: { bottom: 0, left: 80 },
    excited: { bottom: 60, left: 0 },
    neutral: { top: 60, left: 0 },
  };

  return (
    <div className="emotion-wheel my-8">
      {Object.entries(emotions).map(([key, emotion]) => {
        const emotionType = key as EmotionType;
        const position = emotionPositions[emotionType];
        
        // Create style object based on position
        const style: React.CSSProperties = {};
        Object.entries(position).forEach(([pos, value]) => {
          style[pos as any] = value;
        });

        return (
          <div
            key={emotion.id}
            className={`emotion-segment ${emotion.backgroundColor} ${emotion.id === 'happy' ? 'text-yellow-800' : 'text-white'}`}
            style={style}
            onClick={() => onSelectEmotion(emotionType)}
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
