import { useEffect, useMemo, useState } from "react";
import {
  getPublicDistribution,
  getPublicTrend,
} from "../services/analyticsService";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import PageWrapper from "../components/PageWrapper";
import DiscoverCharts from "../components/discover/DiscoverCharts";
import DiscoverMemoryList from "../components/discover/DiscoverMemoryList";
import FilterBar from "../components/FilterBar";
import { FilterProvider } from "../context/FilterContext";
import { useFilteredMemories } from "../hooks/useFilteredMemories";
import { useFilters } from "../hooks/useFilters";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Discover page content with enhanced filtering
 * Separated from provider wrapper for proper hook usage
 */
function DiscoverContent() {
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);

  // Get filter state
  const { filters } = useFilters('discover');
  
  // Determine analytics date range from filters or use current month as fallback
  const analyticsMonth = useMemo(() => {
    if (filters.dateRange.startDate) {
      return new Date(filters.dateRange.startDate);
    }
    return new Date(); // Current month fallback
  }, [filters.dateRange]);

  // Paginated public memories
  const buildUrl = useMemo(
    () => (cursor) =>
      `/memory/public/paginated${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    []
  );
  
  const {
    items: pageItems,
    hasMore,
    loading,
    error,
    loadMore,
  } = usePaginatedFetcher(buildUrl, { pageSize: 12 });

  const sentinelRef = useInfiniteScroll(loadMore, {
    disabled: !hasMore || loading,
  });

  // Apply filters to memories with date range consideration
  const { 
    filteredMemories, 
    stats, 
    hasResults, 
    isEmpty: noFilteredResults,
    isFiltered 
  } = useFilteredMemories(pageItems, filters, { 
    sortBy: 'date', 
    sortOrder: 'desc' 
  });

  // Load analytics data based on current filters or fallback month
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dist, t] = await Promise.all([
          getPublicDistribution(analyticsMonth),
          getPublicTrend(analyticsMonth, "day"),
        ]);
        setDistribution(dist);
        setTrend(t);
      } catch (err) {
        console.error("Failed to fetch public analytics:", err);
      }
    };
    loadAnalytics();
  }, [analyticsMonth]);

  // Legacy emotion selection handler for charts
  const handleEmotionSelect = (label) => {
    // This could be enhanced to integrate with new filter system
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header with proper spacing for navbar */}
      <div className="bg-white shadow-sm border-b border-purple-100 sticky z-10" style={{ top: '64px' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-purple-700 mb-2 flex items-center gap-2">
                🌍 Discover
                {isFiltered && (
                  <span className="text-lg bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm font-medium">
                    {filteredMemories.length} filtered
                  </span>
                )}
                {!isFiltered && (
                  <span className="text-lg bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm font-medium">
                    {filteredMemories.length}
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Explore public memories from the community
                {isFiltered && (
                  <span className="block text-sm text-purple-600 mt-1">
                    Showing {stats.filtered} of {stats.total} memories ({stats.percentage}% visible)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content with better spacing and layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Filter System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Filter Community Memories</h2>
            <p className="text-gray-600 text-sm">
              Use advanced filters to explore memories by emotion, intensity, and time period
            </p>
          </div>
          
          <FilterBar 
            variant="full"
            showSections={true}
            defaultExpanded={['emotions']}
          />
        </div>

        {/* Charts Section */}
        <DiscoverCharts
          distribution={distribution}
          trend={trend}
          selectedEmotion="All" // Could be enhanced to integrate with new filters
          onEmotionSelect={handleEmotionSelect}
          month={analyticsMonth}
        />

        {/* Filter Results Summary */}
        {isFiltered && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong className="text-purple-600">{stats.filtered}</strong> memories match your filters
                </span>
                {stats.hidden > 0 && (
                  <span className="text-sm text-gray-500">
                    ({stats.hidden} hidden)
                  </span>
                )}
              </div>
              
              {stats.percentage < 100 && (
                <div className="text-sm text-gray-500">
                  {stats.percentage}% of community memories visible
                </div>
              )}
            </div>
          </div>
        )}

        {/* Memory List with Enhanced States */}
        {!hasResults && stats.total === 0 ? (
          /* No memories loaded yet */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Community Memories</h3>
            <p className="text-gray-500">Discovering amazing memories from our community...</p>
          </div>
        ) : noFilteredResults ? (
          /* No results after filtering */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Memories Match Your Filters</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters to discover more community memories
            </p>
            <div className="max-w-md mx-auto">
              <FilterBar variant="chips-only" />
            </div>
          </div>
        ) : (
          /* Display filtered memories */
          <DiscoverMemoryList
            filteredMemories={filteredMemories}
            selectedEmotion="All" // Legacy prop
            loading={loading}
            error={error}
            hasMore={hasMore}
            loadMore={loadMore}
            sentinelRef={sentinelRef}
            stats={stats}
            isFiltered={isFiltered}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Main Discover component wrapped with FilterProvider
 * Uses 'discover' page type with default "show all" behavior
 */
export default function Discover() {
  return (
    <PageWrapper>
      <FilterProvider pageType="discover">
        <DiscoverContent />
      </FilterProvider>
    </PageWrapper>
  );
}