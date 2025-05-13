import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Loader2, Users, ShieldAlert, CoinsIcon, UserPlus } from 'lucide-react';
import FamilyManagement from '@/components/family/family-management';
import FamilyTokenTransfer from '@/components/family/family-token-transfer';
import FamilyConsent from '@/components/family/family-consent';

export default function FamilyPlanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');

  // Check if user is on a family plan
  const {
    data: familyPlan,
    isLoading: isLoadingPlan,
    error: planError
  } = useQuery<{ isPlanOwner: boolean; familyPlanOwnerId: number | null }>({
    queryKey: ['/api/family-plan/status'],
    refetchOnWindowFocus: false,
  });

  if (isLoadingPlan) {
    return (
      <div className="container max-w-6xl py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not on a family plan, show upgrade prompt
  if (!familyPlan || (!familyPlan.isPlanOwner && !familyPlan.familyPlanOwnerId)) {
    return (
      <div className="container max-w-6xl py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Plan</h1>
          <p className="text-muted-foreground mt-2">
            Connect with your family for shared emotional wellness
          </p>
        </div>
        
        <Separator />

        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Family Plan Required</CardTitle>
            <CardDescription>
              You need to upgrade to a family plan to access these features
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center max-w-md space-y-2">
              <h3 className="text-xl font-medium">Family Wellness Features</h3>
              <p className="text-muted-foreground">
                Connect with family members, monitor their emotional wellbeing (with consent), and share tokens for redemption.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <h4 className="font-medium">Consent-Based Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor loved ones' moods with their explicit permission
                </p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <CoinsIcon className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <h4 className="font-medium">Token Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  Transfer tokens between family members for redemption
                </p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium">Up to 5 Members</h4>
                <p className="text-sm text-muted-foreground">
                  Add up to 5 family members to your premium plan
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild size="lg">
                <Link to="/premium">
                  Upgrade to Family Plan
                </Link>
              </Button>
              <div className="mt-2 text-sm text-center text-muted-foreground">
                Starting at $149.99/year or $349.99 lifetime
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is the family plan owner
  if (familyPlan.isPlanOwner) {
    return (
      <div className="container max-w-6xl py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Family Plan Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your family connections and settings
            </p>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
            Plan Owner
          </Badge>
        </div>
        
        <Separator />
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Family Members
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <CoinsIcon className="h-4 w-4 mr-2" />
              Token Transfer
            </TabsTrigger>
            <TabsTrigger value="consent">
              <ShieldAlert className="h-4 w-4 mr-2" />
              My Consent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="pt-6">
            <FamilyManagement />
          </TabsContent>
          
          <TabsContent value="tokens" className="pt-6">
            <FamilyTokenTransfer />
          </TabsContent>
          
          <TabsContent value="consent" className="pt-6">
            <FamilyConsent />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // If user is a family plan member (not the owner)
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Plan</h1>
          <p className="text-muted-foreground mt-2">
            Manage your family connection settings
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
          Family Member
        </Badge>
      </div>
      
      <Separator />
      
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>You're part of a family plan</AlertTitle>
        <AlertDescription>
          You've been added to a family plan by another user. You can manage your consent settings below.
        </AlertDescription>
      </Alert>
      
      <FamilyConsent />
    </div>
  );
}