import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Gamepad2 as GameController,
  Sparkles,
  Brain,
  Flame,
  Heart,
  Lock,
  AlertTriangle,
  Trophy,
  ArrowRight,
  Coins,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for game data
interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  tokensReward: number;
  tokensCost: number;
  completionTime: string;
  moodBenefits: string[];
  levels: number;
  completedLevels?: number;
}

// Game data
const gamesData: Game[] = [
  {
    id: 'mindful-maze',
    title: 'Mindful Maze',
    description: 'Navigate through calming mazes while practicing mindfulness techniques',
    icon: <Brain className="h-5 w-5" />,
    difficulty: 'easy',
    tokensReward: 1,
    tokensCost: 15,
    completionTime: '5-10 min',
    moodBenefits: ['Stress reduction', 'Improved focus', 'Anxiety relief'],
    levels: 20,
    completedLevels: 4
  },
  {
    id: 'emotion-match',
    title: 'Emotion Match',
    description: 'Match emotions to scenarios to strengthen emotional intelligence',
    icon: <Heart className="h-5 w-5" />,
    difficulty: 'moderate',
    tokensReward: 2,
    tokensCost: 16,
    completionTime: '7-12 min',
    moodBenefits: ['Emotional awareness', 'Empathy development', 'Mood regulation'],
    levels: 15,
    completedLevels: 2
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow',
    description: 'Challenging concentration exercises that improve mental clarity',
    icon: <Flame className="h-5 w-5" />,
    difficulty: 'hard',
    tokensReward: 3,
    tokensCost: 17,
    completionTime: '10-15 min',
    moodBenefits: ['Enhanced concentration', 'Mental resilience', 'Cognitive improvement'],
    levels: 12
  },
  {
    id: 'tranquil-towers',
    title: 'Tranquil Towers',
    description: 'Build balanced towers while maintaining breathing patterns',
    icon: <Sparkles className="h-5 w-5" />,
    difficulty: 'extreme',
    tokensReward: 5,
    tokensCost: 20,
    completionTime: '12-20 min',
    moodBenefits: ['Deep relaxation', 'Stress management', 'Emotional balance', 'Improved patience'],
    levels: 10
  }
];

// Helper function to get color based on difficulty
const getDifficultyColor = (difficulty: Game['difficulty']) => {
  switch(difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'hard':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'extreme':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function MoodSwingerSection() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const hasEligiblePlan = isPremium; // In a real app, check for yearly/lifetime plan
  const [activeTab, setActiveTab] = useState('all');
  const availableTokens = user?.emotionTokens || 0;
  
  // Demo function to handle playing a game
  const handlePlayGame = (gameId: string) => {
    console.log(`Playing game: ${gameId}`);
    // In a real app, navigate to the game or start the game
  };
  
  // Demo function to handle using tokens to complete a level
  const handleUseTokens = (game: Game) => {
    console.log(`Using ${game.tokensCost} tokens to complete a level in ${game.title}`);
    // In a real app, this would deduct tokens and mark the level as complete
  };

  // Filter games based on active tab
  const filteredGames = activeTab === 'all' 
    ? gamesData 
    : gamesData.filter(game => game.difficulty === activeTab);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white border-0">
          Premium Feature
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-transparent bg-clip-text">
          Mood Swinger Games
        </h2>
        
        <p className="text-gray-600 max-w-3xl mx-auto mb-4">
          Play engaging games designed to calm your mind, improve your mood, and enhance your emotional wellbeing. 
          Earn tokens as you complete levels and challenges.
        </p>
        
        {!hasEligiblePlan && (
          <Alert className="max-w-2xl mx-auto border-amber-200 bg-amber-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Mood Swinger Games are exclusively available for premium members with yearly, lifetime, or family plans.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center bg-green-50 border border-green-100 rounded-full px-4 py-2">
            <Coins className="text-green-600 h-4 w-4 mr-2" />
            <span className="text-sm font-medium text-green-700">Tokens: {availableTokens}</span>
          </div>
          
          <div className="flex items-center bg-purple-50 border border-purple-100 rounded-full px-4 py-2">
            <Trophy className="text-purple-600 h-4 w-4 mr-2" />
            <span className="text-sm font-medium text-purple-700">
              Games Completed: {gamesData.filter(g => g.completedLevels).length} / {gamesData.length}
            </span>
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full mb-8"
      >
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-5 gap-1">
            <TabsTrigger value="all">
              All Games
            </TabsTrigger>
            <TabsTrigger value="easy">
              Easy
            </TabsTrigger>
            <TabsTrigger value="moderate">
              Moderate
            </TabsTrigger>
            <TabsTrigger value="hard">
              Hard
            </TabsTrigger>
            <TabsTrigger value="extreme">
              Extreme
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredGames.map(game => (
              <Card key={game.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("font-normal", getDifficultyColor(game.difficulty))}>
                      {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {game.completionTime}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2 mt-2">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary">
                      {game.icon}
                    </div>
                    {game.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {game.completedLevels || 0} / {game.levels} levels
                      </span>
                    </div>
                    <Progress 
                      value={(game.completedLevels || 0) / game.levels * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <span className="text-sm font-medium">Mood Benefits:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {game.moodBenefits.map((benefit, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100"
                        >
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-center border rounded-md py-2 bg-green-50 text-green-700">
                      <Coins className="h-4 w-4 mr-1.5" />
                      <span>Earn: {game.tokensReward} tokens/level</span>
                    </div>
                    <div className="flex items-center justify-center border rounded-md py-2 bg-amber-50 text-amber-700">
                      <Coins className="h-4 w-4 mr-1.5" />
                      <span>Skip: {game.tokensCost} tokens/level</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex gap-2 pt-0">
                  <Button 
                    onClick={() => handlePlayGame(game.id)}
                    className="flex-1"
                    disabled={!hasEligiblePlan}
                  >
                    <GameController className="h-4 w-4 mr-2" />
                    Play Game
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleUseTokens(game)}
                    disabled={!hasEligiblePlan || availableTokens < game.tokensCost}
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Use Tokens
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-8">
        <h3 className="text-xl font-semibold mb-4">Token Rewards & Requirements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700 text-lg">Easy Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800">
                <div className="flex justify-between mb-1">
                  <span>Earn:</span>
                  <span className="font-medium">1 token/level</span>
                </div>
                <div className="flex justify-between">
                  <span>Skip cost:</span>
                  <span className="font-medium">15 tokens/level</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-700 text-lg">Moderate Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-800">
                <div className="flex justify-between mb-1">
                  <span>Earn:</span>
                  <span className="font-medium">2 tokens/level</span>
                </div>
                <div className="flex justify-between">
                  <span>Skip cost:</span>
                  <span className="font-medium">16 tokens/level</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-700 text-lg">Hard Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-orange-800">
                <div className="flex justify-between mb-1">
                  <span>Earn:</span>
                  <span className="font-medium">3 tokens/level</span>
                </div>
                <div className="flex justify-between">
                  <span>Skip cost:</span>
                  <span className="font-medium">17 tokens/level</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 text-lg">Extreme Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-800">
                <div className="flex justify-between mb-1">
                  <span>Earn:</span>
                  <span className="font-medium">5 tokens/level</span>
                </div>
                <div className="flex justify-between">
                  <span>Skip cost:</span>
                  <span className="font-medium">20 tokens/level</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Alert className="mt-8 border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800 text-sm">
          <strong>Note:</strong> These games are designed to help improve your mental wellbeing. 
          They contain no violence, negativity, or harmful content. Tokens earned can only be used within the app
          and cannot be purchased with real money.
        </AlertDescription>
      </Alert>
    </div>
  );
}