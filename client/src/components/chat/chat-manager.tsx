import { useState, createContext, useContext, ReactNode } from 'react';
import PopupChat, { Message } from './popup-chat';

interface FriendChat {
  friendId: number;
  friendName: string;
  friendAvatar?: string;
  friendEmotionColor?: string;
  messages: Message[];
}

interface ChatContextType {
  activeChats: FriendChat[];
  openChat: (friendId: number, friendName: string, friendAvatar?: string, friendEmotionColor?: string) => void;
  closeChat: (friendId: number) => void;
  sendMessage: (friendId: number, content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChats, setActiveChats] = useState<FriendChat[]>([]);

  const openChat = (friendId: number, friendName: string, friendAvatar?: string, friendEmotionColor?: string) => {
    // Don't open duplicate chats
    if (activeChats.some(chat => chat.friendId === friendId)) {
      return;
    }
    
    // Limit to 3 active chats
    let updatedChats = [...activeChats];
    if (updatedChats.length >= 3) {
      updatedChats = updatedChats.slice(1);
    }
    
    setActiveChats([
      ...updatedChats,
      {
        friendId,
        friendName,
        friendAvatar,
        friendEmotionColor,
        messages: []
      }
    ]);
  };

  const closeChat = (friendId: number) => {
    setActiveChats(activeChats.filter(chat => chat.friendId !== friendId));
  };

  const sendMessage = (friendId: number, content: string) => {
    setActiveChats(activeChats.map(chat => 
      chat.friendId === friendId
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: Date.now().toString(),
                content,
                sender: 'user',
                timestamp: new Date(),
                read: false
              }
            ]
          }
        : chat
    ));
  };

  return (
    <ChatContext.Provider value={{ activeChats, openChat, closeChat, sendMessage }}>
      {children}
      
      {/* Render all active chat windows */}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col-reverse items-end space-y-reverse space-y-2 p-4">
        {activeChats.map((chat, index) => (
          <div 
            key={chat.friendId}
            style={{ 
              marginRight: `${index * 20}px`,
              zIndex: 50 - index // Make sure newer chats are on top
            }}
          >
            <PopupChat
              friendId={chat.friendId}
              friendName={chat.friendName}
              friendAvatar={chat.friendAvatar}
              friendEmotionColor={chat.friendEmotionColor}
              onClose={() => closeChat(chat.friendId)}
              initialMessages={chat.messages}
            />
          </div>
        ))}
      </div>
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}