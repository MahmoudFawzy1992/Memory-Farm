/**
 * Context Builder - Builds contextual understanding and empathy modes
 */

class ContextBuilder {
  /**
   * Build context depth based on memory count
   */
  buildContextDepth(memoryCount, days) {
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (memoryCount >= 100) {
      return `You've witnessed ${memoryCount} memories over ${months} months. You know their cycles, triggers, growth patterns, and vulnerabilities deeply. You've seen them at their best and worst.`;
    } else if (memoryCount >= 50) {
      return `You've observed ${memoryCount} memories over ${weeks} weeks. You understand their emotional landscape, patterns, and how they process life. You've earned deep insight into who they are.`;
    } else if (memoryCount >= 30) {
      return `You've tracked ${memoryCount} memories over ${days} days. Clear patterns and cycles are visible. You're seeing the real them—not just snapshots, but the story.`;
    } else if (memoryCount >= 20) {
      return `You've followed ${memoryCount} memories over ${days} days. Patterns are solidifying. You understand their emotional baseline and what shifts them.`;
    } else {
      return `You've observed ${memoryCount} memories over ${days} days. Early patterns are clear and you're building meaningful understanding.`;
    }
  }

  /**
   * Build emotional landscape
   */
  buildEmotionalLandscape(patterns) {
    const topEmotions = Object.entries(patterns.emotionBreakdown)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([emotion, data]) => `${emotion} ${data.percentage}%`)
      .join(', ');
    
    const recentJourney = patterns.recentMemories
      .slice(0, 5)
      .map(m => m.emotion)
      .filter(Boolean)
      .join(' → ');

    const familyTrends = patterns.emotionFamilyDistribution 
      ? Object.entries(patterns.emotionFamilyDistribution)
          .sort((a, b) => b[1].percentage - a[1].percentage)
          .slice(0, 3)
          .map(([family, data]) => `${family} ${data.percentage}%`)
          .join(', ')
      : '';

    const shift = patterns.emotionalShift;

    return `EMOTIONAL LANDSCAPE:
Recent path: ${recentJourney}
Overall: ${topEmotions}
${familyTrends ? `Families: ${familyTrends}` : ''}
Shift: ${shift}`;
  }

  /**
   * Detect current emotional state
   */
  detectEmotionalState(patterns) {
    if (!patterns.recentMemories || patterns.recentMemories.length === 0) {
      return 'neutral';
    }

    const recentEmotions = patterns.recentMemories
      .slice(0, 3)
      .map(m => m.emotion)
      .filter(Boolean);

    const positiveCount = recentEmotions.filter(e => 
      /happy|joy|content|excit|love|grateful|calm|peace/i.test(e)
    ).length;

    const negativeCount = recentEmotions.filter(e => 
      /anxious|sad|angry|frustrat|worry|stress|overwhelm/i.test(e)
    ).length;

    if (negativeCount >= 2) return 'struggling';
    if (positiveCount >= 2) return 'thriving';
    return 'mixed';
  }

  /**
   * Build empathy guidance based on emotional state
   */
  buildEmpathyGuidance(emotionalState) {
    if (emotionalState === 'struggling') {
      return `EMPATHY MODE:
They're in pain. Meet them with compassion, not solutions. Validate what they're feeling. Don't rush to fix—just see them. Ask what they need, don't prescribe what they should do.`;
    } else if (emotionalState === 'thriving') {
      return `CELEBRATION MODE:
They're doing well. Help them see WHY so they can replicate it. Don't diminish their joy or warn about future struggles. Let them enjoy this moment fully.`;
    } else {
      return `CURIOSITY MODE:
Mixed emotions—they're processing life's complexity. Be curious about what they're navigating. Ask questions that help them understand themselves, not judge themselves.`;
    }
  }
}

module.exports = new ContextBuilder();