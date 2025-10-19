/**
 * Static Fallback - Bulletproof fallback when AI fails
 */

class StaticFallback {
  
  static generateStaticInsight(memoryCount, patterns) {
    console.log('🛡️ Generating static fallback insight');

    if (memoryCount === 1) {
      return {
        message: `What a beautiful first step! You just captured a moment about ${patterns.topThemes[0] || 'personal reflection'} while feeling ${patterns.dominantEmotion}. This is more than just a memory—it's the beginning of understanding yourself deeper. I'll be here to notice patterns you might miss as you continue this journey.`
      };
    }

    if (memoryCount === 5) {
      return {
        message: `After 5 memories, I notice you tend to feel "${patterns.dominantEmotion}" most often. You're building a wonderful collection of moments - keep going!`
      };
    }

    if (memoryCount === 10) {
      const lengthDescription = patterns.avgWordCount > 100 ? 'detailed' : 
                              patterns.avgWordCount > 50 ? 'thoughtful' : 'concise';
      
      return {
        message: `You write ${lengthDescription} memories with an average of ${patterns.avgWordCount} words. "${patterns.dominantEmotion}" appears to be your go-to emotion. You're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}!`
      };
    }

    if (memoryCount === 15) {
      return {
        message: `You've explored ${patterns.emotionDiversity} different emotions so far. Your emotional awareness is developing beautifully!`
      };
    }

    if (memoryCount === 25) {
      return {
        message: `25 memories and counting! ${patterns.currentStreak > 1 ? `You're on a ${patterns.currentStreak}-day streak.` : ''} Your dominant emotion "${patterns.dominantEmotion}" shows you're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}. Keep capturing these precious moments!`
      };
    }

    if (memoryCount === 50) {
      return {
        message: `50 memories - what an achievement! You've written an average of ${patterns.avgWordCount} words per memory and explored ${patterns.emotionDiversity} different emotions. You're creating a beautiful tapestry of life moments.`
      };
    }

    if (memoryCount === 100) {
      return {
        message: `100 memories - incredible! Your emotional range has grown significantly since starting. You've created a beautiful tapestry of life moments.`
      };
    }

    if (patterns.currentStreak >= 7) {
      return {
        message: `${patterns.currentStreak} days in a row! You're building an amazing habit. Your dedication to capturing memories is inspiring.`
      };
    }

    return {
      message: `${memoryCount} memories and counting! Your journey of self-reflection continues to grow. "${patterns.dominantEmotion}" remains your most common emotion - you're naturally ${this.getTraitFromEmotion(patterns.dominantEmotion)}!`
    };
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
}

module.exports = StaticFallback;