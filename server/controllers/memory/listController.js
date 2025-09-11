const Memory = require('../../models/Memory');
const { decodeCursor, encodeCursor, sortStage } = require('../../utils/pagination');
const { getMemorySummary } = require('../../utils/contentProcessing');

// My memories (paginated) with block content support
exports.getMyMemoriesPaginated = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const cursor = decodeCursor(req.query.cursor);

    const base = {
      userId: req.user.id,
    };

    if (cursor?.date && cursor?.id) {
      base.$or = [
        { memoryDate: { $lt: cursor.date } },
        { memoryDate: cursor.date, _id: { $lt: cursor.id } },
        { memoryDate: { $exists: false }, createdAt: { $lt: cursor.date } },
        { memoryDate: { $exists: false }, createdAt: cursor.date, _id: { $lt: cursor.id } },
      ];
    }

    const items = await Memory.find(base)
      .select('title content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId') // FIXED: Added title and userId
      .populate('userId', 'displayName') // FIXED: Populate user data for ownership
      .sort(sortStage)
      .limit(limit + 1);

    // Enrich items with preview text and metadata
    const enrichedItems = items.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: getMemorySummary(obj.content, 150),
        blockTypes: memory.getBlockTypes ? memory.getBlockTypes() : getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0,
        hasChecklistItems: obj.content ? obj.content.some(b => b.type === 'checkListItem') : false,
        hasHeadings: obj.content ? obj.content.some(b => b.type === 'heading') : false
      };
    });

    const hasMore = enrichedItems.length > limit;
    if (hasMore) enrichedItems.pop();

    res.json({ 
      items: enrichedItems, 
      nextCursor: hasMore ? encodeCursor(enrichedItems[enrichedItems.length - 1]) : null,
      meta: {
        totalReturned: enrichedItems.length,
        hasMore
      }
    });
  } catch (error) {
    console.error('My memories pagination error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
};

// Public feed (paginated) with block content support
exports.getPublicMemoriesPaginated = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const cursor = decodeCursor(req.query.cursor);

    const base = { isPublic: true };

    if (cursor?.date && cursor?.id) {
      base.$or = [
        { memoryDate: { $lt: cursor.date } },
        { memoryDate: cursor.date, _id: { $lt: cursor.id } },
        { memoryDate: { $exists: false }, createdAt: { $lt: cursor.date } },
        { memoryDate: { $exists: false }, createdAt: cursor.date, _id: { $lt: cursor.id } },
      ];
    }

    const items = await Memory.find(base)
      .populate('userId', 'displayName') // FIXED: Keep userId populated
      .select('title content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId') // FIXED: Added title
      .sort(sortStage)
      .limit(limit + 1);

    // Enrich items with preview text and metadata
    const enrichedItems = items.map(memory => {
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

    const hasMore = enrichedItems.length > limit;
    if (hasMore) enrichedItems.pop();

    res.json({ 
      items: enrichedItems, 
      nextCursor: hasMore ? encodeCursor(enrichedItems[enrichedItems.length - 1]) : null,
      meta: {
        totalReturned: enrichedItems.length,
        hasMore
      }
    });
  } catch (error) {
    console.error('Public memories pagination error:', error);
    res.status(500).json({ error: 'Failed to fetch public memories' });
  }
};

// Utility function to extract block types when instance method isn't available
function getBlockTypesFromContent(content) {
  if (!Array.isArray(content)) return [];
  return [...new Set(content.map(block => block.type))];
}