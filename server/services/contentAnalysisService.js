const Memory = require('../models/Memory');
const {
  calculateStreaks,
  detectEmotionalShift,
  analyzeTemporalPatterns
} = require('../utils/memoryPatternAnalyzer');

const EmotionAnalysis = require('./contentAnalysisService/emotionAnalysis');
const WritingAnalysis = require('./contentAnalysisService/writingAnalysis');
const ThemeAnalysis = require('./contentAnalysisService/themeAnalysis');
const PremiumAnalysis = require('./contentAnalysisService/premiumAnalysis');

/**
 * Content Analysis Service - PREMIUM ENHANCED VERSION
 * 
 * Provides deep psychological analysis of user's memory patterns.
 * This feeds the premium AI prompt builder with rich, meaningful context.
 */

class ContentAnalysisService {
  
  /**
   * Main analysis function - builds comprehensive user profile
   */
  async analyzeUserPatterns(userId, memoryCount) {
    try {
      // Fetch ALL user memories with title for complete analysis
      const memories = await Memory.find({ userId })
        .select('title emotion emotionFamily extractedText content memoryDate hasImages contentComplexity createdAt')
        .sort({ createdAt: -1 })
        .lean();

      if (memories.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Get memories since last insight milestone
      const lastInsightMilestone = this.getLastInsightMilestone(memoryCount);
      const memoriesSinceLastInsight = memories.slice(0, memoryCount - lastInsightMilestone);

      // CORE ANALYSES
      const emotionAnalysis = EmotionAnalysis.analyzeEmotions(memories, memoriesSinceLastInsight);
      const writingAnalysis = WritingAnalysis.analyzeWritingStyle(memories);
      const themeAnalysis = ThemeAnalysis.analyzeThemes(memories);
      const temporalAnalysis = analyzeTemporalPatterns(memories);
      const emotionalShift = detectEmotionalShift(memories, memoriesSinceLastInsight);
      const streakData = calculateStreaks(memories);

      // PREMIUM ANALYSES
      const writingEvolution = WritingAnalysis.analyzeWritingEvolution(memories, memoryCount);
      const silenceDetection = PremiumAnalysis.detectSilences(memories);
      const emotionalVelocity = EmotionAnalysis.calculateEmotionalVelocity(memories);
      const qualityTrend = WritingAnalysis.analyzeQualityTrend(memories);
      const pastVsPresent = PremiumAnalysis.comparePastVsPresent(memories, memoryCount);

      return {
        // BASIC INFO
        totalMemories: memories.length,
        recentMemoryCount: memoriesSinceLastInsight.length,
        
        // EMOTION INSIGHTS
        dominantEmotion: emotionAnalysis.dominant,
        emotionBreakdown: emotionAnalysis.breakdown,
        emotionDiversity: emotionAnalysis.diversity,
        emotionFamilyDistribution: emotionAnalysis.familyDistribution,
        emotionalShift: emotionalShift,
        emotionalVelocity: emotionalVelocity,
        
        // WRITING STYLE
        writingStyle: writingAnalysis.style,
        avgWordCount: writingAnalysis.avgWords,
        contentQuality: writingAnalysis.avgQuality,
        writingEvolution: writingEvolution,
        qualityTrend: qualityTrend,
        
        // CONTENT THEMES
        topThemes: themeAnalysis.themes,
        hasImages: themeAnalysis.hasImages,
        imageUsagePercent: themeAnalysis.imagePercent,
        
        // TEMPORAL PATTERNS
        activeTime: temporalAnalysis.activeTime,
        writingFrequency: temporalAnalysis.frequency,
        silenceDetection: silenceDetection,
        
        // STREAKS
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
        
        // RECENT MEMORIES
        recentMemories: PremiumAnalysis.summarizeRecentMemories(memoriesSinceLastInsight),
        
        // PAST VS PRESENT COMPARISON
        pastVsPresent: pastVsPresent,
        
        // METADATA
        analysisDate: new Date(),
        daysSinceFirstMemory: Math.floor(
          (Date.now() - new Date(memories[memories.length - 1].createdAt)) / (1000 * 60 * 60 * 24)
        )
      };

    } catch (error) {
      console.error('Content analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Calculate which memory count triggered the last insight
   */
  getLastInsightMilestone(currentCount) {
    if (currentCount === 1) return 0;
    if (currentCount === 5) return 1;
    if (currentCount === 10) return 5;
    if (currentCount === 15) return 10;
    if (currentCount === 20) return 15;
    if (currentCount === 25) return 20;
    if (currentCount === 30) return 25;
    if (currentCount === 35) return 30;
    if (currentCount === 40) return 35;
    if (currentCount === 45) return 40;
    if (currentCount === 50) return 45;
    
    // For counts above 50, insights are every 5
    if (currentCount > 50 && currentCount % 5 === 0) {
      return currentCount - 5;
    }
    
    return Math.max(0, currentCount - 5);
  }

  /**
   * Default analysis for edge cases
   */
  getDefaultAnalysis() {
    return {
      totalMemories: 0,
      recentMemoryCount: 0,
      dominantEmotion: 'Happy',
      emotionBreakdown: {},
      emotionDiversity: 0,
      emotionFamilyDistribution: {},
      emotionalShift: 'stable',
      emotionalVelocity: { velocity: 'unknown', description: 'Not enough data' },
      writingStyle: 'brief',
      avgWordCount: 0,
      contentQuality: 0,
      writingEvolution: { trend: 'emerging', description: 'Still developing' },
      qualityTrend: { trend: 'emerging', description: 'Still establishing' },
      topThemes: [],
      hasImages: false,
      imageUsagePercent: 0,
      activeTime: 'evening',
      writingFrequency: 'new',
      silenceDetection: { hasSilences: false, longestGap: 0, recentGap: false },
      currentStreak: 0,
      longestStreak: 0,
      recentMemories: [],
      pastVsPresent: { hasComparison: false, message: 'Not enough data' },
      analysisDate: new Date(),
      daysSinceFirstMemory: 0
    };
  }
}

// Export singleton instance
module.exports = new ContentAnalysisService();