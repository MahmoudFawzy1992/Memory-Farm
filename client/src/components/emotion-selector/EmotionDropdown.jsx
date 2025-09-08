import { motion } from 'framer-motion';

export default function EmotionDropdown({ 
  filteredEmotions, 
  highlightedIndex, 
  searchTerm, 
  onEmotionSelect 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
    >
      <div className="overflow-y-auto max-h-80 py-2">
        {filteredEmotions.map((group, groupIndex) => (
          <div key={group.family}>
            {/* Group header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <h3 
                className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ color: group.color }}
              >
                {group.family}
              </h3>
            </div>
            
            {/* Emotions */}
            {group.emotions.length > 0 ? (
              group.emotions.map((emotion, index) => {
                const globalIndex = filteredEmotions
                  .slice(0, groupIndex)
                  .reduce((acc, g) => acc + g.emotions.length, 0) + index;
                
                return (
                  <button
                    type="button"
                    key={emotion.label}
                    onClick={() => onEmotionSelect(emotion)}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-150 flex items-center gap-3 ${
                      globalIndex === highlightedIndex ? 'bg-purple-100' : ''
                    }`}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <span className="text-xl">{emotion.emoji}</span>
                    <span className="text-gray-900 font-medium">{emotion.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm">No emotions match "{searchTerm}"</p>
                <p className="text-xs mt-1">Try searching for feelings like "happy", "sad", or "excited"</p>
              </div>
            )}
          </div>
        ))}
        
        {/* Quick tip at bottom */}
        {!searchTerm && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Start typing to search, or browse by category above
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}