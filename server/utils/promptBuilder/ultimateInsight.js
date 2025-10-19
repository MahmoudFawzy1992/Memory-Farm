/**
 * Ultimate Insight Builder - Memory 15+ premium insights
 */

const contextBuilder = require('./contextBuilder');
const patternAnalyzers = require('./patternAnalyzers');
const lifeAnalysis = require('./lifeAnalysis');

class UltimateInsight {
  /**
   * Build ultimate adaptive insight (Memory 15+)
   * This is where we deploy FULL intelligence
   */
  buildUltimateAdaptiveInsight(memoryCount, patterns) {
    // Build context depth based on memory count
    const contextDepth = contextBuilder.buildContextDepth(
      memoryCount, 
      patterns.daysSinceFirstMemory
    );
    
    // Core emotional data
    const emotionalLandscape = contextBuilder.buildEmotionalLandscape(patterns);
    
    // PREMIUM FEATURE 1: Memory connections
    const memoryConnections = patternAnalyzers.analyzeMemoryConnections(
      patterns.recentMemories
    );
    
    // PREMIUM FEATURE 2: Temporal patterns
    const temporalInsights = patternAnalyzers.analyzeTemporalPatterns(patterns);
    
    // PREMIUM FEATURE 3: Writing evolution
    const writingEvolution = patternAnalyzers.analyzeWritingEvolution(
      patterns, 
      memoryCount
    );
    
    // PREMIUM FEATURE 4: Life area balance
    const lifeAreas = lifeAnalysis.categorizeLifeAreas(patterns.topThemes);
    
    // PREMIUM FEATURE 5: Past self comparison (CRITICAL)
    const pastComparison = lifeAnalysis.compareToPastSelf(memoryCount, patterns);
    
    // PREMIUM FEATURE 6: Contextual empathy
    const emotionalState = contextBuilder.detectEmotionalState(patterns);
    const empathyGuidance = contextBuilder.buildEmpathyGuidance(emotionalState);

    return `${contextDepth}

${emotionalLandscape}

MEMORY CONNECTIONS:
${memoryConnections}

TEMPORAL PATTERNS:
${temporalInsights}

EXPRESSION EVOLUTION:
${writingEvolution}

LIFE BALANCE:
${lifeAreas}

GROWTH TRAJECTORY:
${pastComparison}

${empathyGuidance}

Write 120-150 words that truly land. Be specific, psychologically insightful, warm. Use their data to show you see them. Ask one question they need to hear.`;
  }
}

module.exports = new UltimateInsight();