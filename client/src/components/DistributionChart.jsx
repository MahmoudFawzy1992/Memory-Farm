import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getEmotionColor } from "../utils/emotionColors";

export default function DistributionChart({ data = [], onSelect, selected }) {
  // Transform data for pie chart
  const chartData = data.map(d => ({
    name: d.emotion || "Unknown",
    value: d.count,
    emoji: d.emoji || "❓"
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleClick = (entry) => {
    if (!onSelect) return;
    onSelect(entry.name);
  };

  // Custom label renderer for outside labels
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, emoji, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Hide labels for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${emoji} ${name}`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">
            {data.emoji} {data.name}
          </p>
          <p className="text-sm text-gray-600">
            {data.value} memories ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
            onClick={handleClick}
            className="cursor-pointer outline-none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getEmotionColor(entry.name)}
                stroke={selected === entry.name ? "#6366f1" : "transparent"}
                strokeWidth={selected === entry.name ? 3 : 0}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text showing total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-500">memories</div>
        </div>
      </div>
      
      {selected && (
        <div className="absolute bottom-2 left-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
          Selected: {selected}
        </div>
      )}
    </div>
  );
}