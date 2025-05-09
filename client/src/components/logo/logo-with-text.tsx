import { cn } from '@/lib/utils';

interface LogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
}

export default function LogoWithText({
  className,
  logoSize = 48,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false
}: LogoWithTextProps) {
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
  
  // Calculate font size based on logo size
  const fontSize = Math.max(12, Math.floor(logoSize / 3));

  return (
    <div className={cn(
      'flex items-center gap-5',
      vertical && 'flex-col',
      className
    )}>
      <div 
        className="flex items-center justify-center bg-blue-500 text-white font-bold rounded-full hover:scale-105 transition-transform duration-200"
        style={{ 
          width: logoSize, 
          height: logoSize,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <span style={{ fontSize: `${fontSize}px` }}>ML</span>
      </div>
      
      {!hideText && (
        <div className="flex flex-col">
          <div className={cn(
            'font-extrabold tracking-tight leading-none text-black dark:text-white',
            textSize === 'sm' ? 'text-xl' : 
            textSize === 'md' ? 'text-2xl' : 
            textSize === 'lg' ? 'text-3xl' : 'text-4xl'
          )}>
            MoodLync
          </div>
          
          {showTagline && (
            <div className={cn(
              'text-black/70 dark:text-white/70 leading-tight',
              taglineSizeClasses[textSize]
            )}>
              Connecting through emotions
            </div>
          )}
        </div>
      )}
    </div>
  );
}