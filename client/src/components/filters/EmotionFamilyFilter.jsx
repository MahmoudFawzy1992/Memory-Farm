// Expandable emotion family filter with individual emotion selection
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emotionFamilies } from '../../constants/emotions';
import { useFilterContext } from '../../context/FilterContext';

/**
 * Individual emotion family card with expand/collapse functionality
 */
const EmotionFamilyCard = ({ 
  familyKey, 
  family, 
  isSelected, 
  onToggle, 
  isExpanded, 
  onExpand 
}) => {
  const emotionCount = family.emotions.length;
  
  return (
    <motion.div
      layout
      className={`rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 bg-white hover:border-purple-300'
      }`}
    >
      {/* Main family header */}
      <div 
        className="p-4 flex items-center justify-between"
        onClick={() => onToggle(familyKey)}
      >
        <div className="flex items-center gap-3">
          {/* Family color indicator */}
          <div 
            className="w-4 h-4 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: family.color }}
          />
          
          {/* Family info */}
          <div>
            <h3 className="font-medium text-gray-900">{family.label}</h3>
            <p className="text-sm text-gray-500">{emotionCount} emotions</p>
          </div>
        </div>
        
        {/* Selection indicator and expand button */}
        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(familyKey);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="p-4 pt-3">
              <p className="text-sm text-gray-600 mb-3">Individual emotions in this family:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {family.emotions.map((emotion) => (
                  <div
                    key={emotion.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm"
                  >
                    <span className="text-lg">{emotion.emoji}</span>
                    <span className="text-gray-700">{emotion.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Main emotion family filter component
 * Allows users to select emotion families with expandable individual emotions
 */
export default function EmotionFamilyFilter({ className = '' }) {
  const { families: selectedFamilies, toggleEmotionFamily } = useFilterContext();
  const [expandedFamilies, setExpandedFamilies] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  
  // Toggle expansion of family details
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
  
  // Get families to display (first 4 or all)
  const familyEntries = Object.entries(emotionFamilies);
  const displayedFamilies = showAll ? familyEntries : familyEntries.slice(0, 4);
  const hasMore = familyEntries.length > 4;
  
  // Quick action handlers
  const selectAll = () => {
    const allFamilyKeys = Object.keys(emotionFamilies);
    // Toggle: if all are selected, clear; otherwise select all
    if (selectedFamilies.length === allFamilyKeys.length) {
      allFamilyKeys.forEach(key => {
        if (selectedFamilies.includes(key)) {
          toggleEmotionFamily(key);
        }
      });
    } else {
      allFamilyKeys.forEach(key => {
        if (!selectedFamilies.includes(key)) {
          toggleEmotionFamily(key);
        }
      });
    }
  };
  
  const clearAll = () => {
    selectedFamilies.forEach(family => {
      toggleEmotionFamily(family);
    });
  };
  
  const allSelected = selectedFamilies.length === Object.keys(emotionFamilies).length;
  const hasSelections = selectedFamilies.length > 0;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Emotion Families</h3>
          <p className="text-sm text-gray-600">
            Filter by emotional categories ({selectedFamilies.length} selected)
          </p>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          
          {hasSelections && (
            <>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Family cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {displayedFamilies.map(([familyKey, family]) => (
            <EmotionFamilyCard
              key={familyKey}
              familyKey={familyKey}
              family={family}
              isSelected={selectedFamilies.includes(familyKey)}
              onToggle={toggleEmotionFamily}
              isExpanded={expandedFamilies.has(familyKey)}
              onExpand={toggleExpansion}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Show more/less toggle */}
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
      
      {/* Selection summary */}
      {hasSelections && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-purple-50 rounded-lg"
        >
          <p className="text-sm text-purple-700">
            <strong>Active filters:</strong>{' '}
            {selectedFamilies.map(key => emotionFamilies[key]?.label).join(', ')}
          </p>
        </motion.div>
      )}
    </div>
  );
}