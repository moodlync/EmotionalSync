import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Send, Bot, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AISupportChatProps {
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  onClose: () => void;
}

export default function AISupportChat({ 
  isMinimized, 
  onMinimizeToggle, 
  onClose 
}: AISupportChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi there! I\'m MoodSync\'s AI support assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real implementation, this would call the AI service
      const response = await aiProcessMessage(input);
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated AI message processing
  const aiProcessMessage = async (message: string): Promise<string> => {
    // This would be replaced with a real API call to an AI service
    // For now, we'll use a simple simulation with pre-defined responses
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('premium') || lowercaseMessage.includes('subscription')) {
      return "MoodSync offers a premium subscription that includes advanced mood analytics, unlimited journal entries, ad-free experience, and personalized wellness content. You can subscribe monthly ($9.99), yearly ($89.99, save 25%), or get lifetime access ($109.99).";
    } else if (lowercaseMessage.includes('token') || lowercaseMessage.includes('redeem')) {
      return "You can earn tokens by completing various activities within MoodSync, such as making journal entries, logging your emotions, and participating in chat rooms. Tokens can be redeemed for cash rewards, donated to charity, or used to unlock premium features temporarily.";
    } else if (lowercaseMessage.includes('problem') || lowercaseMessage.includes('not working') || lowercaseMessage.includes('issue') || lowercaseMessage.includes('bug')) {
      return "I'm sorry to hear you're experiencing issues. Could you please provide more details about the specific problem you're facing? If it's a technical issue, you can also email our support team at support@moodsync.com for further assistance.";
    } else if (lowercaseMessage.includes('emotion') || lowercaseMessage.includes('mood')) {
      return "MoodSync helps you track your emotions and connects you with others experiencing similar feelings. You can update your mood multiple times per day, and our AI will suggest activities and content based on your emotional state.";
    } else if (lowercaseMessage.includes('connect') || lowercaseMessage.includes('chat')) {
      return "MoodSync's Connect feature allows you to join emotion-based chat rooms with others who share your current emotional state. All interactions are anonymous by default, creating a safe space for authentic conversations.";
    } else if (lowercaseMessage.includes('privacy') || lowercaseMessage.includes('data')) {
      return "We take your privacy very seriously. All your emotional data and journal entries are encrypted and never shared without your explicit consent. You can review our complete privacy policy at moodsync.com/privacy.";
    } else if (lowercaseMessage.includes('thank')) {
      return "You're welcome! I'm happy to help. Is there anything else you'd like to know about MoodSync?";
    } else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      return "Hello! How can I assist you with MoodSync today?";
    } else {
      return "Thank you for your message. If you have specific questions about MoodSync's features, premium subscription, token system, or need technical support, please let me know. I'm here to help!";
    }
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 bg-primary text-white rounded-full p-3 shadow-lg flex items-center cursor-pointer z-50" onClick={onMinimizeToggle}>
        <Bot className="h-6 w-6" />
        <span className="ml-2 font-medium">Chat Support</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col z-50 border overflow-hidden">
      {/* Chat header */}
      <div className="bg-primary text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <span className="font-medium">MoodSync Support</span>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-white hover:bg-primary-foreground/20" onClick={onMinimizeToggle}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-white hover:bg-primary-foreground/20" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-[320px] bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-primary text-white text-xs">AI</AvatarFallback>
              </Avatar>
            )}
            <div 
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary text-white text-xs">AI</AvatarFallback>
            </Avatar>
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-2 border-t">
        <div className="flex items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={1}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}