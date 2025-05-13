import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getEmotionNames, getEmotionIcon, getEmotionLabel, getEmotionColor, validateEmotion, type EmotionType } from "@/lib/emotions";

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmotion: (emotion: EmotionType) => void;
  currentEmotion?: EmotionType;
}

export default function MoodSelectionModal({
  isOpen,
  onClose,
  onSelectEmotion,
  currentEmotion = "neutral",
}: MoodSelectionModalProps) {
  // Get list of all emotions
  const emotionList = getEmotionNames();
  
  // Track the currently selected emotion 
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>(
    validateEmotion(currentEmotion)
  );

  // Handle emotion selection from the grid
  const handleEmotionSelect = (emotion: EmotionType) => {
    console.log(`Mood modal: selected emotion ${emotion}`);
    
    // Update local state
    setSelectedEmotion(emotion);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    console.log(`Mood modal: confirming emotion ${selectedEmotion}`);
    
    // Notify parent component of selection
    onSelectEmotion(selectedEmotion);
    
    // Close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
        </DialogHeader>
        
        {/* Emotion Selection Grid */}
        <div className="grid grid-cols-3 gap-4 my-4">
          {emotionList.map((emotion) => (
            <Button
              key={emotion}
              variant="outline"
              className={`flex flex-col h-24 p-2 items-center justify-center transition-all ${
                selectedEmotion === emotion ? "ring-2 ring-primary" : ""
              }`}
              style={{ 
                backgroundColor: selectedEmotion === emotion 
                  ? getEmotionColor(emotion) 
                  : 'transparent',
                color: selectedEmotion === emotion ? '#fff' : 'inherit'
              }}
              onClick={() => handleEmotionSelect(emotion)}
            >
              <span className="text-2xl mb-1">{getEmotionIcon(emotion)}</span>
              <span className="text-sm font-medium">{getEmotionLabel(emotion)}</span>
            </Button>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}