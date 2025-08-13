import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosInstance";

/**
 * Generic cursor-based fetcher.
 * buildUrl: (cursor) => string
 */
export default function usePaginatedFetcher(buildUrl, { pageSize = 12, autoload = true } = {}) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const url = useMemo(() => {
    const base = buildUrl(cursor);
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}limit=${pageSize}`;
  }, [buildUrl, cursor, pageSize]);

  const load = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url);
      const next = res.data?.nextCursor ?? null;
      const chunk = res.data?.items ?? [];
      
      // ✅ FIX: Prevent duplicates when adding new items
      setItems((prev) => {
        const existingIds = new Set(prev.map(item => item._id));
        const newItems = chunk.filter(item => !existingIds.has(item._id));
        return prev.concat(newItems);
      });
      
      setCursor(next);
      setHasMore(Boolean(next));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [url, hasMore, loading]);

  useEffect(() => {
    if (autoload && items.length === 0 && !loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoload]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setLoading(false);
    setError(null);
  }, []);

  return { items, hasMore, loading, error, loadMore: load, reset };
}