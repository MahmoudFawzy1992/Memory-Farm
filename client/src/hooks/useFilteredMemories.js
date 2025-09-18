// Hook for applying filters to memory arrays with performance optimization
import { useMemo } from 'react';
import { applyFilters } from '../utils/filterUtils';

/**
 * Hook to filter memories with memoization for performance
 * @param {Array} memories - Array of memory objects
 * @param {Object} filters - Filter object { families, intensities, dateRange }
 * @param {Object} options - Additional options { sortBy, sortOrder }
 * @returns {Object} - { filteredMemories, count, stats }
 */
export const useFilteredMemories = (memories, filters, options = {}) => {
  const { sortBy = 'date', sortOrder = 'desc' } = options;
  
  // Apply filters with memoization for performance
  const filteredMemories = useMemo(() => {
    if (!Array.isArray(memories)) return [];
    if (!filters) return memories;
    
    const filtered = applyFilters(memories, filters);
    
    // Apply sorting if specified
    if (sortBy && filtered.length > 1) {
      return filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.memoryDate || a.createdAt);
            bValue = new Date(b.memoryDate || b.createdAt);
            break;
          case 'title':
            aValue = a.title || '';
            bValue = b.title || '';
            break;
          case 'emotion':
            aValue = a.emotion || '';
            bValue = b.emotion || '';
            break;
          default:
            return 0;
        }
        
        if (sortBy === 'date') {
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        } else {
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === 'desc' ? -comparison : comparison;
        }
      });
    }
    
    return filtered;
  }, [memories, filters, sortBy, sortOrder]);
  
  // Calculate basic stats
  const stats = useMemo(() => {
    const total = memories?.length || 0;
    const filtered = filteredMemories.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;
    
    return {
      total,
      filtered,
      percentage,
      hidden: total - filtered
    };
  }, [memories, filteredMemories]);
  
  // Group memories by emotion family for analytics
  const emotionGroups = useMemo(() => {
    const groups = {};
    
    filteredMemories.forEach(memory => {
      const family = memory.emotionFamily || 'other';
      if (!groups[family]) {
        groups[family] = [];
      }
      groups[family].push(memory);
    });
    
    return groups;
  }, [filteredMemories]);
  
  // Group memories by intensity levels
  const intensityGroups = useMemo(() => {
    const groups = { LOW: [], MEDIUM: [], HIGH: [] };
    
    filteredMemories.forEach(memory => {
      // Try to get intensity from blocks
      let intensity = 5; // default
      if (memory.content && Array.isArray(memory.content)) {
        const moodBlock = memory.content.find(block => block.type === 'mood');
        if (moodBlock?.props?.intensity) {
          intensity = moodBlock.props.intensity;
        }
      }
      
      if (intensity >= 1 && intensity <= 3) {
        groups.LOW.push(memory);
      } else if (intensity >= 7 && intensity <= 10) {
        groups.HIGH.push(memory);
      } else {
        groups.MEDIUM.push(memory);
      }
    });
    
    return groups;
  }, [filteredMemories]);
  
  return {
    // Main results
    filteredMemories,
    count: filteredMemories.length,
    
    // Statistics
    stats,
    
    // Grouped data for analytics
    emotionGroups,
    intensityGroups,
    
    // Utilities
    isEmpty: filteredMemories.length === 0,
    hasResults: filteredMemories.length > 0,
    isFiltered: stats.total !== stats.filtered
  };
};