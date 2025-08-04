const Report = require('../models/Report');

// ✅ Create a report (memory or user)
exports.createReport = async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!['user', 'memory'].includes(targetType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  if (!targetId) {
    return res.status(400).json({ error: 'Target ID is required' });
  }

  try {
    const existing = await Report.findOne({
      reporter: req.user.id,
      targetType,
      targetId,
    });

    if (existing) {
      return res.status(409).json({ error: 'You already reported this' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
    });

    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error('❌ Failed to create report:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};
