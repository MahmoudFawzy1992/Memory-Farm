const Memory = require('../../models/Memory');
const User = require('../../models/User');
const Insight = require('../../models/Insight');
const aiInsightService = require('../aiInsightService');
const contentAnalysisService = require('../contentAnalysisService');
const promptBuilder = require('../../utils/promptBuilder');
const insightMetadata = require('./insightMetadata');
const staticFallback = require('./staticFallback');

/**
 * Insight Generator - Core generation and regeneration logic
 */

class InsightGenerator {
  
  /**
   * Generate insight for user
   */
  static async generateInsightForUser(userId, memoryCount, latestMemoryId) {
    try {
      // Check if insight already exists for this memory count
      const existingInsight = await Insight.hasRecentInsight(userId, memoryCount);
      if (existingInsight) {
        console.log(`✓ Insight already exists for memory #${memoryCount}`);
        return existingInsight;
      }

      // Get user preferences
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found:', userId);
        return null;
      }

      const shouldReceive = user.shouldReceiveInsight(memoryCount);
      if (!shouldReceive) {
        console.log(`⭐️ User not eligible for insight at memory #${memoryCount}`);
        return null;
      }

      // Get latest memory data for context
      const latestMemory = latestMemoryId 
        ? await Memory.findById(latestMemoryId).lean()
        : null;

      console.log(`\n🎯 Generating insight for user ${userId} at memory #${memoryCount}`);

      // STEP 1: Analyze user patterns
      console.log('📊 Analyzing user patterns...');
      const patterns = await contentAnalysisService.analyzeUserPatterns(userId, memoryCount);

      // STEP 2: Try AI insight generation
      const { insightText, aiModel, aiMetadata } = await this.tryAIGeneration(
        memoryCount, 
        patterns, 
        latestMemory
      );

      // STEP 3: Determine insight metadata
      const metadata = insightMetadata.determineInsightMetadata(memoryCount, patterns);

      // STEP 4: Create and save insight
      const insight = new Insight({
        userId,
        triggerMemoryCount: memoryCount,
        triggerMemoryId: latestMemoryId,
        patternData: {
          dominantEmotion: patterns.dominantEmotion,
          emotionCount: patterns.totalMemories,
          averageWordCount: patterns.avgWordCount,
          streakDays: patterns.currentStreak,
          emotionDiversity: patterns.emotionDiversity,
          contentComplexity: patterns.contentQuality,
          analysisTimeRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date()
          }
        },
        ...metadata,
        message: insightText,
        aiMetadata: aiMetadata,
        isAIGenerated: aiModel !== 'static'
      });

      await insight.save();
      console.log(`✅ Insight saved successfully (${aiModel})`);

      // STEP 5: Update user tracking
      await this.updateUserTracking(user, patterns, aiModel, aiMetadata);

      console.log(`📊 User stats updated\n`);

