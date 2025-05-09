import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Gift, 
  Lock, 
  Sparkles, 
  PartyPopper, 
  Crown, 
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Add this import at the top of your file
declare global {
  interface Window {
    confetti: any;
  }
}

interface TokenMilestoneConfettiProps {
  onlyDemo?: boolean;
}

export function TokenMilestoneConfetti({ onlyDemo = false }: TokenMilestoneConfettiProps) {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [hasTriggered, setHasTriggered] = useState(false);
  const [confettiLoaded, setConfettiLoaded] = useState(false);
  
  // Load the confetti library dynamically
  useEffect(() => {
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
      script.async = true;
      script.onload = () => setConfettiLoaded(true);
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setConfettiLoaded(true);
    }
  }, []);
  
  const triggerConfetti = (type: 'standard' | 'milestone' | 'bigwin') => {
    if (!confettiLoaded || !isPremium) return;
    
    setHasTriggered(true);
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    let particleColors = ['#FFC700', '#FF0000', '#2E3191', '#41D6C3'];
    
    if (type === 'milestone') {
      particleColors = ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50']; // Gold/orange
    } else if (type === 'bigwin') {
      particleColors = ['#C0C0C0', '#FFD700', '#9C27B0', '#F44336']; // Silver/gold/purple
    }
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    
    // For premium users, make confetti more elaborate
    const confettiOptions = {
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: particleColors,
    };
    
    // Left side
    window.confetti({
      ...confettiOptions,
      angle: 60,
      origin: { x: 0 },
    });
    
    // Right side
    window.confetti({
      ...confettiOptions,
      angle: 120,
      origin: { x: 1 },
    });
    
    // Create stars and custom shapes for premium users
    if (type === 'milestone' || type === 'bigwin') {
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        
        // Star confetti for milestones
        window.confetti({
          particleCount: 2,
          angle: randomInRange(65, 115),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: particleColors,
          shapes: ['star'],
          scalar: randomInRange(0.4, 1.4)
        });
        
      }, 250);
    }
    
    // For big wins, add a final burst
    if (type === 'bigwin') {
      setTimeout(() => {
        window.confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: particleColors,
        });
      }, 500);
    }
  };
  
  // Reset the hasTriggered state after some time
  useEffect(() => {
    if (hasTriggered) {
      const timer = setTimeout(() => {
        setHasTriggered(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasTriggered]);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Personalized Celebration Effects
      </h2>
      
      {onlyDemo ? (
        <div className="space-y-8">
          <Card className="p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Token Milestone Celebrations
              </h3>
              {!isPremium && (
                <Badge variant="outline" className="bg-black text-white text-xs">
                  Premium Only
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">
              As a premium member, you'll receive personalized celebratory animations when you reach token milestones. Watch as customized confetti bursts appear to celebrate your achievements!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => triggerConfetti('standard')}
                disabled={!isPremium || hasTriggered}
                className={cn(
                  "w-full", 
                  !isPremium && "opacity-70",
                  hasTriggered && "opacity-50"
                )}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Daily Bonus
              </Button>
              
              <Button
                onClick={() => triggerConfetti('milestone')}
                disabled={!isPremium || hasTriggered}
                className={cn(
                  "w-full",
                  !isPremium && "opacity-70",
                  hasTriggered && "opacity-50"
                )}
              >
                <PartyPopper className="h-4 w-4 mr-2" />
                Milestone (100 tokens)
              </Button>
              
              <Button
                onClick={() => triggerConfetti('bigwin')}
                disabled={!isPremium || hasTriggered}
                className={cn(
                  "w-full",
                  !isPremium && "opacity-70",
                  hasTriggered && "opacity-50"
                )}
              >
                <Crown className="h-4 w-4 mr-2" />
                Big Win (1000 tokens)
              </Button>
            </div>
            
            {!isPremium && (
              <div className="mt-6 bg-slate-50 p-4 rounded-md flex">
                <Lock className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Premium Feature</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    This feature is available exclusively to premium members. Upgrade to experience personalized celebration animations for your achievements.
                  </p>
                </div>
              </div>
            )}
          </Card>
          
          <Card className="p-6 shadow-md">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">About Token Milestone Celebrations</h3>
            </div>
            <p className="text-gray-600 mb-4">
              As a premium member, you'll enjoy personalized celebratory animations when you reach significant token milestones. These animations are tailored to the type and importance of your achievement.
            </p>
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Gift className="h-4 w-4 mr-1 text-indigo-500" />
                Key Features
              </h4>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Unique confetti patterns for different milestones</li>
                <li>Personalized color schemes matching your profile theme</li>
                <li>Special animations for major achievements</li>
                <li>Celebratory sound effects (can be toggled in settings)</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          {/* Milestone cards */}
          <div className="flex flex-col">
            <Card className="p-6 shadow-md flex-1 group relative overflow-hidden">
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-pink-500 rotate-12 transform opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
                Daily Streak
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                You've logged in for 5 consecutive days! Keep the streak going to earn more tokens.
              </p>
              <div className="mt-auto pt-4">
                <Button
                  onClick={() => triggerConfetti('standard')}
                  disabled={!isPremium || hasTriggered}
                  className={cn(
                    "w-full", 
                    !isPremium && "opacity-70",
                    hasTriggered && "opacity-50"
                  )}
                >
                  Celebrate (+5 tokens)
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="flex flex-col">
            <Card className="p-6 shadow-md flex-1 group relative overflow-hidden">
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-amber-500 rotate-12 transform opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Achievement Unlocked
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                You've reached the "Emotion Explorer" milestone by tracking 10 different emotions!
              </p>
              <div className="mt-auto pt-4">
                <Button
                  onClick={() => triggerConfetti('milestone')}
                  disabled={!isPremium || hasTriggered}
                  className={cn(
                    "w-full", 
                    !isPremium && "opacity-70",
                    hasTriggered && "opacity-50"
                  )}
                >
                  Celebrate (+50 tokens)
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="flex flex-col">
            <Card className="p-6 shadow-md flex-1 group relative overflow-hidden border-2 border-amber-200">
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-indigo-500 rotate-12 transform opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                Major Milestone
              </Badge>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Crown className="h-5 w-5 mr-2 text-indigo-600" />
                Premium Milestone
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Congratulations on your 1000th token! You've become a key contributor to the community.
              </p>
              <div className="mt-auto pt-4">
                <Button
                  onClick={() => triggerConfetti('bigwin')}
                  disabled={!isPremium || hasTriggered}
                  variant="default"
                  className={cn(
                    "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white", 
                    !isPremium && "opacity-70",
                    hasTriggered && "opacity-50"
                  )}
                >
                  Celebrate Achievement
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}