import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, RefreshCw, Trash2, Send, FileText, Mail, UserX } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Define necessary types for registered users
interface RegisteredUser {
  id: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isPremium: boolean;
  createdAt: string | null;
}

export default function RegisteredUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for email selection and updates
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Auto-generated update suggestions
  const updateSuggestions = [
    "We've added a new section for tracking emotional milestones in your personal dashboard.",
    "Our mood-matching algorithm has been improved to provide more accurate emotional connections.",
    "You can now export your emotional journey data in various formats from the settings page.",
    "The premium feature set has been expanded with exclusive emotional NFT collections.",
    "We've enhanced the security of your emotional data with additional encryption measures."
  ];
  
  // Fetch regular users
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery<RegisteredUser[]>({
    queryKey: ["/api/admin/registered-users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/registered-users");
      
      if (!response.ok) {
        throw new Error("Failed to fetch registered users");
      }
      
      return response.json();
    }
  });
  
  // Send update notification mutation
  const sendUpdateMutation = useMutation({
    mutationFn: async ({ title, content, userIds, autoGenerate = false }: { 
      title: string, 
      content: string, 
      userIds: number[],
      autoGenerate?: boolean
    }) => {
      const response = await apiRequest("POST", "/api/admin/send-update", { 
        title,
        content,
        sendToAll: userIds.length === 0, 
        userIds: userIds.length > 0 ? userIds : undefined,
        autoGenerate
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send update notification");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Update sent",
        description: "The update notification has been sent successfully",
      });
      setShowUpdateDialog(false);
      setUpdateMessage("");
      setSelectedEmails(new Set());
      setSelectAll(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to send update",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-users"] });
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted from the platform",
      });
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  });
  
  // Generate random update based on suggestions
  const generateRandomUpdate = () => {
    const randomIndex = Math.floor(Math.random() * updateSuggestions.length);
    setUpdateMessage(updateSuggestions[randomIndex]);
  };
  
  // Handle select/deselect all users
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set());
    } else {
      const allUserIds = users?.map((user: RegisteredUser) => user.id) || [];
      setSelectedEmails(new Set(allUserIds));
    }
    setSelectAll(!selectAll);
  };
  
  // Handle individual user selection
  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedEmails(newSelected);
    
    // Update selectAll state based on if all users are selected
    setSelectAll(newSelected.size === users?.length);
  };
  
  // State for update title
  const [updateTitle, setUpdateTitle] = useState<string>("");

  // Handle sending update
  const handleSendUpdate = () => {
    if (!updateMessage.trim()) {
      toast({
        title: "Empty update",
        description: "Please enter an update message before sending",
        variant: "destructive",
      });
      return;
    }
    
    // Use a default title if none is provided
    const titleToSend = updateTitle.trim() || "MoodLync Platform Update";
    const contentToSend = updateMessage;
    const userIdsToSend = Array.from(selectedEmails);

    sendUpdateMutation.mutateAsync({ 
      title: titleToSend,
      content: contentToSend, 
      userIds: userIdsToSend,
      autoGenerate: false
    });
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteUserMutation.mutateAsync(deleteUserId);
    }
  };
  
  // Filter users by search query
  const filteredUsers = users ? users.filter((user: RegisteredUser) => {
    return searchQuery === "" || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          <p>Error loading registered users</p>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registered Users</h1>
            <p className="text-muted-foreground">
              Manage platform users and send update notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Update Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Update</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Send Platform Update</DialogTitle>
                  <DialogDescription>
                    Create and send update notifications to {selectedEmails.size > 0 
                      ? `${selectedEmails.size} selected users` 
                      : "all registered users"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="font-medium mb-2">Update Title</h4>
                    <Input
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="Enter a short, descriptive title..."
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Update Message</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateRandomUpdate}
                      className="gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Auto-Generate</span>
                    </Button>
                  </div>
                  
                  <Textarea
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="Enter update details to send to users..."
                    className="min-h-[120px]"
                  />
                  
                  {selectedEmails.size > 0 && users && (
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Selected Recipients:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(selectedEmails).map(id => {
                          const user = users.find((u: RegisteredUser) => u.id === id);
                          return user ? (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {user.email || user.username}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpdateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendUpdate}
                    disabled={sendUpdateMutation.isPending || !updateMessage.trim()}
                  >
                    {sendUpdateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Update
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="h-8 gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <div className="px-4 py-3 border-b bg-muted/50">
            <div className="grid grid-cols-7 gap-4">
              <div className="flex items-center">
                <Checkbox 
                  id="select-all" 
                  checked={selectAll} 
                  onCheckedChange={handleSelectAll}
                  className="mr-2"
                />
                <label htmlFor="select-all" className="font-medium cursor-pointer">
                  Select
                </label>
              </div>
              <div className="col-span-2">
                <span className="font-medium">User</span>
              </div>
              <div className="hidden md:block">
                <span className="font-medium">Email</span>
              </div>
              <div className="hidden md:block">
                <span className="font-medium">Status</span>
              </div>
              <div className="hidden lg:block">
                <span className="font-medium">Member Since</span>
              </div>
              <div className="text-right">
                <span className="font-medium">Actions</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-muted/50"
                >
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div>
                      <Checkbox 
                        id={`select-user-${user.id}`}
                        checked={selectedEmails.has(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="font-medium">{user.username || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {user.email || 'No email'}
                      </div>
                    </div>
                    <div className="hidden md:block truncate max-w-[180px]">
                      {user.email || 'No email'}
                    </div>
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        user.isPremium 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {user.isPremium ? "Premium" : "Free"}
                      </span>
                    </div>
                    <div className="hidden lg:block text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                    <div className="flex justify-end">
                      <AlertDialog open={showDeleteDialog && deleteUserId === user.id} onOpenChange={(open) => {
                        setShowDeleteDialog(open);
                        if (!open) setDeleteUserId(null);
                      }}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setDeleteUserId(user.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently delete the user <strong>{user.username}</strong> 
                              {user.email && <> with email <strong>{user.email}</strong></>} and all their data from the platform.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteConfirm}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteUserMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete User"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => {
                          setSelectedEmails(new Set([user.id]));
                          setShowUpdateDialog(true);
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}