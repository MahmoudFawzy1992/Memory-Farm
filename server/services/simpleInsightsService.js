const insightGenerator = require('./simpleInsightsService/insightGenerator');
const insightOperations = require('./simpleInsightsService/insightOperations');

/**
 * Simple Insights Service - NOW WITH AI INTEGRATION
 * 
 * This service orchestrates insight generation with 3-tier fallback:
 * 1. Try AI (GPT-4o-mini → Llama 3.2)
 * 2. Fall back to static insights if AI fails
 * 3. Always return an insight (bulletproof system)
 */

class SimpleInsightsService {
  
  static async generateInsightForUser(userId, memoryCount, latestMemoryId) {
    return insightGenerator.generateInsightForUser(userId, memoryCount, latestMemoryId);
  }

  static async regenerateInsight(insightId, userId) {
    return insightGenerator.regenerateInsight(insightId, userId);
  }

  static async getUserDashboardInsights(userId, limit = 10) {
    return insightOperations.getUserDashboardInsights(userId, limit);
  }

  static async markInsightAsRead(insightId, userId) {
    return insightOperations.markInsightAsRead(insightId, userId);
  }
}

module.exports = SimpleInsightsService;