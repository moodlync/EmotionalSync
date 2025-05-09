import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

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
  logoSize = 12,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  isAuthenticated = false
}: AuthPageLogoProps) {
  const [, navigate] = useLocation();
  
  // Calculate the size for the logo
  const finalSize = logoSize || 60;
  
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
  
  // Font size for the ML text based on logo size
  const mlTextSize = finalSize >= 100 ? 'text-4xl' : 
                     finalSize >= 60 ? 'text-2xl' : 
                     finalSize >= 40 ? 'text-xl' : 'text-base';

  return (
    <div className={cn(
      'flex items-center gap-3',
      vertical && 'flex-col',
      className
    )}>
      <div 
        className={cn(
          "flex items-center justify-center bg-blue-500 text-white font-bold rounded-full",
          isAuthenticated && "cursor-pointer"
        )} 
        style={{ width: `${finalSize}px`, height: `${finalSize}px` }}
        onClick={handleLogoClick}
      >
        <span className={mlTextSize}>ML</span>
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
            'font-extrabold tracking-tight leading-none',
            textClasses[textSize]
          )}>
            <span className="text-black">MOOD</span>
            <span className="text-red-500">LYNC</span>
          </div>
          
          {showTagline && (
            <div className="text-black/70 text-xs leading-tight">
              Connect - Detect - Reflect
            </div>
          )}
        </div>
      )}
    </div>
  );
}