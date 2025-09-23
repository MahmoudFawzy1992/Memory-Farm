const { CARD_CONFIG, OPTIMIZATION } = require('./cardConfig');

/**
 * Draw optimized intensity section
 * Simple dots without complex gradients to reduce file size
 */
function drawIntensity(ctx, cardData, startY, contentWidth) {
  const { width } = CARD_CONFIG;
  const intensity = cardData.emotion.intensity || 5;
  const dotCount = Math.ceil(intensity / 2);
  const dotSize = OPTIMIZATION.dotSize;
  const dotSpacing = 8;
  const totalWidth = (dotCount * dotSize) + ((dotCount - 1) * dotSpacing);
  const startX = (width - totalWidth) / 2;
  
  // Draw intensity label
  ctx.font = CARD_CONFIG.fonts.small;
  ctx.fillStyle = CARD_CONFIG.colors.text.secondary;
  ctx.textAlign = 'center';
  ctx.fillText('Intensity', width / 2, startY);
  
  const dotsY = startY + 30;
  
  // Draw simple intensity dots (no gradients for smaller file size)
  ctx.fillStyle = cardData.color || '#8B5CF6';
  
  for (let i = 0; i < dotCount; i++) {
    const x = startX + (i * (dotSize + dotSpacing));
    
    ctx.beginPath();
    ctx.arc(x + dotSize / 2, dotsY + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return dotsY + dotSize + 15;
}

module.exports = {
  drawIntensity
};