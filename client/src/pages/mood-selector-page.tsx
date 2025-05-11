import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import MoodSelectionModal from "@/components/mood-selection-modal";
import MoodDirectAccess from "@/components/mood-direct-access";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { EmotionType } from '@/types/imprints';
import { useMoodContext } from '@/hooks/use-mood-context';
import { useToast } from "@/hooks/use-toast";

export default function MoodSelectorPage() {
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const { toast } = useToast();
  const { setEmotionBackground, currentEmotion, emotionEmoji } = useMoodContext();
  
  // Handle emotion selection from the app-wide mood selector
  const handleSelectEmotion = (emotion: EmotionType) => {
    console.log('Setting app-wide emotion:', emotion);
    try {
      setEmotionBackground(emotion);
      setIsMoodModalOpen(false);
      
      toast({
        title: "App-wide Mood Updated",
        description: `Your app-wide mood has been set to ${emotion}`,
      });
    } catch (err) {
      console.error('Error setting emotion:', err);
      
      toast({
        title: "Error",
        description: "There was a problem updating the app-wide mood",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-2">Mood Selector Hub</h1>
      <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
        This page demonstrates both the standalone mood selector component and the app-wide mood system.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="md:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle>App-wide Mood System</CardTitle>
            <CardDescription>
              This uses the MoodProvider context to update the mood throughout the entire application
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div 
                className="w-full md:w-1/3 h-32 rounded-md flex flex-col items-center justify-center"
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                }}
              >
                <span className="text-4xl mb-2">{emotionEmoji}</span>
                <span className="text-xl">{currentEmotion || 'No mood set'}</span>
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <p>
                  The app-wide mood context affects the entire application's emotional state.
                  When you change this mood, it will update across all pages that use the mood context.
                </p>
                
                <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" size="lg" onClick={() => setIsMoodModalOpen(true)}>
                      Change App-Wide Mood
                    </Button>
                  </DialogTrigger>
                  <MoodSelectionModal 
                    isOpen={isMoodModalOpen}
                    onClose={() => setIsMoodModalOpen(false)}
                    onSelectEmotion={handleSelectEmotion}
                  />
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <p className="text-sm text-muted-foreground">
              This uses React Context to propagate the emotional state throughout the application.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Standalone Mood Component</h2>
        <p className="text-muted-foreground mb-6">
          This component works independently of the app-wide mood system. Changes here won't affect
          the rest of the application.
        </p>
        
        <MoodDirectAccess />
      </div>
      
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-bold mb-2">Alternate Implementations</h2>
        <p className="mb-4">
          Need an even simpler implementation? Try our pure HTML/JavaScript version:
        </p>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.open('/direct-mood-selector.html', '_blank')}>
            Open HTML-only Version
          </Button>
          
          <Button variant="outline" onClick={() => window.open('/mood-test.html', '_blank')}>
            Open Legacy HTML Test Page
          </Button>
        </div>
      </div>
    </div>
  );
}