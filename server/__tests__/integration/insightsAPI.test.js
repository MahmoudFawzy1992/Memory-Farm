const request = require('supertest');
const express = require('express');
const insightsRoutes = require('../../routes/insights');
const SimpleInsightsService = require('../../services/simpleInsightsService');
const Insight = require('../../models/Insight');
const Memory = require('../../models/Memory');

// Mock the services and models
jest.mock('../../services/simpleInsightsService');
jest.mock('../../models/Insight');
jest.mock('../../models/Memory');

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'test-user-123' };
  next();
};

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/insights', mockAuth, insightsRoutes);

describe('Insights API Endpoints', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /insights/dashboard', () => {
    test('should return user insights', async () => {
      const mockInsights = [
        {
          _id: 'insight1',
          title: 'Test Insight',
          message: 'Great progress!',
          triggerMemoryCount: 5,
          isRead: false
        }
      ];

      SimpleInsightsService.getUserDashboardInsights = jest.fn().mockResolvedValue(mockInsights);
      Memory.countDocuments = jest.fn().mockResolvedValue(10);

      const response = await request(app)
        .get('/insights/dashboard')
        .expect(200);

      expect(response.body.insights).toEqual(mockInsights);
      expect(response.body.meta.userMemoryCount).toBe(10);
      expect(SimpleInsightsService.getUserDashboardInsights).toHaveBeenCalledWith('test-user-123', 10);
    });

    test('should handle errors gracefully', async () => {
      SimpleInsightsService.getUserDashboardInsights = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/insights/dashboard')
        .expect(500);

      expect(response.body.error).toBe('Failed to load insights');
    });
  });

  describe('POST /insights/generate', () => {
    test('should generate insight successfully', async () => {
      const mockMemory = { _id: 'mem123', userId: 'test-user-123' };
      const mockInsight = {
        _id: 'insight123',
        message: 'New insight generated!',
        triggerMemoryCount: 5
      };

      Memory.findOne = jest.fn().mockResolvedValue(mockMemory);
      Memory.countDocuments = jest.fn().mockResolvedValue(5);
      SimpleInsightsService.generateInsightForUser = jest.fn().mockResolvedValue(mockInsight);

      const response = await request(app)
        .post('/insights/generate')
        .send({ memoryId: 'mem123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.insight).toEqual(mockInsight);
      expect(response.body.shouldNotify).toBe(true);
    });

    test('should return 400 if memoryId missing', async () => {
      const response = await request(app)
        .post('/insights/generate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Memory ID is required');
    });

    test('should return 404 if memory not found', async () => {
      Memory.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/insights/generate')
        .send({ memoryId: 'nonexistent' })
        .expect(404);

      expect(response.body.error).toBe('Memory not found');
    });
  });

  describe('PATCH /insights/:id/read', () => {
    test('should mark insight as read', async () => {
      const mockInsight = {
        _id: 'insight123',
        isRead: true,
        readAt: new Date()
      };

      SimpleInsightsService.markInsightAsRead = jest.fn().mockResolvedValue(mockInsight);

      const response = await request(app)
        .patch('/insights/insight123/read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.insight.isRead).toBe(true);
    });

    test('should return 404 if insight not found', async () => {
      SimpleInsightsService.markInsightAsRead = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .patch('/insights/nonexistent/read')
        .expect(404);

      expect(response.body.error).toBe('Insight not found');
    });
  });

  describe('PATCH /insights/:id/favorite', () => {
    test('should toggle favorite status', async () => {
      const mockInsight = {
        _id: 'insight123',
        isFavorited: false,
        toggleFavorite: jest.fn().mockResolvedValue(true)
      };

      Insight.findOne = jest.fn().mockResolvedValue(mockInsight);

      const response = await request(app)
        .patch('/insights/insight123/favorite')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockInsight.toggleFavorite).toHaveBeenCalled();
    });
  });

  describe('GET /insights/stats', () => {
    test('should return insight statistics', async () => {
      Insight.countDocuments = jest.fn()
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // unread
        .mockResolvedValueOnce(2); // favorites

      Insight.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([])
      });

      Insight.aggregate = jest.fn().mockResolvedValue([
        { _id: 'achievement', count: 5 },
        { _id: 'discovery', count: 3 }
      ]);

      Memory.countDocuments = jest.fn().mockResolvedValue(25);

      const response = await request(app)
        .get('/insights/stats')
        .expect(200);

      expect(response.body.stats.totalInsights).toBe(10);
      expect(response.body.stats.unreadCount).toBe(3);
      expect(response.body.stats.favoriteCount).toBe(2);
      expect(response.body.stats.totalMemories).toBe(25);
    });
  });

  describe('POST /insights/:id/regenerate', () => {
    test('should regenerate insight successfully', async () => {
      const mockInsight = {
        _id: 'insight123',
        userId: 'test-user-123',
        canRegenerate: jest.fn().mockReturnValue(true),
        aiMetadata: { regenerateCount: 1 }
      };

      const mockRegenerated = {
        ...mockInsight,
        message: 'Regenerated insight!',
        aiMetadata: { regenerateCount: 2 }
      };

      Insight.findOne = jest.fn().mockResolvedValue(mockInsight);
      SimpleInsightsService.regenerateInsight = jest.fn().mockResolvedValue(mockRegenerated);

      const response = await request(app)
        .post('/insights/insight123/regenerate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.insight.message).toBe('Regenerated insight!');
      expect(response.body.regenerateCount).toBe(2);
      expect(response.body.remainingRegenerations).toBe(1);
    });

    test('should return 400 when regeneration limit reached', async () => {
      const mockInsight = {
        _id: 'insight123',
        userId: 'test-user-123',
        canRegenerate: jest.fn().mockReturnValue(false),
        aiMetadata: { regenerateCount: 3 }
      };

      Insight.findOne = jest.fn().mockResolvedValue(mockInsight);

    const response = await request(app)
        .post('/insights/insight123/regenerate')
        .expect(400);

      expect(response.body.error).toBe('Regeneration limit reached');
      expect(response.body.message).toContain('3 times');
    });

    test('should return 404 if insight not found', async () => {
      Insight.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/insights/nonexistent/regenerate')
        .expect(404);

      expect(response.body.error).toBe('Insight not found');
    });

    test('should return 500 if regeneration fails', async () => {
      const mockInsight = {
        _id: 'insight123',
        userId: 'test-user-123',
        canRegenerate: jest.fn().mockReturnValue(true)
      };

      Insight.findOne = jest.fn().mockResolvedValue(mockInsight);
      SimpleInsightsService.regenerateInsight = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/insights/insight123/regenerate')
        .expect(500);

      expect(response.body.error).toBe('Failed to regenerate insight');
    });
  });
});