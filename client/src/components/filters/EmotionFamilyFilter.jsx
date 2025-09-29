// Location: client/src/components/filters/EmotionFamilyFilter.jsx
// Emotion family filter with individual emotion selection support

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emotionFamilies } from '../../constants/emotions';
import { useFilterContext } from '../../context/FilterContext';

const EmotionFamilyCard = ({ 
  familyKey, 
  family, 
  isFullySelected,
  isPartiallySelected,
  onToggleFamily, 
  isExpanded, 
  onExpand 
}) => {
  const { 
    isEmotionSelected, 
    toggleEmotion, 
    selectAllInFamily, 
    deselectAllInFamily 
  } = useFilterContext();
  
  const emotionCount = family.emotions.length;
  const selectedCount = family.emotions.filter(e => isEmotionSelected(e.label)).length;
  
  return (
    <motion.div
      layout
      className={`rounded-xl border-2 transition-all duration-200 ${
        isFullySelected
          ? 'border-purple-500 bg-purple-50' 
          : isPartiallySelected
          ? 'border-purple-300 bg-purple-25'
          : 'border-gray-200 bg-white hover:border-purple-300'
      }`}
    >
      {/* Family header */}
      <div className="p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleFamily(familyKey)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div 
            className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: family.color }}
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{family.label}</h3>
            <p className="text-sm text-gray-500">
              {selectedCount > 0 ? `${selectedCount} of ${emotionCount}` : `${emotionCount} emotions`}
            </p>
          </div>
        </button>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Selection indicator */}
          {isFullySelected && (
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {isPartiallySelected && !isFullySelected && (
            <div className="w-5 h-5 bg-purple-300 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
          
          {/* Expand button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(familyKey);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expandable individual emotions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 pt-3 space-y-3">
              {/* Quick actions */}
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs font-medium text-gray-600">Select emotions:</p>
                <div className="flex items-center gap-2">
                  {isFullySelected ? (
                    <button
                      type="button"
                      onClick={() => deselectAllInFamily(familyKey)}
                      className="text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectAllInFamily(familyKey)}
                      className="text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
                    >
                      Select All
                    </button>
                  )}
                </div>
              </div>
              
              {/* Individual emotion checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {family.emotions.map((emotion) => {
                  const selected = isEmotionSelected(emotion.label);
                  
                  return (
                    <button
                      key={emotion.label}
                      type="button"
                      onClick={() => toggleEmotion(emotion.label)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selected
                          ? 'bg-purple-100 border-2 border-purple-400 text-purple-900'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-25'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selected
                          ? 'bg-purple-500 border-purple-500'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <span className="text-base">{emotion.emoji}</span>
                      <span className="truncate">{emotion.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function EmotionFamilyFilter({ className = '' }) {
  const { 
    emotions: selectedEmotions,
    isFamilyFullySelected,
    isFamilyPartiallySelected,
    toggleEmotionFamily,
    resetFilters
  } = useFilterContext();
  
  const [expandedFamilies, setExpandedFamilies] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  
  const toggleExpansion = (familyKey) => {
    setExpandedFamilies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyKey)) {
        newSet.delete(familyKey);
      } else {
        newSet.add(familyKey);
      }
      return newSet;
    });
  };
  
  const familyEntries = Object.entries(emotionFamilies);
  const displayedFamilies = showAll ? familyEntries : familyEntries.slice(0, 4);
  const hasMore = familyEntries.length > 4;
  
  const hasSelections = selectedEmotions.length > 0;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Filter by emotional categories ({selectedEmotions.length} emotion{selectedEmotions.length !== 1 ? 's' : ''} selected)
          </p>
        </div>
        
        {hasSelections && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Family cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {displayedFamilies.map(([familyKey, family]) => (
            <EmotionFamilyCard
              key={familyKey}
              familyKey={familyKey}
              family={family}
              isFullySelected={isFamilyFullySelected(familyKey)}
              isPartiallySelected={isFamilyPartiallySelected(familyKey)}
              onToggleFamily={toggleEmotionFamily}
              isExpanded={expandedFamilies.has(familyKey)}
              onExpand={toggleExpansion}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Show more toggle */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            <span>{showAll ? 'Show Less' : `Show ${familyEntries.length - 4} More`}</span>
            <svg 
              className={`w-4 h-4 transform transition-transform ${showAll ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}