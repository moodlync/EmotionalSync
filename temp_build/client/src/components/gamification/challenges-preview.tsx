import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Gift } from 'lucide-react';
import { Challenge } from '@/types/gamification-types';
import { useGamification } from '@/hooks/use-gamification';
import { useToast } from '@/hooks/use-toast';

interface ChallengesPreviewProps {
  className?: string;
  limit?: number;
  onViewAll?: () => void;
}

export default function ChallengesPreview({
  className,
  limit = 3,
  onViewAll,
}: ChallengesPreviewProps) {
  const { challenges, completeChallengeActivity, isLoadingChallenges } = useGamification();
  const { toast } = useToast();

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const result = await completeChallengeActivity(challengeId);
      
      if (result.tokensAwarded > 0) {
        toast({
          title: 'Challenge Progress Updated!',
          description: `You earned ${result.tokensAwarded} tokens for completing this challenge!`,
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update challenge progress.',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Sort challenges: prioritize incomplete challenges, then by difficulty
  const getSortedChallenges = () => {
    if (!challenges) return [];
    
    return [...challenges].sort((a, b) => {
      // Incomplete challenges first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      // Then by difficulty (assuming 'easy', 'medium', 'hard')
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
    }).slice(0, limit);
  };

  const renderChallengeItem = (challenge: Challenge) => {
    const isCompleted = challenge.isCompleted;
    const progress = Math.min(challenge.progress / challenge.target * 100, 100);
    
    return (
      <div key={challenge.id} className={`border rounded-lg p-3 mb-2 relative ${isCompleted ? 'border-green-500' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center space-x-2">
            <div className="text-xl">{challenge.icon}</div>
            <div>
              <div className="font-medium">{challenge.title}</div>
              <div className="text-xs text-gray-500">{challenge.description}</div>
            </div>
          </div>
          <Badge variant="outline" className={`${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </Badge>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Progress: {challenge.progress}/{challenge.target}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-xs text-gray-500">
            <Gift className="w-3 h-3 mr-1" />
            <span>{challenge.reward} tokens</span>
          </div>
          <Button 
            onClick={() => handleCompleteChallenge(challenge.id)} 
            disabled={isCompleted}
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            className="h-7 text-xs px-2"
          >
            {isCompleted ? 'Completed' : 'Mark Progress'}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoadingChallenges) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading challenges...
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedChallenges = getSortedChallenges();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Active Challenges
          </CardTitle>
          {onViewAll && (
            <Button
              onClick={onViewAll}
              variant="ghost"
              className="h-8 text-xs"
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedChallenges.length > 0 ? (
          sortedChallenges.map(renderChallengeItem)
        ) : (
          <div className="text-center py-4 text-gray-500">
            No active challenges at the moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}