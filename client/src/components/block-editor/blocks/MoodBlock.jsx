import { useState } from 'react';
import { motion } from 'framer-motion';
import EmotionSelector from '../../EmotionSelector';

export default function MoodBlock({ 
  block, 
  onChange 
}) {
  const [emotion, setEmotion] = useState(block.props?.emotion || '');
  const [intensity, setIntensity] = useState(block.props?.intensity || 5);
  const [note, setNote] = useState(block.props?.note || '');
  const [color, setColor] = useState(block.props?.color || '#8B5CF6');

  const updateBlock = (updates) => {
    const updatedBlock = {
      ...block,
      props: { ...block.props, ...updates }
    };
    onChange(updatedBlock);
  };

  const handleEmotionChange = (newEmotion) => {
    setEmotion(newEmotion);
    updateBlock({ emotion: newEmotion });
  };

  const handleIntensityChange = (newIntensity) => {
    setIntensity(newIntensity);
    updateBlock({ intensity: newIntensity });
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    updateBlock({ note: newNote });
  };

  const getIntensityLabel = (value) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  const getIntensityColor = (value) => {
    if (value <= 2) return '#EF4444'; // Red
    if (value <= 4) return '#F97316'; // Orange
    if (value <= 6) return '#EAB308'; // Yellow
    if (value <= 8) return '#22C55E'; // Green
    return '#8B5CF6'; // Purple
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎭</span>
        <h3 className="text-lg font-semibold text-gray-800">Mood Tracker</h3>
      </div>

      {/* Emotion Selection */}
      <div className="mb-6">
        <EmotionSelector
          value={emotion}
          onChange={handleEmotionChange}
          placeholder="How are you feeling right now?"
        />
      </div>

      {/* Intensity Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Intensity Level: {intensity}/10 
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({getIntensityLabel(intensity)})
          </span>
        </label>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${getIntensityColor(intensity)} 0%, ${getIntensityColor(intensity)} ${intensity * 10}%, #E5E7EB ${intensity * 10}%, #E5E7EB 100%)`
            }}
          />
          
          {/* Intensity markers */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Visual intensity indicator */}
        <div className="flex justify-center mt-3">
          <motion.div
            animate={{ scale: [1, 1 + (intensity / 20), 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="flex gap-1"
          >
            {Array.from({ length: Math.ceil(intensity / 2) }).map((_, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Optional Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="What triggered this emotion? Any additional context..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows="3"
          maxLength="200"
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {note.length}/200 characters
        </div>
      </div>

      {/* Mood Summary */}
      {emotion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-2">Mood Summary</h4>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{emotion.split(' ')[0]}</div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {emotion.replace(/^\p{Emoji}+/u, '').trim()}
              </p>
              <p className="text-xs text-gray-500">
                Intensity: {getIntensityLabel(intensity)} ({intensity}/10)
              </p>
            </div>
          </div>
          {note && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{note}"
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}