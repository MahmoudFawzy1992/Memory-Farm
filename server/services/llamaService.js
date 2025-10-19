const { HfInference } = require('@huggingface/inference');

/**
 * Llama 3.2-3B Service
 * 
 * Free fallback service using Hugging Face's Llama 3.2-3B-Instruct model.
 * Features:
 * - Free tier usage (no cost tracking needed)
 * - Output cleaning (removes <think> tags and artifacts)
 * - Quality validation
 * - Slower but reliable fallback
 * 
 * Note: Lower quality than GPT-4o-mini but sufficient for basic insights
 */

class LlamaService {
  constructor() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('⚠️  HUGGINGFACE_API_KEY not found in environment variables');
      this.client = null;
    } else {
      this.client = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }

    // Model configuration
    this.MODEL_NAME = 'meta-llama/Llama-3.2-3B-Instruct';
    this.MAX_RETRIES = 2;
    this.TIMEOUT_MS = 15000; // 15 seconds (Llama is slower)
  }

  /**
   * Calculate appropriate max_tokens based on memory count
   * Same logic as GPT but with slightly higher buffer due to less reliable word counting
   * 
   * @param {number} memoryCount - User's total memory count
   * @returns {number} - Max tokens to request
   */
  getMaxTokensForMemoryCount(memoryCount) {
    if (memoryCount === 1) {
      return 150; // 60-80 words + buffer
    } else if (memoryCount === 5) {
      return 190; // 80-100 words + buffer
    } else if (memoryCount <= 10) {
      return 240; // 100-130 words + buffer
    } else {
      return 280; // 120-150 words + buffer
    }
  }

  /**
   * Clean Llama output
   * Removes <think> tags and other artifacts that Llama sometimes generates
   * 
   * @param {string} text - Raw output from Llama
   * @returns {string} - Cleaned text
   */
  cleanLlamaOutput(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let cleaned = text;

    // Remove <think> tags and their content
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove any remaining XML-like tags
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

    // Remove markdown artifacts
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Ensure text ends with proper punctuation
    if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
      // Find last complete sentence
      const lastPeriod = cleaned.lastIndexOf('.');
      const lastQuestion = cleaned.lastIndexOf('?');
      const lastExclamation = cleaned.lastIndexOf('!');
      const lastPunctuation = Math.max(lastPeriod, lastQuestion, lastExclamation);

      if (lastPunctuation > 50) {
        // Cut at last complete sentence
        cleaned = cleaned.slice(0, lastPunctuation + 1);
      } else {
        // Add period if no good stopping point found
        cleaned += '.';
      }
    }

    return cleaned;
  }

  /**
   * Validate output quality
   * Ensures the output meets minimum quality standards
   * 
   * @param {string} text - Cleaned output
   * @returns {Object} - { valid: boolean, reason?: string }
   */
  validateOutput(text) {
    if (!text || text.length < 50) {
      return { valid: false, reason: 'Output too short' };
    }

    if (text.length > 2000) {
      return { valid: false, reason: 'Output too long' };
    }

    // Check for gibberish (too many special characters)
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,!?'-]/g) || []).length / text.length;
    if (specialCharRatio > 0.15) {
      return { valid: false, reason: 'Too many special characters' };
    }

    // Check for repeated phrases (sign of model confusion)
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 20 && uniqueWords.size / words.length < 0.5) {
      return { valid: false, reason: 'Too much repetition' };
    }

    return { valid: true };
  }

  /**
   * Generate insight using Llama 3.2-3B
   * 
   * @param {string} prompt - The formatted prompt for insight generation
   * @param {number} memoryCount - User's total memory count
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Generated insight with metadata
   */
  async generateInsight(prompt, memoryCount, options = {}) {
    const startTime = Date.now();

    // Validation
    if (!this.client) {
      throw new Error('Hugging Face client not initialized - missing API key');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided to Llama service');
    }

    if (!memoryCount || memoryCount < 1) {
      throw new Error('Invalid memory count provided');
    }

    // Get appropriate max_tokens
    const maxTokens = this.getMaxTokensForMemoryCount(memoryCount);

    let lastError = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🦙 Llama 3.2 attempt ${attempt}/${this.MAX_RETRIES}`, {
          memoryCount,
          maxTokens,
          promptLength: prompt.length
        });

        // Call Hugging Face Inference API
        const response = await this.client.chatCompletion({
          model: this.MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: 'You are a warm, empathetic personal growth coach who helps people understand their emotional patterns. Be specific and encouraging. Write naturally and conversationally. CRITICAL: You MUST strictly follow the word count specified in the user prompt. Never exceed the maximum word count.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9
        });

        // Extract text from response
        const rawText = response.choices[0]?.message?.content;

        if (!rawText) {
          throw new Error('Empty response from Llama');
        }

        // Clean output
        const cleanedText = this.cleanLlamaOutput(rawText);

        // Validate quality
        const validation = this.validateOutput(cleanedText);
        if (!validation.valid) {
          throw new Error(`Output quality check failed: ${validation.reason}`);
        }

        // Calculate metrics
        const generationTime = Date.now() - startTime;
        const wordCount = cleanedText.split(/\s+/).length;

        // Word count check (soft)
        const expectedMax = memoryCount === 1 ? 80 : memoryCount === 5 ? 100 : memoryCount <= 10 ? 130 : 150;
        
        let finalText = cleanedText;
        let truncated = false;

        if (wordCount > expectedMax + 30) {
          console.warn(`⚠️  Llama exceeded word count: ${wordCount} words (expected max: ${expectedMax})`);
          // Truncate if severely over
          const words = cleanedText.split(/\s+/);
          finalText = words.slice(0, expectedMax).join(' ') + '.';
          truncated = true;
          console.log(`✂️  Truncated Llama output from ${wordCount} to ${expectedMax} words`);
        }

        console.log(`✅ Llama 3.2 success:`, {
          wordCount: truncated ? expectedMax : wordCount,
          time: `${generationTime}ms`,
          truncated
        });

        return {
          text: finalText,
          model: this.MODEL_NAME,
          tokensUsed: null, // HF doesn't provide token count in free tier
          cost: 0, // Free tier
          generationTime,
          wordCount: truncated ? expectedMax : wordCount,
          truncated
        };

      } catch (error) {
        lastError = error;

        console.error(`❌ Llama attempt ${attempt} failed:`, {
          error: error.message,
          type: error.constructor.name
        });

        // Wait before retry
        if (attempt < this.MAX_RETRIES) {
          const delayMs = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All retries failed
    throw new Error(`Llama failed after ${this.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Test connection to Hugging Face API
   * 
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    if (!this.client) {
      return false;
    }

    try {
      const response = await this.client.chatCompletion({
        model: this.MODEL_NAME,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      });

      return response.choices?.length > 0;
    } catch (error) {
      console.error('Llama connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new LlamaService();