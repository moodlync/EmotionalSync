import { useState } from 'react';
import { MoodCard } from '@/components/mood-card';
import { type EmotionType } from '@/lib/emotions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/seo/seo-head';

export default function MoodStandaloneTest() {
  const [lastEmotion, setLastEmotion] = useState<EmotionType>('neutral');
  const [updateCount, setUpdateCount] = useState(0);
  
  const handleEmotionUpdate = (emotion: EmotionType) => {
    setLastEmotion(emotion);
    setUpdateCount(prev => prev + 1);
    console.log('MoodCard emotion updated to:', emotion);
  };

  return (
    <>
      <SEOHead title="MoodLync - Mood Card Test" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Mood Card Component Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Card component */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Mood Card</h2>
            <div className="max-w-sm mx-auto">
              <MoodCard 
                currentEmotion="neutral" 
                userId={1} 
                onEmotionUpdate={handleEmotionUpdate} 
              />
            </div>
          </div>
          
          {/* Right side - Status and info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Status Monitor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Last Emotion Update:</h3>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <code>{lastEmotion}</code>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Update Count:</h3>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <code>{updateCount}</code>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click "Change Mood" on the card</li>
                    <li>Select a new emotion in the modal</li>
                    <li>Confirm your selection</li>
                    <li>Watch the card update instantly</li>
                  </ol>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md text-sm">
                  <p className="font-semibold text-yellow-800">Testing Notes:</p>
                  <ul className="list-disc list-inside text-yellow-700 mt-2">
                    <li>The card should update immediately after selection</li>
                    <li>No page refresh should occur</li>
                    <li>The status monitor should update automatically</li>
                    <li>Check console for detailed logs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}