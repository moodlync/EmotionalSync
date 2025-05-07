import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { EmotionalImprint, ImprintInteraction } from '@/types/imprints';
import { colorOptions, soundOptions, vibrationOptions } from '@/lib/imprints-constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Heart, Share2, Bookmark, MessageCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ImprintViewerProps {
  imprint: EmotionalImprint;
  isPreview?: boolean;
  onShare?: (imprint: EmotionalImprint) => void;
  onComment?: (imprint: EmotionalImprint) => void;
}

const ImprintViewer: React.FC<ImprintViewerProps> = ({
  imprint,
  isPreview = false,
  onShare,
  onComment,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [interactionState, setInteractionState] = useState({
    liked: false,
    saved: false,
  });

  const isAuthor = user && imprint.userId === user.id;
  
  // Initialize audio
  useEffect(() => {
    if (imprint.soundId) {
      const audioElement = new Audio(`/sounds/${imprint.soundId}.mp3`);
      audioElement.loop = true;
      setAudio(audioElement);
      
      return () => {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      };
    }
  }, [imprint.soundId]);
  
  // Record view interaction when component mounts
  useEffect(() => {
    if (!isPreview && user && !isAuthor) {
      recordInteraction('view');
    }
  }, []);

  // Toggle play/pause for sound
  const togglePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
        toast({
          title: 'Sound Playback Error',
          description: 'There was an issue playing the sound. Try again later.',
          variant: 'destructive',
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Toggle mute/unmute for sound
  const toggleMute = () => {
    if (!audio) return;
    
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  // Activate vibration if available
  const activateVibration = () => {
    if (!imprint.vibrationPattern || !navigator.vibrate) return;
    
    // Different vibration patterns
    const patterns = {
      short: [200],
      long: [1000],
      double: [200, 100, 200],
      triple: [200, 100, 200, 100, 200],
      escalating: [100, 50, 200, 50, 300],
      heartbeat: [100, 30, 100, 500, 100, 30, 100],
    };
    
    const pattern = patterns[imprint.vibrationPattern];
    if (pattern) {
      navigator.vibrate(pattern);
    }
  };

  // Record interactions with the imprint
  const recordInteraction = async (interactionType: 'like' | 'share' | 'save' | 'view' | 'comment') => {
    if (!user || isPreview) return;
    
    try {
      const response = await apiRequest('POST', `/api/emotional-imprints/${imprint.id}/interactions`, {
        interactionType,
      });
      
      // Update interaction state
      if (interactionType === 'like') {
        setInteractionState(prev => ({ ...prev, liked: true }));
      } else if (interactionType === 'save') {
        setInteractionState(prev => ({ ...prev, saved: true }));
        toast({
          title: 'Imprint Saved',
          description: 'This emotional imprint has been saved to your collection.',
        });
      }
      
      // Invalidate queries to refresh imprint data
      queryClient.invalidateQueries({ queryKey: [`/api/emotional-imprints/${imprint.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints/my'] });
      
      return await response.json();
    } catch (error) {
      console.error(`Error recording ${interactionType} interaction:`, error);
      toast({
        title: 'Action Failed',
        description: `Failed to ${interactionType} this imprint. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  // Handle like interaction
  const handleLike = () => {
    if (interactionState.liked) return;
    recordInteraction('like');
  };

  // Handle save interaction
  const handleSave = () => {
    if (interactionState.saved) return;
    recordInteraction('save');
  };

  // Handle share interaction
  const handleShare = () => {
    if (onShare) {
      recordInteraction('share');
      onShare(imprint);
    }
  };

  // Handle comment interaction
  const handleComment = () => {
    if (onComment) {
      recordInteraction('comment');
      onComment(imprint);
    }
  };

  // Get color from imprint
  const getImprintColor = () => {
    if (imprint.colorCode && colorOptions[imprint.colorCode]) {
      return colorOptions[imprint.colorCode];
    }
    return '#e2e8f0'; // Default color
  };

  // Get sound name from imprint
  const getSoundName = () => {
    if (imprint.soundId) {
      const sound = soundOptions.find(s => s.id === imprint.soundId);
      return sound ? sound.name : 'Unknown Sound';
    }
    return 'No Sound';
  };

  // Get vibration name from imprint
  const getVibrationName = () => {
    if (imprint.vibrationPattern) {
      const vibration = vibrationOptions.find(v => v.id === imprint.vibrationPattern);
      return vibration ? vibration.name : 'Unknown Pattern';
    }
    return 'No Vibration';
  };

  return (
    <Card className="overflow-hidden border-2 transition-all duration-300 h-full">
      {/* Color Header */}
      <div 
        className="h-20 w-full transition-all duration-500"
        style={{ 
          backgroundColor: getImprintColor(),
          opacity: imprint.intensity ? (imprint.intensity / 10) : 0.8 
        }}
      />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{imprint.name}</CardTitle>
            <CardDescription>
              {imprint.author && (
                <span className="text-sm">
                  By {imprint.author.username}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={
            imprint.emotion === 'Joy' || imprint.emotion === 'Love' || imprint.emotion === 'Hope' 
              ? 'default' 
              : imprint.emotion === 'Anger' || imprint.emotion === 'Fear' || imprint.emotion === 'Sadness'
                ? 'destructive'
                : 'secondary'
          }>
            {imprint.emotion}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {imprint.description && (
            <p className="text-sm text-muted-foreground">{imprint.description}</p>
          )}
          
          {/* Intensity Bar */}
          {imprint.intensity && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Intensity</span>
                <span>{imprint.intensity}/10</span>
              </div>
              <Progress value={imprint.intensity * 10} />
            </div>
          )}
          
          {/* Sensory Info */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {imprint.colorCode && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getImprintColor() }}
                />
                <span>{imprint.colorCode}</span>
              </div>
            )}
            
            {imprint.soundId && (
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-primary" />
                ) : (
                  <Play className="w-4 h-4 text-primary" />
                )}
                <span>{getSoundName()}</span>
              </div>
            )}
            
            {imprint.vibrationPattern && (
              <div className="flex items-center gap-2">
                <span className="text-xs">{getVibrationName()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between border-t">
        {/* Control Buttons */}
        <div className="flex space-x-2">
          {imprint.soundId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={togglePlay}
              className="h-8 w-8 p-0"
              aria-label={isPlaying ? "Pause sound" : "Play sound"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {imprint.soundId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMute}
              className="h-8 w-8 p-0"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              disabled={!isPlaying}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Action Buttons */}
        {!isPreview && (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`h-8 w-8 p-0 ${interactionState.liked ? 'text-red-500' : ''}`}
              aria-label="Like"
            >
              <Heart className="h-4 w-4" fill={interactionState.liked ? 'currentColor' : 'none'} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              className="h-8 w-8 p-0"
              aria-label="Comment"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="h-8 w-8 p-0"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className={`h-8 w-8 p-0 ${interactionState.saved ? 'text-primary' : ''}`}
              aria-label="Save"
            >
              <Bookmark className="h-4 w-4" fill={interactionState.saved ? 'currentColor' : 'none'} />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ImprintViewer;