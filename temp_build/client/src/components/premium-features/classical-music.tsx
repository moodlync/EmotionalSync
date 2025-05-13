import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Info, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useMusicPlayer, CLASSICAL_TRACKS } from "@/hooks/use-music-player";

// List of copyright-free classical instrumental music known to improve mental health and wellbeing
// These pieces are all in the public domain (composed before 1925)
const classicalTracks = [
  {
    id: 1,
    title: "Moonlight Sonata (1st Movement)",
    composer: "Ludwig van Beethoven",
    year: "1801",
    length: "5:24",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Moonlight",
    audioUrl: "https://musopen.org/music/download/236-mp3/",
    benefits: "Reduces anxiety, aids in meditation, promotes relaxation",
    category: "Romantic",
    preview: true, // Free preview available
    featured: true
  },
  {
    id: 2,
    title: "Clair de Lune",
    composer: "Claude Debussy",
    year: "1905",
    length: "4:52",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Claire",
    audioUrl: "https://musopen.org/music/download/71-mp3/",
    benefits: "Relieves stress, improves sleep quality, enhances mood",
    category: "Impressionist",
    preview: true, // Free preview available
    featured: true
  },
  {
    id: 3,
    title: "The Four Seasons - Spring",
    composer: "Antonio Vivaldi",
    year: "1723",
    length: "3:36",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Spring",
    audioUrl: "https://musopen.org/music/download/43-mp3/",
    benefits: "Improves cognitive function, boosts happiness, reduces pain perception",
    category: "Baroque",
    preview: false, // Premium only
    featured: true
  },
  {
    id: 4,
    title: "Canon in D",
    composer: "Johann Pachelbel",
    year: "1680",
    length: "4:40",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Canon",
    audioUrl: "https://musopen.org/music/download/41-mp3/",
    benefits: "Lowers blood pressure, alleviates depression, supports meditation",
    category: "Baroque",
    preview: false, // Premium only
    featured: true
  },
  {
    id: 5,
    title: "Nocturne Op. 9 No. 2",
    composer: "Frédéric Chopin",
    year: "1832",
    length: "4:33",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Nocturne",
    audioUrl: "https://musopen.org/music/download/77-mp3/",
    benefits: "Promotes relaxation, improves sleep, reduces stress hormones",
    category: "Romantic",
    preview: false, // Premium only
    featured: true
  },
  {
    id: 6,
    title: "Gymnopédie No. 1",
    composer: "Erik Satie",
    year: "1888",
    length: "3:15",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Gymnopédie",
    audioUrl: "https://musopen.org/music/download/120-mp3/",
    benefits: "Calms anxiety, improves focus, aids in meditation",
    category: "Post-Romantic",
    preview: false, // Premium only
    featured: true
  },
  {
    id: 7,
    title: "Air on the G String",
    composer: "Johann Sebastian Bach",
    year: "1730",
    length: "5:27",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Air",
    audioUrl: "https://musopen.org/music/download/42-mp3/",
    benefits: "Enhances concentration, reduces stress, improves memory",
    category: "Baroque",
    preview: false, // Premium only
    featured: false
  },
  {
    id: 8,
    title: "Prelude in C Major",
    composer: "Johann Sebastian Bach",
    year: "1722",
    length: "2:28",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Prelude",
    audioUrl: "https://musopen.org/music/download/69-mp3/",
    benefits: "Increases focus, aids in productivity, promotes mental clarity",
    category: "Baroque",
    preview: false, // Premium only
    featured: false
  },
  {
    id: 9,
    title: "Serenade for Strings in C Major",
    composer: "Pyotr Ilyich Tchaikovsky",
    year: "1880",
    length: "6:15",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Serenade",
    audioUrl: "https://musopen.org/music/download/1068-mp3/",
    benefits: "Lifts mood, increases dopamine, provides emotional regulation",
    category: "Romantic",
    preview: false, // Premium only
    featured: false
  },
  {
    id: 10,
    title: "Morning Mood (Peer Gynt Suite)",
    composer: "Edvard Grieg",
    year: "1875",
    length: "3:42",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Morning",
    audioUrl: "https://musopen.org/music/download/109-mp3/",
    benefits: "Enhances positivity, reduces morning anxiety, improves mood",
    category: "Romantic",
    preview: false, // Premium only
    featured: false
  },
  {
    id: 11,
    title: "Piano Sonata No. 16 in C Major",
    composer: "Wolfgang Amadeus Mozart",
    year: "1788",
    length: "3:50",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Mozart",
    audioUrl: "https://musopen.org/music/download/1064-mp3/",
    benefits: "Improves spatial reasoning, enhances cognitive development, reduces epileptic seizures",
    category: "Classical",
    preview: false, // Premium only
    featured: false
  },
  {
    id: 12,
    title: "Für Elise",
    composer: "Ludwig van Beethoven",
    year: "1810",
    length: "2:55",
    thumbnail: "https://placehold.co/100x100/f8f9fa/6c757d?text=Elise",
    audioUrl: "https://musopen.org/music/download/80-mp3/",
    benefits: "Stimulates brain activity, improves mood, helps with pain management",
    category: "Classical",
    preview: false, // Premium only
    featured: false
  }
];

