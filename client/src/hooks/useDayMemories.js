import { useState } from "react";
import { getMemoriesByDate } from "../services/analyticsService";

export const useDayMemories = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayMemories, setDayMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectDay = async (date) => {
    if (!date) {
      setSelectedDate(null);
      setDayMemories([]);
      return;
    }

    setSelectedDate(date);
    setLoading(true);
    
    try {
      console.log("📅 Loading memories for day:", date);
      const memories = await getMemoriesByDate(date);
      console.log("✅ Day memories loaded:", memories);
      setDayMemories(memories);
    } catch (error) {
      console.error("❌ Failed to load day memories:", error);
      setDayMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedDate(null);
    setDayMemories([]);
  };

  return {
    selectedDate,
    dayMemories,
    loading,
    selectDay,
    clearSelection
  };
};