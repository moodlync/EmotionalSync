import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmotionType, GameCategory } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import MemoryMatchGame from './memory-match-game';
import BreathingFocusGame from './breathing-focus-game';
import PositiveAffirmationGame from './positive-affirmation-game';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Type definition for MoodGame matching the page component
interface MoodGame {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: GameCategory;
  difficulty: string; 
  tokenReward: number;
  instructions: string;
  createdAt: Date;
  helpsMood: string[];
  isActive: boolean;
  playCount: number;
  averageRating: number;
  bgMusicUrl: string | null;
  isPremiumOnly: boolean;
}

interface GameModalProps {
  game: MoodGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleGameComplete = async (score: number, moodAfter?: EmotionType) => {
    if (!game) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would save the game results to the server
      // await apiRequest('POST', '/api/games/complete', {
      //   gameId: game.id,
      //   score,
      //   moodAfter,
      // });
      
      // For now, just show a toast
      toast({
        title: "Game Completed!",
        description: `You earned ${game.tokenReward} tokens.`,
        variant: "default",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error saving game result:", error);
      toast({
        title: "Error",
        description: "Failed to save your game results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGame = () => {
    if (!game) return null;
    
    switch (game.category) {
      case 'memory':
        return <MemoryMatchGame onComplete={handleGameComplete} onCancel={onClose} />;
      case 'meditation':
        return <BreathingFocusGame onComplete={handleGameComplete} onCancel={onClose} />;
      case 'positive_affirmation':
        return <PositiveAffirmationGame onComplete={handleGameComplete} onCancel={onClose} />;
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-lg mb-4">Game type "{game.category}" not implemented yet.</p>
            <p className="text-muted-foreground">This game is under development.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{game?.title}</DialogTitle>
          <DialogDescription>{game?.description}</DialogDescription>
        </DialogHeader>
        {renderGame()}
      </DialogContent>
    </Dialog>
  );
}