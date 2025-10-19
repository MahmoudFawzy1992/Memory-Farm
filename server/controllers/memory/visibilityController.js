const Memory = require('../../models/Memory');

// Toggle public/private on a memory (owner only)
exports.toggleVisibility = async (req, res) => {
  // ✅ Extract ID from slug (supports both formats)
  const { extractIdFromSlug } = require('../../utils/slugify');
  const memoryId = extractIdFromSlug(req.params.id);

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