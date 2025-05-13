import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { 
  HeartHandshake, MapPin, MessageCircle, Brain, Sparkles, Trophy, 
  Shield, BarChart3, HeartPulse, Zap, Crown, Video, Gift, 
  UserCheck, Users, Palette, Star, ArrowRight, Fingerprint,
  Brush, PartyPopper, Share2, SmilePlus, PanelBottomClose,
  Gamepad2, User, PlusCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserReviews } from '@/components/reviews/review-section';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

// Define review type
interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  date: Date;
}

// Define feature type for TypeScript
interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  delay: number;
  isPremium?: boolean;
}

// Basic features available to all users
const BASIC_FEATURES: Feature[] = [
  {
    title: "Emotion Matching",
    description: "Connect with people who share your emotional state in real-time, using advanced detection technology to foster meaningful interactions.",
    icon: HeartHandshake,
    color: "bg-pink-500/10 text-pink-500",
    delay: 0.1,
    isPremium: false
  },
  {
    title: "Live Global Emotion Map",
    description: "Visualize emotional patterns around the world with real-time heat map visualization using Google Maps integration.",
    icon: MapPin,
    color: "bg-blue-500/10 text-blue-500",
    delay: 0.2
  },
  {
    title: "Mood-Based Chat Rooms",
    description: "Join real-time conversations with people sharing similar emotional experiences using our Socket.io messaging system.",
    icon: MessageCircle, 
    color: "bg-green-500/10 text-green-500",
    delay: 0.3
  },
  {
    title: "Therapeutic AI Companion",
    description: "Access an AI companion powered by GPT-3.5/4 that offers dynamic, personalized guidance based on your emotional state.",
    icon: Brain,
    color: "bg-purple-500/10 text-purple-500",
    delay: 0.4
  },
  {
    title: "Enterprise-Grade Security",
    description: "End-to-end encryption for all your data with AES-256, Signal Protocol for messaging, and privacy controls to protect your emotional journey.",
    icon: Shield,
    color: "bg-teal-500/10 text-teal-500",
    delay: 0.5
  },
  {
    title: "Token Rewards System",
    description: "Earn tokens for daily logins, journaling, helping others, and completing challenges. Each token is worth $0.001 when redeemed.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-500",
    delay: 0.6
  },
  {
    title: "Friend Book",
    description: "Connect with friends and manage your social connections in one place with privacy controls.",
    icon: User,
    color: "bg-red-500/10 text-red-500",
    delay: 0.7
  },
  {
    title: "Emotional Journal",
    description: "Record and track your emotions over time to gain insights into your emotional patterns.",
    icon: PanelBottomClose,
    color: "bg-indigo-500/10 text-indigo-500",
    delay: 0.8
  }
];

