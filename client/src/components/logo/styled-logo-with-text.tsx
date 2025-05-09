import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { useLocation } from 'wouter';
import logoImage from '@/assets/moodlync-logo-icon.png';

interface StyledLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  enableHeartbeat?: boolean;
  enableSpin?: boolean;
  isAuthenticated?: boolean;
}

export default function StyledLogoWithText({
  className,
  logoSize = 48,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  enableHeartbeat = true,
  enableSpin = true,
  isAuthenticated = false
}: StyledLogoWithTextProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, navigate] = useLocation();
  
  // Calculate the adjusted size (85% larger)
  const adjustedLogoSize = Math.floor(logoSize * 1.85);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const textSizeClasses = {
    sm: 'text-2xl', // Increased by 85%
    md: 'text-3xl', // Increased by 85%
    lg: 'text-4xl', // Increased by 85%
    xl: 'text-5xl'  // Increased by 85%
  };

  const taglineSizeClasses = {
    sm: 'text-sm',  // Increased by 85%
    md: 'text-base', // Increased by 85%
    lg: 'text-lg',  // Increased by 85%
    xl: 'text-xl'   // Increased by 85%
  };

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');
  
  // Handle logo/text click
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/');
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-6', // Increased gap
      vertical && 'flex-col',
      className
    )}>
      <div 
        className={cn(
          "flex items-center justify-center cursor-pointer",
          enableHeartbeat && "animate-very-slow-heartbeat",
          isAuthenticated && "cursor-pointer"
        )} 
        style={{ width: `${adjustedLogoSize}px`, height: `${adjustedLogoSize}px` }}
        onClick={handleLogoClick}
      >
        <img 
          src={logoImage} 
          alt="MoodLync Logo" 
          className={cn(
            "w-full h-full object-contain",
            enableSpin && "animate-very-slow-spin"
          )}
        />
      </div>
      
      {!hideText && (
        <div 
          className={cn(
            "flex flex-col",
            isAuthenticated && "cursor-pointer"
          )}
          onClick={handleLogoClick}
        >
          <div className={cn(
            'font-extrabold tracking-tight leading-none',
            textSizeClasses[textSize]
          )}>
            <span className={isDarkMode ? "text-white" : "text-black"}>MOOD</span>
            <span className="text-red-500">LYNC</span>
          </div>
          
          {showTagline && (
            <div className={cn(
              'text-black/70 dark:text-white/70 leading-tight',
              taglineSizeClasses[textSize]
            )}>
              Connect - Detect - Reflect
            </div>
          )}
        </div>
      )}
    </div>
  );
}