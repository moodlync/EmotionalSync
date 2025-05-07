import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, Heart, Search, Settings, UserPlus, MessageSquare, 
  Image, Video, FileText, Send, ArrowRight, ChevronDown, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FriendStatus } from "@/types/friend";
import CharityDonationForm from "@/components/charity/charity-donation-form";
import CrisalFundCampaignForm from "@/components/crisalfund/crisalfund-campaign-form";
import Footer from "@/components/layout/footer";

// Mock user data for friends
interface User {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  status: FriendStatus;
  isOnline: boolean;
  lastActive?: string;
  bio?: string;
  emotionHistory?: {
    emotion: string;
    date: string;
  }[];
  mutualFriends?: number;
  isPremium?: boolean;
}

// Mock chat message data
interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachmentType?: 'image' | 'video' | 'audio';
  attachmentUrl?: string;
}

// Mock post data
interface Post {
  id: number;
  userId: number;
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  visibilityLevel: 'public' | 'friends' | 'close_friends';
}

const mockFriends: User[] = [
  {
    id: 1,
    username: "EmotionMaster",
    fullName: "Emma Watson",
    avatarUrl: "",
    status: "accepted",
    isOnline: true,
    lastActive: "Just now",
    bio: "Exploring the depths of human emotions through art and mindfulness.",
    mutualFriends: 4,
    isPremium: true
  },
  {
    id: 2,
    username: "MindfulJourney",
    fullName: "Michael Chen",
    avatarUrl: "",
    status: "accepted",
    isOnline: false,
    lastActive: "2 hours ago",
    bio: "Mental health advocate and meditation enthusiast.",
    mutualFriends: 2,
    isPremium: false
  },
  {
    id: 3,
    username: "SereneThoughts",
    fullName: "Sophia Martinez",
    avatarUrl: "",
    status: "pending_sent",
    isOnline: false,
    lastActive: "Yesterday",
    bio: "Finding peace in every moment.",
    mutualFriends: 1,
    isPremium: true
  },
  {
    id: 4,
    username: "CalmSpirit",
    fullName: "David Johnson",
    avatarUrl: "",
    status: "pending_received",
    isOnline: true,
    lastActive: "Just now",
    bio: "Sharing tools for emotional resilience.",
    mutualFriends: 3,
    isPremium: false
  },
  {
    id: 5,
    username: "JoyfulDays",
    fullName: "Lisa Thompson",
    avatarUrl: "",
    status: "accepted",
    isOnline: true,
    lastActive: "Just now",
    bio: "Spreading positivity and mindfulness techniques.",
    mutualFriends: 5,
    isPremium: true
  }
];

const mockPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    username: "EmotionMaster",
    avatarUrl: "",
    content: "Just completed a 30-day mindfulness challenge! My emotional awareness has improved so much. Has anyone else tried this?",
    imageUrl: "",
    timestamp: "2 hours ago",
    likes: 15,
    comments: 3,
    isLiked: false,
    visibilityLevel: 'public'
  },
  {
    id: 2,
    userId: 5,
    username: "JoyfulDays",
    avatarUrl: "",
    content: "Found this amazing guided meditation that helped me through a tough anxiety spike today. Sharing for anyone who might need it!",
    videoUrl: "",
    timestamp: "Yesterday",
    likes: 28,
    comments: 7,
    isLiked: true,
    visibilityLevel: 'friends'
  },
  {
    id: 3,
    userId: 2,
    username: "MindfulJourney",
    avatarUrl: "",
    content: "Wrote a new entry in my mood journal today. It's incredible how writing down your emotions can bring clarity.",
    timestamp: "3 days ago",
    likes: 9,
    comments: 1,
    isLiked: false,
    visibilityLevel: 'close_friends'
  }
];

const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      receiverId: 0, // current user
      content: "Hey there! How's your emotional wellness journey going?",
      timestamp: "10:15 AM",
      isRead: true
    },
    {
      id: 2,
      senderId: 0, // current user
      receiverId: 1,
      content: "It's been quite a journey! The mindfulness exercises are really helping me stay centered.",
      timestamp: "10:18 AM",
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      receiverId: 0,
      content: "That's wonderful to hear! I found a new guided meditation you might like.",
      timestamp: "10:20 AM",
      isRead: true
    }
  ],
  5: [
    {
      id: 4,
      senderId: 5,
      receiverId: 0,
      content: "Thanks for accepting my friend request!",
      timestamp: "Yesterday",
      isRead: true
    },
    {
      id: 5,
      senderId: 0,
      receiverId: 5,
      content: "Happy to connect! How did you discover MoodSync?",
      timestamp: "Yesterday",
      isRead: true
    }
  ]
};

