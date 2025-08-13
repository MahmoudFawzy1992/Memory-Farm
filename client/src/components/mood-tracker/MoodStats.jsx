import StatsBadges from "../StatsBadges";

export default function MoodStats({ distribution, summary, month }) {
  const totalThisMonth = distribution.reduce((sum, d) => sum + (d.count || 0), 0);
  const activeDays = summary.filter(d => d.count > 0).length;
  
  const topEmotion = (() => {
    if (!distribution.length) return "—";
    const grouped = {};
    
    distribution.forEach(item => {
      const label = (item.emotion || "").replace(/^\p{Emoji}+/u, "").trim() || "Unknown";
      grouped[label] = (grouped[label] || 0) + (item.count || 0);
    });
    
    const entries = Object.entries(grouped);
    if (!entries.length) return "—";
    
    const [topLabel, count] = entries.sort(([,a], [,b]) => b - a)[0];
    return topLabel;
  })();

  return (
    <StatsBadges 
      total={totalThisMonth} 
      activeDays={activeDays} 
      topEmotion={topEmotion} 
    />
  );
}