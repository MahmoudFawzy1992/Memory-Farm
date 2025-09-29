import { motion } from 'framer-motion';
import { formatFileSize } from '../../../../utils/imageProcessing';

export default function ImagePreviewCard({ image, onRemove, onUpdateMetadata }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Image thumbnail */}
        <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={image.url}
            alt={image.alt || image.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="absolute inset-0 bg-gray-200 items-center justify-center text-gray-400 text-xs hidden"
          >
            Failed to load
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            title="Remove image"
            aria-label="Remove image"
          >
            <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Input fields - constrained to container */}
        <div className="flex-1 space-y-2 min-w-0">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Alt Text (for accessibility)
            </label>
            <input
              type="text"
              value={image.alt || ''}
              onChange={(e) => onUpdateMetadata(image.id, 'alt', e.target.value)}
              placeholder="Describe this image..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              maxLength={255}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Caption (optional)
            </label>
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => onUpdateMetadata(image.id, 'caption', e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              maxLength={255}
            />
          </div>
          
          {/* File info - responsive with text wrapping */}
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span className="whitespace-nowrap">{formatFileSize(image.size)}</span>
            <span className="whitespace-nowrap">{image.type}</span>
            <span className="truncate max-w-full sm:max-w-32" title={image.name}>
              {image.name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}