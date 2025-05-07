import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Users, 
  Download,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SocialButtonsProps = {
  videoId: number;
}

export function SocialButtons({ videoId }: SocialButtonsProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  
  // Check if user has liked the video
  const { data: likeStatus, isLoading: isLikeStatusLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}/like-status`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/videos/${videoId}/like-status`);
        return await res.json();
      } catch (error) {
        return { liked: false };
      }
    },
    enabled: !!user,
  });
  
  // Check if user has saved the video
  const { data: saveStatus, isLoading: isSaveStatusLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}/save-status`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/videos/${videoId}/save-status`);
        return await res.json();
      } catch (error) {
        return { saved: false };
      }
    },
    enabled: !!user,
  });
  
  // Check if user is following the video
  const { data: followStatus, isLoading: isFollowStatusLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}/follow-status`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/videos/${videoId}/follow-status`);
        return await res.json();
      } catch (error) {
        return { following: false };
      }
    },
    enabled: !!user,
  });
  
  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/social-like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/like-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not like/unlike this video",
        variant: "destructive",
      });
    },
  });
  
  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/save`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/save-status`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not save/unsave this video",
        variant: "destructive",
      });
    },
  });
  
  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/follow`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/follow-status`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not follow/unfollow this video",
        variant: "destructive",
      });
    },
  });
  
  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/share`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}`] });
      
      // Copy video URL to clipboard
      const videoUrl = `${window.location.origin}/videos/${videoId}`;
      navigator.clipboard.writeText(videoUrl).then(() => {
        toast({
          title: "Link copied!",
          description: "Video link copied to clipboard",
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not share this video",
        variant: "destructive",
      });
    },
  });
  
  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/download`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}`] });
      
      // Create a link to download the video
      if (data.videoUrl) {
        const a = document.createElement('a');
        a.href = data.videoUrl;
        a.download = `video-${videoId}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not download this video",
        variant: "destructive",
      });
    },
  });
  
  // Handle button clicks
  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like this video",
      });
      return;
    }
    
    setAnimatingButton("like");
    setTimeout(() => setAnimatingButton(null), 500);
    likeMutation.mutate();
  };
  
  const handleSave = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save this video",
      });
      return;
    }
    
    setAnimatingButton("save");
    setTimeout(() => setAnimatingButton(null), 500);
    saveMutation.mutate();
  };
  
  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow this video",
      });
      return;
    }
    
    setAnimatingButton("follow");
    setTimeout(() => setAnimatingButton(null), 500);
    followMutation.mutate();
  };
  
  const handleShare = () => {
    setAnimatingButton("share");
    setTimeout(() => setAnimatingButton(null), 500);
    shareMutation.mutate();
  };
  
  const handleDownload = () => {
    setAnimatingButton("download");
    setTimeout(() => setAnimatingButton(null), 500);
    downloadMutation.mutate();
  };
  
  const isLoading = isAuthLoading || isLikeStatusLoading || isSaveStatusLoading || isFollowStatusLoading;
  
  return (
    <div className="flex justify-center gap-2 md:gap-4 py-2 border-t border-b">
      <TooltipProvider delayDuration={300}>
        {/* Like button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading || likeMutation.isPending}
              className={`space-x-1 ${animatingButton === "like" ? "animate-pulse" : ""}`}
            >
              {likeStatus?.liked ? (
                <ThumbsUp className="h-5 w-5 fill-current" />
              ) : (
                <ThumbsUp className="h-5 w-5" />
              )}
              <span>Like</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{likeStatus?.liked ? "Unlike this video" : "Like this video"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Comment button (placeholder) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `#comments-section`}
              className="space-x-1"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Comment</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Add a comment</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Share button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className={`space-x-1 ${animatingButton === "share" ? "animate-pulse" : ""}`}
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Share this video</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Save button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isLoading || saveMutation.isPending}
              className={`space-x-1 ${animatingButton === "save" ? "animate-pulse" : ""}`}
            >
              {saveStatus?.saved ? (
                <Bookmark className="h-5 w-5 fill-current" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
              <span>Save</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{saveStatus?.saved ? "Remove from saved" : "Save for later"}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Follow button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFollow}
              disabled={isLoading || followMutation.isPending}
              className={`space-x-1 ${animatingButton === "follow" ? "animate-pulse" : ""}`}
            >
              {followStatus?.following ? (
                <Users className="h-5 w-5 fill-current" />
              ) : (
                <Users className="h-5 w-5" />
              )}
              <span>{followStatus?.following ? "Following" : "Follow"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{followStatus?.following ? "Unfollow this video" : "Follow for updates"}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Download button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className={`space-x-1 ${animatingButton === "download" ? "animate-pulse" : ""}`}
            >
              <Download className="h-5 w-5" />
              <span>Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Download this video</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}