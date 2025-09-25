/**
 * Predefined tutorial steps for onboarding new users
 */
export const TUTORIAL_STEPS = [
  {
    id: 'new_memory_title',
    target: '.memory-title-input',
    title: 'Give Your Memory a Title ✏️',
    content: 'Start with a meaningful title that captures the essence of this moment.',
    placement: 'bottom'
  },
  {
    id: 'emotion_selector',
    target: '.emotion-selector',
    title: 'How Are You Feeling? 🎭',
    content: 'Choose the emotion that best matches this moment.',
    placement: 'right'
  },
  {
    id: 'intensity_slider',
    target: '.intensity-slider',
    title: 'Emotion Intensity 🌡️',
    content: 'How strong is this feeling? Slide to show the intensity.',
    placement: 'bottom'
  },
  {
    id: 'memory_date',
    target: '.memory-date',
    title: 'When Did This Happen? 📅',
    content: 'Set when this memory occurred. You can backdate memories too!',
    placement: 'right'
  },
  {
    id: 'color_picker',
    target: '.color-picker',
    title: 'Choose Your Memory Color 🎨',
    content: 'Pick a color that represents this memory\'s mood.',
    placement: 'top'
  },
  {
    id: 'block_editor',
    target: '.floating-block-selector',
    title: 'Add Rich Content ✨',
    content: 'Use + to add images, checklists, or more text blocks.',
    placement: 'left'
  }
];