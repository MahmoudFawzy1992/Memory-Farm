import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeadingSelector({ 
  onSelect, 
  isOpen, 
  onToggle 
}) {
  const dropdownRef = useRef(null);

  const headingOptions = [
    { level: 0, label: 'Normal', preview: 'Normal text' },
    { level: 1, label: 'H1', preview: 'Heading 1' },
    { level: 2, label: 'H2', preview: 'Heading 2' },
    { level: 3, label: 'H3', preview: 'Heading 3' },
    { level: 4, label: 'H4', preview: 'Heading 4' },
    { level: 5, label: 'H5', preview: 'Heading 5' },
    { level: 6, label: 'H6', preview: 'Heading 6' }
  ];

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
        className="px-3 h-8 rounded-md flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
        title="Heading levels"
      >
        <span>H</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px]"
          >
            {headingOptions.map((option) => (
              <button
                key={option.level}
                type="button"
                onClick={() => {
                  onSelect(option.level);
                  onToggle(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-sm text-gray-700">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}