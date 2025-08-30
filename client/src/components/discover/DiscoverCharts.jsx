import { useMemo } from "react";
import DistributionChart from "../DistributionChart";
import TrendChart from "../TrendChart";
import { emotions } from "../../constants/emotions";

export default function DiscoverCharts({ 
  distribution, 
  trend, 
  selectedEmotion, 
  onEmotionSelect, 
  month 
}) {
  const groupedDistribution = useMemo(() => {
    const grouped = {};
    
    distribution.forEach(item => {
      const label = (item.emotion || "").replace(/^\p{Emoji}+/u, "").trim() || "Unknown";
      grouped[label] = (grouped[label] || 0) + (item.count || 0);
    });

    return emotions.slice(1).map(emotion => ({
      emotion: emotion.label,
      emoji: emotion.emoji,
      count: grouped[emotion.label] || 0
    })).filter(item => item.count > 0);
  }, [distribution]);

  // Process trend data for total daily activity (not by emotion)
  const totalTrendData = useMemo(() => {
    const dailyTotals = {};
    
    trend.forEach(item => {
      const dateKey = new Date(item.date).toISOString().slice(0, 10);
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + (item.count || 0);
    });
    
    return Object.entries(dailyTotals)
      .map(([date, count]) => ({ date, emotion: "Community Activity", count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trend]);

  const totalMemories = groupedDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Mood Distribution
          <span className="text-sm font-normal text-gray-500">
            ({totalMemories} memories)
          </span>
        </h2>
        <DistributionChart
          data={groupedDistribution}
          selected={selectedEmotion !== "All" ? selectedEmotion : ""}
          onSelect={onEmotionSelect}
        />
      </div>

      {/* Community Activity Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Community Activity Over Time
          <span className="text-sm font-normal text-gray-500">
            (Total daily memories)
          </span>
        </h2>
        <TrendChart data={totalTrendData} selected="All" />
      </div>
    </div>
  );
}