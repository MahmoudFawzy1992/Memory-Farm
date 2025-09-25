import { motion } from 'framer-motion';

/**
 * Welcome step component - initial greeting and start prompt
 */
export default function WelcomeStep({ onStart, onSkip, isLoading }) {
  return (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-6xl mb-4"
      >
        🌸
      </motion.div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Memory Farm!
      </h2>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        Let's take a quick tour and create your first memory together. 
        I'll show you around and help you get started on your journey of 
        capturing precious moments.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Starting...
            </span>
          ) : (
            '✨ Start Your Journey'
          )}
        </button>
        
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full text-gray-500 py-2 px-4 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Skip Tutorial
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        💡 You can always access help later from the FAQ button
      </p>
    </div>
  );
}