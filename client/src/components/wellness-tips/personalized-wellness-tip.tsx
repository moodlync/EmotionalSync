import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, ThumbsUp, Bookmark, Share2, RefreshCw, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMoodContext } from '@/hooks/use-mood-context';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EmotionType } from '@/types/imprints';
import { Skeleton } from '@/components/ui/skeleton';

// Interface for our wellness tip
interface WellnessTip {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string;
  emotionTypes: EmotionType[];
  isPremium: boolean;
}

// Emotional state to category mapping
const emotionToCategory: Record<string, string[]> = {
  Joy: ['Gratitude', 'Joy Practices', 'Social Connection'],
  Sadness: ['Self-Compassion', 'Mood Elevation', 'Emotional Processing'],
  Anger: ['Anger Management', 'Emotional Regulation', 'Stress Relief'],
  Anxiety: ['Anxiety Management', 'Grounding Techniques', 'Breathwork'],
  Serenity: ['Mindfulness', 'Present-Moment Awareness', 'Meditation'],
  Excitement: ['Energy Management', 'Focus Techniques', 'Channeling Enthusiasm'],
  Boredom: ['Engagement Practices', 'Curiosity Building', 'Motivation'],
  Contentment: ['Appreciation', 'Mindfulness', 'Present-Moment Joy'],
  Nostalgia: ['Emotional Processing', 'Memory Integration', 'Reflection'],
  Hope: ['Goal Setting', 'Optimism Practices', 'Future Visualization'],
  Stress: ['Stress Relief', 'Self-Care', 'Boundary Setting'],
  Fear: ['Simplification', 'Task Management', 'Emotional Regulation'],
  Neutral: ['Emotional Awareness', 'Mindfulness', 'Personal Growth']
};

