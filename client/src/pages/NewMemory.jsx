import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from '../utils/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import { createBlock } from '../components/block-editor/BlockTypeDefinitions';
import NewMemoryLayout from '../components/NewMemoryLayout';
import MemoryFormActions from '../components/new-memory/MemoryFormActions';
import FieldTutorial from '../components/onboarding/FieldTutorial';
import { showInsightToast } from '../components/insights/SimpleInsightToast';
import { generateMemorySlug } from '../utils/memorySlug';
import { 
  validateMemoryForm, 
  getEmotionFromMoodBlocks
} from '../utils/NewMemoryValidation';
import { calculatePureTextStats } from '../utils/textUtils';
import useSimpleInsights from '../hooks/useSimpleInsights';

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
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCheckDone, setTutorialCheckDone] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { triggerInsightGeneration } = useSimpleInsights();

  // Initialize with default mood tracker block
  useEffect(() => {
    if (blocks.length === 0) {
      const defaultMoodBlock = createBlock('mood');
      setBlocks([defaultMoodBlock]);
    }
  }, []);

  // Check if tutorial should be shown - only once with cache-busting
  useEffect(() => {
    if (tutorialCheckDone) return;

    const checkTutorialStatus = async () => {
      try {
        // Add cache-busting headers to get fresh data
        const response = await axios.get('/insights/onboarding/status', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.data.shouldShowTutorial && !response.data.onboardingStatus?.tutorialCompleted) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
      } finally {
        setTutorialCheckDone(true);
      }
    };

    checkTutorialStatus();
  }, [tutorialCheckDone]);

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

  // Handle tutorial completion - immediate state update
  const handleTutorialComplete = async () => {
    setShowTutorial(false); // Hide immediately to prevent flickering
    
    try {
      const response = await axios.post('/insights/onboarding/step', 
        { stepName: 'tutorial_completed' },
        {
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
    } catch (error) {
      console.error('Error completing tutorial:', error);
      showNotification('Tutorial completed!', 'success'); // Show success anyway
    }
  };

  // Handle tutorial skip - immediate state update  
  const handleTutorialSkip = async () => {
    setShowTutorial(false); // Hide immediately to prevent flickering
    
    try {
      const response = await axios.post('/insights/onboarding/skip', 
        { skipType: 'tutorial' },
        {
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
      showNotification('Tutorial skipped. Check the FAQ button for help anytime!', 'info');
    } catch (error) {
      console.error('Error skipping tutorial:', error);
      showNotification('You can access help anytime via the FAQ button!', 'info');
    }
  };

  // Enhanced form submission with insight generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    const formErrors = validateMemoryForm(title, blocks, color, memoryDate);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      showNotification('Please fix the errors before creating your memory.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const emotion = getEmotionFromMoodBlocks(blocks);
      
      const memoryData = {
        title: title.trim(),
        content: blocks,
        emotion: emotion.trim(),
        color,
        isPublic,
        memoryDate: format(memoryDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      };
      
      // Create memory with enhanced response
      const response = await axios.post('/memory', memoryData);
      
      // Check if insight was generated
      if (response.data.insight && response.data.shouldShowInsight) {
        // Show insight toast notification
        setTimeout(() => {
          showInsightToast(response.data.insight, {
            onViewDashboard: () => navigate('/dashboard')
          });
        }, 1000); // Delay to show after success message
      }
      
      showNotification('Memory created successfully!', 'success');
      const createdMemory = response.data.memory;
      navigate(`/memory/${generateMemorySlug(createdMemory.title, createdMemory._id)}`);
      
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

  // Calculate content stats
  const contentStats = calculatePureTextStats(title, blocks);
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
          {showTutorial && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg inline-block">
              <p className="text-sm text-purple-700 font-medium">
                Tutorial mode: Follow the guide to learn how to create memories
              </p>
            </div>
          )}
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

          {/* Main Layout with Tutorial Target Classes */}
          <div className="space-y-6">
            {/* Memory Title */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3"></div>
                <div className="lg:col-span-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Memory Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your memory a meaningful title..."
                      className={`memory-title-input w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.title ? 'border-red-500 ring-red-200' : ''
                      }`}
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        This helps organize and identify your memories
                      </p>
                      <span className="text-xs text-gray-400">
                        {title.length}/100
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3"></div>
              </div>
            </div>

            {/* NewMemoryLayout with tutorial classes */}
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
          </div>

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

      {/* Tutorial Component - only show if tutorial is active */}
      {showTutorial && (
        <FieldTutorial
          isActive={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </div>
  );
}