import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Facebook, Link, Linkedin, Twitter, Send, MessageSquare, Share } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ShareMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: {
    id: number;
    title: string;
    description: string;
    tokenAmount: number;
    isAchieved: boolean;
  };
  currentTokens: number;
  username: string;
}

type SharePlatform = "twitter" | "facebook" | "linkedin" | "whatsapp" | "telegram" | "email" | "copy_link";

interface ShareOption {
  id: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function ShareMilestoneModal({
  open,
  onOpenChange,
  milestone,
  currentTokens,
  username
}: ShareMilestoneModalProps) {
  const [shareSuccessful, setShareSuccessful] = useState<SharePlatform | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  
  const progress = milestone.isAchieved 
    ? 100 
    : Math.min(100, Math.round(((currentTokens || 0) / (milestone.tokenAmount || 1)) * 100));
  
  const shareOptions: ShareOption[] = [
    {
      id: "twitter",
      label: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-blue-400 hover:bg-blue-500"
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-blue-700 hover:bg-blue-800"
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <Send className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      id: "email",
      label: "Email",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-gray-600 hover:bg-gray-700"
    },
    {
      id: "copy_link",
      label: "Copy Link",
      icon: <Link className="h-5 w-5" />,
      color: "bg-gray-800 hover:bg-gray-900"
    }
  ];
  
  // Generate a default share message
  const getDefaultShareMessage = (): string => {
    if (milestone.isAchieved) {
      return `I've achieved the ${milestone.tokenAmount} tokens milestone on MoodSync! Join me in this emotional wellness journey.`;
    } else {
      return `I'm working toward the ${milestone.tokenAmount} tokens milestone on MoodSync (${progress}% complete). Join me on this emotional wellness journey!`;
    }
  };
  
  const getMessage = (): string => {
    return customMessage || getDefaultShareMessage();
  };
  
  const getShareUrl = (platform: SharePlatform, message: string) => {
    // Generate a UUID to track this specific share
    const trackingId = uuidv4();
    
    // Base url for the milestone share page
    const shareBaseUrl = `${window.location.origin}/share/milestone`;
    const shareUrl = `${shareBaseUrl}?user=${encodeURIComponent(username)}&milestone=${milestone.tokenAmount}&trackingId=${trackingId}`;
    
    // Platform-specific share URLs
    switch (platform) {
      case "twitter":
        return {
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "facebook":
        return {
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "linkedin":
        return {
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(message)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "whatsapp":
        return {
          url: `https://wa.me/?text=${encodeURIComponent(message + " " + shareUrl)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "telegram":
        return {
          url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "email":
        return {
          url: `mailto:?subject=${encodeURIComponent(`My MoodSync Milestone: ${milestone.tokenAmount} Tokens`)}&body=${encodeURIComponent(message + "\n\n" + shareUrl)}`,
          trackingUrl: shareUrl,
          trackingId
        };
        
      case "copy_link":
        return {
          url: "",
          trackingUrl: shareUrl,
          trackingId
        };
        
      default:
        return {
          url: shareUrl,
          trackingUrl: shareUrl,
          trackingId
        };
    }
  };
  
  const handleShare = async (platform: SharePlatform) => {
    try {
      setIsSubmitting(true);
      const shareMessage = getMessage();
      const { url, trackingUrl, trackingId } = getShareUrl(platform, shareMessage);
      
      // Record the share on the server first
      await apiRequest("POST", "/api/milestone-shares", {
        milestone: milestone.tokenAmount,
        platform,
        shareUrl: trackingUrl,
        shareMessage,
        trackingId
      });
      
      // Now handle the actual sharing
      if (platform === "copy_link") {
        await navigator.clipboard.writeText(trackingUrl);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard"
        });
      } else {
        // Open the share URL in a new window
        window.open(url, "_blank", "noopener,noreferrer");
      }
      
      // Mark this platform as successfully shared
      setShareSuccessful(platform);
      
      // Invalidate the user's token balance query to reflect any new tokens earned
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      
      // Reset the success state after a short delay
      setTimeout(() => {
        setShareSuccessful(null);
      }, 3000);
    } catch (error) {
      console.error("Error sharing milestone:", error);
      toast({
        title: "Share failed",
        description: "Could not share your milestone. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Share Your Token Milestone
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                "px-2 py-0.5"
              )}
            >
              {milestone.tokenAmount} Tokens
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Share your progress with friends and {milestone.isAchieved ? "show off your achievement!" : "get support to reach this milestone!"}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="social" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="custom">Custom Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mt-4">
              {shareOptions.map(option => (
                <Button
                  key={option.id}
                  variant="default"
                  className={cn(
                    "flex items-center gap-2 w-full", 
                    option.color,
                    isSubmitting && "opacity-70 cursor-not-allowed"
                  )}
                  disabled={isSubmitting}
                  onClick={() => handleShare(option.id)}
                >
                  {shareSuccessful === option.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    option.icon
                  )}
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
            
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Default Message:</p>
              <p className="text-sm">{getDefaultShareMessage()}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Customize your share message:</p>
              <Textarea
                placeholder="Enter your custom message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => setCustomMessage(getDefaultShareMessage())}
                disabled={isSubmitting}
              >
                Use Default
              </Button>
              
              <Button
                variant="default"
                className="flex gap-2 items-center"
                disabled={isSubmitting}
                onClick={() => handleShare("copy_link")}
              >
                {shareSuccessful === "copy_link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Link
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <div className="text-xs text-muted-foreground">
            <Share className="h-3 w-3 inline mr-1" />
            Earn tokens by sharing milestones for the first time!
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}