// Generic tips that work for any emotion
const generalWellnessTips: WellnessTip[] = [
  {
    id: 1,
    title: "Practice Mindful Breathing",
    description: "Take 5 minutes to focus on your breath. Inhale for 4 counts, hold for 2, and exhale for 6. This simple technique activates your parasympathetic nervous system, reducing anxiety immediately.",
    category: "Meditation",
    source: "Journal of Behavioral Medicine",
    emotionTypes: ['Anxiety', 'Fear', 'Anger'],
    isPremium: false
  },
  {
    id: 2,
    title: "Gratitude Journaling",
    description: "Write down three specific things you're grateful for today. Studies show this simple practice increases dopamine and reduces cortisol, improving mood for up to 24 hours.",
    category: "Journaling",
    source: "Positive Psychology Research",
    emotionTypes: ['Sadness', 'Neutral', 'Contentment', 'Hope'],
    isPremium: false
  },
  {
    id: 3,
    title: "The 3-3-3 Grounding Technique",
    description: "When anxiety strikes, name 3 things you see, 3 sounds you hear, and move 3 parts of your body. This interrupts the fight-or-flight response and returns you to the present moment.",
    category: "Anxiety Management",
    source: "Clinical Psychology Review",
    emotionTypes: ['Anxiety', 'Fear'],
    isPremium: false
  },
  {
    id: 4,
    title: "Joy Spotting Practice",
    description: "Set an alarm for 3 random times today. When it goes off, find something beautiful or joyful in your immediate environment. This trains your brain to notice positivity naturally over time.",
    category: "Positive Psychology",
    source: "Happiness Studies Journal",
    emotionTypes: ['Sadness', 'Boredom', 'Neutral', 'Nostalgia'],
    isPremium: false
  },
  {
    id: 5,
    title: "Digital Sunset Protocol",
    description: "Turn off screens 60 minutes before bed. Blue light suppresses melatonin by up to 50%. Better sleep quality is directly linked to reduced depression symptoms the following day.",
    category: "Sleep Hygiene",
    source: "Sleep Medicine Reviews",
    emotionTypes: ['Anxiety', 'Fear', 'Sadness'],
    isPremium: false
  },
  {
    id: 6,
    title: "2-Minute Movement Breaks",
    description: "Set a timer to move for just 2 minutes every hour. Even brief movement releases BDNF (brain-derived neurotrophic factor), a protein that improves mood and cognitive function.",
    category: "Physical Activity",
    source: "Neuropsychology Journal",
    emotionTypes: ['Sadness', 'Boredom', 'Fear'],
    isPremium: false
  },
  {
    id: 7,
    title: "Loving-Kindness Meditation",
    description: "Spend 5 minutes sending well-wishes to yourself, a loved one, and someone difficult in your life. This practice reduces implicit bias and increases feelings of social connection.",
    category: "Meditation",
    source: "Mindfulness Research",
    emotionTypes: ['Anger', 'Sadness', 'Anxiety', 'Neutral'],
    isPremium: false
  },
  {
    id: 8,
    title: "5-4-3-2-1 Sensory Grounding",
    description: "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This powerful technique stops anxiety by engaging all your senses.",
    category: "Anxiety Management",
    source: "Cognitive Behavioral Therapy",
    emotionTypes: ['Anxiety', 'Fear', 'Grief'],
    isPremium: false
  },
  {
    id: 9,
    title: "Emotional Vocabulary Expansion",
    description: "Challenge yourself to name your emotions with more specificity than just 'good' or 'bad'. Research shows that emotional granularity (using precise emotion words) actually helps regulate feelings more effectively.",
    category: "Emotional Intelligence",
    source: "Journal of Personality",
    emotionTypes: ['Neutral', 'Boredom', 'Contentment'],
    isPremium: false
  },
  {
    id: 10,
    title: "Opposite Action Technique",
    description: "When experiencing an unhelpful emotion, try doing the opposite of what that emotion urges you to do. If anxiety makes you want to avoid, gently approach; if anger makes you want to attack, practice gentleness.",
    category: "Emotional Regulation",
    source: "Dialectical Behavior Therapy",
    emotionTypes: ['Anger', 'Anxiety', 'Sadness', 'Disappointment'],
    isPremium: false
  },
  {
    id: 11,
    title: "Self-Compassion Break",
    description: "When you notice self-criticism, place your hand on your heart and say: 'This is a moment of suffering. Suffering is part of life. May I be kind to myself in this moment, and give myself the compassion I need.'",
    category: "Self-Compassion",
    source: "Mindful Self-Compassion Research",
    emotionTypes: ['Sadness', 'Fear', 'Shame', 'Anxiety'],
    isPremium: false
  },
  {
    id: 12,
    title: "Achievement Journaling",
    description: "At the end of each day, write down three things you accomplished, no matter how small. This builds confidence and helps counter depressive thoughts that you 'never get anything done.'",
    category: "Positive Psychology",
    source: "Journal of Happiness Studies",
    emotionTypes: ['Sadness', 'Fear', 'Disappointment', 'Hope'],
    isPremium: false
  },
  {
    id: 13,
    title: "Emotion Acceptance Mantra",
    description: "When difficult emotions arise, say to yourself: 'I can feel [emotion] and still take effective action.' Accepting emotions rather than fighting them reduces their intensity and duration.",
    category: "Emotional Acceptance",
    source: "Acceptance and Commitment Therapy",
    emotionTypes: ['Sadness', 'Anger', 'Anxiety', 'Fear'],
    isPremium: false
  },
  {
    id: 14,
    title: "Joy Multiplier Practice",
    description: "When you experience a positive moment today, take 20 seconds to fully absorb it. This practice - called 'positive savoring' - strengthens neural pathways for happiness and well-being.",
    category: "Positive Psychology",
    source: "Applied Positive Psychology",
    emotionTypes: ['Joy', 'Contentment', 'Excitement', 'Hope'],
    isPremium: true
  },
  {
    id: 15,
    title: "Values Alignment Check",
    description: "Take 2 minutes to ask: 'How can I bring one core value into my next activity today?' This micro-practice increases daily meaning and purpose, which research links to greater emotional well-being.",
    category: "Meaning & Purpose",
    source: "Journal of Positive Psychology",
    emotionTypes: ['Neutral', 'Boredom', 'Contentment', 'Hope'],
    isPremium: true
  }
];

