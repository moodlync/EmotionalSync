import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";
import logoImage from '@/assets/moodlync-logo.png';

interface DynamicLogoProps {
  className?: string;
  size?: number;
  isAnimating?: boolean;
  pulseEffect?: boolean;
  heartbeatEffect?: boolean;
}

export default function DynamicLogo({ 
  className, 
  size = 143, // Increased default size by 10% (from 130 to 143)
  isAnimating: propIsAnimating = false,
  pulseEffect = true, // Enable pulse effect by default
  heartbeatEffect = false // Heartbeat effect disabled as requested
}: DynamicLogoProps) {
  const [isInternalAnimating, setIsInternalAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark');
  
  // Disable all animations as requested
  const isAnimating = false; // propIsAnimating || isInternalAnimating; - disabled per user request
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [orbitPosition, setOrbitPosition] = useState(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  // Neural connection animation
  useEffect(() => {
    const animateOrbit = () => {
      setOrbitPosition(prev => (prev + 1) % 360);
      requestRef.current = requestAnimationFrame(animateOrbit);
    };
    
    requestRef.current = requestAnimationFrame(animateOrbit);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Handle mouse move for 3D perspective effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current || !isHovered) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 20;
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -20;
      
      setRotation({
        x: rotateX,
        y: rotateY,
        z: 0
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);
  
  // Pulsing glow effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnimating) {
      // Rapid pulsing during animation
      let increasing = true;
      interval = setInterval(() => {
        setGlowIntensity(prev => {
          if (prev >= 1) increasing = false;
          if (prev <= 0.3) increasing = true;
          return increasing ? prev + 0.1 : prev - 0.1;
        });
      }, 50);
    } else if (isHovered) {
      // Gentle pulsing during hover
      let increasing = true;
      interval = setInterval(() => {
        setGlowIntensity(prev => {
          if (prev >= 0.7) increasing = false;
          if (prev <= 0.3) increasing = true;
          return increasing ? prev + 0.05 : prev - 0.05;
        });
      }, 100);
    } else if (pulseEffect) {
      // Continuous gentle pulse for welcome screen
      let increasing = true;
      interval = setInterval(() => {
        setGlowIntensity(prev => {
          if (prev >= 0.5) increasing = false;
          if (prev <= 0.2) increasing = true;
          return increasing ? prev + 0.02 : prev - 0.02;
        });
      }, 150);
    } else {
      // Reset glow when not hovered or animating
      setGlowIntensity(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, isHovered, pulseEffect]);
  
  const handleTouch = () => {
    setIsInternalAnimating(true);
    // Reset animation after it completes
    setTimeout(() => {
      setIsInternalAnimating(false);
    }, 1200);
  };
  
  return (
    <div 
      ref={logoRef}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        className
      )} 
      style={{ 
        width: size, 
        height: size,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out',
        backgroundColor: 'white',
        borderRadius: '50%'
      }}
      onClick={handleTouch}
      onTouchStart={handleTouch}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0, z: 0 });
      }}
    >
      {/* Neural orbit elements and animated orbit rings removed as requested */}
      
      {/* Outer ring removed as requested */}
      
      {/* Embossed main logo image with enhanced heartbeat effect and white background */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full overflow-hidden",
          isAnimating ? "animate-pulse" : heartbeatEffect ? "animate-heartbeat" : ""
        )}
        style={{ 
          boxShadow: isDarkMode 
            ? `
                0 0 ${10 + glowIntensity * 15}px ${5 + glowIntensity * 10}px rgba(96, 82, 199, ${0.3 + glowIntensity * 0.4}),
                inset 0 0 3px 1px rgba(255, 255, 255, 0.5),
                inset 0 0 10px 2px rgba(0, 0, 0, 0.2)
              `
            : `
                0 0 ${10 + glowIntensity * 15}px ${5 + glowIntensity * 10}px rgba(255, 255, 255, ${0.2 + glowIntensity * 0.3}),
                inset 0 0 3px 1px rgba(255, 255, 255, 0.5),
                inset 0 0 10px 2px rgba(0, 0, 0, 0.2)
              `,
          border: isDarkMode ? '2px solid rgba(96, 82, 199, 0.7)' : '2px solid rgba(255, 255, 255, 1)',
          backgroundColor: '#FFFFFF', /* Solid white background - using backgroundColor for better browser support */
          zIndex: 5,
          background: 'white' /* Extra background property for better white background rendering */
        }}
      >
        {/* Logo image */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-500 flex items-center justify-center",
            isAnimating ? "scale-110" : isHovered ? "scale-105" : "scale-100"
          )}
          style={{
            padding: '4px',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 0 3px white'
          }}
        >
          <img 
            src={logoImage} 
            alt="MoodLync Logo" 
            className="w-full h-full object-contain rounded-full" 
          />
        </div>
        
        {/* Clean white heartbeat effect without red color */}
        {heartbeatEffect && (
          <>
            <div 
              className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/20 mix-blend-overlay animate-heartbeat"
            />
            <div 
              className="absolute inset-0 animate-heartbeat"
              style={{
                boxShadow: 'inset 0 0 15px 5px rgba(255, 255, 255, 0.4)',
                animationDelay: "0.1s"
              }}
            />
            <div 
              className="absolute inset-1 animate-pulse"
              style={{
                boxShadow: 'inset 0 0 10px 3px rgba(255, 255, 255, 0.3)',
                animationDuration: "3s"
              }}
            />
          </>
        )}
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute rounded-full"
        style={{
          inset: -5,
          width: size + 10,
          height: size + 10,
          background: isDarkMode 
            ? `radial-gradient(circle, 
                rgba(96, 82, 199, ${0.3 + glowIntensity * 0.4}) 0%, 
                rgba(96, 82, 199, 0) 70%
              )`
            : `radial-gradient(circle, 
                rgba(255, 255, 255, ${0.2 + glowIntensity * 0.3}) 0%, 
                rgba(255, 255, 255, 0) 70%
              )`,
          opacity: isAnimating ? 0.8 : isHovered ? 0.6 : pulseEffect ? 0.4 : 0,
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 2,
          filter: 'blur(5px)'
        }}
      />
    </div>
  );
}