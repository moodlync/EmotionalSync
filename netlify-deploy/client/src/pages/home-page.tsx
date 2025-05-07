import { useState, useEffect } from 'react';
import Header from '@/components/header';
import BottomNavigation from '@/components/bottom-navigation';
import ConnectTab from '@/components/connect-tab';
import GlobalMapTab from '@/components/global-map-tab';
import JournalTab from '@/components/journal-tab';
import AICompanionTab from '@/components/ai-companion-tab';
import PremiumTab from '@/components/premium-tab';
import GamificationTab from '@/components/gamification-tab';
import RewardsCard from '@/components/rewards-card';
import MoodSelectionModal from '@/components/mood-selection-modal';
import StreakReminder from '@/components/gamification/streak-reminder';
import Footer from '@/components/footer';
import { EmotionType, emotions } from '@/lib/emotions';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useRewards } from '@/hooks/use-rewards';
import { useGamification } from '@/hooks/use-gamification';
import { useQuery, useMutation } from '@tanstack/react-query';

import { TabType } from '@/types/app-types';

export default function HomePage() {
  const { user } = useAuth();
  const { showTokenEarnedToast } = useRewards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('connect');

  // Fetch the user's current emotion
  const { data: currentEmotion, isLoading: emotionLoading } = useQuery<EmotionType>({
    queryKey: ['/api/emotion', user?.id],
    initialData: 'neutral',
  });

  // Mutation to update the user's emotion
  const updateEmotionMutation = useMutation({
    mutationFn: async (emotion: EmotionType) => {
      const res = await apiRequest('POST', '/api/emotion', { emotion });
      return res.json();
    },
    onSuccess: async (response) => {
      const { emotion, tokensEarned } = response;
      
      // Update emotion in the cache
      queryClient.setQueryData(['/api/emotion', user?.id], emotion);
      
      // Show tokens earned notification if any
      if (tokensEarned > 0) {
        showTokenEarnedToast(
          tokensEarned,
          `updating your emotion to ${emotion}`
        );
      }
      
      try {
        // Also trigger streak check-in when emotion is updated
        const { useGamification } = await import('@/hooks/use-gamification');
        const { checkInStreak } = useGamification();
        const streakResult = await checkInStreak(emotion);
        
        if (streakResult.streakIncreased) {
          // Show toast for streak increase
          const { toast } = await import('@/hooks/use-toast');
          toast({
            title: `${streakResult.currentStreak}-Day Streak!`,
            description: `You earned ${streakResult.tokensAwarded} tokens for maintaining your streak!`,
            variant: 'default',
          });
          
          if (streakResult.achievementUnlocked) {
            toast({
              title: 'Achievement Unlocked!',
              description: `"${streakResult.achievementUnlocked.title}"`,
              variant: 'default',
            });
          }
        } else if (streakResult.streakReset && streakResult.currentStreak === 1) {
          // Show toast for new streak
          const { toast } = await import('@/hooks/use-toast');
          toast({
            title: 'New Streak Started!',
            description: `You earned ${streakResult.tokensAwarded} tokens for checking in today.`,
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
      
      // Refresh all relevant data
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/achievements'] });
    },
  });

  const handleEmotionChange = (emotion: EmotionType) => {
    updateEmotionMutation.mutate(emotion);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const emotion = emotions[currentEmotion || 'neutral'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 pb-20 flex-grow">
        {/* Current Mood Display */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <div className="bg-white rounded-full p-3 shadow-md mb-3">
            <div 
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${emotion.backgroundColor} flex items-center justify-center emotion-pulse ${emotion.id === 'happy' ? 'text-yellow-800' : 'text-white'}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="w-10 h-10 md:w-12 md:h-12"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={emotion.icon} />
              </svg>
            </div>
          </div>
          <h2 className="font-poppins font-semibold text-lg text-center flex items-center justify-center">
            You're feeling <span className={`text-${emotion.id} mx-1`}>{emotion.name.toLowerCase()}</span> 
            <span className="text-xl ml-1">{emotion.emoji}</span> right now
          </h2>
          <button 
            onClick={openModal}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center"
          >
            <span>Change mood</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-4 h-4 ml-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>
        
        {/* Streak Reminder */}
        <StreakReminder 
          onCheckIn={() => updateEmotionMutation.mutate(currentEmotion || 'neutral')} 
          className="mb-6" 
        />

        {/* Tabbed Content */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto space-x-4 md:space-x-8 pb-1 md:pb-0">
              <button 
                onClick={() => setActiveTab('connect')}
                className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === 'connect' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Connect
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === 'map' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Global Map
              </button>
              <button 
                onClick={() => setActiveTab('journal')}
                className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === 'journal' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Journal
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                AI Companion
              </button>
              <button 
                onClick={() => setActiveTab('premium')}
                className={`py-2 px-1 font-medium whitespace-nowrap flex items-center ${activeTab === 'premium' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-amber-600 hover:text-amber-700'}`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4 mr-1"
                >
                  <path d="M6 3l1.7 4.3L12 5l4.3 2.3L18 3l.9 5.2L24 12l-5.1 3.8-.9 5.2-4.3-2.3L12 21l-4.3-2.3L3 21l-.9-5.2L-3 12l5.1-3.8L3 3z"></path>
                </svg>
                Premium
              </button>
              <button 
                onClick={() => setActiveTab('gamification')}
                className={`py-2 px-1 font-medium whitespace-nowrap flex items-center ${activeTab === 'gamification' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4 mr-1"
                >
                  <path d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-8-1a1 1 0 100-2 1 1 0 000 2zm1 2a1 1 0 11-2 0 1 1 0 012 0z"></path>
                </svg>
                Challenges
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'connect' && <ConnectTab currentEmotion={currentEmotion || 'neutral'} />}
        {activeTab === 'map' && <GlobalMapTab />}
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'ai' && <AICompanionTab currentEmotion={currentEmotion || 'neutral'} />}
        {activeTab === 'premium' && <PremiumTab />}
        {activeTab === 'gamification' && (
          <div>
            <GamificationTab />
            
            {/* Quick Access Gamification UI appears when gamification tab is not selected */}
            <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-10">
              <button 
                onClick={() => updateEmotionMutation.mutate(currentEmotion || 'neutral')}
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg"
                title="Check in to maintain your streak"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Import and use the Footer component */}
      <Footer />
      
      <MoodSelectionModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSelectEmotion={handleEmotionChange}
      />
    </div>
  );
}
