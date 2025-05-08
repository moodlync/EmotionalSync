import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle,
  Heart,
  Share2,
  ThumbsUp,
  Send,
  AlertCircle,
  Filter,
  Settings,
  Pencil,
  PlusCircle,
  Lock,
  Globe,
  Users,
  Calendar,
  Clock,
  Bookmark,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Types and validation schemas
type EmotionType = "happy" | "sad" | "angry" | "anxious" | "excited" | "neutral" | "joy" | "sadness" | "anger" | "surprise";
type ContentVisibility = "public" | "friends" | "private";

interface Post {
  id: number;
  userId: number;
  content: string;
  emotion?: EmotionType;
  mediaUrl?: string;
  mediaType?: string;
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  commentCount: number;
  userHasLiked?: boolean;
  username: string;
  profilePicture?: string;
  isPremium?: boolean;
}

interface PostComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
  profilePicture?: string;
}

// Create post form schema
const postFormSchema = z.object({
  content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters'),
  emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral', 'joy', 'sadness', 'anger', 'surprise'] as const).optional(),
  visibility: z.enum(['public', 'friends', 'private'] as const).default('public'),
});

// Comment form schema
const commentFormSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(200, 'Comment must be less than 200 characters'),
});

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('latest');
  const [selectedPostForComments, setSelectedPostForComments] = useState<number | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  
  // Post creation form
  const postForm = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      visibility: 'public',
    },
  });
  
  // Comment form
  const commentForm = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Fetch community posts
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    error: postsError,
  } = useQuery({
    queryKey: ['/api/community/posts', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/community/posts?filter=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch comments for a post
  const {
    data: comments,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['/api/community/comments', selectedPostForComments],
    queryFn: async () => {
      if (!selectedPostForComments) return [];
      const res = await fetch(`/api/community/posts/${selectedPostForComments}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: !!selectedPostForComments,
  });

  // Create a new post
  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postFormSchema>) => {
      const response = await apiRequest('POST', '/api/community/posts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setPostDialogOpen(false);
      postForm.reset();
      toast({
        title: 'Post created',
        description: 'Your mood has been shared with the community',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Like a post
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/like`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      toast({
        title: 'Post liked',
        description: 'Your support has been recorded',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to like post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add a comment to a post
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/comments', selectedPostForComments] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      commentForm.reset();
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add comment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle post submission
  const onPostSubmit = (data: z.infer<typeof postFormSchema>) => {
    createPostMutation.mutate(data);
  };

  // Handle comment submission
  const onCommentSubmit = (data: z.infer<typeof commentFormSchema>) => {
    if (!selectedPostForComments) return;
    addCommentMutation.mutate({ postId: selectedPostForComments, content: data.content });
  };

  // Get avatar initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  // Get emotion emoji
  const getEmotionEmoji = (emotion?: EmotionType) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'excited': return '😃';
      case 'neutral': return '😐';
      case 'joy': return '😄';
      case 'sadness': return '😥';
      case 'anger': return '😡';
      case 'surprise': return '😮';
      default: return '';
    }
  };

  // Get visibility icon
  const getVisibilityIcon = (visibility: ContentVisibility) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Community Feed | MoodSync</title>
      </Helmet>

      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community Feed</h1>
            <p className="text-muted-foreground">
              Share and discover emotions with the MoodSync community
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-2 bg-gradient-to-r from-primary to-primary-foreground/90">
                  <PlusCircle className="h-4 w-4" />
                  Share Your Mood
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Share Your Mood</DialogTitle>
                  <DialogDescription>
                    Express how you're feeling right now and share it with the community.
                  </DialogDescription>
                </DialogHeader>

                <Form {...postForm}>
                  <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What's on your mind?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your thoughts, feelings, or experiences..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="emotion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How are you feeling?</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your current emotion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="happy">Happy 😊</SelectItem>
                              <SelectItem value="sad">Sad 😢</SelectItem>
                              <SelectItem value="angry">Angry 😠</SelectItem>
                              <SelectItem value="anxious">Anxious 😰</SelectItem>
                              <SelectItem value="excited">Excited 😃</SelectItem>
                              <SelectItem value="neutral">Neutral 😐</SelectItem>
                              <SelectItem value="joy">Joy 😄</SelectItem>
                              <SelectItem value="sadness">Sadness 😥</SelectItem>
                              <SelectItem value="anger">Anger 😡</SelectItem>
                              <SelectItem value="surprise">Surprise 😮</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Who can see this?</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  <span>Public - Anyone on MoodSync</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="friends">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>Friends Only</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  <span>Private - Only Me</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === 'public'
                              ? 'Your post will be visible to all MoodSync users.'
                              : field.value === 'friends'
                              ? 'Only your connections will see this post.'
                              : 'Only you will see this post.'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createPostMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        {createPostMutation.isPending ? 'Posting...' : 'Share Mood'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="similar">Similar Moods</TabsTrigger>
            <TabsTrigger value="support">Support Groups</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            {isLoadingPosts ? (
              // Skeleton UI for loading state
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : isPostsError ? (
              // Error state
              <Card className="overflow-hidden">
                <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Failed to Load Posts</h3>
                    <p className="text-muted-foreground text-sm">
                      {postsError instanceof Error
                        ? postsError.message
                        : 'An unknown error occurred'}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] })
                    }
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : posts && posts.length === 0 ? (
              // Empty state
              <Card className="overflow-hidden">
                <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
                    <MessageCircle className="h-12 w-12 text-primary/40" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">No Posts Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      {activeTab === 'latest'
                        ? 'Be the first to share your mood with the community'
                        : activeTab === 'trending'
                        ? 'No trending posts at the moment'
                        : activeTab === 'similar'
                        ? 'No users with similar moods found'
                        : 'No support groups available yet'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setPostDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary-foreground/90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Share Your Mood
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Posts list
              posts?.map((post: Post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {post.profilePicture ? (
                            <AvatarImage src={post.profilePicture} alt={post.username} />
                          ) : (
                            <AvatarFallback>{getInitials(post.username)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.username}</p>
                            {post.isPremium && (
                              <Badge variant="outline" className="px-1 bg-amber-50 text-amber-700 border-amber-200">
                                PRO
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatRelativeTime(post.createdAt)}</span>
                            </div>
                            {post.emotion && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span>Feeling {post.emotion}</span>
                                  <span>{getEmotionEmoji(post.emotion)}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        {getVisibilityIcon(post.visibility)}
                        <span className="capitalize hidden sm:inline">
                          {post.visibility}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <p className="whitespace-pre-line">{post.content}</p>
                    {post.mediaUrl && (
                      <div className="mt-3 rounded-md overflow-hidden">
                        {post.mediaType === 'image' ? (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full h-auto max-h-[300px] object-cover"
                          />
                        ) : post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full h-auto max-h-[300px]"
                          />
                        ) : null}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 flex flex-col gap-2">
                    <div className="w-full flex justify-between">
                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 ${post.userHasLiked ? 'text-primary' : ''}`}
                          onClick={() => likePostMutation.mutate(post.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${post.userHasLiked ? 'fill-current' : ''}`}
                          />
                          <span>{post.likeCount}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => 
                            selectedPostForComments === post.id 
                              ? setSelectedPostForComments(null)
                              : setSelectedPostForComments(post.id)
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentCount}</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      </div>

                      <Button variant="ghost" size="sm" className="gap-2">
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Save</span>
                      </Button>
                    </div>

                    {/* Comments section */}
                    {selectedPostForComments === post.id && (
                      <div className="w-full pt-2 border-t mt-2">
                        <div className="mb-4">
                          <Form {...commentForm}>
                            <form
                              onSubmit={commentForm.handleSubmit(onCommentSubmit)}
                              className="flex gap-2"
                            >
                              <FormField
                                control={commentForm.control}
                                name="content"
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder="Write a comment..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={addCommentMutation.isPending}
                              >
                                {addCommentMutation.isPending ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </form>
                          </Form>
                        </div>

                        <div className="space-y-4">
                          {isLoadingComments ? (
                            <div className="space-y-3">
                              {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex gap-3">
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-3 w-full" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : comments && comments.length > 0 ? (
                            <div className="space-y-4">
                              {comments.map((comment: PostComment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    {comment.profilePicture ? (
                                      <AvatarImage
                                        src={comment.profilePicture}
                                        alt={comment.username}
                                      />
                                    ) : (
                                      <AvatarFallback>
                                        {getInitials(comment.username)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted p-3 rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <p className="font-medium text-sm">
                                          {comment.username}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatRelativeTime(comment.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm mt-1">{comment.content}</p>
                                    </div>
                                    <div className="flex gap-4 mt-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        Like
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        Reply
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                No comments yet. Be the first to comment!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}