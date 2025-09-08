const natural = require('natural');
const { emotionFamilies } = require('../constants/emotionFamilies');

/**
 * Extract plain text from block-based content for search indexing
 */
function extractTextFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  
  return blocks
    .map(block => {
      if (!block.content || !Array.isArray(block.content)) return '';
      
      return block.content
        .map(item => {
          if (typeof item === 'string') return item;
          if (item.text) return item.text;
          return '';
        })
        .join(' ');
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
 * Check if blocks contain image content
 */
function hasImageBlocks(blocks) {
  if (!Array.isArray(blocks)) return false;
  return blocks.some(block => block.type === 'image');
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
  
  // This should never happen with strict validation
  return null;
}

/**
 * Calculate content complexity score for analytics
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
    'image': 1.5,
    'mood': 2 // Highest weight for mood blocks
  };
  
  blocks.forEach(block => {
    const weight = weights[block.type] || 1;
    const contentLength = extractTextFromBlock(block).length;
    score += weight + (contentLength / 100); // Base weight + content factor
  });
  
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Get memory summary for notifications and previews
 */
function getMemorySummary(blocks, maxLength = 100) {
  const text = extractTextFromBlocks(blocks);
  const moodBlocks = extractMoodBlocks(blocks);
  const hasImages = hasImageBlocks(blocks);
  
  let summary = text.substring(0, maxLength);
  if (text.length > maxLength) summary += '...';
  
  // Add metadata hints
  const hints = [];
  if (hasImages) hints.push('📷');
  if (moodBlocks.length > 0) hints.push('🎭');
  if (blocks.some(b => b.type === 'checkListItem')) hints.push('✅');
  
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
 * Process uploaded images for memory blocks
 */
function processImageBlock(imageData) {
  // This will be enhanced when we add image upload functionality
  return {
    id: imageData.id || generateBlockId(),
    type: 'image',
    props: {
      url: imageData.url,
      alt: imageData.alt || '',
      caption: imageData.caption || '',
      width: imageData.width || null,
      previewUrl: imageData.previewUrl || imageData.url
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
 * Validate block structure for drag and drop operations
 */
function validateBlockStructure(block) {
  if (!block.id || !block.type) {
    return { valid: false, error: 'Block must have id and type' };
  }
  
  const validTypes = ['paragraph', 'heading', 'bulletListItem', 'numberedListItem', 'checkListItem', 'image', 'mood'];
  if (!validTypes.includes(block.type)) {
    return { valid: false, error: `Invalid block type: ${block.type}` };
  }
  
  return { valid: true };
}

module.exports = {
  extractTextFromBlocks,
  hasImageBlocks,
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