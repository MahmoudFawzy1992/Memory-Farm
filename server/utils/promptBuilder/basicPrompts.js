/**
 * Basic Prompts - Welcome and Early Stage Insights
 * Handles memories 1, 5, and 10
 */

class BasicPrompts {
  /**
   * Memory #1: Warm welcome (60-80 words)
   */
  buildWelcomePrompt(patterns, latestMemory) {
    const title = latestMemory?.title || 'their first memory';
    const emotion = patterns.dominantEmotion || 'thoughtful';

    return `Welcome someone's first memory journal entry.

Memory: "${title}"
Emotion: ${emotion}

Write 60-80 words welcoming them warmly. Celebrate this first step, acknowledge what they captured, and mention you'll notice patterns as they continue. Be genuine, not generic. Use 3-4 sentences.`;
  }

  /**
   * Memory #5: Early patterns (80-100 words)
   */
  buildEarlyPatternPrompt(patterns) {
    const dominant = patterns.dominantEmotion;
    const count = patterns.emotionBreakdown[dominant]?.count || 0;
    const style = patterns.writingStyle;

    const recentEmotions = patterns.recentMemories
      .slice(0, 4)
      .map(m => m.emotion)
      .filter(Boolean)
      .join(', ');

    return `User created 5 memories. Early patterns emerging.

Recent emotions: ${recentEmotions}
Most common: "${dominant}" (${count} times)
Style: ${style}

Write 80-100 words noting ONE specific early pattern. Acknowledge the milestone and encourage exploration. Be specific with evidence. Use 4-5 sentences.`;
  }

  /**
   * Memory #10: Deeper analysis (100-130 words)
   */
  buildDeeperAnalysisPrompt(patterns) {
    const dominant = patterns.dominantEmotion;
    const diversity = patterns.emotionDiversity;
    const avgWords = patterns.avgWordCount;
    const style = patterns.writingStyle;
    const themes = patterns.topThemes.slice(0, 3).join(', ');
    const streak = patterns.currentStreak;

    const recentEmotions = patterns.recentMemories
      .slice(0, 5)
      .map(m => m.emotion)
      .filter(Boolean)
      .join(', ');

    return `User has 10 memories. Clear patterns visible.

Recent emotions: ${recentEmotions}
Dominant: "${dominant}" (${diversity} emotions total)
Style: ${style}, ${avgWords} words avg
Themes: ${themes}${streak > 1 ? `\nStreak: ${streak} days` : ''}

Write 100-130 words identifying a meaningful pattern with evidence. Connect it to self-understanding. Be observant and curious, not prescriptive. Use 5-6 sentences.`;
  }
}

module.exports = new BasicPrompts();