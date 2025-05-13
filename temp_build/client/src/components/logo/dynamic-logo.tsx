import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
  size?: number;
  isAnimating?: boolean;
  pulseEffect?: boolean;
  heartbeatEffect?: boolean;
}

export default function DynamicLogo({ 
  className, 
  size = 36,
  isAnimating = false,
  pulseEffect = false,
  heartbeatEffect = false
}: DynamicLogoProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center relative",
        pulseEffect && "animate-pulse",
        heartbeatEffect && "animate-heartbeat",
        className
      )} 
      style={{ 
        width: size, 
        height: size
      }}
    >
      {/* Using the actual image directly */}
      <img 
        src="/assets/moodlync-logo-resized.jpg" 
        alt="MoodLync Logo" 
        width={size} 
        height={size} 
        className={cn(
          "object-contain",
          isAnimating && "transition-transform duration-300",
          heartbeatEffect && "animate-heartbeat"
        )}
      />
    </div>
  );
}