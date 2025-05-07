import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Users, ThumbsUp, MessageSquare, Share2, Eye, Download, Bookmark, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ProfileMetrics() {
  const { user } = useAuth();
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/user/profile-analytics"],
    enabled: !!user?.isPremium,
  });

  if (!user?.isPremium) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Premium Analytics</CardTitle>
          <CardDescription>
            Upgrade to premium to access detailed analytics about your profile and content.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text text-4xl font-bold mb-4">
              Premium Feature
            </div>
            <p className="text-muted-foreground mb-4">
              View detailed statistics about your content and audience
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Profile Analytics</CardTitle>
          <CardDescription>Loading your analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="col-span-3">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Analytics</CardTitle>
            <CardDescription>
              View statistics about your content and followers
            </CardDescription>
          </div>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<Users className="h-5 w-5 text-blue-500" />}
              title="Followers"
              value={metrics?.followerCount || 0}
              footer="Total followers"
            />
            <StatCard 
              icon={<Eye className="h-5 w-5 text-purple-500" />}
              title="Views"
              value={metrics?.totalViews || 0}
              footer="Total video views"
            />
            <StatCard 
              icon={<ThumbsUp className="h-5 w-5 text-green-500" />}
              title="Likes"
              value={metrics?.totalLikes || 0}
              footer="Total likes received"
            />
            <StatCard 
              icon={<Share2 className="h-5 w-5 text-orange-500" />}
              title="Shares"
              value={metrics?.totalShares || 0}
              footer="Total shares"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Engagement Rate</h3>
            <div className="flex items-center gap-2">
              <Progress 
                value={calculateEngagementRate(metrics) * 100} 
                max={100} 
                className="h-2" 
              />
              <span className="text-sm text-muted-foreground">
                {(calculateEngagementRate(metrics) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Engagement rate is calculated as (likes + comments + shares) / views
            </p>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<BarChart className="h-5 w-5 text-indigo-500" />}
              title="Videos"
              value={metrics?.totalVideos || 0}
              footer="Total videos posted"
            />
            <StatCard 
              icon={<Eye className="h-5 w-5 text-purple-500" />}
              title="Avg. Views"
              value={calculateAverageViews(metrics) || 0}
              footer="Average views per video"
            />
            <StatCard 
              icon={<ThumbsUp className="h-5 w-5 text-green-500" />}
              title="Avg. Likes"
              value={calculateAverageLikes(metrics) || 0}
              footer="Average likes per video"
            />
            <StatCard 
              icon={<Download className="h-5 w-5 text-rose-500" />}
              title="Downloads"
              value={metrics?.totalDownloads || 0}
              footer="Total downloads"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Most Popular Categories</h3>
            {metrics?.categoryStats && Object.entries(metrics.categoryStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(metrics.categoryStats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{formatCategory(category)}</span>
                        <span className="text-sm text-muted-foreground">{count} videos</span>
                      </div>
                      <Progress 
                        value={count} 
                        max={metrics.totalVideos} 
                        className="h-1.5" 
                      />
                    </div>
                  ))
                }
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No category data available</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<MessageSquare className="h-5 w-5 text-amber-500" />}
              title="Comments"
              value={metrics?.totalComments || 0}
              footer="Total comments"
            />
            <StatCard 
              icon={<Share2 className="h-5 w-5 text-orange-500" />}
              title="Shares"
              value={metrics?.totalShares || 0}
              footer="Total shares"
            />
            <StatCard 
              icon={<Bookmark className="h-5 w-5 text-blue-500" />}
              title="Saves"
              value={metrics?.totalSaves || 0}
              footer="Total saves"
            />
            <StatCard 
              icon={<Users className="h-5 w-5 text-indigo-500" />}
              title="Video Followers"
              value={metrics?.totalVideoFollows || 0}
              footer="Total video followers"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Interaction Breakdown</h3>
            <div className="h-[180px] flex items-end gap-2">
              {renderInteractionBar('Likes', metrics?.totalLikes, 'bg-green-500', metrics)}
              {renderInteractionBar('Comments', metrics?.totalComments, 'bg-amber-500', metrics)}
              {renderInteractionBar('Shares', metrics?.totalShares, 'bg-orange-500', metrics)}
              {renderInteractionBar('Saves', metrics?.totalSaves, 'bg-blue-500', metrics)}
              {renderInteractionBar('Follows', metrics?.totalVideoFollows, 'bg-indigo-500', metrics)}
              {renderInteractionBar('Downloads', metrics?.totalDownloads, 'bg-rose-500', metrics)}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Likes</span>
              <span>Comments</span>
              <span>Shares</span>
              <span>Saves</span>
              <span>Follows</span>
              <span>Downloads</span>
            </div>
          </div>
        </TabsContent>
      </CardContent>
    </Tabs>
  );
}

function StatCard({ icon, title, value, footer }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatNumber(value)}
        </div>
        <p className="text-xs text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
  );
}

function calculateEngagementRate(metrics) {
  if (!metrics || !metrics.totalViews || metrics.totalViews === 0) {
    return 0;
  }
  
  const interactions = (metrics.totalLikes || 0) + 
                      (metrics.totalComments || 0) + 
                      (metrics.totalShares || 0);
  
  return Math.min(interactions / metrics.totalViews, 1);
}

function calculateAverageViews(metrics) {
  if (!metrics || !metrics.totalVideos || metrics.totalVideos === 0) {
    return 0;
  }
  
  return Math.round(metrics.totalViews / metrics.totalVideos);
}

function calculateAverageLikes(metrics) {
  if (!metrics || !metrics.totalVideos || metrics.totalVideos === 0) {
    return 0;
  }
  
  return Math.round(metrics.totalLikes / metrics.totalVideos);
}

function formatNumber(num) {
  if (num === undefined || num === null) return 0;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
}

function formatCategory(category) {
  if (!category) return '';
  
  return category.replace(/_/g, ' ');
}

function renderInteractionBar(label, value, bgColor, metrics) {
  if (!metrics) return null;
  
  const maxValue = Math.max(
    metrics.totalLikes || 0,
    metrics.totalComments || 0,
    metrics.totalShares || 0,
    metrics.totalSaves || 0,
    metrics.totalVideoFollows || 0,
    metrics.totalDownloads || 0
  );
  
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const height = Math.max(percentage, 5); // Minimum height of 5%
  
  return (
    <div className="flex-1 flex flex-col items-center justify-end">
      <div className="relative w-full flex justify-center mb-1">
        <span className="absolute -top-6 text-xs font-medium">
          {formatNumber(value)}
        </span>
      </div>
      <div 
        className={`w-full ${bgColor} rounded-t`} 
        style={{ height: `${height}%` }}
      ></div>
    </div>
  );
}