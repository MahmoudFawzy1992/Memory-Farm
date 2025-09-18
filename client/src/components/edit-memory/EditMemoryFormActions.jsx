import { motion } from 'framer-motion';
import { calculatePureTextStats } from '../../utils/textUtils';

/**
 * Action buttons and stats for editing memories
 * Shows content statistics and provides save/cancel options
 */
export default function EditMemoryFormActions({
  title,
  blocks,
  isSubmitting,
  onCancel,
  onSave,
  canSubmit = true,
  hasChanges = false
}) {
  // Calculate updated content stats
  const contentStats = calculatePureTextStats(title, blocks);

  return (
    <div className="space-y-6">
      {/* Content Stats - Updated Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{blocks.length}</div>
          <div className="text-sm text-gray-500">Blocks</div>
        </div>
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <span className="text-amber-600">⚠️</span>
          <span className="text-amber-700 text-sm font-medium">
            You have unsaved changes
          </span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasChanges ? 'Discard Changes' : 'Cancel'}
        </button>
        
        {/* Future: Save as Draft */}
        <button
          type="button"
          disabled={true}
          className="px-6 py-3 text-gray-400 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed transition-colors duration-200"
          title="Coming soon - Save changes as draft"
        >
          💾 Save Draft
        </button>
        
        <button
          type="submit"
          onClick={onSave}
          disabled={isSubmitting || !canSubmit}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-w-[140px] ${
            isSubmitting || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : hasChanges
                ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
                : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105 shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <motion.div 
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Updating...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <span>{hasChanges ? '✅' : '💾'}</span>
              Update Memory
            </span>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          💡 Your changes will be saved and the memory will be updated immediately
        </p>
        {!hasChanges && (
          <p className="text-xs text-gray-400">
            Make some changes above to see them reflected here
          </p>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="text-center">
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600 transition-colors">
            ⌨️ Keyboard Shortcuts
          </summary>
          <div className="mt-2 space-y-1 text-left max-w-xs mx-auto">
            <div className="flex justify-between">
              <span>Save:</span>
              <span>Ctrl/Cmd + S</span>
            </div>
            <div className="flex justify-between">
              <span>Cancel:</span>
              <span>Escape</span>
            </div>
            <div className="flex justify-between">
              <span>Undo:</span>
              <span>Ctrl/Cmd + Z</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}