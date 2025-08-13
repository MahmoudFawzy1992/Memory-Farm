import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { getEmotionColor } from "../../utils/emotionColors";

export default function GlobalTrendChart({ data = [] }) {
  const emotionData = useMemo(() => {
    const grouped = {};
    
    data.forEach(item => {
      const emotion = (item.emotion || "").replace(/^\p{Emoji}+/u, "").trim() || "Unknown";
      grouped[emotion] = (grouped[emotion] || 0) + (item.count || 0);
    });
    
    return Object.entries(grouped)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {value} global {value === 1 ? "memory" : "memories"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (emotionData.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🌍</div>
          <p className="text-gray-500">No global trend data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={emotionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="emotion"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}