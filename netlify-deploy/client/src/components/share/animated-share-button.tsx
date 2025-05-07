import React, { useState, useEffect } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AnimatedShareButtonProps extends Omit<ButtonProps, 'children'> {
  onClick: () => void;
  highlightAnimation?: boolean;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  tooltip?: string;
  showText?: boolean;
}

export default function AnimatedShareButton({
  onClick,
  highlightAnimation = false,
  variant = "outline",
  size = "icon",
  className,
  tooltip = "Share",
  showText = false,
  ...props
}: AnimatedShareButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Run animation when highlightAnimation prop changes to true
  useEffect(() => {
    if (highlightAnimation) {
      setIsAnimating(true);
      
      // Schedule animation to stop
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [highlightAnimation]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn(
              "relative overflow-hidden",
              isAnimating && "animate-pulse",
              className
            )}
            onClick={handleClick}
            {...props}
          >
            <Share2 className={cn(
              "h-4 w-4",
              isAnimating && "animate-bounce",
              showText && "mr-2"
            )} />
            
            {showText && <span>Share</span>}
            
            {/* Ripple effect for highlight animation */}
            {isAnimating && (
              <span className="absolute inset-0 pointer-events-none">
                <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-primary"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}