import { useState, useEffect } from 'react';
import ConnectTab from '@/components/connect-tab';
import GlobalMapTab from '@/components/global-map-tab';
import JournalTab from '@/components/journal-tab';
import AICompanionTab from '@/components/ai-companion-tab';
import PremiumTab from '@/components/premium-tab';
import GamificationTab from '@/components/gamification-tab';
import RewardsCard from '@/components/rewards-card';
import MoodSelectionModal from '@/components/mood-selection-modal';
import StreakReminder from '@/components/gamification/streak-reminder';
import BottomNavigation from '@/components/bottom-navigation';
import MainLayout from '@/components/layout/main-layout';
import Footer from '@/components/footer';
import { EmotionType, emotions } from '@/lib/emotions';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useRewards } from '@/hooks/use-rewards';
import { useGamification } from '@/hooks/use-gamification';
import { useQuery, useMutation } from '@tanstack/react-query';
import DynamicFeatures from '@/components/subscription/dynamic-features';
import SubscriptionBanner from '@/components/subscription/subscription-banner';
import SEOHead from '@/components/seo/seo-head';
import { seoConfig } from '@/components/seo/seo-config';

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
    <MainLayout>
      <SEOHead 
        title={`MoodLync - ${emotion?.name || 'Mood Tracking'}`}
        description={`Track your emotional well-being and connect with people who share your emotional state. Currently feeling ${emotion?.name || 'neutral'}.`}
        keywords={[`${emotion?.name || 'neutral'} mood`, 'emotional wellness', 'mood tracking', 'emotion matching', 'mental health app', ...seoConfig.home.keywords]}
      />
      <main className="container mx-auto px-4 pt-6 pb-20 flex-grow">
        {/* Enhanced Mood Snapshot (Hero Section) with improved visual effects */}
        <div className="flex flex-col items-center mb-8 md:mb-12 relative">
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10 -z-10">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M 50 200 C 100 100 300 100 350 200 C 300 300 100 300 50 200" 
                fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse-slow" 
                style={{animationDuration: '60s'}} />
              <path d="M 75 150 C 125 50 275 50 325 150 C 275 250 125 250 75 150" 
                fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse-slow" 
                style={{animationDuration: '70s', animationDelay: '2s'}} />
              <path d="M 75 250 C 125 150 275 150 325 250 C 275 350 125 350 75 250" 
                fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse-slow" 
                style={{animationDuration: '80s', animationDelay: '5s'}} />
            </svg>
          </div>
          
          <div className="relative">
            {/* Multi-layered background glow effect */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-40 z-0 blur-xl"
              style={{ 
                background: `radial-gradient(circle, ${emotion.backgroundColor.replace('bg-', '').startsWith('gradient') 
                ? 'rgba(159, 122, 234, 0.6)' 
                : emotion.backgroundColor.replace('bg-', '').startsWith('blue') 
                  ? 'rgba(63, 131, 248, 0.6)' 
                  : emotion.backgroundColor.replace('bg-', '').startsWith('green') 
                    ? 'rgba(48, 169, 100, 0.6)' 
                    : emotion.backgroundColor.replace('bg-', '').startsWith('red') 
                      ? 'rgba(239, 68, 68, 0.6)' 
                      : emotion.backgroundColor.replace('bg-', '').startsWith('yellow') 
                        ? 'rgba(249, 168, 37, 0.6)' 
                        : 'rgba(107, 114, 128, 0.6)'} 60%, transparent)`,
                animation: 'pulse-slow 50s infinite ease-in-out'
              }}
            ></div>
            
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full opacity-30 z-0 blur-lg"
              style={{ 
                background: `radial-gradient(circle, ${emotion.backgroundColor.replace('bg-', '').startsWith('gradient') 
                ? 'rgba(159, 122, 234, 0.7)' 
                : emotion.backgroundColor.replace('bg-', '').startsWith('blue') 
                  ? 'rgba(63, 131, 248, 0.7)' 
                  : emotion.backgroundColor.replace('bg-', '').startsWith('green') 
                    ? 'rgba(48, 169, 100, 0.7)' 
                    : emotion.backgroundColor.replace('bg-', '').startsWith('red') 
                      ? 'rgba(239, 68, 68, 0.7)' 
                      : emotion.backgroundColor.replace('bg-', '').startsWith('yellow') 
                        ? 'rgba(249, 168, 37, 0.7)' 
                        : 'rgba(107, 114, 128, 0.7)'} 70%, transparent)`,
                animation: 'pulse-slow 40s infinite ease-in-out reverse'
              }}
            ></div>
            
            {/* Main mood orb container */}
            <div className="bg-white dark:bg-gray-800 rounded-full p-5 shadow-xl mb-4 relative z-10 border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Subtle particle effects */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-1/4 left-1/2 h-1 w-1 rounded-full bg-current opacity-60 animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-3/4 left-1/4 h-1 w-1 rounded-full bg-current opacity-60 animate-pulse" style={{animationDelay: '0.7s'}}></div>
                <div className="absolute top-2/4 left-3/4 h-1 w-1 rounded-full bg-current opacity-60 animate-pulse" style={{animationDelay: '1.3s'}}></div>
              </div>
              
              {/* Main mood orb */}
              <div 
                className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${emotion.backgroundColor} flex items-center justify-center emotion-orb relative overflow-hidden ${emotion.id === 'happy' ? 'text-yellow-800' : 'text-white'}`}
                style={{
                  animation: 'mood-pulse 40s infinite ease-in-out',
                  boxShadow: `0 0 30px 5px ${emotion.backgroundColor.replace('bg-', '').startsWith('gradient') 
                    ? 'rgba(159, 122, 234, 0.4)' 
                    : emotion.backgroundColor.replace('bg-', '').startsWith('blue') 
                      ? 'rgba(63, 131, 248, 0.4)' 
                      : emotion.backgroundColor.replace('bg-', '').startsWith('green') 
                        ? 'rgba(48, 169, 100, 0.4)' 
                        : emotion.backgroundColor.replace('bg-', '').startsWith('red') 
                          ? 'rgba(239, 68, 68, 0.4)' 
                          : emotion.backgroundColor.replace('bg-', '').startsWith('yellow') 
                            ? 'rgba(249, 168, 37, 0.4)' 
                            : 'rgba(107, 114, 128, 0.4)'}, inset 0 0 20px 0 rgba(255, 255, 255, 0.15)`
                }}
              >
                {/* Interior wave effect */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -inset-1 rounded-full" 
                    style={{
                      background: `radial-gradient(ellipse at center, transparent 50%, rgba(255, 255, 255, 0.2) 100%)`,
                      animation: 'pulse-slow 30s infinite ease-in-out'
                    }}
                  ></div>
                </div>
                
                {/* Emotion icon with subtle animation */}
                <div className="relative animate-heartbeat" style={{animationDuration: '8s'}}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-16 h-16 md:w-20 md:h-20 drop-shadow-md"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={emotion.icon} />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced mood text with better gradient and animation */}
          <div className="animate-fadeInDown" style={{animationDuration: '0.8s'}}>
            <h2 className="font-poppins font-semibold text-xl md:text-2xl text-center flex items-center justify-center mb-2">
              You're feeling <span className="mx-1.5 font-bold px-2 py-0.5 rounded-full" 
                style={{
                  background: `linear-gradient(135deg, ${emotion.backgroundColor.replace('bg-', '').startsWith('gradient') 
                    ? '#9f7aea, #7f63d3' 
                    : emotion.backgroundColor.replace('bg-', '').startsWith('blue') 
                      ? '#3f83f8, #1a56db' 
                      : emotion.backgroundColor.replace('bg-', '').startsWith('green') 
                        ? '#30a964, #1e7e45' 
                        : emotion.backgroundColor.replace('bg-', '').startsWith('red') 
                          ? '#ef4444, #dc2626' 
                          : emotion.backgroundColor.replace('bg-', '').startsWith('yellow') 
                            ? '#f9a825, #f59e0b' 
                            : '#6b7280, #4b5563'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(255,255,255,0.15)'
                }}
              >{emotion.name.toLowerCase()}</span> 
              <span className="text-2xl md:text-3xl ml-1 animate-micro-bounce">{emotion.emoji}</span>
            </h2>
            
            {/* Mood description text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3 max-w-xs mx-auto">
              {emotion.description}. {emotion.message.split(' ').slice(0, 6).join(' ')}...
            </p>
          </div>
          
          {/* Weekly streak stats with enhanced visual appeal */}
          <div className="mt-1 mb-4 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium flex items-center shadow-sm border border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16z"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Weekly streak: <span className="font-semibold">5 days</span></span>
              <span className="ml-1.5 animate-micro-bounce">🔥</span>
            </div>
          </div>
          
          {/* Enhanced change mood button */}
          <button 
            onClick={openModal}
            className="mt-1 text-primary hover:text-white hover:bg-primary/90 text-sm font-medium flex items-center bg-white dark:bg-gray-800/90 hover:bg-primary/80 dark:hover:bg-primary/80 transition-all duration-300 rounded-full py-2.5 px-5 shadow-sm border border-gray-200 dark:border-gray-700 group"
          >
            <span>Change mood</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>
        
        {/* Enhanced Live Mood Map Preview */}
        {/* Subscription Banner - Shows different content based on subscription tier */}
        <SubscriptionBanner />
        
        {/* Dynamic Features Grid - Shows different features based on subscription tier */}
        <DynamicFeatures />
        
        {/* Enhanced Live Mood Map Preview */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5 relative overflow-hidden border border-gray-100/30 dark:border-gray-700/30 shadow-sm">
          {/* Background pattern with animation */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M 100 100 C 200 50 300 50 400 100 C 500 150 600 150 700 100" 
                fill="none" stroke="currentColor" strokeWidth="1" className="animate-float" style={{animationDuration: '15s'}}/>
              <path d="M 100 200 C 200 150 300 150 400 200 C 500 250 600 250 700 200" 
                fill="none" stroke="currentColor" strokeWidth="1" className="animate-float" style={{animationDuration: '20s', animationDelay: '2s'}}/>
              <path d="M 100 300 C 200 250 300 250 400 300 C 500 350 600 350 700 300" 
                fill="none" stroke="currentColor" strokeWidth="1" className="animate-float" style={{animationDuration: '25s', animationDelay: '5s'}}/>
              <circle cx="150" cy="150" r="2" fill="currentColor" className="animate-pulse" style={{animationDuration: '3s'}}/>
              <circle cx="650" cy="250" r="2" fill="currentColor" className="animate-pulse" style={{animationDuration: '4s'}}/>
              <circle cx="350" cy="350" r="2" fill="currentColor" className="animate-pulse" style={{animationDuration: '5s'}}/>
            </svg>
          </div>
          
          {/* Section header with icon */}
          <div className="flex items-center mb-3 relative z-10">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-1.5 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <h3 className="text-md font-semibold">Live Mood Map</h3>
            <div className="ml-2 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Live</span>
            </div>
          </div>
          
          {/* Enhanced map preview with more visually appealing elements */}
          <div className="relative h-32 mb-3 overflow-hidden rounded-lg bg-gray-900/10 dark:bg-gray-900/40 backdrop-blur-sm z-10 border border-gray-200/20 dark:border-gray-700/30">
            {/* Map background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-gray-900/30 dark:from-gray-800/30 dark:to-gray-900/50"></div>
            
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div key={`h-line-${i}`} className="absolute h-px w-full bg-white/30 dark:bg-white/20" style={{ top: `${i * 20}%` }}></div>
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={`v-line-${i}`} className="absolute w-px h-full bg-white/30 dark:bg-white/20" style={{ left: `${i * 20}%` }}></div>
              ))}
            </div>
            
            {/* Enhanced mood globe with better positioning and effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-20 h-20 rounded-full bg-gray-800/30 dark:bg-gray-800/60 border border-gray-600/30 dark:border-gray-600/50 overflow-hidden backdrop-blur-sm">
                {/* Globe grid lines */}
                <div className="absolute inset-0 rounded-full" style={{ 
                  background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`,
                  boxShadow: 'inset 0 0 15px rgba(255,255,255,0.1)' 
                }}></div>
                
                {/* Animated mood dots - representing different emotions around the world */}
                <div className="absolute top-3 left-6 h-2.5 w-2.5 rounded-full bg-blue-500 opacity-80 animate-pulse shadow-md shadow-blue-500/50">
                  <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-white rounded-full opacity-70"></span>
                </div>
                <div className="absolute top-8 left-10 h-2 w-2 rounded-full bg-green-400 opacity-80 animate-pulse shadow-sm shadow-green-400/50" style={{animationDelay: '0.5s'}}>
                  <span className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-70"></span>
                </div>
                <div className="absolute top-11 left-4 h-2 w-2 rounded-full bg-amber-400 opacity-80 animate-pulse shadow-sm shadow-amber-400/50" style={{animationDelay: '1s'}}>
                  <span className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-70"></span>
                </div>
                <div className="absolute top-5 left-13 h-1.5 w-1.5 rounded-full bg-purple-400 opacity-70 animate-pulse shadow-sm shadow-purple-400/50" style={{animationDelay: '1.5s'}}>
                  <span className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-70"></span>
                </div>
                <div className="absolute top-14 left-8 h-1.5 w-1.5 rounded-full bg-red-400 opacity-70 animate-pulse shadow-sm shadow-red-400/50" style={{animationDelay: '2s'}}>
                  <span className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-70"></span>
                </div>
                
                {/* Subtle pulse effect */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animationDuration: '3s'
                }}></div>
              </div>
            </div>
            
            {/* Stats indicators */}
            <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
              <div className="text-xs text-white/70 backdrop-blur-sm bg-black/20 rounded-full px-2 py-0.5 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
                <span>248 happy</span>
              </div>
              <div className="text-xs text-white/70 backdrop-blur-sm bg-black/20 rounded-full px-2 py-0.5 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                <span>127 calm</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons with improved styling */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Updated 2 min ago</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('connect')}
                className="token-button bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full px-3 py-1.5 flex items-center transition-colors border border-gray-200/50 dark:border-gray-700/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span>Find Match</span>
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className="token-button bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-full px-3 py-1.5 flex items-center transition-colors border border-primary/10 dark:border-primary/20 group"
              >
                <span>See Full Map</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Streak Reminder with enhanced styling */}
        <StreakReminder 
          onCheckIn={() => updateEmotionMutation.mutate(currentEmotion || 'neutral')} 
          className="mb-8" 
        />

        {/* Enhanced Tabbed Content */}
        <div className="mb-8">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5 overflow-hidden">
              <svg viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M 0 50 C 200 100 400 0 600 50 C 700 75 800 25 1000 50" 
                  fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            
            {/* Enhanced tab navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 relative z-10">
              <nav className="flex -mb-px overflow-x-auto space-x-1 md:space-x-2 px-1 py-1 md:py-0 scrollbar-hide">
                <button 
                  onClick={() => setActiveTab('connect')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'connect' 
                    ? 'text-primary bg-primary/10 border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"></path>
                    <path d="M3 15h6"></path>
                    <path d="M16 8a2 2 0 1 1 4 0c0 .38-.1.73-.29 1.03L12 21.5l-4-3 8.5-10.4A2.1 2.1 0 0 1 16 8z"></path>
                  </svg>
                  <span>Connect</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'map' 
                    ? 'text-primary bg-primary/10 border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M 12 2 a 15 15 0 0 1 0 20 z"></path>
                    <path d="M 2 12 h 20"></path>
                  </svg>
                  <span>Global Map</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('journal')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'journal' 
                    ? 'text-primary bg-primary/10 border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Journal</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'ai' 
                    ? 'text-primary bg-primary/10 border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                    <circle cx="7.5" cy="14.5" r=".5" fill="currentColor"></circle>
                    <circle cx="16.5" cy="14.5" r=".5" fill="currentColor"></circle>
                  </svg>
                  <span>AI Companion</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('premium')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'premium' 
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-b-2 border-amber-500' 
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M6 3l1.7 4.3L12 5l4.3 2.3L18 3l.9 5.2L24 12l-5.1 3.8-.9 5.2-4.3-2.3L12 21l-4.3-2.3L3 21l-.9-5.2L-3 12l5.1-3.8L3 3z"></path>
                  </svg>
                  <span>Premium</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('gamification')}
                  className={`py-2 px-3 rounded-t-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'gamification' 
                    ? 'text-primary bg-primary/10 border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-8-1a1 1 0 100-2 1 1 0 000 2zm1 2a1 1 0 11-2 0 1 1 0 012 0z"></path>
                  </svg>
                  <span>Challenges</span>
                </button>
              </nav>
            </div>
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
      
      <MoodSelectionModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSelectEmotion={handleEmotionChange}
      />
    </MainLayout>
  );
}
