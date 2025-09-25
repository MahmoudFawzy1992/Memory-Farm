import { useState, useEffect } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import { INTENSITY_LEVELS } from '../../utils/filterUtils';
import { 
  getIntensityLevelFromValue, 
  getMiddleValueForLevel, 
  areAllLevelsSelected, 
  getAllIntensityLevels 
} from '../../utils/intensityUtils';
import IntensityLevelCard from './intensityRangeFilter/IntensityLevelCard';
import IntensitySlider from './intensityRangeFilter/IntensitySlider';
import ViewModeToggle from './intensityRangeFilter/ViewModeToggle';
import SelectionSummary from './intensityRangeFilter/SelectionSummary';

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
        setSliderValue(getMiddleValueForLevel(selectedIntensities[0]));
      }
    }
  }, [selectedIntensities]);
  
  // Handle slider change - auto-select appropriate level
  const handleSliderChange = (value) => {
    setSliderValue(value);
    
    const targetLevel = getIntensityLevelFromValue(value);
    
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
    const allLevels = getAllIntensityLevels();
    if (areAllLevelsSelected(selectedIntensities)) {
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
  const allSelected = areAllLevelsSelected(selectedIntensities);
  
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
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      
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
      <SelectionSummary selectedIntensities={selectedIntensities} />
    </div>
  );
}