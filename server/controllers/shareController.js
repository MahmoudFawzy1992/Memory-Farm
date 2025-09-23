const Memory = require('../models/Memory');
const { renderMemoryCard } = require('../utils/cardRenderer');

/**
 * Generate a shareable memory card image
 * POST /api/share/card/:memoryId
 */
exports.generateMemoryCard = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const userId = req.user.id;

    // Validate memory ID format
    if (!memoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid memory ID format',
        type: 'validation_error'
      });
    }

    // Fetch memory with owner validation
    const memory = await Memory.findById(memoryId)
      .populate('userId', 'displayName')
      .select('title content emotion color isPublic userId createdAt memoryDate');

    if (!memory) {
      return res.status(404).json({
        error: 'Memory not found',
        type: 'not_found'
      });
    }

    // Security check: Only owner can generate cards for their memories
    if (memory.userId._id.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only generate cards for your own memories',
        type: 'access_denied'
      });
    }

    // Privacy check: Only public memories can be shared
    if (!memory.isPublic) {
      return res.status(403).json({
        error: 'Only public memories can be shared. Please make this memory public first.',
        type: 'privacy_violation'
      });
    }

    // Extract card data from memory
    const cardData = extractCardData(memory);

    // Generate card image using canvas
    const cardBuffer = await renderMemoryCard(cardData);

    // Set response headers for image download
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': cardBuffer.length,
      'Content-Disposition': `attachment; filename="memory-${memoryId}.png"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Send the generated card image
    res.send(cardBuffer);
  } catch (error) {
    console.error('Card generation error:', error);
    
    // Handle specific error types
    if (error.message.includes('Canvas')) {
      return res.status(500).json({
        error: 'Image processing failed. Please try again.',
        type: 'canvas_error'
      });
    }
    
    if (error.message.includes('Memory processing')) {
      return res.status(400).json({
        error: 'Invalid memory content for card generation',
        type: 'content_error'
      });
    }

    // Generic server error
    res.status(500).json({
      error: 'Card generation failed. Please try again later.',
      type: 'server_error'
    });
  }
};

/**
 * Extract and process memory data for card generation
 */
function extractCardData(memory) {
  // Extract title (truncate if too long)
  const title = memory.title && memory.title.length > 80 
    ? memory.title.substring(0, 77) + '...' 
    : memory.title || 'Untitled Memory';

  // Extract emotion data from mood blocks
  let emotion = { text: '', emoji: '', intensity: 5 };
  if (memory.content && Array.isArray(memory.content)) {
    const moodBlock = memory.content.find(block => block.type === 'mood');
    if (moodBlock?.props) {
      const fullEmotion = moodBlock.props.emotion || '';
      const emojiMatch = fullEmotion.match(/^\p{Emoji}+/u);
      emotion = {
        text: emojiMatch ? fullEmotion.slice(emojiMatch[0].length).trim() : fullEmotion,
        emoji: emojiMatch ? emojiMatch[0] : '🎭',
        intensity: moodBlock.props.intensity || 5
      };
    }
  }

  // Extract first image from image blocks
  let image = null;
  if (memory.content && Array.isArray(memory.content)) {
    const imageBlock = memory.content.find(block => 
      block.type === 'image' && 
      block.props?.images && 
      block.props.images.length > 0
    );
    
    if (imageBlock) {
      const firstImage = imageBlock.props.images[0];
      if (firstImage && firstImage.url && firstImage.url.startsWith('data:image/')) {
        image = {
          url: firstImage.url,
          alt: firstImage.alt || '',
          caption: firstImage.caption || ''
        };
      }
    }
  }

  return {
    title,
    emotion,
    image,
    color: memory.color || '#8B5CF6',
    authorName: memory.userId?.displayName || 'Memory Farm User',
    memoryDate: memory.memoryDate || memory.createdAt
  };
}