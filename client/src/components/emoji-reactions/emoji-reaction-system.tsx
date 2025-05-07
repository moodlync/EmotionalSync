import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Info, AlertTriangle, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define emoji categories and their corresponding emojis
const emojiCategories = [
  {
    name: 'Feelings',
    emojis: [
      { emoji: '❤️', label: 'love', count: 0 },
      { emoji: '👍', label: 'like', count: 0 },
      { emoji: '👏', label: 'applause', count: 0 },
      { emoji: '🙌', label: 'celebration', count: 0 },
      { emoji: '😂', label: 'laughter', count: 0 },
      { emoji: '😍', label: 'adore', count: 0 },
    ]
  },
  {
    name: 'Emotional Support',
    emojis: [
      { emoji: '🤗', label: 'hug', count: 0 },
      { emoji: '🥰', label: 'caring', count: 0 },
      { emoji: '💯', label: 'hundred', count: 0 },
      { emoji: '🔥', label: 'fire', count: 0 },
      { emoji: '✨', label: 'sparkles', count: 0 },
      { emoji: '💪', label: 'strength', count: 0 },
    ]
  },
  {
    name: 'Deeper Emotions',
    emojis: [
      { emoji: '🥺', label: 'pleading', count: 0 },
      { emoji: '😢', label: 'sad', count: 0 },
      { emoji: '😮', label: 'surprised', count: 0 },
      { emoji: '🤔', label: 'thinking', count: 0 },
      { emoji: '😌', label: 'relieved', count: 0 },
      { emoji: '🙏', label: 'grateful', count: 0 },
    ]
  }
];

interface EmojiButtonProps {
  emoji: string;
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
  isPremium: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showLabel?: boolean;
  animated?: boolean;
}

