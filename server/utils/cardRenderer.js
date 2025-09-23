const { createCanvas, loadImage } = require('canvas');
const { drawBackground } = require('./cardRendering/backgroundRenderer');
const { drawHeader } = require('./cardRendering/headerRenderer');
const { drawEmotion } = require('./cardRendering/emotionRenderer');
const { drawImage } = require('./cardRendering/imageRenderer');
const { drawIntensity } = require('./cardRendering/intensityRenderer');
const { drawFooter } = require('./cardRendering/footerRenderer');
const { CARD_CONFIG } = require('./cardRendering/cardConfig');

/**
 * Main card renderer - coordinates all rendering modules
 * Optimized for smaller file sizes and better performance
 */
async function renderMemoryCard(cardData) {
  try {
    const { width, height, padding } = CARD_CONFIG;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Optimize canvas settings for smaller file size
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium'; // Changed from 'high' to reduce size
    ctx.patternQuality = 'fast';
    ctx.quality = 'fast';

    // Calculate content areas
    const contentWidth = width - (padding * 2);
    let currentY = padding + 40; // Reduced padding

    // Render each section using modular components
    drawBackground(ctx, cardData);
    
    currentY = drawHeader(ctx, cardData, currentY, contentWidth);
    currentY += 30; // Reduced spacing

    if (cardData.emotion.text || cardData.emotion.emoji) {
      currentY = drawEmotion(ctx, cardData, currentY, contentWidth);
      currentY += 25; // Reduced spacing
    }

    if (cardData.image && currentY < height - 200) {
      currentY = await drawImage(ctx, cardData.image, currentY, contentWidth);
      currentY += 25; // Reduced spacing
    }

    if (cardData.emotion.intensity) {
      currentY = drawIntensity(ctx, cardData, currentY, contentWidth);
    }

    drawFooter(ctx, width, height, padding, cardData);

    // Generate optimized PNG with compression
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 6, // PNG compression (0-9, higher = smaller file)
      filters: canvas.PNG_FILTER_NONE,
      palette: true, // Use palette mode for smaller files
      backgroundIndex: 0
    });
    return buffer;

  } catch (error) {
    console.error('Card rendering error:', error);
    throw new Error(`Card rendering failed: ${error.message}`);
  }
}

module.exports = {
  renderMemoryCard,
  CARD_CONFIG
};