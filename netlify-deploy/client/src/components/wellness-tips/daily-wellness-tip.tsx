import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, ThumbsUp, Bookmark, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Array of wellness tips for mental health improvement
const wellnessTips = [
  {
    id: 1,
    title: "Practice Mindful Breathing",
    description: "Take 5 minutes to focus on your breath. Inhale for 4 counts, hold for 2, and exhale for 6. This simple technique activates your parasympathetic nervous system, reducing anxiety immediately.",
    category: "Meditation",
    source: "Journal of Behavioral Medicine"
  },
  {
    id: 2,
    title: "Gratitude Journaling",
    description: "Write down three specific things you're grateful for today. Studies show this simple practice increases dopamine and reduces cortisol, improving mood for up to 24 hours.",
    category: "Journaling",
    source: "Positive Psychology Research"
  },
  {
    id: 3,
    title: "The 3-3-3 Grounding Technique",
    description: "When anxiety strikes, name 3 things you see, 3 sounds you hear, and move 3 parts of your body. This interrupts the fight-or-flight response and returns you to the present moment.",
    category: "Anxiety Management",
    source: "Clinical Psychology Review"
  },
  {
    id: 4,
    title: "Joy Spotting Practice",
    description: "Set an alarm for 3 random times today. When it goes off, find something beautiful or joyful in your immediate environment. This trains your brain to notice positivity naturally over time.",
    category: "Positive Psychology",
    source: "Happiness Studies Journal"
  },
  {
    id: 5,
    title: "Digital Sunset Protocol",
    description: "Turn off screens 60 minutes before bed. Blue light suppresses melatonin by up to 50%. Better sleep quality is directly linked to reduced depression symptoms the following day.",
    category: "Sleep Hygiene",
    source: "Sleep Medicine Reviews"
  },
  {
    id: 6,
    title: "2-Minute Movement Breaks",
    description: "Set a timer to move for just 2 minutes every hour. Even brief movement releases BDNF (brain-derived neurotrophic factor), a protein that improves mood and cognitive function.",
    category: "Physical Activity",
    source: "Neuropsychology Journal"
  },
  {
    id: 7,
    title: "Loving-Kindness Meditation",
    description: "Spend 5 minutes sending well-wishes to yourself, a loved one, and someone difficult in your life. This practice reduces implicit bias and increases feelings of social connection.",
    category: "Meditation",
    source: "Mindfulness Research"
  }
];

export function DailyWellnessTip() {
  // Get today's date to determine which tip to show
  const today = new Date();
  
  // Calculate the day of the year (1-366)
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = Number(today) - Number(startOfYear);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Use the day of year to select a tip, ensuring it rotates through the available tips
  const tipIndex = dayOfYear % wellnessTips.length;
  const todaysTip = wellnessTips[tipIndex];
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const { toast } = useToast();

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

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-0">
              {todaysTip.category}
            </Badge>
            <CardTitle className="text-xl">{todaysTip.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Daily tip for {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </CardDescription>
          </div>
          <Sparkles className="h-5 w-5 text-amber-500" />
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