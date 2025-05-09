import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { useLocation } from 'wouter';

interface AuthPageLogoProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  isAuthenticated?: boolean;
}

export default function AuthPageLogo({
  className,
  logoSize = 48,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  isAuthenticated = false
}: AuthPageLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, navigate] = useLocation();
  
  // Calculate the adjusted size for the auth page logo
  const adjustedLogoSize = Math.floor(logoSize * 2.5);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  // Handle logo/text click - navigates to home when authenticated
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/');
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-6',
      vertical && 'flex-col',
      className
    )}>
      <div 
        className={cn(
          "flex items-center justify-center",
          isAuthenticated && "cursor-pointer"
        )} 
        style={{ width: `${adjustedLogoSize}px`, height: `${adjustedLogoSize}px` }}
        onClick={handleLogoClick}
      >
        <img 
          src="/images/moodlync-logo-new.jpg" 
          alt="MoodLync Logo" 
          className="w-full h-full object-contain"
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
            <span className="text-black">MOOD</span>
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