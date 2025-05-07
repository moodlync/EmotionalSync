import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Clock, 
  CreditCard, 
  BarChart, 
  Trophy, 
  Calendar, 
  Award, 
  Users, 
  Star, 
  Book,
  Heart
} from "lucide-react";

export function TokenSystemGuide() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Token System Guide</CardTitle>
        <CardDescription>Learn how to earn and redeem tokens in the MoodSync platform</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="earn" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earn">Earning Tokens</TabsTrigger>
              <TabsTrigger value="redeem">Redemption Options</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="earn" className="px-6 pt-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Ways to Earn Tokens</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Book className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Journal Entry</h4>
                    <p className="text-xs text-muted-foreground">2 tokens per journal entry</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Help Others</h4>
                    <p className="text-xs text-muted-foreground">2 tokens when you help someone</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Badge Earned</h4>
                    <p className="text-xs text-muted-foreground">2 tokens per badge earned</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Trophy className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Level Up</h4>
                    <p className="text-xs text-muted-foreground">5 tokens each time you level up</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Star className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Challenge Completion</h4>
                    <p className="text-xs text-muted-foreground">1 token per challenge completed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Referral Bounty</h4>
                    <p className="text-xs text-muted-foreground">500-1000 tokens for referrals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Calendar className="h-5 w-5 text-teal-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Daily Login</h4>
                    <p className="text-xs text-muted-foreground">3 tokens for daily login</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <BarChart className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Others Complete Your Challenge</h4>
                    <p className="text-xs text-muted-foreground">3 tokens per completion</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Token Usage for Non-Premium Users</h3>
              <p className="text-sm text-muted-foreground">
                Non-premium users can use tokens to access premium features temporarily.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                <div className="flex flex-col p-3 rounded-lg bg-card border border-border text-center">
                  <span className="text-sm font-medium">1 Week Access</span>
                  <span className="text-2xl font-bold text-primary">1,500</span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                
                <div className="flex flex-col p-3 rounded-lg bg-card border border-border text-center">
                  <span className="text-sm font-medium">2 Weeks Access</span>
                  <span className="text-2xl font-bold text-primary">2,500</span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                
                <div className="flex flex-col p-3 rounded-lg bg-card border border-border text-center">
                  <span className="text-sm font-medium">3 Weeks Access</span>
                  <span className="text-2xl font-bold text-primary">4,000</span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                
                <div className="flex flex-col p-3 rounded-lg bg-card border border-border text-center">
                  <span className="text-sm font-medium">4 Weeks Access</span>
                  <span className="text-2xl font-bold text-primary">7,000</span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                Non-premium users also earn a referral bonus of 300 tokens for every 5 new premium subscriptions from referrals.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="redeem" className="px-6 pt-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Cash Redemption</h3>
              <p className="text-sm text-muted-foreground">
                Turn your earned tokens into real-world value by converting them to cash.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Gift className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Minimum Requirement</h4>
                    <p className="text-xs text-muted-foreground">5,000 tokens required for redemption</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <BarChart className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Conversion Rate</h4>
                    <p className="text-xs text-muted-foreground">$0.0020 per token</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Processing Time</h4>
                    <p className="text-xs text-muted-foreground">3-5 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/40">
                  <CreditCard className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Payment Methods</h4>
                    <p className="text-xs text-muted-foreground">PayPal and Stripe</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-medium text-sm mb-1">Example Redemption</h4>
                <p className="text-xs text-muted-foreground">
                  5,000 tokens = $10.00<br />
                  10,000 tokens = $20.00<br />
                  25,000 tokens = $50.00
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Other Redemption Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Charity Donation</CardTitle>
                    <CardDescription>Support worthy causes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Donate your tokens to partnered charities. Same conversion rate as cash redemption.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Premium Features</CardTitle>
                    <CardDescription>For non-premium users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Exchange tokens for temporary access to premium features, starting at 1,500 tokens for one week.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">User Transfers</CardTitle>
                    <CardDescription>Premium users only</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Premium users can transfer tokens to other users for mutual benefits and community support.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}