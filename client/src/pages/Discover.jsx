import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import DatePicker from "react-datepicker";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  getPublicDistribution,
  getPublicTrend,
} from "../services/analyticsService";
import DistributionChart from "../components/DistributionChart";
import TrendChart from "../components/TrendChart";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { emotions } from "../constants/emotions";

export default function Discover() {
  // Month selection for charts + list filter
  const [month, setMonth] = useState(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState("All");

  // Public list (paginated)
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

  // Charts
  const [distribution, setDistribution] = useState([]); // [{emotion,count}]
  const [trend, setTrend] = useState([]); // [{date,emotion,count}]

  useEffect(() => {
    (async () => {
      try {
        const [dist, t] = await Promise.all([
          getPublicDistribution(month),
          getPublicTrend(month, "day"),
        ]);
        setDistribution(dist);
        setTrend(t);
      } catch (err) {
        console.error("Failed to fetch public analytics:", err);
      }
    })();
  }, [month]);

  // Group distribution data by emotion label (removing emoji prefixes)
  const groupedDistribution = useMemo(() => {
    const grouped = {};
    
    distribution.forEach(item => {
      // Extract label from emotion (remove emoji prefix)
      const label = (item.emotion || "").replace(/^\p{Emoji}+/u, "").trim() || "Unknown";
      
      if (grouped[label]) {
        grouped[label] += item.count || 0;
      } else {
        grouped[label] = item.count || 0;
      }
    });

    // Convert to array format and match with predefined emotions
    return emotions.slice(1).map(emotion => ({
      emotion: emotion.label,
      emoji: emotion.emoji,
      count: grouped[emotion.label] || 0
    })).filter(item => item.count > 0);
  }, [distribution]);

  // Client-side filter on the currently loaded page for the visible list
  const filtered = useMemo(() => {
    const range = { start: startOfMonth(month), end: endOfMonth(month) };
    return pageItems.filter((m) => {
      const when = m.memoryDate
        ? new Date(m.memoryDate)
        : m.createdAt
        ? new Date(m.createdAt)
        : null;
      if (!when || !isWithinInterval(when, range)) return false;
      if (selectedEmotion === "All") return true;
      
      // Extract emotion label (remove emoji prefix) for comparison
      const emotionLabel = (m.emotion || "").replace(/^\p{Emoji}+/u, "").trim();
      return emotionLabel.toLowerCase() === selectedEmotion.toLowerCase();
    });
  }, [pageItems, month, selectedEmotion]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-purple-700 mb-2">🌍 Discover</h1>
                <p className="text-gray-600">Explore public memories from the community</p>
              </div>
              
              {/* Month selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter by month:</span>
                <DatePicker
                  selected={month}
                  onChange={setMonth}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 Mood Distribution
                <span className="text-sm font-normal text-gray-500">
                  ({groupedDistribution.reduce((sum, item) => sum + item.count, 0)} memories)
                </span>
              </h2>
              <DistributionChart
                data={groupedDistribution}
                selected={selectedEmotion !== "All" ? selectedEmotion : ""}
                onSelect={(label) =>
                  setSelectedEmotion((prev) => (prev === label ? "All" : label))
                }
              />
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📈 Trend Over Time
                {selectedEmotion !== "All" && (
                  <span className="text-sm font-normal text-purple-600">
                    ({selectedEmotion})
                  </span>
                )}
              </h2>
              <TrendChart data={trend} selected={selectedEmotion} />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Filter by Emotion</h3>
            <div className="flex gap-2 flex-wrap">
              {emotions.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => setSelectedEmotion(label)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                    selectedEmotion === label
                      ? "bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Community Memories
                {selectedEmotion !== "All" && (
                  <span className="text-purple-600 ml-2">• {selectedEmotion}</span>
                )}
              </h3>
              <span className="text-sm text-gray-500">
                {filtered.length} memories found
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">Failed to load public feed.</p>
              </div>
            )}

            {filtered.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">
                  No public memories found for this month.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try selecting a different month or emotion filter.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((memory) => (
                    <div
                      key={memory._id}
                      className={`bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border-l-4 border-${
                        memory.color || "purple-500"
                      } p-4 hover:shadow-md transition-shadow duration-200`}
                    >
                      <Link to={`/memory/${memory._id}`} className="block">
                        <p className="text-gray-700 font-medium line-clamp-3 mb-2">
                          {memory.text}
                        </p>
                        <p className={`text-sm italic text-${memory.color || "purple-500"} mb-2`}>
                          {memory.emotion}
                        </p>
                      </Link>

                      {memory.userId && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <img
                            src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${memory.userId.displayName}`}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full"
                          />
                          <Link
                            to={`/user/${memory.userId._id}`}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            {memory.userId.displayName}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load more + sentinel */}
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
                      {filtered.length > 0 ? "No more memories to load" : ""}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}