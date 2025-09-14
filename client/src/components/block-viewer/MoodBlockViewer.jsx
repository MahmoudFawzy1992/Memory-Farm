// client/src/components/block-viewer/MoodBlockViewer.jsx
import { motion } from 'framer-motion';
import { getEmotionColor } from '../../utils/emotionColors';

export default function MoodBlockViewer({ block, isFirstBlock = false, memoryColor = '#8B5CF6', onBlockUpdate }) {
  const emotion = block.props?.emotion || '';
  const intensity = block.props?.intensity || 5;
  const note = block.props?.note || '';
  const color = block.props?.color || memoryColor;

  // Extract emoji and text from emotion
  const emojiMatch = emotion.match(/^\p{Emoji}+/u);
  const emoji = emojiMatch ? emojiMatch[0] : '🎭';
  const emotionText = emoji ? emotion.slice(emoji.length).trim() : emotion;

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

  // Use emotion-specific color if available, otherwise use memory color
  const displayColor = emotionText ? getEmotionColor(emotion) : color;

  return (
    <div className={`mood-block-viewer mb-6 ${isFirstBlock ? 'first-mood-block' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
        style={{
          background: `linear-gradient(135deg, ${displayColor}08 0%, ${displayColor}15 100%)`,
          borderColor: `${displayColor}30`
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl" aria-label={`Emotion: ${emotionText}`}>
            {emoji}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isFirstBlock ? 'Current Mood' : 'Mood Update'}
            </h3>
            {emotionText && (
              <p className="text-sm font-medium" style={{ color: displayColor }}>
                {emotionText}
              </p>
            )}
          </div>
        </div>

        {/* Intensity Visualization */}
        {intensity && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Intensity Level
              </span>
              <span className="text-sm text-gray-600">
                {intensity}/10 ({getIntensityLabel(intensity)})
              </span>
            </div>
            
            {/* Visual intensity bar */}
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intensity * 10}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            </div>

            {/* Animated intensity dots */}
            <div className="flex justify-center mt-3">
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(intensity / 2) }).map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: index * 0.2 
                    }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getIntensityColor(intensity) }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {note && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{note}"
            </p>
          </div>
        )}

        {/* Mood Summary for non-first blocks */}
        {!isFirstBlock && emotionText && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emoji}</span>
                <span className="font-medium">{emotionText}</span>
              </div>
              {intensity && (
                <>
                  <span>•</span>
                  <span>{getIntensityLabel(intensity)}</span>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}