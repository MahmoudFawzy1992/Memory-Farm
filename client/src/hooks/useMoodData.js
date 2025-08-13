import { useState, useEffect } from "react";
import { 
  getCalendarSummary, 
  getMoodDistribution, 
  getPublicTrend,
  getMemoriesByDate 
} from "../services/analyticsService";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

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
        const summaryData = await getCalendarSummary(month);
        
        const distData = await getMoodDistribution(month);
        
        const globalData = await getPublicTrend(month, "day");
        
        const monthMems = await getMemoriesForMonth(month);

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

  const getMemoriesForMonth = async (monthDate) => {
    try {
      const days = eachDayOfInterval({ 
        start: startOfMonth(monthDate), 
        end: endOfMonth(monthDate) 
      });
      
      const allMemories = [];
      for (const day of days) {
        try {
          const dayMems = await getMemoriesByDate(day);
          allMemories.push(...dayMems);
        } catch (dayError) {
          console.warn(`Failed to get memories for ${day}:`, dayError);
        }
      }
      
      return allMemories.sort((a, b) => {
        const dateA = new Date(a.memoryDate || a.createdAt);
        const dateB = new Date(b.memoryDate || b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Failed to get month memories:", error);
      return [];
    }
  };

  return {
    summary,
    distribution,
    globalTrend,
    monthMemories,
    loading,
    error
  };
};