import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmotionType, emotions } from "@/lib/emotions";
import ChatRoomCard from "./chat-room-card";
import UserAvatar from "./user-avatar";
import RewardsCard from "./rewards-card";

interface ConnectTabProps {
  currentEmotion: EmotionType;
}

interface User {
  id: number;
  username: string;
  emotion: EmotionType;
  lastActive: string;
  avatarUrl?: string;
}

interface ChatRoom {
  id: number;
  name: string;
  description: string;
  emotion: EmotionType;
  participants: number;
  avatars: string[];
}

export default function ConnectTab({ currentEmotion }: ConnectTabProps) {
  // Fetch users with the same emotion
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users', currentEmotion],
    initialData: [
      { id: 1, username: 'Sara', emotion: currentEmotion, lastActive: '2 mins ago', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120' },
      { id: 2, username: 'Mike', emotion: currentEmotion, lastActive: '5 mins ago', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120' },
      { id: 3, username: 'Lisa', emotion: currentEmotion, lastActive: 'Just now', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120' },
      { id: 4, username: 'John', emotion: currentEmotion, lastActive: '7 mins ago', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120' },
      { id: 5, username: 'Anna', emotion: currentEmotion, lastActive: '3 mins ago', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120' }
    ]
  });

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat-rooms'],
    initialData: [
      {
        id: 1,
        name: 'Just Chilling',
        description: 'A place for people who are just feeling neutral and want to chat about their day.',
        emotion: 'neutral',
        participants: 24,
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50'
        ]
      },
      {
        id: 2,
        name: 'Late-Night Overthinkers',
        description: 'Can\'t sleep? Mind racing? You\'re not alone. Join others who are awake and anxious too.',
        emotion: 'anxious',
        participants: 18,
        avatars: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50'
        ]
      },
      {
        id: 3,
        name: 'Sudden Burst of Happiness',
        description: 'Having an amazing day? Share your joy with others who are feeling on top of the world!',
        emotion: 'happy',
        participants: 37,
        avatars: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50'
        ]
      },
      {
        id: 4,
        name: 'Comfort Corner',
        description: 'A safe space for those feeling down. Share, listen, and find comfort in community.',
        emotion: 'sad',
        participants: 15,
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50'
        ]
      }
    ]
  });

  return (
    <section>
      {/* Rewards Card */}
      <RewardsCard />
      
      {/* People with same emotion */}
      <div className="mb-6">
        <h2 className="font-poppins font-semibold text-xl mb-4">
          People feeling {emotions[currentEmotion].name.toLowerCase()}
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-4 min-w-max">
            {users.map((user) => (
              <UserAvatar
                key={user.id}
                username={user.username}
                avatarUrl={user.avatarUrl}
                lastActive={user.lastActive}
                emotion={user.emotion}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mood-Based Chat Rooms */}
      <div className="mb-8">
        <h2 className="font-poppins font-semibold text-xl mb-4">Mood-Based Chat Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chatRooms.map((room) => (
            <ChatRoomCard
              key={room.id}
              name={room.name}
              description={room.description}
              emotion={room.emotion}
              participantCount={room.participants}
              avatars={room.avatars}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
