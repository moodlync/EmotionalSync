import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import logoImage from '@/assets/moodlync-logo-icon.png';

interface StyledLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
}

export default function StyledLogoWithText({
  className,
  logoSize = 48,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false
}: StyledLogoWithTextProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');

  return (
    <div className={cn(
      'flex items-center gap-5',
      vertical && 'flex-col',
      className
    )}>
      <div className="flex items-center justify-center" style={{ width: `${logoSize}px`, height: `${logoSize}px` }}>
        <img 
          src={logoImage} 
          alt="MoodLync Logo" 
          className="w-full h-full object-contain rounded-full" 
        />
      </div>
      
      {!hideText && (
        <div className="flex flex-col">
          <div className={cn(
            'font-extrabold tracking-tight leading-none',
            textSize === 'sm' ? 'text-xl' : 
            textSize === 'md' ? 'text-2xl' : 
            textSize === 'lg' ? 'text-3xl' : 'text-4xl'
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