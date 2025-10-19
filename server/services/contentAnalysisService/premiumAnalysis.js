const textQualityAnalyzer = require('../../utils/textQuality');
const { categorizeEmotion } = require('../../utils/memoryPatternAnalyzer');

/**
 * Premium Analysis - Silences, past vs present, recent summaries
 */

class PremiumAnalysis {
  
  /**
   * Detect silences/gaps in journaling
   */
  static detectSilences(memories) {
    if (memories.length < 3) {
      return {
        hasSilences: false,
        longestGap: 0,
        recentGap: false
      };
    }

    // Calculate gaps between memories (in days)
    const gaps = [];
    for (let i = 0; i < memories.length - 1; i++) {
      const current = new Date(memories[i].createdAt);
      const next = new Date(memories[i + 1].createdAt);
      const gapDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      
      if (gapDays > 2) { // Only count gaps > 2 days
        gaps.push({
          days: gapDays,
          beforeMemory: memories[i + 1], // Memory before the gap
          afterMemory: memories[i], // Memory after the gap
          index: i
        });
      }
    }

    if (gaps.length === 0) {
      return {
        hasSilences: false,
        longestGap: 0,
        recentGap: false
      };
    }

    // Find longest gap
    const longestGap = gaps.sort((a, b) => b.days - a.days)[0];
    
    // Check if there's a recent gap (in last 5 memories)
    const recentGap = gaps.some(g => g.index < 5);

    return {
      hasSilences: true,
      longestGap: longestGap.days,
      longestGapDetails: {
        days: longestGap.days,
        beforeEmotion: longestGap.beforeMemory.emotion?.replace(/^\p{Emoji}+/u, '').trim(),
        afterEmotion: longestGap.afterMemory.emotion?.replace(/^\p{Emoji}+/u, '').trim()
      },
      recentGap
    };
  }

  /**
   * Compare past self to present self
   */
  static comparePastVsPresent(memories, memoryCount) {
    if (memoryCount < 15) {
      return {
        hasComparison: false,
        message: 'Not enough memories for comparison yet'
      };
    }

    // Split into past (first half) vs present (second half)
    const splitPoint = Math.floor(memories.length / 2);
    const pastMemories = memories.slice(splitPoint);
    const presentMemories = memories.slice(0, splitPoint);

    // Compare emotions
    const getEmotionProfile = (mems) => {
      const emotions = mems
        .map(m => m.emotion?.replace(/^\p{Emoji}+/u, '').trim())
        .filter(Boolean);
      
      const positive = emotions.filter(e => 
        /happy|joy|content|excit|love|grateful|calm|peace/i.test(e)
      ).length;
      
      const negative = emotions.filter(e => 
        /anxious|sad|angry|frustrat|worry|stress|overwhelm|disappoint/i.test(e)
      ).length;
      
      return {
        positive: (positive / emotions.length) * 100,
        negative: (negative / emotions.length) * 100,
        total: emotions.length
      };
    };

    const pastProfile = getEmotionProfile(pastMemories);
    const presentProfile = getEmotionProfile(presentMemories);

    // Calculate shifts
    const positiveShift = presentProfile.positive - pastProfile.positive;
    const negativeShift = presentProfile.negative - pastProfile.negative;

    // Compare writing depth
    const getAvgWords = (mems) => {
      const texts = mems
        .map(m => `${m.title || ''} ${m.extractedText || ''}`.trim())
        .filter(t => t.length > 0);
      
      if (texts.length === 0) return 0;
      
      const wordCounts = texts.map(t => t.split(/\s+/).length);
      return wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    };

    const pastWords = getAvgWords(pastMemories);
    const presentWords = getAvgWords(presentMemories);
    const wordShift = presentWords - pastWords;

    // Build comparison message
    let emotionalMessage = '';
    if (positiveShift > 15) {
      emotionalMessage = 'More positive emotions recently';
    } else if (negativeShift > 15) {
      emotionalMessage = 'More challenging emotions recently';
    } else {
      emotionalMessage = 'Emotional balance remains similar';
    }

    let writingMessage = '';
    if (wordShift > 20) {
      writingMessage = 'Writing deeper now';
    } else if (wordShift < -20) {
      writingMessage = 'Writing more concisely now';
    } else {
      writingMessage = 'Writing depth consistent';
    }

    return {
      hasComparison: true,
      emotionalShift: {
        message: emotionalMessage,
        pastPositive: Math.round(pastProfile.positive),
        presentPositive: Math.round(presentProfile.positive),
        change: Math.round(positiveShift)
      },
      writingShift: {
        message: writingMessage,
        pastAvgWords: Math.round(pastWords),
        presentAvgWords: Math.round(presentWords),
        change: Math.round(wordShift)
      }
    };
  }

  /**
   * Summarize recent memories with detail
   */
  static summarizeRecentMemories(recentMemories) {
    return recentMemories.slice(0, 5).map(m => {
      // Combine title + text
      const title = m.title || '';
      const text = m.extractedText || '';
      const fullContent = `${title}. ${text}`.trim();
      
      const quality = textQualityAnalyzer.calculateQualityScore(fullContent);
      
      // Create summary
      let summary = null;
      if (fullContent.length > 20) {
        const words = fullContent.split(/\s+/);
        if (words.length > 20) {
          summary = words.slice(0, 20).join(' ') + '...';
        } else {
          summary = fullContent;
        }
      } else if (title) {
        summary = title;
      }

      // Extract emotion
      const cleanEmotion = m.emotion 
        ? m.emotion.replace(/^\p{Emoji}+/u, '').trim() 
        : null;

      // Get emotion family
      const emotionFamily = categorizeEmotion(m.emotion);

      // Extract themes
      const themes = fullContent.length > 10 
        ? textQualityAnalyzer.extractKeywords(fullContent, 3)
        : [];

      return {
        title: title,
        summary,
        emotion: cleanEmotion,
        emotionFamily,
        themes,
        quality,
        hasText: fullContent.length > 10,
        hasImages: m.hasImages || false,
        wordCount: fullContent.split(/\s+/).filter(w => w.length > 0).length,
        createdDaysAgo: Math.floor(
          (Date.now() - new Date(m.createdAt)) / (1000 * 60 * 60 * 24)
        )
      };
    }).filter(m => m.hasText || m.emotion);
  }
}

module.exports = PremiumAnalysis;