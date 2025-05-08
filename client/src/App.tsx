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
import { AuthProvider } from "./hooks/use-auth";
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
import AuthPage from "@/pages/auth-page";

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
const AdminActionsPage = lazy(() => import("@/pages/admin/admin-actions-page"));
const AdminQuotesPage = lazy(() => import("@/pages/admin/admin-quotes-page"));
const AdminSeoPage = lazy(() => import("@/pages/admin/admin-seo-page"));
const AdminBackupPage = lazy(() => import("@/pages/admin/admin-backup-page"));
const AdminStudyPage = lazy(() => import("@/pages/admin/admin-study-page"));
const AdminDirectAccess = lazy(() => import("@/pages/admin-direct-access"));

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
    { path: "/auth", component: AuthPage },
    { path: "/video/:id", component: VideoPlayerPage },
    { path: "/share/milestone", component: MilestonePage },
    { path: "/terms", component: TermsConditionsPage },
    { path: "/privacy", component: PrivacyPolicyPage },
    { path: "/security", component: SecurityPage },
    { path: "/compliance", component: CompliancePage },
    { path: "/faq", component: FAQPage },
    { path: "/roadmap", component: RoadmapPage },
    { path: "/premium/compare", component: PremiumComparisonPage },
  ];
  
  const protectedRoutes = [
    { path: "/", component: HomePage },
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
  ];
  
  const adminRoutes = [
    { path: "/admin/login", component: AdminLoginPage, public: true },
    { path: "/admin-direct-access", component: AdminDirectAccess, public: true },
    { path: "/admin", component: AdminDashboardPage },
    { path: "/admin/tickets", component: AdminTicketsPage },
    { path: "/admin/refunds", component: AdminRefundsPage },
    { path: "/admin/users", component: AdminUsersPage },
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

// Main application component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HelmetProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <GamificationProvider>
                <WebSocketProvider>
                  <MusicPlayerProvider>
                    <PremiumFeatureModalProvider>
                      <TooltipProvider>
                        <MoodProvider>
                          <Toaster />
                          <RouterComponent />
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
          </AuthProvider>
        </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
