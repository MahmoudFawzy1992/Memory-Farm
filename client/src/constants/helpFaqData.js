/**
 * FAQ data organized by sections for help system
 */
export const FAQ_DATA = {
  'getting-started': [
    {
      q: 'How do I create my first memory?',
      a: 'Click the "New Memory" button, add a title, select your emotion, choose a color, and start writing! The mood tracker block is automatically added to capture your feelings.'
    },
    {
      q: 'What are insights and how do they work?',
      a: 'Insights are personalized discoveries about your emotional patterns and writing habits. They appear automatically as you create memories, helping you understand your emotional journey.'
    },
    {
      q: 'Can I make my memories private?',
      a: 'Yes! By default, memories are private. You can toggle the privacy setting when creating or editing a memory to make it public and visible in the Discover feed.'
    }
  ],
  'creating-memories': [
    {
      q: 'What content blocks can I add to memories?',
      a: 'You can add text blocks, images, todo lists, headings, mood trackers, and dividers. Use the floating + button to access all available block types.'
    },
    {
      q: 'How do I add images to my memories?',
      a: 'Click the + button and select the image block. You can upload up to 10 images per block and 20 images total per memory. Each image should be under 1MB.'
    },
    {
      q: 'Can I edit memories after creating them?',
      a: 'Yes! Click on any memory card and use the edit button to modify the title, content, emotion, color, or privacy settings.'
    },
    {
      q: 'What emotions can I choose from?',
      a: 'Memory Farm includes 50+ emotions organized into families like Joy, Sadness, Anger, Fear, Surprise, Calm, Nostalgia, and Love. Just start typing to search!'
    }
  ],
  'insights': [
    {
      q: 'When will I receive my first insight?',
      a: 'You\'ll get your first insight after creating your first memory, then receive new insights every 5 memories. Insights celebrate milestones and reveal emotional patterns.'
    },
    {
      q: 'What types of insights will I see?',
      a: 'You\'ll discover your dominant emotions, writing patterns, consistency streaks, emotional diversity, and personalized encouragement based on your unique journey.'
    },
    {
      q: 'Where can I view my past insights?',
      a: 'All your insights are saved on your Dashboard page as cards. You can mark them as favorites and review your personal discoveries anytime.'
    }
  ],
  'discover': [
    {
      q: 'What is the Discover page?',
      a: 'Discover shows public memories shared by the Memory Farm community. Browse inspiring stories, explore different emotions, and connect with others\' experiences.'
    },
    {
      q: 'How do I make my memory visible in Discover?',
      a: 'When creating or editing a memory, toggle the privacy setting to "Public". Only you control what you share with the community.'
    },
    {
      q: 'Can I follow other users?',
      a: 'Yes! Visit any user\'s profile to follow them and see their public memories. You can also view your followers and following list.'
    }
  ],
  'account': [
    {
      q: 'How do I change my profile information?',
      a: 'Go to Settings from the profile menu. You can update your display name, bio, location, and privacy preferences.'
    },
    {
      q: 'Can I export my memories?',
      a: 'Memory export features are coming soon! For now, you can copy content from individual memories.'
    },
    {
      q: 'How do I delete my account?',
      a: 'In Settings, scroll to the bottom and click "Delete Account". This action is permanent and cannot be undone.'
    }
  ]
};

/**
 * Help navigation sections
 */
export const HELP_SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', icon: '🚀' },
  { id: 'creating-memories', label: '📝 Creating Memories', icon: '📝' },
  { id: 'insights', label: '💡 Insights', icon: '💡' },
  { id: 'discover', label: '🌍 Discover', icon: '🌍' },
  { id: 'account', label: '⚙️ Account', icon: '⚙️' }
];