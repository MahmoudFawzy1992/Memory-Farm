import { useState, useEffect, useCallback } from 'react';
import { sanitizeTextInput } from '../../../utils/sanitization';
import { processFileToImage } from '../../../utils/imageProcessing';
import { validateImageFile } from './imageBlock/validators';
import ImageUploadZone from './imageBlock/ImageUploadZone';
import ErrorDisplay from './imageBlock/ErrorDisplay';
import ImagePreviewList from './imageBlock/ImagePreviewList';

export default function ImageBlock({ block, onChange }) {
  const [localImages, setLocalImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className="w-full p-4">
      <ImageUploadZone
        localImages={localImages}
        uploading={uploading}
        dragOver={dragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFileSelect={handleFileSelect}
      />

      <ErrorDisplay
        errors={uploadErrors}
        onDismiss={() => setUploadErrors([])}
      />

      <ImagePreviewList
        images={localImages}
        onRemoveImage={removeImage}
        onUpdateImageMetadata={updateImageMetadata}
      />
    </div>
  );
}