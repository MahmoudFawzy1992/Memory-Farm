const mongoose = require('mongoose');
const Memory = require('../../models/Memory');
const {
  toDateOrNull,
  startOfDayUTC,
  addDaysUTC,
  memoryDateExpr,
} = require('../../utils/dateHelpers');

// Calendar summary with enhanced metadata
exports.getCalendarSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          $expr: {
            $and: [
              { $gte: [memoryDateExpr, fromUTC] },
              { $lt: [memoryDateExpr, toUTCExclusive] },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: memoryDateExpr },
            m: { $month: memoryDateExpr },
            d: { $dayOfMonth: memoryDateExpr },
          },
          count: { $sum: 1 },
          avgComplexity: { $avg: '$contentComplexity' },
          hasImages: { $max: '$hasImages' },
          emotions: { $addToSet: '$emotion' }
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } },
          count: 1,
          avgComplexity: { $round: ['$avgComplexity', 1] },
          hasImages: 1,
          emotionCount: { $size: '$emotions' }
        },
      },
      { $sort: { date: 1 } },
    ];

    const days = await Memory.aggregate(pipeline);
    res.json({ from: fromUTC, to: toUTCExclusive, days });
  } catch (err) {
    console.error('getCalendarSummary error:', err);
    res.status(500).json({ error: 'Failed to load calendar summary' });
  }
};

// FIXED: Enhanced memories by date with full memory data
exports.getMemoriesByDate = async (req, res) => {
  try {
    const base = toDateOrNull(req.query.date);
    if (!base) return res.status(400).json({ error: 'Invalid or missing date' });

    const fromUTC = startOfDayUTC(base);
    const toUTCExclusive = addDaysUTC(fromUTC, 1);

    const memories = await Memory.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      $expr: {
        $and: [
          { $gte: [memoryDateExpr, fromUTC] },
          { $lt: [memoryDateExpr, toUTCExclusive] },
        ],
      },
    })
    .select('title content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId')
    .populate('userId', 'displayName')
    .sort({ createdAt: -1 });

    // Add preview text and metadata
    const enrichedMemories = memories.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: memory.getPreviewText ? memory.getPreviewText(100) : obj.extractedText?.substring(0, 100) || 'No text content',
        blockTypes: memory.getBlockTypes ? memory.getBlockTypes() : getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0,
        hasChecklistItems: obj.content ? obj.content.some(b => b.type === 'checkListItem') : false,
        hasHeadings: obj.content ? obj.content.some(b => b.type === 'heading') : false,
        hasMoodBlocks: obj.content ? obj.content.some(b => b.type === 'mood') : false
      };
    });

    res.json({ date: fromUTC, memories: enrichedMemories });
  } catch (err) {
    console.error('getMemoriesByDate error:', err);
    res.status(500).json({ error: 'Failed to load memories for date' });
  }
};

// NEW: Get all memories for a date range (optimized for month view)
exports.getMemoriesForDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);

    const memories = await Memory.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      $expr: {
        $and: [
          { $gte: [memoryDateExpr, fromUTC] },
          { $lt: [memoryDateExpr, toUTCExclusive] },
        ],
      },
    })
    .select('title content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt updatedAt userId')
    .populate('userId', 'displayName')
    .sort({ createdAt: -1 });

    // Add preview text and metadata like other endpoints
    const enrichedMemories = memories.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: memory.getPreviewText ? memory.getPreviewText(100) : obj.extractedText?.substring(0, 100) || 'No text content',
        blockTypes: memory.getBlockTypes ? memory.getBlockTypes() : getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0,
        hasChecklistItems: obj.content ? obj.content.some(b => b.type === 'checkListItem') : false,
        hasHeadings: obj.content ? obj.content.some(b => b.type === 'heading') : false,
        hasMoodBlocks: obj.content ? obj.content.some(b => b.type === 'mood') : false
      };
    });

    res.json({ 
      from: fromUTC, 
      to: toUTCExclusive, 
      memories: enrichedMemories,
      count: enrichedMemories.length 
    });
  } catch (err) {
    console.error('getMemoriesForDateRange error:', err);
    res.status(500).json({ error: 'Failed to load memories for date range' });
  }
};

