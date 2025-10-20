const User = require('../models/User');

// Get user's onboarding status - with cache prevention
exports.getOnboardingStatus = async (req, res) => {
  try {
    // Add cache prevention headers to avoid 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString()
    });

    const user = await User.findById(req.user.id)
      .select('onboardingStatus insightsPreferences');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user doesn't have insights preferences set, set defaults
    if (!user.insightsPreferences) {
      user.insightsPreferences = {
        enabled: true,
        frequency: 'every_5',
        lastNotificationAt: null,
        notificationCount: 0
      };
      await user.save();
    }

    res.json({
      onboardingStatus: user.onboardingStatus,
      shouldShowWelcome: !user.onboardingStatus.welcomeShown,
      shouldShowTutorial: !user.onboardingStatus.tutorialCompleted
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: 'Failed to load onboarding status' });
  }
};

// Mark welcome popup as shown
exports.markWelcomeShown = async (req, res) => {
  try {
    // Add cache prevention headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.onboardingStatus.welcomeShown = true;
    await user.save();

    res.json({ 
      success: true,
      onboardingStatus: user.onboardingStatus
    });
  } catch (error) {
    console.error('Mark welcome shown error:', error);
    res.status(500).json({ error: 'Failed to update welcome status' });
  }
};

// Complete onboarding step
exports.completeOnboardingStep = async (req, res) => {
  try {
    // Add cache prevention headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });

    const { stepName } = req.body;
    
    if (!stepName) {
      return res.status(400).json({ error: 'Step name is required' });
    }

    const validSteps = [
      'welcome_shown',
      'discover_explained', 
      'mood_tracker_explained',
      'new_memory_title',
      'emotion_selector',
      'intensity_slider',
      'memory_date',
      'color_picker',
      'block_editor',
      'tutorial_completed',
      'navigation_complete'
    ];

    if (!validSteps.includes(stepName)) {
      return res.status(400).json({ error: 'Invalid step name' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark step as completed
    await user.completeOnboardingStep(stepName);

    // Special handling for tutorial_completed
    if (stepName === 'tutorial_completed') {
      user.onboardingStatus.tutorialCompleted = true;
      user.onboardingStatus.completedAt = new Date();
      await user.save();
    }

    // Check if tutorial is fully completed
    const tutorialSteps = [
      'discover_explained',
      'mood_tracker_explained', 
      'new_memory_title',
      'emotion_selector',
      'intensity_slider',
      'memory_date',
      'color_picker',
      'block_editor'
    ];

    const completedTutorialSteps = tutorialSteps.filter(step => 
      user.onboardingStatus.completedSteps.includes(step)
    );

    if (completedTutorialSteps.length === tutorialSteps.length && !user.onboardingStatus.tutorialCompleted) {
      user.onboardingStatus.tutorialCompleted = true;
      user.onboardingStatus.completedAt = new Date();
      await user.save();
    }

    // Mark overall onboarding as completed if all major steps are done
    if (user.onboardingStatus.tutorialCompleted && !user.onboardingStatus.isCompleted) {
      user.onboardingStatus.isCompleted = true;
      await user.save();
    }

    res.json({
      success: true,
      stepCompleted: stepName,
      onboardingStatus: user.onboardingStatus,
      tutorialProgress: `${completedTutorialSteps.length}/${tutorialSteps.length}`
    });
  } catch (error) {
    console.error('Complete onboarding step error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding step' });
  }
};

// Skip tutorial/onboarding
exports.skipOnboarding = async (req, res) => {
  try {
    // Add cache prevention headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });

    const { skipType = 'tutorial' } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (skipType === 'tutorial') {
      user.onboardingStatus.tutorialCompleted = true;
      user.onboardingStatus.skippedAt = new Date();
    }
    
    user.onboardingStatus.isCompleted = true;
    await user.save();

    res.json({
      success: true,
      skipped: skipType,
      onboardingStatus: user.onboardingStatus
    });
  } catch (error) {
    console.error('Skip onboarding error:', error);
    res.status(500).json({ error: 'Failed to skip onboarding' });
  }
};

// Reset onboarding (for testing or user request)
exports.resetOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reset onboarding status
    user.onboardingStatus = {
      isCompleted: false,
      tutorialCompleted: false,
      welcomeShown: false,
      completedSteps: [],
      completedAt: null,
      skippedAt: null
    };

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding reset successfully',
      onboardingStatus: user.onboardingStatus
    });
  } catch (error) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({ error: 'Failed to reset onboarding' });
  }
};

// Get tutorial steps configuration - with cache prevention
exports.getTutorialSteps = async (req, res) => {
  try {
    // Add cache prevention headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });

    const tutorialSteps = {
      overview: [
        {
          id: 'discover_explained',
          target: 'discover-link',
          title: 'Discover Community Memories 🌍',
          content: 'Here you can explore public memories shared by our community. Get inspired by others\' stories and emotions.',
          placement: 'bottom',
          category: 'navigation'
        },
        {
          id: 'mood_tracker_explained', 
          target: 'mood-tracker-link',
          title: 'Track Your Emotional Journey 📊',
          content: 'View your mood patterns, emotional trends, and memory statistics over time.',
          placement: 'bottom',
          category: 'navigation'
        }
      ],
      newMemory: [
        {
          id: 'new_memory_title',
          target: '.memory-title-input',
          title: 'Give Your Memory a Title ✏️',
          content: 'Start with a meaningful title that captures the essence of this moment. This helps you find and organize your memories later.',
          placement: 'bottom',
          category: 'form'
        },
        {
          id: 'emotion_selector',
          target: '.emotion-selector',
          title: 'How Are You Feeling? 🎭',
          content: 'Choose the emotion that best matches this moment. Your emotions help create personalized insights about your patterns.',
          placement: 'right',
          category: 'form'
        },
        {
          id: 'intensity_slider',
          target: '.intensity-slider',
          title: 'Emotion Intensity 🌡️',
          content: 'How strong is this feeling? Slide to show the intensity of your emotion from 1 (mild) to 10 (very strong).',
          placement: 'bottom',
          category: 'form'
        },
        {
          id: 'memory_date',
          target: '.memory-date',
          title: 'When Did This Happen? 📅',
          content: 'Set when this memory occurred. You can backdate memories too! This helps with accurate timeline tracking.',
          placement: 'right',
          category: 'form'
        },
        {
          id: 'color_picker',
          target: '.color-picker',
          title: 'Choose Your Memory Color 🎨',
          content: 'Pick a color that represents this memory\'s mood and energy. Colors help you visually organize your memories.',
          placement: 'top',
          category: 'form'
        },
        {
          id: 'block_editor',
          target: '.floating-block-selector',
          title: 'Floating Button ✨',
          content: 'Add more to your memory! Use images, todo list, text blocks. Rich content helps create better personal insights!',
          placement: 'left',
          category: 'advanced'
        }
      ]
    };

    res.json({
      success: true,
      tutorialSteps,
      totalSteps: tutorialSteps.overview.length + tutorialSteps.newMemory.length
    });
  } catch (error) {
    console.error('Get tutorial steps error:', error);
    res.status(500).json({ error: 'Failed to load tutorial steps' });
  }
};