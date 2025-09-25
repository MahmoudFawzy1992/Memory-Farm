import axios from '../utils/axiosInstance';

/**
 * Marks welcome guide as shown
 * @returns {Promise}
 */
export const markWelcomeAsShown = async () => {
  try {
    await axios.post('/insights/onboarding/welcome');
  } catch (error) {
    console.error('Error marking welcome as shown:', error);
    throw error;
  }
};

/**
 * Completes a navigation step
 * @param {string} stepName - Name of the step to complete
 * @returns {Promise}
 */
export const completeNavigationStep = async (stepName) => {
  try {
    await axios.post('/insights/onboarding/step', { stepName });
  } catch (error) {
    console.error('Error completing navigation step:', error);
    throw error;
  }
};

/**
 * Skips the welcome tutorial
 * @returns {Promise}
 */
export const skipWelcomeTutorial = async () => {
  try {
    await axios.post('/insights/onboarding/skip', { skipType: 'tutorial' });
  } catch (error) {
    console.error('Error skipping tutorial:', error);
    throw error;
  }
};