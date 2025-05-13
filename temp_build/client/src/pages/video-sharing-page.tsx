import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, VideoIcon, UploadCloud, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { VideoPost } from "@shared/schema";

const VIDEO_CATEGORIES = [
  { value: "mental_health", label: "Mental Health" },
  { value: "wellness", label: "Wellness" },
  { value: "motivation", label: "Motivation" },
  { value: "meditation", label: "Meditation" },
  { value: "exercise", label: "Exercise" },
  { value: "nutrition", label: "Nutrition" },
  { value: "sleep", label: "Sleep" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "other", label: "Other" }
];

export default function VideoSharingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("mental_health");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("my-videos");
  
  // Fetch the user's video posts
  const { 
    data: userVideos, 
    isLoading: userVideosLoading 
  } = useQuery<VideoPost[]>({
    queryKey: ["/api/my-videos"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/my-videos");
      return await res.json();
    },
    enabled: !!user && user.isPremium
  });
  
  // Fetch all public video posts
  const { 
    data: publicVideos, 
    isLoading: publicVideosLoading 
  } = useQuery<VideoPost[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/videos");
      return await res.json();
    }
  });
  
  // Create video post mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      try {
        const res = await apiRequest("POST", "/api/videos", formData, true);
        
        // Clear the interval and set progress to 100%
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return await res.json();
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    },
    onSuccess: () => {
      // Reset form state
      setTitle("");
      setDescription("");
      setCategory("mental_health");
      setTags("");
      setIsPublic(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/my-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      toast({
        title: "Video uploaded successfully!",
        description: "Your video has been uploaded and is now available.",
        variant: "default"
      });
      
      // Switch to my videos tab
      setActiveTab("my-videos");
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No video selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create FormData object
    const formData = new FormData();
    formData.append("videoFile", selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("isPublic", String(isPublic));
    
    // Upload video
    uploadMutation.mutate(formData);
  };
  
  // Handle delete video
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await apiRequest("DELETE", `/api/videos/${videoId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      toast({
        title: "Video deleted",
        description: "Your video has been deleted successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete video. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle like video
  const likeVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      toast({
        title: "Video liked",
        description: "You've liked this video!",
        variant: "default"
      });
    }
  });
  
  // Handle share video
  const shareVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/share`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      toast({
        title: "Video shared",
        description: "This video has been shared!",
        variant: "default"
      });
    }
  });
  
  // Function to share video on social media
  const handleSocialShare = (videoId: number, platform: string) => {
    const videoUrl = `${window.location.origin}/video/${videoId}`;
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
    shareVideoMutation.mutate(videoId);
  };
  
  // If not premium, show upgrade message
  if (user && !user.isPremium) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="h-6 w-6" />
              Premium Video Sharing
            </CardTitle>
            <CardDescription className="text-gray-100">
              Share wellness videos and connect with the community
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <div className="mb-6 flex justify-center">
              <Film className="h-20 w-20 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-6">
              Video sharing is available exclusively to premium users. Upgrade to premium to unlock this feature and share your wellness journey.
            </p>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        Premium Video Sharing
      </h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="upload">Upload New Video</TabsTrigger>
          <TabsTrigger value="my-videos">My Videos</TabsTrigger>
          <TabsTrigger value="community">Community Videos</TabsTrigger>
        </TabsList>
        
        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Wellness Video</CardTitle>
              <CardDescription>
                Share valuable content with the community. All videos are reviewed for compliance with community guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="font-medium">
                      Video Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your video content"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="font-medium">
                      Category *
                    </Label>
                    <Select 
                      value={category} 
                      onValueChange={setCategory} 
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tags" className="font-medium">
                      Tags (comma separated)
                    </Label>
                    <Input
                      id="tags"
                      placeholder="wellness, meditation, health"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="isPublic">
                      Make this video public (visible to all users)
                    </Label>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="video" className="font-medium">
                      Video File *
                    </Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors" 
                      onClick={() => fileInputRef.current?.click()}>
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <VideoIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span className="text-sm">{selectedFile.name}</span>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to select a video file or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            MP4, WebM or MOV (max. 100MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="video"
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </div>
                
                <CardFooter className="flex justify-between px-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setTitle("");
                      setDescription("");
                      setCategory("mental_health");
                      setTags("");
                      setIsPublic(true);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploading || !selectedFile || !title || !description}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>Upload Video</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Videos Tab */}
        <TabsContent value="my-videos">
          <Card>
            <CardHeader>
              <CardTitle>My Videos</CardTitle>
              <CardDescription>
                Manage your uploaded video content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userVideosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userVideos?.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No videos yet</h3>
                  <p className="text-muted-foreground mt-1">
                    You haven't uploaded any videos. Start sharing your content with the community!
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Your First Video
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {userVideos?.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-800">
                            <VideoIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.isPublic ? "Public" : "Private"}
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {video.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span>{video.views || 0} views</span>
                          <span className="mx-2">•</span>
                          <span>{video.likes || 0} likes</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this video?")) {
                              deleteVideoMutation.mutate(video.id);
                            }
                          }}
                          disabled={deleteVideoMutation.isPending}
                        >
                          {deleteVideoMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Community Videos Tab */}
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community Videos</CardTitle>
              <CardDescription>
                Discover wellness content shared by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publicVideosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : publicVideos?.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No community videos</h3>
                  <p className="text-muted-foreground mt-1">
                    There are no public videos available yet. Be the first to share!
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload a Video
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {publicVideos?.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-800">
                            <VideoIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mb-2">
                          {video.description}
                        </CardDescription>
                        <div className="text-xs font-medium text-muted-foreground">
                          By {video.username || "Anonymous User"}
                        </div>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                        <div className="text-sm text-muted-foreground w-full flex justify-between">
                          <span>{video.views || 0} views</span>
                          <span>{video.likes || 0} likes</span>
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => likeVideoMutation.mutate(video.id)}
                            disabled={likeVideoMutation.isPending}
                          >
                            {likeVideoMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Like"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSocialShare(video.id, "twitter")}
                          >
                            Share
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(`/video/${video.id}`, "_blank")}
                          >
                            Watch
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}