const EmojiButton = ({ 
  emoji, 
  label, 
  count, 
  selected, 
  onClick, 
  isPremium,
  size = 'md',
  showCount = true,
  showLabel = false,
  animated = true
}: EmojiButtonProps) => {
  const sizeClasses = {
    sm: 'text-lg p-1.5',
    md: 'text-xl p-2',
    lg: 'text-2xl p-2.5',
  };
  
  const buttonClasses = cn(
    'rounded-full flex items-center justify-center',
    sizeClasses[size],
    selected ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-gray-100 hover:bg-gray-200',
    !isPremium && 'opacity-70 cursor-not-allowed',
    animated && isPremium && selected && 'emoji-pulse'
  );
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            className={buttonClasses}
            onClick={isPremium ? onClick : undefined}
            disabled={!isPremium}
          >
            <span className={cn(
              'flex items-center',
              showCount && count > 0 && 'space-x-1'
            )}>
              <span className={animated && isPremium && selected ? 'animate-bounce' : ''}>
                {emoji}
              </span>
              {showCount && count > 0 && (
                <span className="text-xs font-medium text-gray-700">{count}</span>
              )}
              {showLabel && (
                <span className="text-xs capitalize ml-1">{label}</span>
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs capitalize">
          {label} {count > 0 ? `(${count})` : ''}
          {!isPremium && (
            <div className="flex items-center mt-1 text-amber-500">
              <Lock className="h-3 w-3 mr-1" />
              Premium feature
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Demo post content to react to
const demoPost = {
  id: 1,
  authorName: 'Emma Wilson',
  content: "Just had a breakthrough in my meditation practice today. After weeks of struggling with racing thoughts, I finally experienced that moment of pure stillness and presence. It's amazing how emotional awareness can transform your state of mind! 🧘‍♀️✨ #EmotionalGrowth #MindfulnessPractice",
  timestamp: '2 hours ago',
  avatar: '👩‍🦰'
};

const demoComments = [
  {
    id: 1,
    authorName: 'David Chen',
    content: "I've been there! That moment when everything just clicks into place is so rewarding. Congrats on your breakthrough! 🎉",
    timestamp: '45 minutes ago',
    avatar: '👨‍🦱'
  },
  {
    id: 2,
    authorName: 'Sarah Johnson',
    content: "This is inspiring! I've been struggling with my own practice lately. Would you mind sharing what helped you get to this point?",
    timestamp: '30 minutes ago',
    avatar: '👩‍🦳'
  }
];

interface EmojiReactionSystemProps {
  standalone?: boolean;
}

export function EmojiReactionSystem({ standalone = true }: EmojiReactionSystemProps) {
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  
  // For demo purposes, we'll use local state to track reactions
  const [postReactions, setPostReactions] = useState<{[key: string]: number}>({});
  const [commentReactions, setCommentReactions] = useState<{[key: string]: {[key: string]: number}}>({
    '1': {},
    '2': {}
  });
  const [selectedReactions, setSelectedReactions] = useState<{[key: string]: string[]}>({
    'post': [],
    'comment-1': [],
    'comment-2': []
  });
  
  const handleReaction = (targetType: 'post' | 'comment', targetId: string, emoji: string, label: string) => {
    if (!isPremium) return;
    
    // Toggle the reaction
    const targetKey = targetType === 'post' ? 'post' : `comment-${targetId}`;
    const isSelected = selectedReactions[targetKey]?.includes(emoji);
    
    // Update selected reactions
    setSelectedReactions(prev => {
      const newSelected = {...prev};
      
      if (isSelected) {
        newSelected[targetKey] = newSelected[targetKey].filter(e => e !== emoji);
      } else {
        newSelected[targetKey] = [...(newSelected[targetKey] || []), emoji];
      }
      
      return newSelected;
    });
    
    // Update reaction counts
    if (targetType === 'post') {
      setPostReactions(prev => {
        const newReactions = {...prev};
        if (isSelected) {
          newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1);
          if (newReactions[emoji] === 0) delete newReactions[emoji];
        } else {
          newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        }
        return newReactions;
      });
    } else {
      setCommentReactions(prev => {
        const newReactions = {...prev};
        if (!newReactions[targetId]) newReactions[targetId] = {};
        
        if (isSelected) {
          newReactions[targetId][emoji] = Math.max(0, (newReactions[targetId][emoji] || 1) - 1);
          if (newReactions[targetId][emoji] === 0) delete newReactions[targetId][emoji];
        } else {
          newReactions[targetId][emoji] = (newReactions[targetId][emoji] || 0) + 1;
        }
        
        return newReactions;
      });
    }
  };
  
  // Add some initial reactions for the demo
  useEffect(() => {
    if (standalone && Object.keys(postReactions).length === 0) {
      setPostReactions({
        '❤️': 12,
        '👍': 8,
        '🔥': 5,
        '👏': 3
      });
      
      setCommentReactions({
        '1': { '👍': 4, '🙌': 2 },
        '2': { '❤️': 3, '🤗': 1 }
      });
    }
  }, [standalone, postReactions]);
  
  // CSS for the animated emojis
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes emojiPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .emoji-pulse {
        animation: emojiPulse 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const renderEmojiPicker = (targetType: 'post' | 'comment', targetId: string = '') => {
    const targetKey = targetType === 'post' ? 'post' : `comment-${targetId}`;
    const selectedEmojis = selectedReactions[targetKey] || [];
    
    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1.5">
          {emojiCategories[0].emojis.map(({ emoji, label, count }) => (
            <EmojiButton 
              key={emoji}
              emoji={emoji}
              label={label}
              count={targetType === 'post' 
                ? postReactions[emoji] || 0 
                : commentReactions[targetId]?.[emoji] || 0}
              selected={selectedEmojis.includes(emoji)}
              onClick={() => handleReaction(targetType, targetId, emoji, label)}
              isPremium={isPremium || false}
              size="sm"
              showCount={false}
            />
          ))}
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 p-1"
            >
              <span className="ml-1">+</span>
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  const renderReactionsSummary = (targetType: 'post' | 'comment', targetId: string = '') => {
    const reactions = targetType === 'post' 
      ? postReactions 
      : commentReactions[targetId] || {};
    
    const reactionEntries = Object.entries(reactions);
    
    if (reactionEntries.length === 0) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-1 mt-2">
        {reactionEntries.map(([emoji, count]) => (
          <Badge 
            key={emoji} 
            variant="outline"
            className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <span className="mr-1">{emoji}</span>
            <span className="text-xs font-normal text-gray-700">{count}</span>
          </Badge>
        ))}
      </div>
    );
  };
  
  if (!standalone) {
    // Just return the emoji picker component for integration into other components
    return (
      <div>
        {renderEmojiPicker('post')}
        {renderReactionsSummary('post')}
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Emoji Reaction System
      </h2>
      
      {!isPremium && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            The emoji reaction system is a premium feature. Upgrade to interact with advanced emoji reactions.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-8">
        {/* Demo post with reaction system */}
        <Card className="p-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{demoPost.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{demoPost.authorName}</h3>
                <span className="text-xs text-gray-500">{demoPost.timestamp}</span>
              </div>
              <p className="text-gray-700 my-3">{demoPost.content}</p>
              
              {/* Reaction summary */}
              {renderReactionsSummary('post')}
              
              {/* Reaction buttons */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-1.5 text-gray-600",
                            !isPremium && "opacity-70"
                          )}
                          disabled={!isPremium}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Like</span>
                        </Button>
                      </TooltipTrigger>
                      {!isPremium && (
                        <TooltipContent>
                          <div className="flex items-center text-amber-500 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium feature
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-gray-600">
                    <span>Comment</span>
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "flex items-center gap-1.5 text-gray-600",
                    !isPremium && "opacity-70"
                  )}
                >
                  {isPremium ? (
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>React</span>
                </Button>
              </div>
              
              {/* Extended emoji picker */}
              {renderEmojiPicker('post')}
              
              {/* Comments */}
              <div className="mt-6 space-y-4">
                {demoComments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="text-xl">{comment.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{comment.authorName}</h4>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm my-2">{comment.content}</p>
                        
                        {/* Comment reaction summary */}
                        {renderReactionsSummary('comment', comment.id.toString())}
                        
                        {/* Comment reaction buttons */}
                        <div className="flex items-center gap-3 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "py-0 h-6 text-xs text-gray-500",
                              !isPremium && "opacity-70"
                            )}
                            disabled={!isPremium}
                          >
                            React
                          </Button>
                          <Button variant="ghost" size="sm" className="py-0 h-6 text-xs text-gray-500">
                            Reply
                          </Button>
                        </div>
                        
                        {/* Comment emoji picker */}
                        {renderEmojiPicker('comment', comment.id.toString())}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Feature explanation */}
        <Card className="p-6 shadow-md">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">About Emoji Reactions</h3>
          </div>
          <p className="text-gray-600 mb-4">
            As a premium member, you'll have access to an enhanced emoji reaction system that allows for more nuanced emotional responses to posts and comments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {emojiCategories.map(category => (
              <div key={category.name} className="bg-slate-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-slate-700 mb-2">{category.name}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {category.emojis.map(({ emoji, label }) => (
                    <div key={emoji} className="flex flex-col items-center">
                      <span className="text-xl mb-1">{emoji}</span>
                      <span className="text-xs text-gray-500 capitalize">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Premium members can express more nuanced emotions and see detailed reaction analytics. This helps create more meaningful interactions within the community and provides deeper insights into how others respond to your content.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}