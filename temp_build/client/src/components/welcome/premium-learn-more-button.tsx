import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useCallback, useRef, useEffect } from 'react';
import { usePremiumFeatureModal } from '@/providers/premium-feature-modal-provider';

interface PremiumLearnMoreButtonProps {
  onClick?: () => void;
  title?: string;
  description?: string;
  imageSrc?: string;
}

export function PremiumLearnMoreButton({ 
  onClick,
  title,
  description,
  imageSrc
}: PremiumLearnMoreButtonProps) {
  const { showModal } = usePremiumFeatureModal();
  const buttonRef = useRef<HTMLDivElement>(null);

  // Find the closest title and image if not explicitly provided
  useEffect(() => {
    if (!buttonRef.current || (title && description && imageSrc)) return;
    
    const container = buttonRef.current.closest('.bg-white, .dark\\:bg-gray-800');
    if (!container) return;
    
    // Extract title, description, and image if not provided
    if (!title) {
      const titleElement = container.querySelector('h3');
      if (titleElement) {
        title = titleElement.textContent || undefined;
      }
    }
    
    if (!description) {
      const descriptionElement = container.querySelector('p');
      if (descriptionElement) {
        description = descriptionElement.textContent || undefined;
      }
    }
    
    if (!imageSrc) {
      const imageElement = container.querySelector('img') as HTMLImageElement;
      if (imageElement) {
        imageSrc = imageElement.src;
      }
    }
  }, [title, description, imageSrc]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (title && description && imageSrc) {
      showModal(title, description, imageSrc);
    } else {
      // Default behavior if not enough info to show modal
      const premiumSection = document.getElementById('premium-features');
      premiumSection?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [onClick, title, description, imageSrc, showModal]);

  return (
    <div className="flex justify-center mt-4 w-full" ref={buttonRef}>
      <Button 
        variant="outline" 
        className="text-white dark:text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 dark:from-primary dark:to-secondary dark:hover:from-primary/90 dark:hover:to-secondary/90 font-medium px-6 py-2 h-10 min-w-[160px] rounded-full flex items-center justify-center gap-2 shadow-lg border-0 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
        onClick={handleClick}
      >
        <span className="absolute inset-0 bg-white dark:bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
        <span className="font-semibold">Learn More</span> 
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
      </Button>
    </div>
  );
}