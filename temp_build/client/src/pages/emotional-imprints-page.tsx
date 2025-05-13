import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { EmotionalImprint, EmotionType } from '@/types/imprints';
import EmotionalImprintCreator from '@/components/imprints/emotional-imprint-creator';
import ImprintGrid from '@/components/imprints/imprint-grid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, Lock, HeartHandshake, Heart, Flag } from 'lucide-react';

const EmotionalImprintsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingImprint, setEditingImprint] = useState<EmotionalImprint | undefined>();
  const [activeTab, setActiveTab] = useState('my-imprints');
  
  // Fetch user's emotional imprints
  const {
    data: myImprints,
    isLoading: myImprintsLoading,
    refetch: refetchMyImprints,
  } = useQuery({
    queryKey: ['/api/emotional-imprints/my'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
    onError: (error: Error) => {
      console.error('Error fetching emotional imprints:', error);
      // Don't show error toast as 401 is expected for non-premium users
    },
  });
  
  // Fetch emotional imprints shared with the user
  const {
    data: sharedImprints,
    isLoading: sharedImprintsLoading,
    refetch: refetchSharedImprints,
  } = useQuery({
    queryKey: ['/api/emotional-imprints/shared'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
    onError: (error: Error) => {
      console.error('Error fetching shared emotional imprints:', error);
    },
  });
  
  // Fetch public emotional imprints (for discovery)
  const {
    data: publicImprints,
    isLoading: publicImprintsLoading,
    refetch: refetchPublicImprints,
  } = useQuery({
    queryKey: ['/api/emotional-imprints/public'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    onError: (error: Error) => {
      console.error('Error fetching public emotional imprints:', error);
    },
  });
  
  // Handle successful imprint creation or update
  const handleImprintCreationSuccess = () => {
    // Close dialog and reset editing state
    setIsCreateDialogOpen(false);
    setEditingImprint(undefined);
    
    // Refresh imprints data
    refetchMyImprints();
    refetchSharedImprints();
    refetchPublicImprints();
    
    toast({
      title: editingImprint ? 'Imprint Updated' : 'Imprint Created',
      description: editingImprint
        ? 'Your emotional imprint has been updated successfully.'
        : 'Your emotional imprint has been created and added to your collection.',
    });
  };
  
  // Handle edit imprint button click
  const handleEditImprint = (imprint: EmotionalImprint) => {
    setEditingImprint(imprint);
    setIsCreateDialogOpen(true);
  };
  
  const isPremium = user?.isPremium;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Emotional Imprints</h1>
          <p className="text-muted-foreground mt-2">
            Capture, visualize, and share your emotional experiences through multi-sensory imprints
          </p>
        </div>
        
        <Button
          onClick={() => {
            if (!isPremium) {
              toast({
                title: 'Premium Feature',
                description: 'Emotional Imprints are a premium feature. Upgrade to create and share your own emotional experiences.',
                variant: 'destructive',
              });
              return;
            }
            setEditingImprint(undefined);
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Create Imprint
        </Button>
      </div>
      
      {!isPremium ? (
        <Card className="mb-8 border-dashed border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Premium Feature
            </CardTitle>
            <CardDescription>
              Emotional Imprints are available exclusively for premium members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <Heart className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium mb-1">Capture Emotions</h3>
                <p className="text-sm text-muted-foreground">
                  Create rich, multi-sensory imprints with color, sound, and vibration to capture the essence of your emotions
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <HeartHandshake className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium mb-1">Share & Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Share your emotional imprints with trusted connections to foster deeper understanding and empathy
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <Flag className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium mb-1">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your emotional journey over time with saved imprints and discover patterns in your emotional well-being
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button className="px-8">Upgrade to Premium</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="my-imprints">My Imprints</TabsTrigger>
            <TabsTrigger value="shared-imprints">Shared With Me</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-imprints" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">My Emotional Imprints</h2>
            <ImprintGrid
              imprints={myImprints as EmotionalImprint[]}
              isLoading={myImprintsLoading}
              emptyMessage="You haven't created any emotional imprints yet"
              isUserImprints={true}
              onEdit={handleEditImprint}
            />
          </TabsContent>
          
          <TabsContent value="shared-imprints" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shared With Me</h2>
            <ImprintGrid
              imprints={sharedImprints as EmotionalImprint[]}
              isLoading={sharedImprintsLoading}
              emptyMessage="No emotional imprints have been shared with you yet"
            />
          </TabsContent>
          
          <TabsContent value="discover" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Discover</h2>
            <ImprintGrid
              imprints={publicImprints as EmotionalImprint[]}
              isLoading={publicImprintsLoading}
              emptyMessage="No public emotional imprints available for discovery"
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Create/Edit Imprint Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingImprint(undefined);
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <EmotionalImprintCreator
            existingImprint={editingImprint}
            onSuccess={handleImprintCreationSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmotionalImprintsPage;