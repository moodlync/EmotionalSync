import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Star, 
  Flag, 
  Lock, 
  ChevronUp, 
  ChevronDown, 
  Award, 
  Gift, 
  Sparkles,
  Rocket,
  Clock,
  HelpCircle,
  Zap,
  Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamificationAchievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'emotional' | 'social' | 'personal' | 'creative';
  tokens: number;
  unlockLevel?: number;
}

interface GamificationMilestone {
  level: number;
  title: string;
  description: string;
  rewards: string[];
  reached: boolean;
}

// Sample achievements data
const ACHIEVEMENTS: GamificationAchievement[] = [
  {
    id: 'a1',
    title: 'Reflection Expert',
    description: 'Record your emotions for 7 consecutive days',
    icon: <Star className="h-8 w-8 text-amber-500" />,
    progress: 5,
    maxProgress: 7,
    completed: false,
    category: 'emotional',
    tokens: 50
  },
  {
    id: 'a2',
    title: 'Social Butterfly',
    description: 'Connect with 5 users who share your emotional state',
    icon: <Sparkles className="h-8 w-8 text-indigo-500" />,
    progress: 3,
    maxProgress: 5,
    completed: false,
    category: 'social',
    tokens: 100
  },
  {
    id: 'a3',
    title: 'Emotion Master',
    description: 'Track 10 different emotions',
    icon: <Award className="h-8 w-8 text-pink-500" />,
    progress: 10,
    maxProgress: 10,
    completed: true,
    category: 'emotional',
    tokens: 150
  },
  {
    id: 'a4',
    title: 'Mindfulness Journey',
    description: 'Complete 3 mindfulness sessions',
    icon: <Hexagon className="h-8 w-8 text-cyan-500" />,
    progress: 2,
    maxProgress: 3,
    completed: false,
    category: 'personal',
    tokens: 75,
    unlockLevel: 5
  },
];

// Sample milestones data
const MILESTONES: GamificationMilestone[] = [
  {
    level: 5,
    title: 'Emotional Novice',
    description: 'You\'ve taken your first steps in emotional awareness',
    rewards: ['Custom Profile Badge', '100 Bonus Tokens'],
    reached: true
  },
  {
    level: 10,
    title: 'Emotion Explorer',
    description: 'Your emotional journey is well underway',
    rewards: ['Exclusive Theme', '200 Bonus Tokens'],
    reached: false
  },
  {
    level: 25,
    title: 'Empathy Virtuoso',
    description: 'You\'ve become highly attuned to the emotional landscape',
    rewards: ['Premium Chat Room', '500 Bonus Tokens'],
    reached: false
  }
];

interface ProgressVisualizationProps {
  standalone?: boolean;
}

