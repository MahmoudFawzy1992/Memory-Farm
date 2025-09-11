import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  getPublicDistribution,
  getPublicTrend,
} from "../services/analyticsService";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { emotions } from "../constants/emotions";
import PageWrapper from "../components/PageWrapper";
import DiscoverCharts from "../components/discover/DiscoverCharts";
import DiscoverMemoryList from "../components/discover/DiscoverMemoryList";

export default function Discover() {
  const [month, setMonth] = useState(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState("All");
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);

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

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
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
    };
    loadAnalytics();
  }, [month]);

  // Filter memories by month and emotion
  const filteredMemories = useMemo(() => {
    const range = { start: startOfMonth(month), end: endOfMonth(month) };
    return pageItems.filter((m) => {
      const when = m.memoryDate
        ? new Date(m.memoryDate)
        : m.createdAt
        ? new Date(m.createdAt)
        : null;
      if (!when || !isWithinInterval(when, range)) return false;
      if (selectedEmotion === "All") return true;
      
      const emotionLabel = (m.emotion || "").replace(/^\p{Emoji}+/u, "").trim();
      return emotionLabel.toLowerCase() === selectedEmotion.toLowerCase();
    });
  }, [pageItems, month, selectedEmotion]);

  const handleEmotionSelect = (label) => {
    setSelectedEmotion(prev => prev === label ? "All" : label);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* FIXED: Header with proper top spacing for navbar overlap */}
        <div className="bg-white shadow-sm border-b border-purple-100 sticky z-10" style={{ top: '64px' }}>
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-purple-700 mb-2 flex items-center gap-2">
                  🌍 Discover
                  <span className="text-lg bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm font-medium">
                    {filteredMemories.length}
                  </span>
                </h1>
                <p className="text-gray-600">Explore public memories from the community</p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by month:</span>
                <DatePicker
                  selected={month}
                  onChange={setMonth}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* IMPROVED: Content with better spacing and layout */}
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Charts Section */}
          <DiscoverCharts
            distribution={distribution}
            trend={trend}
            selectedEmotion={selectedEmotion}
            onEmotionSelect={handleEmotionSelect}
            month={month}
          />

          {/* IMPROVED: Emotion Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter by Emotion</h3>
              <div className="text-sm text-gray-500">
                {selectedEmotion !== "All" && (
                  <button
                    onClick={() => setSelectedEmotion("All")}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3">
              {emotions.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => setSelectedEmotion(label)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedEmotion === label
                      ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <div className="text-lg mb-1">{emoji}</div>
                  <div className="text-xs leading-tight">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* IMPROVED: Memory List */}
          <DiscoverMemoryList
            filteredMemories={filteredMemories}
            selectedEmotion={selectedEmotion}
            loading={loading}
            error={error}
            hasMore={hasMore}
            loadMore={loadMore}
            sentinelRef={sentinelRef}
          />
        </div>
      </div>
    </PageWrapper>
  );
}