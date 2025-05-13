import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmotionType, getRandomAIResponse } from "@/lib/emotions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AICompanionTabProps {
  currentEmotion: EmotionType;
}

export default function AICompanionTab({ currentEmotion }: AICompanionTabProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a greeting based on the user's emotion
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: "ai-1",
          sender: "ai",
          content: "Hi there! I'm MoodBot, your AI companion. How are you feeling today?",
          timestamp: new Date()
        },
        {
          id: "user-1",
          sender: "user",
          content: `I'm feeling ${currentEmotion} today.`,
          timestamp: new Date(Date.now() + 1000)
        },
        {
          id: "ai-2",
          sender: "ai",
          content: getRandomAIResponse(currentEmotion),
          timestamp: new Date(Date.now() + 2000)
        }
      ];
      setMessages(initialMessages);
    }
  }, [currentEmotion]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Check for specific key phrases to make responses more contextual
    const userText = newMessage.toLowerCase();
    
    // Simulate typing indicator
    const typingDelay = 500 + Math.floor(Math.random() * 1000); // Variable delay for natural feel
    
    setTimeout(() => {
      let responseContent = "";
      
      // Context-aware responses
      if (userText.includes("help") || userText.includes("support")) {
        responseContent = "I'm here to help! Would you like information about our emotional support features, token earning options, or premium benefits?";
      } else if (userText.includes("token") || userText.includes("reward") || userText.includes("earn")) {
        responseContent = "You can earn tokens through daily check-ins, helping others, completing challenges, and more! What activities interest you most?";
      } else if (userText.includes("premium") || userText.includes("upgrade") || userText.includes("subscription")) {
        responseContent = "Premium members unlock exclusive features like advanced emotion tracking, prioritized matches, and special chat rooms! Would you like to learn more about our plans?";
      } else if (userText.includes("thank") || userText.includes("thanks") || userText.includes("appreciate")) {
        responseContent = "You're very welcome! Is there anything else you'd like to explore today in your emotional wellness journey?";
      } else if (userText.includes("sad") || userText.includes("depressed") || userText.includes("down")) {
        responseContent = "I'm sorry you're feeling that way. Would you like me to suggest some mood-lifting activities or connect you with others who understand what you're going through?";
      } else if (userText.includes("happy") || userText.includes("great") || userText.includes("good")) {
        responseContent = "That's wonderful to hear! Would you like to explore ways to share this positive energy or activities that might maintain this good mood?";
      } else if (userText.length < 10) {
        // For very short responses, ask engaging follow-up questions
        responseContent = "I'd love to hear more about that. Could you tell me a bit more so I can better understand how you're feeling?";
      } else {
        // Default to emotion-based responses for more general conversations
        responseContent = getRandomAIResponse(currentEmotion);
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, typingDelay);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-poppins font-semibold text-xl mb-4">Your AI Companion</h2>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary text-white p-4">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              MoodBot
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                  
                  <div 
                    className={`rounded-lg p-3 max-w-[75%] ${
                      message.sender === 'user' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <CardContent className="p-4 border-t border-gray-100">
            <div className="flex">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="rounded-r-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                className="rounded-l-none"
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
