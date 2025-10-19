const promptBuilder = require('../../utils/promptBuilder');

describe('Prompt Builder', () => {
  
  const mockPatterns = {
    totalMemories: 15,
    dominantEmotion: 'Happy',
    emotionBreakdown: {
      'Happy': { count: 5, percentage: 33 },
      'Anxious': { count: 4, percentage: 27 }
    },
    emotionDiversity: 8,
    avgWordCount: 85,
    writingStyle: 'conversational',
    topThemes: ['work', 'friends', 'goals'],
    currentStreak: 5,
    longestStreak: 12,
    activeTime: 'evening',
    writingFrequency: 'regular',
    recentMemories: [
      { emotion: 'Happy', summary: 'Great day at work', themes: ['work'] },
      { emotion: 'Anxious', summary: 'Worried about deadline', themes: ['work', 'stress'] }
    ],
    daysSinceFirstMemory: 20
  };

  describe('buildPrompt', () => {
    test('should build welcome prompt for memory #1', () => {
      const prompt = promptBuilder.buildPrompt(1, mockPatterns, { title: 'First memory' });
      
      expect(prompt).toContain('first memory');
      expect(prompt).toContain('60-80 words');
      expect(prompt).toContain('welcoming');
    });

    test('should build early pattern prompt for memory #5', () => {
      const prompt = promptBuilder.buildPrompt(5, mockPatterns);
      
      expect(prompt).toContain('5 memories');
      expect(prompt).toContain('80-100 words');
      expect(prompt).toContain('early pattern');
    });

    test('should build deeper analysis prompt for memory #10', () => {
      const prompt = promptBuilder.buildPrompt(10, mockPatterns);
      
      expect(prompt).toContain('10 memories');
      expect(prompt).toContain('100-130 words');
    });

    test('should build adaptive prompt for memory #15+', () => {
    const prompt = promptBuilder.buildPrompt(15, mockPatterns);
    
    expect(prompt).toContain('15 memories');
    expect(prompt).toContain('120-150 words');
    expect(prompt).toContain('EMOTIONAL LANDSCAPE');
    expect(prompt).toContain('LIFE BALANCE'); // ✅ Check life balance section exists
    // ✅ Check that themes are analyzed into life areas
    expect(prompt).toMatch(/work|relationships|personal/); // At least one life area mentioned
    });

    test('should include user patterns in prompts', () => {
      const prompt = promptBuilder.buildPrompt(15, mockPatterns);
      
      expect(prompt).toContain('Happy');
      expect(prompt).toContain('conversational');
      expect(prompt).toContain('work');
    });
  });

  describe('prompt word count specifications', () => {
    test('memory #1 prompt should specify 60-80 words', () => {
      const prompt = promptBuilder.buildPrompt(1, mockPatterns);
      expect(prompt).toMatch(/60-80 words/);
    });

    test('memory #5 prompt should specify 80-100 words', () => {
      const prompt = promptBuilder.buildPrompt(5, mockPatterns);
      expect(prompt).toMatch(/80-100 words/);
    });

    test('memory #10 prompt should specify 100-130 words', () => {
      const prompt = promptBuilder.buildPrompt(10, mockPatterns);
      expect(prompt).toMatch(/100-130 words/);
    });

    test('memory #15+ prompt should specify 120-150 words', () => {
      const prompt = promptBuilder.buildPrompt(15, mockPatterns);
      expect(prompt).toMatch(/120-150 words/);
    });
  });
});