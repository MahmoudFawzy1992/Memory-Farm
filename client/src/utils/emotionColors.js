// client/src/utils/emotionColors.js

// Emotion color mapping with beautiful, accessible colors
const EMOTION_COLORS = {
  Happy: "#10B981",      // Emerald-500 - vibrant green for positivity
  Sad: "#3B82F6",        // Blue-500 - calming blue for sadness
  Angry: "#EF4444",      // Red-500 - strong red for anger
  Surprised: "#F59E0B",  // Amber-500 - bright orange for surprise
  Calm: "#8B5CF6",       // Violet-500 - peaceful purple for calm
  Nostalgic: "#EC4899",  // Pink-500 - warm pink for nostalgia
  All: "#6B7280",        // Gray-500 - neutral for "All"
  Unknown: "#9CA3AF",    // Gray-400 - muted for unknown emotions
};

/**
 * Get the color for a specific emotion
 * @param {string} emotionLabel - The emotion label (e.g., "Happy", "Sad")
 * @returns {string} Hex color code
 */
export const getEmotionColor = (emotionLabel) => {
  // Clean the emotion label (remove extra spaces, normalize case)
  const cleanLabel = (emotionLabel || "").trim();
  
  // Try exact match first
  if (EMOTION_COLORS[cleanLabel]) {
    return EMOTION_COLORS[cleanLabel];
  }
  
  // Try case-insensitive match
  const matchedKey = Object.keys(EMOTION_COLORS).find(
    key => key.toLowerCase() === cleanLabel.toLowerCase()
  );
  
  if (matchedKey) {
    return EMOTION_COLORS[matchedKey];
  }
  
  // Fallback to unknown color
  return EMOTION_COLORS.Unknown;
};

/**
 * Get all emotion colors as an array for legends/references
 * @returns {Array} Array of {label, color} objects
 */
export const getAllEmotionColors = () => {
  return Object.entries(EMOTION_COLORS)
    .filter(([label]) => label !== "Unknown") // Exclude Unknown from general list
    .map(([label, color]) => ({ label, color }));
};

/**
 * Get a lighter version of an emotion color (for backgrounds)
 * @param {string} emotionLabel - The emotion label
 * @param {number} opacity - Opacity level (0-1)
 * @returns {string} RGBA color string
 */
export const getEmotionColorWithOpacity = (emotionLabel, opacity = 0.1) => {
  const color = getEmotionColor(emotionLabel);
  
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};