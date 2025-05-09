import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";
import logoImage from '@/assets/moodlync-logo-new.jpg';

interface DynamicLogoProps {
  className?: string;
  size?: number;
  isAnimating?: boolean;
  pulseEffect?: boolean;
  heartbeatEffect?: boolean;
}

export default function DynamicLogo({ 
  className, 
  size = 143,
  isAnimating: propIsAnimating = false,
  pulseEffect = false,
  heartbeatEffect = false
}: DynamicLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');
  
  return (
    <div 
      className={cn(
        "relative cursor-pointer flex items-center justify-center",
        className
      )} 
      style={{ 
        width: size, 
        height: size,
        backgroundColor: 'transparent',
        borderRadius: '50%'
      }}
    >
      {/* Simple transparent logo with no effects */}
      <div 
        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: 'transparent'
        }}
      >
        <img 
          src={logoImage} 
          alt="MoodLync Logo" 
          className="w-full h-full object-contain" 
        />
      </div>
    </div>
  );
}