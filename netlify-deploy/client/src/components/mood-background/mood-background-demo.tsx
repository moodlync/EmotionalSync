import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Palette, 
  Wand2, 
  Lock, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  PanelTopClose,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useMoodBackground, type EmotionType } from '@/hooks/use-mood-background';

// Demo message data for emotion-based chat demo
const demoMessages = [
  {
    id: 1,
    sender: 'Emma',
    content: 'How are you feeling today?',
    avatar: '👩‍🦰'
  },
  {
    id: 2,
    sender: 'You',
    content: "I'm feeling pretty happy today! Just got some great news about a project.",
    isUser: true,
    avatar: '😄'
  },
  {
    id: 3,
    sender: 'Emma',
    content: 'That\'s wonderful! I\'m happy for you. What project was it?',
    avatar: '👩‍🦰'
  },
  {
    id: 4,
    sender: 'You',
    content: "It's the community garden initiative I've been working on. We just got approved for funding!",
    isUser: true,
    avatar: '🌱'
  },
  {
    id: 5,
    sender: 'Emma',
    content: 'Amazing! That must be so satisfying after all your hard work. When does it start?',
    avatar: '👩‍🦰'
  }
];

export function MoodBackgroundDemo() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  
  const [demoType, setDemoType] = useState<'interactive' | 'chat' | 'profile'>('interactive');
  const [transitionSpeed, setTransitionSpeed] = useState<number>(1500);
  const [autoTransition, setAutoTransition] = useState<boolean>(false);
  
  // Create background hook instances for different demos
  const {
    currentEmotion,
    setEmotion,
    styleObject,
    currentColors
  } = useMoodBackground({
    initialEmotion: 'happy',
    animationDuration: transitionSpeed
  });
  
  const {
    currentEmotion: chatEmotion,
    setEmotion: setChatEmotion,
    styleObject: chatStyleObject
  } = useMoodBackground({
    initialEmotion: 'happy',
    animationDuration: transitionSpeed
  });
  
  const {
    currentEmotion: profileEmotion,
    setEmotion: setProfileEmotion,
    styleObject: profileStyleObject
  } = useMoodBackground({
    initialEmotion: 'calm',
    animationDuration: transitionSpeed
  });
  
  // Demo emotions that users can select
  const demoEmotions: EmotionType[] = [
    'happy',
    'sad',
    'angry',
    'anxious',
    'calm',
    'excited',
    'content',
    'nostalgic',
    'hopeful',
    'stressed'
  ];
  
  // Auto transition between emotions for the interactive demo
  useEffect(() => {
    if (autoTransition && isPremium) {
      const interval = setInterval(() => {
        const randomEmotion = demoEmotions[Math.floor(Math.random() * demoEmotions.length)];
        setEmotion(randomEmotion);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [autoTransition, isPremium, setEmotion]);
  
  // Styled cards based on current emotion
  const renderInteractiveDemo = () => {
    return (
      <div className="w-full space-y-6">
        <div style={styleObject} className="p-6 rounded-lg transition-all shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge 
                className="bg-white/20 text-white mb-2"
              >
                Current Emotion: {currentEmotion}
              </Badge>
              <h3 className="text-xl font-bold">
                Mood-Synchronized Background
              </h3>
              <p className="opacity-90 mt-1">
                Watch how the background seamlessly transitions between different emotional states
              </p>
            </div>
            
            {isPremium && (
              <Badge variant="outline" className="bg-black text-white text-xs border-none">
                Premium
              </Badge>
            )}
          </div>
          
          <div className="mt-6 bg-white/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How It Works</h4>
            <p className="text-sm">
              As a premium user, your interface colors automatically adapt to match your current emotional state, 
              creating a more immersive and personalized experience throughout the app.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {demoEmotions.map(emotion => (
            <Button
              key={emotion}
              variant={currentEmotion === emotion ? "default" : "outline"}
              className={cn(
                "capitalize", 
                !isPremium && "opacity-70"
              )}
              onClick={() => setEmotion(emotion)}
              disabled={!isPremium}
            >
              {emotion}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Transition Speed ({transitionSpeed}ms)</Label>
                <Badge 
                  variant="outline" 
                  className={cn(
                    isPremium ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"
                  )}
                >
                  Premium Only
                </Badge>
              </div>
              <Slider
                disabled={!isPremium}
                value={[transitionSpeed]}
                min={500}
                max={3000}
                step={100}
                onValueChange={(values) => setTransitionSpeed(values[0])}
                className={!isPremium ? "opacity-50" : ""}
              />
            </div>
            
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "mr-3",
                  !isPremium && "opacity-70"
                )}
                onClick={() => setAutoTransition(!autoTransition)}
                disabled={!isPremium}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {autoTransition ? 'Stop Auto Transition' : 'Start Auto Transition'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  !isPremium && "opacity-70"
                )}
                onClick={() => setEmotion('neutral')}
                disabled={!isPremium}
              >
                Reset
              </Button>
            </div>
          </div>
          
          <Card className="flex-1 p-4 border shadow-sm">
            <div className="flex items-start space-x-2 mb-4">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Premium Feature Details</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Premium members enjoy smooth color transitions that follow their emotional state throughout the app. 
                  Regular users see standard colors without the dynamic transitions.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center">
                <Badge className="bg-emerald-100 text-emerald-800 mr-2 h-5">Premium</Badge>
                <span className="text-sm">Smooth animated transitions</span>
              </div>
              
              <div className="flex items-center">
                <Badge className="bg-emerald-100 text-emerald-800 mr-2 h-5">Premium</Badge>
                <span className="text-sm">Personalized emotional color palette</span>
              </div>
              
              <div className="flex items-center">
                <Badge className="bg-emerald-100 text-emerald-800 mr-2 h-5">Premium</Badge>
                <span className="text-sm">App-wide theme synchronization</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Chat interface with mood-based backgrounds
  const renderChatDemo = () => {
    return (
      <div className="w-full space-y-6">
        <div style={chatStyleObject} className="rounded-lg shadow-md overflow-hidden transition-all">
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">👩‍🦰</div>
                <div>
                  <h3 className="font-medium">Chat with Emma</h3>
                  <div className="text-xs opacity-90">Online now</div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="rounded-full text-current">
                <PanelTopClose className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="h-[300px] overflow-y-auto p-4 space-y-3">
            {demoMessages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] flex",
                  message.isUser ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "text-xl mx-2",
                    message.isUser ? "ml-0" : "mr-0"
                  )}>
                    {message.avatar}
                  </div>
                  <div className={cn(
                    "rounded-lg p-3",
                    message.isUser 
                      ? "rounded-tr-none bg-white/20 text-current" 
                      : "rounded-tl-none bg-white/30 text-current"
                  )}>
                    <div className="text-xs font-medium mb-1">
                      {message.sender}
                    </div>
                    <div>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center">
              <div className="flex-1 bg-white/30 rounded-full px-4 py-2 text-current opacity-70">
                Type a message...
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="ml-2 text-current"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Chat Emotion Setting</h3>
          <p className="text-sm text-gray-600 mb-4">
            In the premium version, chat backgrounds adapt to match the emotional context of your conversations.
            Try different emotions to see how the chat interface changes.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {demoEmotions.map(emotion => (
              <Button
                key={emotion}
                variant={chatEmotion === emotion ? "default" : "outline"}
                className={cn(
                  "capitalize", 
                  !isPremium && "opacity-70"
                )}
                onClick={() => setChatEmotion(emotion)}
                disabled={!isPremium}
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Profile page with mood-based theming
  const renderProfileDemo = () => {
    const { gradientColors, lightBgColor, accentColor } = 
      isPremium ? 
      { 
        gradientColors: ['#56CCF2', '#2F80ED'], 
        lightBgColor: '#E0F0FF',
        accentColor: '#2F80ED'
      } : 
      { 
        gradientColors: ['#BDBDBD', '#9E9E9E'], 
        lightBgColor: '#F5F5F5',
        accentColor: '#757575'
      };
    
    const gradientStyle = isPremium ? 
      { background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)` } : 
      { background: '#E0E0E0' };
    
    return (
      <div className="w-full space-y-6">
        <Card className="overflow-hidden shadow-md">
          {/* Profile Header with Dynamic Background */}
          <div 
            style={gradientStyle}
            className="h-32 relative transition-all"
          >
            <div className="absolute -bottom-12 left-4">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-3xl shadow-md">
                👨‍💼
              </div>
            </div>
            
            {isPremium && (
              <Badge className="absolute top-3 right-3 bg-black/30 text-white">
                Premium Member
              </Badge>
            )}
          </div>
          
          {/* Profile Content */}
          <div className="pt-14 p-4">
            <h3 className="text-xl font-bold">Michael Johnson</h3>
            <p className="text-gray-600 text-sm">New York, USA</p>
            
            <div className="flex gap-2 mt-4">
              <Badge 
                style={{ 
                  background: lightBgColor,
                  color: accentColor
                }}
                className="transition-all"
              >
                Level 8
              </Badge>
              <Badge 
                style={{ 
                  background: lightBgColor,
                  color: accentColor
                }}
                className="transition-all"
              >
                350 Tokens
              </Badge>
              <Badge 
                style={{ 
                  background: lightBgColor,
                  color: accentColor
                }}
                className="transition-all"
              >
                {profileEmotion}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-xl font-bold">{isPremium ? '128' : '45'}</div>
                <div className="text-xs text-gray-500">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{isPremium ? '24' : '8'}</div>
                <div className="text-xs text-gray-500">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{isPremium ? '15' : '3'}</div>
                <div className="text-xs text-gray-500">Achievements</div>
              </div>
            </div>
            
            <div 
              style={{ background: lightBgColor }} 
              className="p-3 rounded-lg mt-6 transition-all"
            >
              <h4 
                style={{ color: accentColor }}
                className="font-medium mb-2 transition-all"
              >
                Current Mood Status
              </h4>
              <p className="text-sm text-gray-600">
                Feeling {profileEmotion} today! {profileEmotion === 'calm' ? 'Taking time to relax and recharge.' : profileEmotion === 'happy' ? 'Had a great day with family!' : profileEmotion === 'excited' ? 'Looking forward to the weekend!' : 'Just going with the flow.'}
              </p>
            </div>
          </div>
        </Card>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Profile Mood Setting</h3>
          <p className="text-sm text-gray-600 mb-4">
            With the premium version, your profile page adapts to reflect your current emotional state.
            Try different emotions to see how the profile interface changes.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {demoEmotions.slice(0, 5).map(emotion => (
              <Button
                key={emotion}
                variant={profileEmotion === emotion ? "default" : "outline"}
                className={cn(
                  "capitalize", 
                  !isPremium && "opacity-70"
                )}
                onClick={() => setProfileEmotion(emotion)}
                disabled={!isPremium}
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mood-Synchronized Background Colors
      </h2>
      
      {!isPremium && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Mood-synchronized backgrounds are available exclusively to premium members. You're viewing this feature in demo mode with limited functionality.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="interactive" onValueChange={(value) => setDemoType(value as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Interactive</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat Interface</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Profile Page</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interactive">
          {renderInteractiveDemo()}
        </TabsContent>
        
        <TabsContent value="chat">
          {renderChatDemo()}
        </TabsContent>
        
        <TabsContent value="profile">
          {renderProfileDemo()}
        </TabsContent>
      </Tabs>
      
      {/* Feature explanation */}
      <Card className="p-6 shadow-md mt-8">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-semibold">About Mood-Synchronized Backgrounds</h3>
        </div>
        <p className="text-gray-600 mb-4">
          As a premium member, you'll enjoy dynamic background colors that seamlessly transition based on your current emotional state. This feature creates a more immersive and personalized experience as you interact with different parts of the app.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Palette className="h-4 w-4 mr-1 text-indigo-500" />
              How It Works
            </h4>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Colors automatically adapt to your current emotion</li>
              <li>Smooth transitions between emotional states</li>
              <li>Carefully designed color palettes for each emotion</li>
              <li>Consistent emotional color themes across the app</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-1 text-amber-500" />
              Premium Benefits
            </h4>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Enhanced immersion in the emotional experience</li>
              <li>Personalized visual feedback on your emotional state</li>
              <li>Deeper connection between your emotions and the interface</li>
              <li>Customizable transition speeds in settings</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}