// Premium features only available with subscription
const PREMIUM_FEATURES: Feature[] = [
  {
    title: "Mood-Synced Backgrounds",
    description: "Experience dynamic background colors that transition based on your current emotional state.",
    icon: Brush,
    color: "bg-cyan-500/10 text-cyan-500",
    isPremium: true,
    delay: 0.1
  },
  {
    title: "Token Milestone Celebrations",
    description: "Enjoy personalized confetti bursts and visual celebrations when you reach token milestones.",
    icon: PartyPopper,
    color: "bg-amber-500/10 text-amber-500",
    isPremium: true,
    delay: 0.2
  },
  {
    title: "Emoji Reaction System",
    description: "Express your reactions to content with an enhanced emoji system for nuanced emotional responses.",
    icon: SmilePlus,
    color: "bg-green-500/10 text-green-500",
    isPremium: true,
    delay: 0.3
  },
  {
    title: "Interactive Gamification",
    description: "Track your progress with beautiful, interactive visualizations and gamification elements.",
    icon: Trophy,
    color: "bg-rose-500/10 text-rose-500",
    isPremium: true,
    delay: 0.4
  },
  {
    title: "Animated Social Sharing",
    description: "Share your achievements and milestones with beautifully animated social sharing buttons.",
    icon: Share2,
    color: "bg-blue-500/10 text-blue-500",
    isPremium: true,
    delay: 0.5
  },
  {
    title: "Emotional Imprints",
    description: "Create and share multi-sensory snapshots of your emotional state with colors, sounds, and vibrations.",
    icon: Fingerprint,
    color: "bg-violet-500/10 text-violet-500",
    isPremium: true,
    delay: 0.6
  },
  {
    title: "Mood Swinger Games",
    description: "Play interactive mindfulness games designed to improve your mood and earn tokens.",
    icon: Gamepad2,
    color: "bg-indigo-500/10 text-indigo-500",
    isPremium: true,
    delay: 0.7
  },
  {
    title: "Health Services Marketplace",
    description: "Discover or offer health and wellness services from verified premium members.",
    icon: HeartPulse,
    color: "bg-purple-500/10 text-purple-500",
    isPremium: true,
    delay: 0.8
  },
  {
    title: "Premium Verification",
    description: "Get verified with a premium badge to build trust and credibility in the community.",
    icon: UserCheck,
    color: "bg-yellow-500/10 text-yellow-500",
    isPremium: true,
    delay: 0.9
  },
  {
    title: "Family Plan Access",
    description: "Monitor family members' moods (with consent) and help them navigate emotional challenges.",
    icon: Users,
    color: "bg-orange-500/10 text-orange-500",
    isPremium: true,
    delay: 1.0
  },
  {
    title: "AI Video Editor",
    description: "Create and edit professional videos with our AI-powered tools to express your emotions visually.",
    icon: Video,
    color: "bg-pink-500/10 text-pink-500",
    isPremium: true,
    delay: 1.1
  },
  {
    title: "Advanced Analytics",
    description: "Get detailed insights into your emotional patterns and progress with interactive charts.",
    icon: BarChart3,
    color: "bg-teal-500/10 text-teal-500",
    isPremium: true,
    delay: 1.2
  },
  {
    title: "Custom Themes",
    description: "Personalize your MoodSync experience with exclusive premium color themes and interfaces.",
    icon: Palette,
    color: "bg-red-500/10 text-red-500",
    isPremium: true,
    delay: 1.3
  }
];

// Combined features for display in feature carousel
const FEATURES = [...BASIC_FEATURES, ...PREMIUM_FEATURES];

// Initial reviews data
const initialReviewsData: Review[] = [
  {
    id: "1",
    name: "Sarah Thompson",
    rating: 5,
    comment: "This platform helped me connect with people who truly understand my emotions. Very transformative for my wellbeing.",
    photoUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80",
    date: new Date("2024-03-15")
  },
  {
    id: "2",
    name: "David Rodriguez",
    rating: 5,
    comment: "Never felt so understood. The emotion-based matching introduced me to people who help me process my feelings.",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80",
    date: new Date("2024-03-10")
  },
  {
    id: "3",
    name: "Maria Kim",
    rating: 4,
    comment: "The global emotion map helps me feel connected to humanity. Comforting to see others share my emotional state.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80",
    date: new Date("2024-03-05")
  }
];

