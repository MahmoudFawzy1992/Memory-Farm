import axios from "../utils/axiosInstance";
import { format, startOfMonth, endOfMonth } from "date-fns";

const monthRange = (d) => ({
  from: format(startOfMonth(d), "yyyy-MM-dd"),
  to: format(endOfMonth(d), "yyyy-MM-dd"),
});

// User-scoped
export const getCalendarSummary = async (monthDate) => {
  const { from, to } = monthRange(monthDate);
  const { data } = await axios.get("/memory/calendar/summary", { params: { from, to } });
  return data.days || [];
};

export const getMemoriesByDate = async (dateObj) => {
  const date = format(dateObj, "yyyy-MM-dd");
  const { data } = await axios.get("/memory/calendar/by-date", { params: { date } });
  return data.memories || [];
};

export const getMoodDistribution = async (monthDate) => {
  const { from, to } = monthRange(monthDate);
  const { data } = await axios.get("/memory/analytics/mood-distribution", { params: { from, to } });
  return data.distribution || [];
};

export const getMoodTrend = async ({ from, to, interval = "day" }) => {
  const { data } = await axios.get("/memory/analytics/mood-trend", { params: { from, to, interval } });
  return data.trend || [];
};

// Public (global)
export const getPublicDistribution = async (monthDate) => {
  const { from, to } = monthRange(monthDate);
  const { data } = await axios.get("/memory/analytics/public/distribution", { params: { from, to } });
  return data.distribution || [];
};

export const getPublicTrend = async (monthDate, interval = "day") => {
  const { from, to } = monthRange(monthDate);
  const { data } = await axios.get("/memory/analytics/public/trend", { params: { from, to, interval } });
  return data.trend || [];
};
