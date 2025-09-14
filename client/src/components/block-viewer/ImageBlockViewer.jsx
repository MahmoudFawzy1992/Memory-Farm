// client/src/components/block-viewer/ImageBlockViewer.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple lightbox component for image viewing
function ImageLightbox({ images, currentIndex, onClose, onPrevious, onNext }) {
  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          aria-label="Close lightbox"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Main image */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="max-w-full max-h-full flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.url}
            alt={currentImage.alt || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            loading="lazy"
          />
          
          {/* Image info */}
          {(currentImage.caption || currentImage.alt) && (
            <div className="mt-4 max-w-lg text-center text-white bg-black bg-opacity-50 rounded-lg p-3">
              {currentImage.caption && (
                <p className="text-sm font-medium">{currentImage.caption}</p>
              )}
              {currentImage.alt && !currentImage.caption && (
                <p className="text-sm text-gray-300">{currentImage.alt}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {currentIndex + 1} of {images.length}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ImageBlockViewer({ block, memoryColor = '#8B5CF6', onBlockUpdate }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  const images = block.props?.images || [];
  
  if (!images || images.length === 0) {
    return (
      <div className="image-block-viewer mb-6">
        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
          <div className="text-gray-400 text-4xl mb-2">🖼️</div>
          <p className="text-gray-500 text-sm">No images to display</p>
        </div>
      </div>
    );
  }

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setLightboxIndex((prev) => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  };

  const goToNext = () => {
    setLightboxIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  };

  // Determine grid layout based on image count
  const getGridClass = () => {
    if (images.length === 1) return 'grid-cols-1';
    if (images.length === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (images.length === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="image-block-viewer mb-6">
      <div className={`grid ${getGridClass()} gap-4`}>
        {images.map((image, index) => (
          <motion.div
            key={image.id || index}
            whileHover={{ scale: 1.02 }}
            className="group cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Optimized image loading */}
              <img
                src={image.url}
                alt={image.alt || `Memory image ${index + 1}`}
                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                loading={index < 2 ? "eager" : "lazy"} // Load first 2 images immediately
                decoding="async"
                style={{
                  backgroundColor: '#f3f4f6', // Gray background while loading
                }}
                onError={(e) => {
                  e.target.style.backgroundColor = '#fee2e2';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.innerHTML = '<span style="color: #dc2626; font-size: 0.875rem;">Failed to load</span>';
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Image counter for multiple images */}
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}/{images.length}
                </div>
              )}
            </div>

            {/* Caption */}
            {image.caption && (
              <p className="mt-2 text-sm text-gray-600 text-center leading-relaxed">
                {image.caption}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </div>
  );
}