      return insight;

    } catch (error) {
      console.error('❌ Critical error generating insight:', error);
      return null;
    }
  }

  /**
   * Try AI generation with fallback
   */
  static async tryAIGeneration(memoryCount, patterns, latestMemory) {
    let insightText = null;
    let aiModel = 'static';
    let aiMetadata = {
      model: 'static',
      tokensUsed: 0,
      cost: 0,
      generationTime: 0,
      wordCount: 0,
      truncated: false,
      fallbackReason: null
    };

    try {
      // Build AI prompt
      console.log('🤖 Building AI prompt...');
      const prompt = promptBuilder.buildPrompt(memoryCount, patterns, latestMemory);
      
      // Try AI generation
      console.log('🚀 Attempting AI generation...');
      const aiResult = await aiInsightService.generateInsight(prompt, memoryCount);
      
      insightText = aiResult.text;
      aiModel = aiResult.model;
      aiMetadata = {
        model: aiResult.model,
        tokensUsed: aiResult.tokensUsed || 0,
        inputTokens: aiResult.inputTokens || 0,
        outputTokens: aiResult.outputTokens || 0,
        cost: aiResult.cost || 0,
        generationTime: aiResult.generationTime || 0,
        wordCount: aiResult.wordCount || 0,
        truncated: aiResult.truncated || false,
        fallbackReason: aiResult.fallbackReason || null
      };

      console.log(`✅ AI generated insight using ${aiModel}`);

    } catch (aiError) {
      // AI failed - use static fallback
      console.warn('⚠️ All AI models failed, using static fallback:', aiError.message);
      
      const staticInsight = staticFallback.generateStaticInsight(memoryCount, patterns);
      insightText = staticInsight.message;
      aiModel = 'static';
      aiMetadata.fallbackReason = `AI failure: ${aiError.message.substring(0, 100)}`;
    }

    return { insightText, aiModel, aiMetadata };
  }

  /**
   * Update user tracking after insight generation
   */
  static async updateUserTracking(user, patterns, aiModel, aiMetadata) {
    await user.updatePatternCache(patterns);
    user.insightsPreferences.lastNotificationAt = new Date();
    user.insightsPreferences.notificationCount += 1;
    
    // Track AI usage
    await user.trackAIUsage(
      aiModel,
      aiMetadata.tokensUsed || 0,
      aiMetadata.cost || 0
    );
  }

  /**
   * Regenerate an existing insight
   */
  static async regenerateInsight(insightId, userId) {
    try {
      console.log(`\n🔄 Regenerating insight ${insightId}`);

      // Get existing insight
      const existingInsight = await Insight.findOne({ _id: insightId, userId });
      if (!existingInsight) {
        console.error('Insight not found');
        return null;
      }

      // Check regenerate limit
      if (!existingInsight.canRegenerate()) {
        console.error('Regenerate limit reached (3/3)');
        return null;
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found');
        return null;
      }

      const memoryCount = existingInsight.triggerMemoryCount;
      const originalModel = existingInsight.aiMetadata?.model || 'static';

      console.log(`📊 Original insight generated by: ${originalModel}`);

      // Get latest memory for context
      const latestMemory = existingInsight.triggerMemoryId
        ? await Memory.findById(existingInsight.triggerMemoryId).lean()
        : null;

      // Re-analyze patterns
      console.log('📊 Re-analyzing user patterns...');
      const patterns = await contentAnalysisService.analyzeUserPatterns(userId, memoryCount);

      // Try regeneration with AI
      const { insightText, aiModel, aiMetadata } = await this.tryAIRegeneration(
        memoryCount,
        patterns,
        latestMemory,
        originalModel
      );

      // Update existing insight
      existingInsight.message = insightText;
      existingInsight.aiMetadata = {
        ...aiMetadata,
        regenerateCount: (existingInsight.aiMetadata?.regenerateCount || 0) + 1
      };
      existingInsight.isAIGenerated = aiModel !== 'static';

      await existingInsight.save();

      // Track AI usage
      if (aiModel !== 'static') {
        await user.trackAIUsage(
          aiModel,
          aiMetadata.tokensUsed || 0,
          aiMetadata.cost || 0
        );
      }

      console.log(`✅ Insight regenerated successfully (${aiModel})\n`);

      return existingInsight;

    } catch (error) {
      console.error('❌ Error regenerating insight:', error);
      return null;
    }
  }

  /**
   * Try AI regeneration with fallback
   */
  static async tryAIRegeneration(memoryCount, patterns, latestMemory, originalModel) {
    let insightText = null;
    let aiModel = 'static';
    let aiMetadata = {
      model: 'static',
      tokensUsed: 0,
      cost: 0,
      generationTime: 0,
      wordCount: 0,
      truncated: false,
      fallbackReason: null
    };

    try {
      // Build new prompt
      console.log('🤖 Building new AI prompt...');
      const prompt = promptBuilder.buildPrompt(memoryCount, patterns, latestMemory);
      
      // Try regeneration
      console.log(`🚀 Attempting regeneration (prefer ${originalModel})...`);
      const aiResult = await aiInsightService.regenerateInsight(
        prompt,
        memoryCount,
        originalModel
      );
      
      insightText = aiResult.text;
      aiModel = aiResult.model;
      aiMetadata = {
        model: aiResult.model,
        tokensUsed: aiResult.tokensUsed || 0,
        inputTokens: aiResult.inputTokens || 0,
        outputTokens: aiResult.outputTokens || 0,
        cost: aiResult.cost || 0,
        generationTime: aiResult.generationTime || 0,
        wordCount: aiResult.wordCount || 0,
        truncated: aiResult.truncated || false,
        fallbackReason: aiResult.fallbackReason || null
      };

      console.log(`✅ Regenerated using ${aiModel}`);

    } catch (aiError) {
      console.warn('⚠️ AI regeneration failed, using static fallback');
      
      const staticInsight = staticFallback.generateStaticInsight(memoryCount, patterns);
      insightText = staticInsight.message;
      aiModel = 'static';
      aiMetadata.fallbackReason = `Regen AI failure: ${aiError.message.substring(0, 100)}`;
    }

    return { insightText, aiModel, aiMetadata };
  }
}

module.exports = InsightGenerator;