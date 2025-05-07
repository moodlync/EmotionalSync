import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface BackgroundMusicProps {
  audioSrc: string;
  autoPlay?: boolean;
  initialVolume?: number;
  className?: string;
}

export const BackgroundMusic = ({
  audioSrc,
  autoPlay = false,
  initialVolume = 0.5,
  className = '',
}: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlayThrough = () => {
      setIsAudioLoaded(true);
      setError(null);
    };

    const handleError = (e: Event) => {
      console.error("Error loading audio:", e);
      setError("There was an error loading the audio file.");
      setIsPlaying(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    // Initial volume and muted state
    audio.volume = volume;
    audio.muted = isMuted;

    // Try to autoplay if requested
    if (autoPlay) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Autoplay prevented:", err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [autoPlay]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Play prevented:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop
      />
      
      <Button
        onClick={togglePlay}
        size="sm"
        variant="secondary"
        className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2 h-10 w-10"
      >
        <Music className="h-5 w-5" />
      </Button>
      
      <Button 
        onClick={toggleMute}
        size="sm"
        variant="secondary"
        className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2 h-10 w-10"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      
      <Slider
        defaultValue={[initialVolume]}
        max={1}
        step={0.01}
        value={[volume]}
        onValueChange={handleVolumeChange}
        className="w-20 h-2"
      />
      
      {error && (
        <span className="text-xs text-red-500 ml-2">{error}</span>
      )}
    </div>
  );
};