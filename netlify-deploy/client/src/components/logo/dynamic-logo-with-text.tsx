import { cn } from '@/lib/utils';
import DynamicLogo from './dynamic-logo';
import { useState, useEffect } from 'react';

interface DynamicLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  isWelcomeScreen?: boolean;
  enableHeartbeat?: boolean;
}

export default function DynamicLogoWithText({
  className,
  logoSize = 53, // Increased by 10% (from 48 to 53)
  textSize = 'sm', // Default to smaller text
  vertical = false,
  hideText = false,
  showTagline = true, // Always show tagline by default
  isWelcomeScreen = false, // Special enhanced mode for welcome screen
  enableHeartbeat = false // Disable heartbeat animation effect per user request
}: DynamicLogoWithTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);
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
  
  // No animation on logo load per user request
  useEffect(() => {
    if (isWelcomeScreen) {
      setIsAnimating(false); // Disable animation
    }
  }, [isWelcomeScreen]);
  
  // Optimized text sizes for better fit
  const textSizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold',
    xl: 'text-lg font-semibold'
  };

  const taglineSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };
  
  // Calculate welcome screen specific sizes
  const welcomeLogoSize = isWelcomeScreen ? (logoSize * 2) : logoSize; // Further increased welcome screen logo size for better heartbeat visibility
  const welcomeTextSize = isWelcomeScreen ? 
    (textSize === 'sm' ? 'md' : 
     textSize === 'md' ? 'lg' : 
     textSize === 'lg' ? 'xl' : 'xl') : textSize;

  return (
    <div className={cn(
      'flex items-center',
      vertical ? 'flex-col gap-2' : 'gap-3', // Increased spacing
      isWelcomeScreen && 'justify-center py-4',
      className
    )}>
      <div className="relative flex-shrink-0"> {/* Added flex-shrink-0 for mobile */}
        <DynamicLogo 
          size={welcomeLogoSize} 
          isAnimating={false}
          pulseEffect={false}
          heartbeatEffect={false}
          className="z-10"
        />
      </div>
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center", 
          isWelcomeScreen && "space-y-1",
          vertical ? "items-center mt-2" : "ml-2", // Increased spacing
          "max-w-[160px] md:max-w-none" // Added max-width for mobile
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
            <div></div>
          )}
        </div>
      )}
    </div>
  );
}