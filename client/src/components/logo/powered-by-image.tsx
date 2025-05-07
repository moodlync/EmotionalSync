import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PoweredByImageProps {
  imageWidth?: number;
  className?: string;
  showTextOnly?: boolean;
}

export default function PoweredByImage({ 
  imageWidth = 120, 
  className = '',
  showTextOnly = false
}: PoweredByImageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
        duration: 0.5
      }
    }
  };

  if (showTextOnly) {
    return (
      <motion.span 
        className={`text-xs uppercase tracking-wider text-gray-600 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 0.3 }}
      >
        powered by: ROLLOVER AUSTRALIA INC.
      </motion.span>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        className="flex flex-col items-center"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="text-center">
          <p className="text-sm font-medium mb-1">Powered by: ROLLOVER AUSTRALIA INC.</p>
          <img 
            src={`/assets/image_1746188033900.jpeg`} 
            alt="Powered by ROLLOVER AUSTRALIA INC." 
            className="bg-transparent mx-auto"
            style={{ 
              width: `${imageWidth}px`,
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))',
              objectFit: 'contain'
            }} 
          />
        </div>
      </motion.div>
    </div>
  );
}