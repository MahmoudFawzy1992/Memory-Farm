// Backend emotion families - matches frontend structure
const emotionFamilies = {
  joy: {
    label: "Joy & Happiness",
    color: "#10B981",
    emotions: [
      { label: "Happy", emoji: "😊" },
      { label: "Joyful", emoji: "😄" },
      { label: "Excited", emoji: "🤩" },
      { label: "Enthusiastic", emoji: "😃" },
      { label: "Delighted", emoji: "😆" },
      { label: "Elated", emoji: "🥳" },
      { label: "Cheerful", emoji: "😁" },
      { label: "Blissful", emoji: "😌" },
      { label: "Euphoric", emoji: "🤪" }
    ]
  },
  sadness: {
    label: "Sadness & Grief", 
    color: "#3B82F6",
    emotions: [
      { label: "Sad", emoji: "😢" },
      { label: "Melancholy", emoji: "😔" },
      { label: "Sorrowful", emoji: "😞" },
      { label: "Heartbroken", emoji: "💔" },
      { label: "Grief", emoji: "😭" },
      { label: "Dejected", emoji: "☹️" },
      { label: "Despondent", emoji: "😦" },
      { label: "Mournful", emoji: "😰" }
    ]
  },
  anger: {
    label: "Anger & Frustration",
    color: "#EF4444", 
    emotions: [
      { label: "Angry", emoji: "😠" },
      { label: "Furious", emoji: "😡" },
      { label: "Irritated", emoji: "😤" },
      { label: "Frustrated", emoji: "😣" },
      { label: "Annoyed", emoji: "🙄" },
      { label: "Livid", emoji: "🤬" },
      { label: "Resentful", emoji: "😒" },
      { label: "Indignant", emoji: "😤" }
    ]
  },
  fear: {
    label: "Fear & Anxiety",
    color: "#8B5CF6",
    emotions: [
      { label: "Afraid", emoji: "😨" },
      { label: "Anxious", emoji: "😰" },
      { label: "Worried", emoji: "😟" },
      { label: "Nervous", emoji: "😬" },
      { label: "Terrified", emoji: "😱" },
      { label: "Panicked", emoji: "😵" },
      { label: "Uneasy", emoji: "😓" },
      { label: "Apprehensive", emoji: "😕" }
    ]
  },
  surprise: {
    label: "Surprise & Wonder",
    color: "#F59E0B",
    emotions: [
      { label: "Surprised", emoji: "😲" },
      { label: "Amazed", emoji: "😮" },
      { label: "Astonished", emoji: "😯" },
      { label: "Bewildered", emoji: "🤯" },
      { label: "Curious", emoji: "🤔" },
      { label: "Intrigued", emoji: "🧐" },
      { label: "Fascinated", emoji: "😍" },
      { label: "Awed", emoji: "🤩" }
    ]
  },
  calm: {
    label: "Peace & Calm",
    color: "#06B6D4", 
    emotions: [
      { label: "Calm", emoji: "😌" },
      { label: "Peaceful", emoji: "☮️" },
      { label: "Serene", emoji: "🧘" },
      { label: "Relaxed", emoji: "😎" },
      { label: "Tranquil", emoji: "🕊️" },
      { label: "Zen", emoji: "🧘‍♂️" },
      { label: "Centered", emoji: "🙏" },
      { label: "Balanced", emoji: "⚖️" }
    ]
  },
  nostalgia: {
    label: "Nostalgia & Reflection", 
    color: "#EC4899",
    emotions: [
      { label: "Nostalgic", emoji: "🥺" },
      { label: "Wistful", emoji: "😌" },
      { label: "Sentimental", emoji: "🥹" },
      { label: "Reflective", emoji: "🤔" },
      { label: "Longing", emoji: "😔" },
      { label: "Yearning", emoji: "💭" },
      { label: "Reminiscent", emoji: "📸" }
    ]
  },
  love: {
    label: "Love & Affection",
    color: "#F43F5E",
    emotions: [
      { label: "Love", emoji: "❤️" },
      { label: "Affectionate", emoji: "🥰" },
      { label: "Adoring", emoji: "😍" },
      { label: "Caring", emoji: "🤗" },
      { label: "Tender", emoji: "💕" },
      { label: "Devoted", emoji: "💖" },
      { label: "Passionate", emoji: "🔥" },
      { label: "Romantic", emoji: "💘" }
    ]
  }
};

// Flattened list for validation
const allEmotions = Object.values(emotionFamilies)
  .flatMap(family => family.emotions)
  .sort((a, b) => a.label.localeCompare(b.label));

// Get family key from emotion text
function getEmotionFamilyKey(emotionText) {
  if (!emotionText) return 'other';
  
  const cleanEmotion = emotionText.replace(/^\p{Emoji}+/u, '').trim().toLowerCase();
  
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === cleanEmotion
    );
    if (found) return familyKey;
  }
  
  return 'other';
}

module.exports = {
  emotionFamilies,
  allEmotions,
  getEmotionFamilyKey
};