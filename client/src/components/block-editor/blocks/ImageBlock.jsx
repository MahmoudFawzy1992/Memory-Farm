// Location: client/src/components/block-editor/blocks/ImageBlock.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const updateTimeoutRef = useRef(null);

  // Initialize local state from block props
  useEffect(() => {
    const blockImages = block.props?.images || [];
    setLocalImages(blockImages);
  }, [block.id]); // Only re-init when block ID changes

  // Update parent when local images change
  useEffect(() => {
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the update to prevent rapid state changes
    updateTimeoutRef.current = setTimeout(() => {
      const updatedBlock = {
        ...block,
        props: { ...block.props, images: localImages }
      };
      onChange(updatedBlock);
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [localImages]); // Don't include block/onChange to prevent infinite loops

  const handleFileSelect = async (files) => {
    setUploadErrors([]);
    setUploading(true);
    
    const validFiles = [];
    const errors = [];
    
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
    
    setLocalImages(prev => [...prev, ...processedImages]);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
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