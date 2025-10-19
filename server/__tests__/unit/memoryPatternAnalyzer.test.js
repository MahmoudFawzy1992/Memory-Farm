const {
  calculateStreaks,
  categorizeEmotion,
  detectEmotionalShift,
  analyzeTemporalPatterns
} = require('../../utils/memoryPatternAnalyzer');

describe('Memory Pattern Analyzer', () => {
  
  describe('categorizeEmotion', () => {
    test('should categorize joy family emotions', () => {
      expect(categorizeEmotion('Happy')).toBe('joy');
      expect(categorizeEmotion('😊 Happy')).toBe('joy');
      expect(categorizeEmotion('Joyful')).toBe('joy');
      expect(categorizeEmotion('Excited')).toBe('joy');
    });

    test('should categorize sadness family emotions', () => {
      expect(categorizeEmotion('Sad')).toBe('sadness');
      expect(categorizeEmotion('Thoughtful')).toBe('sadness');
      expect(categorizeEmotion('Sorrowful')).toBe('sadness');
    });

    test('should categorize anger family emotions', () => {
      expect(categorizeEmotion('Angry')).toBe('anger');
      expect(categorizeEmotion('Frustrated')).toBe('anger');
      expect(categorizeEmotion('Irritated')).toBe('anger');
    });

    test('should categorize fear family emotions', () => {
      expect(categorizeEmotion('Anxious')).toBe('fear');
      expect(categorizeEmotion('Worried')).toBe('fear');
      expect(categorizeEmotion('Nervous')).toBe('fear');
    });

    test('should handle unknown emotions', () => {
      expect(categorizeEmotion('RandomEmotion123')).toBe('other');
      expect(categorizeEmotion(null)).toBe('neutral');
      expect(categorizeEmotion('')).toBe('neutral');
    });
  });

  describe('calculateStreaks', () => {
    test('should calculate current streak correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const memories = [
        { createdAt: today, memoryDate: today },
        { createdAt: yesterday, memoryDate: yesterday },
        { createdAt: twoDaysAgo, memoryDate: twoDaysAgo }
      ];

      const result = calculateStreaks(memories);
      
      expect(result.current).toBeGreaterThanOrEqual(3);
    });

    test('should return 0 for no memories', () => {
      const result = calculateStreaks([]);
      
      expect(result.current).toBe(0);
      expect(result.longest).toBe(0);
    });

    test('should calculate longest streak', () => {
      const baseDate = new Date('2024-01-01');
      const memories = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date(baseDate.getTime() + i * 86400000),
        memoryDate: new Date(baseDate.getTime() + i * 86400000)
      }));

      const result = calculateStreaks(memories);
      
      expect(result.longest).toBeGreaterThanOrEqual(10);
    });

    test('should handle broken streaks', () => {
      const baseDate = new Date('2024-01-01');
      const memories = [
        { createdAt: new Date(baseDate), memoryDate: new Date(baseDate) },
        { createdAt: new Date(baseDate.getTime() + 86400000), memoryDate: new Date(baseDate.getTime() + 86400000) },
        // 2 day gap
        { createdAt: new Date(baseDate.getTime() + 4 * 86400000), memoryDate: new Date(baseDate.getTime() + 4 * 86400000) }
      ];

      const result = calculateStreaks(memories);
      
      expect(result.longest).toBeLessThan(memories.length);
    });
  });

  describe('detectEmotionalShift', () => {
    test('should detect shift from joy to sadness', () => {
      const allMemories = [
        { emotion: 'Happy' },
        { emotion: 'Happy' },
        { emotion: 'Sad' },
        { emotion: 'Sad' }
      ];
      
      const recentMemories = [
        { emotion: 'Sad' },
        { emotion: 'Sad' }
      ];

      const result = detectEmotionalShift(allMemories, recentMemories);
      
      expect(result).toContain('→');
    });

    test('should return stable when no shift', () => {
      const allMemories = [
        { emotion: 'Happy' },
        { emotion: 'Happy' }
      ];
      
      const recentMemories = [
        { emotion: 'Happy' }
      ];

      const result = detectEmotionalShift(allMemories, recentMemories);
      
      expect(result).toBe('stable');
    });

    test('should handle insufficient data', () => {
      const result = detectEmotionalShift([], []);
      expect(result).toBe('stable');
    });
  });

  describe('analyzeTemporalPatterns', () => {
    test('should detect evening writing pattern', () => {
      const eveningHour = 19; // 7 PM
      const memories = Array.from({ length: 5 }, () => {
        const date = new Date();
        date.setHours(eveningHour);
        return { createdAt: date };
      });

      const result = analyzeTemporalPatterns(memories);
      
      expect(result.activeTime).toBe('evening');
    });

    test('should detect morning writing pattern', () => {
      const morningHour = 8; // 8 AM
      const memories = Array.from({ length: 5 }, () => {
        const date = new Date();
        date.setHours(morningHour);
        return { createdAt: date };
      });

      const result = analyzeTemporalPatterns(memories);
      
      expect(result.activeTime).toBe('morning');
    });

    test('should calculate daily frequency', () => {
      const today = new Date();
      const memories = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date(today.getTime() - i * 86400000) // Last 10 days
      }));

      const result = analyzeTemporalPatterns(memories);
      
      expect(result.frequency).toBe('daily');
    });

    test('should calculate occasional frequency', () => {
      const today = new Date();
      const memories = Array.from({ length: 3 }, (_, i) => ({
        createdAt: new Date(today.getTime() - i * 10 * 86400000) // Every 10 days
      }));

      const result = analyzeTemporalPatterns(memories);
      
      expect(result.frequency).toBe('occasional');
    });

    test('should handle no memories', () => {
      const result = analyzeTemporalPatterns([]);
      
      expect(result.activeTime).toBe('evening');
      expect(result.frequency).toBe('new');
    });
  });
});