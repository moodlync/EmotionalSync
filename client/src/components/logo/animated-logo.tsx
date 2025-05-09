import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/moodlync-logo-new.jpg';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
  hoverEffect?: boolean;
}

export default function AnimatedLogo({ 
  className, 
  size = 56, 
  hoverEffect = true 
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: -8, y: 8, z: 0 });
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Interactive 3D rotation effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current || !isHovered) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 15;
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -15;
      
      setRotation({
        x: rotateX,
        y: rotateY,
        z: 0
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);
  
  // Display the logo image
  return (
    <div 
      ref={logoRef}
      className={cn(
        "relative transition-all duration-300 overflow-visible flex items-center justify-center rounded-full",
        isHovered ? "scale-110" : "",
        className
      )} 
      style={{ 
        width: size, 
        height: size,
        filter: isHovered 
          ? 'drop-shadow(0 18px 15px rgba(0,0,0,0.3)) drop-shadow(0 5px 10px rgba(0,0,0,0.2))' 
          : 'drop-shadow(0 12px 12px rgba(0,0,0,0.2))',
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out, filter 0.3s ease-out'
      }}
      onMouseEnter={() => hoverEffect && setIsHovered(true)}
      onMouseLeave={() => {
        if (hoverEffect) {
          setIsHovered(false);
          setRotation({ x: -8, y: 8, z: 0 });
        }
      }}
    >
      <img 
        src={logoImage} 
        alt="MoodLync Logo" 
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
}