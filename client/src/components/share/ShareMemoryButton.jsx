import { useState } from 'react';
import { motion } from 'framer-motion';
import useCardSharing from '../../hooks/useCardSharing';
import CardPreviewModal from './CardPreviewModal';

/**
 * Share Memory Button Component
 * Generates memory cards and shows preview before sharing
 */
export default function ShareMemoryButton({ 
  memory, 
  className = '', 
  variant = 'primary',
  size = 'default',
  showText = true 
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [generatedCardData, setGeneratedCardData] = useState(null);
  
  const {
    generateCard,
    shareNatively,
    copyShareLink,
    isGenerating,
    isNativeShareSupported,
    cleanupCard
  } = useCardSharing();

  // Don't render if memory is not shareable
  if (!memory || !memory.isPublic) {
    return null;
  }

  const handleShareClick = async () => {
    try {
      // Generate the card
      const cardData = await generateCard(memory._id);
      if (!cardData) {
        return;
      }

      // Store card data and show preview
      setGeneratedCardData(cardData);
      setShowPreview(true);
      
    } catch (error) {
      console.error('Share click error:', error);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (generatedCardData) {
      // Clean up blob URL after a short delay to allow modal animation
      setTimeout(() => {
        cleanupCard();
        setGeneratedCardData(null);
      }, 300);
    }
  };

  const handleNativeShare = async () => {
    if (!generatedCardData) return;
    
    try {
      await shareNatively(generatedCardData, memory.title);
      handleClosePreview();
    } catch (error) {
      console.error('Native share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
        // ✅ Pass both memory ID and title for slug generation
        await copyShareLink(memory._id, memory.title);
      } catch (error) {
      console.error('Copy link error:', error);
    }
  };


  // Button styling variants
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md focus:ring-purple-500 disabled:hover:bg-purple-600",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-500 disabled:hover:bg-gray-100",
    ghost: "text-purple-600 hover:bg-purple-50 focus:ring-purple-500 disabled:hover:bg-transparent"
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <>
      {/* Main Share Button */}
      <motion.button
        onClick={handleShareClick}
        disabled={isGenerating}
        className={buttonClasses}
        whileHover={isGenerating ? {} : { scale: 1.02 }}
        whileTap={isGenerating ? {} : { scale: 0.98 }}
        aria-label="Generate and share memory card"
      >
        {isGenerating ? (
          <>
            {/* Loading Spinner */}
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {showText && <span>Creating Card...</span>}
          </>
        ) : (
          <>
            {/* Share Icon */}
            <svg 
              className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
              />
            </svg>
            {showText && <span>Share</span>}
          </>
        )}
      </motion.button>

      {/* Card Preview Modal */}
      <CardPreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        cardData={generatedCardData}
        memoryTitle={memory.title || 'Untitled Memory'}
        onShare={handleNativeShare}
        onCopyLink={handleCopyLink}
        isNativeShareSupported={isNativeShareSupported}
      />
    </>
  );
}