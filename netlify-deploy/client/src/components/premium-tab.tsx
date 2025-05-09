import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import PremiumPlans from "./premium-plans";
import { Button } from "@/components/ui/button";
import { PremiumUpgradeButton } from "@/components/ui/premium-upgrade-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Coins, Palette, Users, Calendar, Bell, HomeIcon, Sparkles, Music, Fingerprint, Gem } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/use-subscription";

// Premium feature components
import DynamicThemeFeature from "./premium-features/dynamic-theme";
import SocialSharingFeature from "./premium-features/social-sharing";
import MultiCheckinFeature from "./premium-features/multi-checkin";
import NotificationsFeature from "./premium-features/notifications";
import WellnessContentFeature from "./premium-features/wellness-content";
import SmartHomeFeature from "./premium-features/smart-home";
import ClassicalMusicFeature from "./premium-features/classical-music";
import EmotionalImprintsFeature from "./premium-features/emotional-imprints";
import UserNftCollection from "./premium-features/user-nft-collection";

type FeatureTabType = 'plans' | 'themes' | 'social' | 'checkins' | 'notifications' | 'wellness' | 'smarthome' | 'music' | 'imprints' | 'nfts';

export default function PremiumTab() {
  const { user } = useAuth();
  const { isActive, isTrial, tier, expiryDate, cancelSubscriptionMutation } = useSubscription();
  // Determine more specific subscription types
  const isLifetime = tier === 'lifetime';
  const isFamily = tier === 'family';
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTabType>('plans');
  const [, setLocation] = useLocation();
  
  // Fetch token balance
  const { data: tokenData } = useQuery({
    queryKey: ['/api/tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      if (!res.ok) throw new Error('Failed to fetch token balance');
      return res.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  return (
    <section>
      <div className="mb-8">
        {isActive || isTrial ? (
          <div className={`bg-gradient-to-r ${
            isLifetime 
              ? "from-violet-100 to-purple-100 border-violet-200 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800" 
              : isFamily 
                ? "from-indigo-100 to-blue-100 border-indigo-200 dark:from-indigo-900/20 dark:to-blue-900/20 dark:border-indigo-800"
                : isTrial 
                  ? "from-green-100 to-emerald-100 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
                  : "from-amber-100 to-yellow-100 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800"
          } border rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${
                isLifetime 
                  ? "bg-violet-500" 
                  : isFamily 
                    ? "bg-indigo-500"
                    : isTrial 
                      ? "bg-green-500"
                      : "bg-amber-500"
              }`}>
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isLifetime 
                    ? "Lifetime Member" 
                    : isFamily 
                      ? "Family Plan Member"
                      : isTrial 
                        ? "Trial Member"
                        : "Premium Member"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isTrial 
                    ? `Your trial ends on ${expiryDate?.toLocaleDateString()}`
                    : `Your ${tier} subscription ${isLifetime ? "never expires" : `renews on ${expiryDate?.toLocaleDateString()}`}`}
                </p>
              </div>
            </div>
            {!isLifetime && (
              <Button 
                variant="outline" 
                className={`${
                  isLifetime 
                    ? "border-violet-500 text-violet-700 dark:border-violet-600 dark:text-violet-400" 
                    : isFamily 
                      ? "border-indigo-500 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400"
                      : isTrial 
                        ? "border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                        : "border-amber-500 text-amber-700 dark:border-amber-600 dark:text-amber-400"
                }`}
                onClick={() => setActiveFeatureTab('plans')}
              >
                {isTrial ? "Upgrade Subscription" : "Manage Subscription"}
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-500 rounded-full p-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">Unlock advanced features and enhanced experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">{tokenData?.tokens || 0} tokens</span>
              </div>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                onClick={() => setActiveFeatureTab('plans')}
              >
                View Plans
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Tabs */}
      <Tabs value={activeFeatureTab} onValueChange={(value) => setActiveFeatureTab(value as FeatureTabType)}>
        <TabsList className="mb-6 w-full flex overflow-x-auto pb-px" style={{ scrollbarWidth: 'none' }}>
          <TabsTrigger value="plans" className="flex items-center gap-1 flex-shrink-0">
            <Crown className="h-4 w-4" />
            <span>Plans</span>
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-1 flex-shrink-0">
            <Palette className="h-4 w-4" />
            <span>Themes</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 flex-shrink-0">
            <Users className="h-4 w-4" />
            <span>Social</span>
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-4 w-4" />
            <span>Check-ins</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 flex-shrink-0">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-1 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            <span>Wellness</span>
          </TabsTrigger>
          <TabsTrigger value="smarthome" className="flex items-center gap-1 flex-shrink-0">
            <HomeIcon className="h-4 w-4" />
            <span>Smart Home</span>
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center gap-1 flex-shrink-0">
            <Music className="h-4 w-4" />
            <span>Classical Music</span>
          </TabsTrigger>
          <TabsTrigger value="imprints" className="flex items-center gap-1 flex-shrink-0">
            <Fingerprint className="h-4 w-4" />
            <span>Emotional Imprints</span>
          </TabsTrigger>
          <TabsTrigger value="nfts" className="flex items-center gap-1 flex-shrink-0">
            <Gem className="h-4 w-4" />
            <span>NFT Collection</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <PremiumPlans />
        </TabsContent>
        
        <TabsContent value="themes">
          <DynamicThemeFeature />
        </TabsContent>
        
        <TabsContent value="social">
          <SocialSharingFeature />
        </TabsContent>
        
        <TabsContent value="checkins">
          <MultiCheckinFeature />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationsFeature />
        </TabsContent>
        
        <TabsContent value="wellness">
          <WellnessContentFeature />
        </TabsContent>
        
        <TabsContent value="smarthome">
          <SmartHomeFeature />
        </TabsContent>
        
        <TabsContent value="music">
          <ClassicalMusicFeature />
        </TabsContent>
        
        <TabsContent value="imprints">
          <EmotionalImprintsFeature />
        </TabsContent>
        
        <TabsContent value="nfts">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start md:items-center gap-4 flex-col md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-2 rounded-lg">
                  <Gem className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Emotional NFT Collection</h3>
                  <p className="text-sm text-muted-foreground">Collect tokens that evolve with your emotional journey</p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/nft-collection')}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                View Full Collection
              </Button>
            </div>
            <UserNftCollection />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}