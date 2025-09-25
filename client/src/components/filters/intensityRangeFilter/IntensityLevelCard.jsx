import { motion } from 'framer-motion';

/**
 * Individual intensity level card component
 */
export default function IntensityLevelCard({ level, levelKey, isSelected, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(levelKey)}
      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left w-full ${
        isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level.color }}
          />
          <span className="font-medium text-gray-900">{level.label}</span>
        </div>
        
        {isSelected && (
          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        Range: {level.min} - {level.max}
      </div>
      
      {/* Visual intensity indicator */}
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 10 }).map((_, index) => {
          const intensity = index + 1;
          const isInRange = intensity >= level.min && intensity <= level.max;
          return (
            <div
              key={intensity}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isInRange ? 'opacity-100' : 'opacity-20'
              }`}
              style={{ 
                backgroundColor: isInRange ? level.color : '#E5E7EB' 
              }}
            />
          );
        })}
      </div>
    </motion.button>
  );
}