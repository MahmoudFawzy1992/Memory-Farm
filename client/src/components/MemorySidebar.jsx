import { motion, AnimatePresence } from "framer-motion";

export default function MemorySidebar({ memory, memoryMetadata, isOwner, isMobile, isOpen, onClose }) {
  if (!memory || !memoryMetadata) return null;

  const sidebarContent = (
    <div className="space-y-6">
      {/* Memory Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Memory Stats
        </h3>
        
        <div className="space-y-3">
          {memoryMetadata.blockCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Content blocks</span>
              <span className="font-medium text-gray-900">{memoryMetadata.blockCount}</span>
            </div>
          )}
          
          {memoryMetadata.readingTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reading time</span>
              <span className="font-medium text-gray-900">{memoryMetadata.readingTime} min</span>
            </div>
          )}
          
          {memoryMetadata.imageCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Images</span>
              <span className="font-medium text-gray-900">{memoryMetadata.imageCount}</span>
            </div>
          )}
          
          {memoryMetadata.todoStats && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasks completed</span>
              <span className="font-medium text-gray-900">
                {memoryMetadata.todoStats.completed}/{memoryMetadata.todoStats.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Memory Properties */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚙️</span>
          Properties
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Visibility</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              memory.isPublic 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {memory.isPublic ? "🌍 Public" : "🔒 Private"}
            </span>
          </div>
          
          {memory.color && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Theme color</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: memory.color }}
                />
                <span className="text-xs font-mono text-gray-500">
                  {memory.color.toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          {memory.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {memory.updatedAt && memory.updatedAt !== memory.createdAt ? 'Edited at' : 'Created at'}
              </span>
              <span className="text-xs text-gray-500">
                {memory.updatedAt && memory.updatedAt !== memory.createdAt 
                  ? new Date(memory.updatedAt).toLocaleDateString()
                  : new Date(memory.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-50 z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Memory Info</h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 space-y-6">
      {sidebarContent}
    </div>
  );
}