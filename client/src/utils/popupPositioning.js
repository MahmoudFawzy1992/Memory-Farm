/**
 * Calculates optimal position for tutorial popup based on target element and screen size
 * @param {string} targetSelector - CSS selector for target element
 * @param {string} placement - Preferred placement ('top', 'bottom', 'left', 'right')
 * @returns {Object} Position style object
 */
export const calculatePopupPosition = (targetSelector, placement) => {
  const element = document.querySelector(targetSelector);
  
  if (!element) {
    // If element not found, center on screen
    return { 
      top: '50%', 
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const rect = element.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Responsive popup dimensions
  const popup = { 
    width: isMobile ? Math.min(300, viewportWidth - 30) : 320,
    height: 180
  };
  
  if (isMobile) {
    return calculateMobilePosition(rect, popup, viewportHeight, viewportWidth);
  } else {
    return calculateDesktopPosition(rect, popup, placement, viewportHeight, viewportWidth);
  }
};

/**
 * Calculates position for mobile devices
 */
const calculateMobilePosition = (rect, popup, viewportHeight, viewportWidth) => {
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  const margin = 15;
  
  if (spaceBelow >= popup.height + margin) {
    // Position below element
    return {
      top: Math.min(rect.bottom + margin, viewportHeight - popup.height - margin),
      left: Math.max(margin, Math.min((viewportWidth - popup.width) / 2, viewportWidth - popup.width - margin))
    };
  } else if (spaceAbove >= popup.height + margin) {
    // Position above element
    return {
      top: Math.max(margin, rect.top - popup.height - margin),
      left: Math.max(margin, Math.min((viewportWidth - popup.width) / 2, viewportWidth - popup.width - margin))
    };
  } else {
    // Center in safe area if neither above nor below fits
    return {
      top: Math.max(margin, (viewportHeight - popup.height) / 2),
      left: Math.max(margin, (viewportWidth - popup.width) / 2)
    };
  }
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