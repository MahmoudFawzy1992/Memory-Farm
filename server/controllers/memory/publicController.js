const Memory = require('../../models/Memory');
const { getMemorySummary } = require('../../utils/contentProcessing');

// Public feed (legacy full list) with block content support
exports.getPublicMemories = async (_req, res) => {
  try {
    const memories = await Memory.find({ isPublic: true })
      .populate('userId', 'displayName')
      .select('content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId')
      .sort({ createdAt: -1 })
      .limit(100); // Reasonable limit for legacy endpoint

    // Enrich memories with preview text and metadata
    const enrichedMemories = memories.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: getMemorySummary(obj.content, 120),
        blockTypes: memory.getBlockTypes ? memory.getBlockTypes() : getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0,
        hasChecklistItems: obj.content ? obj.content.some(b => b.type === 'checkListItem') : false,
        hasHeadings: obj.content ? obj.content.some(b => b.type === 'heading') : false,
        hasMoodBlocks: obj.content ? obj.content.some(b => b.type === 'mood') : false,
        authorName: obj.userId?.displayName || 'Unknown User'
      };
    });

    res.json({ 
      memories: enrichedMemories,
      meta: {
        total: enrichedMemories.length,
        note: 'Use /memory/public/paginated for better performance'
      }
    });
  } catch (err) {
    console.error('Public memories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch public memories' });
  }
};

// Read one memory (enforces privacy inside controller) with block content
exports.getMemoryById = async (req, res) => {
  const memoryId = req.params.id;

  try {
    const memory = await Memory.findById(memoryId)
      .populate('userId', '_id displayName')
      .select('content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId');

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const isOwner = memory.userId?._id?.toString() === req.user.id;
    if (!memory.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to view this memory' });
    }

    // Enrich memory with metadata
    const enrichedMemory = {
      ...memory.toObject(),
      blockTypes: memory.getBlockTypes ? memory.getBlockTypes() : getBlockTypesFromContent(memory.content),
      wordCount: memory.extractedText ? memory.extractedText.split(' ').length : 0,
      readingTimeMinutes: memory.extractedText ? Math.max(1, Math.ceil(memory.extractedText.split(' ').length / 200)) : 1,
      hasChecklistItems: memory.content ? memory.content.some(b => b.type === 'checkListItem') : false,
      hasHeadings: memory.content ? memory.content.some(b => b.type === 'heading') : false,
      hasMoodBlocks: memory.content ? memory.content.some(b => b.type === 'mood') : false,
      imageCount: memory.content ? memory.content.filter(b => b.type === 'image').length : 0,
      isOwner
    };

    res.status(200).json(enrichedMemory);
  } catch (err) {
    console.error('Memory fetch by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
};

// Advanced memory search endpoint
exports.searchPublicMemories = async (req, res) => {
  try {
    const { q, emotion, family, hasImages, complexity, author, limit = 20 } = req.query;
    const query = { isPublic: true };

    // Text search
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    // Emotion filters
    if (emotion && emotion !== 'all') {
      query.emotion = new RegExp(emotion.trim(), 'i');
    }
    if (family && family !== 'all') {
      query.emotionFamily = family;
    }

    // Content filters
    if (hasImages === 'true') {
      query.hasImages = true;
    }
    if (complexity) {
      const complexityNum = parseFloat(complexity);
      if (!isNaN(complexityNum)) {
        query.contentComplexity = { $gte: complexityNum };
      }
    }

    // Author filter
    if (author && author.trim()) {
      const authorUsers = await require('../../models/User').find({
        displayName: new RegExp(author.trim(), 'i')
      }).select('_id');
      query.userId = { $in: authorUsers.map(u => u._id) };
    }

    const memories = await Memory.find(query)
      .populate('userId', 'displayName')
      .select('content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt userId')
      .sort({ 
        ...(q ? { score: { $meta: 'textScore' } } : {}),
        createdAt: -1 
      })
      .limit(Math.min(parseInt(limit), 50));

    // Enrich results
    const enrichedResults = memories.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: getMemorySummary(obj.content, 150),
        blockTypes: getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0,
        authorName: obj.userId?.displayName || 'Unknown User'
      };
    });

    res.json({ 
      results: enrichedResults, 
      meta: {
        query: req.query,
        count: enrichedResults.length,
        searchTerms: q ? q.trim().split(' ') : []
      }
    });
  } catch (err) {
    console.error('Public memory search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

// Utility function to extract block types when instance method isn't available
function getBlockTypesFromContent(content) {
  if (!Array.isArray(content)) return [];
  return [...new Set(content.map(block => block.type))];
}

module.exports = {
  getPublicMemories: exports.getPublicMemories,
  getMemoryById: exports.getMemoryById,
  searchPublicMemories: exports.searchPublicMemories
};