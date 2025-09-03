import { useState, useCallback } from 'react';

export default function useKeyboardNavigation({ 
  isOpen, 
  setIsOpen, 
  filteredEmotions, 
  onSelect, 
  inputRef 
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    const allOptions = filteredEmotions.flatMap(group => group.emotions);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % allOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev === 0 ? allOptions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (allOptions[highlightedIndex]) {
          onSelect(allOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, setIsOpen, filteredEmotions, onSelect, inputRef, highlightedIndex]);

  return {
    highlightedIndex,
    setHighlightedIndex,
    handleKeyDown
  };
}