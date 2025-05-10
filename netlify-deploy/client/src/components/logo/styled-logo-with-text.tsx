import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { useLocation } from 'wouter';

interface StyledLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  isAuthenticated?: boolean;
}

export default function StyledLogoWithText({
  className,
  logoSize = 48,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  isAuthenticated = false
}: StyledLogoWithTextProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, navigate] = useLocation();
  
  // Calculate the adjusted size (make logo larger)
  const adjustedLogoSize = Math.floor(logoSize * 2.5);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 50% smaller text sizes as requested
  const textSizeClasses = {
    sm: 'text-xs', // 50% smaller
    md: 'text-sm', // 50% smaller
    lg: 'text-base', // 50% smaller
    xl: 'text-lg'  // 50% smaller
  };

  const taglineSizeClasses = {
    sm: 'text-xs',  // 50% smaller
    md: 'text-xs', // 50% smaller
    lg: 'text-sm',  // 50% smaller
    xl: 'text-base'   // 50% smaller
  };

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');
  
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
          "flex items-center justify-center cursor-pointer",
          isAuthenticated && "cursor-pointer"
        )} 
        style={{ width: `${adjustedLogoSize}px`, height: `${adjustedLogoSize}px` }}
        onClick={handleLogoClick}
      >
        <div className="w-full h-full bg-blue-500 text-white font-bold flex items-center justify-center rounded-full">
          <span className="text-lg">ML</span>
        </div>
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
            <span className="text-red-600">LYNC</span>
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