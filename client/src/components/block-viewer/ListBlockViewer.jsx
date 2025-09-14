// client/src/components/block-viewer/ListBlockViewer.jsx
import { motion } from 'framer-motion';

export default function ListBlockViewer({ block, memoryColor = '#8B5CF6', onBlockUpdate }) {
  const items = block.content || [];
  const listType = block.type || 'checkList';

  if (!items || items.length === 0) {
    return null;
  }

  // Handle item toggle for checklist
  const handleItemToggle = (itemIndex) => {
    if (listType !== 'checkList' || !onBlockUpdate) return;

    const updatedItems = items.map((item, index) => {
      if (index === itemIndex) {
        return {
          ...item,
          checked: !item.checked,
          completedAt: !item.checked ? new Date().toISOString() : null
        };
      }
      return item;
    });

    onBlockUpdate({
      ...block,
      content: updatedItems
    });
  };

  // Calculate completion stats for checklist
  const getCompletionStats = () => {
    if (listType !== 'checkList') return null;

    const completed = items.filter(item => item.checked).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const completionStats = getCompletionStats();

  const getListIcon = (item, index) => {
    switch (listType) {
      case 'checkList':
        return (
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:border-gray-400 ${
              item.checked
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => handleItemToggle(index)}
            title={item.checked ? "Mark as incomplete" : "Mark as complete"}
          >
            {item.checked && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        );
      case 'bulletList':
        return (
          <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: memoryColor }} />
        );
      case 'numberedList':
        return (
          <span className="text-sm font-medium flex-shrink-0 min-w-[1.5rem]" style={{ color: memoryColor }}>
            {index + 1}.
          </span>
        );
      default:
        return (
          <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: memoryColor }} />
        );
    }
  };

  const getListTitle = () => {
    switch (listType) {
      case 'checkList':
        return 'Todo List';
      case 'bulletList':
        return 'List';
      case 'numberedList':
        return 'Numbered List';
      default:
        return 'List';
    }
  };

  return (
    <div className="list-block-viewer mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {/* Header with completion stats */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-xl">
              {listType === 'checkList' ? '✅' : listType === 'numberedList' ? '🔢' : '📋'}
            </span>
            {getListTitle()}
          </h3>
          
          {completionStats && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                {completionStats.completed}/{completionStats.total} completed
              </div>
              {completionStats.completed === completionStats.total && completionStats.total > 0 && (
                <span className="text-green-600 font-medium text-sm">✨</span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar for checklist */}
        {completionStats && completionStats.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{completionStats.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionStats.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  completionStats.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* List items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 ${
                item.checked ? 'opacity-75' : ''
              }`}
            >
              {getListIcon(item, index)}
              <span className={`flex-1 leading-relaxed ${
                item.checked ? 'line-through text-gray-500' : 'text-gray-800'
              }`}>
                {item.text || `Item ${index + 1}`}
              </span>
              
              {/* Completion timestamp */}
              {item.checked && item.completedAt && (
                <span className="text-xs text-green-600 ml-2">
                  ✓ {new Date(item.completedAt).toLocaleDateString()}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Completion message */}
        {completionStats && completionStats.completed === completionStats.total && completionStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-lg">🎉</span>
              <span className="font-medium text-sm">All tasks completed!</span>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm">No items in this list</p>
          </div>
        )}
      </div>
    </div>
  );
}