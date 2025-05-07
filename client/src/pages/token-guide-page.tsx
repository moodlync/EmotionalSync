import { TokenSystemGuide } from "@/components/token-system/token-system-guide";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Coins, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface EligibilityInfo {
  eligible: boolean;
  tokenBalance: number;
  conversionRate: number;
  minimumTokens: number;
  estimatedCashAmount: number;
}

export default function TokenGuidePage() {
  // Fetch token balance data
  const { data: eligibilityInfo, isLoading } = useQuery<EligibilityInfo>({
    queryKey: ['/api/token-redemption/eligibility'],
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tokens" className="hover:underline">Token Redemption</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Token Guide</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Token System Guide</h1>
      </div>
      
      {/* User's Token Summary */}
      {eligibilityInfo && eligibilityInfo.tokenBalance !== undefined && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Your Token Balance</h2>
                <p className="text-muted-foreground text-sm mt-1">Here's a summary of your current tokens</p>
              </div>
              <Button asChild variant="outline" className="mt-4 md:mt-0">
                <Link to="/tokens" className="flex items-center">
                  View Redemption Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">
                  {eligibilityInfo.tokenBalance.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Available Tokens</div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">
                  ${((eligibilityInfo.tokenBalance) * (eligibilityInfo.conversionRate)).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Estimated Value <span className="text-xs text-muted-foreground">(${eligibilityInfo.conversionRate.toFixed(4)} per token)</span>
                </div>
              </div>
            </div>
            
            {/* Token Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Redemption Goal</span>
                <span className="font-medium">
                  {eligibilityInfo.tokenBalance}/{eligibilityInfo.minimumTokens} tokens 
                  ({Math.min(100, Math.floor((eligibilityInfo.tokenBalance / eligibilityInfo.minimumTokens) * 100))}%)
                </span>
              </div>
              <Progress 
                value={Math.min(100, (eligibilityInfo.tokenBalance / eligibilityInfo.minimumTokens) * 100)} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{eligibilityInfo.minimumTokens}</span>
              </div>
            </div>
            
            {!eligibilityInfo.eligible && (
              <div className="mt-4 flex items-start p-3 bg-muted/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Not Eligible for Cash Redemption Yet</p>
                  <p className="text-muted-foreground">
                    You need at least {eligibilityInfo.minimumTokens} tokens to redeem for cash. 
                    {eligibilityInfo.tokenBalance >= 1500 ? 
                      " However, you have enough tokens to access premium features temporarily!" : 
                      " Keep using MoodSync to earn more tokens!"}
                  </p>
                </div>
              </div>
            )}
            
            {eligibilityInfo.tokenBalance >= 1500 && eligibilityInfo.tokenBalance < eligibilityInfo.minimumTokens && (
              <div className="mt-4 flex justify-center">
                <Button asChild>
                  <Link to="/tokens" className="flex items-center">
                    <Coins className="mr-2 h-4 w-4" />
                    Try Premium Features With Your Tokens
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <TokenSystemGuide />
    </div>
  );
}