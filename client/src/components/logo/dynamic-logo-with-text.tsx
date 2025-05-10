import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface DynamicLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  isWelcomeScreen?: boolean;
}

export default function DynamicLogoWithText({
  className,
  logoSize = 13,
  textSize = 'sm',
  vertical = false,
  hideText = false,
  showTagline = true,
  isWelcomeScreen = false
}: DynamicLogoWithTextProps) {
  const [highlightedWord, setHighlightedWord] = useState(0);
  
  // For welcome screen, cycle through different emotional words
  const emotionalWords = ["Connection", "Empathy", "Growth", "Balance", "Insight"];
  
  // Setup animation for welcome screen text
  useEffect(() => {
    if (isWelcomeScreen) {
      const interval = setInterval(() => {
        setHighlightedWord(prev => (prev + 1) % emotionalWords.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isWelcomeScreen]);
  
  // Calculate welcome screen specific sizes
  const welcomeLogoSize = isWelcomeScreen ? (logoSize * 2) : logoSize;
  const fontSize = Math.max(10, Math.floor(welcomeLogoSize / 3));

  return (
    <div className={cn(
      'flex items-center',
      vertical ? 'flex-col gap-2' : 'gap-3',
      isWelcomeScreen && 'justify-center py-4',
      className
    )}>
      <div className="relative flex-shrink-0">
        <div 
          className="flex items-center justify-center bg-white rounded-full z-10"
          style={{ 
            width: welcomeLogoSize, 
            height: welcomeLogoSize 
          }}
        >
          <img 
            src="/assets/moodlync-logo-resized.jpg" 
            alt="MoodLync Logo" 
            className="w-full h-full object-contain rounded-full" 
          />
        </div>
      </div>
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center", 
          isWelcomeScreen && "space-y-1",
          vertical ? "items-center mt-2" : "ml-2",
          "max-w-[160px] md:max-w-none"
        )}>
          {isWelcomeScreen && !hideText ? (
            <>
              <div className={cn(
                'leading-tight font-medium transition-all duration-500',
                'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
                textSize === 'sm' ? 'text-xs md:text-sm' : 
                textSize === 'md' ? 'text-sm md:text-base' : 
                textSize === 'lg' ? 'text-base md:text-lg' : 'text-lg md:text-xl'
              )}>
                <span className="block animate-fade-in">Experience {emotionalWords[highlightedWord]}</span>
              </div>
            </>
          ) : (
            <div className="font-extrabold tracking-tight leading-none">
              <span className="text-black">MOOD</span>
              <span className="text-red-600">LYNC</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}