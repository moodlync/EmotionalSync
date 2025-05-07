import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  UserX, 
  Search, 
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
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
import { Textarea } from "@/components/ui/textarea";

interface BlockedUser {
  id: number;
  blockedUserId: number;
  reason: string | null;
  blockedAt: string;
  blockedUser: {
    id: number;
    username: string;
  };
}

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

// Form schema for blocking a user
const blockUserSchema = z.object({
  blockedUserId: z.number({
    required_error: "Please select a user to block",
  }),
  reason: z.string().max(200, "Reason must be less than 200 characters").optional(),
});

type BlockUserFormValues = z.infer<typeof blockUserSchema>;

export default function BlockedUsersManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch blocked users
  const { 
    data: blockedUsers = [],
    isLoading: isLoadingBlockedUsers,
    error: blockedUsersError
  } = useQuery<BlockedUser[]>({
    queryKey: ['/api/premium/blocked-users'],
    queryFn: async () => {
      const res = await fetch('/api/premium/blocked-users');
      if (!res.ok) throw new Error("Failed to load blocked users");
      return res.json();
    },
    enabled: !!user?.isPremium
  });
  
  // Form for blocking users
  const blockForm = useForm<BlockUserFormValues>({
    resolver: zodResolver(blockUserSchema),
    defaultValues: {
      reason: ""
    }
  });
  
  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim()) return [];
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to search users");
      return res.json() as Promise<User[]>;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search users",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  });
  
  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: (data: BlockUserFormValues) => {
      return apiRequest("POST", "/api/premium/block-user", data);
    },
    onSuccess: () => {
      toast({
        title: "User blocked",
        description: "The user has been blocked successfully",
      });
      setIsBlockDialogOpen(false);
      blockForm.reset();
      setSearchResults([]);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ['/api/premium/blocked-users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to block user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: (blockedUserId: number) => {
      return apiRequest("DELETE", `/api/premium/blocked-users/${blockedUserId}`);
    },
    onSuccess: () => {
      toast({
        title: "User unblocked",
        description: "The user has been unblocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/premium/blocked-users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to unblock user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    searchUsersMutation.mutate(searchQuery);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  const handleBlockUser = (data: BlockUserFormValues) => {
    blockUserMutation.mutate(data);
  };
  
  const handleUnblockUser = (blockedUserId: number) => {
    if (window.confirm("Are you sure you want to unblock this user?")) {
      unblockUserMutation.mutate(blockedUserId);
    }
  };
  
  const selectUserToBlock = (user: User) => {
    blockForm.setValue("blockedUserId", user.id);
  };
  
  // Handle error in loading blocked users
  if (blockedUsersError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-500 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Error Loading Blocked Users</h3>
        </div>
        <p className="text-gray-600 mb-4">
          {blockedUsersError instanceof Error 
            ? blockedUsersError.message 
            : "Failed to load blocked users."}
        </p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/premium/blocked-users'] })}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blocked Users</h2>
        <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserX className="h-4 w-4 mr-2" />
              Block User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Block a User</DialogTitle>
              <DialogDescription>
                Search for a user to block. Blocked users won't be able to contact you or see your private content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Search for a user by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                >
                  {isSearching ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {searchResults.map((searchUser) => {
                    const isAlreadyBlocked = blockedUsers.some(
                      (blocked) => blocked.blockedUserId === searchUser.id
                    );
                    const isCurrentUser = searchUser.id === user?.id;
                    
                    return (
                      <div 
                        key={searchUser.id} 
                        className={`p-2 flex justify-between items-center ${
                          isAlreadyBlocked || isCurrentUser ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isAlreadyBlocked && !isCurrentUser) {
                            selectUserToBlock(searchUser);
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {searchUser.avatarUrl ? (
                              <AvatarImage src={searchUser.avatarUrl} alt={searchUser.username} />
                            ) : (
                              <AvatarFallback>
                                {searchUser.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{searchUser.username}</span>
                        </div>
                        {isAlreadyBlocked && (
                          <span className="text-xs text-gray-500">Already blocked</span>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500">You</span>
                        )}
                        {!isAlreadyBlocked && !isCurrentUser && blockForm.getValues("blockedUserId") === searchUser.id && (
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-4 text-gray-500">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>
            
            <Form {...blockForm}>
              <form onSubmit={blockForm.handleSubmit(handleBlockUser)} className="space-y-4">
                <FormField
                  control={blockForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Why are you blocking this user?" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        This is for your reference only. The user won't see this reason.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blockForm.control}
                  name="blockedUserId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsBlockDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="destructive"
                    disabled={blockUserMutation.isPending || !blockForm.getValues("blockedUserId")}
                  >
                    {blockUserMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Blocking...
                      </>
                    ) : (
                      'Block User'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoadingBlockedUsers ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Blocked Users</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't blocked any users yet. Use the "Block User" button to 
            manage users you don't want to interact with.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blockedUsers.map((blocked) => (
            <Card key={blocked.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {blocked.blockedUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{blocked.blockedUser.username}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleUnblockUser(blocked.blockedUserId)}
                    disabled={unblockUserMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Unblock
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between text-gray-500 mb-2">
                    <span>Blocked on {new Date(blocked.blockedAt).toLocaleDateString()}</span>
                  </div>
                  {blocked.reason && (
                    <div className="mt-2">
                      <div className="text-gray-700 font-medium mb-1">Reason:</div>
                      <div className="bg-gray-50 p-2 rounded text-gray-600">
                        {blocked.reason}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}