import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logoImage from '@/assets/logo-transparent-png.png';

interface AnimatedPoweredLogoProps {
  width?: number;
}

export default function AnimatedPoweredLogo({ width = 80 }: AnimatedPoweredLogoProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the logo with a slight delay for a better effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const spinVariants = {
    spin: {
      rotate: [0, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Calculate height proportionally based on width
  const height = width * 0.5;

  return (
    <div className="flex items-center">
      <motion.div
        className="flex items-center"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div 
          className="relative flex items-center mr-2"
          animate="pulse"
          variants={pulseVariants}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate="spin"
            variants={spinVariants}
          >
            <div className="absolute w-full h-full rounded-full bg-primary/10 blur-md"></div>
          </motion.div>
          <div 
            className="flex items-center justify-center rounded-full bg-primary/10 shadow-md border border-gray-100"
            style={{ width: `${width}px`, height: `${width}px` }} 
          >
            <img 
              src={logoImage} 
              alt="MoodLync Logo" 
              className="w-full h-full object-contain rounded-full" 
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="text-gray-700 flex flex-col"
          variants={itemVariants}
        >
          <motion.span 
            className="text-xs uppercase tracking-wider opacity-70"
            variants={itemVariants}
          >
            powered by
          </motion.span>
          <motion.span 
            className="font-bold text-sm text-primary"
            variants={itemVariants}
          >
            AkxSys
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}