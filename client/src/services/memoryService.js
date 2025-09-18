import axios from "../utils/axiosInstance";

export const getMyMemoriesPage = async ({ cursor = "", limit = 12 } = {}) => {
  const { data } = await axios.get("/memory/paginated", {
    params: { cursor, limit }
  });
  return data; // { items, nextCursor, hasMore }
};

export const getPublicMemoriesPage = async ({ cursor = "", limit = 12 } = {}) => {
  const { data } = await axios.get("/memory/public/paginated", {
    params: { cursor, limit }
  });
  return data; // { items, nextCursor, hasMore }
};

/**
 * Create a new memory with block content
 */
export const createMemory = async (memoryData) => {
  const { data } = await axios.post("/memory", memoryData);
  return data;
};

/**
 * Update an existing memory with block content
 */
export const updateMemory = async (memoryId, updateData) => {
  const { data } = await axios.put(`/memory/${memoryId}`, updateData);
  return data;
};

/**
 * Get a single memory by ID
 */
export const getMemoryById = async (memoryId) => {
  const { data } = await axios.get(`/memory/${memoryId}`);
  return data;
};

/**
 * Delete a memory
 */
export const deleteMemory = async (memoryId) => {
  const { data } = await axios.delete(`/memory/${memoryId}`);
  return data;
};

/**
 * Toggle memory visibility (public/private)
 */
export const toggleMemoryVisibility = async (memoryId) => {
  const { data } = await axios.patch(`/memory/${memoryId}/visibility`);
  return data;
};

/**
 * Search memories with filters
 */
export const searchMemories = async ({
  q,
  emotion,
  limit = 20
} = {}) => {
  const { data } = await axios.get("/memory/search/query", {
    params: { q, emotion, limit }
  });
  return data;
};

/**
 * Get calendar summary data
 */
export const getCalendarSummary = async ({ from, to } = {}) => {
  const { data } = await axios.get("/memory/calendar/summary", {
    params: { from, to }
  });
  return data;
};

/**
 * Get memories by specific date
 */
export const getMemoriesByDate = async (date) => {
  const { data } = await axios.get("/memory/calendar/by-date", {
    params: { date }
  });
  return data;
};

/**
 * Get mood distribution analytics
 */
export const getMoodDistribution = async ({
  from,
  to,
  groupBy = 'emotion'
} = {}) => {
  const { data } = await axios.get("/memory/analytics/mood-distribution", {
    params: { from, to, groupBy }
  });
  return data;
};

/**
 * Get mood trend analytics
 */
export const getMoodTrend = async ({
  from,
  to,
  interval = 'day',
  metric = 'count'
} = {}) => {
  const { data } = await axios.get("/memory/analytics/mood-trend", {
    params: { from, to, interval, metric }
  });
  return data;
};