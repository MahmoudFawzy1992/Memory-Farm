const aiInsightService = require('../../services/aiInsightService');
const gpt4oService = require('../../services/gpt4oService');
const llamaService = require('../../services/llamaService');

// Mock the actual AI services to avoid real API calls
jest.mock('../../services/gpt4oService');
jest.mock('../../services/llamaService');

describe('AI Insight Service Integration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();

    // ✅ CRITICAL: Reset AI service state between tests
    // This prevents cooldown from one test affecting another
    aiInsightService.lastKnownGPTStatus = 'unknown';
    aiInsightService.lastGPTFailureTime = null;
  });

  describe('generateInsight with 3-tier fallback', () => {
    const mockPrompt = 'Test prompt for insight generation';
    const memoryCount = 15;

    test('should use GPT-4o-mini successfully (PRIMARY)', async () => {
      gpt4oService.generateInsight = jest.fn().mockResolvedValue({
        text: 'Great insight from GPT!',
        model: 'gpt-4o-mini',
        tokensUsed: 500,
        inputTokens: 300,
        outputTokens: 200,
        cost: 0.0001,
        generationTime: 1500,
        wordCount: 120,
        truncated: false
      });

      const result = await aiInsightService.generateInsight(mockPrompt, memoryCount);
      
      expect(result.model).toBe('gpt-4o-mini');
      expect(result.text).toBe('Great insight from GPT!');
      expect(gpt4oService.generateInsight).toHaveBeenCalledWith(mockPrompt, memoryCount, {});
      expect(llamaService.generateInsight).not.toHaveBeenCalled();
    });

    test('should fall back to Llama when GPT fails (FALLBACK 1)', async () => {
      gpt4oService.generateInsight = jest.fn().mockRejectedValue(
        new Error('GPT-4o-mini quota exceeded')
      );

      llamaService.generateInsight = jest.fn().mockResolvedValue({
        text: 'Good insight from Llama!',
        model: 'llama-3.2',
        tokensUsed: null,
        cost: 0,
        generationTime: 2000,
        wordCount: 115,
        truncated: false
      });

      const result = await aiInsightService.generateInsight(mockPrompt, memoryCount);
      
      expect(result.model).toBe('llama-3.2');
      expect(result.text).toBe('Good insight from Llama!');
      expect(result.fallbackReason).toContain('GPT-4o-mini error');
      expect(gpt4oService.generateInsight).toHaveBeenCalled();
      expect(llamaService.generateInsight).toHaveBeenCalled();
    });

    test('should throw error when both AI models fail (triggers static fallback)', async () => {
    // ✅ Ensure GPT is available (not in cooldown)
    aiInsightService.lastKnownGPTStatus = 'unknown';
    aiInsightService.lastGPTFailureTime = null;
    
    const mockGPTError = new Error('GPT failed');
    const mockLlamaError = new Error('Llama failed');
    
    gpt4oService.generateInsight.mockRejectedValueOnce(mockGPTError);
    llamaService.generateInsight.mockRejectedValueOnce(mockLlamaError);

    await expect(
        aiInsightService.generateInsight(mockPrompt, memoryCount)
    ).rejects.toThrow('All AI models failed');
    
    expect(gpt4oService.generateInsight).toHaveBeenCalled();
    expect(llamaService.generateInsight).toHaveBeenCalled();
    });

    test('should respect GPT cooldown after failure', async () => {
      // First call fails
      gpt4oService.generateInsight = jest.fn().mockRejectedValue(
        new Error('GPT failed')
      );

      llamaService.generateInsight = jest.fn().mockResolvedValue({
        text: 'Llama insight',
        model: 'llama-3.2',
        cost: 0,
        generationTime: 2000,
        wordCount: 115
      });

      // First generation
      await aiInsightService.generateInsight(mockPrompt, memoryCount);
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Immediate second call - should skip GPT (cooldown)
      await aiInsightService.generateInsight(mockPrompt, memoryCount);
      
      // GPT should not be called due to cooldown
      expect(gpt4oService.generateInsight).not.toHaveBeenCalled();
      expect(llamaService.generateInsight).toHaveBeenCalled();
    });
  });

  describe('regenerateInsight', () => {
    const mockPrompt = 'Test prompt';
    const memoryCount = 20;

    test('should try original model first for regeneration', async () => {
    // ✅ Reset state and ensure GPT is available
    aiInsightService.lastKnownGPTStatus = 'unknown';
    aiInsightService.lastGPTFailureTime = null;
    
    gpt4oService.generateInsight.mockResolvedValueOnce({
        text: 'Regenerated insight from GPT!',
        model: 'gpt-4o-mini',
        tokensUsed: 520,
        cost: 0.00012,
        generationTime: 1600,
        wordCount: 125
    });

    const result = await aiInsightService.regenerateInsight(
        mockPrompt,
        memoryCount,
        'gpt-4o-mini'
    );
    
    expect(result.model).toBe('gpt-4o-mini');
    expect(gpt4oService.generateInsight).toHaveBeenCalled();
    });

    test('should fall back if original model fails', async () => {
      gpt4oService.generateInsight = jest.fn().mockRejectedValue(
        new Error('GPT unavailable')
      );

      llamaService.generateInsight = jest.fn().mockResolvedValue({
        text: 'Fallback regeneration',
        model: 'llama-3.2',
        cost: 0,
        generationTime: 2100,
        wordCount: 118
      });

      const result = await aiInsightService.regenerateInsight(
        mockPrompt,
        memoryCount,
        'gpt-4o-mini'
      );
      
      expect(result.model).toBe('llama-3.2');
      expect(result.fallbackReason).toContain('GPT-4o-mini unavailable');
    });
  });

  describe('getServiceStatus', () => {
    test('should return current service status', () => {
      const status = aiInsightService.getServiceStatus();
      
      expect(status).toHaveProperty('gptStatus');
      expect(status).toHaveProperty('gptLastFailure');
      expect(status).toHaveProperty('gptCooldownRemaining');
      expect(status).toHaveProperty('isGPTAvailable');
    });
  });
});