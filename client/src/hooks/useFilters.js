// Custom hook for filter logic and state management
import { useEffect, useMemo } from 'react';
import { useFilterContext } from '../context/FilterContext';
import { applyFilters, areFiltersEmpty, getFilterSummary } from '../utils/filterUtils';

/**
 * Main filter hook that provides filter state and actions
 * Centralizes all filter logic for reuse across components
 */
export const useFilters = (pageType = 'home') => {
  const context = useFilterContext();
  
  // Set page type when hook is used
  useEffect(() => {
    if (context.pageType !== pageType) {
      context.setPageType(pageType);
    }
  }, [pageType, context]);
  
  // Get current filters as plain object
  const currentFilters = useMemo(() => ({
    families: context.families,
    intensities: context.intensities,
    dateRange: context.dateRange
  }), [context.families, context.intensities, context.dateRange]);
  
  // Check if filters are empty
  const isEmpty = useMemo(() => areFiltersEmpty(currentFilters), [currentFilters]);
  
  // Get filter summary for display
  const summary = useMemo(() => getFilterSummary(currentFilters), [currentFilters]);
  
  // Filter application function
  const filterMemories = useMemo(() => 
    (memories) => applyFilters(memories, currentFilters),
    [currentFilters]
  );
  
  return {
    // State
    filters: currentFilters,
    pageType: context.pageType,
    hasActiveFilters: context.hasActiveFilters,
    isEmpty,
    summary,
    
    // Actions
    setEmotionFamilies: context.setEmotionFamilies,
    toggleEmotionFamily: context.toggleEmotionFamily,
    setIntensities: context.setIntensities,
    toggleIntensity: context.toggleIntensity,
    setDateRange: context.setDateRange,
    clearDateRange: context.clearDateRange,
    resetFilters: context.resetFilters,
    setFilters: context.setFilters,
    
    // Utilities
    filterMemories,
    getCurrentFilters: context.getCurrentFilters
  };
};