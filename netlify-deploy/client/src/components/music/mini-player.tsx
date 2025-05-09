import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, X, Maximize2, Minimize2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Track {
  id: number;
  title: string;
  composer: string;
  year: string;
  length: string;
  thumbnail: string;
  audioUrl: string;
  benefits: string;
  category: string;
  preview: boolean;
  featured: boolean;
}

interface MiniPlayerContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPremium: boolean;
  isExpanded: boolean;
  play: (track: Track) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  toggleExpanded: () => void;
  close: () => void;
}

interface MiniPlayerProps {
  tracks: Track[];
  isPremium: boolean;
  onClose: () => void;
}

export default function MiniPlayer({ tracks, isPremium, onClose }: MiniPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [displayTime, setDisplayTime] = useState<string>("0:00");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const currentTrack = tracks[currentTrackIndex] || null;
  
  // Only allow premium tracks for premium users
  const availableTracks = isPremium 
    ? tracks 
    : tracks.filter(track => track.preview);
    
  // Initialize player with the first available track if none selected
  useEffect(() => {
    if (availableTracks.length > 0 && !currentTrack) {
      setCurrentTrackIndex(tracks.indexOf(availableTracks[0]));
    }
  }, [availableTracks, currentTrack, tracks]);

  // Set up audio element and event listeners
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const onEnded = () => {
      handleNext();
    };
    
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    
    // Set volume
    audio.volume = volume / 100;
    
    // Clean up event listeners
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      
      // Clear progress interval
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentTrackIndex, volume]);
  
  // Auto-play when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, currentTrack, isPlaying]);
  
  // Update progress bar
  useEffect(() => {
    if (!audioRef.current) return;
    
    const updateProgress = () => {
      if (!audioRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      const audioDuration = audioRef.current.duration || 0;
      
      if (audioDuration > 0) {
        setProgress((currentTime / audioDuration) * 100);
        
        // Format time as M:SS
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    if (isPlaying) {
      // Update progress every 500ms
      progressIntervalRef.current = window.setInterval(updateProgress, 500);
    } else if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);
  
  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (availableTracks.length <= 1) return;
    
    let nextIndex = 0;
    const currentAvailableIndex = availableTracks.findIndex(t => t.id === currentTrack?.id);
    
    if (currentAvailableIndex >= 0 && currentAvailableIndex < availableTracks.length - 1) {
      nextIndex = tracks.indexOf(availableTracks[currentAvailableIndex + 1]);
    } else {
      nextIndex = tracks.indexOf(availableTracks[0]);
    }
    
    setCurrentTrackIndex(nextIndex);
  };
  
  const handlePrevious = () => {
    if (availableTracks.length <= 1) return;
    
    let prevIndex = 0;
    const currentAvailableIndex = availableTracks.findIndex(t => t.id === currentTrack?.id);
    
    if (currentAvailableIndex > 0) {
      prevIndex = tracks.indexOf(availableTracks[currentAvailableIndex - 1]);
    } else {
      prevIndex = tracks.indexOf(availableTracks[availableTracks.length - 1]);
    }
    
    setCurrentTrackIndex(prevIndex);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
  };
  
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current || !currentTrack) return;
    
    const newProgress = value[0];
    setProgress(newProgress);
    
    const newTime = (newProgress / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      className={cn(
        "fixed transition-all duration-300 ease-in-out z-50 shadow-lg",
        isExpanded 
          ? "bottom-0 left-0 right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[500px] rounded-t-xl"
          : "bottom-4 right-4 rounded-xl w-80"
      )}
    >
      <Card className="border-0 overflow-hidden bg-slate-900 text-white">
        {/* Progress bar - top of player */}
        <div 
          className="h-1 bg-primary"
          style={{ width: `${progress}%` }}
        ></div>
        
        <CardContent className="p-0">
          {/* Main player display */}
          <div className="p-3 flex items-center gap-3">
            {/* Album art / track image */}
            {currentTrack && (
              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            {/* Track information */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {currentTrack?.title || "No track selected"}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {currentTrack?.composer || ""}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-300 hover:text-white" 
                onClick={handlePrevious}
                disabled={availableTracks.length <= 1}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20" 
                onClick={handlePlayPause}
                disabled={!currentTrack}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-300 hover:text-white" 
                onClick={handleNext}
                disabled={availableTracks.length <= 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Utility buttons */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-400 hover:text-white" 
                onClick={toggleExpand}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-400 hover:text-white" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Expanded view - only shown when expanded */}
          {isExpanded && (
            <div className="px-4 pb-4">
              {/* Track progress bar */}
              <div className="mt-2 mb-4">
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{displayTime}</span>
                  <span>{currentTrack?.length || "0:00"}</span>
                </div>
              </div>
              
              {/* Volume control */}
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
              
              {/* Track list for quick navigation */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 text-gray-300">
                  {isPremium ? "All Tracks" : "Free Previews"}
                </h3>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
                  {availableTracks.map((track, index) => (
                    <button
                      key={track.id}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors",
                        currentTrack?.id === track.id
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 text-gray-300"
                      )}
                      onClick={() => {
                        setCurrentTrackIndex(tracks.indexOf(track));
                        setIsPlaying(true);
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <Play className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{track.title}</span>
                    </button>
                  ))}
                </div>
                
                {!isPremium && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      Upgrade to Premium for {tracks.length - availableTracks.length} more tracks
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        preload="auto"
      />
    </div>
  );
}