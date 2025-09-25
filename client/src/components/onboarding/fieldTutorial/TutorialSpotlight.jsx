import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Spotlight effect component that highlights tutorial target elements
 */
export default function TutorialSpotlight({ target }) {
  const [elementRect, setElementRect] = useState(null);

  useEffect(() => {
    if (target) {
      const element = document.querySelector(target);
      if (element) {
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Wait for scroll to complete, then get position
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setElementRect(rect);
        }, 500);
      } else {
        console.warn(`Tutorial target not found: ${target}`);
      }
    }
  }, [target]);

  if (!elementRect) return null;

  const spotlightSize = Math.min(Math.max(elementRect.width + 40, elementRect.height + 40), 200);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${elementRect.left + elementRect.width/2}px ${elementRect.top + elementRect.height/2}px, transparent ${spotlightSize/2}px, rgba(0,0,0,0.6) ${spotlightSize/2 + 20}px)`
      }}
    />
  );
}