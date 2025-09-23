const SimpleInsightsService = require('../services/simpleInsightsService');
const Insight = require('../models/Insight');
const Memory = require('../models/Memory');
const User = require('../models/User');

// Get user's dashboard insights
exports.getDashboardInsights = async (req, res) => {
  try {
    const { limit = 10, unreadOnly = false } = req.query;
    
    const options = {
      limit: Math.min(parseInt(limit), 20),
      unreadOnly: unreadOnly === 'true'
    };

    const insights = await SimpleInsightsService.getUserDashboardInsights(
      req.user.id, 
      options.limit
    );

    // Get user's current memory count for context
    const memoryCount = await Memory.countDocuments({ userId: req.user.id });

    res.json({
      insights,
      meta: {
        totalInsights: insights.length,
        userMemoryCount: memoryCount,
        hasUnread: insights.some(insight => !insight.isRead)
      }
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to load insights' });
  }
};

// Trigger insight generation (called after memory creation)
exports.triggerInsightGeneration = async (req, res) => {
  try {
    const { memoryId } = req.body;
    
    if (!memoryId) {
      return res.status(400).json({ error: 'Memory ID is required' });
    }

    // Verify memory belongs to user
    const memory = await Memory.findOne({ _id: memoryId, userId: req.user.id });
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Get current memory count
    const memoryCount = await Memory.countDocuments({ userId: req.user.id });

    // Generate insight
    const insight = await SimpleInsightsService.generateInsightForUser(
      req.user.id,
      memoryCount,
      memoryId
    );

    if (insight) {
      res.json({
        success: true,
        insight,
        shouldNotify: true,
        memoryCount
      });
    } else {
      res.json({
        success: true,
        insight: null,
        shouldNotify: false,
        memoryCount
      });
    }
  } catch (error) {
    console.error('Insight generation error:', error);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
};

// Mark insight as read
exports.markInsightAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await SimpleInsightsService.markInsightAsRead(id, req.user.id);
    
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    res.json({ success: true, insight });
  } catch (error) {
    console.error('Mark insight as read error:', error);
    res.status(500).json({ error: 'Failed to mark insight as read' });
  }
};

// Toggle insight favorite status
exports.toggleInsightFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await Insight.findOne({ _id: id, userId: req.user.id });
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    await insight.toggleFavorite();
    
    res.json({ 
      success: true, 
      insight,
      isFavorited: insight.isFavorited 
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

// Get user's insight analytics/stats
exports.getInsightStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [
      totalInsights,
      unreadCount,
      favoriteCount,
      recentInsights,
      memoryCount
    ] = await Promise.all([
      Insight.countDocuments({ userId, isVisible: true }),
      Insight.countDocuments({ userId, isVisible: true, isRead: false }),
      Insight.countDocuments({ userId, isVisible: true, isFavorited: true }),
      Insight.find({ userId, isVisible: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type category createdAt'),
      Memory.countDocuments({ userId })
    ]);

    // Calculate insights by category
    const insightsByCategory = await Insight.aggregate([
      { $match: { userId: req.user.id, isVisible: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: {
        totalInsights,
        unreadCount,
        favoriteCount,
        totalMemories: memoryCount,
        insightsByCategory: insightsByCategory.map(cat => ({
          category: cat._id,
          count: cat.count
        }))
      },
      recentInsights
    });
  } catch (error) {
    console.error('Insight stats error:', error);
    res.status(500).json({ error: 'Failed to load insight statistics' });
  }
};