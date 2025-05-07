import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Animation sequence timings (matched to our enhanced professional video)
const ANIMATIONS = [
  { 
    timestamp: 0, 
    title: 'Welcome to MoodSync', 
    description: 'A revolutionary platform for authentic emotional connections',
    color: 'from-blue-600 to-purple-600',
    image: '/assets/welcome-images/emotional-connection.svg',
    animation: 'fade-in-up'
  },
  { 
    timestamp: 4, 
    title: 'Emotional Intelligence', 
    description: 'AI-powered analysis helps understand and share your true emotions',
    color: 'from-violet-600 to-indigo-600',
    image: '/assets/welcome-images/emotional-intelligence.svg',
    animation: 'slide-in-right'
  },
  { 
    timestamp: 8, 
    title: 'Find Your Emotional Match', 
    description: 'Connect with others sharing similar emotional experiences',
    color: 'from-emerald-600 to-teal-600',
    image: '/assets/welcome-images/emotional-match.svg',
    animation: 'zoom-in'
  },
  { 
    timestamp: 12, 
    title: 'Meaningful Conversations', 
    description: 'Engage in deeper, more authentic discussions based on shared emotions',
    color: 'from-indigo-600 to-sky-600',
    image: '/assets/welcome-images/authentic-conversations.svg',
    animation: 'fade-in-down'
  },
  { 
    timestamp: 16, 
    title: 'Global Emotion Pulse', 
    description: 'Visualize and connect with the world\'s emotional landscape in real-time',
    color: 'from-amber-600 to-orange-600',
    image: '/assets/welcome-images/global-emotions.svg',
    animation: 'slide-in-left'
  },
  { 
    timestamp: 20, 
    title: 'Premium Experience', 
    description: 'Unlock exclusive features designed for deeper emotional wellness',
    color: 'from-rose-600 to-pink-600',
    image: '/assets/welcome-images/premium-features.svg',
    animation: 'zoom-in-bounce'
  },
  { 
    timestamp: 24, 
    title: 'Join Our Community', 
    description: 'Be part of a supportive network fostering emotional wellbeing',
    color: 'from-purple-600 to-fuchsia-600',
    image: '/assets/welcome-images/community.svg',
    animation: 'pulse'
  },
];

