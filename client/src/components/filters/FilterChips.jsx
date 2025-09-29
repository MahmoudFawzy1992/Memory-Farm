// Location: client/src/components/filters/FilterChips.jsx
// Active filter indicators showing individual emotions and other filters

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useFilterContext } from '../../context/FilterContext';
import { emotionFamilies } from '../../constants/emotions';
import { INTENSITY_LEVELS, getFilterSummary } from '../../utils/filterUtils';

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
        aria-label={`Remove ${label} filter`}
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

const FilterSummaryBadge = ({ activeCount, onClearAll, className = '' }) => {
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

// Helper to get emotion family color
const getEmotionFamilyColor = (emotionLabel) => {
  for (const family of Object.values(emotionFamilies)) {
    if (family.emotions.some(e => e.label === emotionLabel)) {
      return family.color;
    }
  }
  return '#8B5CF6';
};

// Helper to get emotion emoji
const getEmotionEmoji = (emotionLabel) => {
  for (const family of Object.values(emotionFamilies)) {
    const emotion = family.emotions.find(e => e.label === emotionLabel);
    if (emotion) return emotion.emoji;
  }
  return '🎭';
};

export default function FilterChips({ 
  variant = 'detailed',
  showClearAll = true,
  className = '' 
}) {
  const {
    emotions: selectedEmotions,
    intensities: selectedIntensities,
    dateRange,
    toggleEmotion,
    toggleIntensity,
    clearDateRange,
    resetFilters
  } = useFilterContext();
  
  const formatDateChip = (startDate, endDate) => {
    if (!startDate && !endDate) return '';
    
    if (startDate && endDate) {
      const start = format(new Date(startDate), 'MMM d');
      const end = format(new Date(endDate), 'MMM d, yyyy');
      
      if (format(new Date(startDate), 'yyyy-MM-dd') === format(new Date(endDate), 'yyyy-MM-dd')) {
        return format(new Date(startDate), 'MMM d, yyyy');
      }
      
      return `${start} - ${end}`;
    }
    
    return format(new Date(startDate || endDate), 'MMM d, yyyy');
  };
  
  const activeCount = selectedEmotions.length + selectedIntensities.length + (dateRange.startDate || dateRange.endDate ? 1 : 0);
  
  if (variant === 'compact') {
    return (
      <div className={className}>
        <FilterSummaryBadge
          activeCount={activeCount}
          onClearAll={resetFilters}
        />
      </div>
    );
  }
  
  if (activeCount === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
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
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {/* Individual emotion chips */}
          {selectedEmotions.map(emotionLabel => {
            const color = getEmotionFamilyColor(emotionLabel);
            const emoji = getEmotionEmoji(emotionLabel);
            
            return (
              <FilterChip
                key={`emotion-${emotionLabel}`}
                label={emotionLabel}
                onRemove={() => toggleEmotion(emotionLabel)}
                color={color}
                icon={emoji}
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
    </div>
  );
}