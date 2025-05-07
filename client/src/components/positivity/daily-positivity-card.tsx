import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookHeartIcon, 
  Quote, 
  Sparkles, 
  Star, 
  Lightbulb, 
  BookOpen, 
  ArrowRight, 
  Bookmark, 
  RefreshCcw 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PositivityContent, 
  getRandomContentForEmotion, 
  getRandomContentByCategory,
  PositivityContentCategory,
  POSITIVITY_QUOTES,
  POSITIVITY_AFFIRMATIONS,
  POSITIVITY_TIPS,
  POSITIVITY_EXERCISES
} from "@/lib/positivity-content";
import { type EmotionType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface DailyPositivityCardProps {
  emotion?: EmotionType;
  category?: PositivityContentCategory;
  defaultContent?: PositivityContent;
  onSave?: (content: PositivityContent) => void;
}

const getCategoryIcon = (category: PositivityContentCategory) => {
  switch (category) {
    case 'quote': return <Quote className="h-5 w-5" />;
    case 'affirmation': return <Star className="h-5 w-5" />;
    case 'tip': return <Lightbulb className="h-5 w-5" />;
    case 'exercise': return <BookOpen className="h-5 w-5" />;
    default: return <Sparkles className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: PositivityContentCategory) => {
  switch (category) {
    case 'quote': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'affirmation': return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    case 'tip': return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'exercise': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

export default function DailyPositivityCard({ 
  emotion, 
  category, 
  defaultContent,
  onSave
}: DailyPositivityCardProps) {
  const [content, setContent] = useState<PositivityContent | null>(defaultContent || null);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  
  // Get current emotion - in a real app, this would come from the user's state
  const { data: currentEmotion } = useQuery<EmotionType>({
    queryKey: ['/api/user/current-emotion'],
    queryFn: () => {
      // Mock implementation
      return Promise.resolve(emotion || 'anxious');
    },
  });
  
  // Load saved items from local storage
  useEffect(() => {
    const saved = localStorage.getItem('savedPositivityItems');
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
  }, []);
  
  // Get initial content if not provided
  useEffect(() => {
    if (!content) {
      if (category) {
        setContent(getRandomContentByCategory(category));
      } else if (currentEmotion) {
        setContent(getRandomContentForEmotion(currentEmotion));
      }
    }
  }, [category, currentEmotion, content]);
  
  // Function to get new content
  const refreshContent = () => {
    if (category) {
      setContent(getRandomContentByCategory(category));
    } else if (currentEmotion) {
      setContent(getRandomContentForEmotion(currentEmotion));
    }
  };
  
  // Function to save content to user favorites
  const saveContent = () => {
    if (content) {
      const newSavedItems = [...savedItems, content.id];
      setSavedItems(newSavedItems);
      localStorage.setItem('savedPositivityItems', JSON.stringify(newSavedItems));
      
      if (onSave) {
        onSave(content);
      }
    }
  };
  
  if (!content) {
    return (
      <Card className="w-full h-60 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`px-2 py-1 ${getCategoryColor(content.category)}`}>
            {getCategoryIcon(content.category)}
            <span className="ml-1 capitalize">{content.category}</span>
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshContent}
            title="Get new content"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-xl">{content.title}</CardTitle>
        <CardDescription>
          {content.forEmotions.map(emotion => (
            <Badge key={emotion} variant="secondary" className="mr-1 capitalize">
              {emotion}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {content.content}
          </p>
          {content.source && (
            <p className="text-sm text-muted-foreground italic">
              — {content.source}
            </p>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="py-3 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={saveContent}
          disabled={savedItems.includes(content.id)}
        >
          {savedItems.includes(content.id) ? (
            <>
              <BookHeartIcon className="h-4 w-4 mr-1" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 mr-1" />
              Save to favorites
            </>
          )}
        </Button>
        
        {content.category === 'exercise' && (
          <Button variant="secondary" size="sm" className="text-xs">
            Try exercise
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}