import { useMemo } from "react";
import MemoryCard from "./MemoryCard";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

/**
 * Props:
 * - userId (required): whose public memories to show
 */
export default function UserMemoryGrid({ userId }) {
  const buildUrl = useMemo(() => {
    // Safety check for userId
    if (!userId) {
      console.warn('UserMemoryGrid: userId is undefined');
      return () => null;
    }
    
    return (cursor) =>
      `/user/${userId}/memories${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
  }, [userId]);

  const { items, hasMore, loading, error, loadMore } = usePaginatedFetcher(buildUrl, {
    pageSize: 12,
    autoload: !!userId, // Only autoload if userId exists
  });

  const sentinelRef = useInfiniteScroll(loadMore, { disabled: !hasMore || loading });

  // Early return if no userId
  if (!userId) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">🌈 Public Memories</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">⚠️ Unable to load memories: User ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-4">🌈 Public Memories</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">
            Failed to load memories. {error.response?.status === 404 ? 'User not found.' : 'Please try again later.'}
          </p>
        </div>
      )}

      {items.length === 0 && !loading && !error ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-500 italic">No public memories to show.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items
              .filter(memory => memory && memory._id) // Filter out any null/undefined memories
              .map((memory) => (
                <MemoryCard key={memory._id} memory={memory} />
              ))}
          </div>

          {/* Load-more / sentinel */}
          <div className="flex justify-center my-4">
            {hasMore ? (
              <>
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm rounded bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    "Load more"
                  )}
                </button>
                {/* Invisible sentinel for auto-load on scroll */}
                <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
              </>
            ) : (
              items.length > 0 && (
                <span className="text-xs text-gray-400">No more results</span>
              )
            )}
          </div>
        </>
      )}
    </>
  );
}