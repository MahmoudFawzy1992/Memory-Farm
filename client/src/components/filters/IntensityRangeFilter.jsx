import { useFilterContext } from '../../context/FilterContext';
import { INTENSITY_LEVELS } from '../../utils/filterUtils';
import { areAllLevelsSelected, getAllIntensityLevels } from '../../utils/intensityUtils';
import IntensityLevelCard from './intensityRangeFilter/IntensityLevelCard';
import SelectionSummary from './intensityRangeFilter/SelectionSummary';

/**
 * Simplified intensity range filter component
 * Only shows level cards (slider removed)
 */
export default function IntensityRangeFilter({ className = '' }) {
  const { intensities: selectedIntensities, toggleIntensity } = useFilterContext();
  
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
          <p className="text-sm text-gray-600">
            Select emotional intensity levels ({selectedIntensities.length} selected)
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
      
      {/* Level cards - 3 cards only */}
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
      
      {/* Selection summary */}
      <SelectionSummary selectedIntensities={selectedIntensities} />
    </div>
  );
}