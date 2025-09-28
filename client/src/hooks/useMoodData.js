import { useState, useEffect } from "react";
import { 
  getCalendarSummary, 
  getMoodDistribution, 
  getPublicTrend,
  getMemoriesForDateRange // NEW: Single request for all month memories
} from "../services/analyticsService";

export const useMoodData = (month) => {
  const [summary, setSummary] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [globalTrend, setGlobalTrend] = useState([]);
  const [monthMemories, setMonthMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // All these requests run in parallel
        const [summaryData, distData, globalData, monthMems] = await Promise.all([
          getCalendarSummary(month),
          getMoodDistribution(month),
          getPublicTrend(month, "day"),
          getMemoriesForDateRange(month) // NEW: Single request for all memories
        ]);

        setSummary(summaryData);
        setDistribution(distData);
        setGlobalTrend(globalData);
        setMonthMemories(monthMems);
        
      } catch (err) {
        console.error("❌ Failed to load mood data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [month]);

  return {
    summary,
    distribution,
    globalTrend,
    monthMemories,
    loading,
    error
  };
};