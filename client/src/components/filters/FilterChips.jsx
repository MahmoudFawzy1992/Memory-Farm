// Active filter indicators with individual chip removal
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useFilterContext } from '../../context/FilterContext';
import { emotionFamilies } from '../../constants/emotions';
import { INTENSITY_LEVELS, getFilterSummary } from '../../utils/filterUtils';

/**
 * Individual filter chip component
 */
const FilterChip = ({ 
  label, 
  onRemove, 
  color = '#8B5CF6', 
  icon = null, 
  className = '' 
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -20 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 rounded-full text-sm font-medium shadow-sm ${className}`}
      style={{ borderColor: color }}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span style={{ color: color }}>{label}</span>
      
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
        title="Remove filter"
      >
        <svg 
          className="w-3 h-3 text-gray-400 hover:text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

/**
 * Compact filter summary badge
 */
const FilterSummaryBadge = ({ activeCount, summary, onClearAll, className = '' }) => {
  if (activeCount === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span className="text-sm font-medium text-purple-700">
          {activeCount} filter{activeCount > 1 ? 's' : ''} active
        </span>
      </div>
      
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-purple-600 hover:text-purple-800 transition-colors underline"
      >
        Clear all
      </button>
    </motion.div>
  );
};

/**
 * Main filter chips component
 * Shows active filters as removable chips
 */
export default function FilterChips({ 
  variant = 'detailed', // 'detailed' | 'compact'
  showClearAll = true,
  className = '' 
}) {
  const {
    families: selectedFamilies,
    intensities: selectedIntensities,
    dateRange,
    toggleEmotionFamily,
    toggleIntensity,
    clearDateRange,
    resetFilters,
    getCurrentFilters
  } = useFilterContext();
  
  const filters = getCurrentFilters();
  const { activeCount, summary } = getFilterSummary(filters);
  
  // Helper to format date for display
  const formatDateChip = (startDate, endDate) => {
    if (!startDate && !endDate) return '';
    
    if (startDate && endDate) {
      const start = format(new Date(startDate), 'MMM d');
      const end = format(new Date(endDate), 'MMM d, yyyy');
      
      // Same date
      if (format(new Date(startDate), 'yyyy-MM-dd') === format(new Date(endDate), 'yyyy-MM-dd')) {
        return format(new Date(startDate), 'MMM d, yyyy');
      }
      
      return `${start} - ${end}`;
    }
    
    return format(new Date(startDate || endDate), 'MMM d, yyyy');
  };
  
  // Compact variant - just summary badge
  if (variant === 'compact') {
    return (
      <div className={className}>
        <FilterSummaryBadge
          activeCount={activeCount}
          summary={summary}
          onClearAll={resetFilters}
        />
      </div>
    );
  }
  
  // No active filters
  if (activeCount === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-gray-400 text-sm">
          <span className="text-base mb-2 block">🔍</span>
          No filters applied - showing all memories
        </div>
      </div>
    );
  }
  
  // Detailed variant - individual chips
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with clear all */}
      {showClearAll && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Active Filters ({activeCount})
          </h4>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
      
      {/* Filter chips container */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {/* Emotion family chips */}
          {selectedFamilies.map(familyKey => {
            const family = emotionFamilies[familyKey];
            if (!family) return null;
            
            return (
              <FilterChip
                key={`family-${familyKey}`}
                label={family.label}
                onRemove={() => toggleEmotionFamily(familyKey)}
                color={family.color}
                icon="🎭"
              />
            );
          })}
          
          {/* Intensity level chips */}
          {selectedIntensities.map(levelKey => {
            const level = INTENSITY_LEVELS[levelKey];
            if (!level) return null;
            
            return (
              <FilterChip
                key={`intensity-${levelKey}`}
                label={`${level.label} Intensity`}
                onRemove={() => toggleIntensity(levelKey)}
                color={level.color}
                icon="📊"
              />
            );
          })}
          
          {/* Date range chip */}
          {(dateRange.startDate || dateRange.endDate) && (
            <FilterChip
              key="date-range"
              label={formatDateChip(dateRange.startDate, dateRange.endDate)}
              onRemove={clearDateRange}
              color="#6366F1"
              icon="📅"
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Filter summary text */}
      {summary.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-gray-600">
            <strong>Current filters:</strong> {summary.join(' • ')}
          </p>
        </motion.div>
      )}
    </div>
  );
}