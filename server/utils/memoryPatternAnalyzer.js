/**
 * Pattern Analysis Helper Functions
 * 
 * Pure utility functions for analyzing memory patterns.
 * Used by contentAnalysisService to extract insights.
 */

/**
 * Calculate memory streaks (consecutive days with memories)
 * 
 * @param {Array} memories - Array of memory objects
 * @returns {Object} - { current, longest }
 */
function calculateStreaks(memories) {
  if (memories.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Get unique dates (normalized to midnight)
  const dates = memories
    .map(m => {
      const date = new Date(m.memoryDate || m.createdAt);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    })
    .sort((a, b) => b - a); // Newest first

  const uniqueDates = [...new Set(dates)];

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const yesterdayTime = todayTime - 86400000;

  if (uniqueDates.includes(todayTime)) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = todayTime - (i * 86400000);
      if (uniqueDates.includes(expectedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (uniqueDates.includes(yesterdayTime)) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = yesterdayTime - (i * 86400000);
      if (uniqueDates.includes(expectedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = (uniqueDates[i - 1] - uniqueDates[i]) / 86400000;
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak
  };
}

/**
 * Categorize emotion by family for better pattern detection
 * This helps detect if user is shifting between emotion families
 * 
 * @param {string} emotion - Raw emotion text (may include emoji)
 * @returns {string} - Emotion family (joy, sadness, anger, etc.)
 */
function categorizeEmotion(emotion) {
  if (!emotion) return 'neutral';
  
  const cleanEmotion = emotion.toLowerCase().replace(/^\p{Emoji}+/u, '').trim();
  
  // Joy & Happiness family
  if (/happy|joy|excit|enthusi|delight|thrill|cheerful|content|bliss|ecstatic|fine/i.test(cleanEmotion)) {
    return 'joy';
  }
  
  // Sadness & Grief family
  if (/sad|sorrow|heartbr|grief|disappoint|hopeless|griev|lonely|thought/i.test(cleanEmotion)) {
    return 'sadness';
  }
  
  // Anger & Frustration family
  if (/angry|furious|irritat|frustrat|annoy|livid|resent|outrage/i.test(cleanEmotion)) {
    return 'anger';
  }
  
  // Fear & Anxiety family
  if (/afraid|anxious|worr|nervous|terrif|panic|uneasy|cautious/i.test(cleanEmotion)) {
    return 'fear';
  }
  
  // Peace & Calm family
  if (/calm|peace|relax|tranquil|zen|center|balanc|tired|bored/i.test(cleanEmotion)) {
    return 'calm';
  }
  
  // Love & Affection family
  if (/love|affection|ador|caring|tender|devot|passion|romantic/i.test(cleanEmotion)) {
    return 'love';
  }
  
  // Nostalgia & Reflection family
  if (/nostalg|wistful|sentiment|reflect|longing|yearn|reminisc/i.test(cleanEmotion)) {
    return 'nostalgia';
  }
  
  // Surprise & Wonder family
  if (/surpris|amaz|astonish|bewilder|curious|intrigu|fascin|awe/i.test(cleanEmotion)) {
    return 'surprise';
  }
  
  return 'other';
}

/**
 * Detect emotional shift patterns
 * Returns a descriptive trend about emotional changes
 * 
 * @param {Array} allMemories - All user memories
 * @param {Array} recentMemories - Recent memories (last 7 days)
 * @returns {string} - Descriptive emotional trend
 */
function detectEmotionalShift(allMemories, recentMemories) {
  if (allMemories.length < 3 || recentMemories.length === 0) {
    return 'stable';
  }

  // Categorize all emotions by family
  const allEmotionFamilies = allMemories
    .map(m => categorizeEmotion(m.emotion))
    .filter(f => f !== 'neutral' && f !== 'other');
  
  const recentEmotionFamilies = recentMemories
    .map(m => categorizeEmotion(m.emotion))
    .filter(f => f !== 'neutral' && f !== 'other');

  if (allEmotionFamilies.length === 0 || recentEmotionFamilies.length === 0) {
    return 'stable';
  }

  // Count family frequencies
  const countFamilies = (families) => {
    const counts = {};
    families.forEach(f => counts[f] = (counts[f] || 0) + 1);
    return counts;
  };

  const allCounts = countFamilies(allEmotionFamilies);
  const recentCounts = countFamilies(recentEmotionFamilies);

  // Find dominant family in each period
  const allDominant = Object.keys(allCounts).sort((a, b) => allCounts[b] - allCounts[a])[0];
  const recentDominant = Object.keys(recentCounts).sort((a, b) => recentCounts[b] - recentCounts[a])[0];

  // If dominant family changed, describe the shift
  if (allDominant !== recentDominant) {
    return `${allDominant} → ${recentDominant}`;
  }

  // If no change, check if emotional diversity is increasing/decreasing
  const allDiversity = Object.keys(allCounts).length;
  const recentDiversity = Object.keys(recentCounts).length;
  const diversityChange = recentDiversity - (allDiversity / 2);

  if (diversityChange > 0.5) {
    return 'expanding_range'; // User exploring more emotions
  } else if (diversityChange < -0.5) {
    return 'narrowing_focus'; // User experiencing fewer emotion types
  }

  return 'stable';
}

/**
 * Analyze temporal patterns (when user writes)
 * 
 * @param {Array} memories - Array of memory objects
 * @returns {Object} - { activeTime, frequency }
 */
function analyzeTemporalPatterns(memories) {
  if (memories.length === 0) {
    return {
      activeTime: 'evening',
      frequency: 'new'
    };
  }

  // Analyze time of day
  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  
  memories.forEach(m => {
    const hour = new Date(m.createdAt).getHours();
    if (hour >= 5 && hour < 12) hourCounts.morning++;
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 22) hourCounts.evening++;
    else hourCounts.night++;
  });

  const activeTime = Object.keys(hourCounts)
    .sort((a, b) => hourCounts[b] - hourCounts[a])[0];

  // Calculate frequency
  const daysSinceFirst = Math.max(1, Math.floor(
    (Date.now() - new Date(memories[memories.length - 1].createdAt)) / (1000 * 60 * 60 * 24)
  ));
  const memoriesPerDay = memories.length / daysSinceFirst;

  let frequency;
  if (memoriesPerDay >= 1) frequency = 'daily';
  else if (memoriesPerDay >= 0.5) frequency = 'frequent';
  else if (memoriesPerDay >= 0.2) frequency = 'regular';
  else frequency = 'occasional';

  return {
    activeTime,
    frequency
  };
}

module.exports = {
  calculateStreaks,
  categorizeEmotion,
  detectEmotionalShift,
  analyzeTemporalPatterns
};