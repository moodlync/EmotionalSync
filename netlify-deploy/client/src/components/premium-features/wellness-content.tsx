import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PlayCircle, BookOpen, AlertCircle, Gift, Clock, ArrowRight, Check, LockIcon } from "lucide-react";
import { EmotionType, emotions } from '@/lib/emotions';
import { useToast } from '@/hooks/use-toast';

// Content types
type ContentType = 'exercise' | 'meditation' | 'reading' | 'activity';

interface WellnessContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  duration: string;
  emotion: EmotionType;
  thumbnail: string;
  isPremium: boolean;
}

// Mock content data
const allContent: WellnessContent[] = [
  {
    id: '1',
    title: 'Morning Gratitude Practice',
    description: 'Start your day with positivity by practicing gratitude for 5 minutes',
    type: 'exercise',
    duration: '5 mins',
    emotion: 'happy',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: false
  },
  {
    id: '2',
    title: 'Calm Breathing Technique',
    description: 'Reduce anxiety with this simple 4-7-8 breathing exercise',
    type: 'meditation',
    duration: '10 mins',
    emotion: 'anxious',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: true
  },
  {
    id: '3',
    title: 'Anger Management Journaling',
    description: 'Express and process anger through guided journaling prompts',
    type: 'activity',
    duration: '15 mins',
    emotion: 'angry',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: true
  },
  {
    id: '4',
    title: 'Understanding Your Emotions',
    description: 'A brief guide to recognizing and accepting different emotional states',
    type: 'reading',
    duration: '7 mins',
    emotion: 'neutral',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: false
  },
  {
    id: '5',
    title: 'Mindful Walking Meditation',
    description: 'Transform a simple walk into a powerful mindfulness practice',
    type: 'meditation',
    duration: '20 mins',
    emotion: 'sad',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: true
  },
  {
    id: '6',
    title: 'Channeling Excitement Productively',
    description: 'Learn to harness enthusiastic energy in creative and fulfilling ways',
    type: 'activity',
    duration: '15 mins',
    emotion: 'excited',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200',
    isPremium: true
  }
];

// Content type icons
const contentTypeIcons = {
  exercise: <PlayCircle className="h-4 w-4" />,
  meditation: <Sparkles className="h-4 w-4" />,
  reading: <BookOpen className="h-4 w-4" />,
  activity: <Gift className="h-4 w-4" />,
};

export default function WellnessContentFeature() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EmotionType>('neutral');
  const [isPremium, setIsPremium] = useState(false);
  
  const handleContentClick = (content: WellnessContent) => {
    if (content.isPremium && !isPremium) {
      toast({
        title: "Premium Content",
        description: "Upgrade to premium to access this content",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would open the content or redirect to it
    toast({
      title: content.title,
      description: `Opening ${content.type}: ${content.title}`,
    });
  };
  
  // Filter content based on active emotion tab
  const filteredContent = activeTab === 'neutral' 
    ? allContent 
    : allContent.filter(content => content.emotion === activeTab);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Wellness Content</CardTitle>
        </div>
        <CardDescription>
          Personalized exercises, meditations and readings based on your emotional state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Emotion Tabs */}
          <Tabs defaultValue="neutral" value={activeTab} onValueChange={(value) => setActiveTab(value as EmotionType)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              {Object.entries(emotions).map(([key, emotion]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${emotion.backgroundColor}`}></span>
                  <span>{emotion.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Content for each emotion tab */}
            {Object.keys(emotions).map((key) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredContent.map((content) => (
                    <div 
                      key={content.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition hover:shadow-md ${
                        content.isPremium && !isPremium ? 'opacity-70' : ''
                      }`}
                      onClick={() => handleContentClick(content)}
                    >
                      <div className="relative h-40 bg-gray-100">
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                        {content.isPremium && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-amber-500">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1">
                          <Badge variant="outline" className="bg-white/90">
                            {contentTypeIcons[content.type]}
                            <span className="ml-1">{content.type}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-white/90">
                            <Clock className="h-3 w-3 mr-1" />
                            {content.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium mb-1 flex items-center justify-between">
                          {content.title}
                          {content.isPremium && !isPremium && <LockIcon className="h-3 w-3 text-amber-500" />}
                        </h3>
                        <p className="text-sm text-muted-foreground">{content.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredContent.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No content available</h3>
                    <p className="text-sm text-muted-foreground">
                      We don't have any content for this emotion yet. Check back soon!
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Premium Content Info */}
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Unlock All Premium Content</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Upgrade to premium to access all wellness content and recommendations
                    personalized to your emotional state.
                  </p>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    Upgrade Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isPremium ? (
            <span className="flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              Premium content unlocked
            </span>
          ) : (
            <span>Access 2 free pieces of content, upgrade for unlimited access</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}