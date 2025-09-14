import { motion } from "framer-motion";
import BlockRenderer from "./block-viewer/BlockRenderer";

export default function MemoryDetails({ memory, memoryMetadata, onBlockUpdate }) {
  if (!memory) return null;

  const blocks = memory.content || [];
  const metadata = memoryMetadata || {};

  // Show legacy text content if no blocks available
  if (blocks.length === 0 && memory.text) {
    return (
      <div className="memory-details">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            📝 This memory uses the legacy text format. Content is displayed as plain text.
          </p>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
            {memory.text}
          </p>
        </div>
      </div>
    );
  }

  // No content available
  if (blocks.length === 0) {
    return (
      <div className="memory-details">
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg">No content available</p>
          <p className="text-sm">This memory appears to be empty.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="memory-details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content blocks */}
      <div className="memory-content space-y-2">
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block.id || index}
            block={block}
            index={index}
            isFirstBlock={index === 0}
            memoryColor={memory.color}
            onBlockUpdate={onBlockUpdate}
          />
        ))}
      </div>

      {/* Content metadata */}
      {metadata.blockCounts && Object.keys(metadata.blockCounts).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(metadata.blockCounts).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {count} {type.toLowerCase()}{count !== 1 ? 's' : ''}
              </span>
            ))}
            
            {metadata.readingTime && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {metadata.readingTime} min read
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
