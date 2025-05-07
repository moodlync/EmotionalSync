import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PremiumChatRoomsManager from "@/components/premium/premium-chat-rooms-manager";
import PremiumChatRoom from "@/components/premium/premium-chat-room";
import BlockedUsersManager from "@/components/premium/blocked-users-manager";
import { MessageSquare, Lock, Shield, Star } from "lucide-react";

export default function PremiumChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const [activeChatRoomId, setActiveChatRoomId] = useState<number | null>(
    params.id ? parseInt(params.id) : null
  );
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  const handleOpenChatRoom = (chatRoomId: number) => {
    setActiveChatRoomId(chatRoomId);
  };
  
  const handleCloseChatRoom = () => {
    setActiveChatRoomId(null);
  };
  
  const toggleMinimizeChatRoom = () => {
    setIsChatMinimized(!isChatMinimized);
  };
  
  // Show upgrade prompt for non-premium users
  if (user && !user.isPremium) {
    return (
      <div className="container max-w-screen-lg mx-auto py-8 px-4">
        <Card className="border-2 border-dashed border-primary">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold">Premium Feature</CardTitle>
            <CardDescription className="text-lg mt-2">
              Access to private chat rooms is available only for premium members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Private Chat Rooms</h3>
                <p className="text-gray-600">
                  Create your own private chat rooms to connect with specific users based on emotions.
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Invite-Only Access</h3>
                <p className="text-gray-600">
                  Control who can join your chat rooms for more meaningful conversations.
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">User Blocking</h3>
                <p className="text-gray-600">
                  Block unwanted users and manage your chat experience with enhanced privacy controls.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                size="lg" 
                className="font-semibold px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Star className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-lg mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Premium Chat Rooms</h1>
        <p className="text-gray-600">
          Create and manage your private chat rooms, control access, and connect with others
          in a more meaningful way.
        </p>
      </div>
      
      <Tabs defaultValue="my-rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-rooms" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Chat Rooms
          </TabsTrigger>
          <TabsTrigger value="blocked-users" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Blocked Users
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-rooms" className="space-y-4">
          <PremiumChatRoomsManager onOpenChatRoom={handleOpenChatRoom} />
        </TabsContent>
        
        <TabsContent value="blocked-users" className="space-y-4">
          <BlockedUsersManager />
        </TabsContent>
      </Tabs>
      
      {/* Active chat room */}
      {activeChatRoomId && (
        <PremiumChatRoom
          chatRoomId={activeChatRoomId}
          isMinimized={isChatMinimized}
          onMinimizeToggle={toggleMinimizeChatRoom}
          onClose={handleCloseChatRoom}
        />
      )}
    </div>
  );
}