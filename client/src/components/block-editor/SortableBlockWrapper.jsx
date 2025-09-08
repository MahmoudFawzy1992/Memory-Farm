import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import BlockControls from './BlockControls';
import BlockRenderer from './BlockRegistry';

export default function SortableBlockWrapper({ 
  block, 
  children, 
  onDelete, 
  onChange,
  isDragging = false 
}) {
  const [showControls, setShowControls] = useState(false);
  const isFirstMoodBlock = block.type === 'mood' && block.isRequired;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ 
    id: block.id,
    disabled: isFirstMoodBlock // Disable sorting for first mood block
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    onDelete(block.id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`group relative ${sortableIsDragging ? 'z-50' : ''} ${
        isFirstMoodBlock ? 'cursor-default' : ''
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Block Controls */}
      <BlockControls
        show={showControls}
        onDelete={handleDelete}
        isDragging={sortableIsDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        blockType={block.type}
        isFirstMoodBlock={isFirstMoodBlock}
      />

      {/* Block content wrapper */}
      <div className={`border-2 rounded-xl transition-all duration-200 ${
        sortableIsDragging 
          ? 'border-purple-400 shadow-lg bg-purple-50' 
          : isFirstMoodBlock
            ? 'border-purple-200 bg-purple-25'
            : showControls 
              ? 'border-gray-300' 
              : 'border-transparent hover:border-gray-200'
      }`}>
        {children || <BlockRenderer block={block} onChange={onChange} />}
      </div>
    </motion.div>
  );
}