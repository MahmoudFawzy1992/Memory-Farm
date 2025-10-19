/**
 * Pattern Analyzers - Memory connections, temporal patterns, and writing evolution
 */

class PatternAnalyzers {
  /**
   * Analyze memory-to-memory connections
   */
  analyzeMemoryConnections(recentMemories) {
    if (!recentMemories || recentMemories.length < 2) {
      return 'Insufficient data for connection analysis';
    }

    // Find emotion transitions
    const transitions = [];
    for (let i = 0; i < recentMemories.length - 1; i++) {
      const current = recentMemories[i];
      const previous = recentMemories[i + 1];
      
      if (current.emotion && previous.emotion && current.emotion !== previous.emotion) {
        transitions.push(`${previous.emotion} → ${current.emotion}`);
      }
    }

    // Find theme connections
    const allThemes = recentMemories
      .flatMap(m => m.themes || [])
      .filter(Boolean);
    
    const themeFreq = {};
    allThemes.forEach(theme => {
      themeFreq[theme] = (themeFreq[theme] || 0) + 1;
    });
    
    const recurringThemes = Object.entries(themeFreq)
      .filter(([_, count]) => count >= 2)
      .map(([theme]) => theme)
      .slice(0, 2);

    let analysis = '';
    
    if (transitions.length > 0) {
      analysis += `Emotion shifts: ${transitions.slice(0, 2).join(', ')}. `;
    }
    
    if (recurringThemes.length > 0) {
      analysis += `Recurring focus: ${recurringThemes.join(', ')}.`;
    }

    return analysis || 'No strong connections detected between recent memories';
  }

  /**
   * Analyze temporal patterns (day of week, time patterns)
   */
  analyzeTemporalPatterns(patterns) {
    const activeTime = patterns.activeTime;
    const frequency = patterns.writingFrequency;
    const streak = patterns.currentStreak;
    const longest = patterns.longestStreak;

    let insights = [];

    // Time of day pattern
    if (activeTime === 'night' || activeTime === 'evening') {
      insights.push(`Writes at ${activeTime} (processing day's events)`);
    } else if (activeTime === 'morning') {
      insights.push(`Writes in morning (setting intentions)`);
    }

    // Frequency pattern
    if (frequency === 'daily') {
      insights.push('Daily journaler (high commitment)');
    } else if (frequency === 'occasional') {
      insights.push('Sporadic journaling (writes when needed)');
    }

    // Streak analysis
    if (streak >= 7) {
      insights.push(`Strong ${streak}-day streak!`);
    } else if (streak === 1 && longest > 7) {
      insights.push(`Streak broke (was ${longest} days)`);
    }

    return insights.join('. ') || 'Still establishing patterns';
  }

  /**
   * Analyze writing evolution over time
   */
  analyzeWritingEvolution(patterns, memoryCount) {
    const avgWords = patterns.avgWordCount;
    const style = patterns.writingStyle;
    const quality = patterns.contentQuality || 0;

    // Calculate if they're writing more/less over time
    // We compare recent memories vs overall average
    const recentAvgWords = patterns.recentMemories
      .filter(m => m.wordCount > 0)
      .reduce((sum, m) => sum + m.wordCount, 0) / Math.max(patterns.recentMemories.length, 1);

    const wordChange = recentAvgWords - avgWords;
    
    let evolution = `Style: ${style} (${Math.round(avgWords)} words avg, quality ${quality}/100). `;

    if (wordChange > 15) {
      evolution += `Recently writing MORE (${Math.round(recentAvgWords)} words vs ${Math.round(avgWords)} avg). Going deeper.`;
    } else if (wordChange < -15) {
      evolution += `Recently writing LESS (${Math.round(recentAvgWords)} words vs ${Math.round(avgWords)} avg). More surface-level or stressed?`;
    } else {
      evolution += 'Consistent expression style.';
    }

    return evolution;
  }
}

module.exports = new PatternAnalyzers();