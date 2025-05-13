import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// AI-generated video scenes with descriptions for the welcome section
const VIDEO_SCENES = [
  {
    title: "Welcome to MoodSync",
    description: "A revolutionary platform that connects people through shared emotions",
    color: "from-blue-500 to-indigo-600",
    animation: "fade-in"
  },
  {
    title: "Express Your Emotions",
    description: "Our AI analyzes your emotional state to help you connect with others",
    color: "from-purple-500 to-pink-600",
    animation: "slide-in-right"
  },
  {
    title: "Find Your Emotional Match",
    description: "Connect with others who understand exactly how you feel",
    color: "from-emerald-500 to-teal-600",
    animation: "zoom-in"
  },
  {
    title: "Build Authentic Relationships",
    description: "Experience deeper connections through shared emotional journeys",
    color: "from-amber-500 to-orange-600",
    animation: "fade-in-up"
  },
  {
    title: "Join Our Global Community",
    description: "Be part of a worldwide network of emotional support and understanding",
    color: "from-red-500 to-rose-600",
    animation: "bounce"
  }
];

export function AIWelcomeVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progressBars, setProgressBars] = useState<number[]>(Array(VIDEO_SCENES.length).fill(0));
  const [isHovering, setIsHovering] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Animation classes for different effects
  const animations = {
    "fade-in": "animate-fadeIn",
    "fade-in-up": "animate-fadeInUp",
    "slide-in-right": "animate-slideInRight",
    "zoom-in": "animate-zoomIn",
    "bounce": "animate-bounce"
  };
  
  // Initialize audio for background music that matches emotional theme
  useEffect(() => {
    const audio = new Audio('/assets/emotional-journey.mp3');
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;
    
    // Auto-start the animation sequence
    startAnimation();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Handle scene transitions
  useEffect(() => {
    if (!isPlaying) return;
    
    // Progress animation for current scene
    const interval = setInterval(() => {
      setProgressBars(prev => {
        const newBars = [...prev];
        if (newBars[currentSceneIndex] < 100) {
          newBars[currentSceneIndex] += 0.5;
        } else {
          clearInterval(interval);
          // Move to next scene
          setTimeout(() => {
            setCurrentSceneIndex(prev => (prev + 1) % VIDEO_SCENES.length);
          }, 500);
        }
        return newBars;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex]);

  // Reset progress when scene changes
  useEffect(() => {
    if (isPlaying) {
      const newBars = [...progressBars];
      newBars[currentSceneIndex] = 0;
      setProgressBars(newBars);
    }
  }, [currentSceneIndex]);
  
  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Start the animation sequence
  const startAnimation = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };
  
  // Pause the animation sequence
  const pauseAnimation = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      startAnimation();
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Toggle fullscreen
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
  
  // Get current scene
  const currentScene = VIDEO_SCENES[currentSceneIndex];
  
  // Render particle animations
  const renderParticles = () => {
    return Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 6 + 3;
      const speed = Math.random() * 50 + 20;
      const delay = Math.random() * 15;
      const opacity = Math.random() * 0.5 + 0.1;
      
      return (
        <div 
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: i % 3 === 0 ? '#fff' : 'transparent',
            boxShadow: i % 3 === 0 ? '0 0 10px 2px rgba(255, 255, 255, 0.3)' : 'none',
            backgroundImage: i % 3 !== 0 ? `linear-gradient(${currentScene.color.replace('from-', '').replace('to-', '')})` : 'none',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity,
            transform: `scale(${Math.random() * 0.6 + 0.7})`,
            animation: `float ${speed}s ${delay}s infinite ease-in-out`
          }}
        />
      );
    });
  };
  
  // Generate dynamic waves effect
  const renderWaves = () => {
    return (
      <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="absolute w-[200%] h-[60px] opacity-30"
            style={{
              bottom: `${(i - 1) * 20}px`,
              left: '-50%',
              borderRadius: '40%',
              animation: `wave ${6 + i * 2}s infinite linear`,
              backgroundColor: i % 2 === 0 ? 
                currentScene.color.split(' ')[0].replace('from-', '') : 
                currentScene.color.split(' ')[1].replace('to-', ''),
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  };
  
  // Progress indicators for scenes
  const renderProgressIndicators = () => {
    return (
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
        {VIDEO_SCENES.map((_, index) => (
          <div 
            key={index}
            className="h-1 bg-white/30 rounded-full overflow-hidden"
            style={{ width: `${100 / VIDEO_SCENES.length - 1}%` }}
          >
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: `${progressBars[index]}%`,
                opacity: currentSceneIndex === index ? 1 : 0.5
              }}
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl shadow-2xl aspect-[16/9] max-w-full max-h-full bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Dynamic AI-generated content */}
      <div className={cn(
        "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out bg-gradient-to-br",
        currentScene.color
      )}>
        {/* Particle animation */}
        <div className="absolute inset-0 overflow-hidden">
          {renderParticles()}
        </div>
        
        {/* Animated waves */}
        {renderWaves()}
        
        {/* Text content with animations */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10">
          <h2 
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center",
              animations[currentScene.animation as keyof typeof animations]
            )}
            style={{ animationDuration: '1s' }}
          >
            {currentScene.title}
          </h2>
          <p 
            className={cn(
              "text-lg sm:text-xl md:text-2xl max-w-2xl text-center text-white/90",
              animations[currentScene.animation as keyof typeof animations]
            )}
            style={{ animationDuration: '1.2s', animationDelay: '0.2s' }}
          >
            {currentScene.description}
          </p>
        </div>
        
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(45deg, ${currentScene.color.split(' ')[0].replace('from-', '')}, transparent, ${currentScene.color.split(' ')[1].replace('to-', '')})`,
            backgroundSize: '400% 400%',
            animation: 'gradientFlow 15s ease infinite'
          }}
        />
      </div>
      
      {/* Progress indicators */}
      {renderProgressIndicators()}
      
      {/* Play/Pause button overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20",
        (isPlaying && !isHovering) ? "opacity-0" : "opacity-100"
      )}>
        <Button
          onClick={togglePlay}
          className="rounded-full w-16 h-16 bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all duration-200 border-2 border-white/40 hover:scale-110 shadow-lg"
          variant="ghost"
        >
          {isPlaying ? 
            <Pause className="h-8 w-8 text-white" /> : 
            <Play className="h-8 w-8 text-white ml-1" />
          }
        </Button>
      </div>
      
      {/* Video controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 flex items-center justify-between",
        (isHovering || !isPlaying) ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={togglePlay}
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/10 rounded-full"
          >
            {isPlaying ? 
              <Pause className="h-4 w-4" /> : 
              <Play className="h-4 w-4 ml-0.5" />
            }
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={toggleMute}
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/10 rounded-full"
            >
              {isMuted ? 
                <VolumeX className="h-4 w-4" /> : 
                <Volume2 className="h-4 w-4" />
              }
            </Button>
            
            <div className="w-20 hidden sm:block">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                className="h-1"
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={toggleFullscreen}
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/10 rounded-full"
        >
          {isFullscreen ? 
            <Minimize className="h-4 w-4" /> : 
            <Maximize className="h-4 w-4" />
          }
        </Button>
      </div>
      
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
          }
          75% {
            transform: translateY(15px) translateX(5px);
          }
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        @keyframes wave {
          0% { transform: translate(-50%, 0) rotateZ(0deg); }
          50% { transform: translate(-45%, -2%) rotateZ(180deg); }
          100% { transform: translate(-50%, 0) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
}