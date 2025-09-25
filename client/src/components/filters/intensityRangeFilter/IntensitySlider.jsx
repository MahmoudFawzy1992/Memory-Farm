import Slider from 'rc-slider';
import { INTENSITY_LEVELS } from '../../../utils/filterUtils';

// Import rc-slider styles (will be handled by CSS)
import 'rc-slider/assets/index.css';

/**
 * Custom slider with intensity level markers
 */
export default function IntensitySlider({ value, onChange, selectedLevels }) {
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
}