// Enhanced mood distribution by emotion families
exports.getMoodDistribution = async (req, res) => {
  try {
    const { from, to, groupBy = 'emotion' } = req.query;
    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);

    const groupField = groupBy === 'family' ? '$emotionFamily' : '$emotion';

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          $expr: {
            $and: [
              { $gte: [memoryDateExpr, fromUTC] },
              { $lt: [memoryDateExpr, toUTCExclusive] },
            ],
          },
        },
      },
      { 
        $group: { 
          _id: groupField,
          count: { $sum: 1 },
          avgComplexity: { $avg: '$contentComplexity' },
          imageCount: { $sum: { $cond: ['$hasImages', 1, 0] } }
        } 
      },
      { 
        $project: { 
          _id: 0, 
          [groupBy]: '$_id',
          count: 1,
          avgComplexity: { $round: ['$avgComplexity', 1] },
          imageCount: 1
        } 
      },
      { $sort: { count: -1 } },
    ];

    const distribution = await Memory.aggregate(pipeline);
    res.json({ from: fromUTC, to: toUTCExclusive, groupBy, distribution });
  } catch (err) {
    console.error('getMoodDistribution error:', err);
    res.status(500).json({ error: 'Failed to load mood distribution' });
  }
};

// Enhanced mood trend analysis
exports.getMoodTrend = async (req, res) => {
  try {
    const { from, to, interval = 'day', metric = 'count' } = req.query;
    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);
    const monthly = interval === 'month';

    const groupId = monthly
      ? { y: { $year: memoryDateExpr }, m: { $month: memoryDateExpr }, family: '$emotionFamily' }
      : { y: { $year: memoryDateExpr }, m: { $month: memoryDateExpr }, d: { $dayOfMonth: memoryDateExpr }, family: '$emotionFamily' };

    const projDate = monthly
      ? { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: 1 } }
      : { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } };

    const metricCalc = metric === 'complexity' 
      ? { $avg: '$contentComplexity' }
      : { $sum: 1 };

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          $expr: {
            $and: [
              { $gte: [memoryDateExpr, fromUTC] },
              { $lt: [memoryDateExpr, toUTCExclusive] },
            ],
          },
        },
      },
      { 
        $group: { 
          _id: groupId, 
          value: metricCalc,
          imageCount: { $sum: { $cond: ['$hasImages', 1, 0] } }
        } 
      },
      { 
        $project: { 
          _id: 0, 
          date: projDate, 
          emotionFamily: '$_id.family',
          value: metric === 'complexity' ? { $round: ['$value', 1] } : '$value',
          imageCount: 1
        } 
      },
      { $sort: { date: 1, emotionFamily: 1 } },
    ];

    const trend = await Memory.aggregate(pipeline);
    res.json({ 
      from: fromUTC, 
      to: toUTCExclusive, 
      interval: monthly ? 'month' : 'day',
      metric,
      trend 
    });
  } catch (err) {
    console.error('getMoodTrend error:', err);
    res.status(500).json({ error: 'Failed to load mood trend' });
  }
};

// Search memories by content
exports.searchMemories = async (req, res) => {
  try {
    const { q, emotion, family, hasImages, minComplexity, maxComplexity } = req.query;
    const query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    // Text search
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    // Emotion filters
    if (emotion) {
      query.emotion = new RegExp(emotion.trim(), 'i');
    }
    if (family && family !== 'all') {
      query.emotionFamily = family;
    }

    // Content filters
    if (hasImages === 'true') {
      query.hasImages = true;
    }
    if (minComplexity) {
      query.contentComplexity = { ...query.contentComplexity, $gte: parseFloat(minComplexity) };
    }
    if (maxComplexity) {
      query.contentComplexity = { ...query.contentComplexity, $lte: parseFloat(maxComplexity) };
    }

    const memories = await Memory.find(query)
      .select('title content emotion color memoryDate extractedText blockCount hasImages contentComplexity emotionFamily isPublic createdAt userId')
      .populate('userId', 'displayName')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(50);

    const results = memories.map(memory => {
      const obj = memory.toObject();
      return {
        ...obj,
        previewText: memory.getPreviewText ? memory.getPreviewText(150) : obj.extractedText?.substring(0, 150) || 'No text content',
        blockTypes: getBlockTypesFromContent(obj.content),
        wordCount: obj.extractedText ? obj.extractedText.split(' ').length : 0
      };
    });

    res.json({ query: req.query, results, count: results.length });
  } catch (err) {
    console.error('searchMemories error:', err);
    res.status(500).json({ error: 'Memory search failed' });
  }
};

// Utility function to extract block types when instance method isn't available
function getBlockTypesFromContent(content) {
  if (!Array.isArray(content)) return [];
  return [...new Set(content.map(block => block.type))];
}

module.exports = {
  getCalendarSummary: exports.getCalendarSummary,
  getMemoriesByDate: exports.getMemoriesByDate,
  getMemoriesForDateRange: exports.getMemoriesForDateRange, // NEW
  getMoodDistribution: exports.getMoodDistribution,
  getMoodTrend: exports.getMoodTrend,
  searchMemories: exports.searchMemories
};