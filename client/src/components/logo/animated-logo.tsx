import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export default function AnimatedLogo({ 
  className, 
  size = 56
}: AnimatedLogoProps) {
  // Calculate font size based on logo size
  const fontSize = Math.max(12, Math.floor(size / 3));
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-blue-500 text-white font-bold rounded-full hover:scale-105 transition-transform duration-200",
        className
      )} 
      style={{ 
        width: size, 
        height: size,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <span style={{ fontSize: `${fontSize}px` }}>ML</span>
    </div>
  );
}