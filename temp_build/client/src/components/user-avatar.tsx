import { useState } from "react";
import { EmotionType, emotions } from "@/lib/emotions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  lastActive: string;
  emotion: EmotionType;
}

export default function UserAvatar({ username, avatarUrl, lastActive, emotion }: UserAvatarProps) {
  const [age, name] = username.split(",").map(s => s.trim());
  const emotionData = emotions[emotion];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full ${emotionData.lightBackgroundColor} p-0.5 mb-2`}>
              <Avatar className="w-full h-full">
                <AvatarImage src={avatarUrl} alt={`${username}'s avatar`} className="object-cover" />
                <AvatarFallback className={`${emotionData.backgroundColor} ${emotion === 'happy' ? 'text-yellow-800' : 'text-white'}`}>
                  {name?.[0]?.toUpperCase() || username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-sm font-medium">{username}</span>
            <span className="text-xs text-gray-500">{lastActive}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Feeling {emotionData.name.toLowerCase()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
