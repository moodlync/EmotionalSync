import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Award, ExternalLink, ArrowRight, Check, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserMilestoneData {
  user: {
    username: string;
    avatar?: string;
    level: number;
    createdAt: string;
  };
  milestone: number;
  currentTokens: number;
  achieved: boolean;
  sharerUserId?: number;
  trackingId?: string;
}

export default function MilestonePage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [hasRecordedClick, setHasRecordedClick] = useState(false);
  
  // Parse query parameters
  const params = new URLSearchParams(window.location.search);
  const username = params.get("user");
  const milestone = params.get("milestone");
  const trackingId = params.get("trackingId");
  
  // Fetch share data
  const { data, isLoading, error } = useQuery<UserMilestoneData>({
    queryKey: ["/api/milestone-share", username, milestone, trackingId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (username) queryParams.set("username", username);
      if (milestone) queryParams.set("milestone", milestone);
      if (trackingId) queryParams.set("trackingId", trackingId);
      
      const response = await fetch(`/api/milestone-share?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load milestone data");
      }
      return response.json();
    },
    enabled: !!username && !!milestone,
  });
  
  // Record click when page loads (if tracking ID is provided)
  useEffect(() => {
    const recordClick = async () => {
      if (trackingId && data?.sharerUserId && !hasRecordedClick) {
        try {
          await apiRequest("POST", "/api/milestone-share/click", {
            trackingId,
            sharerUserId: data.sharerUserId
          });
          setHasRecordedClick(true);
        } catch (err) {
          console.error("Failed to record click:", err);
        }
      }
    };
    
    if (data) {
      recordClick();
    }
  }, [data, trackingId, hasRecordedClick]);
  
  // Calculate progress percentage
  const progressPercentage = data 
    ? Math.min(100, Math.round(((data.currentTokens || 0) / (data.milestone || 1)) * 100)) 
    : 0;
  
  // Handle sign-up click
  const handleSignUpClick = () => {
    // Redirect to auth page with referral info
    window.location.href = `/auth?referral=${encodeURIComponent(username || "")}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading milestone information...</p>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Milestone Not Found</CardTitle>
              <CardDescription>
                Sorry, the milestone you're looking for could not be found or has expired.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => window.location.href = "/"}
              >
                Go to MoodSync Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full">
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10 border">
                  {data.user.avatar ? (
                    <AvatarImage src={data.user.avatar} alt={data.user.username} />
                  ) : (
                    <AvatarFallback>{data.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{data.user.username}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Level {data.user.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MoodSync user since {formatDistanceToNow(new Date(data.user.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <CardTitle className="text-xl">
                {data.achieved ? (
                  <span className="flex items-center text-amber-600 dark:text-amber-400">
                    <Award className="h-5 w-5 mr-2" />
                    Achievement Unlocked!
                  </span>
                ) : (
                  <span>Working Toward a Milestone</span>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {data.achieved 
                  ? `${data.user.username} has reached the ${data.milestone} tokens milestone on MoodSync!`
                  : `${data.user.username} is working toward the ${data.milestone} tokens milestone on MoodSync.`
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md bg-muted/30 border space-y-3">
              <div className="flex justify-between text-sm">
                <span>Token Progress</span>
                <span className="font-medium">{data.currentTokens} / {data.milestone}</span>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {data.achieved 
                    ? "Milestone achieved! 🎉" 
                    : `${progressPercentage}% complete`
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">What is MoodSync?</h3>
              <p className="text-sm text-muted-foreground">
                MoodSync is an emotional wellness platform that helps you track, understand, and improve your emotional well-being through:
              </p>
              <div className="space-y-1.5 mt-2">
                {[
                  "Real-time emotional connections with others",
                  "Mood tracking and emotional insights",
                  "Token rewards for emotional wellness activities",
                  "Premium features for enhanced emotional health"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full flex items-center justify-center" 
              onClick={handleSignUpClick}
            >
              Join MoodSync Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Safe, secure, and privacy-focused platform
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}