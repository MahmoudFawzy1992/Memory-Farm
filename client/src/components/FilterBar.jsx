// Enhanced filter bar with emotion families, intensity levels, and smart date ranges
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilterContext } from '../context/FilterContext';
import EmotionFamilyFilter from './filters/EmotionFamilyFilter';
import IntensityRangeFilter from './filters/IntensityRangeFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import FilterChips from './filters/FilterChips';

/**
 * Filter panel toggle button
 */
const FilterToggleButton = ({ isOpen, onToggle, activeCount }) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
        isOpen 
          ? 'border-purple-500 bg-purple-50 text-purple-700' 
          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25'
      }`}
    >
      <svg 
        className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
      <span className="font-medium">
        Filters {activeCount > 0 && `(${activeCount})`}
      </span>
    </button>
  );
};

/**
 * Filter section wrapper with collapsible functionality
 */
const FilterSection = ({ title, isExpanded, onToggle, children, className = '' }) => {
  return (
    <div className={`border border-gray-200 rounded-xl bg-white ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg 
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main enhanced FilterBar component
 * Replaces the existing FilterBar with comprehensive filtering
 */
export default function FilterBar({
  // Legacy props for backward compatibility
  emotions,
  selectedEmotion,
  onFilter,
  showMonthPicker = false,
  month,
  onMonthChange,
  
  // New props for enhanced functionality
  variant = 'full', // 'full' | 'compact' | 'chips-only'
  showSections = true,
  defaultExpanded = ['emotions'],
  className = ''
}) {
  const { hasActiveFilters, resetFilters, pageType } = useFilterContext();
  
  // UI state for collapsible sections
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(defaultExpanded));
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };
  
  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };
  
  // Compact variant - just chips and toggle
  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <FilterChips variant="compact" />
          <FilterToggleButton
            isOpen={isFilterPanelOpen}
            onToggle={toggleFilterPanel}
            activeCount={hasActiveFilters ? 1 : 0}
          />
        </div>
        
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <EmotionFamilyFilter />
                <IntensityRangeFilter />
                <DateRangeFilter />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Chips-only variant
  if (variant === 'chips-only') {
    return (
      <div className={className}>
        <FilterChips showClearAll={true} />
      </div>
    );
  }
  
  // Full variant - all features
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter chips section */}
      <div className="flex items-center justify-between">
        <FilterChips variant="compact" />
        
        {/* Filter panel toggle for mobile */}
        <div className="md:hidden">
          <FilterToggleButton
            isOpen={isFilterPanelOpen}
            onToggle={toggleFilterPanel}
            activeCount={hasActiveFilters ? 1 : 0}
          />
        </div>
        
        {/* Reset filters button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All Filters
          </button>
        )}
      </div>
      
      {/* Filter panels */}
      <div className={`${isFilterPanelOpen ? 'block' : 'hidden md:block'}`}>
        {showSections ? (
          /* Collapsible sections */
          <div className="space-y-4">
            <FilterSection
              title="Emotion Families"
              isExpanded={expandedSections.has('emotions')}
              onToggle={() => toggleSection('emotions')}
            >
              <EmotionFamilyFilter />
            </FilterSection>
            
            <FilterSection
              title="Intensity Levels"
              isExpanded={expandedSections.has('intensity')}
              onToggle={() => toggleSection('intensity')}
            >
              <IntensityRangeFilter />
            </FilterSection>
            
            <FilterSection
              title="Date Range"
              isExpanded={expandedSections.has('date')}
              onToggle={() => toggleSection('date')}
            >
              <DateRangeFilter showPresets={pageType !== 'moodTracker'} />
            </FilterSection>
          </div>
        ) : (
          /* All sections expanded */
          <div className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmotionFamilyFilter />
            <div className="border-t border-gray-100 pt-8">
              <IntensityRangeFilter />
            </div>
            <div className="border-t border-gray-100 pt-8">
              <DateRangeFilter showPresets={pageType !== 'moodTracker'} />
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile filter panel overlay */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleFilterPanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}