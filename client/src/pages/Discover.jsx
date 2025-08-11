import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosInstance";
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
      return m.emotion?.toLowerCase().includes(selectedEmotion.toLowerCase());
    });
  }, [pageItems, month, selectedEmotion]);

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold text-purple-700 mb-4">🌍 Discover</h1>

      {/* Month selector */}
      <div className="mb-4">
        <DatePicker
          selected={month}
          onChange={setMonth}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          className="border rounded p-2"
        />
      </div>

      {/* Global mood distribution (click a bar to filter) */}
      <div className="mb-4">
        <DistributionChart
          data={distribution}
          selected={selectedEmotion !== "All" ? selectedEmotion : ""}
          onSelect={(label) =>
            setSelectedEmotion((prev) => (prev === label ? "All" : label))
          }
        />
      </div>

      {/* Trend sparkline (sum or selected emotion) */}
      <div className="mb-6">
        <TrendChart data={trend} selected={selectedEmotion} />
      </div>

      {/* Emotion chips (derived from distribution to stay in sync with chart) */}
      <div className="flex gap-2 flex-wrap justify-center mt-2">
        <button
          onClick={() => setSelectedEmotion("All")}
          className={`px-3 py-1 rounded-full border text-sm ${
            selectedEmotion === "All"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700"
          } hover:bg-purple-100 transition`}
        >
          🌀 All
        </button>
        {distribution.map((d) => {
          const label = d.emotion || "—";
          return (
            <button
              key={label}
              onClick={() =>
                setSelectedEmotion((prev) => (prev === label ? "All" : label))
              }
              className={`px-3 py-1 rounded-full border text-sm ${
                selectedEmotion === label
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700"
              } hover:bg-purple-100 transition`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Public list (paginated + filtered to selected month/emotion) */}
      {error && (
        <p className="text-sm text-red-600 mt-4">Failed to load public feed.</p>
      )}

      {filtered.length === 0 && !loading ? (
        <p className="text-gray-500 mt-6 text-center">
          No public memories found for this month.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((m) => (
            <li
              key={m._id}
              className={`p-4 bg-white rounded-lg shadow border-t-4 border-${
                m.color || "purple-500"
              }`}
            >
              <Link to={`/memory/${m._id}`}>
                <p className="text-lg font-medium text-gray-700 line-clamp-3">
                  {m.text}
                </p>
                <p className="text-sm mt-1 italic text-gray-500">{m.emotion}</p>
              </Link>

              {m.userId && (
                <div className="mt-2 text-sm text-purple-600">
                  by{" "}
                  <Link
                    to={`/user/${m.userId._id}`}
                    className="font-semibold hover:underline"
                  >
                    {m.userId.displayName}
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Load more + sentinel */}
      <div className="flex justify-center my-6">
        {hasMore ? (
          <>
            <button
              onClick={loadMore}
              className="px-4 py-2 text-sm rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
            <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
          </>
        ) : (
          <span className="text-xs text-gray-400">No more results</span>
        )}
      </div>
    </PageWrapper>
  );
}
