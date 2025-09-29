// Location: client/src/utils/filterUtils.js
// Filter utility functions for enhanced memory filtering system
import { emotionFamilies } from '../constants/emotions';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const INTENSITY_LEVELS = {
  LOW: { min: 1, max: 3, label: 'Low', color: '#EF4444' },
  MEDIUM: { min: 4, max: 6, label: 'Medium', color: '#F59E0B' },
  HIGH: { min: 7, max: 10, label: 'High', color: '#10B981' }
};

export const getIntensityLevel = (intensity) => {
  if (intensity >= 1 && intensity <= 3) return 'LOW';
  if (intensity >= 4 && intensity <= 6) return 'MEDIUM';
  if (intensity >= 7 && intensity <= 10) return 'HIGH';
  return 'MEDIUM';
};

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
 * Check if memory matches emotion filter (supports both families and individual emotions)
 */
export const matchesEmotionFilter = (memory, selectedFamilies, selectedEmotions = []) => {
  // No filter applied
  if ((!selectedFamilies || selectedFamilies.length === 0) && 
      (!selectedEmotions || selectedEmotions.length === 0)) {
    return true;
  }
  
  // Extract emotion data from memory
  const emotionData = memory.content 
    ? extractEmotionFromBlocks(memory.content)
    : { 
        emotion: memory.emotion ? memory.emotion.replace(/^\p{Emoji}+/u, '').trim() : '',
        family: memory.emotionFamily || getEmotionFamilyFromText(memory.emotion) 
      };
  
  // Check individual emotion match
  if (selectedEmotions && selectedEmotions.length > 0) {
    const cleanMemoryEmotion = emotionData.emotion.toLowerCase();
    const hasEmotionMatch = selectedEmotions.some(e => e.toLowerCase() === cleanMemoryEmotion);
    if (hasEmotionMatch) return true;
  }
  
  // Check family match (only if no individual emotions matched)
  if (selectedFamilies && selectedFamilies.length > 0) {
    if (emotionData.family && selectedFamilies.includes(emotionData.family)) {
      return true;
    }
  }
  
  return false;
};

export const matchesIntensityFilter = (memory, selectedIntensities) => {
  if (!selectedIntensities || selectedIntensities.length === 0) return true;
  
  const emotionData = memory.content 
    ? extractEmotionFromBlocks(memory.content)
    : { intensity: 5 };
  
  const level = getIntensityLevel(emotionData.intensity);
  return selectedIntensities.includes(level);
};

export const matchesDateFilter = (memory, dateRange) => {
  if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return true;
  
  const memoryDate = new Date(memory.memoryDate || memory.createdAt);
  
  if (dateRange.startDate && !dateRange.endDate) {
    const targetDate = startOfDay(new Date(dateRange.startDate));
    const memoryDay = startOfDay(memoryDate);
    return memoryDay.getTime() === targetDate.getTime();
  }
  
  if (dateRange.startDate && dateRange.endDate) {
    const start = startOfDay(new Date(dateRange.startDate));
    const end = endOfDay(new Date(dateRange.endDate));
    return isWithinInterval(memoryDate, { start, end });
  }
  
  return true;
};

/**
 * Apply all filters to memories array (updated to support individual emotions)
 */
export const applyFilters = (memories, filters) => {
  if (!Array.isArray(memories)) return [];
  
  return memories.filter(memory => {
    return matchesEmotionFilter(memory, filters.families, filters.emotions) &&
           matchesIntensityFilter(memory, filters.intensities) &&
           matchesDateFilter(memory, filters.dateRange);
  });
};

/**
 * Get filter summary for display (updated to include individual emotions)
 */
export const getFilterSummary = (filters) => {
  let activeCount = 0;
  const summary = [];
  
  if (filters.emotions && filters.emotions.length > 0) {
    activeCount += filters.emotions.length;
    summary.push(`${filters.emotions.length} emotion${filters.emotions.length > 1 ? 's' : ''} selected`);
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

export const createEmptyFilters = () => ({
  families: [],
  emotions: [],
  intensities: [],
  dateRange: {
    startDate: null,
    endDate: null
  }
});

export const areFiltersEmpty = (filters) => {
  return (!filters.families || filters.families.length === 0) &&
         (!filters.emotions || filters.emotions.length === 0) &&
         (!filters.intensities || filters.intensities.length === 0) &&
         (!filters.dateRange || (!filters.dateRange.startDate && !filters.dateRange.endDate));
};