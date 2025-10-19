const textQualityAnalyzer = require('../../utils/textQuality');

/**
 * Writing Analysis - Style, evolution, quality trends
 */

class WritingAnalysis {
  
  /**
   * Analyze writing style
   */
  static analyzeWritingStyle(memories) {
    const textsWithWords = memories
      .map(m => {
        // Combine title + extracted text for full context
        const title = m.title || '';
        const text = m.extractedText || '';
        return `${title} ${text}`.trim();
      })
      .filter(text => text.length > 10);

    if (textsWithWords.length === 0) {
      return {
        style: 'brief',
        avgWords: 0,
        avgQuality: 0
      };
    }

    // Calculate average word count
    const wordCounts = textsWithWords.map(text => 
      text.split(/\s+/).filter(w => w.length > 0).length
    );
    const avgWords = Math.round(
      wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    );

    // Calculate average quality
    const qualityScores = textsWithWords.map(text => 
      textQualityAnalyzer.calculateQualityScore(text)
    );
    const avgQuality = Math.round(
      qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
    );

    // Determine writing style
    let style;
    if (avgWords < 30) {
      style = 'brief';
    } else if (avgWords < 75) {
      style = 'conversational';
    } else if (avgWords < 150) {
      style = 'reflective';
    } else {
      style = 'detailed';
    }

    return {
      style,
      avgWords,
      avgQuality
    };
  }

  /**
   * Analyze writing evolution over time
   */
  static analyzeWritingEvolution(memories, memoryCount) {
    if (memoryCount < 10) {
      return {
        trend: 'emerging',
        description: 'Still developing writing patterns'
      };
    }

    // Split memories into early vs recent
    const splitPoint = Math.floor(memories.length / 2);
    const earlyMemories = memories.slice(splitPoint);
    const recentMemories = memories.slice(0, splitPoint);

    // Calculate average words for each period
    const calculateAvg = (mems) => {
      const texts = mems
        .map(m => `${m.title || ''} ${m.extractedText || ''}`.trim())
        .filter(t => t.length > 0);
      
      if (texts.length === 0) return 0;
      
      const wordCounts = texts.map(t => t.split(/\s+/).length);
      return wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    };

    const earlyAvg = calculateAvg(earlyMemories);
    const recentAvg = calculateAvg(recentMemories);
    const change = recentAvg - earlyAvg;

    let trend;
    let description;

    if (change > 20) {
      trend = 'deepening';
      description = `Writing getting deeper (${Math.round(earlyAvg)} → ${Math.round(recentAvg)} words)`;
    } else if (change < -20) {
      trend = 'shortening';
      description = `Writing getting briefer (${Math.round(earlyAvg)} → ${Math.round(recentAvg)} words)`;
    } else {
      trend = 'stable';
      description = `Consistent writing depth (~${Math.round(recentAvg)} words)`;
    }

    return {
      trend,
      description,
      earlyAvg: Math.round(earlyAvg),
      recentAvg: Math.round(recentAvg),
      change: Math.round(change)
    };
  }

  /**
   * Analyze quality trend over time
   */
  static analyzeQualityTrend(memories) {
    if (memories.length < 10) {
      return {
        trend: 'emerging',
        description: 'Still establishing quality baseline'
      };
    }

    // Split into early vs recent
    const splitPoint = Math.floor(memories.length / 2);
    const earlyMemories = memories.slice(splitPoint);
    const recentMemories = memories.slice(0, splitPoint);

    const calculateQuality = (mems) => {
      const texts = mems
        .map(m => `${m.title || ''} ${m.extractedText || ''}`.trim())
        .filter(t => t.length > 10);
      
      if (texts.length === 0) return 0;
      
      const qualities = texts.map(t => textQualityAnalyzer.calculateQualityScore(t));
      return qualities.reduce((a, b) => a + b, 0) / qualities.length;
    };

    const earlyQuality = calculateQuality(earlyMemories);
    const recentQuality = calculateQuality(recentMemories);
    const change = recentQuality - earlyQuality;

    let trend;
    let description;

    if (change > 10) {
      trend = 'improving';
      description = `Quality improving (${Math.round(earlyQuality)} → ${Math.round(recentQuality)}/100)`;
    } else if (change < -10) {
      trend = 'declining';
      description = `Quality declining (${Math.round(earlyQuality)} → ${Math.round(recentQuality)}/100)`;
    } else {
      trend = 'stable';
      description = `Consistent quality (~${Math.round(recentQuality)}/100)`;
    }

    return {
      trend,
      description,
      earlyQuality: Math.round(earlyQuality),
      recentQuality: Math.round(recentQuality)
    };
  }
}

module.exports = WritingAnalysis;