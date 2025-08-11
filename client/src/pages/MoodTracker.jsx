import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, format } from "date-fns";
import { getCalendarSummary, getMemoriesByDate, getMoodDistribution, getMoodTrend } from "../services/analyticsService";
import PageWrapper from "../components/PageWrapper";
import MemoryCard from "../components/MemoryCard";
import FilterBar from "../components/FilterBar";
import DistributionChart from "../components/DistributionChart";
import TrendChart from "../components/TrendChart";
import StatsBadges from "../components/StatsBadges";

export default function MoodTracker() {
  const [month, setMonth] = useState(new Date());
  const [summary, setSummary] = useState([]);           // [{date,count}]
  const [selectedEmotion, setSelectedEmotion] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayMemories, setDayMemories] = useState([]);
  const [distribution, setDistribution] = useState([]); // [{emotion,count}]
  const [trend, setTrend] = useState([]);               // [{date,emotion,count}]

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );

  useEffect(() => {
    (async () => {
      const [s, dist, t] = await Promise.all([
        getCalendarSummary(month),
        getMoodDistribution(month),
        getMoodTrend({ from: format(startOfMonth(month), "yyyy-MM-dd"), to: format(endOfMonth(month), "yyyy-MM-dd"), interval: "day" }),
      ]);
      setSummary(s);
      setDistribution(dist);
      setTrend(t);
      setSelectedDate(null);
      setDayMemories([]);
    })();
  }, [month]);

  const countFor = (d) => {
    const hit = summary.find(x => isSameDay(new Date(x.date), d));
    return hit?.count || 0;
  };

  const openDay = async (d) => {
    setSelectedDate(d);
    const list = await getMemoriesByDate(d);
    setDayMemories(
      selectedEmotion === "All"
        ? list
        : list.filter(m => m.emotion?.toLowerCase().includes(selectedEmotion.toLowerCase()))
    );
  };

  const streak = useMemo(() => {
    let max = 0, cur = 0;
    days.forEach(d => { if (countFor(d) > 0) { cur++; max = Math.max(max, cur); } else { cur = 0; } });
    return max;
  }, [days, summary]);

  const totalThisMonth = useMemo(
    () => distribution.reduce((sum, d) => sum + (d.count || 0), 0),
    [distribution]
  );
  const topEmotion = useMemo(() => {
    if (!distribution.length) return "—";
    const top = [...distribution].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
    return top?.emotion || "—";
  }, [distribution]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-purple-700">📊 Mood Tracker</h1>
        <DatePicker
          selected={month}
          onChange={setMonth}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          className="border rounded p-2"
        />
      </div>

      {/* Badges */}
      <div className="mb-4">
        <StatsBadges total={totalThisMonth} activeDays={summary.filter(d => d.count > 0).length} topEmotion={topEmotion} />
      </div>

      <FilterBar
        emotions={[{ label: "All", emoji: "🌀" }, ...distribution.map(d => ({ label: d.emotion || "—", emoji: "" }))]}
        selectedEmotion={selectedEmotion}
        onFilter={(label) => setSelectedEmotion(label)}
        showMonthPicker={false}
      />

      <div className="grid grid-cols-7 gap-2 mt-2">
        {days.map((d) => (
          <button
            key={d.toISOString()}
            onClick={() => openDay(d)}
            className={`p-2 rounded border text-sm text-left hover:bg-purple-50 ${
              isSameDay(selectedDate || new Date(0), d) ? "bg-purple-100 border-purple-400" : "bg-white"
            }`}
            title={`${format(d, "MMM d")} • ${countFor(d)} memories`}
          >
            <div className="font-semibold">{format(d, "d")}</div>
            <div className="text-xs text-gray-600">{countFor(d)} mem</div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Distribution</h2>
        <DistributionChart
          data={distribution}
          selected={selectedEmotion !== "All" ? selectedEmotion : ""}
          onSelect={(label) => setSelectedEmotion(label === selectedEmotion ? "All" : label)}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Trend</h2>
        <TrendChart data={trend} selected={selectedEmotion} />
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-purple-700 mb-2">
            {format(selectedDate, "MMM d, yyyy")} – Memories {selectedEmotion !== "All" ? `(${selectedEmotion})` : ""}
          </h2>
          {dayMemories.length === 0 ? (
            <p className="text-gray-500 text-sm">No memories on this day.</p>
          ) : (
            <ul className="space-y-4 mt-2">
              {dayMemories.map((m) => (
                <MemoryCard key={m._id} memory={m} />
              ))}
            </ul>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
