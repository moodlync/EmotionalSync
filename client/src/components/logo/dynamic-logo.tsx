import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";

interface DynamicLogoProps {
  className?: string;
  size?: number;
  isAnimating?: boolean;
  pulseEffect?: boolean;
  heartbeatEffect?: boolean;
}

export default function DynamicLogo({ 
  className, 
  size = 36, // Reduced by 75% from original size of 143
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
        "relative cursor-pointer flex items-center justify-center bg-blue-500 text-white font-bold",
        className
      )} 
      style={{ 
        width: size, 
        height: size,
        borderRadius: '50%'
      }}
    >
      <div className="text-xs">ML</div>
    </div>
  );
}