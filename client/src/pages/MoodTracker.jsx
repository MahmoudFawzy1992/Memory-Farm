import { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from "date-fns";

import PageWrapper from "../components/PageWrapper";
import FilterBar from "../components/FilterBar";
import DistributionChart from "../components/DistributionChart";
import { FilterProvider } from "../context/FilterContext";
import { useFilteredMemories } from "../hooks/useFilteredMemories";
import { useFilters } from "../hooks/useFilters";

// Custom hooks
import { useMoodData } from "../hooks/useMoodData";
import { useDayMemories } from "../hooks/useDayMemories";

// Split components
import MoodStats from "../components/mood-tracker/MoodStats";
import MoodCalendar from "../components/mood-tracker/MoodCalendar";
import GlobalTrendChart from "../components/mood-tracker/GlobalTrendChart";
import MemoriesView from "../components/mood-tracker/MemoriesView";
import MemoryCard from "../components/MemoryCard";

// Utils
import { groupDistributionByEmotion } from "../utils/moodCalculations";

/**
 * MoodTracker content with enhanced filtering
 * Separated from provider wrapper for proper hook usage
 */
function MoodTrackerContent() {
  const [month, setMonth] = useState(new Date());

  // Get filter state - MoodTracker has special date handling
  const { filters, setDateRange, clearDateRange } = useFilters('moodTracker');
  
  // Custom hooks for data management
  const { summary, distribution, globalTrend, monthMemories, loading, error } = useMoodData(month);
  const { selectedDate, dayMemories, selectDay, clearSelection } = useDayMemories();

  // Determine which memories to filter based on selection
  const memoriesToFilter = selectedDate ? dayMemories : monthMemories;
  
  // Apply enhanced filters to memories
  const { 
    filteredMemories, 
    stats,
    emotionGroups,
    intensityGroups,
    hasResults,
    isEmpty: noFilteredResults,
    isFiltered 
  } = useFilteredMemories(memoriesToFilter, filters, { 
    sortBy: 'date', 
    sortOrder: 'desc' 
  });

  // Computed values
  const days = useMemo(() => 
    eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }), 
    [month]
  );

  const groupedDistribution = useMemo(() => 
    groupDistributionByEmotion(distribution), 
    [distribution]
  );

  // Sync month changes with date filter for analytics
  useEffect(() => {
    // For MoodTracker, when month changes, update date filter to match
    // This ensures analytics and filtering are in sync
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    setDateRange({ startDate, endDate });
  }, [month, setDateRange]);

  // Event handlers
  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    clearSelection();
  };

  // Handle filter emotion selection (legacy compatibility)
  const handleEmotionFilter = (emotion) => {
    // This could be enhanced to work with new filter system
    console.log('Legacy emotion filter:', emotion);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your mood data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">Failed to load mood data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header with proper spacing for navbar */}
      <div className="bg-white shadow-sm border-b border-purple-100 sticky z-10" style={{ top: '64px' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-purple-700 mb-2 flex items-center gap-2">
                📊 Mood Tracker
                {selectedDate && (
                  <span className="text-lg bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    {format(selectedDate, "MMM d")}
                  </span>
                )}
                {isFiltered && !selectedDate && (
                  <span className="text-lg bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredMemories.length} filtered
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Track your emotional journey and patterns
                {isFiltered && (
                  <span className="block text-sm text-purple-600 mt-1">
                    Showing {stats.filtered} of {stats.total} memories ({stats.percentage}% visible)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Month:</span>
              <DatePicker
                selected={month}
                onChange={handleMonthChange}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content with better spacing */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <MoodStats distribution={distribution} summary={summary} month={month} />

        {/* Enhanced Filter System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Filter Your Memories</h2>
            <p className="text-gray-600 text-sm">
              Use advanced filters to analyze your emotional patterns
            </p>
          </div>
          
          <FilterBar 
            variant="full"
            showSections={true}
            defaultExpanded={['emotions']}
          />
        </div>

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
                    ({stats.hidden} hidden by filters)
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                Filtering affects the memory view below
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Mood Calendar - {format(month, "MMMM yyyy")}
            </h2>
            {selectedDate && (
              <button
                onClick={clearSelection}
                className="text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
              >
                ← Back to month view
              </button>
            )}
          </div>
          <MoodCalendar 
            days={days}
            summary={summary}
            selectedDate={selectedDate}
            onDayClick={selectDay}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Personal Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Personal Distribution
            </h2>
            <DistributionChart
              data={groupedDistribution}
              selected=""
              onSelect={(label) => console.log('Chart emotion selected:', label)}
            />
          </div>

          {/* Global Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Community Trends
            </h2>
            <GlobalTrendChart data={globalTrend} />
          </div>
        </div>

        {/* Enhanced Memories Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedDate 
                ? `Memories for ${format(selectedDate, "MMMM d, yyyy")}`
                : `Your Memories - ${format(month, "MMMM yyyy")}`
              }
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {filteredMemories.length} {filteredMemories.length === 1 ? "memory" : "memories"}
                {isFiltered && (
                  <span className="text-purple-600"> (filtered)</span>
                )}
              </span>
              {selectedDate && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  ← Back to month
                </button>
              )}
            </div>
          </div>

          {!hasResults && stats.total === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {selectedDate ? "📝" : "📊"}
              </div>
              <p className="text-gray-500 text-lg">
                {selectedDate 
                  ? "No memories on this day."
                  : "No memories for this month yet."
                }
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Start journaling to see your mood patterns!
              </p>
            </div>
          ) : noFilteredResults ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg mb-2">No memories match your filters.</p>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your filters to see more results.
              </p>
              <div className="max-w-md mx-auto">
                <FilterBar variant="chips-only" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMemories.map((memory) => (
                <MemoryCard key={memory._id} memory={memory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main MoodTracker component wrapped with FilterProvider
 * Uses 'moodTracker' page type with current month default
 */
export default function MoodTracker() {
  return (
    <PageWrapper>
      <FilterProvider pageType="moodTracker">
        <MoodTrackerContent />
      </FilterProvider>
    </PageWrapper>
  );
}