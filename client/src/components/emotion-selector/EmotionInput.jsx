import { forwardRef } from 'react';

const EmotionInput = forwardRef(function EmotionInput({
  selectedEmotion,
  searchTerm,
  placeholder,
  error,
  isOpen,
  onInputChange,
  onInputFocus,
  onKeyDown,
  onClear,
  onToggle
}, ref) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={selectedEmotion ? `${selectedEmotion.emoji} ${selectedEmotion.label}` : searchTerm}
        onChange={onInputChange}
        onFocus={onInputFocus}
        onKeyDown={onKeyDown}
        placeholder={selectedEmotion ? '' : placeholder}
        className={`w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
          error ? 'border-red-500 ring-red-200' : ''
        } ${selectedEmotion ? 'text-lg' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      />
      
      {/* Clear button */}
      {selectedEmotion && (
        <button
          onClick={onClear}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear selection"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* Dropdown arrow */}
      <button
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Toggle dropdown"
        type="button"
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
});

export default EmotionInput;