const Memory = require('../../models/Memory');
const { sanitizeSearchQuery } = require('../../middleware/sanitization');
const { logMemoryOperation } = require('./validation');

/**
 * Memory Query Operations - Search, public feed
 */

// Search memories
const searchMemories = async (req, res, next) => {
  try {
    const { q, emotion, limit = 20 } = req.query;
    
    const sanitizedQuery = sanitizeSearchQuery(q);
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    logMemoryOperation(req, 'search', true, `Query: ${sanitizedQuery.substring(0, 50)}`);
    
    const query = { userId: req.user.id };
    
    if (sanitizedQuery) {
      query.$text = { $search: sanitizedQuery };
    }
    
    if (emotion && emotion !== 'all') {
      const sanitizedEmotion = sanitizeSearchQuery(emotion);
      query.emotion = new RegExp(sanitizedEmotion, 'i');
    }
    
    const memories = await Memory.find(query)
      .select('title content emotion color memoryDate extractedText isPublic createdAt userId')
      .populate('userId', 'displayName')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(Math.min(parseInt(limit), 50));
    
    res.json({ 
      query: sanitizedQuery,
      results: memories, 
      count: memories.length 
    });
  } catch (error) {
    console.error('Memory search error:', error);
    logMemoryOperation(req, 'search', false, error.message);
    next(error);
  }
};

module.exports = {
  searchMemories
};