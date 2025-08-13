import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { getEmotionColor } from "../utils/emotionColors";

// Accepts raw trend rows: [{ date, emotion, count }]
export default function TrendChart({ data = [], selected = "All" }) {
  const series = useMemo(() => {
    const byDate = new Map();
    data.forEach(r => {
      const key = new Date(r.date).toISOString().slice(0,10);
      const curr = byDate.get(key) || 0;
      const add = selected === "All" ? r.count : (r.emotion === selected ? r.count : 0);
      byDate.set(key, curr + add);
    });
    return Array.from(byDate.entries())
      .map(([k, v]) => ({ date: k, count: v }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, selected]);

  const display = series.map(d => ({ ...d, label: format(new Date(d.date), "MMM d") }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {value} {value === 1 ? "memory" : "memories"}
            {selected !== "All" && (
              <span className="text-purple-600 ml-1">({selected})</span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  if (display.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-500">No trend data available</p>
          <p className="text-sm text-gray-400">Data will appear as memories are created</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...display.map(d => d.count));
  const lineColor = selected !== "All" ? getEmotionColor(selected) : "#8B5CF6";
  const fillColor = selected !== "All" ? getEmotionColor(selected) : "#8B5CF6";

  return (
    <div className="w-full h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={display} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
            domain={[0, maxValue + 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke={lineColor}
            strokeWidth={3}
            fill="url(#colorGradient)"
            dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: "#FFFFFF" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-600">
        {selected === "All" ? "All Emotions" : selected}
      </div>
    </div>
  );
}