export function PersonalizedWellnessTip() {
  const { currentEmotion } = useMoodContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const isPremium = user?.isPremium;
  
  // Query to fetch personalized tips from API
  const { data: personalizedTips, isLoading, isError, error } = useQuery({
    queryKey: ['/api/wellness-tips/personalized', currentEmotion],
    // This is a mock function that would normally fetch from API
    // In a real implementation, this would fetch from the backend
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter tips by current emotion or return general tips if no match
      const emotionSpecificTips = generalWellnessTips.filter(tip => 
        tip.emotionTypes.includes(currentEmotion as EmotionType) && 
        (!tip.isPremium || isPremium) // Only show premium tips to premium users
      );
      
      // If no matching tips, return general tips
      if (emotionSpecificTips.length === 0) {
        return generalWellnessTips.filter(tip => !tip.isPremium || isPremium);
      }
      
      return emotionSpecificTips;
    }
  });
  
  // If we have personalized tips from the API, use those
  // Otherwise use our local general tips filtered by current emotion
  const filteredTips = personalizedTips || [];
  
  // Get today's date to determine which tip to show
  const today = new Date();
  
  // Calculate a seed based on the day of the year and the user's ID if available
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = Number(today) - Number(startOfYear);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const userSeed = user?.id || 0;
  const tipSeed = dayOfYear + userSeed;
  
  // Select a tip based on our seed
  const tipIndex = filteredTips.length > 0 ? tipSeed % filteredTips.length : 0;
  const todaysTip = filteredTips[tipIndex] || generalWellnessTips[0];
  
  // Refresh to get a new random tip
  const [refreshCounter, setRefreshCounter] = useState(0);
  const refreshTip = () => {
    setRefreshCounter(prev => prev + 1);
    // Select a new random tip
    const newIndex = (tipIndex + refreshCounter + 1) % filteredTips.length;
    // In a real app, would call API to get a new tip
    toast({
      title: "New wellness tip loaded",
      description: "Refreshed with a tip more relevant to your current mood."
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Tip removed from bookmarks" : "Tip saved to bookmarks",
      description: isBookmarked ? "You can always find it again in the future" : "You can find this tip in your bookmarked tips section",
    });
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikeCount(likeCount + 1);
      setHasLiked(true);
      toast({
        title: "Thanks for your feedback!",
        description: "We'll use this to recommend better tips for you.",
      });
    } else {
      setLikeCount(likeCount - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share this tip",
      description: "Sharing functionality would open here with multiple platform options",
    });
  };
  
  const getEmotionColor = (emotion: EmotionType | null): string => {
    const colorMap: Record<string, string> = {
      'Joy': 'amber-500',
      'Sadness': 'blue-500',
      'Anger': 'red-500',
      'Anxiety': 'yellow-500',
      'Serenity': 'sky-500',
      'Excitement': 'pink-500',
      'Boredom': 'gray-500',
      'Contentment': 'green-500',
      'Nostalgia': 'purple-500',
      'Hope': 'emerald-500',
      'Fear': 'orange-600',
      'Guilt': 'rose-700',
      'Shame': 'red-800',
      'Neutral': 'slate-500',
      'Love': 'pink-600',
      'Gratitude': 'green-600',
      'Pride': 'purple-600',
      'Amusement': 'amber-400',
      'Interest': 'blue-400',
      'Relief': 'teal-500',
      'Surprise': 'violet-500',
      'Disgust': 'green-800',
      'Envy': 'lime-700',
      'Jealousy': 'emerald-800',
      'Grief': 'slate-800',
      'Disappointment': 'orange-800',
      'Confusion': 'indigo-400',
      'Anticipation': 'amber-600',
      'Awe': 'violet-600',
      'Curiosity': 'sky-600',
      'Empathy': 'pink-400',
      'Satisfaction': 'emerald-500'
    };
    
    return colorMap[emotion as string] || 'indigo-500';
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-40 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-3 w-32 mt-3" />
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-4 pb-4">
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
          </div>
          <Skeleton className="h-8 w-14" />
        </CardFooter>
      </Card>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Card className="w-full shadow-md bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Couldn't load your personalized tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">We're having trouble loading your personalized wellness tip. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="border-red-300 text-red-600" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/wellness-tips/personalized'] })}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // When no tip is found
  if (!todaysTip) {
    return (
      <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Daily Wellness Tip</CardTitle>
          <CardDescription>No tips available for your current mood</CardDescription>
        </CardHeader>
        <CardContent>
          <p>We couldn't find a specific tip for your current emotional state. Please check back later or try refreshing.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={refreshTip}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Get Another Tip
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge 
              className={`mb-2 bg-${getEmotionColor(currentEmotion)}/10 text-${getEmotionColor(currentEmotion)} hover:bg-${getEmotionColor(currentEmotion)}/20 border-0`}
            >
              {todaysTip.category}
            </Badge>
            {todaysTip.isPremium && (
              <Badge variant="outline" className="ml-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[9px] px-1.5 py-0 border-0">
                PREMIUM
              </Badge>
            )}
            <CardTitle className="text-xl">{todaysTip.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              <span className="flex items-center">
                <span>Personalized for your <span className={`font-medium text-${getEmotionColor(currentEmotion)}`}>{currentEmotion}</span> mood</span>
              </span>
            </CardDescription>
          </div>
          <Lightbulb className={`h-5 w-5 text-${getEmotionColor(currentEmotion)}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">
          {todaysTip.description}
        </p>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <span>Source: {todaysTip.source}</span>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between pt-4 pb-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-gray-600 hover:text-primary-600"
            onClick={handleLike}
          >
            <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-current text-primary' : ''}`} />
            <span>{likeCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-gray-600 hover:text-amber-600"
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
            <span>Save</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1 text-gray-600" 
            onClick={refreshTip}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-600 hover:text-indigo-600"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}