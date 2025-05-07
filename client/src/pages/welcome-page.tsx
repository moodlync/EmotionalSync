import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import logoImage from '@/assets/moodlync-logo.png';
import { 
  Heart, ArrowRight, ChevronDown, Crown, Sparkles, Shield, Star, Video, UserCheck,
  BarChart3, Fingerprint, Gamepad2, Users, Music, Palette, Brush, PartyPopper, 
  Share2, HeartPulse, SmilePlus, PanelBottomClose, Loader2, Info, Send, Check
} from 'lucide-react';
import { usePremiumFeatureModal } from '@/providers/premium-feature-modal-provider';
import Footer from '@/components/footer';
import { JoinVipButton } from '@/components/welcome/join-vip-button';
import { PremiumLearnMoreButton } from '@/components/welcome/premium-learn-more-button';
import { StaticProductDialog } from '@/components/learn-more/detailed-product-description';
import { 
  ProductDescriptions,
  EmotionMatchingDescription,
  EmotionalJournalDescription,
  EmotionalNFTsDescription,
  TokenRewardsDescription,
  AdvancedAnalyticsDescription,
  FamilyPlanDescription,
  AIVideoEditorDescription,
  EmotionalImprintsDescription,
  VerifiedBadgeDescription,
  PrivateChatsDescription,
  AdSpaceDescription,
  MoodGamesDescription,
  CustomThemesDescription,
  MoodBackgroundsDescription,
  TokenMilestonesDescription,
  SocialSharingDescription,
  HealthServicesDescription,
  AdvancedEmojiDescription,
  ClassicalMusicDescription
} from '@/components/learn-more/product-descriptions';

