import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Book, Heart, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EmotionStory } from "@shared/emotion-story-schema";

export default function EmotionStoriesPage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Get all public stories and the user's stories
  const { data: stories, isLoading, error } = useQuery<EmotionStory[]>({
    queryKey: ["/api/emotion-stories"],
  });
  
  // Get only the user's stories
  const { data: myStories, isLoading: myStoriesLoading } = useQuery<EmotionStory[]>({
    queryKey: ["/api/emotion-stories/my"],
  });
  
  // Function to get emotion color
  const getEmotionColor = (emotion: string | undefined) => {
    if (!emotion) return "bg-gray-200";
    
    const emotions: Record<string, string> = {
      happy: "bg-yellow-200",
      sad: "bg-blue-200",
      angry: "bg-red-200",
      anxious: "bg-purple-200",
      excited: "bg-pink-200",
      neutral: "bg-gray-200",
      fear: "bg-indigo-200",
      love: "bg-rose-200",
      surprise: "bg-emerald-200",
      disgust: "bg-lime-200"
    };
    
    return emotions[emotion.toLowerCase()] || "bg-gray-200";
  };

  const renderStoryCard = (story: EmotionStory) => {
    // Get start emotion from emotionalArc if available
    const startEmotion = story.emotionalArc?.start;
    
    return (
      <Card key={story.id} className="h-full flex flex-col">
        <CardHeader className={`${getEmotionColor(startEmotion)} rounded-t-lg`}>
          <CardTitle className="line-clamp-2">{story.title}</CardTitle>
          <CardDescription>
            {format(new Date(story.created), 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow py-4">
          <p className="text-sm line-clamp-3">
            {story.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {story.tags && story.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3 flex justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/emotion-stories/${story.id}`}>View Story</Link>
          </Button>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center text-xs">
              <Heart size={14} className="mr-1" />
              {/* Placeholder for reaction count */}
              0
            </span>
            <span className="flex items-center text-xs">
              <MessageCircle size={14} className="mr-1" />
              {/* Placeholder for comment count */}
              0
            </span>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emotion Stories</h1>
          <p className="text-muted-foreground mt-1">
            Share your emotional journey through interactive stories
          </p>
        </div>
        <Button asChild>
          <Link to="/emotion-stories/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Story
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Stories</TabsTrigger>
          <TabsTrigger value="my">My Stories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-[250px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                    <Skeleton className="h-4 w-4/6 mt-2" />
                    <div className="flex gap-1 mt-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <Book className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg">Error Loading Stories</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                We encountered an error while loading emotion stories.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map(renderStoryCard)}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <Book className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg">No Stories Found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Be the first to share your emotional journey!
              </p>
              <Button asChild>
                <Link to="/emotion-stories/create">Create Story</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my" className="mt-0">
          {myStoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[250px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                    <Skeleton className="h-4 w-4/6 mt-2" />
                    <div className="flex gap-1 mt-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myStories && myStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myStories.map(renderStoryCard)}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <Book className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg">You Haven't Created Any Stories Yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Create your first emotional journey story to share with others.
              </p>
              <Button asChild>
                <Link to="/emotion-stories/create">Create My First Story</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}