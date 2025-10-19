const textQualityAnalyzer = require('../../utils/textQuality');

/**
 * Theme Analysis - Content themes and image usage
 */

class ThemeAnalysis {
  
  /**
   * Analyze content themes
   */
  static analyzeThemes(memories) {
    // Combine title + text from all memories
    const allText = memories
      .map(m => {
        const title = m.title || '';
        const text = m.extractedText || '';
        return `${title} ${text}`;
      })
      .join(' ');

    // Extract meaningful keywords
    const keywords = textQualityAnalyzer.extractKeywords(allText, 15);

    // Image usage
    const memoriesWithImages = memories.filter(m => m.hasImages);
    const imagePercent = memories.length > 0 
      ? Math.round((memoriesWithImages.length / memories.length) * 100)
      : 0;

    return {
      themes: keywords,
      hasImages: memoriesWithImages.length > 0,
      imagePercent
    };
  }
}

module.exports = ThemeAnalysis;