import { useState, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { TouchSensor } from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingBlockSelector from './FloatingBlockSelector';
import SortableBlockWrapper from './SortableBlockWrapper';
import DropZone from './DropZone';
import { createBlock, validateBlock } from './BlockTypeDefinitions';

// Empty state component
const EmptyState = ({ placeholder }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center"
  >
    <div className="text-4xl mb-4">📝</div>
    <p className="text-gray-500 text-lg mb-2">{placeholder}</p>
    <p className="text-gray-400 text-sm">
      Click the + button to add your first block
    </p>
  </motion.div>
);

export default function BlockEditor({
  blocks = [],
  onChange,
  placeholder = "Start writing your memory...",
  maxBlocks = 10,
  disabled = false
}) {
  const [activeId, setActiveId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

// Configure drag sensors with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { 
        delay: 500, 
        tolerance: 5 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // Get sortable blocks (excluding first mood block)
  const sortableBlocks = blocks.filter((block, index) => 
    !(block.type === 'mood' && index === 0)
  );

  // Get the first mood block if it exists
  const firstMoodBlock = blocks.find((block, index) => 
    block.type === 'mood' && index === 0
  );

  // Block management handlers
  const handleAddBlock = useCallback((newBlock) => {
    if (blocks.length >= maxBlocks) {
      console.warn(`Maximum ${maxBlocks} blocks allowed`);
      return;
    }

    onChange([...blocks, newBlock]);
  }, [blocks, maxBlocks, onChange]);

  const handleDeleteBlock = useCallback((blockId) => {
    // Prevent deletion of first mood block
    const blockToDelete = blocks.find(block => block.id === blockId);
    if (blockToDelete?.type === 'mood' && blocks.indexOf(blockToDelete) === 0) {
      return;
    }
    
    onChange(blocks.filter(block => block.id !== blockId));
  }, [blocks, onChange]);

  // Drag handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) {
      setDragOverIndex(null);
      return;
    }

    if (active.data.current?.type === 'block-type') {
      const overIndex = sortableBlocks.findIndex(block => block.id === over.id);
      setDragOverIndex(overIndex >= 0 ? overIndex + 1 : sortableBlocks.length + 1);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverIndex(null);

    if (!over) return;

    if (active.data.current?.type === 'block-type') {
      const blockType = active.data.current.blockType;
      const newBlock = createBlock(blockType);
      const overIndex = sortableBlocks.findIndex(block => block.id === over.id);
      
      if (overIndex >= 0) {
        // Insert at specific position (accounting for mood block at index 0)
        const newBlocks = [...blocks];
        newBlocks.splice(overIndex + 1, 0, newBlock);
        onChange(newBlocks);
      } else {
        handleAddBlock(newBlock);
      }
      return;
    }

    // Handle reordering of sortable blocks only
    const activeIndex = sortableBlocks.findIndex(block => block.id === active.id);
    const overIndex = sortableBlocks.findIndex(block => block.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const reorderedSortableBlocks = arrayMove(sortableBlocks, activeIndex, overIndex);
      
      // Reconstruct full blocks array with mood block at start
      const newBlocks = firstMoodBlock 
        ? [firstMoodBlock, ...reorderedSortableBlocks]
        : reorderedSortableBlocks;
      
      onChange(newBlocks);
    }
  };

  return (
    <div className="relative min-h-[400px]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4 pb-20">
          {blocks.length === 0 ? (
            <EmptyState placeholder={placeholder} />
          ) : (
            <>
              {/* Fixed mood tracker at top */}
              {firstMoodBlock && (
                <div className="mb-6">
                  <SortableBlockWrapper
                    block={{...firstMoodBlock, isRequired: true}}
                    onDelete={handleDeleteBlock}
                    onChange={(updatedBlock) => {
                      const newBlocks = blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
                      onChange(newBlocks);
                    }}
                    isDragging={false}
                  />
                </div>
              )}

              {/* Separator and hint */}
              {firstMoodBlock && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm text-gray-500 text-center">
                    Add more content blocks below
                  </p>
                </div>
              )}

              {/* Sortable blocks */}
              {sortableBlocks.length > 0 && (
                <SortableContext 
                  items={sortableBlocks} 
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {sortableBlocks.map((block, index) => (
                      <div key={block.id}>
                        {dragOverIndex === index + 1 && <DropZone isActive={true} position="above" />}
                        
                        <SortableBlockWrapper
                          block={block}
                          onDelete={handleDeleteBlock}
                          onChange={(updatedBlock) => {
                            const newBlocks = blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
                            onChange(newBlocks);
                          }}
                          isDragging={activeId === block.id}
                        />

                        {index === sortableBlocks.length - 1 && 
                         dragOverIndex === sortableBlocks.length + 1 && (
                          <DropZone isActive={true} position="below" />
                        )}
                      </div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              )}

              {/* Drop zone for empty sortable area */}
              {sortableBlocks.length === 0 && (
                <div className="py-8">
                  <DropZone isActive={false} />
                  <p className="text-center text-gray-400 text-sm mt-2">
                    Drop blocks here or use the + button
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-purple-400 rounded-xl shadow-lg p-4 opacity-90">
              Dragging block...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <FloatingBlockSelector
        existingBlocks={blocks}
        onAddBlock={handleAddBlock}
        disabled={disabled || blocks.length >= maxBlocks}
      />
    </div>
  );
}