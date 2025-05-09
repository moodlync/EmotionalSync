import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, Brain, Calendar, Award, MessageCircle, Repeat, BarChart3, Coins } from 'lucide-react';

interface RewardCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  activities: {
    name: string;
    tokens: number;
    description: string;
  }[];
}

export default function TokenRewardsInfo() {
  const [activeTab, setActiveTab] = useState('earning');
  
  const earningCategories: RewardCategory[] = [
    {
      title: 'Daily Activities',
      description: 'Earn tokens by maintaining your daily emotional wellness routine',
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      activities: [
        {
          name: 'Daily Check-in',
          tokens: 0.25, // Reduced by 75% from 1
          description: 'Update your emotional state once per day'
        },
        {
          name: 'Journal Entry',
          tokens: 0.5, // Reduced by 75% from 2
          description: 'Create a journal entry about your feelings (once per day)'
        },
        {
          name: 'Streak Bonus',
          tokens: 0.75, // Reduced by 75% from 3
          description: 'Additional tokens for maintaining a 7+ day streak'
        }
      ]
    },
    {
      title: 'Community Participation',
      description: 'Earn tokens by connecting with others and building community',
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      activities: [
        {
          name: 'Chat Participation',
          tokens: 0.5, // Reduced by 75% from 2
          description: 'Participate in emotion-based chat rooms'
        },
        {
          name: 'Help Others',
          tokens: 0.5, // Reduced by 75% from 2
          description: 'Provide support to users with similar emotions'
        }
      ]
    },
    {
      title: 'Challenges',
      description: 'Complete challenges to earn tokens based on difficulty',
      icon: <Award className="h-5 w-5 text-purple-500" />,
      activities: [
        {
          name: 'Easy Challenge',
          tokens: 0.5, // Reduced by 75% from 2
          description: 'Complete basic emotional wellness challenges'
        },
        {
          name: 'Moderate Challenge',
          tokens: 0.75, // Reduced by 75% from 3
          description: 'Complete intermediate challenges requiring more effort'
        },
        {
          name: 'Hard Challenge',
          tokens: 1.25, // Reduced by 75% from 5
          description: 'Complete difficult challenges requiring dedication'
        },
        {
          name: 'Extreme Challenge',
          tokens: 1.75, // Reduced by 75% from 7
          description: 'Complete the most demanding emotional growth challenges'
        }
      ]
    },
    {
      title: 'Growth & Achievements',
      description: 'Earn tokens by achieving personal growth milestones',
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      activities: [
        {
          name: 'Badge Earned',
          tokens: 0.5, // Reduced by 75% from 2
          description: 'Earn special badges for milestone achievements'
        },
        {
          name: 'Level Up',
          tokens: 1.25, // Reduced by 75% from 5
          description: 'Reach a new level in your emotional wellness journey'
        }
      ]
    }
  ];

  const redemptionInfo = [
    {
      title: 'Cash Redemption',
      description: 'Convert your tokens to real money',
      icon: <Coins className="h-5 w-5 text-amber-500" />,
      details: [
        'Minimum 10000 tokens required for redemption',
        'Current conversion rate: $0.0010 per token',
        'Processing time: 3-5 business days',
        'Available payment methods: PayPal and Stripe'
      ]
    },
    {
      title: 'Charitable Donations',
      description: 'Use your tokens to support mental health charities',
      icon: <ThumbsUp className="h-5 w-5 text-red-500" />,
      details: [
        'Donate to partner mental health organizations',
        'Same conversion rate as cash redemptions',
        'Receive a donation receipt for tax purposes',
        '100% of the value goes directly to the charity'
      ]
    },
    {
      title: 'Premium Features',
      description: 'Use tokens to unlock premium features temporarily',
      icon: <Brain className="h-5 w-5 text-violet-500" />,
      details: [
        'Access premium features without a subscription',
        '2500 tokens = 1 week of premium access',
        '4500 tokens = 2 weeks of premium access',
        '7000 tokens = 3 weeks of premium access',
        '10000 tokens = 4 weeks of premium access',
        'No recurring charges or automatic renewals'
      ]
    },
    {
      title: 'Token Transfers',
      description: 'Send tokens to friends and family',
      icon: <Repeat className="h-5 w-5 text-emerald-500" />,
      details: [
        'Transfer tokens to other MoodSync users',
        'Minimum transfer amount: 10000 tokens',
        'No fees for token transfers',
        'Include a personalized message with your transfer'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token System Guide</CardTitle>
        <CardDescription>
          Learn how to earn and redeem tokens in the MoodSync platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earning">Earning Tokens</TabsTrigger>
            <TabsTrigger value="redemption">Redemption Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="earning" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              MoodSync rewards your engagement and commitment to emotional wellness. 
              Here are all the ways you can earn tokens on the platform:
            </p>
            
            {earningCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted/50">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="ml-10 grid gap-2">
                  {category.activities.map((activity, actIdx) => (
                    <div key={actIdx} className="grid grid-cols-[1fr_auto] gap-2 items-center bg-muted/30 p-3 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium">{activity.name}</h4>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                        +{activity.tokens} <Coins className="ml-1 h-3.5 w-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {index < earningCategories.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
            
            <div className="bg-muted/40 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium mb-2">Important Note</h3>
              <p className="text-xs text-muted-foreground">
                Token rewards for daily activities (check-ins, journal entries) can only be earned once per day.
                Streaks are calculated based on consecutive days of engagement. Missing a day will reset your streak.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="redemption" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              Turn your earned tokens into real-world value. Here are the ways you can redeem your tokens:
            </p>
            
            {redemptionInfo.map((option, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted/50">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                
                <div className="ml-10">
                  <ul className="space-y-2">
                    {option.details.map((detail, detIdx) => (
                      <li key={detIdx} className="text-sm flex items-start">
                        <span className="mr-2 bg-primary rounded-full w-1.5 h-1.5 mt-1.5 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {index < redemptionInfo.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
            
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
              <h3 className="text-sm font-medium mb-2">Cash Redemption Examples</h3>
              <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col p-2 bg-background/50 rounded">
                  <span className="font-medium">10,000 tokens</span>
                  <span className="text-primary font-medium">$10.00</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded">
                  <span className="font-medium">20,000 tokens</span>
                  <span className="text-primary font-medium">$20.00</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded">
                  <span className="font-medium">50,000 tokens</span>
                  <span className="text-primary font-medium">$50.00</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium mb-2">Redemption Policy</h3>
              <p className="text-xs text-muted-foreground">
                All redemption requests are reviewed for security purposes. Cash redemptions require identity verification 
                for amounts over $50. Token values and conversion rates are subject to change. Any changes will be 
                communicated at least 14 days in advance.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}