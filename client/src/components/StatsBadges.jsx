export default function StatsBadges({ total = 0, activeDays = 0, topEmotion = "—" }) {
  const Badge = ({ title, value, hint }) => (
    <div className="flex-1 bg-white rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-purple-700 mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Badge title="Total this month" value={total} />
      <Badge title="Active days" value={activeDays} />
      <Badge title="Top emotion" value={topEmotion} hint="Most frequent this month" />
    </div>
  );
}
