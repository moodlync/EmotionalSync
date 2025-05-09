import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle } from 'lucide-react';

interface CommunityGuidelinesModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function CommunityGuidelinesModal({ isOpen, onAccept, onClose }: CommunityGuidelinesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Community Guidelines for Video Content
          </DialogTitle>
          <DialogDescription>
            Please review our community guidelines before creating video content
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          <p>
            Welcome to our video creation platform! To ensure a safe and positive environment for all users,
            please adhere to the following guidelines when creating and sharing video content:
          </p>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Prohibited Content</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Harassment and Bullying:</strong> Content that harasses, intimidates, or bullies any individual or groups.
              </li>
              <li>
                <strong>Hate Speech:</strong> Content that promotes violence or hatred against individuals or groups based on attributes like race, ethnicity, religion, gender, etc.
              </li>
              <li>
                <strong>Sexual Content:</strong> Explicit sexual content, pornography, or content that sexually objectifies people.
              </li>
              <li>
                <strong>Violence:</strong> Gratuitous violence, content that promotes self-harm, or content that glorifies dangerous activities.
              </li>
              <li>
                <strong>Child Safety:</strong> Content that exploits or endangers minors. Any form of child abuse is strictly prohibited.
              </li>
              <li>
                <strong>Illegal Activities:</strong> Content that promotes illegal activities, including drug use, theft, or other crimes.
              </li>
              <li>
                <strong>Misinformation:</strong> Content that intentionally spreads false information that could cause harm.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Educational Purpose</h3>
            <p>
              All videos should be created for educational, informative, or wellness purposes.
              The platform is designed to foster learning, emotional growth, and mental well-being.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Content should aim to educate, inform, or positively inspire others.</li>
              <li>Focus on topics related to emotional intelligence, mental health, self-improvement, or educational subjects.</li>
              <li>Share personal experiences and insights that could benefit others on their wellness journey.</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Content Moderation</h3>
            <p>
              All videos are subject to review by our content moderation team and AI systems.
              Videos that violate these guidelines will be removed, and repeated violations
              may result in account restrictions or termination.
            </p>
            <p>
              We respect free expression and constructive discussion, but safety and wellbeing
              of our community comes first.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Copyright and Intellectual Property</h3>
            <p>
              Respect copyright and intellectual property rights. Do not use content created by others
              without proper permission or attribution. This includes music, images, video clips, and other media.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Global Considerations</h3>
            <p>
              MoodSync serves a global audience. Be mindful that content acceptable in some regions may violate laws
              or cultural norms in others. We apply these guidelines consistently across all regions.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Additional Resources</h3>
            <p>
              Our AI tools can help ensure your content meets these guidelines. Use the content
              filtering tools available in the editor to check your videos before publishing.
            </p>
            <p>
              If you're unsure whether your content is appropriate, please err on the side of caution
              or contact our support team for guidance.
            </p>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md border border-primary/20 space-y-2">
            <h3 className="text-lg font-medium text-primary">Legal Compliance</h3>
            <p>
              By using our video editor and sharing content on MoodSync, you affirm that your content complies with all applicable laws in your jurisdiction and the locations where your content may be viewed. This includes but is not limited to laws regarding intellectual property, privacy, defamation, and content restrictions.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full items-center">
            <div className="text-sm text-muted-foreground">
              By accepting, you agree to follow these guidelines
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Review Later
              </Button>
              <Button onClick={onAccept}>
                <Check className="h-4 w-4 mr-2" />
                Accept Guidelines
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}