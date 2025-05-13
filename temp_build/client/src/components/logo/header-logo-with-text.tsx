import { cn } from '@/lib/utils';

interface HeaderLogoWithTextProps {
  className?: string;
  logoSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
  hideText?: boolean;
  isWelcomeScreen?: boolean;
}

export default function HeaderLogoWithText({
  className,
  logoSize = 65,
  textSize = 'md',
  vertical = false,
  hideText = false,
  isWelcomeScreen = false
}: HeaderLogoWithTextProps) {
  // Calculate font size based on logo size
  const fontSize = Math.max(14, Math.floor(logoSize / 3));

  return (
    <div className={cn(
      'flex items-center',
      vertical ? 'flex-col gap-2' : 'gap-3',
      isWelcomeScreen && 'justify-center py-4',
      className
    )}>
      <div className="relative flex-shrink-0">
        {isWelcomeScreen ? (
          <div className="relative group">
            <div className="absolute inset-[-10%] bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <div className="relative" style={{
                boxShadow: '0 6px 16px rgba(96, 82, 199, 0.3)',
                width: `${logoSize * 1.5}px`,
                height: `${logoSize * 1.5}px`,
                padding: '10px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '2px solid rgba(96, 82, 199, 0.2)'
              }}>
              <img 
                src="/assets/moodlync-logo-resized.jpg" 
                alt="MoodLync Logo" 
                className="w-full h-full object-contain"
                style={{ borderRadius: '50%' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-full" 
            style={{ 
              width: `${logoSize}px`, 
              height: `${logoSize}px`,
              backgroundColor: 'white'
            }}>
            <img 
              src="/assets/moodlync-logo-resized.jpg" 
              alt="MoodLync Logo" 
              className="w-full h-full object-contain rounded-full" 
            />
          </div>
        )}
      </div>
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center", 
          isWelcomeScreen && "space-y-1",
          vertical ? "items-center mt-2" : "ml-2",
          "max-w-[160px] md:max-w-none"
        )}>
          {/* Text removed as requested */}
        </div>
      )}
    </div>
  );
}