export default function ClassicalMusicFeature() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openPlayer, playTrack } = useMusicPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [volume, setVolume] = useState(80);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Query for premium status
  const { data: isPremium = false } = useQuery<boolean>({
    queryKey: ['/api/user/premium', user?.id],
    // Default to false if no data
    enabled: !!user,
  });
  
  // Filter tracks based on premium status
  const availableTracks = classicalTracks.filter(track => track.preview || isPremium);
  const previewTracks = classicalTracks.filter(track => track.preview);
  const premiumTracks = classicalTracks.filter(track => !track.preview);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackId
    ? classicalTracks.find(track => track.id === currentTrackId)
    : null;
    
  // Automatically show upgrade prompt after 3 seconds if not premium
  useEffect(() => {
    if (!isPremium) {
      const timer = setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPremium]);

  const handlePlayPause = (trackId: number) => {
    const track = classicalTracks.find(t => t.id === trackId);
    
    if (!track) return;
    
    if (!track.preview && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "This track is only available to premium members. Upgrade to unlock all classical music.",
        variant: "default",
      });
      return;
    }

    if (currentTrackId === trackId) {
      // Toggle play/pause for current track
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Start playing new track
      setCurrentTrackId(trackId);
      setIsPlaying(true);
      
      // In a real app, this would play the actual track
      // This mock implementation just simulates it
      if (audioRef.current) {
        // Reset current audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Simulate playing a new track
      setTimeout(() => {
        audioRef.current?.play();
      }, 0);
    }
  };

  const handleNext = () => {
    if (!currentTrackId) return;
    
    const currentIndex = classicalTracks.findIndex(t => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % classicalTracks.length;
    const nextTrack = classicalTracks[nextIndex];
    
    if (!nextTrack.preview && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "This track is only available to premium members. Upgrade to unlock all classical music.",
        variant: "default",
      });
      return;
    }
    
    setCurrentTrackId(nextTrack.id);
  };

  const handlePrevious = () => {
    if (!currentTrackId) return;
    
    const currentIndex = classicalTracks.findIndex(t => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + classicalTracks.length) % classicalTracks.length;
    const prevTrack = classicalTracks[prevIndex];
    
    if (!prevTrack.preview && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "This track is only available to premium members. Upgrade to unlock all classical music.",
        variant: "default",
      });
      return;
    }
    
    setCurrentTrackId(prevTrack.id);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Classical Music Library</h2>
        <p className="text-muted-foreground">
          Enjoy a curated collection of classical instrumental music to enhance your mood and focus.
        </p>
      </div>

      {!isPremium && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-amber-500">✨</span> Premium Feature
            </CardTitle>
            <CardDescription>
              Upgrade to premium to access our full library of classical music tracks.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
              Upgrade Now
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Music Player Controls - only show if a track is selected */}
      {currentTrack && (
        <Card className="bg-slate-900 text-white border-none overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-purple-600 w-1/3"></div>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{currentTrack.title}</h3>
                <p className="text-sm text-gray-300">{currentTrack.composer}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white" onClick={handlePrevious}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white h-10 w-10 rounded-full bg-white/10"
                  onClick={() => handlePlayPause(currentTrack.id)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-white" onClick={handleNext}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-300" />
              <div className="w-40">
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Track sections */}
      {!isPremium && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Free Previews</h3>
            <span className="text-sm text-muted-foreground">{previewTracks.length} tracks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {previewTracks.map((track) => {
              // Convert our track data to the format expected by the player
              const playerTrack: Track = {
                id: track.id,
                title: track.title,
                composer: track.composer, 
                year: track.year,
                length: track.length,
                thumbnail: track.thumbnail,
                audioUrl: track.audioUrl,
                benefits: track.benefits,
                category: track.category,
                preview: track.preview,
                featured: track.featured
              };
              
              return (
                <Card 
                  key={track.id} 
                  className={`cursor-pointer transition hover:shadow-md hover:border-primary ${
                    currentTrackId === track.id ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    // Use the mini player instead of the inline player
                    playTrack(playerTrack);
                    openPlayer();
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <div className="relative">
                        <img 
                          src={track.thumbnail} 
                          alt={track.title}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{track.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <span>{track.composer}</span>
                          <span>•</span>
                          <span>{track.length}</span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">Free</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span>Premium Tracks</span>
              <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">Locked</span>
            </h3>
            <span className="text-sm text-muted-foreground">{premiumTracks.length} tracks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {premiumTracks.map((track) => (
              <Card 
                key={track.id} 
                className="cursor-pointer transition opacity-60 relative"
                onClick={() => {
                  toast({
                    title: "Premium Feature",
                    description: "This track is only available to premium members. Upgrade to unlock all classical music.",
                    variant: "default",
                  });
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-white"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{track.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <span>{track.composer}</span>
                        <span>•</span>
                        <span>{track.length}</span>
                        <span>•</span>
                        <span className="text-amber-500 font-medium">Premium</span>
                      </div>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-500 hover:text-gray-700 absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({
                                title: "Music Benefits",
                                description: track.benefits,
                                variant: "default",
                              });
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">View mental health benefits</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Call to action for premium */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 mt-6">
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="font-semibold">Unlock all {premiumTracks.length} premium tracks</h3>
                <p className="text-sm text-muted-foreground">Experience the full benefits of classical music therapy</p>
              </div>
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* For premium users, show all tracks in a single list */}
      {isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classicalTracks.map((track) => {
            // Convert our track data to the format expected by the player
            const playerTrack: Track = {
              id: track.id,
              title: track.title,
              composer: track.composer, 
              year: track.year,
              length: track.length,
              thumbnail: track.thumbnail,
              audioUrl: track.audioUrl,
              benefits: track.benefits,
              category: track.category,
              preview: track.preview,
              featured: track.featured
            };
            
            return (
              <Card 
                key={track.id} 
                className={`cursor-pointer transition hover:shadow-md hover:border-primary ${
                  currentTrackId === track.id ? 'border-primary' : ''
                }`}
                onClick={() => {
                  // Use the mini player
                  playTrack(playerTrack);
                  openPlayer();
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{track.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <span>{track.composer}</span>
                        <span>•</span>
                        <span>{track.length}</span>
                        <span>•</span>
                        <span className="text-gray-400">{track.year}</span>
                      </div>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-500 hover:text-gray-700 absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({
                                title: "Music Benefits",
                                description: track.benefits,
                                variant: "default",
                              });
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">View mental health benefits</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Button to listen in the background while using other app features */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <Card className="bg-gradient-to-r from-blue-50 to-primary-50 border-primary-200">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Continue listening in the background</h3>
                    <p className="text-sm text-muted-foreground">
                      The mini player allows you to listen while using other app features
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={openPlayer}
                >
                  Open Mini Player
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Hidden audio element for playing sound */}
      <audio 
        ref={audioRef} 
        src="https://example.com/placeholder-audio.mp3" // This would be a real audio URL in production
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}