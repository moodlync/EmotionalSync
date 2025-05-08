import React from "react";
import TokenMilestoneCard from "./token-milestone-card";
import { Coins, Crown, Diamond, Medal, Star, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenMilestonesGridProps {
  userTokens: number;
  className?: string;
}

export default function TokenMilestonesGrid({ userTokens, className }: TokenMilestonesGridProps) {
  // Define milestone data - decreased by 25% from previous values
  const milestones = [
    {
      id: 1,
      title: "Token Starter",
      description: "Earn your first 30 tokens to unlock basic rewards",
      tokenAmount: 30, // reduced from 40
      badgeIcon: <Coins className="h-4 w-4" />,
      badgeColor: "bg-zinc-300 text-zinc-700",
      isAchieved: userTokens >= 30,
      currentTokens: userTokens
    },
    {
      id: 2,
      title: "Token Enthusiast",
      description: "Earn 150 tokens to access intermediate rewards",
      tokenAmount: 150, // reduced from 200
      badgeIcon: <Star className="h-4 w-4" />,
      badgeColor: "bg-blue-300 text-blue-700",
      isAchieved: userTokens >= 150,
      currentTokens: userTokens
    },
    {
      id: 3,
      title: "Token Master",
      description: "Earn 300 tokens for premium content access",
      tokenAmount: 300, // reduced from 400
      badgeIcon: <Trophy className="h-4 w-4" />,
      badgeColor: "bg-amber-300 text-amber-700",
      isAchieved: userTokens >= 300,
      currentTokens: userTokens
    },
    {
      id: 4,
      title: "Token Expert",
      description: "Earn 750 tokens for expert privileges",
      tokenAmount: 750, // reduced from 1,000
      badgeIcon: <Medal className="h-4 w-4" />,
      badgeColor: "bg-purple-300 text-purple-700",
      isAchieved: userTokens >= 750,
      currentTokens: userTokens
    },
    {
      id: 5,
      title: "Token Champion",
      description: "Earn 1,500 tokens for champion status",
      tokenAmount: 1500, // reduced from 2,000
      badgeIcon: <Crown className="h-4 w-4" />,
      badgeColor: "bg-yellow-300 text-yellow-700",
      isAchieved: userTokens >= 1500,
      currentTokens: userTokens
    },
    {
      id: 6,
      title: "Token Legend",
      description: "Earn 3,000 tokens for legendary status and rewards",
      tokenAmount: 3000, // reduced from 4,000
      badgeIcon: <Diamond className="h-4 w-4" />,
      badgeColor: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      isAchieved: userTokens >= 3000,
      currentTokens: userTokens
    },
    {
      id: 7,
      title: "Token Ultimate",
      description: "Earn 7,500 tokens for ultimate status and exclusive rewards",
      tokenAmount: 7500, // reduced from 10,000
      badgeIcon: <Target className="h-4 w-4" />,
      badgeColor: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
      isAchieved: userTokens >= 7500,
      currentTokens: userTokens
    }
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {milestones.map(milestone => (
        <TokenMilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </div>
  );
}