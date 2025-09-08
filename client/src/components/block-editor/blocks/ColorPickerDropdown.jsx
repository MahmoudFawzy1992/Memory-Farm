import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ColorPickerDropdown({ 
  colors, 
  onSelect, 
  isOpen, 
  onToggle, 
  title 
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 border border-gray-200"
        title={title}
      >
        <div className="w-4 h-4 rounded border border-gray-300 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
          >
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    onSelect(color.value);
                    onToggle(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <input
                type="color"
                onChange={(e) => {
                  onSelect(e.target.value);
                  onToggle(false);
                }}
                className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                title="Custom color"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}