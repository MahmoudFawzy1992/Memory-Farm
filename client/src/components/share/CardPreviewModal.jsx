import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

/**
 * Card Preview Modal - Shows generated card before sharing
 */
export default function CardPreviewModal({
  isOpen,
  onClose,
  cardData,
  memoryTitle,
  onShare,
  onCopyLink,
  isNativeShareSupported = false
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (!cardData?.blob) return;
    
    try {
      saveAs(cardData.blob, `memory-card-${Date.now()}.png`);
      toast.success('Card downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download card');
    }
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      await onShare();
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      await onCopyLink();
    } catch (error) {
      console.error('Copy failed:', error);
    } finally {
      setIsCopying(false);
    }
  };

  if (!isOpen || !cardData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Memory Card
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Preview your shareable memory card
            </p>
          </div>

          {/* Card Preview */}
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={cardData.url}
                  alt="Memory Card Preview"
                  className="w-64 h-64 object-cover rounded-lg shadow-lg border border-gray-200"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {Math.round(cardData.blob.size / 1024)}KB
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="text-center mb-6">
              <h4 className="font-medium text-gray-900 mb-1">
                {memoryTitle}
              </h4>
              <p className="text-sm text-gray-600">
                1080×1080 • Perfect for social media
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              {/* Primary Share Button */}
              {isNativeShareSupported ? (
                <motion.button
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSharing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share Now
                    </>
                  )}
                </motion.button>
              ) : null}

              {/* Secondary Actions */}
              <div className={`flex gap-3 ${isNativeShareSupported ? '' : 'flex-col'}`}>
                {/* Download Button */}
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${isNativeShareSupported ? 'flex-1' : 'w-full'} flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </motion.button>

                {/* Copy Link Button */}
                <motion.button
                  onClick={handleCopyLink}
                  disabled={isCopying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${isNativeShareSupported ? 'flex-1' : 'w-full'} flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50`}
                >
                  {isCopying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Copying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Sharing Tips:</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• Perfect size for Instagram posts and stories</li>
                    <li>• Works great on Facebook, Twitter, and LinkedIn</li>
                    <li>• Links back to your memory page when shared</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}