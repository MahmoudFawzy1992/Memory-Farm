const natural = require('natural');
const { emotionFamilies } = require('../constants/emotionFamilies');

/**
 * Extract plain text from block-based content for search indexing
 */
function extractTextFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  
  return blocks
    .map(block => {
      // Extract from regular content blocks (paragraph, checkList, etc.)
      let blockText = '';
      
      if (block.content && Array.isArray(block.content)) {
        blockText = block.content
          .map(item => {
            if (typeof item === 'string') return item;
            if (item.text) return item.text;
            return '';
          })
          .join(' ');
      }
      
      // IMPORTANT: Also extract from MoodBlock notes
      if (block.type === 'mood' && block.props?.note) {
        blockText += ' ' + block.props.note;
      }
      
      return blockText;
    })
    .filter(text => text.trim())
    .join('\n')
    .substring(0, 2000); // Reasonable limit for search indexing
}

/**
 * Extract text from a single block
 */
function extractTextFromBlock(block) {
  if (!block.content || !Array.isArray(block.content)) return '';
  return block.content
    .map(item => typeof item === 'string' ? item : (item.text || ''))
    .join(' ');
}

/**
 * FIXED: Enhanced image block detection and counting
 */
function hasImageBlocks(blocks) {
  if (!Array.isArray(blocks)) return false;
  return blocks.some(block => block.type === 'image' && block.props?.images?.length > 0);
}

/**
 * FIXED: Count total images across all image blocks
 */
function countImagesInBlocks(blocks) {
  if (!Array.isArray(blocks)) return 0;
  
  return blocks.reduce((total, block) => {
    if (block.type === 'image' && block.props?.images) {
      return total + block.props.images.length;
    }
    return total;
  }, 0);
}

/**
 * FIXED: Calculate total image size across all blocks
 */
function calculateImageSizeTotal(blocks) {
  if (!Array.isArray(blocks)) return 0;
  
  return blocks.reduce((total, block) => {
    if (block.type === 'image' && block.props?.images) {
      return total + block.props.images.reduce((blockTotal, image) => {
        return blockTotal + (image.size || 0);
      }, 0);
    }
    return total;
  }, 0);
}

/**
 * Extract mood blocks for enhanced analytics
 */
function extractMoodBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter(block => block.type === 'mood')
    .map(block => ({
      emotion: block.props?.emotion,
      intensity: block.props?.intensity || 5,
      note: block.props?.note
    }));
}

/**
 * Determine emotion family from emotion text - STRICT VALIDATION ONLY
 */
function getEmotionFamilyKey(emotionText) {
  if (!emotionText) return null; // No emotion = no family
  
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim().toLowerCase();
  
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion
    );
    if (found) return familyKey;
  }
  
  return null;
}

/**
 * FIXED: Enhanced content complexity calculation with image support
 */
