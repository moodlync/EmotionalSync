import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { EmotionType, emotions } from "@/lib/emotions";
import { 
  Edit, 
  Trash2, 
  Users, 
  Lock, 
  Plus,
  PlusCircle,
  Settings,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PremiumChatRoom from "./premium-chat-room";

interface PrivateChatRoom {
  id: number;
  name: string;
  description: string;
  emotion: EmotionType;
  themeColor: string;
  isPrivate: boolean;
  maxParticipants: number;
  participants: number;
  createdBy: number;
  createdAt: string;
  avatars?: string[];
}

interface PremiumChatRoomsManagerProps {
  onOpenChatRoom: (chatRoomId: number) => void;
}

// Form schema for creating/editing a chat room
const chatRoomSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be less than 200 characters"),
  emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'] as const),
  isPrivate: z.boolean().default(true),
  maxParticipants: z.coerce.number()
    .int()
    .min(2, "Minimum 2 participants required")
    .max(100, "Maximum 100 participants allowed"),
  themeColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .default('#6366f1')
});

type ChatRoomFormValues = z.infer<typeof chatRoomSchema>;

export default function PremiumChatRoomsManager({ onOpenChatRoom }: PremiumChatRoomsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<PrivateChatRoom | null>(null);
  
  // Fetch user's private chat rooms
  const { 
    data: chatRooms = [],
    isLoading: isLoadingChatRooms,
    error: chatRoomsError
  } = useQuery<PrivateChatRoom[]>({
    queryKey: ['/api/premium/chat-rooms'],
    queryFn: async () => {
      const res = await fetch('/api/premium/chat-rooms');
      if (!res.ok) throw new Error("Failed to load chat rooms");
      return res.json();
    },
    enabled: !!user?.isPremium
  });
  
  // Form for creating new chat rooms
  const createForm = useForm<ChatRoomFormValues>({
    resolver: zodResolver(chatRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      emotion: "neutral",
      isPrivate: true,
      maxParticipants: 20,
      themeColor: "#6366f1"
    }
  });
  
  // Form for editing chat rooms
  const editForm = useForm<ChatRoomFormValues>({
    resolver: zodResolver(chatRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      emotion: "neutral",
      isPrivate: true,
      maxParticipants: 20,
      themeColor: "#6366f1"
    }
  });
  
  // Create chat room mutation
  const createChatRoomMutation = useMutation({
    mutationFn: (data: ChatRoomFormValues) => {
      return apiRequest("POST", "/api/premium/chat-rooms", data);
    },
    onSuccess: () => {
      toast({
        title: "Chat room created",
        description: "Your new chat room has been created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/premium/chat-rooms'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create chat room",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Update chat room mutation
  const updateChatRoomMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ChatRoomFormValues }) => {
      return apiRequest("PUT", `/api/premium/chat-rooms/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Chat room updated",
        description: "Your chat room has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedChatRoom(null);
      queryClient.invalidateQueries({ queryKey: ['/api/premium/chat-rooms'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update chat room",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Delete chat room mutation
  const deleteChatRoomMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/premium/chat-rooms/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Chat room deleted",
        description: "Your chat room has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/premium/chat-rooms'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete chat room",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmitCreate = (data: ChatRoomFormValues) => {
    createChatRoomMutation.mutate(data);
  };
  
  const handleSubmitEdit = (data: ChatRoomFormValues) => {
    if (!selectedChatRoom) return;
    updateChatRoomMutation.mutate({ id: selectedChatRoom.id, data });
  };
  
  const handleEditChatRoom = (chatRoom: PrivateChatRoom) => {
    setSelectedChatRoom(chatRoom);
    
    // Set form values
    editForm.reset({
      name: chatRoom.name,
      description: chatRoom.description,
      emotion: chatRoom.emotion,
      isPrivate: chatRoom.isPrivate,
      maxParticipants: chatRoom.maxParticipants,
      themeColor: chatRoom.themeColor || "#6366f1"
    });
    
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteChatRoom = (id: number) => {
    if (window.confirm("Are you sure you want to delete this chat room? This action cannot be undone.")) {
      deleteChatRoomMutation.mutate(id);
    }
  };
  
  // Handle user not being premium
  if (user && !user.isPremium) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Premium Feature</h2>
        <p className="text-gray-600 mb-6">
          This feature is only available to premium members.
          Upgrade to premium to create and manage private chat rooms.
        </p>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          Upgrade to Premium
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (isLoadingChatRooms) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Error state
  if (chatRoomsError) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">
          {chatRoomsError instanceof Error ? chatRoomsError.message : "Failed to load chat rooms"}
        </p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/premium/chat-rooms'] })}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Private Chat Rooms</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Chat Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Chat Room</DialogTitle>
              <DialogDescription>
                Create a new private chat room to connect with others based on shared emotions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleSubmitCreate)} className="space-y-4 pt-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for your chat room" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a name that reflects the purpose of your chat room.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this chat room is about..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a brief description to help others understand the purpose.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="emotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Emotion</FormLabel>
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
                            {Object.entries(emotions).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: value.color }} 
                                  />
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary emotion for this chat room.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={2} 
                            max={100} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Limit the number of participants.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="themeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input 
                            type="color" 
                            {...field} 
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                        </FormControl>
                        <Input 
                          type="text" 
                          value={field.value} 
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex-1"
                          placeholder="#6366f1"
                        />
                      </div>
                      <FormDescription>
                        Choose a custom color for your chat room.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make this chat room private</FormLabel>
                        <FormDescription>
                          Private rooms are only accessible by invitation.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createChatRoomMutation.isPending}
                  >
                    {createChatRoomMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      'Create Chat Room'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {chatRooms.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Chat Rooms Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't created any private chat rooms yet. Create your first room to start connecting with others.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Your First Chat Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatRooms.map((room) => {
            const isOwner = room.createdBy === user?.id;
            const emotionColor = emotions[room.emotion].color;
            const primaryColor = room.themeColor || emotionColor;
            
            return (
              <Card key={room.id} className="overflow-hidden border-t-4" style={{ borderTopColor: primaryColor }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {room.description.length > 100
                          ? `${room.description.substring(0, 100)}...`
                          : room.description}
                      </CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={room.isPrivate ? "outline" : "secondary"}>
                            {room.isPrivate ? (
                              <Lock className="h-3 w-3 mr-1" />
                            ) : (
                              <Globe className="h-3 w-3 mr-1" />
                            )}
                            {room.isPrivate ? 'Private' : 'Public'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {room.isPrivate
                            ? 'Only invited users can join this room'
                            : 'Anyone can join this room'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className="flex items-center" 
                        style={{ 
                          color: emotionColor,
                          borderColor: emotionColor
                        }}
                      >
                        {room.emotion.charAt(0).toUpperCase() + room.emotion.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {room.participants}/{room.maxParticipants}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="space-x-2">
                    {isOwner && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditChatRoom(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteChatRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm"
                      onClick={() => onOpenChatRoom(room.id)}
                    >
                      Join
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Chat Room</DialogTitle>
            <DialogDescription>
              Update your chat room settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedChatRoom && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleSubmitEdit)} className="space-y-4 pt-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="emotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Emotion</FormLabel>
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
                            {Object.entries(emotions).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: value.color }} 
                                  />
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                    control={editForm.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={2} 
                            max={100} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="themeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input 
                            type="color" 
                            {...field} 
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                        </FormControl>
                        <Input 
                          type="text" 
                          value={field.value} 
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateChatRoomMutation.isPending}
                  >
                    {updateChatRoomMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}