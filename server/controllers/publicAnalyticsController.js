const Memory = require("../models/Memory");
const {
  toDateOrNull,
  startOfDayUTC,
  addDaysUTC,
  memoryDateExpr,
} = require("../utils/dateHelpers");

// Global mood distribution (isPublic:true)
exports.getPublicDistribution = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);

    const pipeline = [
      {
        $match: {
          isPublic: true,
          $expr: {
            $and: [
              { $gte: [memoryDateExpr, fromUTC] },
              { $lt: [memoryDateExpr, toUTCExclusive] },
            ],
          },
        },
      },
      { $group: { _id: "$emotion", count: { $sum: 1 } } },
      { $project: { _id: 0, emotion: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ];

    const distribution = await Memory.aggregate(pipeline);
    res.json({ from: fromUTC, to: toUTCExclusive, distribution });
  } catch (err) {
    console.error("getPublicDistribution error:", err);
    res.status(500).json({ error: "Failed to load public distribution" });
  }
};

// Global trend (isPublic:true), grouped by day/month
exports.getPublicTrend = async (req, res) => {
  try {
    const { from, to, interval = "day" } = req.query;

    const fromDate = toDateOrNull(from) || startOfDayUTC(new Date());
    const toDateRaw = toDateOrNull(to) || fromDate;
    const fromUTC = startOfDayUTC(fromDate);
    const toUTCExclusive = addDaysUTC(startOfDayUTC(toDateRaw), 1);

    const monthly = interval === "month";
    const groupId = monthly
      ? { y: { $year: memoryDateExpr }, m: { $month: memoryDateExpr }, emotion: "$emotion" }
      : {
          y: { $year: memoryDateExpr },
          m: { $month: memoryDateExpr },
          d: { $dayOfMonth: memoryDateExpr },
          emotion: "$emotion",
        };

    const projDate = monthly
      ? { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: 1 } }
      : { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } };

    const pipeline = [
      {
        $match: {
          isPublic: true,
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
    res.json({ from: fromUTC, to: toUTCExclusive, interval: monthly ? "month" : "day", trend });
  } catch (err) {
    console.error("getPublicTrend error:", err);
    res.status(500).json({ error: "Failed to load public trend" });
  }
};
