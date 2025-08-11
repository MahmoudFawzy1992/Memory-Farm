const Memory = require('../../models/Memory');
const { decodeCursor, encodeCursor, sortStage } = require('../../utils/pagination');

// My memories (paginated)
exports.getMyMemoriesPaginated = async (req, res) => {
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

  const items = await Memory.find(base).sort(sortStage).limit(limit + 1);
  const hasMore = items.length > limit;
  if (hasMore) items.pop();
  res.json({ items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null });
};

// Public feed (paginated)
exports.getPublicMemoriesPaginated = async (req, res) => {
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
    .populate('userId', 'displayName')
    .sort(sortStage)
    .limit(limit + 1);

  const hasMore = items.length > limit;
  if (hasMore) items.pop();
  res.json({ items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null });
};
