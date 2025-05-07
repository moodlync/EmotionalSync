import { useState, useEffect } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AISupportChat from './ai-support-chat';

export default function FloatingChatButton() {
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Add a small delay before showing the chat button for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    if (!showChat) {
      setShowChat(true);
      setIsChatMinimized(false);
    } else {
      setIsChatMinimized(!isChatMinimized);
    }
  };

  const closeChat = () => {
    setShowChat(false);
  };

  if (!showButton) return null;

  return (
    <>
      {!showChat && (
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-5 right-5 h-12 w-12 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          onClick={toggleChat}
        >
          <MessageSquareText className="h-5 w-5" />
        </Button>
      )}
      
      {showChat && (
        <AISupportChat
          isMinimized={isChatMinimized}
          onMinimizeToggle={() => setIsChatMinimized(!isChatMinimized)}
          onClose={closeChat}
        />
      )}
    </>
  );
}