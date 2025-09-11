// client/src/utils/emotionColors.js
// Emotion color mapping with hex colors for new memory card system

import { emotionFamilies } from '../constants/emotions';

// Emotion family color mapping (hex colors)
const EMOTION_FAMILY_COLORS = {
  joy: "#10B981",        // Emerald-500 - vibrant green for joy & happiness
  sadness: "#3B82F6",    // Blue-500 - calming blue for sadness & grief  
  anger: "#EF4444",      // Red-500 - strong red for anger & frustration
  fear: "#8B5CF6",       // Violet-500 - purple for fear & anxiety
  surprise: "#F59E0B",   // Amber-500 - bright orange for surprise & wonder
  calm: "#06B6D4",       // Cyan-500 - peaceful cyan for peace & calm
  nostalgia: "#EC4899",  // Pink-500 - warm pink for nostalgia & reflection
  love: "#F43F5E",       // Rose-500 - passionate rose for love & affection
  default: "#6B7280",    // Gray-500 - neutral for unknown emotions
};

// Individual emotion colors (can override family colors if needed)
const INDIVIDUAL_EMOTION_COLORS = {
  // Joy family overrides
  "Happy": "#10B981",
  "Excited": "#059669", // Emerald-600 - slightly darker for excitement
  "Ecstatic": "#047857", // Emerald-700 - darkest for highest joy
  
  // Sadness family overrides  
  "Heartbroken": "#1D4ED8", // Blue-700 - deeper blue for heartbreak
  "Grief": "#1E3A8A", // Blue-800 - darkest blue for grief
  
  // Anger family overrides
  "Furious": "#DC2626", // Red-600 - darker red for fury
  "Livid": "#B91C1C", // Red-700 - darkest red for extreme anger
  
  // Keep other emotions using family colors...
};

/**
 * Get the hex color for a specific emotion
 * @param {string} emotionText - Full emotion text with emoji (e.g., "😊 Happy")
 * @returns {string} Hex color code
 */
export const getEmotionColor = (emotionText) => {
  if (!emotionText) return EMOTION_FAMILY_COLORS.default;
  
  // Clean emotion text (remove emoji and trim)
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim();
  
  // Check for individual emotion color override
  if (INDIVIDUAL_EMOTION_COLORS[cleanEmotion]) {
    return INDIVIDUAL_EMOTION_COLORS[cleanEmotion];
  }
  
  // Find emotion family and return family color
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion.toLowerCase()
    );
    if (found) {
      return EMOTION_FAMILY_COLORS[familyKey] || EMOTION_FAMILY_COLORS.default;
    }
  }
  
  return EMOTION_FAMILY_COLORS.default;
};

/**
 * Get emotion family key from emotion text
 * @param {string} emotionText - Full emotion text with emoji
 * @returns {string} Family key (joy, sadness, etc.) or 'default'
 */
export const getEmotionFamily = (emotionText) => {
  if (!emotionText) return 'default';
  
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim();
  
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion.toLowerCase()
    );
    if (found) return familyKey;
  }
  
  return 'default';
};

/**
 * Get intensity color based on emotion family and intensity level
 * @param {string} emotionText - Full emotion text
 * @param {number} intensity - Intensity level 1-10
 * @returns {string} Hex color with appropriate saturation
 */
export const getIntensityColor = (emotionText, intensity = 5) => {
  const baseColor = getEmotionColor(emotionText);
  
  // Adjust opacity/saturation based on intensity
  // Higher intensity = more saturated color
  const alpha = Math.max(0.3, Math.min(1, intensity / 10));
  
  // Convert hex to RGB for alpha blending
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get a lighter version of emotion color for backgrounds
 * @param {string} emotionText - Full emotion text
 * @param {number} opacity - Background opacity (0-1)
 * @returns {string} RGBA color string
 */
export const getEmotionBackground = (emotionText, opacity = 0.1) => {
  const baseColor = getEmotionColor(emotionText);
  
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get all emotion family colors for charts/legends
 * @returns {Array} Array of {family, color, label} objects
 */
export const getAllEmotionFamilyColors = () => {
  return Object.entries(emotionFamilies).map(([key, family]) => ({
    family: key,
    color: EMOTION_FAMILY_COLORS[key],
    label: family.label
  }));
};

/**
 * Get contrasting text color (black or white) for emotion color
 * @param {string} emotionText - Full emotion text
 * @returns {string} '#000000' or '#FFFFFF'
 */
export const getContrastTextColor = (emotionText) => {
  const hexColor = getEmotionColor(emotionText);
  
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness using standard formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 150 ? '#000000' : '#FFFFFF';
};

// Export color constants for direct use
export { EMOTION_FAMILY_COLORS, INDIVIDUAL_EMOTION_COLORS };