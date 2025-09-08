import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from '../utils/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import { createBlock } from '../components/block-editor/BlockTypeDefinitions';
import NewMemoryLayout from '../components/NewMemoryLayout';
import MemoryFormActions from '../components/new-memory/MemoryFormActions';
import { 
  validateMemoryForm, 
  getEmotionFromMoodBlocks, 
  calculateContentStats 
} from '../utils/NewMemoryValidation';

export default function NewMemory() {
  // Form state
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [isPublic, setIsPublic] = useState(false);
  const [memoryDate, setMemoryDate] = useState(new Date());
  
  // Block editor state with default mood tracker
  const [blocks, setBlocks] = useState([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Initialize with default mood tracker block
  useEffect(() => {
    if (blocks.length === 0) {
      const defaultMoodBlock = createBlock('mood');
      setBlocks([defaultMoodBlock]);
    }
  }, []);

  // Handle block changes - ensure mood tracker is always present
  const handleBlocksChange = useCallback((newBlocks) => {
    // Ensure at least one mood block exists
    const hasMoodBlock = newBlocks.some(block => block.type === 'mood');
    if (!hasMoodBlock) {
      const moodBlock = createBlock('mood');
      setBlocks([moodBlock, ...newBlocks]);
    } else {
      setBlocks(newBlocks);
    }
    
    // Clear block-related errors
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateMemoryForm(title, blocks, color, memoryDate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showNotification('Please fix the errors before creating your memory.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const emotion = getEmotionFromMoodBlocks(blocks);
      
      const memoryData = {
        content: blocks,
        emotion: emotion.trim(),
        color,
        isPublic,
        memoryDate: format(memoryDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      };
      
      const response = await axios.post('/memory', memoryData);
      
      showNotification('Memory created successfully! 🎉', 'success');
      navigate(`/memory/${response.data._id}`);
      
    } catch (err) {
      console.error('Error creating memory:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create memory. Please try again.';
      showNotification(errorMessage, 'error');
      
      if (err.response?.status === 400) {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    const hasContent = title.length > 0 || blocks.length > 1 || isPublic !== false;
    
    if (hasContent) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const contentStats = calculateContentStats(title, blocks);
  const emotion = getEmotionFromMoodBlocks(blocks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Memory
          </h1>
          <p className="text-gray-600">
            Capture your thoughts, feelings, and moments with rich content blocks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-4xl mx-auto"
            >
              <p className="text-red-600 text-sm">{errors.general}</p>
            </motion.div>
          )}

          {/* Main Layout */}
          <NewMemoryLayout
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
            isSubmitting={isSubmitting}
            errors={errors}
          />

          {/* Block-level errors */}
          {Object.entries(errors).some(([key]) => key.startsWith('block_')) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-4xl mx-auto"
            >
              <h4 className="text-amber-800 font-medium mb-2">Block Issues:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {Object.entries(errors)
                  .filter(([key]) => key.startsWith('block_'))
                  .map(([key, error]) => (
                    <li key={key}>• {error}</li>
                  ))}
              </ul>
            </motion.div>
          )}

          {/* Form Actions & Stats */}
          <div className="max-w-4xl mx-auto">
            <MemoryFormActions
              contentStats={contentStats}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              canSubmit={title.trim().length >= 3 && emotion.trim().length > 0}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}