// Filter utility functions for enhanced memory filtering system
import { emotionFamilies } from '../constants/emotions';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Intensity level definitions for mood filtering
 */
export const INTENSITY_LEVELS = {
  LOW: { min: 1, max: 3, label: 'Low', color: '#EF4444' },
  MEDIUM: { min: 4, max: 6, label: 'Medium', color: '#F59E0B' },
  HIGH: { min: 7, max: 10, label: 'High', color: '#10B981' }
};

/**
 * Get intensity level from numeric value
 * @param {number} intensity - Intensity value (1-10)
 * @returns {string} - Level key (LOW, MEDIUM, HIGH)
 */
export const getIntensityLevel = (intensity) => {
  if (intensity >= 1 && intensity <= 3) return 'LOW';
  if (intensity >= 4 && intensity <= 6) return 'MEDIUM';
  if (intensity >= 7 && intensity <= 10) return 'HIGH';
  return 'MEDIUM'; // Default fallback
};

/**
 * Get emotion family key from emotion text
 * @param {string} emotionText - Full emotion text with emoji
 * @returns {string} - Family key or null
 */
export const getEmotionFamilyFromText = (emotionText) => {
  if (!emotionText) return null;
  
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim().toLowerCase();
  
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion
    );
    if (found) return familyKey;
  }
  
  return null;
};

/**
 * Extract emotion data from memory blocks
 * @param {Array} blocks - Memory content blocks
 * @returns {Object} - { emotion, intensity, family }
 */
export const extractEmotionFromBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return { emotion: '', intensity: 5, family: null };
  
  const moodBlock = blocks.find(block => block.type === 'mood');
  if (!moodBlock?.props) return { emotion: '', intensity: 5, family: null };
  
  const emotion = moodBlock.props.emotion || '';
  const intensity = moodBlock.props.intensity || 5;
  const family = getEmotionFamilyFromText(emotion);
  
  return { emotion, intensity, family };
};

/**
 * Check if memory matches emotion family filter
 * @param {Object} memory - Memory object
 * @param {Array} selectedFamilies - Array of selected family keys
 * @returns {boolean}
 */
export const matchesEmotionFilter = (memory, selectedFamilies) => {
  if (!selectedFamilies || selectedFamilies.length === 0) return true;
  
  // Try to get family from memory.emotionFamily first (backend processed)
  if (memory.emotionFamily && selectedFamilies.includes(memory.emotionFamily)) {
    return true;
  }
  
  // Fallback: extract from blocks or emotion field
  const emotionData = memory.content 
    ? extractEmotionFromBlocks(memory.content)
    : { family: getEmotionFamilyFromText(memory.emotion) };
  
  return emotionData.family && selectedFamilies.includes(emotionData.family);
};

/**
 * Check if memory matches intensity filter
 * @param {Object} memory - Memory object
 * @param {Array} selectedIntensities - Array of selected intensity levels
 * @returns {boolean}
 */
export const matchesIntensityFilter = (memory, selectedIntensities) => {
  if (!selectedIntensities || selectedIntensities.length === 0) return true;
  
  // Extract intensity from blocks
  const emotionData = memory.content 
    ? extractEmotionFromBlocks(memory.content)
    : { intensity: 5 };
  
  const level = getIntensityLevel(emotionData.intensity);
  return selectedIntensities.includes(level);
};

/**
 * Check if memory matches date range filter
 * @param {Object} memory - Memory object
 * @param {Object} dateRange - { startDate, endDate }
 * @returns {boolean}
 */
export const matchesDateFilter = (memory, dateRange) => {
  if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return true;
  
  // Use memoryDate if available, fallback to createdAt
  const memoryDate = new Date(memory.memoryDate || memory.createdAt);
  
  // Single date selection
  if (dateRange.startDate && !dateRange.endDate) {
    const targetDate = startOfDay(new Date(dateRange.startDate));
    const memoryDay = startOfDay(memoryDate);
    return memoryDay.getTime() === targetDate.getTime();
  }
  
  // Date range selection
  if (dateRange.startDate && dateRange.endDate) {
    const start = startOfDay(new Date(dateRange.startDate));
    const end = endOfDay(new Date(dateRange.endDate));
    return isWithinInterval(memoryDate, { start, end });
  }
  
  return true;
};

/**
 * Apply all filters to memories array
 * @param {Array} memories - Array of memory objects
 * @param {Object} filters - Filter object { families, intensities, dateRange }
 * @returns {Array} - Filtered memories
 */
export const applyFilters = (memories, filters) => {
  if (!Array.isArray(memories)) return [];
  
  return memories.filter(memory => {
    return matchesEmotionFilter(memory, filters.families) &&
           matchesIntensityFilter(memory, filters.intensities) &&
           matchesDateFilter(memory, filters.dateRange);
  });
};

/**
 * Get filter summary for display
 * @param {Object} filters - Filter object
 * @returns {Object} - { activeCount, summary }
 */
export const getFilterSummary = (filters) => {
  let activeCount = 0;
  const summary = [];
  
  if (filters.families && filters.families.length > 0) {
    activeCount++;
    const familyLabels = filters.families.map(key => 
      emotionFamilies[key]?.label || key
    );
    summary.push(`Emotions: ${familyLabels.join(', ')}`);
  }
  
  if (filters.intensities && filters.intensities.length > 0) {
    activeCount++;
    const intensityLabels = filters.intensities.map(level => 
      INTENSITY_LEVELS[level]?.label || level
    );
    summary.push(`Intensity: ${intensityLabels.join(', ')}`);
  }
  
  if (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate)) {
    activeCount++;
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const start = new Date(filters.dateRange.startDate).toLocaleDateString();
      const end = new Date(filters.dateRange.endDate).toLocaleDateString();
      summary.push(`Date: ${start} - ${end}`);
    } else if (filters.dateRange.startDate) {
      const date = new Date(filters.dateRange.startDate).toLocaleDateString();
      summary.push(`Date: ${date}`);
    }
  }
  
  return { activeCount, summary };
};

/**
 * Create empty filter state
 * @returns {Object} - Empty filter object
 */
export const createEmptyFilters = () => ({
  families: [],
  intensities: [],
  dateRange: {
    startDate: null,
    endDate: null
  }
});

/**
 * Check if filters are empty
 * @param {Object} filters - Filter object
 * @returns {boolean}
 */
export const areFiltersEmpty = (filters) => {
  return (!filters.families || filters.families.length === 0) &&
         (!filters.intensities || filters.intensities.length === 0) &&
         (!filters.dateRange || (!filters.dateRange.startDate && !filters.dateRange.endDate));
};