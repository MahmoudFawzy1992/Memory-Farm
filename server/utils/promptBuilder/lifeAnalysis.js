/**
 * Life Analysis - Life balance and past self comparison
 */

class LifeAnalysis {
  /**
   * Categorize themes into life areas
   */
  categorizeLifeAreas(topThemes) {
    if (!topThemes || topThemes.length === 0) {
      return 'No clear life areas detected yet';
    }

    // Define life area keywords
    const lifeAreas = {
      work: ['work', 'job', 'career', 'project', 'meeting', 'deadline', 'boss', 'colleague'],
      relationships: ['friend', 'family', 'partner', 'love', 'relationship', 'people', 'social'],
      personal: ['self', 'growth', 'goal', 'reflection', 'think', 'feel', 'understand'],
      health: ['health', 'exercise', 'sleep', 'energy', 'tired', 'body', 'workout'],
      leisure: ['fun', 'hobby', 'game', 'movie', 'book', 'music', 'travel', 'weekend']
    };

    // Count themes per life area
    const areaCounts = {
      work: 0,
      relationships: 0,
      personal: 0,
      health: 0,
      leisure: 0,
      other: 0
    };

    topThemes.forEach(theme => {
      let categorized = false;
      for (const [area, keywords] of Object.entries(lifeAreas)) {
        if (keywords.some(keyword => theme.toLowerCase().includes(keyword))) {
          areaCounts[area]++;
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        areaCounts.other++;
      }
    });

    // Calculate percentages
    const total = topThemes.length;
    const significantAreas = Object.entries(areaCounts)
      .filter(([area, count]) => count > 0 && area !== 'other')
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => `${area} ${Math.round((count/total)*100)}%`)
      .slice(0, 3);

    if (significantAreas.length === 0) {
      return 'Themes don\'t cluster into clear life areas yet';
    }

    // Detect imbalance
    const workPercent = Math.round((areaCounts.work / total) * 100);
    const leisurePercent = Math.round((areaCounts.leisure / total) * 100);
    
    let balance = significantAreas.join(', ');
    
    if (workPercent > 50 && leisurePercent === 0) {
      balance += '. ⚠️ Work dominates—no leisure detected';
    } else if (leisurePercent === 0 && areaCounts.health === 0) {
      balance += '. ⚠️ Self-care missing';
    }

    return balance;
  }

  /**
   * Compare current self to past self
   */
  compareToPastSelf(memoryCount, patterns) {
    if (memoryCount < 15) {
      return 'Not enough data for past comparison yet';
    }

    const recentMemories = patterns.recentMemories.slice(0, 5);
    
    // Get recent emotions
    const recentEmotions = recentMemories.map(m => m.emotion).filter(Boolean);
    const recentPositive = recentEmotions.filter(e => 
      /happy|joy|content|excit|love|grateful/i.test(e)
    ).length;
    const recentNegative = recentEmotions.filter(e =>
      /anxious|sad|angry|frustrat|worry|stress/i.test(e)
    ).length;

    // Compare to overall
    const allEmotions = Object.keys(patterns.emotionBreakdown);
    const overallPositive = allEmotions.filter(e => 
      /happy|joy|content|excit|love|grateful/i.test(e)
    ).length;
    const overallNegative = allEmotions.filter(e => 
      /anxious|sad|angry|frustrat|worry|stress/i.test(e)
    ).length;

    // Calculate trend
    const recentPositivePercent = (recentPositive / recentEmotions.length) * 100;
    const overallPositivePercent = (overallPositive / allEmotions.length) * 100;
    const shift = recentPositivePercent - overallPositivePercent;

    let comparison = '';

    if (shift > 15) {
      comparison = `POSITIVE SHIFT: Recent emotions are lighter than your baseline. Something's improving.`;
    } else if (shift < -15) {
      comparison = `CHALLENGING PERIOD: Recent emotions heavier than usual. You're going through something.`;
    } else {
      comparison = `STABLE: Recent patterns match your baseline. Consistent emotional state.`;
    }

    // Add writing depth comparison
    const recentAvgWords = recentMemories.reduce((sum, m) => sum + (m.wordCount || 0), 0) / recentMemories.length;
    const overallAvgWords = patterns.avgWordCount;
    const wordShift = recentAvgWords - overallAvgWords;

    if (wordShift > 20) {
      comparison += ` Writing deeper now (${Math.round(recentAvgWords)} vs ${Math.round(overallAvgWords)} words).`;
    } else if (wordShift < -20) {
      comparison += ` Writing briefer now (${Math.round(recentAvgWords)} vs ${Math.round(overallAvgWords)} words).`;
    }

    return comparison;
  }
}

module.exports = new LifeAnalysis();