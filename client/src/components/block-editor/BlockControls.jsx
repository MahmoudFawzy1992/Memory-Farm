import { motion, AnimatePresence } from 'framer-motion';

export default function BlockControls({ 
  show, 
  onDelete, 
  isDragging = false,
  dragHandleProps = {},
  blockType = '',
  isFirstMoodBlock = false
}) {
  // Don't show controls for the first mood block
  if (isFirstMoodBlock) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && !isDragging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -left-12 top-2 flex flex-col gap-1 z-10"
        >
          {/* Drag handle */}
          <button 
          type="button"
            {...dragHandleProps}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* Delete button */}
          <button
          type="button"
            onClick={onDelete}
            className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-500 transition-colors"
            title="Delete block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}