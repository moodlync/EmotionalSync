import { cn } from '@/lib/utils';
import DynamicLogo from './dynamic-logo';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import logoImage from '@/assets/moodlync-logo.png';

interface HeaderLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  enableHeartbeat?: boolean;
}

export default function HeaderLogoWithText({
  className,
  logoSize = 65,
  textSize = 'md',
  vertical = false,
  hideText = false,
  enableHeartbeat = true
}: HeaderLogoWithTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const textSizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold',
    xl: 'text-lg font-semibold'
  };

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');

  return (
    <div className={cn(
      'flex items-center',
      vertical ? 'flex-col gap-2' : 'gap-3',
      className
    )}>
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center" style={{ width: `${logoSize}px`, height: `${logoSize}px` }}>
          <img 
            src={logoImage} 
            alt="MoodLync Logo" 
            className="w-full h-full object-contain rounded-full" 
          />
        </div>
      </div>
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center", 
          vertical ? "items-center mt-2" : "ml-2",
          "max-w-[160px] md:max-w-none"
        )}>
          {/* Text removed as requested */}
        </div>
      )}
    </div>
  );
}