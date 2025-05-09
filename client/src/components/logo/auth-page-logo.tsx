import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import newLogoSrc from '@/assets/new-logo.jpg';

interface AuthPageLogoProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  showTagline?: boolean;
  isAuthenticated?: boolean;
}

export default function AuthPageLogo({
  className,
  logoSize = 125,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  isAuthenticated = false
}: AuthPageLogoProps) {
  const [, navigate] = useLocation();
  
  // Reduce size by 75% as requested
  const reducedSize = Math.floor(logoSize * 0.25);
  
  // Handle logo/text click - navigates to home when authenticated
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/');
    }
  };

  // Text size mapping
  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn(
      'flex items-center gap-3',
      vertical && 'flex-col',
      className
    )}>
      <div 
        className={cn(
          "flex items-center justify-center",
          isAuthenticated && "cursor-pointer"
        )} 
        onClick={handleLogoClick}
      >
        <img 
          src={newLogoSrc} 
          alt="MoodSync Logo" 
          style={{ 
            width: `${reducedSize}px`, 
            height: `${reducedSize}px`,
            objectFit: 'contain'
          }} 
        />
      </div>
      
      {!hideText && (
        <div 
          className={cn(
            "flex flex-col",
            isAuthenticated && "cursor-pointer"
          )}
          onClick={handleLogoClick}
        >
          <div className={cn(
            'font-extrabold tracking-tight leading-none text-center',
            textClasses[textSize]
          )}>
            <span className="text-black">MOOD</span>
            <span className="text-red-500">SYNC</span>
          </div>
          
          {showTagline && (
            <div className="text-black/70 text-xs leading-tight text-center">
              Connect - Detect - Reflect
            </div>
          )}
        </div>
      )}
    </div>
  );
}