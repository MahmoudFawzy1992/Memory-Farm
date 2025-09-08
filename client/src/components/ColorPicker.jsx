import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
];

// Utility: decide if foreground should be light or dark
function getContrastColor(hex) {
  if (!hex || hex.length < 7) return "#000"; 
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#111" : "#fff"; // dark text for light bg, white for dark bg
}

export default function ColorSelect({ 
  color: value = '#8B5CF6', 
  setColor: onChange, 
  label = "Memory Color",
  error 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value);
  const [customColor, setCustomColor] = useState(value);

  const contrastColor = getContrastColor(selectedColor);

  useEffect(() => {
    setSelectedColor(value);
    setCustomColor(value);
  }, [value]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onChange(color);
  };

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    setSelectedColor(color);
    onChange(color);
  };

  const handlePresetSelect = (color) => {
    handleColorSelect(color);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
            error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ backgroundColor: selectedColor }}
        >
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-3">
              {/* Color circle */}
              <div 
                className="w-6 h-6 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: selectedColor, borderColor: contrastColor }}
              />
              {/* Hex value */}
              <span 
                className="text-sm font-mono"
                style={{ color: contrastColor }}
              >
                {selectedColor.toUpperCase()}
              </span>
            </div>
            {/* Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
              style={{ color: contrastColor }}
            >
              <path d="M19.71 4.29a1 1 0 0 0-1.42 0l-2.12 2.12-1.17-1.17a2.5 2.5 0 0 0-3.54 0l-1.17 1.17-1.41-1.41-1.42 1.41 1.41 1.42-6.3 6.29a1 1 0 0 0-.29.71V20a2 2 0 0 0 2 2h4.24c.27 0 .52-.11.71-.29l6.29-6.3 1.42 1.41 1.41-1.41-1.41-1.42 1.17-1.17a2.5 2.5 0 0 0 0-3.54l-1.17-1.17 2.12-2.12a1 1 0 0 0 0-1.42zM8.41 18H6v-2.41l6.29-6.29 2.41 2.41L8.41 18z"/>
            </svg>

          </div>
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl w-full min-w-[320px]"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Colors</h3>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => handlePresetSelect(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Color</h3>
                <div className="space-y-3">
                  <HexColorPicker
                    color={customColor}
                    onChange={handleCustomColorChange}
                    className="!w-full !h-32"
                  />
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: customColor }}
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          handleCustomColorChange(value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
