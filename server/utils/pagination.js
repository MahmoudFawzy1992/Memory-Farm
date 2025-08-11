// Encode/decode cursor as base64(JSON)
const encodeCursor = (doc) => {
  if (!doc) return null;
  const payload = { d: (doc.memoryDate || doc.createdAt)?.toISOString(), id: String(doc._id) };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const decodeCursor = (s) => {
  try {
    if (!s) return null;
    const { d, id } = JSON.parse(Buffer.from(s, 'base64').toString('utf8'));
    return { date: new Date(d), id };
  } catch {
    return null;
  }
};

// Common sort: newest first by date then _id
const sortStage = { memoryDate: -1, createdAt: -1, _id: -1 };

module.exports = { encodeCursor, decodeCursor, sortStage };
