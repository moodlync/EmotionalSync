import { cn } from "@/lib/utils";

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
          <div className="flex items-center justify-center rounded-full w-10 h-10 bg-blue-500 text-white font-bold overflow-hidden">
            <span className="text-xs">ML</span>
          </div>
          {/* Text removed as requested */}
        </div>
      </div>
    </div>
  );
}