const Memory = require('../models/Memory');
const User = require('../models/User');
const Insight = require('../models/Insight');
const { getEmotionFamilyKey } = require('../constants/emotionFamilies');
const { 
  startOfDayUTC, 
  addDaysUTC, 
  memoryDateExpr 
} = require('../utils/dateHelpers');

class SimpleInsightsService {
  
  /**
   * Main entry point - analyze patterns and generate insight
   */
  static async generateInsightForUser(userId, memoryCount, latestMemoryId) {
    try {
        console.log(`🔍 Checking insights for user ${userId}, memory count: ${memoryCount}`);

      // Check if insight already exists for this memory count
      const existingInsight = await Insight.hasRecentInsight(userId, memoryCount);
      if (existingInsight) {
              console.log(`✅ Existing insight found for memory count ${memoryCount}`);
        return existingInsight;
      }

      // Get user preferences
      const user = await User.findById(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return null;
      }

      const shouldReceive = user.shouldReceiveInsight(memoryCount);
      console.log(`🎯 Should receive insight: ${shouldReceive}, frequency: ${user.insightsPreferences?.frequency}`);

      if (!shouldReceive) {
        console.log(`❌ User should not receive insight for memory count ${memoryCount}`);
        return null;
      }

      console.log(`🚀 Generating insight for memory count ${memoryCount}`);
      // Analyze patterns based on user's memories
      const patterns = await this.analyzeUserPatterns(userId);
      
      // Generate appropriate insight based on memory count and patterns
      const insightData = this.generateInsightMessage(memoryCount, patterns);
      
      if (!insightData) return null;

      // Create and save insight
      const insight = new Insight({
        userId,
        triggerMemoryCount: memoryCount,
        triggerMemoryId: latestMemoryId,
        patternData: patterns,
        ...insightData
      });

      await insight.save();

      // Update user's pattern cache and notification tracking
      await user.updatePatternCache(patterns);
      user.insightsPreferences.lastNotificationAt = new Date();
      user.insightsPreferences.notificationCount += 1;
      await user.save();

      return insight;
    } catch (error) {
      console.error('Error generating insight:', error);
      return null;
    }
  }

