import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Heart,
  UserRound,
  UserCheck,
  UserPlus,
  AlertCircle,
  Clock,
  Check,
  X,
  User,
  UserMinus,
  Loader2,
  Share2,
  Link as LinkIcon,
  Mail,
  Shield
} from 'lucide-react';

// Types
interface FamilyMember {
  id: number;
  userId: number;
  relatedUserId: number;
  relationshipType: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'other';
  status: 'pending' | 'accepted' | 'rejected';
  canViewMood: boolean;
  canViewJournal: boolean;
  canReceiveAlerts: boolean;
  canTransferTokens: boolean;
  createdAt: string;
  updatedAt: string | null;
  notes: string | null;
  relatedUser: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    emotionTokens: number;
  };
}

interface FamilyPlan {
  id: number;
  userId: number;
  planType: 'family';
  startDate: string;
  nextBillingDate: string | null;
  memberLimit: number;
  isLifetime: boolean;
}

interface SearchUser {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
}

export default function FamilyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<string>('other');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  // Get family members
  const {
    data: familyMembers,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers
  } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    refetchOnWindowFocus: false,
  });

  // Get family plan details
  const {
    data: familyPlan,
    isLoading: isLoadingPlan,
  } = useQuery<FamilyPlan>({
    queryKey: ['/api/premium/plan'],
    refetchOnWindowFocus: false,
  });

  // Search users query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError
  } = useQuery<SearchUser[]>({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      return response.json();
    },
  });

  // Add family member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: {
      relatedUserId: number;
      relationshipType: string;
      canViewMood: boolean;
      canViewJournal: boolean;
      canReceiveAlerts: boolean;
      canTransferTokens: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/family-members', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add family member');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Member Added',
        description: 'Family member has been invited. They will need to accept your invitation.',
        variant: 'default',
      });
      refetchMembers();
      setShowAddDialog(false);
      setSelectedUser(null);
      setSelectedRelationship('other');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove family member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/family-members/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove family member');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Member Removed',
        description: 'Family member has been removed successfully.',
        variant: 'default',
      });
      refetchMembers();
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Remove Member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FamilyMember> }) => {
      const response = await apiRequest('PATCH', `/api/family-members/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update permissions');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Permissions Updated',
        description: 'Family member permissions have been updated successfully.',
        variant: 'default',
      });
      refetchMembers();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Permissions',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get referral link
  const getReferralLink = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/referrals/link');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get referral link');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setReferralLink(data.link);
      setShowShareDialog(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Get Referral Link',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle user selection from search results
  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setSearchQuery('');
  };

  // Handle add member form submit
  const handleAddMember = () => {
    if (!selectedUser) return;

    addMemberMutation.mutate({
      relatedUserId: selectedUser.id,
      relationshipType: selectedRelationship,
      canViewMood: false,
      canViewJournal: false,
      canReceiveAlerts: false,
      canTransferTokens: true,
    });
  };

  // Handle remove member
  const handleRemoveMember = (member: FamilyMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  // Handle permission change
  const handlePermissionChange = (member: FamilyMember, permission: keyof FamilyMember, value: boolean) => {
    updatePermissionsMutation.mutate({
      id: member.id,
      data: { [permission]: value },
    });
  };

  // Handle share referral link
  const handleShareLink = () => {
    getReferralLink.mutate();
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied',
      description: 'Referral link has been copied to clipboard.',
      variant: 'default',
    });
  };

  // Loading state
  if (isLoadingMembers || isLoadingPlan) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (membersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load family members. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetchMembers()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members">
            <UserRound className="mr-2 h-4 w-4" />
            Family Members
          </TabsTrigger>
          <TabsTrigger value="invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Family
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Family Members</h3>
            {familyPlan && (
              <Badge variant="outline" className="bg-primary/10">
                {familyMembers?.length || 0} / {familyPlan.memberLimit} Members
              </Badge>
            )}
          </div>

          {!familyMembers || familyMembers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Family Members Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first family member by inviting them to join your plan.
                </p>
                <Button onClick={() => setActiveTab('invite')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Family
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      {member.relatedUser.profilePicture ? (
                        <img
                          src={member.relatedUser.profilePicture}
                          alt={member.relatedUser.username}
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          <UserRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{member.relatedUser.username}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {member.relationshipType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {member.status === 'pending' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      ) : member.status === 'accepted' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          <X className="mr-1 h-3 w-3" />
                          Declined
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {member.status === 'accepted' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center text-sm">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">Mood Tracking</p>
                              <p className="text-xs text-muted-foreground">
                                {member.canViewMood ? 'Allowed' : 'Not allowed'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">Journal Access</p>
                              <p className="text-xs text-muted-foreground">
                                {member.canViewJournal ? 'Allowed' : 'Not allowed'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePermissionChange(
                                  member,
                                  'canTransferTokens',
                                  !member.canTransferTokens
                                )
                              }
                            >
                              {member.canTransferTokens ? 'Disable' : 'Enable'} Token Transfer
                            </Button>
                            <Button
                              variant={member.canViewMood ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handlePermissionChange(
                                  member,
                                  'canViewMood',
                                  !member.canViewMood
                                )
                              }
                            >
                              {member.canViewMood ? 'Disable' : 'Enable'} Mood Tracking
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {member.status === 'pending' && (
                      <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          <p>
                            Waiting for {member.relatedUser.username} to accept your invitation.
                            They'll need to log in and approve this connection.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {member.status === 'rejected' && (
                      <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          <p>
                            {member.relatedUser.username} has declined your invitation.
                            You can remove this connection and try again later.
                          </p>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove Connection
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invite" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Family Members</CardTitle>
              <CardDescription>
                Invite your family members to join your premium family plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="share-link">1. Share Your Referral Link</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Button 
                      onClick={handleShareLink} 
                      className="flex-1"
                      variant="outline"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Get Referral Link
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share this link with your family members so they can create an account
                  </p>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="search-username">2. Find Family Member by Username</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Input
                      id="search-username"
                      placeholder="Enter username to search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <Button variant="outline" disabled={searchQuery.length < 2 || isSearching}>
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {searchQuery.length >= 2 && !isSearching && searchResults && (
                    <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No users found matching "{searchQuery}"
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {searchResults.map((user) => (
                            <li key={user.id} className="p-2 hover:bg-muted/50 cursor-pointer">
                              <button
                                className="w-full flex items-center text-left"
                                onClick={() => handleSelectUser(user)}
                              >
                                {user.profilePicture ? (
                                  <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="h-8 w-8 rounded-full mr-2 object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                                    <UserRound className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{user.username}</div>
                                  {(user.firstName || user.lastName) && (
                                    <div className="text-xs text-muted-foreground">
                                      {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                                    </div>
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {selectedUser.profilePicture ? (
                          <img
                            src={selectedUser.profilePicture}
                            alt={selectedUser.username}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                            <UserRound className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{selectedUser.username}</h4>
                          {(selectedUser.firstName || selectedUser.lastName) && (
                            <p className="text-sm text-muted-foreground">
                              {[selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="relationship-type">3. Relationship Type</Label>
                        <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="grandparent">Grandparent</SelectItem>
                            <SelectItem value="other">Other Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={() => setShowAddDialog(true)} 
                        className="w-full"
                        disabled={!selectedRelationship}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Family Member
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Member Confirmation Dialog */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  You're about to send an invitation to <strong>{selectedUser.username}</strong> to join your family plan.
                  They will need to accept your invitation before they can be added to your plan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Send Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove && (
                <>
                  Are you sure you want to remove <strong>{memberToRemove.relatedUser.username}</strong> from your family plan?
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMemberMutation.mutate(memberToRemove.id)}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="mr-2 h-4 w-4" />
              )}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Referral Link Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Your Referral Link</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with your family members so they can create an account and join your plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 my-4">
            <Input value={referralLink} readOnly />
            <Button variant="outline" size="icon" onClick={copyReferralLink}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}