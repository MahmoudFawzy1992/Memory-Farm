// Smart date range picker with presets and custom range selection
import { useState, useCallback } from 'react';
import { DateRange } from 'react-date-range';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subDays, 
  subWeeks, 
  subMonths,
  format,
  isValid
} from 'date-fns';
import { useFilterContext } from '../../context/FilterContext';

// Import react-date-range styles (will be handled by CSS)
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

/**
 * Predefined date range presets
 */
const DATE_PRESETS = {
  today: {
    label: 'Today',
    icon: '📅',
    getDates: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    }
  },
  yesterday: {
    label: 'Yesterday', 
    icon: '📆',
    getDates: () => {
      const yesterday = subDays(new Date(), 1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  thisWeek: {
    label: 'This Week',
    icon: '📋',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfWeek(now, { weekStartsOn: 1 }), 
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      };
    }
  },
  lastWeek: {
    label: 'Last Week',
    icon: '📊',
    getDates: () => {
      const lastWeek = subWeeks(new Date(), 1);
      return { 
        startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
        endDate: endOfWeek(lastWeek, { weekStartsOn: 1 })
      };
    }
  },
  thisMonth: {
    label: 'This Month',
    icon: '🗓️',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfMonth(now), 
        endDate: endOfMonth(now)
      };
    }
  },
  lastMonth: {
    label: 'Last Month',
    icon: '📝',
    getDates: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { 
        startDate: startOfMonth(lastMonth), 
        endDate: endOfMonth(lastMonth)
      };
    }
  },
  thisYear: {
    label: 'This Year',
    icon: '🗃️',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfYear(now), 
        endDate: endOfYear(now)
      };
    }
  }
};

/**
 * Preset button component
 */
const PresetButton = ({ preset, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left ${
        isSelected
          ? 'bg-purple-100 text-purple-700 border border-purple-300'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
      }`}
    >
      <span className="text-base">{preset.icon}</span>
      <span>{preset.label}</span>
    </button>
  );
};

/**
 * Date range display component
 */
const DateRangeDisplay = ({ startDate, endDate, onClear }) => {
  if (!startDate && !endDate) return null;
  
  const formatDate = (date) => {
    if (!date || !isValid(date)) return '';
    return format(date, 'MMM d, yyyy');
  };
  
  const isSameDate = startDate && endDate && 
    format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
    >
      <div className="flex items-center gap-2 text-purple-700">
        <span className="text-base">📅</span>
        <span className="font-medium">
          {isSameDate ? (
            formatDate(startDate)
          ) : (
            `${formatDate(startDate)} - ${formatDate(endDate)}`
          )}
        </span>
      </div>
      
      <button
        type="button"
        onClick={onClear}
        className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
        title="Clear date filter"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

/**
 * Main date range filter component
 * Supports both preset selections and custom date range picker
 */
export default function DateRangeFilter({ className = '', showPresets = true }) {
  const { dateRange, setDateRange, clearDateRange, pageType } = useFilterContext();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Handle preset selection
  const handlePresetSelect = useCallback((presetKey) => {
    const preset = DATE_PRESETS[presetKey];
    if (!preset) return;
    
    const dates = preset.getDates();
    setDateRange(dates);
    setSelectedPreset(presetKey);
    setShowCustomPicker(false);
  }, [setDateRange]);
  
  // Handle custom date range selection
  const handleDateRangeChange = useCallback((ranges) => {
    const { selection } = ranges;
    const { startDate, endDate } = selection;
    
    // Only update if we have valid dates
    if (isValid(startDate) && isValid(endDate)) {
      setDateRange({ startDate, endDate });
      setSelectedPreset(null);
    }
  }, [setDateRange]);
  
  // Clear all date filters
  const handleClear = useCallback(() => {
    clearDateRange();
    setSelectedPreset(null);
    setShowCustomPicker(false);
  }, [clearDateRange]);
  
  // Check if current range matches a preset
  const getCurrentPreset = useCallback(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;
    
    for (const [key, preset] of Object.entries(DATE_PRESETS)) {
      const presetDates = preset.getDates();
      const isSameStart = format(dateRange.startDate, 'yyyy-MM-dd') === format(presetDates.startDate, 'yyyy-MM-dd');
      const isSameEnd = format(dateRange.endDate, 'yyyy-MM-dd') === format(presetDates.endDate, 'yyyy-MM-dd');
      
      if (isSameStart && isSameEnd) {
        return key;
      }
    }
    
    return null;
  }, [dateRange]);
  
  const currentPreset = getCurrentPreset();
  const hasDateFilter = dateRange.startDate || dateRange.endDate;
  const showMoodTrackerNote = pageType === 'moodTracker';
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
          <p className="text-sm text-gray-600">
            Filter by when memories happened
            {showMoodTrackerNote && ' (affects analytics)'}
          </p>
        </div>
        
        {/* Quick actions */}
        {hasDateFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear Date
          </button>
        )}
      </div>
      
      {/* Special note for MoodTracker */}
      {showMoodTrackerNote && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Date filtering will affect mood analytics and trends. Current month is recommended for best insights.
          </p>
        </div>
      )}
      
      {/* Current selection display */}
      {hasDateFilter && (
        <DateRangeDisplay
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onClear={handleClear}
        />
      )}
      
      {/* Preset buttons */}
      {showPresets && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(DATE_PRESETS).map(([key, preset]) => (
              <PresetButton
                key={key}
                preset={preset}
                isSelected={selectedPreset === key || currentPreset === key}
                onClick={() => handlePresetSelect(key)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Custom date picker toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
          </svg>
          <span>{showCustomPicker ? 'Hide' : 'Custom Date Range'}</span>
        </button>
      </div>
      
      {/* Custom date range picker */}
      <AnimatePresence>
        {showCustomPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Select Custom Range</h4>
              
              <div className="date-range-picker-wrapper">
                <DateRange
                  ranges={[{
                    startDate: dateRange.startDate || new Date(),
                    endDate: dateRange.endDate || new Date(),
                    key: 'selection'
                  }]}
                  onChange={handleDateRangeChange}
                  maxDate={new Date()}
                  showDateDisplay={false}
                  rangeColors={['#8B5CF6']}
                  className="date-range-picker"
                />
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Select start and end dates for your filter
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* No date filter state */}
      {!hasDateFilter && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-sm">
            {pageType === 'moodTracker' 
              ? 'Showing current month data' 
              : 'No date filter applied - showing all memories'
            }
          </p>
        </div>
      )}
    </div>
  );
}