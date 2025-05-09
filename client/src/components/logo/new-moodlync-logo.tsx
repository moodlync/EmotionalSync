import { cn } from "@/lib/utils";
import logoImage from '@/assets/new-moodlync-logo.png';

interface NewMoodLyncLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  darkMode?: boolean;
}

export function NewMoodLyncLogo({
  className,
  width = 200,
  height = 60,
  showText = true,
  darkMode = false
}: NewMoodLyncLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div 
        className="flex items-center" 
        style={{ width, height }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full w-10 h-10 overflow-hidden">
            <img 
              src={logoImage} 
              alt="MoodLync Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          {/* Text removed as requested */}
        </div>
      </div>
    </div>
  );
}