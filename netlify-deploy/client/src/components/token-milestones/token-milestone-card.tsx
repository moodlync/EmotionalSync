import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Trophy, Gem, Award } from "lucide-react";
import AnimatedShareButton from "@/components/share/animated-share-button";
import ShareMilestoneModal from "./share-milestone-modal";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface TokenMilestoneCardProps {
  milestone: {
    id: number;
    title: string;
    description: string;
    tokenAmount: number;
    isAchieved: boolean;
    badgeIcon?: React.ReactNode;
    badgeColor?: string;
    currentTokens?: number;
    shareUrl?: string;
  };
  highlightShare?: boolean;
}

export default function TokenMilestoneCard({ milestone, highlightShare = false }: TokenMilestoneCardProps) {
  const { user } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Calculate the progress toward this milestone
  const calculateProgress = () => {
    if (!milestone.currentTokens) return 0;
    // Prevent division by zero and NaN results
    const tokenAmount = milestone.tokenAmount || 1;
    const progress = Math.min(100, Math.round((milestone.currentTokens / tokenAmount) * 100));
    return progress;
  };
  
  const progress = calculateProgress();
  
  const handleShareClick = () => {
    setShareModalOpen(true);
  };
  
  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 h-full flex flex-col",
        milestone.isAchieved ? "border-amber-200 dark:border-amber-800" : "hover:shadow-md",
        highlightShare && "ring-2 ring-primary ring-offset-2"
      )}>
        <CardHeader className={cn(
          "pb-3",
          milestone.isAchieved ? "bg-amber-50 dark:bg-amber-950/30" : ""
        )}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center text-lg line-clamp-1">
                {milestone.title}
                {milestone.isAchieved && (
                  <Check className="h-4 w-4 text-green-500 ml-2" />
                )}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center px-2 py-1",
                milestone.isAchieved ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              {milestone.badgeIcon || <Trophy className="h-4 w-4 mr-1" />}
              <span>{milestone.tokenAmount}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3 pb-4 flex flex-col flex-1 justify-between">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{milestone.description}</p>
            
            {user && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {milestone.currentTokens || 0} tokens</span>
                  <span>Goal: {milestone.tokenAmount} tokens</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                {milestone.isAchieved ? (
                  <div className="flex items-center justify-center py-2 text-amber-600 dark:text-amber-400 text-sm border rounded-md bg-amber-50 dark:bg-amber-900/10 mt-4">
                    <Award className="h-5 w-5 mr-2" />
                    <span className="font-medium">Milestone Achieved!</span>
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {(milestone.currentTokens || 0)} of {milestone.tokenAmount} tokens earned ({progress}% complete)
                  </p>
                )}
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex justify-end mt-4">
              <AnimatedShareButton 
                onClick={handleShareClick} 
                highlightAnimation={highlightShare}
                tooltip="Share this milestone"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {user && (
        <ShareMilestoneModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          milestone={milestone}
          currentTokens={milestone.currentTokens || 0}
          username={user.username}
        />
      )}
    </>
  );
}