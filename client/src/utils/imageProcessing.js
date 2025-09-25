import { sanitizeTextInput } from './sanitization';

/**
 * Converts a file to base64 image data with metadata
 * @param {File} file - The image file to process
 * @returns {Promise<Object>} - Promise resolving to image object with metadata
 */
export const processFileToImage = (file) => {
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

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};