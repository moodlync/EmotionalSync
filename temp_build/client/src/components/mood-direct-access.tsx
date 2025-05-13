import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { EmotionType } from '@/types/imprints';
import { 
  emotionColors, 
  getEmotionColors, 
  normalizeEmotion, 
  getEmotionEmoji,
  primaryEmotionsList,
  syncMoodData,
  getCurrentMood,
  fetchEmotionData,
  emotionDescriptions
} from '@/lib/emotion-bridge';

// Direct-access component for mood functions without dependencies
// This provides a standalone implementation for mood selection
// Now integrated with HTML implementations via the emotion bridge

interface DisplayEmotion {
  name: EmotionType;
  emoji: string;
  background: string;
  textColor: string;
}

const defaultEmotion: DisplayEmotion = {
  name: 'Neutral' as EmotionType,
  emoji: '😐',
  background: '#E0E0E0',
  textColor: '#424242'
};

export default function MoodDirectAccess() {
  const { toast } = useToast();
  const [currentEmotion, setCurrentEmotion] = useState<DisplayEmotion>(defaultEmotion);
  const [intensity, setIntensity] = useState<number>(5);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [emotionHistory, setEmotionHistory] = useState<DisplayEmotion[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [externalMoodUpdates, setExternalMoodUpdates] = useState<number>(0);
  
  // Setup emotions on first load
  useEffect(() => {
    logDebug('Initializing app');
    
    // Try to load emotion data from server
    fetchEmotionData()
      .then(data => {
        logDebug(`Received emotion data from server: ${Object.keys(data).length} emotions`);
      })
      .catch(error => {
        logDebug(`Error fetching emotion data: ${error.message}`);
      });
    
    // Check for stored mood in localStorage (synced from HTML implementations)
    const savedMood = getCurrentMood();
    if (savedMood) {
      logDebug(`Found saved mood: ${savedMood.emotion} (${savedMood.intensity})`);
      handleSelectEmotion(savedMood.emotion, savedMood.intensity, false);
    } else {
      logDebug('No saved mood found, using default');
      updateUIWithState();
    }
    
    // Set up listener for mood updates from HTML implementations
    const handleMoodUpdate = (event: CustomEvent) => {
      const { emotion, intensity } = event.detail;
      logDebug(`Received external mood update: ${emotion} (${intensity})`);
      
      // Only update if it's different from current state
      if (emotion !== currentEmotion.name || intensity !== intensity) {
        handleSelectEmotion(emotion, intensity, false);
        setExternalMoodUpdates(prev => prev + 1);
      }
    };
    
    // Add event listener for cross-implementation updates
    window.addEventListener('moodlync:mood-update', handleMoodUpdate as EventListener);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('moodlync:mood-update', handleMoodUpdate as EventListener);
    };
  }, []);
  
  // Add a debug log message
  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [message, ...prev.slice(0, 19)]);
  };
  
  // Update UI when state changes
  const updateUIWithState = () => {
    logDebug(`Updating UI with state: ${JSON.stringify({
      currentEmotion: {
        name: currentEmotion.name,
        emoji: currentEmotion.emoji,
        background: currentEmotion.background,
        textColor: currentEmotion.textColor,
        description: getEmotionDescription(currentEmotion.name),
      },
      intensity: intensity
    })}`);
  };
  
  // Get description for an emotion
  const getEmotionDescription = (emotion: EmotionType): string => {
    return emotionDescriptions[emotion] || 'Undefined emotional state';
  };

  // Handle emotion selection
  const handleSelectEmotion = (emotion: string, newIntensity?: number, syncToOtherImplementations = true) => {
    try {
      // Normalize the emotion name
      const normalizedEmotion = normalizeEmotion(emotion);
      const intensityToUse = newIntensity !== undefined ? newIntensity : intensity;
      logDebug(`Setting emotion to: ${normalizedEmotion} with intensity: ${intensityToUse}`);
      
      // Get emotion display data
      const colorData = getEmotionColors(normalizedEmotion);
      const emoji = getEmotionEmoji(normalizedEmotion);
      
      // Create background based on premium status
      let bgColor = colorData.bg;
      if (isPremium) {
        bgColor = `linear-gradient(135deg, ${colorData.gradient[0]} 0%, ${colorData.gradient[1]} 100%)`;
      }
      
      // Create the new emotion state
      const newEmotion: DisplayEmotion = {
        name: normalizedEmotion,
        emoji: emoji,
        background: bgColor,
        textColor: colorData.text
      };
      
      // Update state
      setCurrentEmotion(newEmotion);
      if (newIntensity !== undefined) {
        setIntensity(newIntensity);
      }
      
      // Add to history (keeping last 10 emotions)
      setEmotionHistory(prev => [newEmotion, ...prev.slice(0, 9)]);
      
      // Sync to HTML implementations if requested
      if (syncToOtherImplementations) {
        syncMoodData(normalizedEmotion, intensityToUse);
        logDebug(`Synchronized mood data with other implementations`);
      }
      
      // Show toast notification
      toast({
        title: `Mood Updated: ${normalizedEmotion}`,
        description: `Your mood has been set to ${normalizedEmotion} with intensity ${intensityToUse}/10`,
        variant: "default",
        duration: 2000,
      });
      
      // Update UI debug info
      updateUIWithState();
      
    } catch (error) {
      console.error('Error setting emotion:', error);
      logDebug(`Error setting emotion: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Error Setting Mood",
        description: "There was a problem updating your mood. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Handle intensity change
  const handleIntensityChange = (newIntensity: number[]) => {
    const intensityValue = newIntensity[0];
    setIntensity(intensityValue);
    logDebug(`Setting intensity to: ${intensityValue}`);
    
    // Sync the intensity change to HTML implementations
    syncMoodData(currentEmotion.name, intensityValue);
    
    toast({
      title: `Intensity Updated`,
      description: `Intensity level set to ${intensityValue}/10`,
      variant: "default",
      duration: 2000,
    });
    
    updateUIWithState();
  };
  
  // Set a random emotion (for testing)
  const setRandomEmotion = () => {
    const emotions = primaryEmotionsList;
    const randomIndex = Math.floor(Math.random() * emotions.length);
    handleSelectEmotion(emotions[randomIndex]);
  };
  
  return (
    <Tabs defaultValue="mood" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="mood">Mood Selector</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="debug">Debug Info</TabsTrigger>
      </TabsList>
      
      <TabsContent value="mood" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Mood Display */}
          <Card className="md:row-span-2">
            <CardHeader>
              <CardTitle>Current Mood</CardTitle>
              <CardDescription>Your current emotional state</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="flex flex-col items-center justify-center p-6 rounded-lg mb-4 transition-all duration-500"
                style={{ 
                  background: currentEmotion.background,
                  color: currentEmotion.textColor,
                  minHeight: '180px' 
                }}
              >
                <div className="text-6xl mb-3">{currentEmotion.emoji}</div>
                <div className="text-xl font-bold mb-2">{currentEmotion.name}</div>
                <div className="text-center opacity-90">{getEmotionDescription(currentEmotion.name)}</div>
                <div className="mt-3 text-sm">Intensity: {intensity}/10</div>
              </div>
              
              <div className="mt-6">
                <h4 className="mb-3 font-medium">Emotion Intensity</h4>
                <Slider 
                  value={[intensity]} 
                  min={1} 
                  max={10} 
                  step={1}
                  onValueChange={handleIntensityChange}
                  className="mb-6"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={setRandomEmotion} className="w-full">Random Emotion</Button>
            </CardFooter>
          </Card>
          
          {/* Emotion Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Mood</CardTitle>
              <CardDescription>Choose how you're feeling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {primaryEmotionsList.map((emotion) => (
                  <Button
                    key={emotion}
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 p-2"
                    onClick={() => handleSelectEmotion(emotion)}
                    style={{
                      backgroundColor: currentEmotion.name === emotion 
                        ? getEmotionColors(emotion).bg 
                        : undefined,
                      color: currentEmotion.name === emotion 
                        ? getEmotionColors(emotion).text 
                        : undefined,
                    }}
                  >
                    <span className="text-2xl mb-1">{getEmotionEmoji(emotion)}</span>
                    <span className="text-sm">{emotion}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Premium Status Toggle (for testing) */}
          <Card>
            <CardHeader>
              <CardTitle>Premium Status</CardTitle>
              <CardDescription>Toggle premium features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Premium Features:</span>
                <Button
                  variant={isPremium ? "default" : "outline"}
                  onClick={() => {
                    setIsPremium(!isPremium);
                    logDebug(`Premium status changed to: ${!isPremium}`);
                    
                    toast({
                      title: isPremium ? "Premium Disabled" : "Premium Enabled",
                      description: isPremium 
                        ? "You no longer have access to premium features" 
                        : "You now have access to premium features like gradient backgrounds",
                      variant: "default",
                    });
                    
                    // Reapply current emotion with new premium setting
                    handleSelectEmotion(currentEmotion.name);
                  }}
                >
                  {isPremium ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="history" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Mood History</CardTitle>
            <CardDescription>Your recent mood changes</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionHistory.length === 0 ? (
              <div className="text-center p-4 border rounded-md text-muted-foreground">
                No mood history yet. Try selecting some emotions!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {emotionHistory.map((emotion, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-md flex items-center"
                    style={{
                      backgroundColor: emotion.background.startsWith('linear') 
                        ? undefined 
                        : emotion.background,
                      backgroundImage: emotion.background.startsWith('linear') 
                        ? emotion.background 
                        : undefined,
                      color: emotion.textColor
                    }}
                  >
                    <span className="text-2xl mr-3">{emotion.emoji}</span>
                    <div>
                      <div className="font-medium">{emotion.name}</div>
                      <div className="text-xs opacity-90">
                        {index === 0 ? 'Current' : `${index + 1} change${index > 0 ? 's' : ''} ago`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="debug" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Technical details for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-3 font-mono text-xs">
              <div className="mb-2 font-bold">Current State:</div>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-32">
                {JSON.stringify({
                  currentEmotion,
                  intensity,
                  isPremium,
                  emotionHistoryCount: emotionHistory.length,
                  externalMoodUpdates,
                  hasStoredMood: !!localStorage.getItem('moodlync_current_mood')
                }, null, 2)}
              </pre>
              
              <div className="mt-4 mb-2 font-bold">Cross-Implementation Connectivity</div>
              <div className="bg-muted p-2 rounded overflow-auto my-3">
                <div className="p-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span>HTML implementations:</span>
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>External updates received:</span>
                    <span className="font-mono">{externalMoodUpdates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>localStorage synchronization:</span>
                    <span className={`px-2 py-1 text-xs rounded ${localStorage.getItem('moodlync_current_mood') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {localStorage.getItem('moodlync_current_mood') ? 'Active' : 'No data'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 mb-2 font-bold">Log Messages:</div>
              <div className="bg-muted p-2 rounded overflow-auto max-h-64 space-y-1">
                {debugInfo.map((message, index) => (
                  <div key={index} className="border-b border-border/30 pb-1 last:border-0">
                    {message}
                  </div>
                ))}
                {debugInfo.length === 0 && (
                  <div className="italic text-muted-foreground">No log messages yet</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}