const { categorizeEmotion } = require('../../utils/memoryPatternAnalyzer');

/**
 * Emotion Analysis - Emotions, families, velocity, shifts
 */

class EmotionAnalysis {
  
  /**
   * Analyze emotions - ALL emotions with trends
   */
  static analyzeEmotions(allMemories, recentMemories) {
    const emotions = allMemories
      .map(m => m.emotion ? m.emotion.replace(/^\p{Emoji}+/u, '').trim() : null)
      .filter(Boolean);

    if (emotions.length === 0) {
      return {
        dominant: 'Happy',
        breakdown: {},
        diversity: 0,
        familyDistribution: {}
      };
    }

    // Count each specific emotion
    const emotionCounts = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Find dominant emotion
    const dominant = Object.keys(emotionCounts)
      .sort((a, b) => emotionCounts[b] - emotionCounts[a])[0];

    // Build detailed breakdown with trends
    const breakdown = {};
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      const recentCount = recentMemories.filter(m => 
        m.emotion && m.emotion.replace(/^\p{Emoji}+/u, '').trim() === emotion
      ).length;

      breakdown[emotion] = {
        count,
        percentage: Math.round((count / emotions.length) * 100),
        recentCount,
        trend: recentCount > (count / allMemories.length * recentMemories.length) ? 'increasing' : 'stable'
      };
    }

    // Categorize by emotion families
    const familyCounts = {};
    allMemories.forEach(m => {
      const family = categorizeEmotion(m.emotion);
      if (family !== 'neutral' && family !== 'other') {
        familyCounts[family] = (familyCounts[family] || 0) + 1;
      }
    });

    const familyDistribution = {};
    for (const [family, count] of Object.entries(familyCounts)) {
      familyDistribution[family] = {
        count,
        percentage: Math.round((count / allMemories.length) * 100)
      };
    }

    return {
      dominant,
      breakdown,
      diversity: Object.keys(emotionCounts).length,
      familyDistribution
    };
  }

  /**
   * Calculate emotional velocity (how fast emotions change)
   */
  static calculateEmotionalVelocity(memories) {
    if (memories.length < 5) {
      return {
        velocity: 'unknown',
        description: 'Not enough data'
      };
    }

    // Count emotion changes in recent memories
    const recentMemories = memories.slice(0, 10);
    let changes = 0;

    for (let i = 0; i < recentMemories.length - 1; i++) {
      const current = recentMemories[i].emotion?.replace(/^\p{Emoji}+/u, '').trim();
      const next = recentMemories[i + 1].emotion?.replace(/^\p{Emoji}+/u, '').trim();
      
      if (current && next && current !== next) {
        changes++;
      }
    }

    const changeRate = changes / (recentMemories.length - 1);

    let velocity;
    let description;

    if (changeRate > 0.7) {
      velocity = 'rapid';
      description = 'Emotions shift rapidly between entries';
    } else if (changeRate > 0.4) {
      velocity = 'moderate';
      description = 'Emotions fluctuate regularly';
    } else if (changeRate > 0.2) {
      velocity = 'slow';
      description = 'Emotions change gradually';
    } else {
      velocity = 'stable';
      description = 'Emotions remain consistent';
    }

    return {
      velocity,
      description,
      changeRate: Math.round(changeRate * 100)
    };
  }
}

module.exports = EmotionAnalysis;