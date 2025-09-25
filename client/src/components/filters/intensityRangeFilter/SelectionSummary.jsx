import { motion } from 'framer-motion';
import { INTENSITY_LEVELS } from '../../../utils/filterUtils';

/**
 * Summary component showing active intensity selections
 */
export default function SelectionSummary({ selectedIntensities }) {
  if (!selectedIntensities || selectedIntensities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-purple-50 rounded-lg"
    >
      <p className="text-sm text-purple-700">
        <strong>Active filters:</strong>{' '}
        {selectedIntensities.map(key => INTENSITY_LEVELS[key]?.label).join(', ')} intensity
      </p>
    </motion.div>
  );
}