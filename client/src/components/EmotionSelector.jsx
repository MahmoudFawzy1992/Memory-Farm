import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { allEmotions } from '../constants/emotions';
import EmotionInput from './emotion-selector/EmotionInput';
import EmotionDropdown from './emotion-selector/EmotionDropdown';
import useEmotionSearch from '../hooks/useEmotionSearch';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

export default function EmotionSelector({ 
  value, 
  onChange, 
  placeholder = "How are you feeling?",
  error,
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Custom hooks for logic separation
  const { filteredEmotions } = useEmotionSearch(searchTerm);
  const { highlightedIndex, setHighlightedIndex, handleKeyDown } = useKeyboardNavigation({
    isOpen,
    setIsOpen,
    filteredEmotions,
    onSelect: handleEmotionSelect,
    inputRef
  });

  // Initialize selected emotion from value
  useEffect(() => {
    if (value) {
      const cleanValue = value.replace(/^\p{Emoji}+/u, '').trim();
      const emotion = allEmotions.find(e => e.label.toLowerCase() === cleanValue.toLowerCase());
      setSelectedEmotion(emotion || null);
    } else {
      setSelectedEmotion(null);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleEmotionSelect(emotion) {
    setSelectedEmotion(emotion);
    onChange(`${emotion.emoji} ${emotion.label}`);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  }

  const handleClear = () => {
    setSelectedEmotion(null);
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Emotion {required && <span className="text-red-500">*</span>}
      </label>
      
      <EmotionInput
        ref={inputRef}
        selectedEmotion={selectedEmotion}
        searchTerm={searchTerm}
        placeholder={placeholder}
        error={error}
        isOpen={isOpen}
        onInputChange={handleInputChange}
        onInputFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <EmotionDropdown
            filteredEmotions={filteredEmotions}
            highlightedIndex={highlightedIndex}
            searchTerm={searchTerm}
            onEmotionSelect={handleEmotionSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}