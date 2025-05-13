import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MoodSelectionModal from "./mood-selection-modal";
import { 
  getEmotionColor, 
  getEmotionIcon, 
  getEmotionLabel, 
  getEmotionDescription, 
  type EmotionType, 
  validateEmotion 
} from "@/lib/emotions";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { syncMoodData, type MoodData } from "@/lib/emotion-bridge";

interface MoodCardProps {
  currentEmotion: EmotionType;
  userId?: number;
  onEmotionUpdate?: (emotion: EmotionType) => void;
}

// Simplified mood card component with optimistic updates

export function MoodCard({ currentEmotion = "neutral", userId, onEmotionUpdate }: MoodCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emotion, setEmotion] = useState<EmotionType>(validateEmotion(currentEmotion));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    if (currentEmotion) {
      setEmotion(validateEmotion(currentEmotion));
    }
  }, [currentEmotion]);

  // Get emotion visual elements
  const emotionColor = getEmotionColor(emotion);
  const emotionIcon = getEmotionIcon(emotion);
  const emotionLabel = getEmotionLabel(emotion);
  const emotionDescription = getEmotionDescription(emotion);

  // Open mood selection modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle emotion selection from modal
  const handleEmotionSelect = async (selectedEmotion: EmotionType) => {
    console.log("Selected emotion:", selectedEmotion);
    
    // Normalize the selected emotion
    const normalizedEmotion = validateEmotion(selectedEmotion);
    console.log("Normalized emotion:", normalizedEmotion);
    
    // Update local state immediately (optimistic update)
    setEmotion(normalizedEmotion);
    
    // Update React Query cache for instant UI updates
    queryClient.setQueryData(['/api/emotion', userId], { emotion: normalizedEmotion });
    queryClient.setQueryData(['/api/emotion'], { emotion: normalizedEmotion });
    
    // Sync mood data to localStorage and broadcast event for cross-component communication
    const moodData: MoodData = {
      emotion: normalizedEmotion,
      intensity: 5, // Default intensity
      timestamp: new Date().toISOString()
    };
    syncMoodData(moodData);
    
    // Notify parent component if callback provided
    if (onEmotionUpdate) {
      onEmotionUpdate(normalizedEmotion);
    }
    
    // Update server via API call
    try {
      const response = await apiRequest("POST", "/api/emotion", { emotion: normalizedEmotion });
      const data = await response.json();
      
      // Show toast for successful update
      toast({
        title: "Mood updated",
        description: `Your mood has been updated to ${emotionLabel}`,
      });
      
      // If tokens were earned, show them
      if (data.tokensEarned) {
        toast({
          title: "Tokens earned!",
          description: `You earned ${data.tokensEarned} tokens for sharing your mood`,
          variant: "default",
        });
      }
      
      // Invalidate queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['/api/emotion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
    } catch (error) {
      console.error("Error updating emotion:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your mood",
        variant: "destructive",
      });
      
      // Rollback optimistic update if API call fails
      queryClient.invalidateQueries({ queryKey: ['/api/emotion'] });
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col items-center">
            {/* Emotion Display */}
            <div
              className="w-full py-8 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: emotionColor, color: "#fff" }}
            >
              <div className="text-4xl mb-2">{emotionIcon}</div>
              <h3 className="text-xl font-semibold mb-1">{emotionLabel}</h3>
              <p className="text-sm opacity-90">{emotionDescription}</p>
            </div>
            
            {/* Action Button */}
            <div className="p-4 w-full bg-white">
              <Button 
                onClick={handleOpenModal} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Change Mood
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Mood Selection Modal */}
      <MoodSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectEmotion={handleEmotionSelect}
        currentEmotion={emotion}
      />
    </>
  );
}