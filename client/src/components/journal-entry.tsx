import { EmotionType, emotions } from "@/lib/emotions";

interface JournalEntryProps {
  emotion: EmotionType;
  note: string;
  timestamp: string;
}

export default function JournalEntry({ emotion, note, timestamp }: JournalEntryProps) {
  const emotionData = emotions[emotion];
  
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center mb-2">
        <div 
          className={`w-8 h-8 rounded-full ${emotionData.backgroundColor} mr-2 flex items-center justify-center ${emotion === 'happy' ? 'text-yellow-800' : 'text-white'}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d={emotionData.icon} 
            />
          </svg>
        </div>
        <div>
          <span className="font-medium">{emotionData.name}</span>
          <span className="text-xs text-gray-500 ml-2">{timestamp}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 ml-10">{note}</p>
    </div>
  );
}
