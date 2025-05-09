import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  LineChart, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  Brain, 
  TrendingUp,
  Flame,
  Layers,
  MessageCircle,
  Coins,
  PieChart,
  Star
} from "lucide-react";

interface UserBehaviorStudy {
  timestamp: string;
  studyId: string;
  overview: {
    totalUsers: number;
    activeUsers: number;
    activeUserRate: number;
    premiumUsers: number;
    premiumConversionRate: number;
  };
  trends: {
    dailyActiveUsers: Array<{
      date: string;
      count: number;
    }>;
    retentionByWeek: Array<{
      week: number;
      rate: number;
    }>;
  };
  engagement: {
    emotionDistribution: Array<{
      emotion: string;
      count: number;
    }>;
    contentEngagement: Array<{
      contentType: string;
      views: number;
      interactions: number;
    }>;
    tokenTransactions: Array<{
      type: string;
      count: number;
      tokens: number;
    }>;
  };
}

interface StudyRecommendation {
  timestamp: string;
  recommendationId: string;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    implementation: 'HIGH' | 'MEDIUM' | 'LOW';
    metrics: string[];
  }>;
}

export default function AdminStudyPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("study");
  const [studyData, setStudyData] = useState<UserBehaviorStudy | null>(null);
  const [recommendationsData, setRecommendationsData] = useState<StudyRecommendation | null>(null);
  
  // Mutations for the study page
  const studyUserBehaviorMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/study/user-behavior");
      if (!response.ok) throw new Error("Failed to study user behavior");
      return await response.json();
    },
    onSuccess: (data: UserBehaviorStudy) => {
      setStudyData(data);
      toast({
        title: "User behavior study completed",
        description: "The study results are ready for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Study failed",
        description: error instanceof Error ? error.message : "Failed to study user behavior",
        variant: "destructive",
      });
    }
  });
  
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/study/recommendations");
      if (!response.ok) throw new Error("Failed to generate recommendations");
      return await response.json();
    },
    onSuccess: (data: StudyRecommendation) => {
      setRecommendationsData(data);
      setActiveTab("recommendations");
      toast({
        title: "Recommendations generated",
        description: "AI-powered recommendations are ready for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Recommendation generation failed",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
    }
  });
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return 'bg-red-500 hover:bg-red-600';
      case 'MEDIUM':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'LOW':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const getImplementationColor = (implementation: string) => {
    switch (implementation) {
      case 'HIGH':
        return 'bg-red-500 hover:bg-red-600';
      case 'MEDIUM':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'LOW':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Experience':
        return <Users className="h-5 w-5" />;
      case 'Feature Enhancement':
        return <Star className="h-5 w-5" />;
      case 'Retention':
        return <TrendingUp className="h-5 w-5" />;
      case 'Premium Conversion':
        return <Flame className="h-5 w-5" />;
      case 'Content Strategy':
        return <Layers className="h-5 w-5" />;
      case 'Community Engagement':
        return <MessageCircle className="h-5 w-5" />;
      case 'Token Economy':
        return <Coins className="h-5 w-5" />;
      case 'User Interface':
        return <PieChart className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };
  
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Behavior Study</h1>
            <p className="text-muted-foreground mt-1">
              Analyze user behavior patterns and generate insights for platform improvement
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => studyUserBehaviorMutation.mutate()}
              disabled={studyUserBehaviorMutation.isPending}
              variant="default"
              className="gap-2"
            >
              {studyUserBehaviorMutation.isPending ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {studyUserBehaviorMutation.isPending ? "Analyzing..." : "Study User Behavior"}
            </Button>
            <Button
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending || !studyData}
              variant="outline"
              className="gap-2"
            >
              {generateRecommendationsMutation.isPending ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              {generateRecommendationsMutation.isPending ? "Generating..." : "Generate Recommendations"}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="study" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Study Results
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                disabled={!recommendationsData}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="study" className="space-y-6 mt-6">
              {!studyData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>User Behavior Study</CardTitle>
                    <CardDescription>
                      Study user behavior patterns to improve platform experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Study Data Available</h3>
                      <p className="text-muted-foreground max-w-md">
                        Start a new user behavior study to analyze platform usage patterns, 
                        emotion trends, token economy, and user engagement metrics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Overview</CardTitle>
                      <CardDescription>Key user statistics and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Total Users</h4>
                          <div className="text-2xl font-bold">{studyData.overview.totalUsers.toLocaleString()}</div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Active Users (30d)</h4>
                          <div className="text-2xl font-bold">{studyData.overview.activeUsers.toLocaleString()}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <span>{studyData.overview.activeUserRate.toFixed(1)}% of total</span>
                                <span>{studyData.overview.activeUserRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={studyData.overview.activeUserRate} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Premium Users</h4>
                          <div className="text-2xl font-bold">{studyData.overview.premiumUsers.toLocaleString()}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <span>Conversion rate</span>
                                <span>{studyData.overview.premiumConversionRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={studyData.overview.premiumConversionRate} className="bg-muted" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Study ID</h4>
                          <div className="text-xl font-mono">{studyData.studyId}</div>
                          <div className="text-sm text-muted-foreground">
                            Generated {new Date(studyData.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Top Emotions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Emotions</CardTitle>
                      <CardDescription>Most tracked emotions across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {studyData.engagement.emotionDistribution.slice(0, 5).map((emotion, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{emotion.emotion}</div>
                              <div className="text-muted-foreground">{emotion.count.toLocaleString()} logs</div>
                            </div>
                            <Progress 
                              value={(emotion.count / studyData.engagement.emotionDistribution[0].count) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Retention */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Retention by Week</CardTitle>
                      <CardDescription>User retention rates over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 grid-cols-8">
                        {studyData.trends.retentionByWeek.map((week, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="font-medium mb-2">Week {week.week}</div>
                            <div className="h-32 w-6 bg-muted rounded-t-md relative">
                              <div 
                                className="absolute bottom-0 w-full bg-primary rounded-t-md"
                                style={{ height: `${week.rate}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">{week.rate}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Token Economy */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Token Economy</CardTitle>
                      <CardDescription>Token generation distribution by activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-4">Activity Counts</h4>
                            <div className="space-y-4">
                              {studyData.engagement.tokenTransactions.map((transaction, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">{transaction.type}</div>
                                    <div className="text-muted-foreground">{transaction.count.toLocaleString()}</div>
                                  </div>
                                  <Progress 
                                    value={(transaction.count / studyData.engagement.tokenTransactions[0].count) * 100} 
                                    className="h-2" 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-4">Token Distribution</h4>
                            <div className="space-y-4">
                              {studyData.engagement.tokenTransactions.map((transaction, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">{transaction.type}</div>
                                    <div className="text-muted-foreground">{transaction.tokens.toLocaleString()}</div>
                                  </div>
                                  <Progress 
                                    value={(transaction.tokens / studyData.engagement.tokenTransactions[0].tokens) * 100} 
                                    className="h-2" 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              {!recommendationsData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>
                      AI-generated recommendations based on user behavior analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Recommendations Available</h3>
                      <p className="text-muted-foreground max-w-md">
                        Run a user behavior study first, then generate AI recommendations to
                        improve platform engagement and user satisfaction.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {recommendationsData.recommendations.map((recommendation, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="px-2 py-1">
                            {getCategoryIcon(recommendation.category)}
                            <span className="ml-1">{recommendation.category}</span>
                          </Badge>
                        </div>
                        <CardTitle>{recommendation.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {recommendation.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 mb-4">
                          {recommendation.metrics.map((metric, idx) => (
                            <Badge key={idx} variant="outline">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Impact:</span>
                          <Badge className={getImpactColor(recommendation.impact)}>
                            {recommendation.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Implementation:</span>
                          <Badge className={getImplementationColor(recommendation.implementation)}>
                            {recommendation.implementation}
                          </Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}