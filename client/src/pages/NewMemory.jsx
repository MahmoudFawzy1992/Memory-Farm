import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import MemoryForm from '../components/MemoryForm';

function NewMemory() {
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('🌸');
  const [emotion, setEmotion] = useState('');
  const [color, setColor] = useState('purple-500');
  const [isPublic, setIsPublic] = useState(false); 

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const validateMemory = () => {
    const newErrors = {};
    if (!text.trim()) {
      newErrors.text = 'Memory text is required.';
    }

    if (color && !/^(\w+-\d{3})$/.test(color)) {
      newErrors.color = 'Color format must be like purple-500';
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

    try {
      await axios.post('/api/memory', {
        text,
        emotion: `${emoji} ${emotion}`.trim(),
        color,
        isPublic, // ✅ send visibility
      });
      showNotification('✅ Memory saved successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error saving memory:', err);
      showNotification('❌ Failed to save memory. Try again.');
    }
  };

  return (
    <motion.div
      className="max-w-xl mx-auto bg-white p-6 rounded shadow"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Create a New Memory ✨</h2>

      {/* ✅ Public toggle */}
      <div className="flex items-center mb-4">
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Make this memory public
        </label>
      </div>

      <MemoryForm
        text={text}
        setText={setText}
        emoji={emoji}
        setEmoji={setEmoji}
        emotion={emotion}
        setEmotion={setEmotion}
        color={color}
        setColor={setColor}
        onSubmit={handleSubmit}
        errors={errors}
      />
    </motion.div>
  );
}

export default NewMemory;
