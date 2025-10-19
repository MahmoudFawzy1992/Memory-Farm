const Memory = require('../../models/Memory');
const { decodeCursor, encodeCursor, sortStage } = require('../../utils/pagination');
const { extractIdFromSlug } = require('../../utils/slugify'); // ✅ ADD THIS

// A user's public memories (paginated)
exports.getUserPublicMemories = async (req, res) => {
  try {
    // ✅ Extract ID from slug
    const userId = extractIdFromSlug(req.params.id);
    
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const cursor = decodeCursor(req.query.cursor);

    const base = { userId, isPublic: true };

    if (cursor?.date && cursor?.id) {
      base.$or = [
        { memoryDate: { $lt: cursor.date } },
        { memoryDate: cursor.date, _id: { $lt: cursor.id } },
        { memoryDate: { $exists: false }, createdAt: { $lt: cursor.date } },
        { memoryDate: { $exists: false }, createdAt: cursor.date, _id: { $lt: cursor.id } },
      ];
    }

    const items = await Memory.find(base).sort(sortStage).limit(limit + 1);
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    
    res.json({ items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null });
  } catch (err) {
    console.error("Get user public memories error:", err);
    res.status(500).json({ error: "Failed to fetch user memories" });
  }
};