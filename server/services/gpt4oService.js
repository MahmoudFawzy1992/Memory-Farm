const OpenAI = require('openai');

/**
 * GPT-4o-mini Service
 * 
 * Handles all interactions with OpenAI's GPT-4o-mini model for insight generation.
 * Features:
 * - Automatic cost calculation and token tracking
 * - Dynamic max_tokens based on memory count
 * - Detailed error handling with retry logic
 * - Usage logging for monitoring
 * 
 * Pricing (as of implementation):
 * - Input: $0.150 per 1M tokens
 * - Output: $0.600 per 1M tokens
 */

class GPT4oService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('⚠️  OPENAI_API_KEY not found in environment variables');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Pricing constants (per 1M tokens)
    this.INPUT_COST_PER_MILLION = 0.150;
    this.OUTPUT_COST_PER_MILLION = 0.600;
    
    // Model configuration
    this.MODEL_NAME = 'gpt-4o-mini';
    this.MAX_RETRIES = 2;
  }

  /**
   * Calculate appropriate max_tokens based on memory count
   * Ensures we stay within word count targets while controlling costs
   * 
   * @param {number} memoryCount - User's total memory count
   * @returns {number} - Max tokens to request from GPT
   */
  getMaxTokensForMemoryCount(memoryCount) {
    // Token-to-word ratio: ~1.3 tokens per word for English
    // We add buffer for safety
    
    if (memoryCount === 1) {
      // 60-80 words = ~100 tokens + buffer
      return 130;
    } else if (memoryCount === 5) {
      // 80-100 words = ~130 tokens + buffer
      return 170;
    } else if (memoryCount <= 10) {
      // 100-130 words = ~170 tokens + buffer
      return 220;
    } else {
      // 120-150 words = ~200 tokens + buffer
      return 260;
    }
  }

  /**
   * Calculate cost for a completion
   * 
   * @param {number} inputTokens - Tokens in prompt
   * @param {number} outputTokens - Tokens in completion
   * @returns {number} - Cost in USD
   */
  calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000000) * this.INPUT_COST_PER_MILLION;
    const outputCost = (outputTokens / 1000000) * this.OUTPUT_COST_PER_MILLION;
    return inputCost + outputCost;
  }

  /**
   * Generate insight using GPT-4o-mini
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
      throw new Error('OpenAI client not initialized - missing API key');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided to GPT-4o service');
    }

    if (!memoryCount || memoryCount < 1) {
      throw new Error('Invalid memory count provided');
    }

    // Get appropriate max_tokens for this memory count
    const maxTokens = this.getMaxTokensForMemoryCount(memoryCount);

    const requestConfig = {
      model: this.MODEL_NAME,
        messages: [
        {
          role: 'system',
          content: 'You are a warm, empathetic personal growth coach who helps people understand their emotional patterns through their memories. Be specific, insightful, and encouraging. Always write in a natural, conversational tone. CRITICAL: You MUST strictly follow the word count specified in the user prompt. Never exceed the maximum word count.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7, // Balanced creativity and consistency
      top_p: 0.9,
      frequency_penalty: 0.3, // Reduce repetition
      presence_penalty: 0.2, // Encourage topic diversity
    };

    let lastError = null;

    // Retry logic for transient failures
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🤖 GPT-4o-mini attempt ${attempt}/${this.MAX_RETRIES}`, {
          memoryCount,
          maxTokens,
          promptLength: prompt.length
        });

        const completion = await this.client.chat.completions.create(requestConfig);

        // Extract response
        const insightText = completion.choices[0]?.message?.content?.trim();

        if (!insightText) {
          throw new Error('Empty response from GPT-4o-mini');
        }

        // Calculate metrics
        const generationTime = Date.now() - startTime;
        const inputTokens = completion.usage?.prompt_tokens || 0;
        const outputTokens = completion.usage?.completion_tokens || 0;
        const totalTokens = completion.usage?.total_tokens || 0;
        const cost = this.calculateCost(inputTokens, outputTokens);

        // Word count validation (soft check - warn but don't fail)
        const wordCount = insightText.split(/\s+/).length;
        const expectedMax = memoryCount === 1 ? 80 : memoryCount === 5 ? 100 : memoryCount <= 10 ? 130 : 150;
        
        if (wordCount > expectedMax + 20) {
          console.warn(`⚠️  GPT-4o-mini exceeded word count: ${wordCount} words (expected max: ${expectedMax})`);
          // Truncate if severely over
          if (wordCount > expectedMax + 50) {
            const words = insightText.split(/\s+/);
            const truncated = words.slice(0, expectedMax).join(' ') + '...';
            console.log(`✂️  Truncated insight from ${wordCount} to ${expectedMax} words`);
            
            return {
              text: truncated,
              model: this.MODEL_NAME,
              tokensUsed: totalTokens,
              inputTokens,
              outputTokens,
              cost,
              generationTime,
              wordCount: expectedMax,
              truncated: true
            };
          }
        }

        console.log(`✅ GPT-4o-mini success:`, {
          wordCount,
          tokens: totalTokens,
          cost: `$${cost.toFixed(6)}`,
          time: `${generationTime}ms`
        });

        return {
          text: insightText,
          model: this.MODEL_NAME,
          tokensUsed: totalTokens,
          inputTokens,
          outputTokens,
          cost,
          generationTime,
          wordCount,
          truncated: false
        };

      } catch (error) {
        lastError = error;
        
        // Log detailed error info
        console.error(`❌ GPT-4o-mini attempt ${attempt} failed:`, {
          error: error.message,
          type: error.constructor.name,
          status: error.response?.status,
          code: error.code
        });

        // Don't retry on certain errors
        if (error.code === 'insufficient_quota' || 
            error.response?.status === 429 || 
            error.response?.status === 401) {
          console.error('🚫 GPT-4o-mini quota/auth error - stopping retries');
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delayMs}...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Unknown error';
    const errorType = lastError?.code || lastError?.response?.status || 'unknown';
    
    throw new Error(`GPT-4o-mini failed after ${this.MAX_RETRIES} attempts: ${errorMessage} (${errorType})`);
  }

  /**
   * Test connection to OpenAI API
   * Useful for health checks and debugging
   * 
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    if (!this.client) {
      return false;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL_NAME,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });

      return response.choices?.length > 0;
    } catch (error) {
      console.error('GPT-4o-mini connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new GPT4oService();