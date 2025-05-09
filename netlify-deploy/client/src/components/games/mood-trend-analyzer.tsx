import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar,
  Brain,
  Dumbbell,
  Utensils,
  Home,
  Briefcase,
  Moon,
  Users,
  Laptop,
  Music,
  Sparkles
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { EmotionType, ActivityType, GameCategory } from "@shared/schema";
import { Link } from "wouter";

// Mock data for mood trends
interface MoodEntry {
  date: Date;
  emotion: EmotionType;
  activityType: ActivityType;
  intensity: number; // 1-10
  notes?: string;
}

interface MoodTrendRecommendation {
  moodImprovement?: number; // percentage
  predominantMood?: EmotionType;
  recommendedActivities?: ActivityType[];
  recommendedGames?: GameCategory[];
  insights?: string[];
}

// Activity icons mapping
const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  work: <Briefcase className="h-4 w-4" />,
  study: <Brain className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  family: <Home className="h-4 w-4" />,
  rest: <Moon className="h-4 w-4" />,
  entertainment: <Laptop className="h-4 w-4" />,
  meditation: <Sparkles className="h-4 w-4" />,
  outdoors: <Dumbbell className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  other: <Calendar className="h-4 w-4" />
};

// Get last 14 days
const getLast14Days = () => {
  const dates = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
};