export function FeatureVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentAnimation, setCurrentAnimation] = useState(ANIMATIONS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Set up video source with proper poster image
  const videoSource = '/assets/app-features.mp4';
  const audioSource = '/assets/welcome-video/classical-background.mp3';

  // Format time from seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Animation transition effects mapping
  const animationEffects = {
    'fade-in-up': 'animate-fadeInUp',
    'slide-in-right': 'animate-slideInRight',
    'zoom-in': 'animate-zoomIn',
    'fade-in-down': 'animate-fadeInDown',
    'slide-in-left': 'animate-slideInLeft',
    'zoom-in-bounce': 'animate-zoomInBounce',
    'pulse': 'animate-pulse',
  };

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(audioSource);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current && isBackgroundMusicPlaying) {
          audioRef.current.pause();
        }
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
        if (audioRef.current && !isMuted) {
          audioRef.current.play().catch(error => {
            console.error('Error playing audio:', error);
          });
          setIsBackgroundMusicPlaying(true);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle progress bar click for seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    
    if (!progressBar || !video) return;
    
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
    
    if (audioRef.current && isBackgroundMusicPlaying) {
      // Synchronize audio with video position
      audioRef.current.currentTime = pos * 5 % audioRef.current.duration;
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime += seconds;
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle time update and animation switching
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration || 60; // fallback to 60s if duration is not available
        const calculatedProgress = (currentTime / duration) * 100;
        setProgress(calculatedProgress);
        setCurrentTime(currentTime);

        // Find the appropriate animation based on current time
        const currentAnim = ANIMATIONS.findLast(anim => currentTime >= anim.timestamp) || ANIMATIONS[0];
        setCurrentAnimation(currentAnim);
      }
    };

    const handleDurationChange = () => {
      if (videoRef.current && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadeddata', () => setIsVideoReady(true));
      video.addEventListener('durationchange', handleDurationChange);
      video.addEventListener('ended', () => {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsBackgroundMusicPlaying(false);
        }
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadeddata', () => setIsVideoReady(true));
        video.removeEventListener('durationchange', handleDurationChange);
        video.removeEventListener('ended', () => {
          setIsPlaying(false);
          if (audioRef.current) {
            audioRef.current.pause();
            setIsBackgroundMusicPlaying(false);
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Create a professional video simulation with high-quality SVG graphics
  // This provides a polished visual experience while video loads or as an enhancement
  const renderSimulatedContent = () => {
    return (
      <div className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        `bg-gradient-to-br ${currentAnimation.color.split(' ')[0]}/10 to-${currentAnimation.color.split(' ')[1]}/30`
      )}>
        {/* SVG Animation with professional graphics */}
        <div className={cn(
          "w-[280px] h-[280px] relative z-10 transition-all duration-700",
          animationEffects[currentAnimation.animation] || "animate-fadeInUp"
        )}>
          {/* Display the current SVG for this animation step */}
          <object 
            type="image/svg+xml" 
            data={currentAnimation.image} 
            className="w-full h-full"
            aria-label={currentAnimation.title}
          />
        </div>
        
        {/* Text Content with dynamic styling */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
          <h3 className={cn(
            "text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent",
            currentAnimation.color
          )}>
            {currentAnimation.title}
          </h3>
          <p className="text-sm md:text-base text-gray-200 max-w-md">
            {currentAnimation.description}
          </p>
        </div>
        
        {/* Animated floating particles for depth */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 8 + (i % 3 === 0 ? 6 : 3);
            const isLarge = size > 8;
            return (
              <div 
                key={i}
                className={cn(
                  "absolute rounded-full",
                  isLarge ? "bg-white" : `bg-gradient-to-r ${currentAnimation.color}`
                )}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.3 + 0.1,
                  filter: isLarge ? 'blur(1px)' : 'none',
                  animation: `float ${Math.random() * 15 + 10}s ${Math.random() * 5}s infinite ease-in-out`,
                  transform: `scale(${Math.random() * 0.6 + 0.7})`,
                }}
              />
            );
          })}
        </div>
        
        {/* Animated gradient overlay for cohesive look */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: `linear-gradient(45deg, ${currentAnimation.color.split(' ')[0].replace('from-', '')}, transparent, ${currentAnimation.color.split(' ')[1].replace('to-', '')})`,
            backgroundSize: '400% 400%',
            animation: 'gradientFlow 15s ease infinite'
          }}
        />
      </div>
    );
  };

  return (
    <Card 
      ref={containerRef} 
      className="w-full overflow-hidden p-0 shadow-lg rounded-lg bg-black group"
    >
      <div className="relative aspect-video bg-black">
        {/* Actual video element */}
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isVideoReady ? "opacity-100" : "opacity-0"
          )}
          src={videoSource}
          poster="/assets/video-poster.jpg"
          playsInline
        />

        {/* Fallback/loading animation content */}
        <div className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-500",
          isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          {renderSimulatedContent()}
        </div>

        {/* Video title overlay with dynamic gradient colors */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h3 className={cn(
            "text-lg md:text-xl font-bold transition-all duration-700 bg-gradient-to-r bg-clip-text text-transparent",
            currentAnimation.color
          )}>
            {currentAnimation.title}
          </h3>
          <p className="text-sm md:text-base text-gray-200 transition-all duration-500">
            {currentAnimation.description}
          </p>
        </div>

        {/* Play button overlay - centered, shown when paused or on hover */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}>
          <Button
            onClick={togglePlay}
            className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all duration-200 border-2 border-white/40 hover:scale-110 shadow-lg"
            variant="ghost"
          >
            {isPlaying ? <Pause className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 text-white ml-1" />}
          </Button>
        </div>
      </div>

      {/* Video controls - Mobile Responsive */}
      <div className="p-2 sm:p-3 bg-gradient-to-t from-black to-black/90 text-white flex flex-col">
        {/* Time and progress */}
        <div className="w-full mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-white/70">{formatTime(currentTime)}</span>
          
          <div 
            ref={progressRef}
            className="flex-grow h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-primary transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <span className="text-[10px] sm:text-xs text-white/70">{formatTime(duration)}</span>
        </div>
        
        {/* Control buttons - Mobile Responsive */}
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              onClick={togglePlay} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 sm:p-2 text-white hover:text-white/80 hover:bg-white/10"
            >
              {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            
            <Button 
              onClick={() => skip(-5)} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 sm:p-2 text-white hover:text-white/80 hover:bg-white/10 hidden xs:inline-flex"
            >
              <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button 
              onClick={() => skip(5)} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 sm:p-2 text-white hover:text-white/80 hover:bg-white/10 hidden xs:inline-flex"
            >
              <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              onClick={toggleMute} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 sm:p-2 text-white hover:text-white/80 hover:bg-white/10"
            >
              {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            
            <div className="w-12 sm:w-20 hidden xs:block">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            
            <Button 
              onClick={toggleFullscreen} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 sm:p-2 text-white hover:text-white/80 hover:bg-white/10"
            >
              {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}