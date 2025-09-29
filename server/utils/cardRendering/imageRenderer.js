const { loadImage } = require('canvas');
const sharp = require('sharp');
const { CARD_CONFIG, OPTIMIZATION, drawRoundedRect } = require('./cardConfig');

/**
 * Draw optimized image section
 * Fixed to handle Railway Sharp issues properly
 */
async function drawImage(ctx, imageData, startY, contentWidth) {
  try {
    // Try to load and optimize image
    const img = await loadOptimizedImage(imageData.url);
    
    const { width } = CARD_CONFIG;
    const maxImageHeight = OPTIMIZATION.maxImageSize;
    const maxImageWidth = contentWidth - 80;
    
    let imgWidth = img.width;
    let imgHeight = img.height;
    
    // Scale image proportionally
    if (imgHeight > maxImageHeight) {
      const ratio = maxImageHeight / imgHeight;
      imgHeight = maxImageHeight;
      imgWidth = imgWidth * ratio;
    }
    
    if (imgWidth > maxImageWidth) {
      const ratio = maxImageWidth / imgWidth;
      imgWidth = maxImageWidth;
      imgHeight = imgHeight * ratio;
    }
    
    const imgX = (width - imgWidth) / 2;
    const imgY = startY;
    
    // Simple shadow
    drawSimpleShadow(ctx, imgX, imgY, imgWidth, imgHeight);
    
    // Draw image with rounded corners
    ctx.save();
    drawRoundedRect(ctx, imgX, imgY, imgWidth, imgHeight, 12);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();
    
    // Simple border
    ctx.strokeStyle = CARD_CONFIG.colors.text.light;
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, imgX, imgY, imgWidth, imgHeight, 12);
    ctx.stroke();
    
    return startY + imgHeight + 30;
    
  } catch (error) {
    console.error('Image rendering failed:', error.message);
    return startY; // Skip image section if it fails
  }
}

/**
 * Load and optimize image with proper fallback
 */
async function loadOptimizedImage(base64Url) {
  // First try: Use Sharp to optimize
  try {
    const base64Data = base64Url.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Try to optimize with Sharp
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(400, 400, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .png({ // Use PNG instead of WebP for better compatibility
        quality: 80,
        compressionLevel: 6
      })
      .toBuffer();
    
    // Load optimized image
    return await loadImage(optimizedBuffer);
    
  } catch (sharpError) {
    console.warn('Sharp optimization failed, using original image:', sharpError.message);
    
    // Fallback: Load original base64 image directly
    try {
      return await loadImage(base64Url);
    } catch (loadError) {
      console.error('Failed to load original image:', loadError.message);
      throw new Error('Image loading failed completely');
    }
  }
}

/**
 * Draw simple shadow behind image
 */
function drawSimpleShadow(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = CARD_CONFIG.colors.cardShadow;
  ctx.fillRect(x + 3, y + 3, width, height);
  ctx.restore();
}

module.exports = {
  drawImage
};