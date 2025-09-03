import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import axios from '../utils/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import SimpleRichEditor from '../components/SimpleRichEditor';
import EmotionSelector from '../components/EmotionSelector';
import ColorSelect from '../components/ColorPicker';
import PageWrapper from '../components/PageWrapper';

function NewMemory() {
  // Form state
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [isPublic, setIsPublic] = useState(false);
  const [memoryDate, setMemoryDate] = useState(new Date());
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const validateMemory = () => {
    const newErrors = {};
    
    // Validate content
    if (!content || content.trim().length < 10) {
      newErrors.content = 'Please write at least 10 characters for your memory.';
    }
    
    // Validate color
    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      newErrors.color = 'Please select a valid color.';
    }
    
    // Validate date
    if (!memoryDate) {
      newErrors.memoryDate = 'Please select the memory date.';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateMemory();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Convert simple text to block format for backend
      const blockContent = [{
        id: 'block_' + Date.now(),
        type: 'paragraph',
        content: [{ type: 'text', text: content }]
      }];

      const memoryData = {
        content: blockContent,
        emotion: emotion.trim(),
        color,
        isPublic,
        memoryDate: format(memoryDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      };

      await axios.post('/memory', memoryData);
      
      showNotification('Memory saved successfully!', 'success');
      navigate('/');
    } catch (err) {
      console.error('Error saving memory:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save memory. Please try again.';
      showNotification(errorMessage, 'error');
      
      if (err.response?.status === 400) {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.length > 0 || emotion || isPublic !== false) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Memory
          </h1>
          <p className="text-gray-600">
            Capture your thoughts, feelings, and moments
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm">{errors.general}</p>
            </motion.div>
          )}

          {/* Memory Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                Your Memory
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Write your thoughts and experiences. Use simple formatting like **bold** and *italic*.
              </p>
            </div>
            
            <div className="p-6">
              <SimpleRichEditor
                value={content}
                onChange={(value) => {
                  setContent(value);
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: null }));
                  }
                }}
                placeholder="Start writing your memory... What happened? How did you feel? What did you learn?"
                error={errors.content}
              />
            </div>
          </div>

          {/* Memory Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Emotion Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <EmotionSelector
                  value={emotion}
                  onChange={setEmotion}
                  error={errors.emotion}
                />
              </div>

              {/* Date Picker */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memory Date
                </label>
                <DatePicker
                  selected={memoryDate}
                  onChange={setMemoryDate}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxDate={new Date()}
                  placeholderText="Select the date of this memory"
                />
                {errors.memoryDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.memoryDate}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Color Picker */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ColorSelect
                  color={color}
                  setColor={setColor}
                  error={errors.color}
                />
              </div>

              {/* Privacy Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Privacy</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      isPublic ? 'bg-purple-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-1 ${
                        isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isPublic ? 'Public Memory' : 'Private Memory'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isPublic 
                        ? 'Others can see this memory in the community feed'
                        : 'Only you can see this memory'
                      }
                    </p>
                  </div>
                </label>
              </div>

              {/* Content Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Content Stats</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className={content.length >= 10 ? 'text-green-600' : 'text-gray-500'}>
                      {content.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span>{content.trim() ? content.trim().split(/\s+/).length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading time:</span>
                    <span>
                      {Math.max(1, Math.ceil((content.trim().split(/\s+/).length || 0) / 200))} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || content.length < 10}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isSubmitting || content.length < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Memory...
                </span>
              ) : (
                'Save Memory'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </PageWrapper>
  );
}

export default NewMemory;