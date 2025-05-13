import { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'friend';
  timestamp: Date;
  read: boolean;
}

interface PopupChatProps {
  friendId: number;
  friendName: string;
  friendAvatar?: string;
  friendEmotionColor?: string;
  onClose: () => void;
  initialMessages?: Message[];
}

export default function PopupChat({
  friendId,
  friendName,
  friendAvatar,
  friendEmotionColor = 'bg-neutral-300',
  onClose,
  initialMessages = []
}: PopupChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate real-time connection
    const onlineTimer = setTimeout(() => {
      // Random online status for demo
      setIsOnline(Math.random() > 0.3);
    }, 1500);

    // Scroll to bottom on mount
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => clearTimeout(onlineTimer);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Add the new message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      read: false
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Simulate friend typing
    setIsTyping(true);
    
    // Simulate friend response
    const responseTimer = setTimeout(() => {
      setIsTyping(false);
      
      const friendResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(newMessage),
        sender: 'friend',
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, friendResponse]);
    }, 1500 + Math.random() * 1500);
    
    return () => clearTimeout(responseTimer);
  };
  
  // Simple response generator for demo purposes
  const generateResponse = (message: string): string => {
    const responses = [
      "I'm here for you. How are you feeling today?",
      "Thanks for sharing that with me.",
      "I understand how you feel. Let's talk more about it.",
      "That's interesting! Tell me more.",
      "I appreciate you reaching out to me.",
      "I've been going through something similar recently.",
      "Let's focus on the positive aspects for a moment.",
      "Have you tried practicing mindfulness for this?",
      "Sometimes taking a short break can help with that.",
      "Remember that your emotions are valid and important."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl w-80 transition-all duration-300 flex flex-col overflow-hidden border border-gray-200 dark:bg-gray-900 dark:border-gray-800",
        isMinimized ? "h-14" : "h-96"
      )}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 bg-primary text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={friendAvatar} alt={friendName} />
              <AvatarFallback className="bg-primary-foreground text-primary">
                {friendName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span 
              className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white", 
                isOnline ? "bg-emerald-500" : "bg-gray-400"
              )}
            />
          </div>
          <div>
            <p className="font-medium text-sm">{friendName}</p>
            <p className="text-xs opacity-80">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isMinimized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
          <X className="h-4 w-4 ml-2" onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} />
        </div>
      </div>
      
      {/* Messages area */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3 break-words",
                  message.sender === 'user' 
                    ? "bg-primary/10 text-primary-foreground ml-auto rounded-br-none dark:bg-primary-500 dark:text-white" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white mr-auto rounded-bl-none"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-right mt-1 text-gray-600 dark:text-gray-300">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-300 max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
                </div>
                <p className="text-xs dark:text-gray-300">{friendName} is typing...</p>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </div>
          
          {/* Input area */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="sm" 
              className="ml-2 rounded-full h-8 w-8 p-0"
              onClick={handleSendMessage}
              disabled={newMessage.trim() === ''}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}