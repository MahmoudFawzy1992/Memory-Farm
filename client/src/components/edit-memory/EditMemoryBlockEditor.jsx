import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortableBlockWrapper from '../block-editor/SortableBlockWrapper';
import { validateBlock } from '../block-editor/BlockTypeDefinitions';

// Empty state component for edit mode
const EditEmptyState = ({ placeholder, onAddFirstBlock }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center"
  >
    <div className="text-4xl mb-4">📝</div>
    <p className="text-gray-500 text-lg mb-2">{placeholder}</p>
    <p className="text-gray-400 text-sm mb-4">
      Your memory seems to be empty. This shouldn't normally happen.
    </p>
    <button
      type="button"
      onClick={onAddFirstBlock}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      Add First Block
    </button>
  </motion.div>
);

/**
 * Specialized block editor for editing existing memories
 * Focuses on content modification rather than creation
 */
export default function EditMemoryBlockEditor({
  blocks = [],
  onChange,
  placeholder = "Edit your memory content...",
  disabled = false,
  errors = {}
}) {
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  // Handle block content updates
  const handleBlockChange = useCallback((updatedBlock) => {
    const newBlocks = blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    onChange(newBlocks);
  }, [blocks, onChange]);

  // Handle block deletion (with protection for first mood block)
  const handleDeleteBlock = useCallback((blockId) => {
    const blockToDelete = blocks.find(block => block.id === blockId);
    const blockIndex = blocks.indexOf(blockToDelete);
    
    // Prevent deletion of first mood block
    if (blockToDelete?.type === 'mood' && blockIndex === 0) {
      console.warn('Cannot delete the primary mood tracker');
      return;
    }
    
    // Prevent deletion if it would leave memory empty
    if (blocks.length <= 1) {
      console.warn('Cannot delete the last block');
      return;
    }
    
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onChange(newBlocks);
  }, [blocks, onChange]);

  // Add a default text block if memory is somehow empty
  const handleAddFirstBlock = useCallback(() => {
    const defaultTextBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
      props: {
        textAlignment: 'left',
        textColor: '#000000'
      }
    };
    onChange([defaultTextBlock]);
  }, [onChange]);

  // Get the first mood block if it exists
  const firstMoodBlock = blocks.find((block, index) => 
    block.type === 'mood' && index === 0
  );

  // Get all other blocks (sortable/editable blocks)
  const editableBlocks = blocks.filter((block, index) => 
    !(block.type === 'mood' && index === 0)
  );

  if (blocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <EditEmptyState 
          placeholder={placeholder}
          onAddFirstBlock={handleAddFirstBlock}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      <div className="space-y-6">
        {/* Fixed mood tracker at top (if exists) */}
        {firstMoodBlock && (
          <div className="mb-8">
            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600 font-medium">🎭 Primary Mood Tracker</span>
                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                  Required
                </span>
              </div>
              <p className="text-sm text-purple-600">
                This represents your main emotion for this memory
              </p>
            </div>
            
            <SortableBlockWrapper
              block={{...firstMoodBlock, isRequired: true}}
              onDelete={handleDeleteBlock}
              onChange={handleBlockChange}
              isDragging={false}
            />
            
            {/* Show validation error for mood block */}
            {errors[`block_0`] && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm">
                  <strong>Mood Tracker:</strong> {errors[`block_0`]}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Separator if mood block exists */}
        {firstMoodBlock && editableBlocks.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="text-center">
              <span className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
                Additional Content Blocks
              </span>
            </div>
          </div>
        )}

        {/* Editable content blocks */}
        {editableBlocks.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {editableBlocks.map((block, index) => {
                const actualIndex = firstMoodBlock ? index + 1 : index;
                
                return (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableBlockWrapper
                      block={block}
                      onDelete={handleDeleteBlock}
                      onChange={handleBlockChange}
                      isDragging={false}
                    />
                    
                    {/* Show validation errors for this block */}
                    {errors[`block_${actualIndex}`] && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-600 text-sm">
                          <strong>Block {actualIndex + 1}:</strong> {errors[`block_${actualIndex}`]}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state when no additional blocks */}
        {editableBlocks.length === 0 && firstMoodBlock && (
          <div className="py-12 text-center text-gray-500">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-lg mb-2">Just your mood tracker</p>
            <p className="text-sm">
              This memory contains only the mood tracker. You can add more content blocks when creating new memories.
            </p>
          </div>
        )}

        {/* Edit mode info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="flex-1">
              <h4 className="text-blue-800 font-medium mb-1">Editing Tips</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Click inside any block to edit its content</li>
                <li>• Use the toolbar in text blocks for formatting</li>
                <li>• Your primary mood tracker cannot be deleted</li>
                <li>• Changes are saved when you click "Update Memory"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}