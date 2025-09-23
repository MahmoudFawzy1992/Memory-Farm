const { loadImage } = require('canvas');
const sharp = require('sharp');
const { CARD_CONFIG, OPTIMIZATION, drawRoundedRect } = require('./cardConfig');

/**
 * Draw optimized image section
 * Converts images to WebP and reduces size for better performance
 */
async function drawImage(ctx, imageData, startY, contentWidth) {
  try {
    // Convert base64 image to optimized WebP format
    const optimizedImageBuffer = await optimizeImage(imageData.url);
    const img = await loadImage(optimizedImageBuffer);
    
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
    
    // Simple shadow (reduced complexity)
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
    console.warn('Failed to load optimized image:', error.message);
    return startY;
  }
}

/**
 * Optimize image for smaller file sizes
 */
async function optimizeImage(base64Url) {
  try {
    // Extract base64 data
    const base64Data = base64Url.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Convert to optimized WebP with compression
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(400, 400, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 75,  // Good quality but smaller file
        effort: 6     // Good compression
      })
      .toBuffer();
    
    return optimizedBuffer;
    
  } catch (error) {
    console.warn('Image optimization failed, using original:', error.message);
    // Fallback to original if optimization fails
    const base64Data = base64Url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
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