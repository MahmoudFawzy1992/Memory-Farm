import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DistributionChart({ data = [], onSelect, selected }) {
  const handleClick = (e) => {
    if (!onSelect || !e?.activeLabel) return;
    onSelect(e.activeLabel); // activeLabel is the emotion label
  };

  const chartData = data.map(d => ({ name: d.emotion || "—", count: d.count }));

  return (
    <div className="w-full h-56 bg-white rounded shadow p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide={false} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" radius={[6,6,0,0]} fill={undefined} isAnimationActive />
        </BarChart>
      </ResponsiveContainer>
      {selected && <p className="text-xs text-gray-500 mt-1">Selected: {selected}</p>}
    </div>
  );
}
