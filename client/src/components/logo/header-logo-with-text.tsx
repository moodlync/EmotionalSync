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
  isWelcomeScreen?: boolean;
}

export default function HeaderLogoWithText({
  className,
  logoSize = 65,
  textSize = 'md',
  vertical = false,
  hideText = false,
  enableHeartbeat = true,
  isWelcomeScreen = false
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
      isWelcomeScreen && 'justify-center py-4',
      className
    )}>
      <div className="relative flex-shrink-0">
        {isWelcomeScreen ? (
          <div className="relative group">
            <div className="absolute inset-[-10%] bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <img 
              src={logoImage} 
              alt="MoodLync Logo" 
              className="object-contain relative"
              style={{
                boxShadow: '0 6px 16px rgba(96, 82, 199, 0.3)',
                backgroundColor: 'white',
                width: `${logoSize * 1.5}px`,
                height: `${logoSize * 0.75}px`,
                borderRadius: '9999px',
                padding: '10px',
                border: '2px solid rgba(96, 82, 199, 0.2)'
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center" style={{ width: `${logoSize}px`, height: `${logoSize}px` }}>
            <img 
              src={logoImage} 
              alt="MoodLync Logo" 
              className="w-full h-full object-contain rounded-full" 
            />
          </div>
        )}
      </div>
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center", 
          isWelcomeScreen && "space-y-1",
          vertical ? "items-center mt-2" : "ml-2",
          "max-w-[160px] md:max-w-none"
        )}>
          {/* Text removed as requested */}
        </div>
      )}
    </div>
  );
}