/**
 * Preset button component for date range selection
 */
export default function PresetButton({ preset, isSelected, onClick }) {
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
}