// client/src/constants/emotions.js
// Comprehensive emotions database with 57+ emotions organized by families

export const emotionFamilies = {
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

// Flattened list for search and dropdowns
export const allEmotions = Object.values(emotionFamilies)
  .flatMap(family => family.emotions)
  .sort((a, b) => a.label.localeCompare(b.label));

// Add "All" option for filters
export const emotions = [
  { label: 'All', emoji: '🌀', value: '' },
  ...allEmotions
];

// For analytics grouping - map individual emotions to families
export const getEmotionFamily = (emotionLabel) => {
  for (const [familyKey, family] of Object.entries(emotionFamilies)) {
    const found = family.emotions.find(e => 
      e.label.toLowerCase() === emotionLabel.toLowerCase()
    );
    if (found) return { key: familyKey, ...family };
  }
  return { key: 'other', label: 'Other', color: '#6B7280' };
};

// Comprehensive synonym mappings for emotion search
const emotionSynonyms = {
  'Happy': ['glad', 'content', 'pleased', 'jovial', 'merry', 'upbeat', 'positive'],
  'Joyful': ['jubilant', 'gleeful', 'ecstatic', 'thrilled', 'overjoyed'],
  'Excited': ['thrilled', 'pumped', 'hyped', 'eager', 'animated'],
  'Enthusiastic': ['passionate', 'zealous', 'spirited', 'energetic'],
  'Delighted': ['pleased', 'charmed', 'gratified', 'satisfied'],
  'Elated': ['exhilarated', 'euphoric', 'triumphant', 'high'],
  'Cheerful': ['bright', 'sunny', 'optimistic', 'buoyant'],
  'Blissful': ['serene', 'heavenly', 'divine', 'perfect'],
  'Euphoric': ['ecstatic', 'rapturous', 'intoxicated', 'high'],
  
  'Sad': ['unhappy', 'down', 'blue', 'depressed', 'gloomy', 'miserable'],
  'Melancholy': ['pensive', 'brooding', 'contemplative', 'wistful'],
  'Sorrowful': ['grieving', 'mournful', 'lamenting', 'aching'],
  'Heartbroken': ['devastated', 'crushed', 'shattered', 'broken'],
  'Grief': ['mourning', 'bereavement', 'loss', 'anguish'],
  'Dejected': ['downcast', 'crestfallen', 'dispirited', 'discouraged'],
  'Despondent': ['hopeless', 'despairing', 'desolate', 'forlorn'],
  'Mournful': ['sorrowful', 'doleful', 'plaintive', 'elegiac'],
  
  'Angry': ['mad', 'furious', 'rage', 'irate', 'livid', 'heated'],
  'Furious': ['enraged', 'incensed', 'outraged', 'seething'],
  'Irritated': ['annoyed', 'vexed', 'bothered', 'irked'],
  'Frustrated': ['exasperated', 'aggravated', 'thwarted', 'stymied'],
  'Annoyed': ['irked', 'bothered', 'peeved', 'miffed'],
  'Livid': ['furious', 'enraged', 'seething', 'incandescent'],
  'Resentful': ['bitter', 'grudging', 'spiteful', 'vindictive'],
  'Indignant': ['outraged', 'offended', 'affronted', 'insulted'],
  
  'Afraid': ['scared', 'frightened', 'fearful', 'terrified'],
  'Anxious': ['worried', 'nervous', 'apprehensive', 'uneasy'],
  'Worried': ['concerned', 'troubled', 'distressed', 'bothered'],
  'Nervous': ['jittery', 'edgy', 'tense', 'restless'],
  'Terrified': ['petrified', 'horrified', 'panic-stricken', 'terror'],
  'Panicked': ['frantic', 'hysterical', 'frenzied', 'alarmed'],
  'Uneasy': ['uncomfortable', 'unsettled', 'disturbed', 'restless'],
  'Apprehensive': ['wary', 'cautious', 'hesitant', 'doubtful'],
  
  'Surprised': ['astonished', 'amazed', 'shocked', 'startled'],
  'Amazed': ['astounded', 'stunned', 'flabbergasted', 'awestruck'],
  'Astonished': ['dumbfounded', 'thunderstruck', 'stupefied'],
  'Bewildered': ['confused', 'perplexed', 'puzzled', 'baffled'],
  'Curious': ['inquisitive', 'interested', 'wondering', 'questioning'],
  'Intrigued': ['fascinated', 'captivated', 'engrossed', 'absorbed'],
  'Fascinated': ['enthralled', 'mesmerized', 'spellbound', 'riveted'],
  'Awed': ['reverent', 'wonderstruck', 'impressed', 'humbled'],
  
  'Calm': ['peaceful', 'tranquil', 'serene', 'composed'],
  'Peaceful': ['harmonious', 'still', 'quiet', 'undisturbed'],
  'Serene': ['placid', 'untroubled', 'unruffled', 'collected'],
  'Relaxed': ['laid-back', 'easygoing', 'carefree', 'unwind'],
  'Tranquil': ['still', 'hushed', 'restful', 'soothing'],
  'Zen': ['mindful', 'meditative', 'centered', 'balanced'],
  'Centered': ['grounded', 'focused', 'stable', 'poised'],
  'Balanced': ['harmonious', 'steady', 'even', 'stable'],
  
  'Nostalgic': ['reminiscent', 'sentimental', 'wistful', 'longing'],
  'Wistful': ['yearning', 'pensive', 'dreamy', 'melancholic'],
  'Sentimental': ['emotional', 'tender', 'soft-hearted', 'touching'],
  'Reflective': ['thoughtful', 'contemplative', 'introspective', 'meditative'],
  'Longing': ['yearning', 'pining', 'aching', 'craving'],
  'Yearning': ['longing', 'pining', 'hungering', 'thirsting'],
  'Reminiscent': ['evocative', 'suggestive', 'redolent', 'memory-laden'],
  
  'Love': ['adoration', 'affection', 'devotion', 'passion'],
  'Affectionate': ['loving', 'tender', 'warm', 'caring'],
  'Adoring': ['worshiping', 'idolizing', 'cherishing', 'treasuring'],
  'Caring': ['nurturing', 'protective', 'compassionate', 'kind'],
  'Tender': ['gentle', 'soft', 'delicate', 'loving'],
  'Devoted': ['dedicated', 'loyal', 'faithful', 'committed'],
  'Passionate': ['intense', 'fervent', 'ardent', 'fiery'],
  'Romantic': ['amorous', 'sentimental', 'dreamy', 'idealistic']
};

// For search functionality with complete synonym mapping
export const emotionSearchIndex = allEmotions.map(emotion => ({
  ...emotion,
  searchTerms: [
    emotion.label.toLowerCase(),
    emotion.emoji,
    ...(emotionSynonyms[emotion.label] || [])
  ].join(' ')
}));