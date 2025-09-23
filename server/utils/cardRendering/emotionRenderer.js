const { CARD_CONFIG, OPTIMIZATION, hexToRgb } = require('./cardConfig');

/**
 * Draw optimized emotion section
 * Simplified design to reduce file size
 */
function drawEmotion(ctx, cardData, startY, contentWidth) {
  const { width } = CARD_CONFIG;
  let currentY = startY + 20;

  // Draw emoji with simple background
  if (cardData.emotion.emoji) {
    const emojiSize = OPTIMIZATION.emojiSize;
    const centerX = width / 2;
    
    // Simple circular background (no gradient for smaller file)
    ctx.save();
    ctx.fillStyle = cardData.color || '#8B5CF6';
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(centerX, currentY + emojiSize / 2, emojiSize / 2 + 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw emoji
    ctx.font = `${emojiSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(cardData.emotion.emoji, centerX, currentY + emojiSize - 15);
    currentY += emojiSize + 25;
  }
  
  // Draw emotion text with simple styling
  if (cardData.emotion.text) {
    ctx.font = CARD_CONFIG.fonts.emotion;
    ctx.fillStyle = cardData.color || CARD_CONFIG.colors.text.accent;
    ctx.textAlign = 'center';
    ctx.fillText(cardData.emotion.text, width / 2, currentY);
    currentY += 45;
  }

  return currentY;
}

module.exports = {
  drawEmotion
};