function calculateContentComplexity(blocks) {
  if (!Array.isArray(blocks)) return 0;
  
  let score = 0;
  const weights = {
    'paragraph': 1,
    'heading': 0.5,
    'bulletListItem': 0.8,
    'numberedListItem': 0.8,
    'checkListItem': 1.2, // Higher weight for tasks
    'checkList': 1.2, // Fixed naming
    'image': 2.5, // Higher weight for images (multimedia content)
    'mood': 2, // High weight for mood blocks
    'divider': 0.3 // Lower weight for dividers
  };
  
  blocks.forEach(block => {
    const weight = weights[block.type] || 1;
    let contentFactor = 0;
    
    // Calculate content factor based on block type
    switch (block.type) {
      case 'paragraph':
      case 'checkList':
        contentFactor = extractTextFromBlock(block).length / 100;
        break;
      case 'image':
        // Factor in number of images and their metadata
        if (block.props?.images) {
          contentFactor = block.props.images.length * 2; // 2 points per image
          // Add points for captions and alt text
          block.props.images.forEach(image => {
            if (image.caption) contentFactor += 0.5;
            if (image.alt) contentFactor += 0.3;
          });
        }
        break;
      case 'mood':
        contentFactor = 1; // Base complexity for mood
        if (block.props?.note) {
          contentFactor += block.props.note.length / 50;
        }
        break;
      default:
        contentFactor = extractTextFromBlock(block).length / 100;
    }
    
    score += weight + contentFactor;
  });
  
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * FIXED: Enhanced memory summary with image indicators
 */
function getMemorySummary(blocks, maxLength = 100) {
  const text = extractTextFromBlocks(blocks);
  const moodBlocks = extractMoodBlocks(blocks);
  const hasImages = hasImageBlocks(blocks);
  const imageCount = countImagesInBlocks(blocks);
  
  let summary = text.substring(0, maxLength);
  if (text.length > maxLength) summary += '...';
  
  // Add metadata hints
  const hints = [];
  if (hasImages) {
    if (imageCount === 1) {
      hints.push('📷');
    } else {
      hints.push(`📷×${imageCount}`);
    }
  }
  if (moodBlocks.length > 0) hints.push('🎭');
  if (blocks.some(b => b.type === 'checkList')) hints.push('✅');
  
  return hints.length > 0 ? `${hints.join(' ')} ${summary}` : summary;
}

/**
 * Validate that emotion exists in predefined list - STRICT VALIDATION
 */
function validateEmotionWithNLP(emotionText) {
  if (!emotionText) return { valid: true }; // Optional field
  
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim();
  
  // Check if emotion exists in our predefined list
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion.toLowerCase()
    );
    if (found) {
      return { valid: true, family: familyKey, matchedEmotion: found };
    }
  }
  
  return { 
    valid: false, 
    error: 'Please select from the available emotions. Custom emotions are not allowed.' 
  };
}

/**
 * Get drag and drop reorder positions for blocks
 */
function validateBlockOrder(blocks) {
  if (!Array.isArray(blocks)) return { valid: false, error: 'Blocks must be an array' };
  
  const ids = blocks.map(b => b.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length !== uniqueIds.size) {
    return { valid: false, error: 'Duplicate block IDs found' };
  }
  
  return { valid: true };
}

/**
 * FIXED: Enhanced image block processing
 */
function processImageBlock(imageData) {
  if (!imageData.images || !Array.isArray(imageData.images)) {
    throw new Error('Image block must contain images array');
  }
  
  return {
    id: imageData.id || generateBlockId(),
    type: 'image',
    props: {
      images: imageData.images.map(image => ({
        id: image.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: image.url,
        name: image.name || 'untitled',
        alt: image.alt || '',
        caption: image.caption || '',
        size: image.size || 0,
        type: image.type || 'image/jpeg',
        uploadedAt: image.uploadedAt || new Date().toISOString()
      }))
    },
    content: []
  };
}

/**
 * Generate unique block ID
 */
function generateBlockId() {
  return 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * FIXED: Enhanced block structure validation with image support
 */
function validateBlockStructure(block) {
  if (!block.id || !block.type) {
    return { valid: false, error: 'Block must have id and type' };
  }
  
  const validTypes = ['paragraph', 'heading', 'bulletListItem', 'numberedListItem', 'checkListItem', 'checkList', 'image', 'mood', 'divider'];
  if (!validTypes.includes(block.type)) {
    return { valid: false, error: `Invalid block type: ${block.type}` };
  }
  
  // Additional validation for image blocks
  if (block.type === 'image') {
    if (!block.props?.images || !Array.isArray(block.props.images) || block.props.images.length === 0) {
      return { valid: false, error: 'Image block must contain at least one image' };
    }
    
    for (const image of block.props.images) {
      if (!image.url || !image.url.startsWith('data:image/')) {
        return { valid: false, error: 'Image must have valid data URL' };
      }
    }
  }
  
  return { valid: true };
}

module.exports = {
  extractTextFromBlocks,
  hasImageBlocks,
  countImagesInBlocks,
  calculateImageSizeTotal,
  extractMoodBlocks,
  getEmotionFamilyKey,
  calculateContentComplexity,
  getMemorySummary,
  validateEmotionWithNLP,
  extractTextFromBlock,
  validateBlockOrder,
  processImageBlock,
  generateBlockId,
  validateBlockStructure
};