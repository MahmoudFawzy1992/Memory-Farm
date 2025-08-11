const Memory = require('../../models/Memory');

// Public feed (only isPublic: true)
exports.getPublicMemories = async (_req, res) => {
  try {
    const memories = await Memory.find({ isPublic: true })
      .populate('userId', 'displayName')
      .sort({ createdAt: -1 });

    res.json({ memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch public memories' });
  }
};

// Read one (owner can see private; others only public)
exports.getMemoryById = async (req, res) => {
  const memoryId = req.params.id;

  try {
    const memory = await Memory.findById(memoryId).populate('userId', '_id displayName');
    if (!memory) return res.status(404).json({ error: 'Memory not found' });

    const isOwner = memory.userId?._id?.toString() === req.user.id;
    if (!memory.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to view this memory' });
    }

    res.status(200).json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
};
