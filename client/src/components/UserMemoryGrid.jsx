import { useMemo } from "react";
import MemoryCard from "./MemoryCard";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

/**
 * Props:
 * - userId (required): whose public memories to show
 */
export default function UserMemoryGrid({ userId }) {
  const buildUrl = useMemo(
    () => (cursor) =>
      `/user/${userId}/memories${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    [userId]
  );

  const { items, hasMore, loading, error, loadMore } = usePaginatedFetcher(buildUrl, {
    pageSize: 12,
  });

  const sentinelRef = useInfiniteScroll(loadMore, { disabled: !hasMore || loading });

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-4">🌈 Public Memories</h2>

      {error && (
        <p className="text-sm text-red-600 mb-2">Failed to load memories.</p>
      )}

      {items.length === 0 && !loading ? (
        <p className="text-gray-500 italic">No public memories to show.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((m) => (
              <MemoryCard key={m._id} memory={m} />
            ))}
          </div>

          {/* Load-more / sentinel */}
          <div className="flex justify-center my-4">
            {hasMore ? (
              <>
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
                {/* Invisible sentinel for auto-load on scroll */}
                <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
              </>
            ) : (
              <span className="text-xs text-gray-400">No more results</span>
            )}
          </div>
        </>
      )}
    </>
  );
}
