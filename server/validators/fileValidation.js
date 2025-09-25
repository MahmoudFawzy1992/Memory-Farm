// FIXED: Removed file-type dependency to avoid ES module issues
// Using sharp for image validation instead

const sharp = require('sharp');

// Allowed image types with their MIME types and signatures
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': { extensions: ['jpg', 'jpeg'], maxSize: 1024 * 1024 }, // 1MB
  'image/png': { extensions: ['png'], maxSize: 1024 * 1024 }, // 1MB
  'image/webp': { extensions: ['webp'], maxSize: 1024 * 1024 }, // 1MB
  'image/gif': { extensions: ['gif'], maxSize: 1024 * 1024 }, // 1MB
};

// Image validation using sharp (more reliable than file-type)
const validateImageBuffer = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    
    // Sharp provides format detection
    const detectedFormat = metadata.format;
    const formatToMime = {
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    
    return {
      mime: formatToMime[detectedFormat] || `image/${detectedFormat}`,
      format: detectedFormat,
      width: metadata.width,
      height: metadata.height,
      size: metadata.size
    };
  } catch (error) {
    return null;
  }
};

/**
 * Validate base64 image data
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} fileName - Original file name  
 * @returns {Object} Validation result
 */
const validateBase64Image = async (base64Data, fileName = '') => {
  const errors = [];
  
  try {
    // Parse base64 data
    if (!base64Data || typeof base64Data !== 'string') {
      return { valid: false, errors: ['Invalid image data'] };
    }
    
    // Extract data URL parts
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return { valid: false, errors: ['Invalid base64 format'] };
    }
    
    const [, mimeType, base64Content] = matches;
    
    // Check if MIME type is allowed
    if (!ALLOWED_IMAGE_TYPES[mimeType]) {
      errors.push(`File type ${mimeType} is not allowed. Allowed types: JPG, PNG, WebP, GIF`);
    }
    
    // Decode base64 to buffer for size and signature validation
    let buffer;
    try {
      buffer = Buffer.from(base64Content, 'base64');
    } catch (e) {
      return { valid: false, errors: ['Invalid base64 encoding'] };
    }
    
    // Check file size
    const config = ALLOWED_IMAGE_TYPES[mimeType];
    if (config && buffer.length > config.maxSize) {
      errors.push(`File size (${Math.round(buffer.length / 1024)}KB) exceeds limit (${Math.round(config.maxSize / 1024)}KB)`);
    }
    
    // FIXED: Use sharp instead of file-type for validation
    const detectedImage = await validateImageBuffer(buffer);
    if (!detectedImage) {
      errors.push('Could not process image - invalid format or corrupted file');
    } else if (detectedImage.mime !== mimeType) {
      errors.push(`File content (${detectedImage.mime}) doesn't match declared type (${mimeType})`);
    }
    
    // Validate file extension if provided
    if (fileName && config) {
      const fileExt = fileName.toLowerCase().split('.').pop();
      if (!config.extensions.includes(fileExt)) {
        errors.push(`File extension .${fileExt} doesn't match file type`);
      }
    }
    
    // Additional security checks - simplified since sharp already validates image structure
    const content = buffer.toString('utf8', 0, Math.min(512, buffer.length));
    if (content.includes('<script') || content.includes('javascript:') || content.includes('vbscript:')) {
      errors.push('File contains potentially malicious content');
    }
    
    // Check for PHP headers
    if (content.includes('<?php') || content.includes('<?=')) {
      errors.push('File contains server-side script content');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      fileInfo: {
        mimeType,
        detectedType: detectedImage?.mime,
        size: buffer.length,
        format: detectedImage?.format,
        width: detectedImage?.width,
        height: detectedImage?.height
      }
    };
    
  } catch (error) {
    console.error('File validation error:', error);
    return { 
      valid: false, 
      errors: ['File validation failed'] 
    };
  }
};

/**
 * Validate image block content from memory creation/update
 * @param {Object} imageBlock - Image block from memory content
 * @returns {Object} Validation result
 */
const validateImageBlock = async (imageBlock) => {
  if (!imageBlock || imageBlock.type !== 'image') {
    return { valid: false, errors: ['Invalid image block'] };
  }
  
  const { props } = imageBlock;
  if (!props || !Array.isArray(props.images) || props.images.length === 0) {
    return { valid: false, errors: ['Image block must contain at least one image'] };
  }
  
  // Validate each image in the block
  const validationResults = [];
  for (const [index, image] of props.images.entries()) {
    if (!image.url) {
      validationResults.push({
        index,
        valid: false,
        errors: [`Image ${index + 1}: Missing image data`]
      });
      continue;
    }
    
    const result = await validateBase64Image(image.url, image.name);
    validationResults.push({
      index,
      ...result
    });
  }
  
  // Collect all errors
  const allErrors = validationResults
    .filter(r => !r.valid)
    .flatMap(r => r.errors);
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    results: validationResults
  };
};

/**
 * Express middleware to validate file uploads in request body
 */
const validateFileUploads = async (req, res, next) => {
  if (!req.body.content || !Array.isArray(req.body.content)) {
    return next();
  }
  
  try {
    // Find all image blocks in the content
    const imageBlocks = req.body.content.filter(block => block.type === 'image');
    
    if (imageBlocks.length === 0) {
      return next();
    }
    
    // Validate all image blocks
    const validationPromises = imageBlocks.map(validateImageBlock);
    const results = await Promise.all(validationPromises);
    
    // Collect all validation errors
    const allErrors = results
      .filter(r => !r.valid)
      .flatMap(r => r.errors);
    
    if (allErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid image uploads',
        details: allErrors
      });
    }
    
    next();
  } catch (error) {
    console.error('File upload validation error:', error);
    res.status(500).json({
      error: 'File validation failed'
    });
  }
};

module.exports = {
  validateBase64Image,
  validateImageBlock,
  validateFileUploads,
  ALLOWED_IMAGE_TYPES
};