// Format date to display format
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Generate emotion color
const getEmotionColor = (emotion: EmotionType) => {
  switch (emotion) {
    case 'happy':
      return 'bg-green-500';
    case 'sad':
      return 'bg-blue-500';
    case 'angry':
      return 'bg-red-500';
    case 'anxious':
      return 'bg-purple-500';
    case 'excited':
      return 'bg-amber-500';
    case 'neutral':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export default function MoodTrendAnalyzer() {
  const [selectedRange, setSelectedRange] = useState<'7days' | '14days' | '30days' | '90days'>('14days');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'activities' | 'recommendations'>('overview');
  
  // Fetch mood entries
  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ['/api/user/mood-entries', selectedRange],
    queryFn: () => {
      // Mock implementation - in a real app, this would be an API call
      const entries: MoodEntry[] = [];
      const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'];
      const activities: ActivityType[] = ['work', 'study', 'exercise', 'social', 'family', 'rest', 'entertainment', 'meditation', 'outdoors', 'home'];
      
      const days = getLast14Days();
      
      days.forEach(day => {
        // Generate a random entry for each day
        if (Math.random() > 0.2) { // Some days might not have entries
          entries.push({
            date: day,
            emotion: emotions[Math.floor(Math.random() * emotions.length)],
            activityType: activities[Math.floor(Math.random() * activities.length)],
            intensity: Math.floor(Math.random() * 10) + 1
          });
        }
      });
      
      return Promise.resolve(entries);
    },
  });
  
  // Fetch recommendations
  const { data: recommendations } = useQuery<MoodTrendRecommendation | null>({
    queryKey: ['/api/user/mood-recommendations', selectedRange],
    queryFn: () => {
      // Mock implementation
      return Promise.resolve({
        moodImprovement: Math.floor(Math.random() * 30) + 5, // 5-35%
        predominantMood: 'anxious',
        recommendedActivities: ['meditation', 'exercise', 'social'],
        recommendedGames: ['breathing', 'positive_affirmation', 'memory'],
        insights: [
          'Your mood is consistently better after exercise sessions',
          'Morning meditations appear to reduce anxiety throughout the day',
          'Social activities on weekends correlate with improved mood on Mondays'
        ]
      });
    },
  });
  
  // Group entries by date
  const entriesByDate = moodEntries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
    const dateStr = formatDate(entry.date);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(entry);
    return acc;
  }, {});
  
  // Count emotions
  const emotionCounts = moodEntries.reduce<Record<EmotionType, number>>((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<EmotionType, number>);
  
  // Calculate most common emotion
  const mostCommonEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionType;
  
  // Count activities
  const activityCounts = moodEntries.reduce<Record<ActivityType, number>>((acc, entry) => {
    acc[entry.activityType] = (acc[entry.activityType] || 0) + 1;
    return acc;
  }, {} as Record<ActivityType, number>);
  
  // Calculate correlation between activities and mood
  // This is a simplified analysis
  const activityMoodCorrelation: Partial<Record<ActivityType, Record<EmotionType, number>>> = {};
  
  moodEntries.forEach(entry => {
    if (!activityMoodCorrelation[entry.activityType]) {
      activityMoodCorrelation[entry.activityType] = {} as Record<EmotionType, number>;
    }
    
    if (activityMoodCorrelation[entry.activityType]) {
      activityMoodCorrelation[entry.activityType]![entry.emotion] = 
        (activityMoodCorrelation[entry.activityType]![entry.emotion] || 0) + 1;
    }
  });
  
  // Sort activities by positive emotions correlation
  const activitiesRanked = Object.entries(activityMoodCorrelation)
    .map(([activity, emotions]) => {
      const positiveCount = (emotions.happy || 0) + (emotions.excited || 0);
      const totalCount = Object.values(emotions).reduce((sum, count) => sum + count, 0);
      return {
        activity: activity as ActivityType,
        positiveRatio: totalCount > 0 ? positiveCount / totalCount : 0
      };
    })
    .sort((a, b) => b.positiveRatio - a.positiveRatio);
  
  const renderMoodTimeline = () => {
    const days = getLast14Days();
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between px-2 mb-2 text-xs text-muted-foreground">
          <span>Date</span>
          <span>Mood</span>
        </div>
        {days.map((day, index) => {
          const dateStr = formatDate(day);
          const entries = entriesByDate[dateStr] || [];
          const emotion = entries[0]?.emotion;
          
          return (
            <div key={index} className="flex items-center space-x-2 py-1.5">
              <div className="w-16 text-xs">{dateStr}</div>
              {entries.length > 0 ? (
                <div className="flex-1 flex items-center space-x-1">
                  <div className={`h-3 rounded-full ${getEmotionColor(emotion)}`} style={{ width: `${entries[0].intensity * 10}%` }}></div>
                  <span className="text-xs capitalize">{emotion}</span>
                </div>
              ) : (
                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full opacity-50" />
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderActivitiesAnalysis = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Activity Distribution</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(activityCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([activity, count]) => (
                <div key={activity} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    {ACTIVITY_ICONS[activity as ActivityType]}
                    <span className="capitalize">{activity.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Activities & Mood Correlation</h3>
          <div className="space-y-2">
            {activitiesRanked.slice(0, 5).map(({ activity, positiveRatio }) => (
              <div key={activity} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    {ACTIVITY_ICONS[activity]}
                    <span className="capitalize">{activity.replace('_', ' ')}</span>
                  </div>
                  <span>{(positiveRatio * 100).toFixed(0)}% positive</span>
                </div>
                <Progress value={positiveRatio * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderRecommendations = () => {
    if (!recommendations) return <div>Loading recommendations...</div>;
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Mood Improvement Potential</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Following recommendations could improve your mood by:</span>
              <span className="font-medium">{recommendations.moodImprovement}%</span>
            </div>
            <Progress value={recommendations.moodImprovement} className="h-3 bg-muted" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recommended Activities</h3>
          <div className="flex flex-wrap gap-2">
            {recommendations.recommendedActivities?.map(activity => (
              <Badge key={activity} variant="outline" className="flex items-center space-x-1 p-1.5">
                {ACTIVITY_ICONS[activity]}
                <span className="capitalize">{activity.replace('_', ' ')}</span>
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recommended Games</h3>
          <div className="flex flex-wrap gap-2">
            {recommendations.recommendedGames?.map(game => (
              <Link key={game} href="/mood-games">
                <Badge variant="outline" className="flex items-center space-x-1 p-1.5 cursor-pointer hover:bg-primary/10">
                  <Sparkles className="h-3 w-3" />
                  <span className="capitalize">{game.replace('_', ' ')}</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Insights</h3>
          <ul className="space-y-2">
            {recommendations.insights?.map((insight, index) => (
              <li key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Mood Trend Analysis
              </CardTitle>
              <CardDescription>
                Track patterns in your emotional state
              </CardDescription>
            </div>
            <Select value={selectedRange} onValueChange={(value: any) => setSelectedRange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="14days">Last 14 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="recommendations">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Entries Recorded</div>
                  <div className="text-2xl font-bold">{moodEntries.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Most Common Mood</div>
                  <div className="text-2xl font-bold capitalize">{mostCommonEmotion || 'N/A'}</div>
                </div>
              </div>
              
              {renderMoodTimeline()}
            </TabsContent>
            
            <TabsContent value="activities">
              {renderActivitiesAnalysis()}
            </TabsContent>
            
            <TabsContent value="recommendations">
              {renderRecommendations()}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            View Full Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}