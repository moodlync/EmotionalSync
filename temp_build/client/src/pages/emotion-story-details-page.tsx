import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertEmotionMomentSchema, insertStoryCommentSchema } from "@shared/emotion-story-schema";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Share2,
  ThumbsUp,
  Send,
  Lock,
  PenLine,
  Lightbulb,
  Sparkles,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the shape of the story data returned from the API
interface StoryDetailsResponse {
  story: {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    coverImage: string | null;
    isPublic: number;
    allowComments: number;
    created: string;
    updated: string;
    tags: string[] | null;
    emotionalArc: {
      start: string;
      end: string;
      peak: string;
      resolution: string;
    } | null;
    theme: string | null;
  };
  moments: {
    id: number;
    storyId: number;
    emotionType: string;
    intensity: number;
    description: string | null;
    media: string | null;
    timestamp: string;
    order: number;
    metadata: Record<string, any> | null;
  }[];
  comments: {
    id: number;
    storyId: number;
    userId: number;
    content: string;
    created: string;
    parentId: number | null;
  }[];
  reactions: {
    counts: Record<string, number>;
    userReactions: string[];
  };
}

// Add moment form schema
const addMomentSchema = insertEmotionMomentSchema
  .omit({ storyId: true, id: true })
  .extend({
    emotionType: z.string().min(1, "Emotion type is required"),
    intensity: z.number().min(1).max(10),
    order: z.number().min(0),
  });

type AddMomentFormValues = z.infer<typeof addMomentSchema>;

// Comment form schema
const commentSchema = insertStoryCommentSchema
  .omit({ storyId: true, userId: true, id: true, created: true, parentId: true })
  .extend({
    content: z.string().min(1, "Comment cannot be empty"),
  });

type CommentFormValues = z.infer<typeof commentSchema>;

// Available emotion types for moments
const EMOTION_TYPES = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Excited",
  "Neutral",
  "Fear",
  "Love",
  "Surprise",
  "Disgust",
];

