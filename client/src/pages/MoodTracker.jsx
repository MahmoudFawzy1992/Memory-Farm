import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from "date-fns";

import PageWrapper from "../components/PageWrapper";
import FilterBar from "../components/FilterBar";
import DistributionChart from "../components/DistributionChart";
import { emotions } from "../constants/emotions";

// Custom hooks
import { useMoodData } from "../hooks/useMoodData";
import { useDayMemories } from "../hooks/useDayMemories";

// Split components
import MoodStats from "../components/mood-tracker/MoodStats";
import MoodCalendar from "../components/mood-tracker/MoodCalendar";
import GlobalTrendChart from "../components/mood-tracker/GlobalTrendChart";
import MemoriesView from "../components/mood-tracker/MemoriesView";

// Utils
import { groupDistributionByEmotion, filterMemoriesByEmotion } from "../utils/moodCalculations";

export default function MoodTracker() {
  const [month, setMonth] = useState(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState("All");

  // Custom hooks for data management
  const { summary, distribution, globalTrend, monthMemories, loading, error } = useMoodData(month);
  const { selectedDate, dayMemories, selectDay, clearSelection } = useDayMemories();

  // Computed values
  const days = useMemo(() => 
    eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }), 
    [month]
  );

  const groupedDistribution = useMemo(() => 
    groupDistributionByEmotion(distribution), 
    [distribution]
  );

  const filteredMemories = useMemo(() => {
    const memories = selectedDate ? dayMemories : monthMemories;
    return filterMemoriesByEmotion(memories, selectedEmotion);
  }, [dayMemories, monthMemories, selectedDate, selectedEmotion]);

  // Event handlers
  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    clearSelection();
  };

  const handleEmotionFilter = (emotion) => {
    setSelectedEmotion(emotion);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading your mood data...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium">Failed to load mood data</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-purple-700 mb-2">📊 Mood Tracker</h1>
                <p className="text-gray-600">Track your emotional journey and patterns</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Month:</span>
                <DatePicker
                  selected={month}
                  onChange={handleMonthChange}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <MoodStats distribution={distribution} summary={summary} month={month} />

          <div className="bg-white rounded-xl shadow-sm p-4">
            <FilterBar
              emotions={emotions.map(e => ({ label: e.label, emoji: e.emoji }))}
              selectedEmotion={selectedEmotion}
              onFilter={handleEmotionFilter}
              showMonthPicker={false}
            />
          </div>

          <MoodCalendar 
            days={days}
            summary={summary}
            selectedDate={selectedDate}
            onDayClick={selectDay}
          />

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Personal Distribution ({format(month, "MMMM yyyy")})
            </h2>
            <DistributionChart
              data={groupedDistribution}
              selected={selectedEmotion !== "All" ? selectedEmotion : ""}
              onSelect={(label) => setSelectedEmotion(label === selectedEmotion ? "All" : label)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Global Emotion Trends (Community patterns)
            </h2>
            <GlobalTrendChart data={globalTrend} />
          </div>

          <MemoriesView 
            filteredMemories={filteredMemories}
            selectedDate={selectedDate}
            month={month}
            selectedEmotion={selectedEmotion}
            onBackToMonth={clearSelection}
          />
        </div>
      </div>
    </PageWrapper>
  );
}