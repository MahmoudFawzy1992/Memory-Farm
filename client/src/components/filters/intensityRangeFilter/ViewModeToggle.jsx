/**
 * Toggle component for switching between level cards and slider views
 */
export default function ViewModeToggle({ viewMode, setViewMode }) {
  return (
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
  );
}