export default function WelcomePage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialProfession, setTestimonialProfession] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const { toast } = useToast();
  
  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API endpoint
    toast({
      title: "Testimonial submitted",
      description: "Thank you for sharing your experience with MoodLync!",
      variant: "default"
    });
    setTestimonialText('');
    setTestimonialName('');
    setTestimonialProfession('');
    setTestimonialRating(5);
  };

  return (
    <div className="min-h-screen flex flex-col welcome-page">
      {/* Enhanced Header with Animation */}
      <header className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-5 px-6 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative group">
              <div className="absolute inset-[-10%] bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <img 
                src={logoImage} 
                alt="MoodLync Logo" 
                className="object-contain relative" 
                style={{
                  boxShadow: '0 6px 16px rgba(96, 82, 199, 0.3)',
                  backgroundColor: 'white',
                  width: '200px',
                  height: '75px',
                  borderRadius: '9999px',
                  padding: '10px',
                  border: '2px solid rgba(96, 82, 199, 0.2)'
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="px-5 py-2.5 border-2 border-primary/30 dark:border-primary/40 text-primary dark:text-primary/90 dark:hover:bg-primary/10 hover:bg-primary/5 transition-colors duration-300 font-medium rounded-full"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
            <Button
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-full"
              onClick={() => navigate('/auth')}
            >
              Sign Up <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced MoodLync Description Section with Visual Elements */}
      <section className="w-full py-16 px-6 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm">
            <Badge variant="outline" className="px-4 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full">
              <HeartPulse className="h-4 w-4 mr-2 text-primary animate-pulse" /> 
              Welcome to MoodLync
            </Badge>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Connecting Through Emotions
          </h2>
          
          <div className="max-w-3xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow-md border border-primary/10 dark:border-primary/20">
            <p className="text-foreground dark:text-gray-200 text-base md:text-lg mb-6 leading-relaxed">
              MoodLync is an innovative platform that connects people based on their emotional states rather than 
              traditional social profiles. Using advanced AI technology, we help you find meaningful connections 
              with others who share your current emotional journey, creating authentic relationships built on 
              true understanding and empathy.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Badge variant="outline" className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-primary/20 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-rose-500" /> 
                Authentic Connections
              </Badge>
              <Badge variant="outline" className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-primary/20 flex items-center">
                <SmilePlus className="h-4 w-4 mr-2 text-amber-500" /> 
                Emotional Intelligence
              </Badge>
              <Badge variant="outline" className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-primary/20 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" /> 
                Community Support
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - MOVED AFTER FEATURES */}
      <section className="w-full bg-white dark:bg-gray-950 py-16 px-6 relative">
        {/* Wave Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden rotate-180" style={{ transform: 'translateY(-99%)' }}>
          <svg preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" 
               style={{ width: '100%', height: '60px', fill: 'var(--bg-color, #f8f9ff)' }}
               className="dark:[--bg-color:theme(colors.gray.900)]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Connect through emotions,
              </span>
              <br />
              <span className="text-foreground">build authentic relationships</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Join a community where your emotional state matters. Experience real connections 
              based on how you feel, not who you pretend to be.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/5 hover:shadow-md transition-shadow"
                onClick={() => {
                  const testimonialSection = document.getElementById('testimonials');
                  testimonialSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See Testimonials
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-6">
              {/* Enhanced Premium Features Showcase */}
              <div className="text-center mb-5 relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
                
                <Badge variant="outline" className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white border-0 mb-2 shadow-md">
                  <Crown className="h-3.5 w-3.5 mr-1 text-amber-200" /> Premium
                </Badge>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                  Unlock Premium Benefits
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                  Elevate your experience with exclusive features designed for premium members. 
                  Gain access to powerful tools that enhance your emotional intelligence journey.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/ai-video-editor.svg" 
                      alt="AI Video Editor" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">AI Video Editor</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={AIVideoEditorDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/verified-badge.svg" 
                      alt="Premium Verification Badge" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Verified Badge</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={VerifiedBadgeDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/private-chats.svg" 
                      alt="Private Chats" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Private Chats</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={PrivateChatsDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/ad-space.svg" 
                      alt="Ad Space" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Ad Space</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={AdSpaceDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/family-plan.svg" 
                      alt="Family Plan" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Family Plan</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={FamilyPlanDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/advanced-analytics.svg" 
                      alt="Advanced Analytics" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Analytics</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={AdvancedAnalyticsDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/emotional-nfts.svg" 
                      alt="Emotional NFTs" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Emotional NFTs</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={EmotionalNFTsDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/mood-games.svg" 
                      alt="Mood Games" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Mood Games</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={MoodGamesDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/custom-themes.svg" 
                      alt="Custom Themes" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Custom Themes</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={CustomThemesDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/mood-backgrounds.svg" 
                      alt="Mood Backgrounds" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Mood Backgrounds</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={MoodBackgroundsDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/token-milestones.svg" 
                      alt="Token Milestones" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Token Milestones</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={TokenMilestonesDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/social-sharing.svg" 
                      alt="Social Sharing" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Social Sharing</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={SocialSharingDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/health-services.svg" 
                      alt="Health Services" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Health Services</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={HealthServicesDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/advanced-emojis.svg" 
                      alt="Advanced Emoji System" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Advanced Emojis</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={AdvancedEmojiDescription} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 hover:shadow-md dark:hover:shadow-gray-800/30 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm mb-2">
                    <img 
                      src="/assets/icons/premium-features/classical-music.svg" 
                      alt="Classical Music Therapy" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-xs text-center mb-1.5">Classical Music</h4>
                  <div className="mt-auto">
                    <StaticProductDialog description={ClassicalMusicDescription} />
                  </div>
                </div>
              </div>
              
              {/* VIP Membership Tiers Section */}
              <div id="vip-membership" className="mt-7 mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="px-3 py-1 bg-gradient-to-r from-amber-400 to-purple-600 text-white border-0 mb-2">
                    <Crown className="h-3.5 w-3.5 mr-1" /> VIP Membership
                  </Badge>
                  <h4 className="text-base font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    Premium Subscription Plans
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Choose the perfect plan to enhance your emotional wellness journey
                  </p>
                </div>
                
                {/* Responsive Subscription Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                  {/* Monthly Plan */}
                  <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-800 p-3 transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 w-16 h-16 -translate-y-6 translate-x-6 bg-blue-300/20 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Monthly</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300">$9.99/month</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[9px] dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">Try Premium</Badge>
                    </div>
                    <ul className="text-[10px] text-blue-600 dark:text-blue-200 space-y-1 mb-3">
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-blue-500" /> Unlimited mood tracking</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-blue-500" /> Advanced analytics</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-blue-500" /> Ad-free experience</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-blue-500" /> AI-powered video editor</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full text-[10px] h-7 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-700"
                      onClick={() => {
                        const { showModal } = usePremiumFeatureModal();
                        showModal(
                          "Monthly Plan",
                          "Our Monthly Plan is perfect for exploring premium features with maximum flexibility. At $9.99/month, you get unlimited mood tracking, advanced analytics, personalized wellness content, an ad-free experience, AI-powered video editor, and smart home integration. This plan is ideal if you prefer a low monthly payment with the freedom to cancel anytime.",
                          "/assets/premium-features/premium-main.jpg"
                        );
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                  
                  {/* Yearly Plan - Popular */}
                  <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/20 dark:to-secondary/20 p-3 transition-all duration-300 hover:shadow-md">
                    <div className="absolute -top-3 -right-10 rotate-45 bg-primary text-white text-[9px] font-medium py-1 px-8">Popular</div>
                    <div className="absolute top-0 right-0 w-16 h-16 -translate-y-6 translate-x-6 bg-primary/20 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-sm font-bold text-primary dark:text-primary mb-1">Yearly</h5>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-primary dark:text-primary">$89.99/year</p>
                          <span className="text-[9px] text-green-600 dark:text-green-400 line-through">$119.88</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] dark:bg-primary/20">Save 25%</Badge>
                    </div>
                    <ul className="text-[10px] text-primary/80 dark:text-primary/80 space-y-1 mb-3">
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-primary" /> All Monthly features</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-primary" /> Exclusive premium badges</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-primary" /> Early access to new features</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-primary" /> Priority support</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-primary" /> Enhanced data insights</li>
                    </ul>
                    <Button variant="default" size="sm" className="w-full text-[10px] h-7 bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        const { showModal } = usePremiumFeatureModal();
                        showModal(
                          "Yearly Plan",
                          "Our most popular plan offers significant savings and comprehensive features. At $89.99/year (saving 25% compared to monthly), you get all monthly features plus exclusive premium badges, early access to new features, priority support, and enhanced data insights. This plan provides the best value with committed annual access to all premium features.",
                          "/assets/premium-features/premium-main.jpg"
                        );
                      }}
                    >
                      Best Value
                    </Button>
                  </div>
                  
                  {/* Family Plan */}
                  <div className="relative overflow-hidden rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 dark:border-violet-800 p-3 transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 w-16 h-16 -translate-y-6 translate-x-6 bg-violet-300/20 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-sm font-bold text-violet-800 dark:text-violet-400 mb-1">Family Plan</h5>
                        <p className="text-xs text-violet-700 dark:text-violet-300">$149.99/year</p>
                      </div>
                      <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[9px] dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800">Up to 5 members</Badge>
                    </div>
                    <ul className="text-[10px] text-violet-600 dark:text-violet-200 space-y-1 mb-3">
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-violet-500" /> All Yearly features</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-violet-500" /> Mood tracking with consent</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-violet-500" /> Token sharing between family</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-violet-500" /> Family wellness insights</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full text-[10px] h-7 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 border-violet-300 dark:text-violet-300 dark:border-violet-700"
                      onClick={() => {
                        const { showModal } = usePremiumFeatureModal();
                        showModal(
                          "Family Plan",
                          "Support your loved ones with our comprehensive Family Plan at $149.99/year. This plan includes all Yearly plan features for up to 5 family members, plus specialized family tools like mood tracking with consent, token sharing between family members, family wellness insights, and crisis support integration. Perfect for families committed to emotional wellness together.",
                          "/assets/premium-features/custom/family-plan-image.jpg"
                        );
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                  
                  {/* Lifetime Plan */}
                  <div className="relative overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-800 p-3 transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 w-16 h-16 -translate-y-6 translate-x-6 bg-amber-300/20 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Lifetime</h5>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-amber-700 dark:text-amber-300">$399.99</p>
                          <span className="text-[9px] text-green-600 dark:text-green-400">One-time</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">Ultimate</Badge>
                    </div>
                    <ul className="text-[10px] text-amber-600 dark:text-amber-200 space-y-1 mb-3">
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-amber-500" /> All Family Plan features</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-amber-500" /> Never expires</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-amber-500" /> Lifetime updates</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-amber-500" /> VIP support access</li>
                      <li className="flex items-center"><Check className="h-3 w-3 mr-1 text-amber-500" /> Exclusive lifetime benefits</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full text-[10px] h-7 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700"
                      onClick={() => {
                        const { showModal } = usePremiumFeatureModal();
                        showModal(
                          "Lifetime Plan",
                          "The ultimate commitment to emotional wellness with a one-time payment of $399.99. This plan gives you permanent access to all premium features, including all Family Plan benefits, lifetime access to future updates, exclusive lifetime member benefits, VIP community access, and the highest level of support. With the Lifetime plan, you'll never pay subscription fees again while enjoying the complete MoodLync experience.",
                          "/assets/premium-features/premium-main.jpg"
                        );
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4">
                  <div className="shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium mb-1">Secure & Flexible Subscriptions</p>
                    <p className="text-[10px]">All plans include secure payment processing, easy cancellation, and our 14-day satisfaction guarantee. No hidden fees or commitments.</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <JoinVipButton
                    variant="default"
                    className="bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:from-amber-400 hover:to-purple-500"
                  />
                </div>
              </div>
              
              {/* NFT Showcase Section */}
              <div className="mt-7 mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="px-3 py-1 bg-violet-500 text-white border-0 mb-2">
                    <Fingerprint className="h-3.5 w-3.5 mr-1" /> Emotional NFTs
                  </Badge>
                  <h4 className="text-base font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    Exclusive Digital Collectibles
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Premium members earn unique NFTs that evolve with your emotional journey
                  </p>
                </div>
                
                {/* Main NFT Banner Image */}
                <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="/assets/emotional-nfts/emotional-nfts-main.jpg" 
                    alt="Emotional NFTs Collection" 
                    className="w-full object-cover"
                  />
                </div>
                
                {/* Individual Emotion NFTs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                  <div className="shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800">
                    <img src="/assets/emotional-nfts/joy-nft.jpg" alt="Joy NFT" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-white text-[10px] font-medium">Joy</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800">
                    <img src="/assets/emotional-nfts/sad-nft.jpg" alt="Sadness NFT" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-white text-[10px] font-medium">Sadness</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800">
                    <img src="/assets/emotional-nfts/anger-nft.jpg" alt="Anger NFT" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-white text-[10px] font-medium">Anger</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800">
                    <img src="/assets/emotional-nfts/surprise-nft.jpg" alt="Surprise NFT" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-white text-[10px] font-medium">Surprise</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  <div className="shrink-0">
                    <Fingerprint className="h-5 w-5 text-violet-500" />
                  </div>
                  <p className="text-[10px]">Earn NFTs by reaching emotional milestones. Each NFT evolves as you progress on your journey!</p>
                </div>
              </div>
              
              <div className="mt-5">
                <PremiumLearnMoreButton
                  title="Premium Features"
                  description="Explore all premium features and upgrade your MoodLync experience with exclusive capabilities."
                  imageSrc="/assets/premium-features/premium-main.jpg"
                  onClick={() => navigate('/premium/features')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Showcase - With New Images */}
      <section className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="px-3 py-1 bg-black text-white border-0 mb-3">
              <Crown className="h-3.5 w-3.5 mr-1" /> Premium Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Unlock the Full Potential of MoodLync
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Our premium features enhance your emotional journey with advanced tools, personalized experiences, and exclusive benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Emotion Matching */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/emotion-matching.jpg" 
                  alt="Emotion Matching" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Emotion Matching</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Connect with people who share your emotional state in real-time, using advanced detection technology to foster meaningful interactions.
                </p>
                <div className="flex justify-start">
                  <StaticProductDialog description={EmotionMatchingDescription} />
                </div>
              </div>
            </div>

            {/* Feature 2: Live Global Emotion Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/global-emotion-map.jpg" 
                  alt="Live Global Emotion Map" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Live Global Emotion Map</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Visualize emotional patterns around the world with real-time heat map visualization using Google Maps integration.
                </p>
                <PremiumLearnMoreButton 
                  title="Global Emotion Map"
                  description="Visualize emotional patterns around the world with our real-time heat map visualization. Discover how emotions flow across continents and connect with others experiencing similar feelings worldwide."
                  imageSrc="/assets/premium-features/global-emotion-map.jpg"
                />
              </div>
            </div>
            
            {/* Feature 3: Mood-Based Chat Rooms */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/mood-based-chat-rooms.jpg" 
                  alt="Mood-Based Chat Rooms" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Mood-Based Chat Rooms</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Join real-time conversations with people sharing similar emotional experiences using our Socket.io messaging system.
                </p>
                <PremiumLearnMoreButton 
                  title="Mood-Based Chat Rooms"
                  description="Connect with others sharing your emotional state in real-time conversations. Our mood-based matching algorithm finds people experiencing similar feelings, creating a space for authentic understanding and support."
                  imageSrc="/assets/premium-features/mood-based-chat-rooms.jpg"
                />
              </div>
            </div>
            
            {/* Feature 4: Therapeutic AI Companion */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/therapeutic-ai-companion.jpg" 
                  alt="Therapeutic AI Companion" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Therapeutic AI Companion</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Access an AI companion powered by GPT-3.5/4 that offers dynamic, personalized guidance based on your emotional state.
                </p>
                <PremiumLearnMoreButton 
                  title="Therapeutic AI Companion"
                  description="Connect with your personal AI guide that adapts to your emotional needs. Our advanced AI companion provides personalized support, insights, and gentle guidance to help you navigate your emotional journey."
                  imageSrc="/assets/premium-features/therapeutic-ai-companion.jpg"
                />
              </div>
            </div>
            
            {/* Feature 5: Enterprise-Grade Security */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/enterprise-security-new.jpg" 
                  alt="Enterprise-Grade Security" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Enterprise-Grade Security</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  End-to-end encryption for all your data with AES-256, Signal Protocol for messaging, and privacy controls to protect your emotional journey.
                </p>
                <PremiumLearnMoreButton 
                  title="Enterprise-Grade Security"
                  description="Your emotional data deserves the highest level of protection. Experience peace of mind with our enterprise-grade security features including end-to-end encryption, advanced privacy controls, and secure data storage."
                  imageSrc="/assets/premium-features/enterprise-security-new.jpg"
                />
              </div>
            </div>
            
            {/* Feature 6: Token Rewards System */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/token-rewards-system.jpg" 
                  alt="Token Rewards System" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Token Rewards System</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Earn tokens by positively engaging with the community and redeem them for various benefits and real-world rewards.
                </p>
                <PremiumLearnMoreButton 
                  title="Token Rewards System"
                  description="Earn tokens through positive interactions and community contributions. Redeem these tokens for premium features, digital collectibles, and even real-world benefits through our partner network."
                  imageSrc="/assets/premium-features/token-rewards-system.jpg"
                />
              </div>
            </div>
            
            {/* Feature 7: Friend Book */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/friend-book.jpg" 
                  alt="Friend Book" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Friend Book</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Connect with friends and manage your social connections in one place with privacy controls.
                </p>
                <PremiumLearnMoreButton 
                  title="Friend Book"
                  description="Build your emotional support network with Friend Book. Connect with others who share your emotional journey, manage relationships with intuitive privacy controls, and stay connected with those who understand you best."
                  imageSrc="/assets/premium-features/friend-book.jpg"
                />
              </div>
            </div>
            
            {/* Feature 8: Emotional Journal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/emotional-journal.jpg" 
                  alt="Emotional Journal" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Emotional Journal</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Record and track your emotions over time to gain insights into your emotional patterns.
                </p>
                <PremiumLearnMoreButton 
                  title="Emotional Journal"
                  description="Keep track of your emotional journey with our comprehensive journaling tools. Document your daily feelings, identify patterns, and gain valuable insights through visual analytics and mood calendars."
                  imageSrc="/assets/premium-features/emotional-journal.jpg"
                />
              </div>
            </div>
            
            {/* Feature 9: Mood-Lynced Backgrounds */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/mood-synced-backgrounds.jpg" 
                  alt="Mood-Lynced Backgrounds" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Mood-Lynced Backgrounds</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Experience dynamic background colors that transition based on your current emotional state.
                </p>
                <PremiumLearnMoreButton 
                  title="Mood-Lynced Backgrounds"
                  description="Transform your visual experience with backgrounds that dynamically respond to your emotional state. Our adaptive color technology creates an immersive environment that reflects your current mood and enhances your emotional awareness."
                  imageSrc="/assets/premium-features/mood-synced-backgrounds.jpg"
                />
              </div>
            </div>
            
            {/* Feature 10: Token Milestone Celebrations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/token-milestone-celebrations.jpg" 
                  alt="Token Milestone Celebrations" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Token Milestone Celebrations</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Enjoy personalized confetti bursts and visual celebrations when you reach token milestones.
                </p>
                <PremiumLearnMoreButton 
                  title="Token Milestone Celebrations"
                  description="Celebrate your emotional wellness journey with delightful visual displays when you reach important milestones. Experience personalized confetti bursts, animations, and achievement badges that make your progress feel truly rewarding."
                  imageSrc="/assets/premium-features/token-milestone-celebrations.jpg"
                />
              </div>
            </div>
            
            {/* Feature 11: Emoji Reaction System */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/emoji-reaction-system.jpg" 
                  alt="Emoji Reaction System" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Emoji Reaction System</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Express your reactions to content with an enhanced emoji system for nuanced emotional responses.
                </p>
                <PremiumLearnMoreButton 
                  title="Emoji Reaction System"
                  description="Express yourself with greater emotional precision using our expanded emoji reaction system. Choose from a curated selection of emotive expressions that go beyond basic reactions, allowing for more authentic emotional communication."
                  imageSrc="/assets/premium-features/emoji-reaction-system.jpg"
                />
              </div>
            </div>
            
            {/* Feature 12: Mood Games */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/mood-games.jpg" 
                  alt="Mood Games" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Mood Games</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Have fun with interactive mood-based games designed to enhance emotional intelligence while connecting with others.
                </p>
                <PremiumLearnMoreButton 
                  title="Mood Games"
                  description="Boost your emotional intelligence through play with our collection of mood-based games. Engage in fun, interactive activities designed to help you recognize, understand, and manage emotions while connecting with others."
                  imageSrc="/assets/premium-features/mood-games.jpg"
                />
              </div>
            </div>
            
            {/* Feature 13: Animated Social Sharing */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/animated-social-sharing.jpg" 
                  alt="Animated Social Sharing" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Animated Social Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Share your achievements and milestones with beautifully animated social sharing buttons.
                </p>
                <PremiumLearnMoreButton 
                  title="Animated Social Sharing"
                  description="Share your emotional wellness journey with style using our animated social sharing features. Create engaging, dynamic posts about your achievements, milestones, and emotional progress that stand out on any platform."
                  imageSrc="/assets/premium-features/animated-social-sharing.jpg"
                />
              </div>
            </div>
            
            {/* Feature 14: AI Video Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/ai-video-editor.jpg" 
                  alt="AI Video Editor" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI Video Editor</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Create and edit professional videos with our AI-powered tools to express your emotions visually.
                </p>
                <PremiumLearnMoreButton 
                  title="AI Video Editor"
                  description="Express your emotions visually with our advanced AI video creation and editing tools. Transform your emotional moments into stunning videos with mood-enhancing filters, emotion-synced music, and intelligent editing suggestions."
                  imageSrc="/assets/premium-features/ai-video-editor.jpg"
                />
              </div>
            </div>
            
            {/* Feature 15: Custom Themes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/custom-themes.jpg" 
                  alt="Custom Themes" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Custom Themes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Personalize your MoodLync experience with exclusive premium color themes and interfaces.
                </p>
                <PremiumLearnMoreButton 
                  title="Custom Themes"
                  description="Make MoodLync truly yours with our exclusive premium themes. Choose from a range of carefully crafted color palettes and interface designs that match your style and enhance your emotional well-being."
                  imageSrc="/assets/premium-features/custom-themes.jpg"
                />
              </div>
            </div>
            
            {/* Feature 16: Health Services Marketplace */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/health-services-marketplace.jpg" 
                  alt="Health Services Marketplace" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Health Services Marketplace</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Discover or offer health and wellness services from verified premium members.
                </p>
                <PremiumLearnMoreButton 
                  title="Health Services Marketplace"
                  description="Access our curated marketplace of wellness services offered by verified premium members. Find emotional support specialists, life coaches, and wellness professionals who can help you on your emotional wellness journey."
                  imageSrc="/assets/premium-features/health-services-marketplace.jpg"
                />
              </div>
            </div>
            
            {/* Feature 17: Advanced Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/advanced-analytics.jpg" 
                  alt="Advanced Analytics" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Advanced Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Get detailed insights into your emotional patterns and progress with interactive charts and visualizations.
                </p>
                <PremiumLearnMoreButton 
                  title="Advanced Analytics"
                  description="Gain deeper insights into your emotional patterns with our comprehensive analytics tools. Visualize trends, identify triggers, and track your emotional journey with interactive charts and personalized reports."
                  imageSrc="/assets/premium-features/advanced-analytics.jpg"
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Premium feature
                </div>
              </div>
            </div>
            
            {/* Feature 18: Emotional Imprints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/emotional-imprints.jpg" 
                  alt="Emotional Imprints" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Emotional Imprints</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Create and share multi-sensory snapshots of your emotional state with colors, sounds, and vibrations.
                </p>
                <PremiumLearnMoreButton 
                  title="Emotional Imprints"
                  description="Capture your emotions in a unique multi-sensory way. Create personalized emotional snapshots combining colors, sounds, and haptic feedback that represent your feelings in that moment."
                  imageSrc="/assets/premium-features/emotional-imprints.jpg"
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Premium feature
                </div>
              </div>
            </div>
            
            {/* Feature 19: Family Plan Access */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/assets/premium-features/custom/family-plan-image.jpg" 
                  alt="Family Plan Access" 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Family Plan Access</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Monitor family members' moods (with consent) and help them navigate emotional challenges with our dedicated family tools.
                </p>
                <div className="flex justify-start">
                  <StaticProductDialog description={FamilyPlanDescription} />
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Premium feature
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section moved to bottom */}
      <section id="testimonials" className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-20 px-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center mb-12 relative">
          <Badge variant="outline" className="px-4 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary/20 rounded-full mb-4 inline-flex items-center">
            <Heart className="h-4 w-4 mr-2 text-rose-500" /> 
            Real User Experiences
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Success Stories</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
            Discover how MoodLync has transformed the emotional wellness of our users, creating deeper connections 
            and fostering authentic relationships built on genuine emotional understanding.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/10 dark:to-pink-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-md p-1 border-2 border-white dark:border-gray-700">
                  <span className="transform group-hover:scale-110 transition-transform duration-300">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Sarah K.</h4>
                  <p className="text-xs text-muted-foreground">Designer, 28</p>
                </div>
              </div>
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 text-pink-500 text-3xl opacity-30">"</div>
                <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 relative z-10">
                  MoodLync helped me find friends who truly understood what I was going through during a difficult time. 
                  The emotional connection was immediate and genuine. I've never felt so understood online before.
                </p>
                <div className="absolute -bottom-2 -right-2 text-pink-500 text-3xl opacity-30">"</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs text-muted-foreground ml-2">Joined 6 months ago</span>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/10 dark:to-blue-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md p-1 border-2 border-white dark:border-gray-700">
                  <span className="transform group-hover:scale-110 transition-transform duration-300">D</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">David R.</h4>
                  <p className="text-xs text-muted-foreground">Engineer, 34</p>
                </div>
              </div>
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 text-blue-500 text-3xl opacity-30">"</div>
                <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 relative z-10">
                  I've never felt so understood. The emotion-based matching has introduced me to people who help me process my feelings in healthy ways. The premium features are worth every penny.
                </p>
                <div className="absolute -bottom-2 -right-2 text-blue-500 text-3xl opacity-30">"</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs text-muted-foreground ml-2">Premium Member</span>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/10 dark:to-purple-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md p-1 border-2 border-white dark:border-gray-700">
                  <span className="transform group-hover:scale-110 transition-transform duration-300">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Maria K.</h4>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground">Healthcare Worker, 29</p>
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[9px] px-1.5 py-0">VIP</Badge>
                  </div>
                </div>
              </div>
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 text-purple-500 text-3xl opacity-30">"</div>
                <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 relative z-10">
                  The global emotion map helps me feel connected to humanity. It's comforting to see that others around the world share my emotional state and experiences.
                </p>
                <div className="absolute -bottom-2 -right-2 text-purple-500 text-3xl opacity-30">"</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <Star className="h-4 w-4 fill-none text-amber-500" />
                <span className="text-xs text-muted-foreground ml-2">Member since 2022</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonial Submission Form */}
        <div className="max-w-2xl mx-auto mt-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Share Your Experience</h3>
            <p className="text-muted-foreground">Tell us how MoodLync has helped your emotional journey</p>
          </div>
          
          <form onSubmit={handleTestimonialSubmit}>
            <div className="mb-6">
              <label htmlFor="testimonialText" className="block mb-2 font-medium text-gray-900 dark:text-gray-200">Your Testimonial</label>
              <Textarea 
                id="testimonialText"
                placeholder="Share how MoodLync has influenced your emotional wellness journey..."
                className="resize-none h-32"
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="testimonialName" className="block mb-2 font-medium text-gray-900 dark:text-gray-200">Your Name</label>
                <Input 
                  id="testimonialName"
                  placeholder="John D."
                  value={testimonialName}
                  onChange={(e) => setTestimonialName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="testimonialProfession" className="block mb-2 font-medium text-gray-900 dark:text-gray-200">Profession</label>
                <Input 
                  id="testimonialProfession"
                  placeholder="Designer, Teacher, etc."
                  value={testimonialProfession}
                  onChange={(e) => setTestimonialProfession(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block mb-3 font-medium text-gray-900 dark:text-gray-200">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating}
                    type="button"
                    onClick={() => setTestimonialRating(rating)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      rating <= testimonialRating 
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-500' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <Star className={`h-6 w-6 ${rating <= testimonialRating ? 'fill-amber-500' : 'fill-none'}`} />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted-foreground">
                  {testimonialRating === 5 && "Excellent!"}
                  {testimonialRating === 4 && "Very Good"}
                  {testimonialRating === 3 && "Good"}
                  {testimonialRating === 2 && "Fair"}
                  {testimonialRating === 1 && "Poor"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white flex items-center gap-2">
                Submit Testimonial
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-primary to-secondary py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience emotional connections?</h2>
          <p className="text-lg mb-8 text-white/90">Join thousands of users building authentic relationships based on shared emotions.</p>
          
          <Button 
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-lg"
            onClick={() => navigate('/auth')}
          >
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}