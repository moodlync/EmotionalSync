import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  LucideGamepad2, 
  TrendingUp, 
  Sparkles,
  Brain,
  Flame,
  HeartPulse,
  Focus,
  Dumbbell,
  Clock,
  Star,
  QuoteIcon,
  Lightbulb
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Import game components 
import MemoryMatchGame from "@/components/games/memory-match-game";
import BreathingFocusGame from "@/components/games/breathing-focus-game";
import PositiveAffirmationGame from "@/components/games/positive-affirmation-game";
import MoodTrendAnalyzer from "@/components/games/mood-trend-analyzer";
import DailyPositivityCard from "@/components/positivity/daily-positivity-card";

// Game structure definition
type GameCategory = 'focus' | 'memory' | 'breathing' | 'positive_affirmation';

interface Game {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  tokenReward: number;
  isPremium: boolean;
  icon: React.ReactNode;
  duration: string;
  popularityScore: number;
  component: React.ComponentType<any>;
}

// Leaderboard entry type
interface LeaderboardEntry {
  id: number;
  username: string;
  avatarUrl?: string;
  score: number;
  gameId: string;
  date: Date;
  badges: string[];
}

// Mock games data
const GAMES: Game[] = [
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Test and improve your memory by matching pairs of cards.',
    category: 'memory',
    difficulty: 'medium',
    tokenReward: 10,
    isPremium: false,
    icon: <Flame className="w-5 h-5" />,
    duration: '5-10 min',
    popularityScore: 92,
    component: MemoryMatchGame
  },
  {
    id: 'breathing-focus',
    title: 'Breathing Focus',
    description: 'Guided breathing exercise to reduce anxiety and increase mindfulness.',
    category: 'breathing',
    difficulty: 'easy',
    tokenReward: 8,
    isPremium: false,
    icon: <Brain className="w-5 h-5" />,
    duration: '3-5 min',
    popularityScore: 88,
    component: BreathingFocusGame
  },
  {
    id: 'positive-affirmation',
    title: 'Positive Affirmations',
    description: 'Build mental resilience through powerful positive statements.',
    category: 'positive_affirmation',
    difficulty: 'easy',
    tokenReward: 5,
    isPremium: false,
    icon: <Sparkles className="w-5 h-5" />,
    duration: '5 min',
    popularityScore: 85,
    component: PositiveAffirmationGame
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow',
    description: 'Enhance concentration through guided attention exercises.',
    category: 'focus',
    difficulty: 'medium',
    tokenReward: 12,
    isPremium: true,
    icon: <Focus className="w-5 h-5" />,
    duration: '8-12 min',
    popularityScore: 90,
    component: BreathingFocusGame // Placeholder for now
  }
];

// Mock leaderboard data
const LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 1,
    username: 'EmotionMaster',
    score: 950,
    gameId: 'memory-match',
    date: new Date('2025-04-29'),
    badges: ['streak-30', 'memory-expert']
  },
  {
    id: 2,
    username: 'MindfulJourney',
    score: 875,
    gameId: 'breathing-focus',
    date: new Date('2025-04-29'),
    badges: ['zen-master']
  },
  {
    id: 3,
    username: 'PositiveVibes',
    score: 820,
    gameId: 'positive-affirmation',
    date: new Date('2025-04-28'),
    badges: ['streaker-7']
  },
  {
    id: 4,
    username: 'BrainTrainer',
    score: 795,
    gameId: 'focus-flow',
    date: new Date('2025-04-27'),
    badges: ['premium-member']
  },
  {
    id: 5,
    username: 'CalmSeeker',
    score: 780,
    gameId: 'breathing-focus',
    date: new Date('2025-04-29'),
    badges: []
  }
];

// Badge translations
const BADGE_INFO: Record<string, { label: string, icon: React.ReactNode }> = {
  'streak-30': { label: '30-Day Streak', icon: <Flame className="h-3 w-3" /> },
  'memory-expert': { label: 'Memory Expert', icon: <Brain className="h-3 w-3" /> },
  'zen-master': { label: 'Zen Master', icon: <HeartPulse className="h-3 w-3" /> },
  'streaker-7': { label: '7-Day Streak', icon: <Dumbbell className="h-3 w-3" /> },
  'premium-member': { label: 'Premium Member', icon: <Star className="h-3 w-3" /> }
};

