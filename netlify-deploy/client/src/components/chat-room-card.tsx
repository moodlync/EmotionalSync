import { emotions, EmotionType } from "@/lib/emotions";
import { useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatRoomCardProps {
  name: string;
  description: string;
  emotion: EmotionType;
  participantCount: number;
  avatars: string[];
}

export default function ChatRoomCard({
  name,
  description,
  emotion,
  participantCount,
  avatars,
}: ChatRoomCardProps) {
  const [_, navigate] = useLocation();
  const emotionData = emotions[emotion];
  
  const handleClick = () => {
    // This would navigate to a chat room in a real implementation
    // For now it's just a placeholder
    console.log(`Clicked on room: ${name}`);
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className={`${emotionData.lightBackgroundColor} px-4 py-3 flex justify-between items-center`}>
        <h3 className="font-medium">{name}</h3>
        <span className="bg-white text-gray-700 text-xs rounded-full px-2 py-1">{participantCount} people</span>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex -space-x-2">
          {avatars.slice(0, 3).map((avatar, index) => (
            <Avatar key={index} className="w-8 h-8 border-2 border-white">
              <AvatarImage src={avatar} alt="User in chat room" />
              <AvatarFallback>U{index + 1}</AvatarFallback>
            </Avatar>
          ))}
          {participantCount > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
              +{participantCount - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
