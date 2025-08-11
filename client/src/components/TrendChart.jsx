import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

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

  return (
    <div className="w-full h-56 bg-white rounded shadow p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={display}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={undefined} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
