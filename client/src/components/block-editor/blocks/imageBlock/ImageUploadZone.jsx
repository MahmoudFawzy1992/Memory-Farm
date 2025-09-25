import { useRef } from 'react';

export default function ImageUploadZone({ 
  localImages, 
  uploading, 
  dragOver, 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  onFileSelect 
}) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      onFileSelect(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={handleClick}
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
  );
}