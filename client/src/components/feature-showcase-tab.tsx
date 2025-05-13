import { useState } from "react";
import { Link } from "wouter";
import { Crown, Zap, Search, CheckCircle, Lock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

// Define types for features
type FeatureType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  tier?: string;
};

const FeatureShowcaseTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const isPremium = user?.isPremium;

  // Premium Features
  const premiumFeatures: FeatureType[] = [
    {
      id: "advanced-emotions",
      title: "Advanced Emotion Tracking",
      description: "Track up to 50 detailed emotions with intensity levels",
      icon: <Search className="h-5 w-5 text-purple-500" />,
      isPremium: true,
      tier: "Essential"
    },
    {
      id: "multi-checkins",
      title: "Multiple Daily Check-ins",
      description: "Log your emotions multiple times throughout the day",
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      isPremium: true,
      tier: "Essential"
    },
    {
      id: "mood-themes",
      title: "Dynamic Theme Colors",
      description: "App appearance changes based on your emotional state",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      isPremium: true,
      tier: "Essential"
    },
    {
      id: "social-sharing",
      title: "Social Sharing",
      description: "Share your thoughts with friends with privacy controls",
      icon: <Lock className="h-5 w-5 text-green-500" />,
      isPremium: true,
      tier: "Plus"
    },
    {
      id: "custom-mood-tags",
      title: "Custom Mood Tags",
      description: "Create and track your own personalized emotional states",
      icon: <Tag className="h-5 w-5 text-indigo-500" />,
      isPremium: true,
      tier: "Plus"
    },
    {
      id: "premium-content",
      title: "Premium Content Access",
      description: "Access exclusive articles, videos, and guides",
      icon: <Crown className="h-5 w-5 text-pink-500" />,
      isPremium: true,
      tier: "Plus"
    },
    {
      id: "global-mood-map",
      title: "Global Mood Map",
      description: "View anonymized emotional patterns from around the world",
      icon: <Search className="h-5 w-5 text-violet-500" />,
      isPremium: true,
      tier: "Premium"
    },
    {
      id: "priority-support",
      title: "Priority Support",
      description: "Get faster responses from our customer service team",
      icon: <Zap className="h-5 w-5 text-red-500" />,
      isPremium: true,
      tier: "Premium"
    },
    {
      id: "mood-backgrounds",
      title: "Mood-Synced Backgrounds",
      description: "Dynamic background colors that transition based on your emotional state",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      isPremium: true,
      tier: "Premium"
    },
    {
      id: "token-milestone",
      title: "Token Milestone Celebrations",
      description: "Enjoy personalized confetti bursts when reaching token milestones",
      icon: <Crown className="h-5 w-5 text-emerald-500" />,
      isPremium: true,
      tier: "Premium"
    },
    {
      id: "emoji-reactions",
      title: "Enhanced Emoji Reactions",
      description: "Express yourself with an expanded set of emotional reactions",
      icon: <Zap className="h-5 w-5 text-sky-500" />,
      isPremium: true,
      tier: "Premium"
    },
    {
      id: "emotional-imprints",
      title: "Emotional Imprints",
      description: "Create and share multi-sensory snapshots of your emotional state",
      icon: <Crown className="h-5 w-5 text-rose-500" />,
      isPremium: true,
      tier: "Premium"
    }
  ];

  // Free Features
  const freeFeatures: FeatureType[] = [
    {
      id: "basic-emotions",
      title: "Basic Emotion Tracking",
      description: "Track 6 primary emotions with daily check-ins",
      icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
      isPremium: false
    },
    {
      id: "mood-journal",
      title: "Mood Journal",
      description: "Write daily journal entries about your emotional experiences",
      icon: <Search className="h-5 w-5 text-gray-500" />,
      isPremium: false
    },
    {
      id: "ai-companion",
      title: "AI Companion",
      description: "Get support and insights from our AI emotional wellness companion",
      icon: <Zap className="h-5 w-5 text-gray-500" />,
      isPremium: false
    },
    {
      id: "basic-challenges",
      title: "Basic Challenges",
      description: "Complete emotional wellness challenges to earn tokens",
      icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
      isPremium: false
    },
    {
      id: "token-rewards",
      title: "Token Rewards",
      description: "Earn tokens for platform engagement and completing activities",
      icon: <Zap className="h-5 w-5 text-gray-500" />,
      isPremium: false
    },
    {
      id: "community-access",
      title: "Community Access",
      description: "Connect with others who share similar emotional experiences",
      icon: <Search className="h-5 w-5 text-gray-500" />,
      isPremium: false
    }
  ];

  // Filter features based on the active tab
  const getFilteredFeatures = () => {
    switch (activeTab) {
      case "premium":
        return premiumFeatures;
      case "free":
        return freeFeatures;
      case "all":
      default:
        return [...premiumFeatures, ...freeFeatures];
    }
  };

  const filteredFeatures = getFilteredFeatures();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Feature Showcase</h2>
            <p className="text-muted-foreground">
              Discover all the features available on MoodLync
            </p>
          </div>
          <Link href="/premium">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Features</TabsTrigger>
            <TabsTrigger value="premium">Premium Features</TabsTrigger>
            <TabsTrigger value="free">Free Features</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeatures.map((feature) => (
                <Card key={feature.id} className={`overflow-hidden transition-all hover:shadow-md ${feature.isPremium ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                  <CardHeader className={`pb-2 ${feature.isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${feature.isPremium ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                      {feature.isPremium && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          Premium
                        </Badge>
                      )}
                      {!feature.isPremium && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                          Free
                        </Badge>
                      )}
                    </div>
                    {feature.tier && (
                      <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                        {feature.tier}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="py-4">
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {feature.isPremium && !isPremium ? (
                      <Link href="/premium">
                        <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30">
                          <Lock className="mr-2 h-3 w-3" />
                          Unlock with Premium
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        Learn More
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Premium Plans Call to Action */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-violet-800 dark:text-violet-300">
              <Crown className="mr-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
              Upgrade Your Emotional Journey
            </CardTitle>
            <CardDescription className="text-violet-700 dark:text-violet-400">
              Unlock all premium features and enhance your emotional wellness experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Advanced emotion tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Multiple daily check-ins</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Dynamic theme colors</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/premium">
              <Button className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white">
                View Premium Plans
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default FeatureShowcaseTab;