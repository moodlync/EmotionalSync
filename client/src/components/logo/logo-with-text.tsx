import { cn } from '@/lib/utils';
import AnimatedLogo from './animated-logo';

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

  return (
    <div className={cn(
      'flex items-center gap-5',
      vertical && 'flex-col',
      className
    )}>
      <AnimatedLogo size={logoSize} />
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