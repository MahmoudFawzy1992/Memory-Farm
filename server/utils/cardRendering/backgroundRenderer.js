const { CARD_CONFIG, hexToRgb } = require('./cardConfig');

/**
 * Draw optimized background for memory cards
 * Simplified design to reduce file size
 */
function drawBackground(ctx, cardData) {
  const { width, height } = CARD_CONFIG;
  
  // Simple gradient background (much more efficient than complex patterns)
  const memoryColor = cardData.color || '#8B5CF6';
  const lightColor = hexToRgb(memoryColor);
  
  // Create simple two-stop gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, `rgba(${lightColor.r}, ${lightColor.g}, ${lightColor.b}, 0.03)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Single decorative element (simplified from multiple circles)
  drawSimpleDecoration(ctx, memoryColor, width, height);
}

/**
 * Draw minimal decorative element
 */
function drawSimpleDecoration(ctx, memoryColor, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.02; // Very subtle
  ctx.fillStyle = memoryColor;
  
  // Single corner decoration
  ctx.beginPath();
  ctx.arc(width - 80, 80, 120, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

module.exports = {
  drawBackground
};