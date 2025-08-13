const mongoose = require('mongoose');

const Memory = require('../../models/Memory');
const {
  toDateOrNull,
  startOfDayUTC,
  addDaysUTC,
  memoryDateExpr,
} = require('../../utils/dateHelpers');

// Counts per day for a range (current user)
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
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } },
          count: 1,
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

// All memories for a given day (current user)
exports.getMemoriesByDate = async (req, res) => {
  try {
    console.log('🔍 Looking for memories with userId:', req.user.id);
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
    }).sort({ createdAt: -1 });

    res.json({ date: fromUTC, memories });
  } catch (err) {
    console.error('getMemoriesByDate error:', err);
    res.status(500).json({ error: 'Failed to load memories for date' });
  }
};

// Counts grouped by emotion (current user, range)
exports.getMoodDistribution = async (req, res) => {
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
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $project: { _id: 0, emotion: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ];

    const distribution = await Memory.aggregate(pipeline);
    res.json({ from: fromUTC, to: toUTCExclusive, distribution });
  } catch (err) {
    console.error('getMoodDistribution error:', err);
    res.status(500).json({ error: 'Failed to load mood distribution' });
  }
};

// Trend grouped by day/month and emotion (current user, range)
exports.getMoodTrend = async (req, res) => {
  try {
    const { from, to, interval = 'day' } = req.query;
    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);
    const monthly = interval === 'month';

    const groupId = monthly
      ? { y: { $year: memoryDateExpr }, m: { $month: memoryDateExpr }, emotion: '$emotion' }
      : { y: { $year: memoryDateExpr }, m: { $month: memoryDateExpr }, d: { $dayOfMonth: memoryDateExpr }, emotion: '$emotion' };

    const projDate = monthly
      ? { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: 1 } }
      : { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } };

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
      { $group: { _id: groupId, count: { $sum: 1 } } },
      { $project: { _id: 0, date: projDate, emotion: '$_id.emotion', count: 1 } },
      { $sort: { date: 1, emotion: 1 } },
    ];

    const trend = await Memory.aggregate(pipeline);
    res.json({ from: fromUTC, to: toUTCExclusive, interval: monthly ? 'month' : 'day', trend });
  } catch (err) {
    console.error('getMoodTrend error:', err);
    res.status(500).json({ error: 'Failed to load mood trend' });
  }
};
