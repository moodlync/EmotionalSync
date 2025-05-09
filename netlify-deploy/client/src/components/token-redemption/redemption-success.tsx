import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Share2 } from 'lucide-react';
import { useLocation } from 'wouter';
import SocialShareMilestone from '../token-milestones/social-share-milestone';

interface RedemptionSuccessProps {
  tokensRedeemed: number;
  cashAmount: string;
  onDismiss: () => void;
}

export default function RedemptionSuccess({ 
  tokensRedeemed, 
  cashAmount,
  onDismiss
}: RedemptionSuccessProps) {
  const [_, setLocation] = useLocation();
  
  return (
    <Card className="w-full shadow-lg border-green-200 bg-gradient-to-b from-green-50 to-white">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Redemption Successful!</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="space-y-1">
          <p className="text-gray-600">You've successfully redeemed</p>
          <p className="text-2xl font-bold text-gray-900">{tokensRedeemed} tokens</p>
          <p className="text-gray-600">for</p>
          <p className="text-xl font-bold text-gray-900">${cashAmount}</p>
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Your redemption has been submitted and is being processed.</p>
          <p>You'll receive a confirmation once it's completed.</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 pt-0">
        <div className="w-full">
          <SocialShareMilestone
            milestone={1000}
            currentTokens={tokensRedeemed}
            className="w-full"
          />
        </div>
        
        <div className="flex space-x-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation('/milestones')}
          >
            View Milestones
          </Button>
          
          <Button 
            variant="default"
            className="flex-1"
            onClick={onDismiss}
          >
            Back to Redemption
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}