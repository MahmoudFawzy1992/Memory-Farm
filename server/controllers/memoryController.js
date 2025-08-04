const Memory = require('../models/Memory');

// ✅ Toggle public/private visibility for a memory
exports.toggleVisibility = async (req, res) => {
  const memoryId = req.params.id;

  try {
    const memory = await Memory.findById(memoryId);

    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    if (memory.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this memory' });
    }

    memory.isPublic = !memory.isPublic;
    await memory.save();

    res.json({
      message: `Memory is now ${memory.isPublic ? 'public' : 'private'}`,
      isPublic: memory.isPublic,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update memory visibility' });
  }
};

// ✅ Get all public memories (for explore or feed)
exports.getPublicMemories = async (req, res) => {
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

// ✅ Get memory by ID (either owned or public)
exports.getMemoryById = async (req, res) => {
  const memoryId = req.params.id;

  try {
    const memory = await Memory.findById(memoryId).populate('userId', 'displayName');

    if (!memory) return res.status(404).json({ error: 'Memory not found' });

    // If owner or public, allow viewing
    if (
      memory.userId._id.toString() === req.user.id ||
      memory.isPublic === true
    ) {
      return res.status(200).json(memory);
    }

    return res.status(403).json({ error: 'Not authorized to view this memory' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
};
