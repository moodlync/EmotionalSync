import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { HelpCircle } from 'lucide-react';
import TokenRedemptionTab from '@/components/token-redemption/token-redemption-tab';
import TokenRewardsInfo from '@/components/token-redemption/token-rewards-info';

export default function TokenRedemptionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('redeem');

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Redemption Center</h1>
          <p className="text-muted-foreground mt-2">
            Convert your earned tokens into real-world value
          </p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to="/token-guide" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            Token System Guide
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="redeem">Redeem Tokens</TabsTrigger>
          <TabsTrigger value="info">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="redeem" className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            <TokenRedemptionTab />
          </div>
        </TabsContent>
        
        <TabsContent value="info" className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            <TokenRewardsInfo />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}