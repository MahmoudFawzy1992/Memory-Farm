import { DATE_PRESETS } from '../../../constants/dateRangePresets';
import PresetButton from './PresetButton';

/**
 * Grid of preset date range buttons
 */
export default function PresetGrid({ 
  selectedPreset, 
  currentPreset, 
  onPresetSelect, 
  showPresets = true 
}) {
  if (!showPresets) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(DATE_PRESETS).map(([key, preset]) => (
          <PresetButton
            key={key}
            preset={preset}
            isSelected={selectedPreset === key || currentPreset === key}
            onClick={() => onPresetSelect(key)}
          />
        ))}
      </div>
    </div>
  );
}