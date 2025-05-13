import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Info, Check } from 'lucide-react';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageSrc: string;
}

export function PremiumFeatureModal({
  isOpen,
  onClose,
  title,
  description,
  imageSrc
}: PremiumFeatureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-800 border-0 shadow-xl rounded-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Image Column */}
          <div className="overflow-hidden rounded-xl shadow-md h-[300px]">
            <img 
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Description Column */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Feature Overview</h3>
            </div>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed pl-12">
              {description}
            </DialogDescription>
            
            <div className="mt-6 pl-12">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Benefits:</h4>
              <ul className="space-y-2">
                {generateBenefitsList(title).map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6 flex justify-center">
          <Button 
            className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-2 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border-0"
            onClick={onClose}
          >
            Unlock This Premium Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function generateBenefitsList(featureTitle: string): string[] {
  // Dynamic benefits based on the feature title
  const benefitsMap: Record<string, string[]> = {
    "Emotion Matching": [
      "Real-time emotion-based connections with like-minded users",
      "Advanced emotional intelligence algorithms to find meaningful matches",
      "Privacy controls to manage your emotional visibility",
      "Customizable matching preferences based on emotional states"
    ],
    "Global Emotion Map": [
      "Real-time visualization of emotional patterns worldwide",
      "Interactive heat map based on geographical regions",
      "Insights into global emotional trends and shifts",
      "Ability to explore emotional landscapes of different cultures"
    ],
    "Mood-Based Chat Rooms": [
      "Join conversations with people sharing similar emotional states",
      "Secure and private emotional discussions in a safe environment",
      "Theme-based rooms for specific emotional experiences",
      "Real-time translation for global emotional connections"
    ],
    "Therapeutic AI Companion": [
      "24/7 emotional support from our advanced AI system",
      "Personalized guidance based on your emotional patterns",
      "Evidence-based therapeutic techniques and insights",
      "Continuous learning that adapts to your emotional journey"
    ],
    "Enterprise-Grade Security": [
      "End-to-end encryption for all your emotional data",
      "Advanced privacy controls for your emotional journey",
      "Signal Protocol for secure messaging",
      "Regular security audits and updates"
    ],
    "Token Rewards System": [
      "Earn tokens through positive community interactions",
      "Redeem for premium features and digital collectibles",
      "Access to special events and community privileges",
      "Real-world benefits through our partner network"
    ],
    "Friend Book": [
      "Build and maintain your emotional support network",
      "Advanced privacy settings for relationship management",
      "Share emotional milestones with trusted connections",
      "Group emotional support features and shared experiences"
    ],
    "Emotional Journal": [
      "Track your emotional patterns over time with visual analytics",
      "Identify triggers and patterns in your emotional responses",
      "Private, encrypted storage for your emotional reflections",
      "Export and analyze your emotional history"
    ],
    "Mood-Synced Backgrounds": [
      "Dynamic interface that responds to your emotional state",
      "Scientifically designed colors for emotional wellness",
      "Customizable themes and visual experiences",
      "Subtle environmental cues to enhance emotional awareness"
    ],
    "Token Milestone Celebrations": [
      "Visual celebrations of your emotional growth journey",
      "Personalized milestone recognitions and achievements",
      "Shareable accomplishments with your support network",
      "Exclusive rewards for significant emotional milestones"
    ],
    "Emoji Reaction System": [
      "Extended emotional expression beyond basic reactions",
      "Nuanced emotional responses for authentic communication",
      "Custom emoji creation for personal emotional expression",
      "Analytics on your most-used emotional expressions"
    ],
    "Mood Games": [
      "Interactive games designed to enhance emotional intelligence",
      "Multiplayer experiences with emotional connection mechanics",
      "Learn emotional recognition and management through play",
      "Earn tokens and rewards through emotional learning achievements"
    ],
    "Animated Social Sharing": [
      "Create beautiful animations to share your emotional journey",
      "Customizable templates for emotional milestones",
      "Cross-platform sharing with privacy controls",
      "Engagement analytics for your emotional content"
    ],
    "AI Video Editor": [
      "Create emotion-driven visual content with AI assistance",
      "Mood-enhancing filters and effects",
      "Emotion-synced music suggestions",
      "Intelligent editing based on emotional narratives"
    ],
    "Custom Themes": [
      "Exclusive premium color themes and visual experiences",
      "Personalized interface elements based on preferences",
      "Seasonal and special event themes",
      "Custom accent colors and visual styling options"
    ],
    "Advanced Analytics": [
      "Detailed insights into your emotional patterns",
      "Interactive charts and visualizations of your emotional journey",
      "Predictive analytics for emotional wellness",
      "Comparative analysis with anonymized community data"
    ],
  };

  // Default benefits if specific feature not found
  const defaultBenefits = [
    "Exclusive premium access to enhanced features",
    "Priority customer support and guidance",
    "Regular updates and new content",
    "Community recognition and special status"
  ];

  return benefitsMap[featureTitle] || defaultBenefits;
}