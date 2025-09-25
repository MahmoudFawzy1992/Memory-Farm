import { useState, useCallback } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import { DATE_PRESETS } from '../../constants/dateRangePresets';
import { findMatchingPreset, isValidDateRangeSelection } from '../../utils/dateRangeUtils';
import DateRangeDisplay from './dateRangeFilter/DateRangeDisplay';
import PresetGrid from './dateRangeFilter/PresetGrid';
import CustomDatePicker from './dateRangeFilter/CustomDatePicker';

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
    if (isValidDateRangeSelection(ranges)) {
      const { selection } = ranges;
      const { startDate, endDate } = selection;
      
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
  const currentPreset = findMatchingPreset(dateRange);
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
      <PresetGrid
        selectedPreset={selectedPreset}
        currentPreset={currentPreset}
        onPresetSelect={handlePresetSelect}
        showPresets={showPresets}
      />
      
      {/* Custom date picker */}
      <CustomDatePicker
        showCustomPicker={showCustomPicker}
        setShowCustomPicker={setShowCustomPicker}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
      
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