export const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [initialReviews, setInitialReviews] = useState<Review[]>(initialReviewsData);
  const [selectedRating, setSelectedRating] = useState(5);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const form = useForm<{name: string, comment: string}>({
    defaultValues: {
      name: '',
      comment: ''
    }
  });

  // Animate features on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Rotate through features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-10 md:pt-16" ref={sectionRef}>
      {/* Header - Clear Call to Action */}
      <div className="text-center mb-8 sm:mb-10 md:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4">
          Welcome to MoodSync
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Connect with others through shared emotions and experiences
        </p>
      </div>
    
      {/* Premium Benefits Section */}
      <div className="mb-10 sm:mb-16 lg:mb-20">
        {/* Mobile View - Premium Benefits Slider */}
        <div className="block lg:hidden mb-6">
          <div className="text-center mb-5">
            <div className="inline-flex items-center mb-2 px-3 py-1 rounded-full bg-black text-white text-xs font-medium">
              <Crown className="h-3 w-3 mr-1.5" /> 
              Premium Benefits
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">
              Unlock the Full Experience
            </h3>
          </div>
          
          {/* Premium Feature Card */}
          <div className="mx-3 sm:mx-6 p-4 sm:p-5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-gray-200 shadow-md mb-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0",
                PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].color
              )}>
                <div className="h-5 w-5 sm:h-6 sm:w-6">
                  {(() => {
                    const Icon = PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].icon;
                    return <Icon />;
                  })()}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm sm:text-base">{PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].title}</h4>
                  <Badge variant="outline" className="ml-1 bg-black text-white border-0 text-xs">Premium</Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                  {PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Vertical Basic Features List */}
          <div className="px-3 pb-2">
            <div className="flex flex-col space-y-3 pb-4">
              {BASIC_FEATURES.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                    feature.color
                  )}>
                    <div className="h-4 w-4">
                      {(() => {
                        const Icon = feature.icon;
                        return <Icon />;
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-500">Free feature</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile CTA Button */}
          <div className="px-4 sm:px-6 mt-4">
            <Button className="w-full py-3 text-sm" size="lg">
              Upgrade to Premium <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Desktop View - Two Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12">
          {/* Column 1 - Premium Features */}
          <div className={cn(
            "flex flex-col justify-center px-8 py-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-gray-200 shadow-lg transition-all duration-1000 transform",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20" 
          )}>
            <div className="inline-flex items-center mb-5 px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium self-start">
              <Crown className="h-4 w-4 mr-2" /> 
              Premium Benefits
            </div>
            
            <h3 className="text-3xl font-bold mb-5">
              Unlock the Full Experience
            </h3>
            
            <p className="text-base text-gray-600 mb-8">
              Get access to exclusive features that enhance your emotional journey with advanced tools for expression and connection.
            </p>
            
            {/* Rotating Premium Feature - More Visual */}
            <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
                  PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].color
                )}>
                  <div className="h-7 w-7">
                    {(() => {
                      const Icon = PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].icon;
                      return <Icon />;
                    })()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-xl">{PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].title}</h4>
                    <Badge variant="outline" className="ml-1 bg-black text-white border-0 text-xs">Premium</Badge>
                  </div>
                  <p className="text-base text-gray-600">
                    {PREMIUM_FEATURES[activeFeature % PREMIUM_FEATURES.length].description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA Button - More Prominent */}
            <Button className="mt-2 w-auto py-6 text-base" size="lg">
              Upgrade to Premium <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Column 2 - Basic Features */}
          <div className={cn(
            "flex flex-col px-8 py-10 bg-white rounded-2xl border border-gray-200 shadow-lg transition-all duration-1000 transform",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 lg:translate-x-20"
          )}>
            <div className="inline-flex items-center mb-5 px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium self-start">
              <Sparkles className="h-4 w-4 mr-2" /> 
              Core Features
            </div>
            
            <h3 className="text-2xl font-bold mb-5">
              Available to All Users
            </h3>
            
            <div className="space-y-4 mb-6">
              {BASIC_FEATURES.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                    feature.color
                  )}>
                    <div className="h-5 w-5">
                      {(() => {
                        const Icon = feature.icon;
                        return <Icon />;
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-base">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Click to learn more</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quote with attribution */}
            <div className="mt-auto bg-gray-100 p-6 rounded-lg shadow-inner">
              <p className="text-sm text-gray-700 italic text-center">
                "Authentic connections through shared emotions - the foundation of meaningful relationships."
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">— MoodSync Community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - Enhanced with Better Visual Hierarchy */}
      <div className="mt-6 sm:mt-8 md:mt-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <h3 className={cn(
            "text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-4 transition-all duration-1000 transform",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            Explore Our Key Features
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-3">
            Discover how MoodSync can transform your emotional connections and social experiences
          </p>
        </div>
        
        {/* Mobile View (Vertical Card List) */}
        <div className="block sm:hidden pb-2">
          <div className="px-3">
            <div className="flex flex-col space-y-4 pb-4">
              {FEATURES.map((feature, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex-shrink-0 w-[85%] group bg-white p-4 rounded-xl shadow-md border border-gray-100 cursor-pointer relative overflow-hidden",
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                  )}
                  style={{ 
                    transitionDelay: `${200 + (index * 100)}ms`,
                    transitionDuration: '1000ms' 
                  }}
                >
                  {/* Premium Badge */}
                  {feature.isPremium && (
                    <div className="absolute top-2 right-2 bg-black text-white text-xs font-medium py-0.5 px-2 rounded-full">
                      Premium
                    </div>
                  )}
                  
                  {/* Feature Content */}
                  <div className="flex flex-row items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform", 
                      feature.color
                    )}>
                      <div className="h-5 w-5">
                        {(() => {
                          const Icon = feature.icon;
                          return <Icon />;
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{feature.description}</p>
                      
                      {/* Learn More Link */}
                      <div className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        Learn more <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                {FEATURES.map((_, index) => (
                  <div key={index} className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tablet & Desktop View (Grid) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 sm:px-4 md:px-0">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "group bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 cursor-pointer relative overflow-hidden",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
              style={{ 
                transitionDelay: `${200 + (index * 100)}ms`,
                transitionDuration: '1000ms' 
              }}
            >
              {/* Premium Badge */}
              {feature.isPremium && (
                <div className="absolute top-4 right-4 bg-black text-white text-xs font-medium py-1 px-2 rounded-full">
                  Premium
                </div>
              )}
              
              {/* Feature Content */}
              <div className="flex flex-col items-start">
                <div className={cn(
                  "w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform", 
                  feature.color
                )}>
                  <div className="h-7 sm:h-8 w-7 sm:w-8">
                    {(() => {
                      const Icon = feature.icon;
                      return <Icon />;
                    })()}
                  </div>
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">{feature.description}</p>
                
                {/* Learn More Link */}
                <div className="mt-auto inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Review Section - Enhanced with Better Structure */}
      <div className="mt-12 sm:mt-20 lg:mt-28 mb-10 sm:mb-16 bg-gray-50 py-8 sm:py-14 md:py-20 px-3 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl">
        <div className="max-w-5xl mx-auto">
          {/* Mobile Review Header */}
          <div className="sm:hidden text-center mb-6">
            <h3 className="text-lg font-bold mb-2">
              What Our Users Are Saying
            </h3>
            <p className="text-xs text-gray-600 px-4">
              Join thousands who have transformed their emotional connections
            </p>
          </div>
          
          {/* Tablet/Desktop Review Header */}
          <div className="hidden sm:block text-center mb-8 sm:mb-12 md:mb-16">
            <h3 className={cn(
              "text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-4 transition-all duration-1000 transform",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              What Our Users Are Saying
            </h3>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Join thousands of people who have transformed their emotional connections through MoodSync
            </p>
          </div>
          
          {/* Mobile Reviews - Vertical List */}
          <div className="sm:hidden mb-6">
            <div className="px-3 pb-2">
              <div className="flex flex-col space-y-4 pb-4">
                {initialReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3">
                      {review.photoUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img 
                            src={review.photoUrl} 
                            alt={review.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{review.name}</h4>
                        <div className="flex mb-2 mt-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-none'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Review Button */}
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  className="w-full text-xs py-2 border-primary text-primary" 
                  onClick={() => setIsAddReviewOpen(true)}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Your Review
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tablet/Desktop Reviews */}
          <div className="hidden sm:block">
            <UserReviews />
          </div>
          
          {/* Mobile CTA */}
          <div className="sm:hidden mt-6 text-center px-4">
            <Button className="bg-black hover:bg-black/90 text-white w-full py-2.5" size="default">
              Join MoodSync Today
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Free to get started. Premium features available.
            </p>
          </div>
          
          {/* Tablet/Desktop CTA */}
          <div className="hidden sm:block mt-12 md:mt-16 text-center">
            <Button className="bg-black hover:bg-black/90 text-white px-6" size="lg">
              Join MoodSync Today
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Free to get started. Premium features available with subscription.
            </p>
          </div>
        </div>
      </div>
      
      {/* Final CTA for Mobile */}
      <div className="sm:hidden mb-8 mt-6 px-4">
        <div className="bg-black text-white rounded-xl overflow-hidden">
          <div className="p-5 text-center">
            <h3 className="font-bold text-lg mb-2">Ready to Connect?</h3>
            <p className="text-xs text-gray-300 mb-4 mx-auto">
              Join MoodSync today and experience the power of emotional connections
            </p>
            <Button className="w-full bg-white text-black hover:bg-gray-100" size="sm">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
      
      {/* Wave Divider at Bottom - Responsive */}
      <div className="relative h-8 sm:h-12 md:h-16 mt-6 sm:mt-12 md:mt-16">
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" 
               className="w-full h-10 sm:h-16 md:h-20 text-primary/5 fill-current">
            <path d="M1200 120L0 16.48V0h1200v120z" />
          </svg>
        </div>
      </div>
      
      {/* Add Review Dialog */}
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Share Your Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => {
              // Add new review
              const newReview: Review = {
                id: (initialReviews.length + 1).toString(),
                name: data.name,
                rating: selectedRating,
                comment: data.comment,
                date: new Date(),
              };
              
              setInitialReviews([newReview, ...initialReviews]);
              setIsAddReviewOpen(false);
              form.reset();
              
              toast({
                title: "Review Submitted",
                description: "Thank you for sharing your experience!",
              });
            })} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Your Rating</FormLabel>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSelectedRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-6 w-6 ${rating <= selectedRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-none'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Experience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about your experience..." {...field} required rows={4} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddReviewOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Review</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};