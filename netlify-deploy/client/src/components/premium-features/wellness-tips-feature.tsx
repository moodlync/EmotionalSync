import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Heart, ArrowRight, Calendar, Brain, Calendar as CalendarIcon } from "lucide-react";
import { DailyWellnessTip } from "../wellness-tips/daily-wellness-tip";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface WellnessTopic {
  id: number;
  title: string;
  description: string;
  categories: string[];
  premium: boolean;
}

// Mock wellness topics for the future tips section
const wellnessTopics: WellnessTopic[] = [
  {
    id: 1,
    title: "Understanding Emotional Triggers",
    description: "Learn to identify and manage your emotional triggers with evidence-based techniques from cognitive behavioral therapy.",
    categories: ["Emotional Intelligence", "CBT"],
    premium: false
  },
  {
    id: 2,
    title: "The Science of Stress Resilience",
    description: "Discover how your brain and body respond to stress, and practical strategies to build resilience based on neuroscience.",
    categories: ["Stress Management", "Neuroscience"],
    premium: false
  },
  {
    id: 3,
    title: "Deep Dive: Sleep and Mental Health",
    description: "Explore the critical connection between quality sleep and emotional wellbeing with actionable sleep hygiene protocols.",
    categories: ["Sleep", "Mental Health"],
    premium: true
  },
  {
    id: 4,
    title: "Mindfulness for Beginners",
    description: "Start a science-backed mindfulness practice with simple daily exercises designed for busy lifestyles.",
    categories: ["Mindfulness", "Beginner"],
    premium: false
  },
  {
    id: 5,
    title: "Social Connection & Emotional Health",
    description: "Research-based insights on how social relationships shape our emotions and practical ways to strengthen your connections.",
    categories: ["Relationships", "Social Health"],
    premium: true
  }
];

export function WellnessTipsFeature() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("daily");
  const isPremium = user?.isPremium;

  return (
    <div className="space-y-8">
      {!isPremium && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Premium Feature</AlertTitle>
          <AlertDescription className="text-amber-700">
            Access to all wellness content and personalized tips is a premium feature. Free users receive limited daily tips.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Daily Wellness Tips</h3>
            <p className="text-muted-foreground">
              Evidence-based tips and strategies to improve your mental and emotional wellbeing.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">
              <Calendar className="h-4 w-4 mr-2" />
              Today's Tip
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Brain className="h-4 w-4 mr-2" />
              Upcoming Topics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4 pt-4">
            <DailyWellnessTip />
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wellnessTopics.map((topic) => (
                  <Card key={topic.id} className={`${topic.premium && !isPremium ? 'opacity-70' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        {topic.premium && (
                          <div className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            Premium
                          </div>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {topic.categories.map((category, idx) => (
                          <div key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {category}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="text-sm p-0 h-auto text-indigo-600 hover:text-indigo-800 hover:bg-transparent"
                        disabled={topic.premium && !isPremium}
                      >
                        Coming soon <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {!isPremium && (
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg text-center">
                  <h4 className="text-lg font-semibold mb-2">Unlock All Wellness Content</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Premium members get access to all wellness topics, personalized recommendations, and an ad-free experience.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}