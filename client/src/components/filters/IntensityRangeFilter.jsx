// Intensity range filter with visual slider and level selection
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import { motion } from 'framer-motion';
import { useFilterContext } from '../../context/FilterContext';
import { INTENSITY_LEVELS } from '../../utils/filterUtils';

// Import rc-slider styles (will be handled by CSS)
import 'rc-slider/assets/index.css';

/**
 * Individual intensity level card
 */
const IntensityLevelCard = ({ level, levelKey, isSelected, onToggle }) => {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(levelKey)}
      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left w-full ${
        isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level.color }}
          />
          <span className="font-medium text-gray-900">{level.label}</span>
        </div>
        
        {isSelected && (
          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        Range: {level.min} - {level.max}
      </div>
      
      {/* Visual intensity indicator */}
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 10 }).map((_, index) => {
          const intensity = index + 1;
          const isInRange = intensity >= level.min && intensity <= level.max;
          return (
            <div
              key={intensity}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isInRange ? 'opacity-100' : 'opacity-20'
              }`}
              style={{ 
                backgroundColor: isInRange ? level.color : '#E5E7EB' 
              }}
            />
          );
        })}
      </div>
    </motion.button>
  );
};

/**
 * Custom slider with intensity level markers
 */
const IntensitySlider = ({ value, onChange, selectedLevels }) => {
  // Get color for current value
  const getCurrentColor = (val) => {
    if (val >= 1 && val <= 3) return INTENSITY_LEVELS.LOW.color;
    if (val >= 4 && val <= 6) return INTENSITY_LEVELS.MEDIUM.color;
    if (val >= 7 && val <= 10) return INTENSITY_LEVELS.HIGH.color;
    return INTENSITY_LEVELS.MEDIUM.color;
  };
  
  const currentColor = getCurrentColor(value);
  
  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="px-2">
        <Slider
          min={1}
          max={10}
          value={value}
          onChange={onChange}
          className="intensity-slider"
          trackStyle={{ backgroundColor: currentColor, height: 6 }}
          handleStyle={{
            borderColor: currentColor,
            backgroundColor: currentColor,
            width: 20,
            height: 20,
            marginTop: -7
          }}
          railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
        />
      </div>
      
      {/* Intensity markers */}
      <div className="flex justify-between text-xs text-gray-500 px-2">
        {Array.from({ length: 10 }).map((_, index) => {
          const intensity = index + 1;
          return (
            <div
              key={intensity}
              className="flex flex-col items-center"
            >
              <div className="w-1 h-2 bg-gray-300 rounded-full mb-1" />
              <span>{intensity}</span>
            </div>
          );
        })}
      </div>
      
      {/* Level indicators */}
      <div className="flex justify-between text-xs">
        <span className="text-red-600 font-medium">Low (1-3)</span>
        <span className="text-yellow-600 font-medium">Medium (4-6)</span>
        <span className="text-green-600 font-medium">High (7-10)</span>
      </div>
    </div>
  );
};

/**
 * Main intensity range filter component
 * Allows selection by level cards or range slider
 */
export default function IntensityRangeFilter({ className = '' }) {
  const { intensities: selectedIntensities, toggleIntensity } = useFilterContext();
  const [sliderValue, setSliderValue] = useState(5);
  const [viewMode, setViewMode] = useState('levels'); // 'levels' or 'slider'
  
  // Update slider when level selections change
  useEffect(() => {
    if (selectedIntensities.length === 1) {
      const level = INTENSITY_LEVELS[selectedIntensities[0]];
      if (level) {
        setSliderValue(Math.floor((level.min + level.max) / 2));
      }
    }
  }, [selectedIntensities]);
  
  // Handle slider change - auto-select appropriate level
  const handleSliderChange = (value) => {
    setSliderValue(value);
    
    // Determine which level this value falls into
    let targetLevel = 'MEDIUM';
    if (value >= 1 && value <= 3) targetLevel = 'LOW';
    else if (value >= 7 && value <= 10) targetLevel = 'HIGH';
    
    // Auto-select the level if not already selected
    if (!selectedIntensities.includes(targetLevel)) {
      toggleIntensity(targetLevel);
    }
  };
  
  // Clear all selections
  const clearAll = () => {
    selectedIntensities.forEach(intensity => {
      toggleIntensity(intensity);
    });
  };
  
  // Select all levels
  const selectAll = () => {
    const allLevels = Object.keys(INTENSITY_LEVELS);
    if (selectedIntensities.length === allLevels.length) {
      // Deselect all
      clearAll();
    } else {
      // Select missing ones
      allLevels.forEach(level => {
        if (!selectedIntensities.includes(level)) {
          toggleIntensity(level);
        }
      });
    }
  };
  
  const hasSelections = selectedIntensities.length > 0;
  const allSelected = selectedIntensities.length === Object.keys(INTENSITY_LEVELS).length;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Intensity Levels</h3>
          <p className="text-sm text-gray-600">
            Filter by emotional intensity ({selectedIntensities.length} selected)
          </p>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          
          {hasSelections && (
            <>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* View mode toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => setViewMode('levels')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'levels'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Level Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Range Slider
          </button>
        </div>
      </div>
      
      {/* Content based on view mode */}
      {viewMode === 'levels' ? (
        /* Level cards view */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(INTENSITY_LEVELS).map(([levelKey, level]) => (
            <IntensityLevelCard
              key={levelKey}
              level={level}
              levelKey={levelKey}
              isSelected={selectedIntensities.includes(levelKey)}
              onToggle={toggleIntensity}
            />
          ))}
        </div>
      ) : (
        /* Slider view */
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="mb-4 text-center">
            <span className="text-2xl font-bold text-gray-900">{sliderValue}</span>
            <span className="text-sm text-gray-600 ml-2">/ 10</span>
          </div>
          
          <IntensitySlider
            value={sliderValue}
            onChange={handleSliderChange}
            selectedLevels={selectedIntensities}
          />
          
          <p className="text-sm text-gray-600 text-center mt-4">
            Move the slider to automatically select intensity levels
          </p>
        </div>
      )}
      
      {/* Selection summary */}
      {hasSelections && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-purple-50 rounded-lg"
        >
          <p className="text-sm text-purple-700">
            <strong>Active filters:</strong>{' '}
            {selectedIntensities.map(key => INTENSITY_LEVELS[key]?.label).join(', ')} intensity
          </p>
        </motion.div>
      )}
    </div>
  );
}