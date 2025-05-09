import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Send,
  Users,
  Info,
  MoreVertical,
  Settings,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { EmotionType, emotions } from "@/lib/emotions";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { encryptMessage, decryptMessage, getRoomSpecificKey, safeDecrypt } from "@/lib/encryption";

interface Message {
  id: string;
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  avatarUrl?: string;
}

interface ChatRoomUser {
  id: number;
  username: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

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
}

interface PremiumChatRoomProps {
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  onClose: () => void;
  chatRoomId?: number; // Optional, if we navigate directly to a specific chat room
}

export default function PremiumChatRoom({
  isMinimized,
  onMinimizeToggle,
  onClose,
  chatRoomId: propChatRoomId
}: PremiumChatRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { id: paramChatRoomId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  // Get chat room ID from props or URL params
  const chatRoomId = propChatRoomId || (paramChatRoomId ? parseInt(paramChatRoomId) : undefined);
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatRoomUser[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat room details
  const { 
    data: chatRoom,
    isLoading: isLoadingChatRoom,
    error: chatRoomError
  } = useQuery<PrivateChatRoom>({
    queryKey: ['/api/premium/chat-rooms', chatRoomId],
    queryFn: () => {
      if (!chatRoomId) return Promise.reject("No chat room ID provided");
      return fetch(`/api/premium/chat-rooms/${chatRoomId}`).then(res => {
        if (!res.ok) throw new Error("Failed to load chat room");
        return res.json();
      });
    },
    enabled: !!chatRoomId && !!user
  });

  // Fetch chat room participants
  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    error: participantsError
  } = useQuery<ChatRoomUser[]>({
    queryKey: ['/api/premium/chat-rooms', chatRoomId, 'participants'],
    queryFn: () => {
      if (!chatRoomId) return Promise.reject("No chat room ID provided");
      return fetch(`/api/premium/chat-rooms/${chatRoomId}/participants`).then(res => {
        if (!res.ok) throw new Error("Failed to load participants");
        return res.json();
      });
    },
    enabled: !!chatRoomId && !!user
  });

  // Set up WebSocket connection
  useEffect(() => {
    if (!user || !chatRoomId || !chatRoom) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      // Register with the server
      ws.send(JSON.stringify({
        type: 'register',
        userId: user.id,
        emotion: chatRoom.emotion
      }));
      
      // Join the chat room
      ws.send(JSON.stringify({
        type: 'join_room',
        userId: user.id,
        roomId: chatRoomId
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message' && data.roomId === chatRoomId) {
          let messageContent = data.message;
          
          // Decrypt the message content if it's encrypted
          if (data.encrypted) {
            const roomKey = getRoomSpecificKey(chatRoomId);
            try {
              messageContent = decryptMessage(data.message, roomKey);
            } catch (decryptError) {
              console.error('Failed to decrypt message:', decryptError);
              messageContent = '🔒 [Encrypted message - unable to decrypt]';
            }
          }
          
          const newMessage: Message = {
            id: Math.random().toString(36).substring(2, 9),
            userId: data.userId,
            username: data.username,
            content: messageContent,
            timestamp: data.timestamp || new Date().toISOString(),
            avatarUrl: data.avatarUrl
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Handle other WebSocket events here
      } catch (error) {
        console.error('Error parsing WebSocket message', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    setSocket(ws);
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Leave the room before closing
        ws.send(JSON.stringify({
          type: 'leave_room',
          userId: user.id,
          roomId: chatRoomId
        }));
        ws.close();
      }
    };
  }, [user, chatRoomId, chatRoom]);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update participants
  useEffect(() => {
    if (participants.length > 0) {
      setChatUsers(participants);
    }
  }, [participants]);
  
  const sendMessage = () => {
    if (!socket || !user || !message.trim() || !chatRoomId) return;
    
    if (socket.readyState === WebSocket.OPEN) {
      // Generate a room-specific encryption key
      const roomKey = getRoomSpecificKey(chatRoomId);
      
      // Encrypt the message before sending
      const encryptedMessage = encryptMessage(message.trim(), roomKey);
      
      socket.send(JSON.stringify({
        type: 'chat_message',
        roomId: chatRoomId,
        userId: user.id,
        username: user.username,
        message: encryptedMessage, // Send encrypted message
        encrypted: true, // Flag to indicate encryption
        roomEmotion: chatRoom?.emotion || 'neutral'
      }));
      
      setMessage('');
    } else {
      toast({
        title: "Connection issue",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Mutations for chat room operations
  const leaveChatRoomMutation = useMutation({
    mutationFn: () => {
      if (!chatRoomId || !user) return Promise.reject("Missing data");
      return apiRequest("DELETE", `/api/premium/chat-rooms/${chatRoomId}/participants/${user.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Left chat room",
        description: "You have successfully left the chat room",
      });
      onClose();
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave chat room",
        variant: "destructive"
      });
    }
  });
  
  // if there's an error, show that
  if (chatRoomError || participantsError) {
    return (
      <div className={`fixed ${isMinimized ? 'bottom-20 right-5 h-14 w-80' : 'inset-10'} bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out z-50`}>
        <div className="bg-red-500 text-white p-4 flex justify-between">
          <h2 className="font-semibold">Error</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center p-8 text-center">
          <p>
            {chatRoomError instanceof Error ? chatRoomError.message : 
             participantsError instanceof Error ? participantsError.message : 
             "An error occurred. Please try again."}
          </p>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoadingChatRoom || !chatRoom) {
    return (
      <div className={`fixed ${isMinimized ? 'bottom-20 right-5 h-14 w-80' : 'inset-10'} bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out z-50`}>
        <div className="bg-slate-100 text-slate-800 p-4 flex justify-between">
          <h2 className="font-semibold">Loading chat room...</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // Determine the primary color based on either the custom theme or emotion
  const primaryColor = chatRoom.themeColor || emotions[chatRoom.emotion].color;
  const lightColor = chatRoom.themeColor ? `${chatRoom.themeColor}33` : emotions[chatRoom.emotion].lightBackgroundColor;
  
  return (
    <div 
      className={`fixed ${isMinimized ? 'bottom-20 right-5 h-14 w-80' : 'inset-10'} bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out z-50`}
      style={{ 
        borderColor: primaryColor,
        borderWidth: '1px'
      }}
    >
      {/* Chat header */}
      <div 
        className="p-4 flex justify-between items-center"
        style={{ backgroundColor: primaryColor, color: '#fff' }}
      >
        {!isMinimized && (
          <div className="flex items-center">
            <h2 className="font-semibold">{chatRoom.name}</h2>
            <div className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
              {chatUsers.length} {chatUsers.length === 1 ? 'participant' : 'participants'}
            </div>
          </div>
        )}
        {isMinimized && (
          <div className="truncate font-semibold">{chatRoom.name}</div>
        )}
        
        <div className="flex space-x-2">
          {!isMinimized && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-white hover:bg-white/20"
              >
                <Users className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:bg-white/20"
              >
                <Info className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {chatRoom.createdBy === user?.id && (
                    <>
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Room Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to leave this chat room?")) {
                        leaveChatRoomMutation.mutate();
                      }
                    }}
                  >
                    Leave Chat Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMinimizeToggle}
            className="text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </Button>
          
          {!isMinimized && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Main area */}
          <div className="flex-1 flex">
            {/* Chat message area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Safety warning banner */}
              <div className="bg-amber-50 border-y border-amber-200 p-3 text-amber-800 text-sm">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-green-600" />
                  <p className="text-green-600 font-medium">End-to-end encrypted chat</p>
                </div>
                <p className="mt-1">
                  <strong>Safety Warning:</strong> Never share sensitive personal information like credit card details,
                  passwords, or your address in chat rooms.
                </p>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No messages yet. Be the first to say hello!</p>
                    </div>
                  )}
                  
                  {messages.map((msg) => {
                    const isCurrentUser = msg.userId === user?.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-8 h-8 mt-1">
                            {msg.avatarUrl ? (
                              <AvatarImage src={msg.avatarUrl} alt={msg.username} />
                            ) : (
                              <AvatarFallback 
                                style={{ 
                                  backgroundColor: isCurrentUser ? primaryColor : lightColor
                                }}
                                className={isCurrentUser ? 'text-white' : ''}
                              >
                                {msg.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className={`mx-2 space-y-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-baseline space-x-2">
                              <span className="font-medium text-sm">{msg.username}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div 
                              className={`rounded-lg px-3 py-2 ${
                                isCurrentUser 
                                  ? `bg-primary text-white` 
                                  : 'bg-gray-100'
                              }`}
                              style={{ 
                                backgroundColor: isCurrentUser ? primaryColor : '',
                              }}
                            >
                              <div className="flex items-center">
                                {msg.content}
                                <Lock className="h-3 w-3 ml-1 opacity-50" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-3 border-t">
                <div className="flex items-end">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 resize-none"
                    rows={1}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 h-9 w-9 rounded-full"
                    style={{
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    onClick={sendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Side panel (conditionally displayed) */}
            {(showParticipants || showInfo) && (
              <div className="w-64 border-l bg-gray-50">
                {showParticipants && (
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Participants</h3>
                    <div className="space-y-3">
                      {isLoadingParticipants ? (
                        <div className="flex justify-center">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        chatUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="w-6 h-6 mr-2">
                                {user.avatarUrl ? (
                                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                                ) : (
                                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm">{user.username}</span>
                            </div>
                            {user.isAdmin && (
                              <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">Admin</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {showInfo && (
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Room Information</h3>
                    <div className="space-y-3 text-sm">
                      <p><strong>Name:</strong> {chatRoom.name}</p>
                      <p><strong>Description:</strong> {chatRoom.description}</p>
                      <p><strong>Emotion:</strong> {chatRoom.emotion.charAt(0).toUpperCase() + chatRoom.emotion.slice(1)}</p>
                      <p><strong>Created:</strong> {new Date(chatRoom.createdAt).toLocaleDateString()}</p>
                      <p><strong>Max Participants:</strong> {chatRoom.maxParticipants}</p>
                      <p><strong>Custom Color:</strong> {chatRoom.themeColor || 'Default'}</p>
                      <div className="mt-3 border-t pt-3">
                        <div className="flex items-center text-green-600">
                          <Lock className="h-4 w-4 mr-2" />
                          <p className="font-medium">End-to-End Encrypted</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          All messages in this chat room are encrypted and can only be read by participants. 
                          Your privacy is protected.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}