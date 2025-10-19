const gpt4oService = require('./gpt4oService');
const llamaService = require('./llamaService');

/**
 * AI Insight Service - Main Orchestrator
 * 
 * Coordinates the 3-tier fallback system for AI-generated insights:
 * - Memory #1 & #5: Llama → Static (free tier for first impressions)
 * - Memory #10+: GPT-4o-mini → Llama → Static (premium quality)
 * 
 * User never knows which system generated their insight - seamless experience.
 */

class AIInsightService {
  constructor() {
    this.lastKnownGPTStatus = 'unknown'; // 'working', 'failed', 'unknown'
    this.lastGPTFailureTime = null;
    this.GPT_COOLDOWN_MS = 60000; // Wait 1 minute before retrying GPT after failure
  }

  /**
   * Generate insight with smart model selection based on memory count
   * 
   * @param {string} prompt - Formatted prompt for AI
   * @param {number} memoryCount - User's total memory count
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - { text, model, metadata }
   */
  async generateInsight(prompt, memoryCount, options = {}) {
    let method = 'unknown';
    let result = null;
    let fallbackReason = null;

    // SPECIAL HANDLING: Memory #1 and #5 use free Llama first
    const isEarlyMemory = (memoryCount === 1 || memoryCount === 5);
    
    if (isEarlyMemory) {
      console.log(`🎯 Early memory (#${memoryCount}) - Using free Llama model`);
      
      // Try Llama directly for memories 1 & 5
      try {
        console.log('🦙 Attempting Llama 3.2-3B...');
        result = await llamaService.generateInsight(prompt, memoryCount, options);
        method = 'llama-3.2';
        
        console.log('✅ Llama 3.2 generated insight successfully');
        
        return {
          text: result.text,
          model: method,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          generationTime: result.generationTime,
          wordCount: result.wordCount,
          truncated: result.truncated || false,
          fallbackReason: null
        };
        
      } catch (llamaError) {
        console.error('❌ Llama 3.2 failed for early memory:', llamaError.message);
        fallbackReason = `Llama error: ${llamaError.message.substring(0, 100)}`;
        
        // For early memories, we go straight to static if Llama fails
        console.error('🚨 Llama failed for early memory - throwing error for static fallback');
        throw new Error(`Llama failed for memory #${memoryCount}. Fallback reason: ${fallbackReason}`);
      }
    }

    // NORMAL FLOW: Memory #10+ uses GPT → Llama → Static
    console.log(`🎯 Memory #${memoryCount} - Using premium GPT model with fallbacks`);

    // PRIMARY: Try GPT-4o-mini
    const shouldTryGPT = this.shouldAttemptGPT();
    
    if (shouldTryGPT) {
      try {
        console.log('🎯 PRIMARY: Attempting GPT-4o-mini...');
        result = await gpt4oService.generateInsight(prompt, memoryCount, options);
        method = 'gpt-4o-mini';
        this.lastKnownGPTStatus = 'working';
        this.lastGPTFailureTime = null;
        
        console.log('✅ GPT-4o-mini generated insight successfully');
        
        return {
          text: result.text,
          model: method,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          generationTime: result.generationTime,
          wordCount: result.wordCount,
          truncated: result.truncated || false,
          fallbackReason: null
        };
        
      } catch (gptError) {
        console.warn('⚠️ GPT-4o-mini failed:', gptError.message);
        this.lastKnownGPTStatus = 'failed';
        this.lastGPTFailureTime = Date.now();
        fallbackReason = `GPT-4o-mini error: ${gptError.message.substring(0, 100)}`;
        
        // Continue to fallback
      }
    } else {
      console.log('⭐️ Skipping GPT-4o-mini (recent failure, in cooldown)');
      fallbackReason = 'GPT-4o-mini in cooldown after recent failure';
    }

    // FALLBACK 1: Try Llama 3.2-3B
    try {
      console.log('🔄 FALLBACK 1: Attempting Llama 3.2-3B...');
      result = await llamaService.generateInsight(prompt, memoryCount, options);
      method = 'llama-3.2';
      
      console.log('✅ Llama 3.2 generated insight successfully');
      
      return {
        text: result.text,
        model: method,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        generationTime: result.generationTime,
        wordCount: result.wordCount,
        truncated: result.truncated || false,
        fallbackReason
      };
      
    } catch (llamaError) {
      console.error('❌ Llama 3.2 failed:', llamaError.message);
      fallbackReason = `${fallbackReason}; Llama error: ${llamaError.message.substring(0, 100)}`;
      
      // Continue to final fallback
    }

    // FALLBACK 2: Static insights (imported in caller)
    // We DON'T handle static here - the caller (simpleInsightsService) will catch
    // this error and use its own static generation
    console.error('🚨 Both AI models failed - throwing error for static fallback');
    throw new Error(`All AI models failed. Fallback reason: ${fallbackReason}`);
  }

