import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { getAvailableBlockTypes, createBlock } from './BlockTypeDefinitions';

// Individual draggable block item in the carousel
const DraggableBlockItem = ({ blockType, onAddBlock, isActive }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-${blockType.id}`,
    data: { type: 'block-type', blockType: blockType.id }
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.1 : 1})`,
    zIndex: isDragging ? 1000 : 1
  } : {};

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddBlock(blockType.id);
  };

  return (
    <motion.button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={handleClick}
      className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all duration-300 cursor-grab active:cursor-grabbing ${
        isActive 
          ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-110' 
          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-md'
      }`}
      style={dragStyle}
      whileHover={{ scale: isActive ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`${blockType.name}: ${blockType.description}`}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-2xl mb-1">{blockType.icon}</span>
        <span className="text-xs font-medium px-1 text-center leading-tight">
          {blockType.name}
        </span>
      </div>
    </motion.button>
  );
};

// Main floating block selector component
export default function FloatingBlockSelector({ 
  existingBlocks, 
  onAddBlock, 
  position = 'bottom-right',
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const availableBlocks = getAvailableBlockTypes(existingBlocks);
  
  if (availableBlocks.length === 0 || disabled) {
    return null;
  }

  const handleAddBlock = (blockType) => {
    const newBlock = createBlock(blockType);
    onAddBlock(newBlock);
    setIsOpen(false);
  };

  const handleRotateCarousel = (direction) => {
    setActiveIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % availableBlocks.length;
      } else {
        return prev === 0 ? availableBlocks.length - 1 : prev - 1;
      }
    });
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6 z-50';
      case 'bottom-left':
        return 'fixed bottom-6 left-6 z-50';
      case 'top-right':
        return 'fixed top-20 right-6 z-50';
      default:
        return 'fixed bottom-6 right-6 z-50';
    }
  };

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Add Blocks</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              <div 
                ref={carouselRef}
                className="flex gap-3 overflow-hidden px-2"
                style={{ width: '280px' }}
              >
                <motion.div
                  className="flex gap-3 transition-transform duration-300"
                  animate={{ x: -activeIndex * 92 }}
                >
                  {availableBlocks.map((blockType, index) => (
                    <DraggableBlockItem
                      key={blockType.id}
                      blockType={blockType}
                      onAddBlock={handleAddBlock}
                      isActive={index === activeIndex}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Navigation arrows for multiple blocks */}
              {availableBlocks.length > 3 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRotateCarousel('prev');
                    }}
                    type="button"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRotateCarousel('next');
                    }}
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Drag blocks to add them or click to insert
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
        className={`w-14 h-14 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isOpen 
            ? 'bg-purple-600 border-purple-600 text-white rotate-45' 
            : 'bg-white border-purple-200 text-purple-600 hover:border-purple-400 hover:shadow-xl'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isOpen ? 'Close block selector' : 'Add more blocks'}
      >
        <div className="flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </motion.button>
    </div>
  );
}