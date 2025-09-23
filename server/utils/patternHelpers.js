/**
 * Statistical helpers for pattern analysis
 */

// Calculate average with proper handling of empty arrays
exports.calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length;
};

// Find most frequent item in array
exports.getMostFrequent = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  
  const frequency = {};
  items.forEach(item => {
    if (item) frequency[item] = (frequency[item] || 0) + 1;
  });
  
  return Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b, null
  );
};

// Calculate diversity (unique items count)
exports.calculateDiversity = (items) => {
  if (!Array.isArray(items)) return 0;
  return new Set(items.filter(item => item)).size;
};

// Get percentile value from sorted array
exports.getPercentile = (sortedArray, percentile) => {
  if (!Array.isArray(sortedArray) || sortedArray.length === 0) return 0;
  const index = Math.ceil(sortedArray.length * (percentile / 100)) - 1;
  return sortedArray[Math.max(0, index)];
};

// Analyze text complexity based on word count and sentence structure
exports.analyzeTextComplexity = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : words;
  
  // Complexity score based on length and structure
  let complexity = 0;
  if (words > 200) complexity += 3;
  else if (words > 100) complexity += 2;
  else if (words > 50) complexity += 1;
  
  if (avgWordsPerSentence > 20) complexity += 2;
  else if (avgWordsPerSentence > 15) complexity += 1;
  
  return Math.min(complexity, 5); // Cap at 5
};

// Determine day of week pattern from dates
exports.analyzeDayPattern = (dates) => {
  if (!Array.isArray(dates) || dates.length === 0) return null;
  
  const dayCount = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  dates.forEach(date => {
    const dayIndex = new Date(date).getDay();
    const dayName = days[dayIndex];
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
  });
  
  return Object.keys(dayCount).reduce((a, b) => 
    dayCount[a] > dayCount[b] ? a : b
  );
};

// Calculate consecutive days streak
exports.calculateStreak = (dates) => {
  if (!Array.isArray(dates) || dates.length === 0) return { current: 0, longest: 0 };
  
  // Convert to date strings and sort
  const dateStrings = dates
    .map(d => new Date(d).toDateString())
    .sort()
    .filter((date, index, arr) => arr.indexOf(date) === index); // Remove duplicates
  
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < dateStrings.length; i++) {
    const prevDate = new Date(dateStrings[i - 1]);
    const currDate = new Date(dateStrings[i]);
    const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Calculate current streak from most recent date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastEntryDate = dateStrings[dateStrings.length - 1];
  
  if (lastEntryDate === today || lastEntryDate === yesterday) {
    currentStreak = 1;
    for (let i = dateStrings.length - 2; i >= 0; i--) {
      const prevDate = new Date(dateStrings[i]);
      const nextDate = new Date(dateStrings[i + 1]);
      const dayDiff = (nextDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }
  
  return { current: currentStreak, longest: longestStreak };
};

// Generate insight message templates
exports.getInsightTemplate = (type, data) => {
  const templates = {
    emotion_dominant: [
      `You tend to feel "${data.emotion}" most often - you're naturally ${data.trait}!`,
      `"${data.emotion}" appears ${data.percentage}% of the time in your memories. You have a ${data.trait} nature!`,
      `Your dominant emotion is "${data.emotion}" - this shows you're ${data.trait} at heart.`
    ],
    writing_length: [
      `You write ${data.style} memories with an average of ${data.wordCount} words.`,
      `Your writing style is ${data.style} - averaging ${data.wordCount} words per memory.`,
      `You express yourself in ${data.style} form, typically using ${data.wordCount} words.`
    ],
    streak_achievement: [
      `${data.days} days in a row! You're building an amazing habit.`,
      `Incredible consistency - ${data.days} consecutive days of memory writing!`,
      `${data.days}-day streak! Your dedication to capturing memories is inspiring.`
    ],
    diversity_growth: [
      `You've explored ${data.count} different emotions. Your emotional awareness is growing!`,
      `${data.count} unique emotions captured - you're developing rich emotional intelligence.`,
      `Your emotional range includes ${data.count} different feelings. Beautiful diversity!`
    ]
  };
  
  const templateArray = templates[type] || [`Insight about ${type}`];
  return templateArray[Math.floor(Math.random() * templateArray.length)];
};