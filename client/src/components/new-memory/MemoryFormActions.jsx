import { motion } from 'framer-motion';

export default function MemoryFormActions({
  contentStats,
  isSubmitting,
  onCancel,
  canSubmit = true
}) {
  return (
    <>
      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{contentStats.characters}</div>
          <div className="text-sm text-gray-500">Characters</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{contentStats.words}</div>
          <div className="text-sm text-gray-500">Words</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{contentStats.readingTime}</div>
          <div className="text-sm text-gray-500">Min Read</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        {/* Planner Integration Placeholder */}
        <button
          type="button"
          disabled={true}
          className="px-6 py-3 text-gray-400 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed transition-colors duration-200"
          title="Coming soon - Turn memories into planning tasks"
        >
          📋 Turn into Task
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            isSubmitting || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105 shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.div 
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Creating Memory...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✨</span>
              Create Memory
            </span>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          💡 Your memory will be saved {' '}
          <span className="font-medium">privately</span> by default. 
          You can change this anytime later.
        </p>
      </div>
    </>
  );
}