  /**
   * Analyze user's memory patterns using pure JavaScript
   */
  static async analyzeUserPatterns(userId) {
  try {
    // Get ALL user memories for better pattern analysis
    const memories = await Memory.find({ userId })
      .select('emotion emotionFamily extractedText content memoryDate hasImages contentComplexity createdAt')
      .sort({ createdAt: -1 });

    if (memories.length === 0) {
      return this.getDefaultPatterns();
    }

    console.log(`📊 Analyzing ${memories.length} memories for user ${userId}`);

    // Extract and clean emotions properly
    const emotions = memories
      .map(m => {
        if (!m.emotion) return null;
        // Remove emoji and clean the emotion text
        const cleanEmotion = m.emotion.replace(/^\p{Emoji}+/u, '').trim();
        console.log(`🎭 Raw emotion: "${m.emotion}" -> Clean: "${cleanEmotion}"`);
        return cleanEmotion;
      })
      .filter(Boolean);

    console.log(`🎯 Clean emotions found: ${emotions}`);

    // Count emotions accurately
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    console.log(`📈 Emotion counts:`, emotionCounts);

    // Find the most common emotion
    const dominantEmotion = Object.keys(emotionCounts).length > 0
      ? Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0]
      : 'Happy';

    console.log(`👑 Dominant emotion: ${dominantEmotion}`);

    // Calculate writing patterns
    const wordCounts = memories
      .map(m => m.extractedText ? m.extractedText.split(' ').length : 0)
      .filter(count => count > 0);

    const averageWordCount = wordCounts.length > 0 
      ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
      : 0;

    // Day of week analysis
    const dayPattern = this.analyzeDayOfWeekPattern(memories);

    // Calculate streaks
    const streakData = this.calculateMemoryStreaks(memories);

    // Content complexity analysis
    const complexities = memories
      .map(m => m.contentComplexity || 0)
      .filter(c => c > 0);

    const avgComplexity = complexities.length > 0
      ? Math.round((complexities.reduce((a, b) => a + b, 0) / complexities.length) * 10) / 10
      : 0;

    const patterns = {
      totalMemories: memories.length,
      dominantEmotion,
      emotionDiversity: Object.keys(emotionCounts).length,
      averageWordCount,
      contentComplexityAvg: avgComplexity,
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      happiestDay: dayPattern.happiestDay,
      memoryFrequency: this.calculateFrequency(memories),
      hasImages: memories.some(m => m.hasImages),
      imagePercentage: Math.round((memories.filter(m => m.hasImages).length / memories.length) * 100),
      emotionCounts, // Add raw counts for debugging
      analysisTimeRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    };

    console.log(`✅ Final patterns:`, patterns);
    return patterns;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return this.getDefaultPatterns();
  }
}

  /**
   * Generate insight message based on memory count and patterns
   */
  static generateInsightMessage(memoryCount, patterns) {
    // Milestone insights
    if (memoryCount === 1) {
      return {
        type: 'milestone',
        category: 'achievement',
        title: 'Welcome to Your Memory Journey! 🌸',
        message: `You've created your first memory! This is the beginning of something beautiful. I'll learn about your patterns and share insights as you continue writing.`,
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
        message: `After 5 memories, I notice you tend to feel "${patterns.dominantEmotion}" most often. You're building a wonderful collection of moments - keep going!`,
        icon: '🎭',
        color: '#8B5CF6',
        priority: 4
      };
    }

    if (memoryCount === 10) {
      const lengthDescription = patterns.averageWordCount > 100 ? 'detailed' : 
                              patterns.averageWordCount > 50 ? 'thoughtful' : 'concise';
      
      return {
        type: 'writing_pattern',
        category: 'discovery',
        title: 'Your Writing Style is Emerging! 📝',
        message: `You write ${lengthDescription} memories with an average of ${patterns.averageWordCount} words. "${patterns.dominantEmotion}" appears to be your go-to emotion. You're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}!`,
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
        message: `You've explored ${patterns.emotionDiversity} different emotions so far. ${patterns.happiestDay ? `I notice you're often happiest on ${patterns.happiestDay}s - what makes them special?` : 'Your emotional awareness is developing beautifully!'}`,
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
        message: `25 memories and counting! ${patterns.currentStreak > 1 ? `You're on a ${patterns.currentStreak}-day streak.` : ''} Your dominant emotion "${patterns.dominantEmotion}" shows you're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}. Keep capturing these precious moments!`,
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
        message: `50 memories - what an achievement! You've written an average of ${patterns.averageWordCount} words per memory and explored ${patterns.emotionDiversity} different emotions. ${patterns.hasImages ? 'I love how you include images to tell richer stories!' : 'Consider adding images to make your memories even more vivid!'}`,
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
        message: `100 memories - incredible! Your emotional range has grown ${Math.round((patterns.emotionDiversity / 20) * 100)}% since starting. You've created a beautiful tapestry of life moments.`,
        icon: '💯',
        color: '#F43F5E',
        priority: 5
      };
    }

    // Default pattern-based insights for other memory counts
    if (memoryCount % 10 === 0) {
      if (patterns.currentStreak >= 7) {
        return {
          type: 'streak',
          category: 'encouragement',
          title: 'Incredible Consistency! 🔥',
          message: `${patterns.currentStreak} days in a row! You're building an amazing habit. Your dedication to capturing memories is inspiring.`,
          icon: '🔥',
          color: '#EF4444',
          priority: 4
        };
      }

      if (patterns.contentComplexityAvg > 5) {
        return {
          type: 'complexity',
          category: 'discovery',
          title: 'Rich Storytelling Detected! 📖',
          message: `Your memories are becoming more detailed and complex (complexity score: ${patterns.contentComplexityAvg}). You're becoming a master storyteller!`,
          icon: '📚',
          color: '#3B82F6',
          priority: 3
        };
      }
    }

    // Fallback insight
    return {
      type: 'milestone',
      category: 'encouragement',
      title: 'Keep Going Strong! 💪',
      message: `${memoryCount} memories and counting! Your journey of self-reflection continues to grow. "${patterns.dominantEmotion}" remains your most common emotion - you're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}!`,
      icon: '✨',
      color: '#8B5CF6',
      priority: 3
    };
  }

  /**
   * Helper methods for pattern analysis
   */
  static analyzeDayOfWeekPattern(memories) {
    const dayScores = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    memories.forEach(memory => {
      const date = memory.memoryDate || memory.createdAt;
      const dayIndex = date.getDay();
      const dayName = days[dayIndex];
      
      // Score based on positive emotions (simplified)
      const isPositive = memory.emotion && 
        /(happy|joy|excited|love|content|bliss|cheerful)/i.test(memory.emotion);
      
      if (!dayScores[dayName]) dayScores[dayName] = { positive: 0, total: 0 };
      dayScores[dayName].total += 1;
      if (isPositive) dayScores[dayName].positive += 1;
    });

    const happiestDay = Object.keys(dayScores)
      .sort((a, b) => (dayScores[b].positive / dayScores[b].total) - 
                     (dayScores[a].positive / dayScores[a].total))[0];

    return { happiestDay };
  }

  static calculateMemoryStreaks(memories) {
    if (memories.length === 0) return { current: 0, longest: 0 };

    // Sort by date
    const sortedDates = memories
      .map(m => startOfDayUTC(m.memoryDate || m.createdAt))
      .sort((a, b) => b - a); // Newest first

    const uniqueDates = [...new Set(sortedDates.map(d => d.getTime()))];
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate current streak from today
    const today = startOfDayUTC(new Date());
    const yesterday = addDaysUTC(today, -1);

    if (uniqueDates.some(date => date >= today.getTime())) {
      currentStreak = 1;
      // Check consecutive days backwards
      for (let i = 1; i < uniqueDates.length; i++) {
        const expectedDate = addDaysUTC(today, -i);
        if (uniqueDates.some(date => Math.abs(date - expectedDate.getTime()) < 86400000)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (uniqueDates.some(date => date >= yesterday.getTime())) {
      currentStreak = 1;
      // Check consecutive days backwards from yesterday
      for (let i = 2; i < uniqueDates.length; i++) {
        const expectedDate = addDaysUTC(today, -i);
        if (uniqueDates.some(date => Math.abs(date - expectedDate.getTime()) < 86400000)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const daysDiff = Math.round((uniqueDates[i-1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  static calculateFrequency(memories) {
    if (memories.length < 2) return 'new';
    
    const days = Math.round((Date.now() - memories[memories.length - 1].createdAt) / (1000 * 60 * 60 * 24));
    const frequency = memories.length / Math.max(days, 1);
    
    if (frequency >= 1) return 'daily';
    if (frequency >= 0.5) return 'frequent';
    if (frequency >= 0.2) return 'regular';
    return 'occasional';
  }

  static getTraitFromEmotion(emotion) {
    const traits = {
      'Happy': 'optimistic',
      'Joyful': 'vibrant',
      'Excited': 'energetic',
      'Content': 'peaceful',
      'Love': 'caring',
      'Grateful': 'appreciative',
      'Calm': 'balanced',
      'Thoughtful': 'reflective',
      'Curious': 'inquisitive',
      'Inspired': 'creative'
    };
    return traits[emotion] || 'unique';
  }

  static getDefaultPatterns() {
    return {
      totalMemories: 0,
      dominantEmotion: 'Happy',
      emotionDiversity: 1,
      averageWordCount: 0,
      contentComplexityAvg: 0,
      currentStreak: 0,
      longestStreak: 0,
      happiestDay: null,
      memoryFrequency: 'new',
      hasImages: false,
      imagePercentage: 0,
      analysisTimeRange: {
        from: new Date(),
        to: new Date()
      }
    };
  }

  /**
   * Get user's dashboard insights
   */
  static async getUserDashboardInsights(userId, limit = 10) {
    try {
      return await Insight.getUserInsights(userId, { limit });
    } catch (error) {
      console.error('Error fetching dashboard insights:', error);
      return [];
    }
  }

  /**
   * Mark insight as read
   */
  static async markInsightAsRead(insightId, userId) {
    try {
      const insight = await Insight.findOne({ _id: insightId, userId });
      if (insight) {
        return await insight.markAsRead();
      }
      return null;
    } catch (error) {
      console.error('Error marking insight as read:', error);
      return null;
    }
  }
}

module.exports = SimpleInsightsService;