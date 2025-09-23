const express = require('express');
const router = express.Router();
const {
  getDashboardInsights,
  triggerInsightGeneration,
  markInsightAsRead,
  toggleInsightFavorite,
  getInsightStats
} = require('../controllers/insightsController');
const {
  getOnboardingStatus,
  markWelcomeShown,
  completeOnboardingStep,
  skipOnboarding,
  resetOnboarding,
  getTutorialSteps
} = require('../controllers/onboardingController');
const { apiLimiter } = require('../middleware/rateLimiting');

// Insights endpoints
router.get('/dashboard', getDashboardInsights);
router.post('/generate', apiLimiter, triggerInsightGeneration);
router.patch('/:id/read', markInsightAsRead);
router.patch('/:id/favorite', toggleInsightFavorite);
router.get('/stats', getInsightStats);

// Onboarding endpoints
router.get('/onboarding/status', getOnboardingStatus);
router.post('/onboarding/welcome', markWelcomeShown);
router.post('/onboarding/step', completeOnboardingStep);
router.post('/onboarding/skip', skipOnboarding);
router.post('/onboarding/reset', resetOnboarding);
router.get('/onboarding/tutorial-steps', getTutorialSteps);

module.exports = router;