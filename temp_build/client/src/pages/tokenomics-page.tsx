import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TOKEN_ACTIVITIES, 
  BOUNTY_REWARDS, 
  PREMIUM_TOKEN_ACCESS 
} from "@/lib/tokenomics-data";
import { TOKEN_CONVERSION_RATE, MIN_REDEMPTION_TOKENS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Zap, Share, Coins, Gift, Trophy, Clock, Star, Shuffle, ChevronsUpDown } from "lucide-react";

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Calculate token value helper
const calculateTokenValue = (tokens: number) => {
  return tokens * TOKEN_CONVERSION_RATE;
};

export default function TokenomicsPage() {
  const [activeTab, setActiveTab] = useState("earning");
  const { toast } = useToast();

  const { data: tokenBalance = { tokens: 0 } } = useQuery<{ tokens: number }>({
    queryKey: ["/api/tokens"],
  });

  // Calculate progress to minimum redemption
  const redemptionProgress = Math.min(
    (tokenBalance.tokens / MIN_REDEMPTION_TOKENS) * 100,
    100
  );

  return (
    <div className="container py-8 px-4 mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        Tokenomics
      </h1>
      <p className="text-muted-foreground mb-8">
        Learn how to earn and use tokens on MoodSync to maximize your experience
      </p>

      {/* Token Balance Card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Your Token Balance
          </CardTitle>
          <CardDescription>
            Current balance and progress toward redemption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">{tokenBalance.tokens.toLocaleString()} tokens</span>
              <span className="text-muted-foreground">
                Estimated value: {formatCurrency(calculateTokenValue(tokenBalance.tokens))}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to redemption minimum ({MIN_REDEMPTION_TOKENS.toLocaleString()} tokens)</span>
                <span>{redemptionProgress.toFixed(1)}%</span>
              </div>
              <Progress value={redemptionProgress} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tokenomics Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="earning">
            <Gift className="mr-2 h-4 w-4" /> Earning
          </TabsTrigger>
          <TabsTrigger value="spending">
            <Coins className="mr-2 h-4 w-4" /> Spending
          </TabsTrigger>
          <TabsTrigger value="economics">
            <Trophy className="mr-2 h-4 w-4" /> Economics
          </TabsTrigger>
        </TabsList>

        {/* Earning Tab */}
        <TabsContent value="earning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ways to Earn Tokens</CardTitle>
              <CardDescription>
                Complete these activities to accumulate tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Token Reward</TableHead>
                    <TableHead>Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOKEN_ACTIVITIES.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{activity.name}</TableCell>
                      <TableCell>{activity.reward}</TableCell>
                      <TableCell>{activity.frequency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Opportunities</CardTitle>
              <CardDescription>
                Additional ways for premium members to earn tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {BOUNTY_REWARDS.map((bounty, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        {bounty.name}
                        <Badge variant="outline" className="ml-2">
                          {bounty.reward} tokens
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{bounty.description}</p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          <Star className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Redemption Options</CardTitle>
              <CardDescription>
                Ways to use your accumulated tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {PREMIUM_TOKEN_ACCESS.map((option, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{option.name}</h3>
                          <p className="text-muted-foreground text-sm">{option.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-lg">
                          {option.tokens} tokens
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Economics Tab */}
        <TabsContent value="economics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Fundamentals</CardTitle>
              <CardDescription>
                Core principles of the MoodSync tokenomics system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Shuffle className="mr-2 h-5 w-5 text-primary" />
                    Token Circulation
                  </h3>
                  <p className="text-muted-foreground">
                    Tokens are earned through active participation and can be redeemed for premium features 
                    or real-world value. The system is designed to reward engagement and contribution to the 
                    MoodSync community.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <ChevronsUpDown className="mr-2 h-5 w-5 text-primary" />
                    Value Fluctuation
                  </h3>
                  <p className="text-muted-foreground">
                    The current token conversion rate is {formatCurrency(TOKEN_CONVERSION_RATE)} per token.
                    This rate may be adjusted over time based on platform growth and economic sustainability.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Redemption Periods
                  </h3>
                  <p className="text-muted-foreground">
                    Token redemption requires a minimum balance of {MIN_REDEMPTION_TOKENS.toLocaleString()} tokens.
                    Redemption processing typically takes 3-5 business days. Premium members enjoy faster 
                    processing times and additional redemption options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Tokens have no cash value and are not transferable outside the MoodSync platform</li>
                <li>Tokens may expire if an account is dormant for more than 12 months</li>
                <li>MoodSync reserves the right to modify token values and redemption options</li>
                <li>Premium members enjoy enhanced token earning rates and exclusive redemption options</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}