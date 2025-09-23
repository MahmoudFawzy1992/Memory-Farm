const { CARD_CONFIG, wrapText } = require('./cardConfig');

/**
 * Draw optimized header section with title
 * Simplified design to reduce file size
 */
function drawHeader(ctx, cardData, startY, contentWidth) {
  const { width } = CARD_CONFIG;
  let currentY = startY;

  // Draw title with optimized styling
  ctx.font = CARD_CONFIG.fonts.title;
  ctx.fillStyle = CARD_CONFIG.colors.text.primary;
  ctx.textAlign = 'center';

  // Wrap text to maximum 2 lines to save space
  const titleLines = wrapText(ctx, cardData.title, contentWidth - 60, 2);
  
  // Simple text rendering (no shadow to reduce complexity)
  titleLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, currentY + (index * 55));
  });
  
  currentY += titleLines.length * 55 + 20;

  // Simple decorative line (no gradient to reduce file size)
  drawSimpleLine(ctx, width, currentY, cardData.color);

  return currentY + 30;
}

/**
 * Draw simple decorative line under title
 */
function drawSimpleLine(ctx, width, y, color) {
  const lineWidth = 120;
  
  ctx.strokeStyle = color || '#8B5CF6';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo((width - lineWidth) / 2, y);
  ctx.lineTo((width + lineWidth) / 2, y);
  ctx.stroke();
}

module.exports = {
  drawHeader
};