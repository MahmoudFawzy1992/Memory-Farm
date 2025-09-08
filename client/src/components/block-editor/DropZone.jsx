// Visual indicator for where blocks can be dropped

import { motion } from 'framer-motion';

export default function DropZone({ isActive, position = 'between' }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: isActive ? 1 : 0.3, 
        height: isActive ? 4 : 2 
      }}
      className={`w-full rounded-full transition-all duration-200 my-2 ${
        isActive ? 'bg-purple-500 shadow-lg' : 'bg-gray-300'
      }`}
      style={{
        marginTop: position === 'above' ? 0 : 8,
        marginBottom: position === 'below' ? 0 : 8
      }}
    />
  );
}