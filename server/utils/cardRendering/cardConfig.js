// Central configuration for card rendering
// Optimized for smaller file sizes and better performance

const CARD_CONFIG = {
  width: 1080,
  height: 1080,
  padding: 60, // Reduced padding
  borderRadius: 20, // Reduced border radius
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      light: '#9ca3af'
    },
    overlay: 'rgba(0, 0, 0, 0.05)', // Reduced opacity for smaller file size
    cardShadow: 'rgba(0, 0, 0, 0.05)' // Reduced opacity
  },
  fonts: {
    title: 'bold 46px Arial, sans-serif', // Slightly smaller
    emotion: 'bold 38px Arial, sans-serif', // Slightly smaller
    brand: '28px Arial, sans-serif', // Smaller
    small: '24px Arial, sans-serif'
  },
  // Simplified gradients to reduce complexity
  gradients: {
    primary: (color) => {
      const rgb = hexToRgb(color);
      return {
        light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
        medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
      };
    }
  }
};

// Optimization utilities
const OPTIMIZATION = {
  maxImageSize: 250, // Reduced max image size
  emojiSize: 80, // Reduced emoji size
  dotSize: 12, // Reduced dot size
  shadowBlur: 8, // Reduced shadow blur
  compressionLevel: 6
};

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 139, g: 92, b: 246 };
}

function wrapText(ctx, text, maxWidth, maxLines = 2) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length && lines.length < maxLines; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (lines.length < maxLines) {
    lines.push(currentLine);
  }
  
  return lines.slice(0, maxLines);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

module.exports = {
  CARD_CONFIG,
  OPTIMIZATION,
  hexToRgb,
  wrapText,
  drawRoundedRect
};