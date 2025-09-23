const { CARD_CONFIG } = require('./cardConfig');

/**
 * Draw optimized footer section
 * Simple design to reduce file size
 */
function drawFooter(ctx, width, height, padding, cardData) {
  const footerY = height - padding - 50;
  
  // Simple footer background (no gradient for smaller file size)
  ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
  ctx.fillRect(0, footerY - 25, width, 75);
  
  // Simple decorative line
  ctx.strokeStyle = cardData.color || '#8B5CF6';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(padding, footerY - 12);
  ctx.lineTo(width - padding, footerY - 12);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Brand text
  ctx.font = CARD_CONFIG.fonts.brand;
  ctx.fillStyle = CARD_CONFIG.colors.text.secondary;
  ctx.textAlign = 'center';
  ctx.fillText('Created with Memory Farm', width / 2, footerY + 5);
  
  // Simple heart emoji (reduced size)
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('♥', width / 2 + 120, footerY + 5);
  
  // TODO: Add link placeholder - https://memoryfarm.app when live
}

module.exports = {
  drawFooter
};