export default function FriendBookPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messageText, setMessageText] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postVisibility, setPostVisibility] = useState<Post["visibilityLevel"]>("friends");
  const { toast } = useToast();

  const filteredFriends = mockFriends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.fullName && friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const acceptedFriends = filteredFriends.filter(friend => friend.status === "accepted");
  const pendingFriends = filteredFriends.filter(friend => 
    friend.status === "pending_sent" || friend.status === "pending_received"
  );

  const handleSendMessage = () => {
    if (!selectedFriend || !messageText.trim()) return;
    
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${selectedFriend.username}`,
    });
    
    setMessageText("");
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    toast({
      title: "Post created",
      description: "Your post has been shared with your friends.",
    });
    
    setNewPost("");
  };

  const handleFriendAction = (friend: User, action: 'accept' | 'reject' | 'add' | 'remove' | 'block') => {
    let message = "";
    
    switch (action) {
      case 'accept':
        message = `You are now friends with ${friend.username}`;
        break;
      case 'reject':
        message = `Friend request from ${friend.username} has been declined`;
        break;
      case 'add':
        message = `Friend request sent to ${friend.username}`;
        break;
      case 'remove':
        message = `${friend.username} has been removed from your friends`;
        break;
      case 'block':
        message = `${friend.username} has been blocked`;
        break;
    }
    
    toast({
      title: "Friend action completed",
      description: message,
    });
  };

  const handleDonateToCharity = (charityId: number, amount: number) => {
    toast({
      title: "Charity donation successful",
      description: `You have donated ${amount} tokens to charity #${charityId}`,
    });
  };

  const handleCampaignDonation = (campaignId: number, amount: number) => {
    toast({
      title: "Campaign donation successful",
      description: `You have donated ${amount} tokens to campaign #${campaignId}`,
    });
  };

  const handleCreateCampaign = (campaignData: Partial<any>) => {
    toast({
      title: "Campaign created",
      description: "Your fundraising campaign has been created successfully",
    });
  };

  const handlePostAction = (post: Post, action: 'like' | 'comment' | 'share') => {
    let message = "";
    
    switch (action) {
      case 'like':
        message = post.isLiked ? 
          `You unliked ${post.username}'s post` : 
          `You liked ${post.username}'s post`;
        break;
      case 'comment':
        message = `Comment added to ${post.username}'s post`;
        break;
      case 'share':
        message = `You shared ${post.username}'s post`;
        break;
    }
    
    toast({
      title: "Post action completed",
      description: message,
    });
  };

  // Mock data for user profile and token balance
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      // Simulate fetching user data
      return {
        id: 0,
        username: "CurrentUser",
        isPremium: true,
        tokenBalance: 1250
      };
    },
    // Prevent 401 errors in demo
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Friend Book</h1>
            <p className="text-muted-foreground">
              Connect with friends and share your emotional journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">
              <FileText className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            {userData?.isPremium && (
              <TabsTrigger value="giving">
                <Heart className="h-4 w-4 mr-2" />
                Charitable Giving
              </TabsTrigger>
            )}
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {userData?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Share what's on your mind..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Image className="h-4 w-4" />
                            Photo
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Video className="h-4 w-4" />
                            Video
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={postVisibility} onValueChange={(value: any) => setPostVisibility(value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="friends">Friends</SelectItem>
                              <SelectItem value="close_friends">Close Friends</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {mockPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {post.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {post.username}
                          {mockFriends.find(f => f.id === post.userId)?.isPremium && (
                            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-amber-700 text-xs font-normal">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {post.timestamp}
                          <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                          {post.visibilityLevel === 'public' ? 'Public' : 
                           post.visibilityLevel === 'friends' ? 'Friends' : 'Close Friends'}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm">{post.content}</p>
                  </div>
                  
                  {post.imageUrl && (
                    <div className="rounded-md overflow-hidden border">
                      <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover" />
                    </div>
                  )}
                  
                  {post.videoUrl && (
                    <div className="rounded-md overflow-hidden border">
                      <div className="aspect-video bg-secondary/30 flex items-center justify-center">
                        <Play className="h-12 w-12 opacity-50" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} />
                      <span>{post.likes}</span>
                      <span className="mx-1">•</span>
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5"
                        onClick={() => handlePostAction(post, 'like')}
                      >
                        <Heart className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} />
                        {post.isLiked ? 'Unlike' : 'Like'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5"
                        onClick={() => handlePostAction(post, 'comment')}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6">
            {pendingFriends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Friend Requests</CardTitle>
                  <CardDescription>
                    Accept or decline friend requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pendingFriends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{friend.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {friend.status === "pending_received" ? "Sent you a request" : "Request sent"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {friend.status === "pending_received" ? (
                            <>
                              <Button size="sm" onClick={() => handleFriendAction(friend, 'accept')}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleFriendAction(friend, 'reject')}>
                                Decline
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleFriendAction(friend, 'reject')}>
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Friends</CardTitle>
                <CardDescription>
                  Connect with your friends and see their updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedFriends.length > 0 ? (
                  <div className="grid gap-4">
                    {acceptedFriends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center">
                              {friend.username}
                              {friend.isPremium && (
                                <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              {friend.isOnline ? 'Online' : `Last active: ${friend.lastActive}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span>Chat with {friend.username}</span>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 space-y-4">
                                {(mockMessages[friend.id] || []).map(message => (
                                  <div 
                                    key={message.id} 
                                    className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div 
                                      className={`rounded-lg p-3 max-w-[80%] ${
                                        message.senderId === 0
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-secondary'
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                      <div className={`text-xs mt-1 ${
                                        message.senderId === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                      }`}>
                                        {message.timestamp}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Input 
                                  placeholder="Type your message..." 
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="flex-1"
                                />
                                <Button 
                                  size="icon" 
                                  onClick={() => {
                                    setSelectedFriend(friend);
                                    handleSendMessage();
                                  }}
                                  disabled={!messageText.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Friend Settings</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="close-friend">Close Friend</Label>
                                  <Switch id="close-friend" />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="show-updates">Show Updates</Label>
                                  <Switch id="show-updates" defaultChecked />
                                </div>
                                <Separator />
                                <div className="pt-2 space-y-2">
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-muted-foreground"
                                    onClick={() => handleFriendAction(friend, 'remove')}
                                  >
                                    Remove Friend
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-destructive"
                                    onClick={() => handleFriendAction(friend, 'block')}
                                  >
                                    Block User
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Friends Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add friends to connect and share your emotional journey
                    </p>
                    <Button>Find Friends</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Messages</CardTitle>
                <CardDescription>
                  Stay connected with your friends through messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(mockMessages).length > 0 ? (
                  <div className="grid gap-4">
                    {Object.entries(mockMessages).map(([userId, messages]) => {
                      const friend = mockFriends.find(f => f.id === parseInt(userId));
                      if (!friend) return null;
                      
                      const lastMessage = messages[messages.length - 1];
                      
                      return (
                        <div key={userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{friend.username}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                                {lastMessage.senderId === 0 ? 'You: ' : ''}
                                {lastMessage.content}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">{lastMessage.timestamp}</div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span>Chat with {friend.username}</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 space-y-4">
                                  {messages.map(message => (
                                    <div 
                                      key={message.id} 
                                      className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div 
                                        className={`rounded-lg p-3 max-w-[80%] ${
                                          message.senderId === 0
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary'
                                        }`}
                                      >
                                        <p className="text-sm">{message.content}</p>
                                        <div className={`text-xs mt-1 ${
                                          message.senderId === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                        }`}>
                                          {message.timestamp}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Input 
                                    placeholder="Type your message..." 
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    size="icon" 
                                    onClick={() => {
                                      setSelectedFriend(friend);
                                      handleSendMessage();
                                    }}
                                    disabled={!messageText.trim()}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Messages Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start conversations with your friends to see them here
                    </p>
                    <Button>Start Messaging</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charitable Giving Tab (Premium Only) */}
          {userData?.isPremium && (
            <TabsContent value="giving" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <CharityDonationForm
                    tokenBalance={userData?.tokenBalance || 0}
                    onDonate={handleDonateToCharity}
                  />
                </div>
                <div>
                  <CrisalFundCampaignForm
                    tokenBalance={userData?.tokenBalance || 0}
                    onDonate={handleCampaignDonation}
                    onCreateCampaign={handleCreateCampaign}
                    isPremiumUser={!!userData?.isPremium}
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}