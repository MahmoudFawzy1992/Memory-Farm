import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';
import { saveAs } from 'file-saver';
import { generateMemorySlug } from '../utils/memorySlug';

/**
 * Hook for handling memory card sharing functionality
 * Manages card generation, native sharing, and fallback options
 */
export default function useCardSharing() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState(null);

  // Check if native Web Share API is available
  const isNativeShareSupported = useCallback(() => {
    return navigator.share && navigator.canShare;
  }, []);

  // Check if device can share files
  const canShareFiles = useCallback(() => {
    if (!navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] });
    } catch {
      return false;
    }
  }, []);

  /**
   * Generate memory card from server
   */
  const generateCard = useCallback(async (memoryId) => {
    if (isGenerating) {
      return null;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await axios.post(`/share/card/${memoryId}`, {}, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for image generation
        headers: {
          'Accept': 'image/png'
        }
      });

      if (response.data && response.data.size > 0) {
        const cardBlob = new Blob([response.data], { type: 'image/png' });
        const cardUrl = URL.createObjectURL(cardBlob);
        
        const cardData = {
          blob: cardBlob,
          url: cardUrl,
          filename: `memory-${memoryId}.png`,
          size: response.data.size
        };
        
        setGeneratedCard(cardData);
        return cardData;
      }
      
      throw new Error('No card data received from server');
      
    } catch (error) {
      console.error('Card generation error:', error);
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 403) {
        if (error.response.data?.type === 'privacy_violation') {
          toast.error('This memory must be public to share. Please make it public first.');
        } else if (error.response.data?.type === 'access_denied') {
          toast.error('You can only generate cards for your own memories.');
        } else {
          toast.error('Access denied. Please check memory permissions.');
        }
      } else if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 3600;
        const hours = Math.ceil(retryAfter / 3600);
        toast.error(`Card generation limit reached. Try again in ${hours} hour${hours > 1 ? 's' : ''}.`);
      } else if (error.response?.status === 404) {
        toast.error('Memory not found. Please refresh and try again.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again in a few moments.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Card generation timed out. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to generate card. Please try again.');
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  /**
   * Share card using native Web Share API
   */
  const shareNatively = useCallback(async (cardData, memoryTitle) => {
    if (!isNativeShareSupported()) {
      throw new Error('Native sharing not supported on this device');
    }

    try {
      const file = new File([cardData.blob], cardData.filename, {
        type: 'image/png'
      });

      const shareData = {
        title: `Check out my memory: ${memoryTitle}`,
        text: `I just shared a memory from my Memory Farm journal. Take a look!`,
      };

      // Try to include the file if supported
      if (canShareFiles()) {
        shareData.files = [file];
      } else {
        // Fallback: share the memory URL instead
        shareData.url = `${window.location.origin}/memory/${cardData.filename.replace(/^memory-|\.png$/g, '')}`;
      }

      // Check if we can share this data
      if (!navigator.canShare(shareData)) {
        throw new Error('Cannot share this content on this device');
      }

      await navigator.share(shareData);
      toast.success('Memory shared successfully! 🎉');
      
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled sharing - don't show error
        return false;
      }
      
      console.error('Native sharing failed:', error);
      throw error; // Re-throw to handle in calling component
    }
  }, [isNativeShareSupported, canShareFiles]);

  /**
   * Download card as fallback option
   */
  const downloadCard = useCallback((cardData, memoryTitle) => {
    try {
      const filename = `${memoryTitle ? memoryTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'memory'}-card.png`;
      saveAs(cardData.blob, filename);
      toast.success('Card downloaded successfully! Share it on your favorite platform.');
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download card. Please try again.');
      return false;
    }
  }, []);

  /**
   * Copy share link to clipboard
   */
const copyShareLink = useCallback(async (memoryId, memoryTitle) => {
  try {
    // ✅ Generate slug for shareable URL
    const slug = generateMemorySlug(memoryTitle, memoryId);
    const shareUrl = `${window.location.origin}/memory/${slug}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Memory link copied to clipboard!');
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success('Memory link copied to clipboard!');
          return true;
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      
      // Show the URL in a prompt as last resort
      const slug = generateMemorySlug(memoryTitle, memoryId);
      const shareUrl = `${window.location.origin}/memory/${slug}`;
      if (window.prompt) {
        window.prompt('Copy this link manually:', shareUrl);
        toast.info('Please copy the link manually from the dialog above.');
        return true;
      } else {
        toast.error('Failed to copy link. Please copy manually from the address bar.');
        return false;
      }
    }
  }, []);

  /**
   * Clean up generated card data
   */
  const cleanupCard = useCallback(() => {
    if (generatedCard?.url) {
      URL.revokeObjectURL(generatedCard.url);
    }
    setGeneratedCard(null);
  }, [generatedCard]);

  return {
    // State
    isGenerating,
    generatedCard,
    
    // Capabilities
    isNativeShareSupported: isNativeShareSupported(),
    canShareFiles: canShareFiles(),
    
    // Actions
    generateCard,
    shareNatively,
    downloadCard,
    copyShareLink,
    cleanupCard
  };
}