const Insight = require('../../models/Insight');

/**
 * Insight Operations - Read, mark as read, dashboard queries
 */

class InsightOperations {
  
  static async getUserDashboardInsights(userId, limit = 10) {
    try {
      return await Insight.getUserInsights(userId, { limit });
    } catch (error) {
      console.error('Error fetching dashboard insights:', error);
      return [];
    }
  }

  static async markInsightAsRead(insightId, userId) {
    try {
      const insight = await Insight.findOne({ _id: insightId, userId });
      if (insight) {
        return await insight.markAsRead();
      }
      return null;
    } catch (error) {
      console.error('Error marking insight as read:', error);
      return null;
    }
  }
}

module.exports = InsightOperations;