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

// NEW: Regenerate insight endpoint
exports.regenerateInsight = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`\n🔄 Regenerate request for insight ${id}`);

    // Get user to check monthly limit
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ NEW: Check monthly regeneration limit (3 per month)
    if (!user.canRegenerateThisMonth()) {
      const remainingThisMonth = user.getRemainingRegenerations();
      return res.status(400).json({ 
        error: 'Monthly regeneration limit reached',
        message: `You've used all 3 regenerations this month. Your limit resets on the 1st of next month!`,
        monthlyLimit: 3,
        usedThisMonth: 3,
        remainingThisMonth: 0,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      });
    }

    // Get existing insight
    const existingInsight = await Insight.findOne({ 
      _id: id, 
      userId: req.user.id 
    });

    if (!existingInsight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    // Check per-insight regenerate limit (max 3 times per insight)
    if (!existingInsight.canRegenerate()) {
      return res.status(400).json({ 
        error: 'Insight regeneration limit reached',
        message: 'This specific insight has been regenerated 3 times already. Try regenerating a different insight!',
        insightRegenerateCount: existingInsight.aiMetadata?.regenerateCount || 3
      });
    }

    // Regenerate the insight
    const regeneratedInsight = await SimpleInsightsService.regenerateInsight(
        id,
        req.user.id
      );

      if (!regeneratedInsight) {
        return res.status(500).json({ error: 'Failed to regenerate insight' });
      }

      // ✅ Track monthly regeneration
      await user.trackRegeneration();

      // ✅ Get fresh user data after tracking
      const updatedUser = await User.findById(req.user.id);
      const remainingThisMonth = Math.max(0, 3 - (updatedUser.aiUsageTracking.monthlyRegenerations?.count || 0));

      console.log(`✅ Insight regenerated successfully\n`);

      res.json({
        success: true,
        insight: regeneratedInsight,
        regenerateCount: regeneratedInsight.aiMetadata?.regenerateCount || 0,
        remainingRegenerations: 3 - (regeneratedInsight.aiMetadata?.regenerateCount || 0),
        // ✅ FIXED: Accurate monthly stats with no negative numbers
        monthlyStats: {
          usedThisMonth: updatedUser.aiUsageTracking.monthlyRegenerations?.count || 0,
          remainingThisMonth: remainingThisMonth,
          monthlyLimit: 3
        }
      });


  } catch (error) {
    console.error('❌ Regenerate insight error:', error);
    res.status(500).json({ 
      error: 'Failed to regenerate insight',
      details: error.message 
    });
  }
};