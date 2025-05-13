import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeDifficulty } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Flame, Award, Medal, Star, Check, Trophy, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: ChallengeDifficulty;
  targetValue: number;
  currentValue: number;
  rewardTokens: number;
  completed: boolean;
}

function getProgressPercentage(current: number, target: number): number {
  if (target === 0) return 100;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  switch (difficulty) {
    case 'easy': return 'Easy';
    case 'moderate': return 'Moderate';
    case 'hard': return 'Hard';
    case 'extreme': return 'Extreme';
    default: return difficulty;
  }
}

function getDifficultyColor(difficulty: ChallengeDifficulty): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-300';
    case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'hard': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'extreme': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getDifficultyIcon(difficulty: ChallengeDifficulty) {
  switch (difficulty) {
    case 'easy': return <Award className="h-5 w-5 text-green-600" />;
    case 'moderate': return <Medal className="h-5 w-5 text-blue-600" />;
    case 'hard': return <Trophy className="h-5 w-5 text-purple-600" />;
    case 'extreme': return <Star className="h-5 w-5 text-red-600" />;
    default: return <Flame className="h-5 w-5 text-gray-600" />;
  }
}

export default function ChallengeList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | ChallengeDifficulty>('all');
  
  // Fetch challenges
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/gamification/challenges'],
    queryFn: async () => {
      const res = await fetch('/api/gamification/challenges');
      if (!res.ok) throw new Error('Failed to fetch challenges');
      return res.json();
    },
  });
  
  // Mutation to complete a challenge
  const completeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await fetch(`/api/challenges/complete/${challengeId}`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to complete challenge');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Show a success toast
      toast({
        title: "Challenge Completed!",
        description: `You earned ${data.tokensAwarded} tokens`,
        variant: "default",
      });
      
      // If a badge was awarded, show another toast
      if (data.badgeAwarded) {
        toast({
          title: "New Badge Earned!",
          description: `You've earned the "${data.badgeAwarded.name}" badge`,
          variant: "default",
        });
      }
      
      // Update challenges data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
      
      // Update token balance
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      
      // Update user badges
      queryClient.invalidateQueries({ queryKey: ['/api/user/badges'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter challenges based on selected difficulty
  const filterChallenges = (): Challenge[] => {
    if (!challenges) return [];
    
    if (selectedDifficulty === 'all') {
      return challenges;
    }
    
    return challenges.filter(challenge => challenge.difficulty === selectedDifficulty);
  };
  
  // Group challenges by difficulty
  const getChallengesByDifficulty = (): Record<ChallengeDifficulty, Challenge[]> => {
    const grouped: Record<ChallengeDifficulty, Challenge[]> = {
      easy: [],
      moderate: [],
      hard: [],
      extreme: []
    };
    
    if (!challenges) return grouped;
    
    challenges.forEach(challenge => {
      grouped[challenge.difficulty].push(challenge);
    });
    
    return grouped;
  };
  
  const handleCompleteChallenge = (challengeId: string) => {
    completeMutation.mutate(challengeId);
  };
  
  const groupedChallenges = getChallengesByDifficulty();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Challenges
        </CardTitle>
        <CardDescription>
          Complete challenges to earn tokens and badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedDifficulty('all')}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="easy" 
                onClick={() => setSelectedDifficulty('easy')}
                className="text-green-700"
              >
                Easy
              </TabsTrigger>
              <TabsTrigger 
                value="moderate" 
                onClick={() => setSelectedDifficulty('moderate')}
                className="text-blue-700"
              >
                Medium
              </TabsTrigger>
              <TabsTrigger 
                value="hard" 
                onClick={() => setSelectedDifficulty('hard')}
                className="text-purple-700"
              >
                Hard
              </TabsTrigger>
              <TabsTrigger 
                value="extreme" 
                onClick={() => setSelectedDifficulty('extreme')}
                className="text-red-700"
              >
                Extreme
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {/* Display challenges from all difficulties */}
              {Object.entries(groupedChallenges).map(([difficulty, diffChallenges]) => (
                diffChallenges.length > 0 && (
                  <div key={difficulty} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {getDifficultyIcon(difficulty as ChallengeDifficulty)}
                      {getDifficultyLabel(difficulty as ChallengeDifficulty)} Challenges
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {diffChallenges.map(challenge => (
                        <div 
                          key={challenge.id} 
                          className={`border rounded-lg p-4 ${challenge.completed ? 'bg-green-50 border-green-200' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                              {getDifficultyLabel(challenge.difficulty)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {challenge.currentValue}/{challenge.targetValue}</span>
                              <span className="font-medium text-primary">{challenge.rewardTokens} tokens</span>
                            </div>
                            <Progress value={getProgressPercentage(challenge.currentValue, challenge.targetValue)} />
                            
                            {challenge.completed ? (
                              <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                                <Check className="mr-2 h-4 w-4" />
                                Completed
                              </Button>
                            ) : (
                              <Button 
                                disabled={completeMutation.isPending || challenge.currentValue < challenge.targetValue} 
                                onClick={() => handleCompleteChallenge(challenge.id)}
                                className="w-full"
                              >
                                {completeMutation.isPending ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Processing...
                                  </div>
                                ) : (
                                  <>
                                    {challenge.currentValue >= challenge.targetValue ? (
                                      <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Claim Reward
                                      </>
                                    ) : (
                                      <>
                                        In Progress
                                      </>
                                    )}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </TabsContent>
            
            {/* Individual tabs for each difficulty */}
            {(['easy', 'moderate', 'hard', 'extreme'] as const).map(difficulty => (
              <TabsContent key={difficulty} value={difficulty} className="space-y-4">
                {groupedChallenges[difficulty].length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {groupedChallenges[difficulty].map(challenge => (
                      <div 
                        key={challenge.id} 
                        className={`border rounded-lg p-4 ${challenge.completed ? 'bg-green-50 border-green-200' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{challenge.title}</h4>
                          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                            {getDifficultyLabel(challenge.difficulty)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {challenge.currentValue}/{challenge.targetValue}</span>
                            <span className="font-medium text-primary">{challenge.rewardTokens} tokens</span>
                          </div>
                          <Progress value={getProgressPercentage(challenge.currentValue, challenge.targetValue)} />
                          
                          {challenge.completed ? (
                            <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                              <Check className="mr-2 h-4 w-4" />
                              Completed
                            </Button>
                          ) : (
                            <Button 
                              disabled={completeMutation.isPending || challenge.currentValue < challenge.targetValue} 
                              onClick={() => handleCompleteChallenge(challenge.id)}
                              className="w-full"
                            >
                              {completeMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  {challenge.currentValue >= challenge.targetValue ? (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Claim Reward
                                    </>
                                  ) : (
                                    <>
                                      In Progress
                                    </>
                                  )}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Flame className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No challenges available for this difficulty</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}