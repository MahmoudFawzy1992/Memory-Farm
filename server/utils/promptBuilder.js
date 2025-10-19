/**
 * AI Prompt Builder - ULTIMATE PREMIUM VERSION
 * 
 * Every token is spent on making users feel truly understood.
 * 
 * Features:
 * - Memory-to-memory connections
 * - Temporal pattern detection
 * - Past self comparison
 * - Life area balance analysis
 * - Writing evolution tracking
 * - Contextual empathy
 * - Surgical reflective questions
 * - Emotional velocity
 * 
 * Target: 410-450 users/month with EXTRAORDINARY quality
 */

const basicPrompts = require('./promptBuilder/basicPrompts');
const ultimateInsight = require('./promptBuilder/ultimateInsight');

class PromptBuilder {
  /**
   * Build prompt for AI based on memory count and user patterns
   */
  buildPrompt(memoryCount, patterns, latestMemory = null) {
    if (memoryCount === 1) {
      return basicPrompts.buildWelcomePrompt(patterns, latestMemory);
    } else if (memoryCount === 5) {
      return basicPrompts.buildEarlyPatternPrompt(patterns);
    } else if (memoryCount === 10) {
      return basicPrompts.buildDeeperAnalysisPrompt(patterns);
    } else if (memoryCount >= 15) {
      return ultimateInsight.buildUltimateAdaptiveInsight(memoryCount, patterns);
    }
  }
}

// Export singleton instance
module.exports = new PromptBuilder();