import React, { createContext, useContext, useState, ReactNode } from "react";
import { Track } from "@/components/music/mini-player";
import MiniPlayer from "@/components/music/mini-player";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface MusicPlayerContextType {
  isOpen: boolean;
  openPlayer: () => void;
  closePlayer: () => void;
  playTrack: (track: Track) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const CLASSICAL_TRACKS: Track[] = [
  {
    id: 1,
    title: "Moonlight Sonata",
    composer: "Ludwig van Beethoven",
    year: "1801",
    length: "5:26",
    thumbnail: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Relaxing%20Piano%20Music.mp3",
    benefits: "Reduces anxiety, improves sleep quality, and enhances focus",
    category: "Relaxation",
    preview: true,
    featured: true
  },
  {
    id: 2,
    title: "Canon in D",
    composer: "Johann Pachelbel",
    year: "1680",
    length: "4:40",
    thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Canon%20in%20D%20Major.mp3",
    benefits: "Decreases heart rate, relieves depression symptoms, and promotes tranquility",
    category: "Stress Relief",
    preview: true,
    featured: true
  },
  {
    id: 3,
    title: "Clair de Lune",
    composer: "Claude Debussy",
    year: "1905",
    length: "5:10",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Clair%20de%20Lune.mp3",
    benefits: "Enhances emotional processing, improves sleep, and reduces anxiety",
    category: "Relaxation",
    preview: false,
    featured: true
  },
  {
    id: 4,
    title: "Air on the G String",
    composer: "Johann Sebastian Bach",
    year: "1717",
    length: "5:00",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Air%20on%20the%20G%20String.mp3",
    benefits: "Lowers blood pressure, improves concentration, and enhances memory",
    category: "Focus",
    preview: false,
    featured: false
  },
  {
    id: 5,
    title: "Gymnopédie No. 1",
    composer: "Erik Satie",
    year: "1888",
    length: "3:05",
    thumbnail: "https://images.unsplash.com/photo-1511116577453-4e899be28f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gymnopedie%20No.%201.mp3",
    benefits: "Reduces stress hormones, promotes mindfulness, and enhances creativity",
    category: "Meditation",
    preview: false,
    featured: false
  },
  {
    id: 6,
    title: "Für Elise",
    composer: "Ludwig van Beethoven",
    year: "1810",
    length: "2:55",
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fur%20Elise.mp3",
    benefits: "Improves mood, reduces pain perception, and enhances cognitive performance",
    category: "Focus",
    preview: false,
    featured: true
  },
  {
    id: 7,
    title: "Prelude in C Major",
    composer: "Johann Sebastian Bach",
    year: "1722",
    length: "2:28",
    thumbnail: "https://images.unsplash.com/photo-1535992165812-68d1861aa71e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Prelude%20in%20C%20Major.mp3",
    benefits: "Enhances mathematical reasoning, reduces depression symptoms, and improves spatial-temporal skills",
    category: "Productivity",
    preview: false,
    featured: false
  },
  {
    id: 8,
    title: "Nocturne Op. 9 No. 2",
    composer: "Frédéric Chopin",
    year: "1830",
    length: "4:25",
    thumbnail: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1650&q=80",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Nocturne%20No.%202%20in%20E%20flat.mp3",
    benefits: "Promotes emotional balance, enhances quality of sleep, and reduces cortisol levels",
    category: "Sleep",
    preview: false,
    featured: true
  }
];

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const { user } = useAuth();
  
  // Determine if user has premium access
  const { data: isPremium = false } = useQuery<boolean>({
    queryKey: ['/api/user/premium', user?.id],
    // Default to false if no data
    enabled: !!user,
  });

  const openPlayer = () => {
    setIsOpen(true);
  };

  const closePlayer = () => {
    setIsOpen(false);
  };

  const playTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsOpen(true);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        isOpen,
        openPlayer,
        closePlayer,
        playTrack,
      }}
    >
      {children}
      {isOpen && (
        <MiniPlayer
          tracks={CLASSICAL_TRACKS}
          isPremium={isPremium}
          onClose={closePlayer}
        />
      )}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}