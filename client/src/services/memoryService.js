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
