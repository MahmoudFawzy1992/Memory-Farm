// Small helpers reused by analytics controllers.

const toDateOrNull = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const startOfDayUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const addDaysUTC = (d, days) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
};

// Use memoryDate if present; otherwise createdAt
const memoryDateExpr = { $ifNull: ['$memoryDate', '$createdAt'] };

module.exports = {
  toDateOrNull,
  startOfDayUTC,
  addDaysUTC,
  memoryDateExpr,
};
