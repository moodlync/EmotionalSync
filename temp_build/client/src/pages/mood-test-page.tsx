import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import MoodSelectionModal from "@/components/mood-selection-modal";
import { EmotionType } from '@/types/imprints';
import { useMoodContext } from '@/hooks/use-mood-context';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

export default function MoodTestPage() {
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentEmotion, setEmotionBackground, background } = useMoodContext();
  
  // Show toast on component mount
  useEffect(() => {
    toast({
      title: "Mood Testing Page",
      description: "This page lets you test the mood selection functionality",
    });
  }, [toast]);
  
  const handleSelectEmotion = (emotion: EmotionType) => {
    console.log('Selected emotion:', emotion);
    try {
      setEmotionBackground(emotion);
      setIsMoodModalOpen(false);
      setError(null);
      
      toast({
        title: "Mood Updated",
        description: `Your mood has been set to ${emotion}`,
      });
    } catch (err) {
      console.error('Error setting emotion:', err);
      setError(`Failed to set emotion: ${err instanceof Error ? err.message : String(err)}`);
      
      toast({
        title: "Error",
        description: "There was a problem updating your mood",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Mood Functions Testing Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-2">Current Mood</CardTitle>
            <CardDescription>
              Your current mood is: <span className="font-semibold">{currentEmotion}</span>
            </CardDescription>
            
            <div 
              className="w-full h-32 mt-4 rounded-md flex items-center justify-center" 
              style={{ background }}
            >
              <span className="text-xl">{currentEmotion || 'No mood selected'}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setIsMoodModalOpen(true)}>
                  Update Your Mood
                </Button>
              </DialogTrigger>
              <MoodSelectionModal 
                isOpen={isMoodModalOpen}
                onClose={() => setIsMoodModalOpen(false)}
                onSelectEmotion={handleSelectEmotion}
              />
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-2">Quick Mood Selection</CardTitle>
            <CardDescription>
              Directly select your mood without opening the modal
            </CardDescription>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                variant="outline"
                className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                onClick={() => setEmotionBackground('Joy' as EmotionType)}
              >
                Joy 😊
              </Button>
              <Button 
                variant="outline"
                className="bg-blue-300 text-white hover:bg-blue-400"
                onClick={() => setEmotionBackground('Sadness' as EmotionType)}
              >
                Sadness 😢
              </Button>
              <Button 
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => setEmotionBackground('Anger' as EmotionType)}
              >
                Anger 😠
              </Button>
              <Button 
                variant="outline"
                className="bg-purple-400 text-white hover:bg-purple-500"
                onClick={() => setEmotionBackground('Anxiety' as EmotionType)}
              >
                Anxiety 😰
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-2">Debug Information</CardTitle>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify({
              currentEmotion,
              background,
              error: error || 'No errors'
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      {error && (
        <Card className="mt-4 border-red-500">
          <CardContent className="pt-6">
            <CardTitle className="mb-2 text-red-500">Error</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}