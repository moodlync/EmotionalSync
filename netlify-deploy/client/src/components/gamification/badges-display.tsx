import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeDifficulty } from '@shared/schema';
import { Badge } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Award, Trophy, Medal, Star } from 'lucide-react';

// Interface for our badge type from the server
interface BadgeItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  difficulty: ChallengeDifficulty;
  earnedAt?: string; // Only exists on earned badges
}

// Convert difficulty to display text
const getDifficultyLabel = (difficulty: ChallengeDifficulty) => {
  switch (difficulty) {
    case 'easy': return 'Easy';
    case 'moderate': return 'Moderate';
    case 'hard': return 'Hard';
    case 'extreme': return 'Extreme';
    default: return 'Unknown';
  }
};

// Get color class based on difficulty
const getDifficultyColorClass = (difficulty: ChallengeDifficulty) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-50 text-green-700 border-green-300';
    case 'moderate': return 'bg-blue-50 text-blue-700 border-blue-300';
    case 'hard': return 'bg-purple-50 text-purple-700 border-purple-300';
    case 'extreme': return 'bg-red-50 text-red-800 border-red-300';
    default: return 'bg-gray-50 text-gray-700 border-gray-300';
  }
};

// Get icon based on difficulty
const getDifficultyIcon = (difficulty: ChallengeDifficulty) => {
  switch (difficulty) {
    case 'easy': return <Award className="h-12 w-12 text-green-500" />;
    case 'moderate': return <Medal className="h-12 w-12 text-blue-500" />;
    case 'hard': return <Trophy className="h-12 w-12 text-purple-500" />;
    case 'extreme': return <Star className="h-12 w-12 text-red-500" />;
    default: return <Badge className="h-12 w-12 text-gray-500" />;
  }
};

export default function BadgesDisplay() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ChallengeDifficulty>('all');
  
  // Fetch all badges
  const { data: allBadges, isLoading: isLoadingAllBadges } = useQuery<BadgeItem[]>({
    queryKey: ['/api/badges'],
    queryFn: async () => {
      const res = await fetch('/api/badges');
      if (!res.ok) throw new Error('Failed to fetch badges');
      return res.json();
    },
  });

  // Fetch user's earned badges
  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery<BadgeItem[]>({
    queryKey: ['/api/user/badges'],
    queryFn: async () => {
      const res = await fetch('/api/user/badges');
      if (!res.ok) throw new Error('Failed to fetch user badges');
      return res.json();
    },
    enabled: !!user,
  });

  const isLoading = isLoadingAllBadges || isLoadingUserBadges;

  // Filter badges based on selected filter
  const getFilteredBadges = (badges: BadgeItem[] | undefined) => {
    if (!badges) return [];
    if (selectedFilter === 'all') return badges;
    return badges.filter(badge => badge.difficulty === selectedFilter);
  };

  // Check if a badge is earned by the user
  const isBadgeEarned = (badgeId: number) => {
    return userBadges?.some(badge => badge.id === badgeId) || false;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Badges
        </CardTitle>
        <CardDescription>
          Badges earned through completing challenges of varying difficulty
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="earned" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="earned">Earned ({userBadges?.length || 0})</TabsTrigger>
                <TabsTrigger value="available">Available ({(allBadges?.length || 0) - (userBadges?.length || 0)})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="earned" className="pt-4">
                {userBadges && userBadges.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button 
                        variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedFilter('all')}
                      >
                        All
                      </Button>
                      <Button 
                        variant={selectedFilter === 'easy' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedFilter('easy')}
                        className="text-green-700"
                      >
                        Easy
                      </Button>
                      <Button 
                        variant={selectedFilter === 'moderate' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedFilter('moderate')}
                        className="text-blue-700"
                      >
                        Moderate
                      </Button>
                      <Button 
                        variant={selectedFilter === 'hard' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedFilter('hard')}
                        className="text-purple-700"
                      >
                        Hard
                      </Button>
                      <Button 
                        variant={selectedFilter === 'extreme' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedFilter('extreme')}
                        className="text-red-700"
                      >
                        Extreme
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getFilteredBadges(userBadges).map(badge => (
                        <div 
                          key={badge.id} 
                          className="flex p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-shrink-0 mr-4 flex items-center justify-center">
                            {badge.imageUrl ? (
                              <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16 object-contain" />
                            ) : (
                              getDifficultyIcon(badge.difficulty)
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{badge.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <UIBadge variant="outline" className={getDifficultyColorClass(badge.difficulty)}>
                                {getDifficultyLabel(badge.difficulty)}
                              </UIBadge>
                              {badge.earnedAt && (
                                <UIBadge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Earned on {formatDate(badge.earnedAt)}
                                </UIBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {getFilteredBadges(userBadges).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No badges found for the selected filter.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium mb-1">No Badges Yet</h3>
                    <p>Complete challenges to earn badges and showcase your achievements!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="available" className="pt-4">
                {allBadges && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allBadges
                      .filter(badge => !isBadgeEarned(badge.id))
                      .map(badge => (
                        <div 
                          key={badge.id} 
                          className="flex p-4 border rounded-lg bg-gray-50/50"
                        >
                          <div className="flex-shrink-0 mr-4 flex items-center justify-center opacity-70">
                            {badge.imageUrl ? (
                              <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16 object-contain grayscale" />
                            ) : (
                              getDifficultyIcon(badge.difficulty)
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{badge.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                            <UIBadge variant="outline" className={getDifficultyColorClass(badge.difficulty)}>
                              {getDifficultyLabel(badge.difficulty)}
                            </UIBadge>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
                
                {allBadges && allBadges.filter(badge => !isBadgeEarned(badge.id)).length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h3 className="text-lg font-medium mb-1">All Badges Collected!</h3>
                    <p>Congratulations! You've earned all available badges.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}