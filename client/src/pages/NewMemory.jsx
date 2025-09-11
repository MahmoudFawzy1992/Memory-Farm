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

// Enhanced block validation
const validateBlocks = (blocks) => {
  const errors = {};
  
  blocks.forEach((block, index) => {
    const blockErrors = [];
    
    switch (block.type) {
      case 'paragraph':
        if (!block.content || !Array.isArray(block.content) || block.content.length === 0) {
          blockErrors.push('Text block cannot be empty');
        } else {
          const text = block.content.map(item => typeof item === 'string' ? item : (item.text || '')).join('').trim();
          if (!text) {
            blockErrors.push('Text block cannot be empty');
          }
        }
        break;
        
      case 'checkList':
        if (!block.content || !Array.isArray(block.content) || block.content.length === 0) {
          blockErrors.push('Todo list must have at least one item');
        } else {
          const hasValidItem = block.content.some(item => item.text && item.text.trim());
          if (!hasValidItem) {
            blockErrors.push('Todo list must have at least one non-empty item');
          }
        }
        break;
        
      case 'image':
        if (!block.props?.images || !Array.isArray(block.props.images) || block.props.images.length === 0) {
          blockErrors.push('Image block must have at least one image');
        }
        break;
        
      case 'mood':
        if (!block.props?.emotion) {
          blockErrors.push('Mood block must have an emotion selected');
        }
        if (!block.props?.intensity || block.props.intensity < 1 || block.props.intensity > 10) {
          blockErrors.push('Mood block must have intensity between 1-10');
        }
        break;
        
      case 'divider':
        // Dividers are always valid
        break;
        
      default:
        blockErrors.push(`Unknown block type: ${block.type}`);
    }
    
    if (blockErrors.length > 0) {
      errors[`block_${index}`] = blockErrors.join(', ');
    }
  });
  
  return errors;
};

// Enhanced content stats calculation
const calculateEnhancedContentStats = (title, blocks) => {
  let totalChars = title.length;
  let totalWords = title.trim() ? title.trim().split(/\s+/).length : 0;
  
  blocks.forEach(block => {
    switch (block.type) {
      case 'paragraph':
        if (block.content && Array.isArray(block.content)) {
          const text = block.content.map(item => typeof item === 'string' ? item : (item.text || '')).join(' ');
          totalChars += text.length;
          if (text.trim()) {
            totalWords += text.trim().split(/\s+/).length;
          }
        }
        break;
        
      case 'checkList':
        if (block.content && Array.isArray(block.content)) {
          block.content.forEach(item => {
            if (item.text) {
              totalChars += item.text.length;
              totalWords += item.text.trim().split(/\s+/).length;
            }
          });
        }
        break;
        
      case 'mood':
        if (block.props?.note) {
          totalChars += block.props.note.length;
          totalWords += block.props.note.trim().split(/\s+/).length;
        }
        break;
        
      // Images and dividers don't add to reading time
    }
  });
  
  // More accurate reading time calculation
  // Average reading speed: 200-250 words per minute, we'll use 225
  const readingTime = Math.max(1, Math.ceil(totalWords / 225));
  
  return { 
    characters: totalChars, 
    words: totalWords, 
    readingTime
  };
};

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

  // Handle block changes with validation
  const handleBlocksChange = useCallback((newBlocks) => {
    // Ensure at least one mood block exists
    const hasMoodBlock = newBlocks.some(block => block.type === 'mood');
    if (!hasMoodBlock) {
      const moodBlock = createBlock('mood');
      setBlocks([moodBlock, ...newBlocks]);
    } else {
      setBlocks(newBlocks);
    }
    
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    const formErrors = validateMemoryForm(title, blocks, color, memoryDate);
    
    // Validate individual blocks
    const blockErrors = validateBlocks(blocks);
    
    const allErrors = { ...formErrors, ...blockErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      showNotification('Please fix the errors before creating your memory.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const emotion = getEmotionFromMoodBlocks(blocks);
      
      // FIXED: Include title in memory data
      const memoryData = {
        title: title.trim(), // NEW: Send title to backend
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

  // FIXED: Enhanced content stats calculation
  const contentStats = calculateEnhancedContentStats(title, blocks);
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