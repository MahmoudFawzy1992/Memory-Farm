import { useState } from "react";
import { motion } from "framer-motion";

export default function MemoryControls({
  isOwner,
  isPublic,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReport,
  showReportButton = false
}) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      await onToggleVisibility();
    } finally {
      setIsToggling(false);
    }
  };

  if (!isOwner && !showReportButton) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="memory-controls mt-8 pt-6 border-t border-gray-200"
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Owner controls */}
        {isOwner && (
          <div className="flex flex-wrap gap-2">
            {/* Privacy toggle */}
            <button
              onClick={handleToggleVisibility}
              disabled={isToggling}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                isPublic
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isToggling ? (
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="mr-2">
                  {isPublic ? "🌍" : "🔒"}
                </span>
              )}
              {isToggling 
                ? "Updating..." 
                : isPublic 
                  ? "Make Private" 
                  : "Make Public"
              }
            </button>

            {/* Edit button */}
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            {/* Delete button */}
            <button
              onClick={onDelete}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}

        {/* Report button for non-owners */}
        {!isOwner && showReportButton && (
          <button
            onClick={onReport}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report Memory
          </button>
        )}
      </div>

      {/* Privacy explanation */}
      {isOwner && (
        <div className="mt-3 text-xs text-gray-500">
          {isPublic ? (
            <p>✅ This memory is visible to everyone and appears in the public discover feed.</p>
          ) : (
            <p>🔒 This memory is private and only visible to you.</p>
          )}
        </div>
      )}
    </motion.div>
  );
}