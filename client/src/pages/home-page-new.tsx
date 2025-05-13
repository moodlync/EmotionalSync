import { useState } from 'react';
import ConnectTab from '@/components/connect-tab';
import GlobalMapTab from '@/components/global-map-tab';
import JournalTab from '@/components/journal-tab';
import AICompanionTab from '@/components/ai-companion-tab';
import PremiumTab from '@/components/premium-tab';
import GamificationTab from '@/components/gamification-tab';
import RewardsCard from '@/components/rewards-card';
import StreakReminder from '@/components/gamification/streak-reminder';
import BottomNavigation from '@/components/bottom-navigation';
import MainLayout from '@/components/layout/main-layout';
import Footer from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useRewards } from '@/hooks/use-rewards';
import { useGamification } from '@/hooks/use-gamification';
import { useQuery } from '@tanstack/react-query';
import DynamicFeatures from '@/components/subscription/dynamic-features';
import SubscriptionBanner from '@/components/subscription/subscription-banner';
import SEOHead from '@/components/seo/seo-head';
import { seoConfig } from '@/components/seo/seo-config';
import { MoodCard } from '@/components/mood-card';
import { type EmotionType } from '@/lib/emotions';

// Import types
import { TabType } from '@/types/app-types';

export default function HomePage() {
  const { user } = useAuth();
  const { showTokenEarnedToast } = useRewards();
  const [activeTab, setActiveTab] = useState<TabType>('connect');

  // Fetch the user's current emotion
  const { data: emotionData, isLoading: emotionLoading } = useQuery({
    queryKey: ['/api/emotion', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/emotion');
      const data = await response.json();
      
      // Return data in a consistent format
      return {
        emotion: data.emotion || 'neutral'
      };
    },
    enabled: !!user,
  });

  // Handle emotion updates from MoodCard
  const handleEmotionUpdate = (newEmotion: EmotionType) => {
    console.log("Home page received emotion update:", newEmotion);
    
    // Show tokens earned toast if applicable
    showTokenEarnedToast(5, "sharing your mood");
  };

  // Get user's current emotion or default to neutral
  const currentEmotion = emotionData?.emotion || "neutral";

  // Get the user's current subscription plan
  const { subscription, isTrialActive, daysLeftInTrial, isSubscriptionActive } = useSubscription();
  
  // Get the user's current streak data
  const { currentStreak, isStreakAtRisk } = useGamification();

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
      />
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Left sidebar with user mood and rewards */}
            <div className="md:col-span-1 space-y-6">
              {/* Current Mood Card */}
              <MoodCard 
                currentEmotion={currentEmotion as EmotionType} 
                userId={user?.id}
                onEmotionUpdate={handleEmotionUpdate}
              />
              
              {/* Rewards Card */}
              <RewardsCard />
              
              {/* Streak Reminder */}
              {isStreakAtRisk && currentStreak > 0 && (
                <StreakReminder 
                  currentStreak={currentStreak} 
                />
              )}
              
              {/* Subscription Banner */}
              {!isSubscriptionActive && (
                <SubscriptionBanner 
                  isTrialActive={isTrialActive} 
                  daysLeftInTrial={daysLeftInTrial} 
                />
              )}
            </div>
            
            {/* Main content area with tabs */}
            <div className="md:col-span-2 space-y-6">
              {/* Dynamic Features - shown based on the user's subscription status */}
              <DynamicFeatures subscription={subscription} />
              
              {/* Tabs for different content sections */}
              <div className="bg-white rounded-lg shadow-md p-4">
                {activeTab === 'connect' && <ConnectTab />}
                {activeTab === 'map' && <GlobalMapTab />}
                {activeTab === 'journal' && <JournalTab />}
                {activeTab === 'ai' && <AICompanionTab />}
                {activeTab === 'premium' && <PremiumTab />}
                {activeTab === 'gamification' && <GamificationTab />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
        
        {/* Footer */}
        <Footer />
      </MainLayout>
    </>
  );
}