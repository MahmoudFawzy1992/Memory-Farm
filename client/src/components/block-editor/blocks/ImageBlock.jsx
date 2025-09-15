import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeTextInput } from '../../../utils/sanitization';

const ALLOWED_FILE_TYPES = {
  'image/jpeg': { extensions: ['jpg', 'jpeg'], maxSize: 1024 * 1024 },
  'image/png': { extensions: ['png'], maxSize: 1024 * 1024 },
  'image/webp': { extensions: ['webp'], maxSize: 1024 * 1024 },
  'image/gif': { extensions: ['gif'], maxSize: 1024 * 1024 },
};

const validateImageFile = (file) => {
  const errors = [];
  
  if (!ALLOWED_FILE_TYPES[file.type]) {
    errors.push(`File type ${file.type} is not allowed. Use JPG, PNG, WebP, or GIF.`);
  }
  
  const config = ALLOWED_FILE_TYPES[file.type];
  if (config && file.size > config.maxSize) {
    errors.push(`File size (${Math.round(file.size / 1024)}KB) exceeds limit (${Math.round(config.maxSize / 1024)}KB)`);
  }
  
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.split('.').pop();
  
  if (config && !config.extensions.includes(fileExt)) {
    errors.push(`File extension .${fileExt} doesn't match file type`);
  }
  
  if (fileName.length > 255) {
    errors.push('Filename is too long');
  }
  
  const suspiciousPatterns = [
    /\.php\./i, /\.asp\./i, /\.jsp\./i, /\.exe\./i,
    /script/i, /javascript/i, /vbscript/i,
    /<script/i, /javascript:/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
    errors.push('Filename contains suspicious content');
  }
  
  return { valid: errors.length === 0, errors };
};

export default function ImageBlock({ block, onChange }) {
  const [localImages, setLocalImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize local state from block props
  useEffect(() => {
    const blockImages = block.props?.images || [];
    setLocalImages(blockImages);
  }, []);

  // FIXED: Debounced update to prevent setState during render
  const debouncedUpdateBlock = useCallback((images) => {
    const timeoutId = setTimeout(() => {
      const updatedBlock = {
        ...block,
        props: { ...block.props, images }
      };
      onChange(updatedBlock);
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [block, onChange]);

  // Update block when local images change
  useEffect(() => {
    const cleanup = debouncedUpdateBlock(localImages);
    return cleanup;
  }, [localImages, debouncedUpdateBlock]);

  const processFileToImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target.result;
          
          if (!result || !result.startsWith('data:image/')) {
            reject(new Error('Invalid image data'));
            return;
          }
          
          const newImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: result,
            name: sanitizeTextInput(file.name),
            alt: '',
            caption: '',
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
          
          resolve(newImage);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    setUploadErrors([]);
    setUploading(true);
    
    const validFiles = [];
    const errors = [];
    
    // Validate files
    Array.from(files).forEach((file, index) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(', ')}`);
      }
    });
    
    if (errors.length > 0) {
      setUploadErrors(errors);
    }
    
    // Process valid files
    const processedImages = [];
    for (const file of validFiles) {
      try {
        const imageData = await processFileToImage(file);
        processedImages.push(imageData);
      } catch (error) {
        console.error('File processing error:', error);
        setUploadErrors(prev => [...prev, `Failed to process ${file.name}: ${error.message}`]);
      }
    }
    
    // Update local state with new images
    setLocalImages(prev => [...prev, ...processedImages]);
    setUploading(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      handleFileSelect(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (imageId) => {
    setLocalImages(prev => prev.filter(img => img.id !== imageId));
  };

  const updateImageMetadata = (imageId, field, value) => {
    const sanitizedValue = sanitizeTextInput(value);
    setLocalImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, [field]: sanitizedValue } : img
      )
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full p-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          uploading
            ? 'border-blue-400 bg-blue-50 cursor-wait'
            : dragOver
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <div className="text-4xl mb-4">
          {uploading ? '⏳' : '🖼️'}
        </div>
        <p className="text-gray-600 font-medium mb-2">
          {uploading
            ? 'Processing images...'
            : localImages.length === 0 
            ? 'Add images to your memory' 
            : 'Add more images'
          }
        </p>
        {!uploading && (
          <>
            <p className="text-sm text-gray-500">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, WebP, GIF up to 1MB each
            </p>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {uploadErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-medium mb-2">Upload Errors:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {uploadErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <button
            onClick={() => setUploadErrors([])}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {localImages.length > 0 && (
        <div className="mt-4 space-y-4">
          <AnimatePresence>
            {localImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                        removeImage(image.id);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Alt Text (for accessibility)
                      </label>
                      <input
                        type="text"
                        value={image.alt || ''}
                        onChange={(e) => updateImageMetadata(image.id, 'alt', e.target.value)}
                        placeholder="Describe this image..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
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
                        onChange={(e) => updateImageMetadata(image.id, 'caption', e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                        maxLength={255}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.type}</span>
                      <span className="truncate max-w-32" title={image.name}>
                        {image.name}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {localImages.length > 0 && (
        <div className="mt-3 text-sm text-gray-500 text-center">
          {localImages.length} {localImages.length === 1 ? 'image' : 'images'} added
          {localImages.length >= 5 && (
            <span className="text-amber-600 ml-2">
              (Consider keeping it under 5 images for better performance)
            </span>
          )}
        </div>
      )}
    </div>
  );
}