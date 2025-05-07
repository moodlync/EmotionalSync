import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RewardActivityType } from "@shared/schema";

interface RewardActivity {
  id: number;
  userId: number;
  activityType: RewardActivityType;
  tokensEarned: number;
  description: string;
  createdAt: string;
}

interface EarnTokensData {
  activityType: RewardActivityType;
  tokensEarned: number;
  description: string;
}

// Hook to handle rewards and tokens
export function useRewards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to earn tokens
  const earnTokensMutation = useMutation({
    mutationFn: async (data: EarnTokensData) => {
      const res = await apiRequest("POST", "/api/rewards/earn", data);
      return await res.json() as RewardActivity;
    },
    onSuccess: (data) => {
      // Show a success toast notification
      toast({
        title: "Tokens Earned!",
        description: `You earned ${data.tokensEarned} tokens for ${data.description}`,
        variant: "default",
      });
      
      // Invalidate queries to refresh token balance and history
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to earn tokens",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to show a notification for tokens earned
  const showTokenEarnedToast = (tokens: number, activity: string) => {
    toast({
      title: "Tokens Earned!",
      description: `You earned ${tokens} tokens for ${activity}`,
      variant: "default",
    });
    
    // Invalidate queries to refresh token balance
    queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
  };

  return {
    earnTokensMutation,
    showTokenEarnedToast
  };
}