export default function MoodGamesPage() {
  const [activeTab, setActiveTab] = useState('games');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch user's token balance
  const { data: tokenBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/tokens'],
    queryFn: () => {
      // Mock implementation - in a real app, this would be an API call
      return Promise.resolve(150);
    },
  });
  
  const handleGameCompletion = (score: number) => {
    // Close the game modal
    setIsGameModalOpen(false);
    
    // Find the token reward
    const reward = selectedGame?.tokenReward || 0;
    
    // Notify user of completion
    toast({
      title: "Game Completed!",
      description: `You scored ${score} points and earned ${reward} emotion tokens!`,
    });
    
    // In a real app, we would persist this data to the backend
    console.log(`Game completed: ${selectedGame?.title}, Score: ${score}, Reward: ${reward}`);
  };
  
  const handleStartGame = (game: Game) => {
    if (game.isPremium) {
      // Check if user has premium subscription
      const hasPremium = false; // In a real app, this would be fetched from user data
      
      if (!hasPremium) {
        toast({
          title: "Premium Game",
          description: "This game requires a premium subscription. Upgrade to access all premium content.",
          variant: "destructive",
        });
        
        // Redirect to premium page
        navigate("/premium");
        return;
      }
    }
    
    // Set the selected game and open the modal
    setSelectedGame(game);
    setIsGameModalOpen(true);
  };
  
  // Render game category badge with appropriate colors
  const renderCategoryBadge = (category: GameCategory) => {
    let color = '';
    let icon = null;
    
    switch (category) {
      case 'focus':
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        icon = <Focus className="h-3 w-3 mr-1" />;
        break;
      case 'memory':
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        icon = <Brain className="h-3 w-3 mr-1" />;
        break;
      case 'breathing':
        color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        icon = <HeartPulse className="h-3 w-3 mr-1" />;
        break;
      case 'positive_affirmation':
        color = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        icon = <Sparkles className="h-3 w-3 mr-1" />;
        break;
    }
    
    return (
      <Badge variant="outline" className={`${color} flex items-center capitalize`}>
        {icon}
        {category.replace('_', ' ')}
      </Badge>
    );
  };
  
  return (
    <div className="container max-w-screen-xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mood Games</h1>
        <p className="text-muted-foreground">
          Play games that enhance your emotional resilience and mindfulness while earning tokens
        </p>
      </div>
      
      <Tabs 
        defaultValue="games" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="games" className="flex items-center space-x-2">
            <LucideGamepad2 className="h-4 w-4" />
            <span>Games</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Flame className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="positivity" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Positivity</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Games Collection</h2>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your token balance: <strong>{tokenBalance}</strong></span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {GAMES.map(game => (
              <Card key={game.id} className={`overflow-hidden transition-all hover:shadow-md ${
                game.isPremium ? 'border-amber-200 dark:border-amber-800' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    {renderCategoryBadge(game.category)}
                    {game.isPremium && (
                      <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-yellow-500">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="p-2 rounded-full bg-primary/10">{game.icon}</div>
                    <CardTitle>{game.title}</CardTitle>
                  </div>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{game.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{game.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{game.popularityScore}%</span>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-3">
                  <Button variant="default" className="w-full" onClick={() => handleStartGame(game)}>
                    Play ({game.tokenReward} tokens reward)
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Global Leaderboard</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Updated: Today, 10:45 AM</span>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Players with the highest scores across all games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {LEADERBOARD.map((entry, index) => {
                  const game = GAMES.find(g => g.id === entry.gameId);
                  
                  return (
                    <div 
                      key={entry.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50' : 
                        index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50' : 
                        'bg-background'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-200 text-yellow-800' : 
                          index === 1 ? 'bg-gray-200 text-gray-800' : 
                          index === 2 ? 'bg-orange-200 text-orange-800' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <div className="font-medium">{entry.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            {game?.icon} 
                            <span className="ml-1">{game?.title}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">{entry.score} pts</div>
                        <div className="flex space-x-1 mt-1 justify-end">
                          {entry.badges.map(badge => (
                            <Badge 
                              key={badge} 
                              variant="outline" 
                              className="flex items-center text-xs py-0 h-5"
                            >
                              {BADGE_INFO[badge]?.icon}
                              <span className="ml-1">{BADGE_INFO[badge]?.label}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Memory Match Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {LEADERBOARD
                    .filter(entry => entry.gameId === 'memory-match')
                    .map((entry, index) => (
                      <div key={entry.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="w-6 font-medium">{index + 1}.</span>
                          <span>{entry.username}</span>
                        </div>
                        <span className="font-medium">{entry.score}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Games Played</span>
                      <span>24</span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Tokens Earned</span>
                      <span>150</span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Current Streak</span>
                      <span>5 days</span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mood Analysis</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Find patterns in your emotional data</span>
            </div>
          </div>
          
          <MoodTrendAnalyzer />
        </TabsContent>
        
        {/* Positivity Tab */}
        <TabsContent value="positivity" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Daily Positivity</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Build your mental resilience</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DailyPositivityCard category="quote" />
            <DailyPositivityCard category="affirmation" />
            <DailyPositivityCard category="tip" />
          </div>
          
          <h3 className="text-xl font-semibold mt-8">Exercises for Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DailyPositivityCard category="exercise" />
            <Card>
              <CardHeader>
                <CardTitle>Your Positivity Collection</CardTitle>
                <CardDescription>
                  Content you've saved for later reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] pr-4">
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <QuoteIcon className="h-3 w-3 mr-1" />
                          Quote
                        </Badge>
                        <span className="text-xs text-muted-foreground">Saved 3 days ago</span>
                      </div>
                      <p className="text-sm italic">"The greatest glory in living lies not in never falling, but in rising every time we fall."</p>
                      <p className="text-xs text-muted-foreground mt-1">— Nelson Mandela</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          <Star className="h-3 w-3 mr-1" />
                          Affirmation
                        </Badge>
                        <span className="text-xs text-muted-foreground">Saved 1 day ago</span>
                      </div>
                      <p className="text-sm">"I am worthy of love and respect exactly as I am."</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Tip
                        </Badge>
                        <span className="text-xs text-muted-foreground">Saved today</span>
                      </div>
                      <p className="text-sm">When feeling overwhelmed, take five minutes to step away from what you're doing.</p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Game Dialog */}
      <Dialog open={isGameModalOpen} onOpenChange={setIsGameModalOpen}>
        <DialogContent className="max-w-4xl h-[calc(100vh-80px)] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>{selectedGame?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow px-6">
            {selectedGame && (
              <div className="py-4">
                <selectedGame.component onComplete={handleGameCompletion} />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}