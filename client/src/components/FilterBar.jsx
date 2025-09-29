import { useState } from 'react';
import { useFilterContext } from '../context/FilterContext';
import FilterModal from './FilterModal';
import EmotionFamilyFilter from './filters/EmotionFamilyFilter';
import IntensityRangeFilter from './filters/IntensityRangeFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import FilterChips from './filters/FilterChips';

/**
 * Filter button component with icon, label, and badge
 */
const FilterButton = ({ icon, label, count, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-2 sm:px-4 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
        isActive || count > 0
          ? 'border-purple-500 bg-purple-50 text-purple-700'
          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25'
      }`}
    >
      {/* Icon */}
      <span className="text-base sm:text-lg">{icon}</span>
      
      {/* Label - Always visible */}
      <span>{label}</span>
      
      {/* Count badge */}
      {count > 0 && (
        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
          isActive || count > 0
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}>
          {count}
        </span>
      )}
      
      {/* Dropdown indicator */}
      <svg 
        className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

/**
 * Main FilterBar component - Compact horizontal toolbar
 */
export default function FilterBar({ className = '' }) {
  const { 
    families: selectedFamilies,
    intensities: selectedIntensities,
    dateRange,
    hasActiveFilters,
    resetFilters,
    pageType
  } = useFilterContext();
  
  // Track which modal is open (only one at a time)
  const [activeModal, setActiveModal] = useState(null);
  
  // Toggle modal (close if same, open if different, close all if click outside)
  const toggleModal = (modalName) => {
    setActiveModal(activeModal === modalName ? null : modalName);
  };
  
  const closeModal = () => setActiveModal(null);
  
  // Count active filters for each type
  const emotionCount = selectedFamilies.length;
  const intensityCount = selectedIntensities.length;
  const hasDateRange = dateRange.startDate || dateRange.endDate;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Button Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Emotions Filter Button */}
        <FilterButton
          icon="🎭"
          label="Emotions"
          count={emotionCount}
          isActive={activeModal === 'emotions'}
          onClick={() => toggleModal('emotions')}
        />
        
        {/* Intensity Filter Button */}
        <FilterButton
          icon="📊"
          label="Intensity"
          count={intensityCount}
          isActive={activeModal === 'intensity'}
          onClick={() => toggleModal('intensity')}
        />
        
        {/* Date Filter Button */}
        <FilterButton
          icon="📅"
          label="Date"
          count={hasDateRange ? 1 : 0}
          isActive={activeModal === 'date'}
          onClick={() => toggleModal('date')}
        />
        
        {/* Clear All Button - Only show when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto px-2 sm:px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">✕</span>
          </button>
        )}
      </div>
      
      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <FilterChips variant="detailed" showClearAll={false} />
      )}
      
      {/* Modals */}
      <FilterModal
        isOpen={activeModal === 'emotions'}
        onClose={closeModal}
        title="Filter by Emotions"
        maxWidth="max-w-3xl"
      >
        <EmotionFamilyFilter />
      </FilterModal>
      
      <FilterModal
        isOpen={activeModal === 'intensity'}
        onClose={closeModal}
        title="Filter by Intensity"
        maxWidth="max-w-2xl"
      >
        <IntensityRangeFilter />
      </FilterModal>
      
      <FilterModal
        isOpen={activeModal === 'date'}
        onClose={closeModal}
        title="Filter by Date"
        maxWidth="max-w-2xl"
      >
        <DateRangeFilter showPresets={pageType !== 'moodTracker'} />
      </FilterModal>
    </div>
  );
}