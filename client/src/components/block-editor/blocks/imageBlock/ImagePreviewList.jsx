import { AnimatePresence } from 'framer-motion';
import ImagePreviewCard from './ImagePreviewCard';
import { FILE_LIMITS } from '../../../../constants/imageValidationConstants';

export default function ImagePreviewList({ images, onRemoveImage, onUpdateImageMetadata }) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 space-y-4">
        <AnimatePresence>
          {images.map((image) => (
            <ImagePreviewCard
              key={image.id}
              image={image}
              onRemove={onRemoveImage}
              onUpdateMetadata={onUpdateImageMetadata}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 text-sm text-gray-500 text-center">
        {images.length} {images.length === 1 ? 'image' : 'images'} added
        {images.length >= FILE_LIMITS.maxImageCount && (
          <span className="text-amber-600 ml-2">
            (Consider keeping it under {FILE_LIMITS.maxImageCount} images for better performance)
          </span>
        )}
      </div>
    </>
  );
}