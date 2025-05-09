import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Clock } from "lucide-react";

type VerificationStatus = "verified" | "not_verified" | "pending";

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  withTooltip?: boolean;
  withLabel?: boolean;
}

export function VerificationBadge({
  status,
  size = "md",
  className,
  withTooltip = true,
  withLabel = true,
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "h-5 text-xs",
    md: "h-6 text-sm",
    lg: "h-7 text-base",
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };
  
  const badgeContent = (
    <Badge
      variant={status === "verified" ? "default" : status === "pending" ? "outline" : "secondary"}
      className={cn(
        "gap-1 px-2 font-medium", 
        sizeClasses[size],
        status === "verified" ? "bg-green-600 hover:bg-green-700" : "",
        status === "pending" ? "border-yellow-400 text-yellow-600" : "",
        status === "not_verified" ? "bg-transparent text-gray-500" : "",
        className
      )}
    >
      {status === "verified" && (
        <img 
          src="/assets/verification/verification-badge.jpg" 
          alt="Verified Badge" 
          className="inline h-5 w-5 rounded-full object-cover"
          style={{ height: iconSizes[size], width: iconSizes[size] }}
        />
      )}
      {status === "pending" && (
        <Clock className="inline" size={iconSizes[size]} />
      )}
      {status === "not_verified" && (
        <HelpCircle className="inline" size={iconSizes[size]} />
      )}
      {withLabel && (
        <span>
          {status === "verified" && "Verified"}
          {status === "pending" && "Pending"}
          {status === "not_verified" && "Not Verified"}
        </span>
      )}
    </Badge>
  );

  if (!withTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {status === "verified" && (
            <p className="text-sm">This user has been verified through our identity verification process.</p>
          )}
          {status === "pending" && (
            <p className="text-sm">Verification is in progress. This typically takes 1-3 business days.</p>
          )}
          {status === "not_verified" && (
            <p className="text-sm">This user has not been verified yet. Premium users can verify their identity for additional features.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}