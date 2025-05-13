import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Users, Lock, Globe, Heart, MessageSquare, Share2, Smile, Settings } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from '@/hooks/use-auth';
import { EmotionType, emotions } from '@/lib/emotions';
import { useToast } from '@/hooks/use-toast';

interface ThoughtPost {
  id: string;
  username: string;
  avatarUrl?: string;
  content: string;
  emotion: EmotionType;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

// Mock data for demonstration
const mockPosts: ThoughtPost[] = [
  {
    id: '1',
    username: 'Sarah',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120',
    content: "Just completed my morning meditation and feeling incredibly centered. It's amazing how 10 minutes of mindfulness can change your entire perspective!",
    emotion: 'happy',
    timestamp: '10 minutes ago',
    likes: 12,
    comments: 3,
    isLiked: false
  },
  {
    id: '2',
    username: 'Mark',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120',
    content: "Work deadline is stressing me out. Anyone have tips for managing anxiety when you have too many tasks and not enough time?",
    emotion: 'anxious',
    timestamp: '2 hours ago',
    likes: 8,
    comments: 5,
    isLiked: true
  }
];

export default function SocialSharingFeature() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ThoughtPost[]>(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('happy');
  const [privacyOption, setPrivacyOption] = useState('friends');
  const [isPremium, setIsPremium] = useState(false);
  
  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to share your thoughts with others",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send data to the server
    const newPostObj: ThoughtPost = {
      id: Date.now().toString(),
      username: user?.username || 'Anonymous',
      avatarUrl: undefined,
      content: newPost,
      emotion: currentEmotion,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false
    };
    
    setPosts([newPostObj, ...posts]);
    setNewPost('');
    
    toast({
      title: "Post Shared",
      description: "Your thought has been shared successfully!",
    });
  };
  
  const handleLike = (postId: string) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to interact with shared thoughts",
        variant: "destructive",
      });
      return;
    }
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post, 
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Social Sharing</CardTitle>
        </div>
        <CardDescription>
          Share your emotional journey with friends and family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* New Post Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Share a thought</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Feeling: {emotions[currentEmotion].name}</span>
                  <div className="flex items-center">
                    <Smile className="h-3 w-3 mr-1" />
                    <ToggleGroup type="single" value={currentEmotion} onValueChange={(value) => value && setCurrentEmotion(value as EmotionType)}>
                      {Object.entries(emotions).map(([key, emotion]) => (
                        <ToggleGroupItem key={key} value={key} size="sm" className="h-6 w-6 p-0">
                          <span className={emotion.backgroundColor + " inline-block h-4 w-4 rounded-full"}></span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>
              </div>
            </div>
            
            <Textarea 
              placeholder="What's on your mind?" 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px]"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    className={`text-xs px-3 py-1 flex items-center ${privacyOption === 'private' ? 'bg-muted' : ''}`}
                    onClick={() => setPrivacyOption('private')}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Only Me
                  </button>
                  <button 
                    className={`text-xs px-3 py-1 flex items-center ${privacyOption === 'friends' ? 'bg-muted' : ''}`}
                    onClick={() => setPrivacyOption('friends')}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Friends
                  </button>
                  <button 
                    className={`text-xs px-3 py-1 flex items-center ${privacyOption === 'public' ? 'bg-muted' : ''}`}
                    onClick={() => setPrivacyOption('public')}
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </button>
                </div>
              </div>
              <Button size="sm" onClick={handlePostSubmit}>Share</Button>
            </div>
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-4 pt-4 border-t">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={post.avatarUrl} />
                      <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{post.username}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{post.timestamp}</span>
                        <span className="text-xl">·</span>
                        <span>Feeling {emotions[post.emotion].name.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${emotions[post.emotion].backgroundColor}`}></div>
                </div>
                
                <p className="text-sm mb-3">{post.content}</p>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <button 
                      className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Lock className="h-3 w-3 mr-1" />
          Your privacy is our priority
        </div>
        {!isPremium && (
          <Button variant="outline" className="border-amber-500 text-amber-600">
            Upgrade to Enable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}