import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Shield, 
  Brain, 
  Star, 
  HandHeart, 
  PenLine,
  Fingerprint,
  Crown
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProductDescriptionProps {
  title: string;
  subtitle?: string;
  description: string;
  features: Feature[];
  imageSrc?: string;
  imageAlt?: string;
  badgeText?: string;
  premiumFeature?: boolean;
  ctaText?: string;
  ctaAction?: () => void;
  onClose?: () => void;
}

export const DetailedProductDescription: React.FC<ProductDescriptionProps> = ({
  title,
  subtitle,
  description,
  features,
  imageSrc,
  imageAlt,
  badgeText = "Feature Spotlight",
  premiumFeature = false,
  ctaText = "Try This Feature",
  ctaAction,
  onClose,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side - Image */}
        {imageSrc && (
          <div className="md:w-2/5">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={imageSrc} 
                alt={imageAlt || title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Right Side - Content */}
        <div className={imageSrc ? "md:w-3/5" : "w-full"}>
          <div className="mb-4">
            {badgeText && (
              <Badge 
                className={`mb-2 px-3 py-1 ${premiumFeature 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white' 
                  : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                {premiumFeature ? <Star className="h-3.5 w-3.5 mr-1" /> : <Info className="h-3.5 w-3.5 mr-1" />}
                {badgeText}
              </Badge>
            )}
            
            <h2 className="text-2xl font-bold mb-1">{title}</h2>
            
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{subtitle}</p>
            )}
            
            <div className="border-b border-gray-200 dark:border-gray-700 w-16 mb-4"></div>
            
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
          </div>
          
          {/* Feature List */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold mb-2">Key Benefits</h3>
            
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3">
                <div className="shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {feature.icon || <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Premium Badge - If applicable */}
          {premiumFeature && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 flex items-start gap-3">
              <div className="shrink-0">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-400">Premium Feature</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This feature is available exclusively to premium subscribers.
                </p>
              </div>
            </div>
          )}
          
          {/* Call to Action */}
          <div className="mt-6 flex gap-3">
            {ctaAction && (
              <Button 
                onClick={ctaAction}
                className={`${premiumFeature ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white' : ''}`}
              >
                {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dialog version
export const DetailedProductDialog: React.FC<ProductDescriptionProps & { triggerText: string }> = ({
  triggerText,
  ...props
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 dark:text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:hover:text-white rounded-md px-2 py-1 text-xs h-auto font-medium transition-colors"
        >
          {triggerText || "Learn More"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.subtitle && <DialogDescription>{props.subtitle}</DialogDescription>}
        </DialogHeader>
        <DetailedProductDescription {...props} onClose={undefined} />
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Common icons export for convenience
export const FeatureIcons = {
  Heart: <Heart className="h-3.5 w-3.5" />,
  Shield: <Shield className="h-3.5 w-3.5" />,
  Brain: <Brain className="h-3.5 w-3.5" />,
  Star: <Star className="h-3.5 w-3.5" />,
  HandHeart: <HandHeart className="h-3.5 w-3.5" />,
  PenLine: <PenLine className="h-3.5 w-3.5" />,
  Fingerprint: <Fingerprint className="h-3.5 w-3.5" />
};

// Static Dialog Wrapper - Used for static product description objects
export interface StaticProductDescriptionProps {
  triggerText: string;
  title: string;
  subtitle?: string;
  description: string;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  imageSrc?: string;
  imageAlt?: string;
  badgeText?: string;
  premiumFeature?: boolean;
  ctaText?: string;
}

export const StaticProductDialog: React.FC<{
  description: StaticProductDescriptionProps;
  onCtaClick?: () => void;
}> = ({ description, onCtaClick }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 dark:text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:hover:text-white rounded-md px-2 py-1 text-xs h-auto font-medium transition-colors"
        >
          {description.triggerText || "Learn More"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{description.title}</DialogTitle>
          {description.subtitle && <DialogDescription>{description.subtitle}</DialogDescription>}
        </DialogHeader>
        <DetailedProductDescription 
          {...description} 
          ctaAction={onCtaClick}
          onClose={undefined} 
        />
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};