export function ProgressVisualization({ standalone = true }: ProgressVisualizationProps) {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  
  const [userData, setUserData] = useState({
    level: 7,
    currentXP: 350,
    nextLevelXP: 500,
    tokens: 720,
    rank: 'Rising Star',
    completedAchievements: 4,
    totalAchievements: 15,
    streakDays: 12
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);
  
  // Calculate XP percentage for the progress bar
  const xpPercentage = Math.min(100, Math.round((userData.currentXP / userData.nextLevelXP) * 100));
  
  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);
  
  // For animation demos (premium feature)
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTarget, setAnimationTarget] = useState<string | null>(null);
  
  const triggerAnimation = (targetId: string) => {
    if (!isPremium) return;
    
    setAnimationTarget(targetId);
    setIsAnimating(true);
    
    // Reset after animation
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationTarget(null);
    }, 2000);
  };
  
  // Add CSS for animations if premium
  useEffect(() => {
    if (isPremium) {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes progressPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
        
        .premium-progress-animation {
          animation: progressPulse 1.5s ease-in-out;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.8) 50%, 
            rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isPremium]);
  
  if (!standalone) {
    // Return a simplified version of the component for integration
    return (
      <div className="w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Trophy className="text-amber-500 h-5 w-5 mr-2" />
                <span className="font-medium">Level {userData.level}</span>
                <Badge className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {userData.rank}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {userData.currentXP} / {userData.nextLevelXP} XP
              </div>
            </div>
            
            <Button size="sm" variant="outline">View All</Button>
          </div>
          
          <Progress 
            value={xpPercentage} 
            className={cn(
              "h-2", 
              isPremium ? "bg-gray-200" : "bg-gray-100",
              animationTarget === 'xp-bar' && isAnimating && 'premium-progress-animation'
            )} 
          />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {ACHIEVEMENTS.slice(0, 2).map(achievement => (
              <Card 
                key={achievement.id}
                className={cn(
                  "p-3 flex items-center gap-3",
                  achievement.completed && isPremium ? "bg-gradient-to-r from-indigo-50 to-purple-50" : "",
                  animationTarget === achievement.id && isAnimating && 'premium-progress-animation'
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  achievement.completed ? "bg-indigo-100" : "bg-gray-100"
                )}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{achievement.title}</h4>
                    <div className="text-xs font-medium text-indigo-600">
                      {achievement.tokens} <Zap className="inline h-3 w-3" />
                    </div>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1.5 mt-1.5" 
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Interactive Gamification Progress
      </h2>
      
      {!isPremium && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Interactive animations and visualizations are available exclusively to premium members.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* User Level Card */}
        <Card className="p-5 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Level Progress
              </h3>
              {isPremium && (
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                  Premium
                </Badge>
              )}
            </div>
            
            <div className="text-3xl font-bold text-center mb-2">
              Level {userData.level}
            </div>
            
            <div className="text-center mb-4">
              <Badge 
                className={cn(
                  "bg-gradient-to-r text-white border-0 text-sm py-1 px-3",
                  isPremium ? "from-indigo-500 to-purple-600" : "from-gray-500 to-gray-600"
                )}
              >
                {userData.rank}
              </Badge>
            </div>
            
            <div className="text-center text-sm text-gray-500 mb-3">
              {userData.currentXP} / {userData.nextLevelXP} XP to Level {userData.level + 1}
            </div>
            
            <div className="mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-indigo-600 hover:text-indigo-800 w-full justify-start px-0"
                onClick={() => triggerAnimation('xp-bar')}
                disabled={!isPremium}
              >
                <Rocket className="h-3.5 w-3.5 mr-1.5" />
                {isPremium ? 'Click to see progress animation' : 'Premium animation disabled'}
              </Button>
              
              <Progress 
                value={xpPercentage} 
                className={cn(
                  "h-3 rounded-full", 
                  isPremium 
                    ? "bg-gray-200" 
                    : "bg-gray-100",
                  animationTarget === 'xp-bar' && isAnimating && 'premium-progress-animation'
                )} 
              />
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Tokens</div>
                <div className="text-lg font-bold flex items-center justify-center">
                  {userData.tokens}
                  <Zap className="h-4 w-4 ml-1 text-amber-500" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Streak</div>
                <div className="text-lg font-bold flex items-center justify-center">
                  {userData.streakDays}
                  <Clock className="h-4 w-4 ml-1 text-green-500" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Achievements</div>
                <div className="text-lg font-bold">
                  {userData.completedAchievements}/{userData.totalAchievements}
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Next Milestone Card */}
        <Card className="p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Flag className="h-5 w-5 mr-2 text-indigo-500" />
              Next Milestone
            </h3>
          </div>
          
          <div className="space-y-4">
            {MILESTONES.filter(m => !m.reached).slice(0, 1).map(milestone => (
              <div 
                key={milestone.level}
                className={cn(
                  "border rounded-lg p-4 relative",
                  isPremium ? "border-indigo-200 bg-indigo-50/50" : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge 
                    className={cn(
                      isPremium ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800",
                      "text-xs"
                    )}
                  >
                    Level {milestone.level}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {milestone.level - userData.level} levels to go
                  </div>
                </div>
                
                <h4 className="font-medium text-lg">{milestone.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-2">Rewards:</h5>
                  <div className="flex flex-wrap gap-2">
                    {milestone.rewards.map((reward, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className={cn(
                          "flex items-center gap-1 py-1",
                          isPremium ? "bg-white" : "bg-gray-50"
                        )}
                      >
                        <Gift className="h-3 w-3 text-pink-500" />
                        <span>{reward}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className={cn(
                    "mt-4 w-full",
                    isPremium 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                      : "bg-gray-800"
                  )}
                  size="sm"
                >
                  View Path to Milestone
                </Button>
              </div>
            ))}
            
            <div className="text-xs text-center text-gray-500 flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              {isPremium 
                ? "Premium members earn tokens 50% faster" 
                : "Upgrade to premium to earn tokens 50% faster"}
            </div>
          </div>
        </Card>
        
        {/* Achievement Progress Card */}
        <Card className="p-5 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="h-5 w-5 mr-2 text-pink-500" />
              Achievement Progress
            </h3>
          </div>
          
          <div 
            className={cn(
              "p-3 rounded-lg mb-4 border", 
              isPremium ? "border-pink-200 bg-pink-50/50" : "border-gray-200 bg-gray-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Overall Completion</div>
              <div className="text-sm font-medium">
                {userData.completedAchievements}/{userData.totalAchievements}
              </div>
            </div>
            
            <Progress 
              value={(userData.completedAchievements / userData.totalAchievements) * 100} 
              className={cn(
                "h-2.5 mt-2",
                isPremium ? "" : "opacity-70"
              )} 
            />
          </div>
          
          <div className="flex justify-between mb-3 text-sm">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedCategory === 'emotional' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1"
              onClick={() => setSelectedCategory('emotional')}
            >
              Emotional
            </Button>
            <Button 
              variant={selectedCategory === 'social' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1"
              onClick={() => setSelectedCategory('social')}
            >
              Social
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[285px] overflow-y-auto pr-1">
            {filteredAchievements.map(achievement => (
              <div 
                key={achievement.id}
                className={cn(
                  "border rounded-lg p-3 relative transition-all cursor-pointer",
                  isPremium && achievement.completed ? "border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50" : "border-gray-200",
                  expandedAchievement === achievement.id ? "shadow-md" : "",
                  animationTarget === achievement.id && isAnimating && 'premium-progress-animation'
                )}
                onClick={() => setExpandedAchievement(
                  expandedAchievement === achievement.id ? null : achievement.id
                )}
              >
                <div className="flex items-start">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    achievement.completed 
                      ? isPremium ? "bg-gradient-to-br from-indigo-100 to-purple-100" : "bg-gray-100" 
                      : "bg-gray-100"
                  )}>
                    {achievement.icon}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        {achievement.title}
                        {achievement.completed && (
                          <Star className="h-3.5 w-3.5 ml-1 text-amber-500 fill-amber-500" />
                        )}
                      </h4>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-5 h-5 -mr-1"
                        onClick={e => {
                          e.stopPropagation();
                          setExpandedAchievement(
                            expandedAchievement === achievement.id ? null : achievement.id
                          );
                        }}
                      >
                        {expandedAchievement === achievement.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />  
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className={achievement.unlockLevel && userData.level < achievement.unlockLevel 
                          ? "flex items-center text-amber-600" 
                          : ""
                        }>
                          {achievement.unlockLevel && userData.level < achievement.unlockLevel && (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          <span>
                            {achievement.unlockLevel 
                              ? (userData.level < achievement.unlockLevel 
                                ? `Unlocks at Level ${achievement.unlockLevel}` 
                                : `Level ${achievement.unlockLevel} Required`)
                              : `${achievement.progress}/${achievement.maxProgress}`
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs font-medium">
                        {achievement.tokens} <Zap className="inline-block h-3 w-3 ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Progress Bar (shows when not expanded or has no unlock level) */}
                    {(!achievement.unlockLevel || userData.level >= achievement.unlockLevel) && 
                     expandedAchievement !== achievement.id && (
                      <div className="mt-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className={cn(
                            "h-1.5",
                            isPremium ? "bg-gray-200" : "bg-gray-100"
                          )} 
                        />
                      </div>
                    )}
                    
                    {/* Expanded Achievement Info */}
                    {expandedAchievement === achievement.id && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <p className="text-gray-600 mb-3">{achievement.description}</p>
                        
                        {/* Detailed Progress */}
                        {(!achievement.unlockLevel || userData.level >= achievement.unlockLevel) && (
                          <div>
                            <div className="flex justify-between mb-1 text-xs">
                              <span>{achievement.progress} completed</span>
                              <span>{achievement.maxProgress} required</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-2.5" 
                            />
                            
                            {isPremium && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-indigo-600 hover:text-indigo-800 mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerAnimation(achievement.id);
                                }}
                              >
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                Test Animation
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Feature explanation */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-semibold">About Interactive Gamification</h3>
        </div>
        <p className="text-gray-600 mb-4">
          As a premium member, enjoy enhanced gamification features with interactive animations and visual effects that bring your achievements and progress to life.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-indigo-500" />
              Premium Visualizations
            </h4>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Animated progress bars that celebrate milestones</li>
              <li>Visual feedback when earning achievements</li>
              <li>Interactive level-up celebrations</li>
              <li>Enhanced progress tracking with detailed stats</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Rocket className="h-4 w-4 mr-1 text-pink-500" />
              Accelerated Growth
            </h4>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Premium members earn tokens 50% faster</li>
              <li>Exclusive bonus achievements</li>
              <li>Special milestone rewards</li>
              <li>Priority access to limited-time challenges</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}