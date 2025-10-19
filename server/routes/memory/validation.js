const { validationResult } = require('express-validator');
const { validateMemoryData, validateImageData } = require('../../validators/blockContentSchemas');
const { validateEmotionWithNLP } = require('../../utils/contentProcessing');
const { validateBase64Image } = require('../../middleware/sanitization');

/**
 * Memory Validation Middleware
 */

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(`Memory validation failed:`, {
      ip: req.ip,
      userId: req.user?.id,
      errors: errors.array().map(e => e.msg),
      path: req.path
    });
    
    return res.status(400).json({ 
      error: errors.array()[0].msg,
      field: errors.array()[0].path 
    });
  }
  next();
};

const logMemoryOperation = (req, operation, success = true, details = '') => {
  console.log(`Memory ${operation}:`, {
    userId: req.user?.id,
    ip: req.ip,
    success,
    timestamp: new Date().toISOString(),
    details
  });
};

// Enhanced image validation for memory content
const validateMemoryImages = (req, res, next) => {
  if (!req.body.content || !Array.isArray(req.body.content)) {
    return next();
  }

  const imageBlocks = req.body.content.filter(block => block.type === 'image');
  
  for (const imageBlock of imageBlocks) {
    if (!imageBlock.props?.images || !Array.isArray(imageBlock.props.images)) {
      return res.status(400).json({
        error: 'Image block must contain images array',
        type: 'validation_error'
      });
    }

    // Validate each image in the block
    for (const image of imageBlock.props.images) {
      const validation = validateImageData(image);
      if (!validation.valid) {
        logMemoryOperation(req, 'create', false, `Image validation failed: ${validation.errors.join(', ')}`);
        return res.status(400).json({
          error: `Image validation failed: ${validation.errors.join(', ')}`,
          type: 'image_validation_error'
        });
      }

      // Additional base64 validation
      if (!validateBase64Image(image.url)) {
        logMemoryOperation(req, 'create', false, 'Invalid base64 image data');
        return res.status(400).json({
          error: 'Invalid image data format',
          type: 'image_format_error'
        });
      }

      // Check image size limit (1MB per image)
      if (image.size > 1024 * 1024) {
        logMemoryOperation(req, 'create', false, `Image too large: ${image.size} bytes`);
        return res.status(400).json({
          error: 'Image size must be under 1MB',
          type: 'image_size_error'
        });
      }
    }

    // Limit images per block
    if (imageBlock.props.images.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 images per image block',
        type: 'image_count_error'
      });
    }
  }

  // Limit total images per memory
  const totalImages = imageBlocks.reduce((total, block) => 
    total + (block.props?.images?.length || 0), 0
  );

  if (totalImages > 20) {
    return res.status(400).json({
      error: 'Maximum 20 images per memory',
      type: 'total_image_limit_error'
    });
  }

  next();
};

// Validate emotion input
const validateEmotionEndpoint = async (req, res, next) => {
  try {
    const { emotion } = req.body;
    const validation = validateEmotionWithNLP(emotion);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    res.json({ 
      valid: true, 
      emotion,
      family: validation.family || 'other'
    });
  } catch (error) {
    console.error('Emotion validation error:', error);
    next(error);
  }
};

module.exports = {
  handleValidationErrors,
  logMemoryOperation,
  validateMemoryImages,
  validateEmotionEndpoint
};