import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Eye, EyeOff, HeartPulse, Bell, Shield, User } from 'lucide-react';

interface FamilyOwner {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
}

interface FamilyRelationship {
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
  owner: FamilyOwner;
}

interface ConsentSettings {
  allowMoodTracking: boolean;
}

export default function FamilyConsent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    allowMoodTracking: false,
  });

  // Get family relationship if user is part of a family plan
  const {
    data: familyRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery<FamilyRelationship[]>({
    queryKey: ['/api/family-requests'],
    refetchOnWindowFocus: false,
  });

  // Get user consent settings
  const {
    data: userSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery<ConsentSettings>({
    queryKey: ['/api/user/consent-settings'],
    refetchOnWindowFocus: false,
  });
  
  // Set consent settings when data is received
  useEffect(() => {
    if (userSettings) {
      setConsentSettings(userSettings);
    }
  }, [userSettings]);

  // Pending requests that haven't been responded to
  const pendingRequests = familyRequests?.filter((req) => req.status === 'pending') || [];

  // Accepted relationships
  const acceptedRelationships = familyRequests?.filter((req) => req.status === 'accepted') || [];

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/family-members/${id}/status`, {
        status: 'accepted',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept invitation');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Accepted',
        description: 'You are now connected to your family member.',
        variant: 'default',
      });
      refetchRequests();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Accept Invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject invitation mutation
  const rejectInvitationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/family-members/${id}/status`, {
        status: 'rejected',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject invitation');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Rejected',
        description: 'You have declined the family connection request.',
        variant: 'default',
      });
      refetchRequests();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Reject Invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update consent settings mutation
  const updateConsentMutation = useMutation({
    mutationFn: async (data: ConsentSettings) => {
      const response = await apiRequest('PATCH', '/api/mood-tracking-consent', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update consent settings');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Consent Settings Updated',
        description: 'Your mood tracking consent settings have been updated.',
        variant: 'default',
      });
      setConsentSettings(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle consent toggle
  const handleConsentToggle = (value: boolean) => {
    updateConsentMutation.mutate({
      allowMoodTracking: value,
    });
  };

  // Loading state
  if (isLoadingRequests || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Mood Tracking Consent
          </CardTitle>
          <CardDescription>
            Control if family members can view your emotional health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mood-tracking"
                  checked={consentSettings.allowMoodTracking}
                  onCheckedChange={handleConsentToggle}
                  disabled={updateConsentMutation.isPending}
                />
                <Label htmlFor="mood-tracking" className="font-medium">
                  Allow Family Members to Track My Mood
                </Label>
              </div>
              <p className="text-sm text-muted-foreground pl-12">
                When enabled, family members with permission can view your emotional status and mood history.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start space-x-3">
              {consentSettings.allowMoodTracking ? (
                <>
                  <Eye className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400">Sharing Enabled</h4>
                    <p className="text-sm text-muted-foreground">
                      Family members with permission can see your emotional health data. You can revoke this at any time.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-700 dark:text-amber-400">Sharing Disabled</h4>
                    <p className="text-sm text-muted-foreground">
                      Your mood data is private. No family members can see your emotional health information.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2 text-amber-500" />
              Pending Family Requests
            </CardTitle>
            <CardDescription>
              These people want to connect with you as family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {request.owner.profilePicture ? (
                        <img
                          src={request.owner.profilePicture}
                          alt={request.owner.username}
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{request.owner.username}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          Wants to connect as: {request.relationshipType}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      Pending
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg text-center flex flex-col items-center">
                      <HeartPulse className="h-5 w-5 text-rose-500 mb-1" />
                      <h5 className="text-sm font-medium">Mood Tracking</h5>
                      <p className="text-xs text-muted-foreground">
                        {request.canViewMood ? 'Will be able to view' : 'Won\'t be able to view'}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg text-center flex flex-col items-center">
                      <Bell className="h-5 w-5 text-blue-500 mb-1" />
                      <h5 className="text-sm font-medium">Crisis Alerts</h5>
                      <p className="text-xs text-muted-foreground">
                        {request.canReceiveAlerts ? 'Will receive alerts' : 'Won\'t receive alerts'}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectInvitationMutation.mutate(request.id)}
                      disabled={rejectInvitationMutation.isPending}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => acceptInvitationMutation.mutate(request.id)}
                      disabled={acceptInvitationMutation.isPending}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {acceptedRelationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Connected Family Members
            </CardTitle>
            <CardDescription>
              These are your active family connections and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedRelationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {relationship.owner.profilePicture ? (
                        <img
                          src={relationship.owner.profilePicture}
                          alt={relationship.owner.username}
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{relationship.owner.username}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          Connected as: {relationship.relationshipType}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Connected
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${relationship.canViewMood ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Mood Tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${relationship.canViewJournal ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Journal Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${relationship.canReceiveAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Crisis Alerts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingRequests.length === 0 && acceptedRelationships.length === 0 && (
        <Alert variant="default">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>No Family Connections</AlertTitle>
          <AlertDescription>
            You don't have any family members connected to your account.
            Family members need to invite you to join their family plan first.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}