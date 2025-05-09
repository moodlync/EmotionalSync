import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
  size?: number;
}

export default function DynamicLogo({ 
  className, 
  size = 36
}: DynamicLogoProps) {
  // Calculate font size based on logo size
  const fontSize = Math.max(10, Math.floor(size / 3));
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-blue-500 text-white font-bold rounded-full",
        className
      )} 
      style={{ 
        width: size, 
        height: size
      }}
    >
      <span style={{ fontSize: `${fontSize}px` }}>ML</span>
    </div>
  );
}