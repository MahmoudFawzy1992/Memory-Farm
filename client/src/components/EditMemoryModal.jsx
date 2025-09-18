import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EditMemoryLayout from "./edit-memory/EditMemoryLayout";
import EditMemoryFormActions from "./edit-memory/EditMemoryFormActions";
import { validateMemoryForm, getEmotionFromMoodBlocks } from "../utils/NewMemoryValidation";
import { validateBlock } from "./block-editor/BlockTypeDefinitions";

/**
 * Full-screen edit memory experience
 * Transforms from modal to full-screen editing interface
 */
export default function EditMemoryModal({
  show,
  onClose,
  onUpdate,
  memory,
  isSubmitting: externalIsSubmitting = false
}) {
  // Form state
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#8B5CF6");
  const [isPublic, setIsPublic] = useState(false);
  const [memoryDate, setMemoryDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Initialize form data when memory changes
  useEffect(() => {
    if (memory && show) {
      const initialTitle = memory.title || "";
      const initialColor = memory.color || "#8B5CF6";
      const initialIsPublic = Boolean(memory.isPublic);
      const initialDate = memory.memoryDate ? new Date(memory.memoryDate) : new Date(memory.createdAt);
      const initialBlocks = Array.isArray(memory.content) ? memory.content : [];

      setTitle(initialTitle);
      setColor(initialColor);
      setIsPublic(initialIsPublic);
      setMemoryDate(initialDate);
      setBlocks(initialBlocks);
      setErrors({});
      setHasChanges(false);

      // Store original data for comparison
      setOriginalData({
        title: initialTitle,
        color: initialColor,
        isPublic: initialIsPublic,
        memoryDate: initialDate,
        blocks: initialBlocks
      });
    }
  }, [memory, show]);

  // Track changes
  useEffect(() => {
    if (!originalData) return;

    const currentData = { title, color, isPublic, memoryDate, blocks };
    const hasDataChanged = JSON.stringify(currentData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [title, color, isPublic, memoryDate, blocks, originalData]);

  // Handle block changes with validation clearing
  const handleBlocksChange = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    
    // Clear previous block errors
    setErrors(prev => {
      const filtered = { ...prev };
      Object.keys(filtered).forEach(key => {
        if (key.startsWith('block_')) {
          delete filtered[key];
        }
      });
      return filtered;
    });
  }, []);

  // Validate blocks individually
  const validateBlocks = (blocksToValidate) => {
    const blockErrors = {};
    
    blocksToValidate.forEach((block, index) => {
      const validation = validateBlock(block);
      if (!validation.valid) {
        blockErrors[`block_${index}`] = validation.errors.join(', ');
      }
    });
    
    return blockErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form fields
    const formErrors = validateMemoryForm(title, blocks, color, memoryDate);
    
    // Validate individual blocks
    const blockErrors = validateBlocks(blocks);
    
    const allErrors = { ...formErrors, ...blockErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('[class*="border-red-500"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const emotion = getEmotionFromMoodBlocks(blocks);
      
      const updateData = {
        title: title.trim(),
        content: blocks,
        emotion: emotion.trim(),
        color,
        isPublic,
        memoryDate: format(memoryDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      };
      
      await onUpdate(updateData);
      
    } catch (err) {
      console.error('Error updating memory:', err);
      setErrors({ general: 'Failed to update memory. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitting && hasChanges) {
          handleSubmit();
        }
      }
      
      // Escape to cancel
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, isSubmitting, hasChanges]);

  if (!show || !memory) return null;

  // Calculate if we can submit
  const canSubmit = title.trim().length >= 3 && getEmotionFromMoodBlocks(blocks).trim().length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      >
        <div className="min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-4 py-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-all duration-200 disabled:opacity-50"
                  title="Go back"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Edit Memory
                  </h1>
                  <p className="text-gray-600">
                    Update your memory content, settings, and details
                  </p>
                </div>

                <div className="w-10 h-10" /> {/* Spacer for centering */}
              </div>

              {/* Memory info */}
              {memory.createdAt && (
                <p className="text-sm text-gray-500">
                  Originally created on {new Date(memory.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Error */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-4xl mx-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">❌</span>
                    <p className="text-red-600 text-sm font-medium">{errors.general}</p>
                  </div>
                </motion.div>
              )}

              {/* Main Layout */}
              <div className="max-w-7xl mx-auto">
                <EditMemoryLayout
                  title={title}
                  setTitle={setTitle}
                  color={color}
                  setColor={setColor}
                  isPublic={isPublic}
                  setIsPublic={setIsPublic}
                  memoryDate={memoryDate}
                  setMemoryDate={setMemoryDate}
                  blocks={blocks}
                  onBlocksChange={handleBlocksChange}
                  isSubmitting={isSubmitting || externalIsSubmitting}
                  errors={errors}
                />
              </div>

              {/* Block-level errors */}
              {Object.entries(errors).some(([key]) => key.startsWith('block_')) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-4xl mx-auto"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-amber-800 font-medium mb-2">Content Issues Found:</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {Object.entries(errors)
                          .filter(([key]) => key.startsWith('block_'))
                          .map(([key, error]) => (
                            <li key={key}>• {error}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form Actions & Stats */}
              <div className="max-w-4xl mx-auto">
                <EditMemoryFormActions
                  title={title}
                  blocks={blocks}
                  isSubmitting={isSubmitting || externalIsSubmitting}
                  onCancel={handleCancel}
                  onSave={handleSubmit}
                  canSubmit={canSubmit}
                  hasChanges={hasChanges}
                />
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}