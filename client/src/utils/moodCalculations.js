import { emotions } from "../constants/emotions";

export const calculateMoodStats = (distribution, summary) => {
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
    
    const [topLabel] = entries.sort(([,a], [,b]) => b - a)[0];
    return topLabel;
  })();

  return { totalThisMonth, activeDays, topEmotion };
};

export const groupDistributionByEmotion = (distribution) => {
  const grouped = {};
  
  distribution.forEach(item => {
    const label = (item.emotion || "").replace(/^\p{Emoji}+/u, "").trim() || "Unknown";
    grouped[label] = (grouped[label] || 0) + (item.count || 0);
  });

  return emotions.slice(1).map(emotion => ({
    emotion: emotion.label,
    emoji: emotion.emoji,
    count: grouped[emotion.label] || 0
  })).filter(item => item.count > 0);
};

export const filterMemoriesByEmotion = (memories, selectedEmotion) => {
  if (selectedEmotion === "All") return memories;
  
  return memories.filter(m => {
    const emotionLabel = (m.emotion || "").replace(/^\p{Emoji}+/u, "").trim();
    return emotionLabel.toLowerCase() === selectedEmotion.toLowerCase();
  });
};