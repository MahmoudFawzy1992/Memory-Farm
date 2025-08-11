// Re-export split controllers to keep routes unchanged.

const { toggleVisibility } = require('./memory/visibilityController');
const { getPublicMemories, getMemoryById } = require('./memory/publicController');
const {
  getCalendarSummary,
  getMemoriesByDate,
  getMoodDistribution,
  getMoodTrend,
} = require('./memory/analyticsController');

module.exports = {
  toggleVisibility,
  getPublicMemories,
  getMemoryById,
  getCalendarSummary,
  getMemoriesByDate,
  getMoodDistribution,
  getMoodTrend,
};
