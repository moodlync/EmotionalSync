import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Share2, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SocialButtons } from "@/components/video/social-buttons";
import { CommentSection } from "@/components/video/comment-section";

export default function VideoPlayerPage() {
  const [, params] = useRoute<{ id: string }>("/video/:id");
  const videoId = parseInt(params?.id || "0", 10);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch the video details
  const { 
    data: video, 
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ["/api/videos", videoId],
    queryFn: async () => {
      if (!videoId) return null;
      const res = await apiRequest("GET", `/api/videos/${videoId}`);
      return await res.json();
    },
    enabled: !!videoId,
    retry: 1
  });
  
  // Handle like video
  const likeVideoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId] });
      
      toast({
        title: "Video liked",
        description: "You've liked this video!",
        variant: "default"
      });
    }
  });
  
  // Handle share video
  const shareVideoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/share`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId] });
      
      toast({
        title: "Video shared",
        description: "This video has been shared!",
        variant: "default"
      });
    }
  });
  
  // Function to share video on social media
  const handleSocialShare = (platform: string) => {
    const videoUrl = window.location.href;
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent("Check out this wellness video on MoodSync!")}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`;
        break;
      default:
        return;
    }
    
    // Open share window
    window.open(shareUrl, "_blank", "width=600,height=400");
    
    // Update share count in the backend
    shareVideoMutation.mutate();
  };
  
  // Format date helper function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Handle premium required error
  useEffect(() => {
    if (isError && (error as any)?.error === 'Premium required') {
      toast({
        title: "Premium Required",
        description: "This video is only available to premium members. Upgrade to access exclusive content.",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-4">
          <Link to="/videos" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to videos
          </Link>
        </div>
        
        <div className="bg-destructive/10 text-destructive rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {(error as any)?.error === 'Premium required' ? 'Premium Required' : 'Video Not Found'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {(error as any)?.message || 'This video could not be loaded. It may have been removed or you might not have permission to view it.'}
          </p>
          {(error as any)?.error === 'Premium required' && (
            <Button>Upgrade to Premium</Button>
          )}
        </div>
      </div>
    );
  }
  
  if (!video) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-4">
          <Link to="/videos" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to videos
          </Link>
        </div>
        
        <div className="bg-muted rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Video Not Found</h2>
          <p className="text-muted-foreground">This video does not exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-4">
        <Link to="/videos" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to videos
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video player */}
          <div className="bg-black aspect-video rounded-lg overflow-hidden mb-4">
            {video.videoUrl ? (
              <video 
                src={video.videoUrl}
                controls
                poster={video.thumbnailUrl || undefined}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          
          {/* Video info */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{video.username?.charAt(0) || "U"}</AvatarFallback>
                  {video.userAvatarUrl && <AvatarImage src={video.userAvatarUrl} />}
                </Avatar>
                <div>
                  <p className="font-medium">{video.username || "Anonymous User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(video.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{video.likes || 0}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  <span>{video.shares || 0}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{0}</span>
                </Badge>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {video.description}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Category</h3>
              <Badge variant="secondary">
                {video.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {video.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Enhanced social buttons */}
            <SocialButtons videoId={videoId} />
            
            <Separator className="my-6" />
            
            {/* Comments section */}
            <CommentSection videoId={videoId} />
            
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Related Videos</h3>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground py-8">
              Related videos coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}