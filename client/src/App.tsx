/**
 * MoodLync - Emotional Intelligence Platform
 * Version: 3.5.2
 * Copyright (c) 2025 MoodLync Technologies
 * 
 * This application connects users through their emotional states,
 * providing a safe space for authentic human interaction and growth.
 */

// Core dependencies
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

// Providers
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
// Auth provider removed
import { SubscriptionProvider } from "./hooks/use-subscription";
import { WebSocketProvider } from "./hooks/use-websocket";
import { GamificationProvider } from "./hooks/use-gamification";
import { MusicPlayerProvider } from "./hooks/use-music-player";
import { MoodProvider } from "./hooks/use-mood-context";
import { PremiumFeatureModalProvider } from "./providers/premium-feature-modal-provider";
import { HelmetProvider } from 'react-helmet-async';

// Utilities and services
import { queryClient } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isNative, setupPushNotifications } from "./lib/capacitor";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import AutoChallengeUpdater from "@/components/auto-challenge-updater";
import FloatingChatButton from "@/components/contact/floating-chat-button";

// Eagerly loaded core pages
import NotFound from "@/pages/not-found";
import WelcomePage from "@/pages/welcome-page";
import HomePage from "@/pages/home-page";

// Lazily loaded pages for better performance
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ProfileNotificationsPage = lazy(() => import("@/pages/profile-notifications-page"));
const TokenRedemptionPage = lazy(() => import("@/pages/token-redemption-page"));
const TokenMilestonesPage = lazy(() => import("@/pages/token-milestones-page"));
const TokenGuidePage = lazy(() => import("@/pages/token-guide-page"));
const TokenomicsPage = lazy(() => import("@/pages/tokenomics-page"));
const TokenPoolInfoPage = lazy(() => import("@/pages/token-pool-info-page"));
const PremiumPage = lazy(() => import("@/pages/premium-page"));
const PremiumFeaturesPage = lazy(() => import("@/pages/premium-features-page"));
const PremiumComparisonPage = lazy(() => import("@/pages/premium-comparison-page"));
const PremiumChatPage = lazy(() => import("@/pages/premium-chat-page"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const CheckoutSuccessPage = lazy(() => import("@/pages/checkout-success"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const ReferralPage = lazy(() => import("@/pages/referral-page"));
const UserChallengesPage = lazy(() => import("@/pages/user-challenges-page"));
const VideoSharingPage = lazy(() => import("@/pages/video-sharing-page"));
const VideoPlayerPage = lazy(() => import("@/pages/video-player-page"));
const FamilyPlanPage = lazy(() => import("@/pages/family-plan-page"));
const VideoEditorPage = lazy(() => import("@/pages/video-editor-page"));
const MoodGamesPage = lazy(() => import("@/pages/mood-games-page"));
const FriendBookPage = lazy(() => import("@/pages/friend-book-page"));
const VerificationPage = lazy(() => import("@/pages/verification-page"));
const EmotionalImprintsPage = lazy(() => import("@/pages/emotional-imprints-page"));
const MilestonePage = lazy(() => import("@/pages/share/milestone-page"));
const NftCollectionPage = lazy(() => import("@/pages/nft-collection-page"));
const PersonalizationPage = lazy(() => import("@/pages/personalization-page"));
const EmotionalIntelligenceQuizPage = lazy(() => import("@/pages/emotional-intelligence-quiz-page"));
const TermsConditionsPage = lazy(() => import("@/pages/terms-conditions-page"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy-page"));
const SecurityPage = lazy(() => import("@/pages/security-page"));
const SecurityCenterPage = lazy(() => import("@/pages/security-center"));
const CompliancePage = lazy(() => import("@/pages/compliance-page"));
const FAQPage = lazy(() => import("@/pages/faq-page"));
const RoadmapPage = lazy(() => import("@/pages/roadmap-page"));
const CommunityFeedPage = lazy(() => import("@/pages/community-feed-page"));

// Admin pages (lazily loaded)
const AdminLoginPage = lazy(() => import("@/pages/admin/admin-login-page"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/admin-dashboard-page"));
const AdminTicketsPage = lazy(() => import("@/pages/admin/admin-tickets-page"));
const AdminRefundsPage = lazy(() => import("@/pages/admin/admin-refunds-page"));
const AdminUsersPage = lazy(() => import("@/pages/admin/admin-users-page"));
const AdminFeedbacksPage = lazy(() => import("@/pages/admin/admin-feedbacks-page"));
const AdminActionsPage = lazy(() => import("@/pages/admin/admin-actions-page"));
const AdminQuotesPage = lazy(() => import("@/pages/admin/admin-quotes-page"));
const AdminSeoPage = lazy(() => import("@/pages/admin/admin-seo-page"));
const AdminBackupPage = lazy(() => import("@/pages/admin/admin-backup-page"));
const AdminStudyPage = lazy(() => import("@/pages/admin/admin-study-page"));
const AdminDirectAccess = lazy(() => import("@/pages/admin-direct-access"));

// Emotion Story pages
const EmotionStoriesPage = lazy(() => import("@/pages/emotion-stories-page"));
const EmotionStoryDetailsPage = lazy(() => import("@/pages/emotion-story-details-page"));
const CreateEmotionStoryPage = lazy(() => import("@/pages/create-emotion-story-page"));

// Testing pages
const MoodTestPage = lazy(() => import("@/pages/mood-test-page"));
const MoodStandaloneTest = lazy(() => import("@/pages/mood-standalone-test"));
const MoodSelectorPage = lazy(() => import("@/pages/mood-selector-page"));

// Testing components
const InteractiveElementsDemo = lazy(() => import("@/components/testing/interactive-elements-demo"));

// Loading indicator for lazy-loaded components
const LazyLoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
  </div>
);

// Component to handle Capacitor initialization for mobile platforms
const CapacitorInitializer = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isNative()) return;
    
    const initializeNativePlatform = async () => {
      try {
        await setupPushNotifications();
        console.log('[MoodLync] Push notifications initialized successfully');
        
        toast({
          title: "Welcome to MoodLync Mobile",
          description: "You're using the native mobile app version of MoodLync",
        });
      } catch (err) {
        console.error('[MoodLync] Error initializing native features:', err);
      }
    };
    
    initializeNativePlatform();
  }, [toast]);
  
  return null;
};

// Main router component that defines all application routes
const RouterComponent = () => {
  const [location] = useLocation();
  
  // Route organization to improve maintenance and readability
  const publicRoutes = [
    { path: "/welcome", component: WelcomePage },
    { path: "/", component: HomePage }, // Make the home page public
    { path: "/video/:id", component: VideoPlayerPage },
    { path: "/share/milestone", component: MilestonePage },
    { path: "/terms", component: TermsConditionsPage },
    { path: "/privacy", component: PrivacyPolicyPage },
    { path: "/security", component: SecurityPage },
    { path: "/compliance", component: CompliancePage },
    { path: "/faq", component: FAQPage },
    { path: "/roadmap", component: RoadmapPage },
    { path: "/premium/compare", component: PremiumComparisonPage },
    { path: "/demo", component: InteractiveElementsDemo },
    { path: "/mood-test", component: MoodTestPage }, // Add our new mood test page
    { path: "/mood-standalone", component: MoodStandaloneTest }, // Standalone test without dependencies
    { path: "/mood-selector", component: MoodSelectorPage }, // New React-based selector that works correctly
  ];
  
  const protectedRoutes = [
    // Home page is now in public routes
    { path: "/profile", component: ProfilePage },
    { path: "/profile/notifications", component: ProfileNotificationsPage },
    { path: "/tokens", component: TokenRedemptionPage },
    { path: "/milestones", component: TokenMilestonesPage },
    { path: "/token-guide", component: TokenGuidePage },
    { path: "/tokenomics", component: TokenomicsPage },
    { path: "/token-pool-info", component: TokenPoolInfoPage },
    { path: "/premium", component: PremiumPage },
    { path: "/premium/features", component: PremiumFeaturesPage },
    { path: "/premium/chat", component: PremiumChatPage },
    { path: "/premium/chat/:id", component: PremiumChatPage },
    { path: "/checkout/:planId", component: CheckoutPage },
    { path: "/checkout-success", component: CheckoutSuccessPage },
    { path: "/family", component: FamilyPlanPage },
    { path: "/nft-collection", component: NftCollectionPage },
    { path: "/user-challenges", component: UserChallengesPage },
    { path: "/contact", component: ContactPage },
    { path: "/referrals", component: ReferralPage },
    { path: "/videos", component: VideoSharingPage },
    { path: "/video-editor", component: VideoEditorPage },
    { path: "/mood-games", component: MoodGamesPage },
    { path: "/friends", component: FriendBookPage },
    { path: "/verification", component: VerificationPage },
    { path: "/emotional-imprints", component: EmotionalImprintsPage },
    { path: "/emotional-intelligence-quiz", component: EmotionalIntelligenceQuizPage },
    { path: "/personalization", component: PersonalizationPage },
    { path: "/security-center", component: SecurityCenterPage },
    { path: "/community", component: CommunityFeedPage },
    { path: "/emotion-stories", component: EmotionStoriesPage },
    { path: "/emotion-stories/create", component: CreateEmotionStoryPage },
    { path: "/emotion-stories/:id", component: EmotionStoryDetailsPage },
  ];
  
  const adminRoutes = [
    { path: "/admin/login", component: AdminLoginPage, public: true },
    { path: "/admin-direct-access", component: AdminDirectAccess, public: true },
    { path: "/admin", component: AdminDashboardPage },
    { path: "/admin/tickets", component: AdminTicketsPage },
    { path: "/admin/refunds", component: AdminRefundsPage },
    { path: "/admin/users", component: AdminUsersPage },
    { path: "/admin/feedbacks", component: AdminFeedbacksPage },
    { path: "/admin/actions", component: AdminActionsPage },
    { path: "/admin/quotes", component: AdminQuotesPage },
    { path: "/admin/seo", component: AdminSeoPage },
    { path: "/admin/backup", component: AdminBackupPage },
    { path: "/admin/study", component: AdminStudyPage },
  ];
  
  return (
    <Suspense fallback={<LazyLoadingIndicator />}>
      <Switch>
        {/* Render public routes */}
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} component={Component} />
        ))}
        
        {/* Render protected routes */}
        {protectedRoutes.map(({ path, component: Component }) => (
          <ProtectedRoute key={path} path={path} component={Component} />
        ))}
        
        {/* Render admin routes */}
        {adminRoutes.map(({ path, component: Component, public: isPublic }) => 
          isPublic ? (
            <Route key={path} path={path} component={Component} />
          ) : (
            <AdminRoute key={path} path={path} component={Component} />
          )
        )}
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
};

// SubscriptionProvider is already imported above

// Main application component
function App() {
  // Log initialization for debugging
  console.log('MoodLync App initializing...');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.BASE_URL);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HelmetProvider>
          {/* Auth provider removed */}
          <SubscriptionProvider>
            <GamificationProvider>
              <WebSocketProvider>
                <MusicPlayerProvider>
                  <PremiumFeatureModalProvider>
                    <TooltipProvider>
                      <MoodProvider>
                        <Toaster />
                        <RouterComponent />
                        {/* Session handler removed */}
                        <FloatingChatButton />
                        <AutoChallengeUpdater />
                        <CapacitorInitializer />
                      </MoodProvider>
                    </TooltipProvider>
                  </PremiumFeatureModalProvider>
                </MusicPlayerProvider>
              </WebSocketProvider>
            </GamificationProvider>
          </SubscriptionProvider>
        </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
