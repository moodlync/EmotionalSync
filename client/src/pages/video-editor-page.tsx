import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import VideoEditor from '@/components/video-editor/video-editor';

export default function VideoEditorPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  
  // Check if the user has premium access
  const {
    data: premiumStatus,
    isLoading: isLoadingPremium,
  } = useQuery<{ isPremium: boolean; trialDays: number | null }>({
    queryKey: ['/api/user/premium-status'],
  });
  
  // Check for premium access on mount
  useEffect(() => {
    // For demo purposes, allow access. In production, we would check premium status
    const checkPremiumAccess = async () => {
      if (premiumStatus && !premiumStatus.isPremium) {
        setIsPremiumDialogOpen(true);
      }
    };
    
    if (!isLoadingPremium) {
      checkPremiumAccess();
    }
  }, [premiumStatus, isLoadingPremium]);
  
  // Handle trial start
  const handleStartTrial = () => {
    // In production, this would make an API call to start the trial
    toast({
      title: 'Free Trial Started',
      description: 'You now have 7 days of premium access to the video editor.',
      variant: 'default',
    });
    
    setIsPremiumDialogOpen(false);
  };
  
  // Handle upgrade to premium
  const handleUpgradeToPremium = () => {
    setLocation('/premium');
  };
  
  return (
    <div className="container py-6 max-w-full h-[calc(100vh-4rem)]">
      <VideoEditor />
      
      {/* Premium Access Required Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crown className="h-5 w-5 text-amber-500 mr-2" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              The professional video editor is available exclusively for premium users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Professional Video Editor</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create high-quality educational videos with our AI-powered editor, featuring
                  advanced transitions, text effects, and more.
                </p>
              </div>
            </div>
            
            <div className="rounded-md border p-4 bg-muted/40">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Why Premium?
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our video editor includes AI-powered features like automatic captioning,
                content enhancement, and royalty-free music generation that require significant
                computational resources.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              onClick={handleStartTrial}
              className="w-full"
            >
              Start 7-Day Free Trial
            </Button>
            <Button 
              variant="outline"
              onClick={handleUpgradeToPremium}
              className="w-full"
            >
              Upgrade to Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}