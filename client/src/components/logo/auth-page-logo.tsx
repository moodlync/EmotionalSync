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
          "flex items-center justify-center mb-2",
          isAuthenticated && "cursor-pointer"
        )} 
        onClick={handleLogoClick}
      >
        {/* SVG version of the logo instead of loading external image */}
        <svg 
          width={reducedSize} 
          height={reducedSize} 
          viewBox="0 0 300 300" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue curved line at top */}
          <path d="M50,100 C100,50 200,50 250,100" stroke="#3b82f6" strokeWidth="20" fill="none" />
          
          {/* Red person icon in center */}
          <circle cx="150" cy="120" r="25" fill="#f43f5e" />
          <path d="M150,145 C120,145 110,170 110,190 C110,210 120,220 150,220 C180,220 190,210 190,190 C190,170 180,145 150,145" fill="#f43f5e" />
          
          {/* Red curved line (left) */}
          <path d="M50,100 C30,140 30,180 50,220" stroke="#dc2626" strokeWidth="20" fill="none" />
          
          {/* Green curved line (right) */}
          <path d="M250,100 C270,140 270,180 250,220" stroke="#16a34a" strokeWidth="20" fill="none" />
        </svg>
      </div>
      
      {!hideText && (
        <div 
          className={cn(
            "flex flex-col mt-1",
            isAuthenticated && "cursor-pointer"
          )}
          onClick={handleLogoClick}
        >
          <div className={cn(
            'font-extrabold tracking-tight leading-none text-center',
            textSize === 'sm' ? 'text-sm' : 
            textSize === 'md' ? 'text-md' : 
            textSize === 'lg' ? 'text-lg' : 'text-xl'
          )}>
            <span className="text-black">MOOD</span>
            <span className="text-red-500">SYNC</span>
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