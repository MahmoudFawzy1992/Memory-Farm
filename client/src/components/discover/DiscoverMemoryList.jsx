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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              🌈 Community Memories
              {selectedEmotion !== "All" && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">
                  {selectedEmotion}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Discover meaningful moments shared by our community
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{filteredMemories.length}</div>
            <div className="text-xs text-gray-500">memories found</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 font-medium">Failed to load public feed</p>
            </div>
            <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
          </div>
        )}

        {filteredMemories.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No memories found</h4>
            <p className="text-gray-500 text-lg mb-4">
              {selectedEmotion !== "All" 
                ? `No ${selectedEmotion.toLowerCase()} memories for this month`
                : "No public memories found for this month"
              }
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Try selecting a different month or emotion filter</p>
              <p>Or be the first to share a public memory! 🚀</p>
            </div>
          </div>
        ) : (
          <>
            {/* FIXED: Max 2 columns, not 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMemories.map((memory) => (
                <div key={memory._id} className="h-fit">
                  <MemoryCard 
                    memory={memory} 
                    showReport={true}
                    hideOwnerControls={true}
                    truncateLength={20}
                  />
                </div>
              ))}
            </div>

            {/* Load More Section */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
              {hasMore ? (
                <>
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading more memories...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>🔍</span>
                        Discover More Memories
                      </span>
                    )}
                  </button>
                  <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
                </>
              ) : (
                filteredMemories.length > 0 && (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">🎉 You've seen all memories!</p>
                    <p className="text-gray-500 text-xs">Come back later for new community content</p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}