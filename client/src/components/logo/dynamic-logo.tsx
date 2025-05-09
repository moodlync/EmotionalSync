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
      {/* SVG version of the logo using the exact design from the provided image */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 300 300" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          isAnimating && "transition-transform duration-300",
          heartbeatEffect && "animate-heartbeat"
        )}
      >
        {/* Blue curved line at top */}
        <path d="M50,100 C100,50 200,50 250,100" stroke="#0096FF" strokeWidth="20" fill="none" />
        
        {/* Red person icon in center */}
        <circle cx="150" cy="120" r="25" fill="#FF4D6A" />
        <path d="M150,145 C120,145 110,170 110,190 C110,210 120,220 150,220 C180,220 190,210 190,190 C190,170 180,145 150,145" fill="#FF4D6A" />
        
        {/* Red curved line (left) */}
        <path d="M50,100 C30,140 30,180 50,220" stroke="#BF0000" strokeWidth="20" fill="none" />
        
        {/* Green curved line (right) */}
        <path d="M250,100 C270,140 270,180 250,220" stroke="#008F00" strokeWidth="20" fill="none" />
      </svg>
    </div>
  );
}