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
  logoSize = 125,
  textSize = 'md',
  vertical = false,
  hideText = false,
  showTagline = false,
  isAuthenticated = false
}: AuthPageLogoProps) {
  const [, navigate] = useLocation();
  
  // Calculate size based on text size to match text height (increased by 25%)
  const reducedSize = textSize === 'sm' ? 38 : 
                     textSize === 'md' ? 45 : 
                     textSize === 'lg' ? 53 : 60;
  
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
      'flex items-center gap-2',
      vertical && 'flex-col items-center',
      className
    )}>
      <div 
        className={cn(
          "flex items-center justify-center mb-0",
          isAuthenticated && "cursor-pointer"
        )} 
        style={{ display: "flex", alignItems: "center" }}
        onClick={handleLogoClick}
      >
        {/* Using the actual image directly */}
        <img 
          src="/assets/moodlync-logo-resized.jpg" 
          alt="MoodLync Logo" 
          width={reducedSize} 
          height={reducedSize} 
          className="object-contain rounded-sm"
          style={{ 
            marginBottom: "1px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        />
      </div>
      
      {!hideText && (
        <div 
          className={cn(
            "flex flex-col mt-0",
            isAuthenticated && "cursor-pointer"
          )}
          onClick={handleLogoClick}
        >
          <div className={cn(
            'font-extrabold tracking-tight leading-none text-center',
            textSize === 'sm' ? 'text-md' : 
            textSize === 'md' ? 'text-lg' : 
            textSize === 'lg' ? 'text-xl' : 'text-2xl'
          )}>
            <span className="text-black">MOOD</span>
            <span className="text-red-500">LYNC</span>
          </div>
          
          {showTagline && (
            <div className="text-black/70 text-xs leading-tight text-center mt-0.5">
              Connect - Detect - Reflect
            </div>
          )}
        </div>
      )}
    </div>
  );
}