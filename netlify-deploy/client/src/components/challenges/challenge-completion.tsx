import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Challenge } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  User, 
  Tag, 
  Award,
  Loader2
} from 'lucide-react';

interface ChallengeCompletionProps {
  challenge: Challenge;
  userProgress?: number;
}

export default function ChallengeCompletion({ challenge, userProgress = 0 }: ChallengeCompletionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressPercentage = Math.min(100, Math.round((userProgress / challenge.targetValue) * 100));
  const isCompleted = userProgress >= challenge.targetValue;
  
  const recordProgressMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/challenges/${challenge.id}/progress`, {});
    },
    onSuccess: () => {
      toast({
        title: isCompleted ? 'Challenge Completed!' : 'Progress Recorded',
        description: isCompleted 
          ? 'Congratulations! You\'ve completed this challenge and earned a token.' 
          : 'Your progress has been updated. Keep going!',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Record Progress',
        description: error.message || 'There was an error recording your progress. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreatorInitials = (username: string = '') => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTags = (tags: string | null) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  return (
    <Card className={isCompleted ? 'border-green-200 bg-green-50' : undefined}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center">
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />}
              {challenge.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {!isExpanded ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
          )}
          
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-xs text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
          
          {challenge.createdBy && (
            <div className="flex items-center mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={''} />
                <AvatarFallback className="text-xs">
                  {getCreatorInitials(challenge.createdBy.toString())}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Created by a premium member
              </span>
            </div>
          )}
          
          <div className="pt-2">
            <div className="flex justify-between mb-1 text-xs">
              <span>Progress</span>
              <span>{userProgress} / {challenge.targetValue}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {isExpanded && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                <span>{challenge.tokenReward} token reward</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                <span>Target: {challenge.targetValue}</span>
              </div>
              {challenge.isUserCreated && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                  <span>User created</span>
                </div>
              )}
              {challenge.createdAt && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span>
                    {new Date(challenge.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {isExpanded && challenge.tags && (
            <div className="flex flex-wrap gap-1 pt-1">
              {formatTags(challenge.tags).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-gray-50">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {isCompleted ? (
          <Button disabled className="w-full bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </Button>
        ) : (
          user ? (
            <Button 
              onClick={() => recordProgressMutation.mutate()}
              disabled={recordProgressMutation.isPending}
              className="w-full"
            >
              {recordProgressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Record Progress
                </>
              )}
            </Button>
          ) : (
            <Button disabled className="w-full">
              <User className="h-4 w-4 mr-2" />
              Sign in to track progress
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}