import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface PremiumUpgradeButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  fullWidth?: boolean;
  icon?: boolean;
}

export function PremiumUpgradeButton({
  className,
  variant = "default",
  size = "default",
  children = "Upgrade to Premium",
  fullWidth = false,
  icon = true,
}: PremiumUpgradeButtonProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate("/premium");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        fullWidth && "w-full",
        className
      )}
      onClick={handleClick}
    >
      {icon && <Crown className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}