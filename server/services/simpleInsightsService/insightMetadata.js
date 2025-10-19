/**
 * Insight Metadata - Determines type, category, icon, color, priority
 */

class InsightMetadata {
  
  static determineInsightMetadata(memoryCount, patterns) {
    if (memoryCount === 1) {
      return {
        type: 'milestone',
        category: 'achievement',
        title: 'Welcome to Your Memory Journey! 🌸',
        icon: '🌱',
        color: '#10B981',
        priority: 5
      };
    }

    if (memoryCount === 5) {
      return {
        type: 'emotion_pattern',
        category: 'discovery',
        title: "I'm Starting to See Your Style! ✨",
        icon: '🎭',
        color: '#8B5CF6',
        priority: 4
      };
    }

    if (memoryCount === 10) {
      return {
        type: 'writing_pattern',
        category: 'discovery',
        title: 'Your Writing Style is Emerging! 📝',
        icon: '✍️',
        color: '#F59E0B',
        priority: 4
      };
    }

    if (memoryCount === 15) {
      return {
        type: 'diversity',
        category: 'discovery',
        title: 'Your Emotional Range is Growing! 🌈',
        icon: '🎨',
        color: '#EC4899',
        priority: 3
      };
    }

    if (memoryCount === 25) {
      return {
        type: 'consistency',
        category: 'encouragement',
        title: 'Quarter Century of Memories! 🎉',
        icon: '🏆',
        color: '#10B981',
        priority: 4
      };
    }

    if (memoryCount === 50) {
      return {
        type: 'milestone',
        category: 'achievement',
        title: 'Half a Hundred Memories! 🎊',
        icon: '🌟',
        color: '#8B5CF6',
        priority: 5
      };
    }

    if (memoryCount === 100) {
      return {
        type: 'milestone',
        category: 'achievement',
        title: 'Century Club Member! 💯',
        icon: '💯',
        color: '#F43F5E',
        priority: 5
      };
    }

    if (patterns.currentStreak >= 7) {
      return {
        type: 'streak',
        category: 'encouragement',
        title: 'Incredible Consistency! 🔥',
        icon: '🔥',
        color: '#EF4444',
        priority: 4
      };
    }

    return {
      type: 'milestone',
      category: 'encouragement',
      title: 'Keep Going Strong! 💪',
      icon: '✨',
      color: '#8B5CF6',
      priority: 3
    };
  }
}

module.exports = InsightMetadata;