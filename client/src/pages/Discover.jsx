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
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-purple-700 mb-2">🌍 Discover</h1>
                <p className="text-gray-600">Explore public memories from the community</p>
              </div>
              
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
          {/* Charts Section - Stacked Vertically */}
          <DiscoverCharts
            distribution={distribution}
            trend={trend}
            selectedEmotion={selectedEmotion}
            onEmotionSelect={handleEmotionSelect}
            month={month}
          />

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

          {/* Memory List */}
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