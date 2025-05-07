import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Coins, Heart, BarChart4, MessageCircle, Calendar, Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { RewardActivityType } from "@shared/schema";

interface EarningOpportunity {
  type: RewardActivityType;
  title: string;
  description: string;
  tokens: number;
  icon: React.ReactNode;
}

export default function RewardsCard() {
  const { user } = useAuth();
  
  // Fetch token balance
  const { data: tokenData, isLoading: isLoadingTokens } = useQuery({
    queryKey: ['/api/tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      if (!res.ok) throw new Error('Failed to fetch token balance');
      return res.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  // Earning opportunities
  const earningOpportunities: EarningOpportunity[] = [
    {
      type: 'journal_entry',
      title: 'Create Journal Entry',
      description: 'Share your feelings and thoughts in the journal',
      tokens: 5,
      icon: <BarChart4 className="h-5 w-5 text-teal-600" />
    },
    {
      type: 'emotion_update',
      title: 'Update Your Emotion',
      description: 'Keep your emotional state current',
      tokens: 2,
      icon: <Heart className="h-5 w-5 text-pink-600" />
    },
    {
      type: 'chat_participation',
      title: 'Join Chat Rooms',
      description: 'Connect with others feeling the same way',
      tokens: 3,
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />
    },
    {
      type: 'daily_login',
      title: 'Daily Check-in',
      description: 'Login to MoodSync daily',
      tokens: 10,
      icon: <Calendar className="h-5 w-5 text-purple-600" />
    }
  ];
  
  // Progress towards 1000 tokens redemption goal
  const currentTokens = tokenData?.tokens || 0;
  const redemptionGoal = 1000; // Fixed at 1000 tokens for redemption
  const progress = Math.min(100, Math.floor((currentTokens / redemptionGoal) * 100));
  const canRedeem = currentTokens >= redemptionGoal;
  const [_, setLocation] = useLocation();
  
  const handleViewMilestones = () => {
    setLocation('/milestones');
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Rewards Center
          </CardTitle>
          <Badge variant="outline" className="bg-yellow-50 font-semibold">
            {isLoadingTokens ? '...' : tokenData?.tokens || 0} tokens
          </Badge>
        </div>
        <CardDescription>
          Earn tokens by being active on MoodSync
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to {redemptionGoal} tokens</span>
            <span className="font-medium">{currentTokens}/{redemptionGoal} ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{redemptionGoal}</span>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="link" size="sm" className="text-blue-600 h-auto p-0" onClick={handleViewMilestones}>
              View all milestones
            </Button>
          </div>
        </div>
        
        <h4 className="font-medium mb-3">Earning Opportunities</h4>
        <div className="space-y-3">
          {earningOpportunities.map((opportunity) => (
            <TooltipProvider key={opportunity.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      {opportunity.icon}
                      <div>
                        <p className="font-medium">{opportunity.title}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      +{opportunity.tokens} tokens
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{opportunity.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
      
      {/* Redeem button - only visible when threshold is reached */}
      {canRedeem && (
        <CardFooter className="pt-0">
          <Button 
            onClick={() => setLocation('/token-redemption')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            <Gift className="mr-2 h-4 w-4" />
            Redeem Your Tokens Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}