import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera, Mic } from "lucide-react";
import { EmotionType, emotions } from "@/lib/emotions";
import EmotionWheel from "./emotion-wheel";

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmotion: (emotion: EmotionType) => void;
}

export default function MoodSelectionModal({ 
  isOpen, 
  onClose,
  onSelectEmotion 
}: MoodSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">How are you feeling?</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            Select your current emotion
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-6">
          <EmotionWheel onSelectEmotion={onSelectEmotion} />
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Or use AI detection</h3>
          <div className="flex flex-col space-y-3">
            <Button 
              className="flex items-center justify-center space-x-2"
              onClick={() => {
                // In a real app, this would trigger the camera and AI analysis
                // For now, we'll just close the modal
                onClose();
              }}
            >
              <Camera className="w-5 h-5" />
              <span>Take a Selfie</span>
            </Button>
            <Button 
              className="flex items-center justify-center space-x-2"
              onClick={() => {
                // In a real app, this would trigger voice recording and AI analysis
                // For now, we'll just close the modal
                onClose();
              }}
            >
              <Mic className="w-5 h-5" />
              <span>Voice Analysis</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
