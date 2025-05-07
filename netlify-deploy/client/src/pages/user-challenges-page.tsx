import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Challenge } from '@shared/schema';
import ChallengeCreator from '@/components/challenges/challenge-creator';
import ChallengeCompletion from '@/components/challenges/challenge-completion';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PlusCircle, Search, Users, Award, User, Filter, Loader2 } from 'lucide-react';

// Define challenge categories
const challengeCategories = [
  'All Categories',
  'Mindfulness',
  'Physical Activity',
  'Sleep',
  'Nutrition',
  'Social Connection',
  'Gratitude',
  'Stress Reduction',
  'Creativity',
  'Learning',
  'Productivity',
  'Personal Growth',
  'Environmental',
  'Financial Wellbeing',
  'Work-Life Balance',
  'Emotional Intelligence',
];

// Define difficulty levels
const difficultyLevels = [
  'All Difficulties',
  'Easy',
  'Moderate',
  'Hard',
  'Extreme'
];

export default function UserChallengesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  
  // Query to fetch user-created challenges
  const {
    data: userCreatedChallenges = [],
    isLoading: isLoadingUserChallenges,
    error: userChallengesError,
  } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges/my-created'],
    enabled: user?.isPremium === true,
  });
  
  // Query to fetch public user-created challenges
  const {
    data: publicChallenges = [],
    isLoading: isLoadingPublicChallenges,
    error: publicChallengesError,
  } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges/public'],
  });
  
  // Function to filter challenges based on search, category, and difficulty
  const filterChallenges = (challenges: Challenge[], query: string, category: string, difficulty: string) => {
    return challenges.filter(challenge => {
      // Search query filter
      const matchesQuery = 
        query === '' || 
        challenge.title.toLowerCase().includes(query.toLowerCase()) ||
        challenge.description.toLowerCase().includes(query.toLowerCase()) ||
        (challenge.tags && challenge.tags.toLowerCase().includes(query.toLowerCase()));
      
      // Category filter
      const matchesCategory = 
        category === 'All Categories' || 
        challenge.category.toLowerCase() === category.toLowerCase();
      
      // Difficulty filter
      const matchesDifficulty = 
        difficulty === 'All Difficulties' || 
        challenge.difficulty.toLowerCase() === difficulty.toLowerCase();
      
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  };
  
  // Filter the public challenges
  const filteredPublicChallenges = filterChallenges(
    publicChallenges, 
    searchQuery, 
    selectedCategory, 
    selectedDifficulty
  );
  
  // Filter the user created challenges
  const filteredUserChallenges = filterChallenges(
    userCreatedChallenges, 
    searchQuery, 
    selectedCategory, 
    selectedDifficulty
  );
  
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Challenges</h1>
        <p className="text-muted-foreground mt-2">
          Create and participate in wellness challenges created by the community
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="browse">
            <Search className="h-4 w-4 mr-2" />
            Browse Challenges
          </TabsTrigger>
          {user?.isPremium && (
            <TabsTrigger value="my-challenges">
              <User className="h-4 w-4 mr-2" />
              My Challenges
            </TabsTrigger>
          )}
        </TabsList>
        
        <div className="flex items-center space-x-4 my-6">
          <div className="flex-1">
            <Input
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {challengeCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedDifficulty} 
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1">
            <ChallengeCreator />
          </div>
          
          {isLoadingPublicChallenges ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : publicChallengesError ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-red-500">Error loading challenges. Please try again later.</p>
              </CardContent>
            </Card>
          ) : filteredPublicChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No challenges match your filters. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Community-Created Challenges</h2>
                <Badge variant="outline" className="text-xs bg-primary/10">
                  <Users className="h-3 w-3 mr-1" />
                  {filteredPublicChallenges.length} {filteredPublicChallenges.length === 1 ? 'Challenge' : 'Challenges'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicChallenges.map((challenge) => (
                  <ChallengeCompletion 
                    key={challenge.id} 
                    challenge={challenge} 
                    userProgress={0} // This would come from a query in a real implementation
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        {user?.isPremium && (
          <TabsContent value="my-challenges" className="space-y-6">
            <div className="grid grid-cols-1">
              <ChallengeCreator />
            </div>
            
            {isLoadingUserChallenges ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userChallengesError ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-red-500">Error loading your challenges. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredUserChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Challenges Created Yet</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    You haven't created any challenges yet. Create your first challenge to earn tokens when others complete it!
                  </p>
                  <Button onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Created Challenges</h2>
                  <Badge variant="outline" className="text-xs bg-primary/10">
                    <Award className="h-3 w-3 mr-1" />
                    {filteredUserChallenges.length} {filteredUserChallenges.length === 1 ? 'Challenge' : 'Challenges'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUserChallenges.map((challenge) => (
                    <ChallengeCompletion 
                      key={challenge.id} 
                      challenge={challenge}
                      userProgress={0} // This would come from a query in a real implementation
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}