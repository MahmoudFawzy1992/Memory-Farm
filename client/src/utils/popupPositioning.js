/**
 * Calculates optimal position for tutorial popup based on target element and screen size
 * @param {string} targetSelector - CSS selector for target element
 * @param {string} placement - Preferred placement ('top', 'bottom', 'left', 'right')
 * @returns {Object} Position style object
 */
export const calculatePopupPosition = (targetSelector, placement) => {
  const element = document.querySelector(targetSelector);
  const isMobile = window.innerWidth < 768;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // MOBILE: Always use fixed bottom sheet positioning
  if (isMobile) {
    const popupWidth = Math.min(340, viewportWidth - 40);
    return {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      marginLeft: `-${popupWidth / 2}px`,  // ✅ This centers without transform
      width: `${popupWidth}px`,
      maxWidth: '90vw'
    };
  }

  // DESKTOP: Calculate position relative to target element
  if (!element) {
    // If element not found, center on screen
    return { 
      top: '50%', 
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const rect = element.getBoundingClientRect();
  const popup = { 
    width: 320,
    height: 180
  };

  return calculateDesktopPosition(rect, popup, placement, viewportHeight, viewportWidth);
};

/**
 * Calculates position for desktop devices
 */
const calculateDesktopPosition = (rect, popup, placement, viewportHeight, viewportWidth) => {
  const margin = 15;
  
  switch (placement) {
    case 'bottom':
      return {
        top: rect.bottom + margin,
        left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
      };
    case 'top':
      return {
        top: Math.max(margin, rect.top - popup.height - margin),
        left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
      };
    case 'right':
      return {
        top: Math.max(margin, Math.min(rect.top, viewportHeight - popup.height - margin)),
        left: Math.min(rect.right + margin, viewportWidth - popup.width - margin)
      };
    case 'left':
      return {
        top: Math.max(margin, Math.min(rect.top, viewportHeight - popup.height - margin)),
        left: Math.max(margin, rect.left - popup.width - margin)
      };
    default:
      // Default to bottom
      return {
        top: rect.bottom + margin,
        left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
      };
  }
};