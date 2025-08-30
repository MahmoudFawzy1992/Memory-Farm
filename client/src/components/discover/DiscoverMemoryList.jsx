import MemoryCard from "../MemoryCard";

export default function DiscoverMemoryList({ 
  filteredMemories, 
  selectedEmotion, 
  loading, 
  error, 
  hasMore, 
  loadMore, 
  sentinelRef 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Community Memories
          {selectedEmotion !== "All" && (
            <span className="text-purple-600 ml-2">• {selectedEmotion}</span>
          )}
        </h3>
        <span className="text-sm text-gray-500">
          {filteredMemories.length} memories found
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">Failed to load public feed.</p>
        </div>
      )}

      {filteredMemories.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">
            No public memories found for this month.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try selecting a different month or emotion filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((memory) => (
              <MemoryCard 
                key={memory._id} 
                memory={memory} 
                showReport={true}
                hideOwnerControls={true}
                truncateLength={20}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            {hasMore ? (
              <>
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    "Load More Memories"
                  )}
                </button>
                <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
              </>
            ) : (
              <p className="text-sm text-gray-400 py-4">
                {filteredMemories.length > 0 ? "No more memories to load" : ""}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}