  /**
   * Regenerate an existing insight
   * Tries to use the same model as original, but falls back if that model fails
   * 
   * @param {string} prompt - Formatted prompt for AI
   * @param {number} memoryCount - User's total memory count
   * @param {string} originalModel - Model that created the original insight
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - { text, model, metadata }
   */
  async regenerateInsight(prompt, memoryCount, originalModel, options = {}) {
    console.log(`🔄 Regenerating insight (original model: ${originalModel})`);

    // Try to use same model as original first
    if (originalModel === 'gpt-4o-mini') {
      const shouldTryGPT = this.shouldAttemptGPT();
      
      if (shouldTryGPT) {
        try {
          console.log('🎯 Attempting regeneration with GPT-4o-mini (original model)');
          const result = await gpt4oService.generateInsight(prompt, memoryCount, options);
          this.lastKnownGPTStatus = 'working';
          this.lastGPTFailureTime = null;
          
          return {
            text: result.text,
            model: 'gpt-4o-mini',
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            generationTime: result.generationTime,
            wordCount: result.wordCount,
            truncated: result.truncated || false,
            fallbackReason: null
          };
        } catch (error) {
          console.warn('⚠️ GPT-4o-mini regeneration failed, falling back...');
          this.lastKnownGPTStatus = 'failed';
          this.lastGPTFailureTime = Date.now();
        }
      } else {
        console.log('⭐️ Skipping GPT-4o-mini for regeneration (in cooldown)');
      }
    }

    if (originalModel === 'llama-3.2' || originalModel === 'gpt-4o-mini') {
      try {
        console.log('🦙 Attempting regeneration with Llama 3.2');
        const result = await llamaService.generateInsight(prompt, memoryCount, options);
        
        return {
          text: result.text,
          model: 'llama-3.2',
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          generationTime: result.generationTime,
          wordCount: result.wordCount,
          truncated: result.truncated || false,
          fallbackReason: originalModel === 'gpt-4o-mini' ? 'GPT-4o-mini unavailable' : null
        };
      } catch (error) {
        console.error('❌ Llama regeneration failed');
      }
    }

    // If original was static or all AI failed, use full fallback chain
    console.log('🔄 Using full fallback chain for regeneration');
    return this.generateInsight(prompt, memoryCount, options);
  }

  /**
   * Check if we should attempt GPT (or if it's in cooldown)
   * 
   * @returns {boolean}
   */
  shouldAttemptGPT() {
    if (this.lastKnownGPTStatus === 'working') {
      return true;
    }

    if (this.lastKnownGPTStatus === 'failed' && this.lastGPTFailureTime) {
      const timeSinceFailure = Date.now() - this.lastGPTFailureTime;
      if (timeSinceFailure < this.GPT_COOLDOWN_MS) {
        return false; // Still in cooldown
      }
    }

    return true; // Unknown status or cooldown expired, try again
  }

  /**
   * Test all AI services
   * Useful for health checks
   * 
   * @returns {Promise<Object>} - Status of each service
   */
  async testAllServices() {
    const results = {
      gpt4o: { available: false, tested: false },
      llama: { available: false, tested: false }
    };

    try {
      results.gpt4o.tested = true;
      results.gpt4o.available = await gpt4oService.testConnection();
    } catch (error) {
      console.error('GPT-4o test failed:', error.message);
    }

    try {
      results.llama.tested = true;
      results.llama.available = await llamaService.testConnection();
    } catch (error) {
      console.error('Llama test failed:', error.message);
    }

    return results;
  }

  /**
   * Get current AI service status
   * 
   * @returns {Object} - Current status information
   */
  getServiceStatus() {
    return {
      gptStatus: this.lastKnownGPTStatus,
      gptLastFailure: this.lastGPTFailureTime,
      gptCooldownRemaining: this.lastGPTFailureTime 
        ? Math.max(0, this.GPT_COOLDOWN_MS - (Date.now() - this.lastGPTFailureTime))
        : 0,
      isGPTAvailable: this.shouldAttemptGPT()
    };
  }
}

// Export singleton instance
module.exports = new AIInsightService();