export default function EmotionStoryDetailsPage() {
  const params = useParams<{ id: string }>();
  const storyId = parseInt(params.id, 10);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // State for modals and UI
  const [isAddMomentDialogOpen, setIsAddMomentDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState<number | null>(null);
  const [commentValue, setCommentValue] = useState("");

  // Fetch story data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<StoryDetailsResponse>({
    queryKey: ["/api/emotion-stories", storyId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/emotion-stories/${storyId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch story");
      }
      return res.json();
    },
  });

  // Set up add moment form
  const addMomentForm = useForm<AddMomentFormValues>({
    resolver: zodResolver(addMomentSchema),
    defaultValues: {
      emotionType: "",
      intensity: 5,
      description: "",
      order: 0,
    },
  });

  // Set up add moment mutation
  const addMomentMutation = useMutation({
    mutationFn: async (values: AddMomentFormValues) => {
      const res = await apiRequest("POST", `/api/emotion-stories/${storyId}/moments`, values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add moment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories", storyId] });
      toast({
        title: "Moment added",
        description: "Your emotion moment has been added to the story.",
      });
      setIsAddMomentDialogOpen(false);
      addMomentForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add moment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up delete moment mutation
  const deleteMomentMutation = useMutation({
    mutationFn: async (momentId: number) => {
      const res = await apiRequest("DELETE", `/api/emotion-moments/${momentId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete moment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories", storyId] });
      toast({
        title: "Moment deleted",
        description: "The emotion moment has been removed from your story.",
      });
      setSelectedMomentId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete moment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/emotion-stories/${storyId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete story");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories/my"] });
      toast({
        title: "Story deleted",
        description: "Your emotion story has been deleted.",
      });
      navigate("/emotion-stories");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/emotion-stories/${storyId}/comments`, { content });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories", storyId] });
      setCommentValue("");
      toast({
        title: "Comment added",
        description: "Your comment has been added to the story.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      const res = await apiRequest("POST", `/api/emotion-stories/${storyId}/reactions`, { reactionType });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add reaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories", storyId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to react",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a moment
  const onAddMoment = (values: AddMomentFormValues) => {
    // Set the order to be the next available order value
    const nextOrder = data?.moments.length || 0;
    addMomentMutation.mutate({ ...values, order: nextOrder });
  };

  // Handle adding a comment
  const onAddComment = () => {
    if (!commentValue.trim()) return;
    addCommentMutation.mutate(commentValue);
  };

  // Handle adding a reaction
  const onAddReaction = (reactionType: string) => {
    reactionMutation.mutate(reactionType);
  };

  // Handle deleting a moment
  const onDeleteMoment = (momentId: number) => {
    setSelectedMomentId(momentId);
    setIsDeleteAlertOpen(true);
  };

  // Confirm deleting a moment
  const confirmDeleteMoment = () => {
    if (selectedMomentId) {
      deleteMomentMutation.mutate(selectedMomentId);
    }
    setIsDeleteAlertOpen(false);
  };

  // Handle deleting the story
  const onDeleteStory = () => {
    deleteStoryMutation.mutate();
  };

  // Function to get emotion color
  const getEmotionColor = (emotion: string | undefined) => {
    if (!emotion) return "bg-gray-200";
    
    const emotions: Record<string, string> = {
      happy: "bg-yellow-200",
      sad: "bg-blue-200",
      angry: "bg-red-200",
      anxious: "bg-purple-200",
      excited: "bg-pink-200",
      neutral: "bg-gray-200",
      fear: "bg-indigo-200",
      love: "bg-rose-200",
      surprise: "bg-emerald-200",
      disgust: "bg-lime-200"
    };
    
    return emotions[emotion.toLowerCase()] || "bg-gray-200";
  };

  // Get emotion icon
  const getEmotionIcon = (emotion: string | undefined) => {
    if (!emotion) return <Cloud className="h-5 w-5" />;
    
    const icons: Record<string, JSX.Element> = {
      happy: <Sparkles className="h-5 w-5" />,
      sad: <Cloud className="h-5 w-5" />,
      angry: <Trash2 className="h-5 w-5" />,
      anxious: <Lightbulb className="h-5 w-5" />,
      excited: <Sparkles className="h-5 w-5" />,
      neutral: <Cloud className="h-5 w-5" />,
      fear: <Lightbulb className="h-5 w-5" />,
      love: <Heart className="h-5 w-5" />,
      surprise: <Sparkles className="h-5 w-5" />,
      disgust: <Trash2 className="h-5 w-5" />
    };
    
    return icons[emotion.toLowerCase()] || <Cloud className="h-5 w-5" />;
  };

  // Check if user has reacted with a specific reaction
  const hasReacted = (reactionType: string) => {
    return data?.reactions.userReactions.includes(reactionType) || false;
  };

  // Format user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Check if user is the story author
  const isAuthor = user && data?.story.userId === user.id;

  // Update form values when moments change
  useEffect(() => {
    if (data && data.moments.length > 0) {
      addMomentForm.setValue("order", data.moments.length);
    }
  }, [data, addMomentForm]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-3/4 mb-3" />
            <Skeleton className="h-5 w-1/2 mb-6" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
          
          <Skeleton className="h-10 w-full" />
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/emotion-stories")}>
            <ChevronLeft className="h-4 w-4" /> Back to Stories
          </Button>
        </div>
        
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Story</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || "We couldn't find the story you're looking for."}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/emotion-stories")}>
              Return to Stories
            </Button>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Sort moments by order
  const sortedMoments = [...data.moments].sort((a, b) => a.order - b.order);

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back button and action buttons */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/emotion-stories")}>
          <ChevronLeft className="h-4 w-4" /> Back to Stories
        </Button>
        
        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddMomentDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Moment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/emotion-stories/${storyId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit Story
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => onDeleteStory()}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>
      
      {/* Story header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{data.story.title}</h1>
          {data.story.isPublic === 0 && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> Private
            </Badge>
          )}
        </div>
        
        <div className="text-muted-foreground mb-4">
          <time dateTime={data.story.created}>
            {format(new Date(data.story.created), "MMMM d, yyyy")}
          </time>
          {data.story.updated !== data.story.created && (
            <span className="ml-2">
              (Updated {format(new Date(data.story.updated), "MMM d, yyyy")})
            </span>
          )}
        </div>
        
        <p className="mb-4 whitespace-pre-line">{data.story.description || "No description provided."}</p>
        
        {/* Emotional arc */}
        {data.story.emotionalArc && (
          <div className="rounded-md border p-4 mb-4 bg-gradient-to-r from-muted/50 to-muted/30">
            <h3 className="font-semibold mb-2">Emotional Arc</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.story.emotionalArc.start && (
                <div>
                  <span className="text-xs text-muted-foreground">Start:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(data.story.emotionalArc.start)}`}></div>
                    <span>{data.story.emotionalArc.start}</span>
                  </div>
                </div>
              )}
              
              {data.story.emotionalArc.peak && (
                <div>
                  <span className="text-xs text-muted-foreground">Peak:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(data.story.emotionalArc.peak)}`}></div>
                    <span>{data.story.emotionalArc.peak}</span>
                  </div>
                </div>
              )}
              
              {data.story.emotionalArc.end && (
                <div>
                  <span className="text-xs text-muted-foreground">End:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(data.story.emotionalArc.end)}`}></div>
                    <span>{data.story.emotionalArc.end}</span>
                  </div>
                </div>
              )}
              
              {data.story.emotionalArc.resolution && (
                <div>
                  <span className="text-xs text-muted-foreground">Resolution:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(data.story.emotionalArc.resolution)}`}></div>
                    <span>{data.story.emotionalArc.resolution}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {data.story.tags && data.story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {data.story.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Story reactions */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            variant={hasReacted("like") ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => onAddReaction("like")}
          >
            <ThumbsUp className="h-4 w-4" />
            Like {data.reactions.counts.like || 0}
          </Button>
          
          <Button
            variant={hasReacted("empathy") ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => onAddReaction("empathy")}
          >
            <Heart className="h-4 w-4" />
            Empathy {data.reactions.counts.empathy || 0}
          </Button>
          
          <Button
            variant={hasReacted("inspiring") ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => onAddReaction("inspiring")}
          >
            <Sparkles className="h-4 w-4" />
            Inspiring {data.reactions.counts.inspiring || 0}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator
                  .share({
                    title: data.story.title,
                    text: data.story.description || "Check out this emotional journey",
                    url: window.location.href,
                  })
                  .catch((error) => console.log("Sharing failed", error));
              } else {
                // Fallback
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied",
                  description: "The link to this story has been copied to your clipboard.",
                });
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      {/* Tabs: Moments and Comments */}
      <Tabs defaultValue="moments" className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="moments">
            Emotion Moments ({sortedMoments.length})
          </TabsTrigger>
          {data.story.allowComments === 1 && (
            <TabsTrigger value="comments">
              Comments ({data.comments.length})
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Moments tab content */}
        <TabsContent value="moments" className="mt-0">
          {sortedMoments.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/30">
              <PenLine className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg mb-1">No Moments Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {isAuthor
                  ? "Add your first emotional moment to build your story."
                  : "This story doesn't have any emotion moments yet."}
              </p>
              {isAuthor && (
                <Button onClick={() => setIsAddMomentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Moment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedMoments.map((moment, index) => (
                <Card key={moment.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${getEmotionColor(moment.emotionType)}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${getEmotionColor(moment.emotionType)}`}>
                          {getEmotionIcon(moment.emotionType)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{moment.emotionType}</h3>
                          <div className="text-xs text-muted-foreground">
                            Intensity: {moment.intensity}/10 • 
                            {moment.timestamp && (
                              <time className="ml-1" dateTime={moment.timestamp}>
                                {format(new Date(moment.timestamp), "MMM d, yyyy")}
                              </time>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isAuthor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => onDeleteMoment(moment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">
                      {moment.description || "No description provided."}
                    </p>
                    
                    {/* Display media if available */}
                    {moment.media && (
                      <div className="mt-3">
                        <img
                          src={moment.media}
                          alt={`Media for ${moment.emotionType} moment`}
                          className="rounded-md max-h-80 object-contain"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Comments tab content */}
        {data.story.allowComments === 1 && (
          <TabsContent value="comments" className="mt-0">
            {/* Comment input */}
            {user && (
              <div className="mb-6">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentValue}
                      onChange={(e) => setCommentValue(e.target.value)}
                      className="mb-2 min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={!commentValue.trim() || addCommentMutation.isPending}
                        onClick={onAddComment}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {addCommentMutation.isPending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments list */}
            <div className="space-y-4">
              {data.comments.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg mb-1">No Comments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to comment on this emotional story.
                  </p>
                </div>
              ) : (
                data.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 pb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {/* Placeholder initials - in a real app you'd use the commenter's username */}
                        US
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/40 p-3 rounded-lg">
                        <div className="font-medium text-sm mb-1">
                          {/* In a real app, you'd show the commenter's username */}
                          User
                          <span className="font-normal text-muted-foreground text-xs ml-2">
                            <time dateTime={comment.created}>
                              {format(new Date(comment.created), "MMM d, yyyy 'at' h:mm a")}
                            </time>
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Add Moment Dialog */}
      <Dialog open={isAddMomentDialogOpen} onOpenChange={setIsAddMomentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Emotion Moment</DialogTitle>
            <DialogDescription>
              Create a new moment in your emotional journey. Each moment represents a distinct emotional state.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addMomentForm}>
            <form onSubmit={addMomentForm.handleSubmit(onAddMoment)} className="space-y-4">
              <FormField
                control={addMomentForm.control}
                name="emotionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotion</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an emotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMOTION_TYPES.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getEmotionColor(emotion)}`}></div>
                              {emotion}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMomentForm.control}
                name="intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intensity (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                      />
                    </FormControl>
                    <FormDescription>
                      How strongly did you feel this emotion? (1 = very mild, 10 = extremely intense)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMomentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Describe this emotional moment..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What happened? How did you feel? Why was this significant?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={addMomentMutation.isPending}>
                  {addMomentMutation.isPending ? "Adding..." : "Add Moment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Emotion Moment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this moment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMoment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}