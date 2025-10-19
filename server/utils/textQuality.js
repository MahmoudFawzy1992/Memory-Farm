/**
 * Text Quality Analysis Utilities
 * 
 * Detects and filters low-quality text before sending to AI:
 * - Gibberish detection (random characters like "asdfasdf")
 * - Profanity filtering
 * - Content quality scoring (0-100)
 * - Keyword extraction
 * 
 * This saves API costs by not sending garbage to expensive AI models.
 */

class TextQualityAnalyzer {
  constructor() {
    // Comprehensive profanity list
    // Note: This is a production app, so we keep this list minimal but effective
    this.profanityList = [
      'fuck', 'shit', 'damn', 'bitch', 'ass', 'asshole', 
      'bastard', 'crap', 'hell', 'piss', 'dick', 'cock',
      'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger',
      'retard', 'idiot', 'moron', 'stupid'
    ];

    // Common gibberish patterns
    this.gibberishPatterns = [
      /(.)\1{4,}/g, // Same character repeated 5+ times (aaaaa)
      /^[qwerty]{5,}$/i, // Keyboard mashing (qwerty, asdfgh)
      /^[asdfgh]{5,}$/i,
      /^[zxcvbn]{5,}$/i,
      /[bcdfghjklmnpqrstvwxyz]{8,}/i, // Too many consonants in a row
      /^[^aeiou\s]{15,}$/i, // Long string with no vowels
    ];

    // Stop words (common words to ignore in keyword extraction)
    this.stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
      'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
      'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
      'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
      'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
      'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
      'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some',
      'could', 'them', 'see', 'other', 'than', 'then', 'now',
      'look', 'only', 'come', 'its', 'over', 'think', 'also',
      'back', 'after', 'use', 'two', 'how', 'our', 'work',
      'first', 'well', 'way', 'even', 'new', 'want', 'because',
      'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was',
      'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having'
    ]);
  }

  /**
   * Detect if text is gibberish
   * 
   * @param {string} text - Text to analyze
   * @returns {boolean} - True if text appears to be gibberish
   */
  isGibberish(text) {
    if (!text || typeof text !== 'string') {
      return true;
    }

    const cleanText = text.trim().toLowerCase();

    if (cleanText.length < 3) {
      return false; // Too short to judge
    }

    // Check against gibberish patterns
    for (const pattern of this.gibberishPatterns) {
      if (pattern.test(cleanText)) {
        return true;
      }
    }

    // Check consonant-to-vowel ratio (too many consonants = gibberish)
    const consonants = (cleanText.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    const vowels = (cleanText.match(/[aeiou]/g) || []).length;
    
    if (cleanText.length > 10 && vowels === 0) {
      return true; // No vowels in long text = gibberish
    }

    if (consonants > vowels * 4 && cleanText.length > 15) {
      return true; // Way too many consonants
    }

    // Check for random character sequences
    const words = cleanText.split(/\s+/);
    let gibberishWordCount = 0;

    for (const word of words) {
      if (word.length > 8) {
        const uniqueChars = new Set(word.split('')).size;
        // If a long word has very few unique characters, it's likely gibberish
        if (uniqueChars < word.length / 3) {
          gibberishWordCount++;
        }
      }
    }

    // If more than 30% of words are gibberish-like, flag as gibberish
    if (words.length > 3 && gibberishWordCount / words.length > 0.3) {
      return true;
    }

    return false;
  }

  /**
   * Filter profanity from text
   * Replaces profane words with asterisks
   * 
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  filterProfanity(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let cleanedText = text;

    for (const word of this.profanityList) {
      // Create regex that matches the word with word boundaries
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const replacement = '*'.repeat(word.length);
      cleanedText = cleanedText.replace(regex, replacement);
    }

    return cleanedText;
  }

  /**
   * Check if text contains profanity
   * 
   * @param {string} text - Text to check
   * @returns {boolean} - True if profanity detected
   */
  hasProfanity(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const lowerText = text.toLowerCase();

    for (const word of this.profanityList) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate content quality score (0-100)
   * Higher score = better quality for AI analysis
   * 
   * @param {string} text - Text to analyze
   * @returns {number} - Quality score (0-100)
   */
  calculateQualityScore(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return 0;
    }

    let score = 50; // Start at neutral

    const cleanText = text.trim();
    const wordCount = cleanText.split(/\s+/).length;
    const charCount = cleanText.length;

    // Length factors (sweet spot: 20-200 words)
    if (wordCount >= 20 && wordCount <= 200) {
      score += 15;
    } else if (wordCount >= 10 && wordCount < 20) {
      score += 10;
    } else if (wordCount > 200) {
      score += 5; // Still good but very long
    } else {
      score -= 10; // Too short
    }

    // Sentence structure (periods indicate complete thoughts)
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 2) {
      score += 10;
    }

    // Check for gibberish
    if (this.isGibberish(cleanText)) {
      score -= 30;
    }

    // Check for profanity
    if (this.hasProfanity(cleanText)) {
      score -= 5;
    }

    // Vocabulary diversity (unique words / total words)
    const words = cleanText.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;

    if (diversity > 0.7) {
      score += 15; // High vocabulary diversity
    } else if (diversity > 0.5) {
      score += 10;
    } else if (diversity < 0.3) {
      score -= 10; // Too repetitive
    }

    // Capitalization check (proper capitalization is a quality signal)
    const capitalizedSentences = cleanText.split(/[.!?]+/).filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && /^[A-Z]/.test(trimmed);
    }).length;

    if (sentences.length > 0 && capitalizedSentences / sentences.length > 0.7) {
      score += 5; // Good capitalization
    }

    // Punctuation check (proper punctuation indicates thought)
    const punctuationCount = (cleanText.match(/[.,!?;:]/g) || []).length;
    if (punctuationCount >= wordCount * 0.1) {
      score += 5; // Adequate punctuation
    }

    // Cap score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Extract meaningful keywords from text
   * Useful for AI context building
   * 
   * @param {string} text - Text to analyze
   * @param {number} maxKeywords - Maximum keywords to return
   * @returns {string[]} - Array of keywords
   */
  extractKeywords(text, maxKeywords = 10) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Clean and tokenize
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .trim();

    const words = cleanText.split(/\s+/);

    // Count word frequencies (excluding stop words)
    const wordFreq = {};
    
    for (const word of words) {
      if (word.length >= 3 && !this.stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    // Sort by frequency and return top keywords
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);

    return keywords;
  }

  /**
   * Analyze text and return comprehensive quality report
   * 
   * @param {string} text - Text to analyze
   * @returns {Object} - Complete analysis
   */
  analyzeText(text) {
    if (!text || typeof text !== 'string') {
      return {
        valid: false,
        qualityScore: 0,
        isGibberish: true,
        hasProfanity: false,
        wordCount: 0,
        keywords: [],
        cleanedText: '',
        shouldUseForAI: false
      };
    }

    const qualityScore = this.calculateQualityScore(text);
    const isGibberishResult = this.isGibberish(text);
    const hasProfanityResult = this.hasProfanity(text);
    const cleanedText = hasProfanityResult ? this.filterProfanity(text) : text;
    const keywords = this.extractKeywords(cleanedText);
    const wordCount = text.trim().split(/\s+/).length;

    // Decision: Should we use this text for AI?
    // Use if: not gibberish AND (quality >= 40 OR has at least 10 words)
    const shouldUseForAI = !isGibberishResult && (qualityScore >= 40 || wordCount >= 10);

    return {
      valid: !isGibberishResult,
      qualityScore,
      isGibberish: isGibberishResult,
      hasProfanity: hasProfanityResult,
      wordCount,
      keywords,
      cleanedText,
      shouldUseForAI
    };
  }
}

// Export singleton instance
module.exports = new TextQualityAnalyzer();