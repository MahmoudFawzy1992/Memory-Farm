import axios from '../utils/axiosInstance';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';

/**
 * Loads tutorial steps from server or returns fallback
 * @returns {Promise<Array>} Tutorial steps array
 */
export const loadTutorialSteps = async () => {
  try {
    const response = await axios.get('/insights/onboarding/tutorial-steps', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data.tutorialSteps.newMemory || TUTORIAL_STEPS;
  } catch (error) {
    console.error('Error loading tutorial steps:', error);
    return TUTORIAL_STEPS;
  }
};

/**
 * Marks a tutorial step as completed
 * @param {string} stepName - Name of the completed step
 * @returns {Promise}
 */
export const completeStep = async (stepName) => {
  try {
    await axios.post('/insights/onboarding/step', 
      { stepName },
      { headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error) {
    console.error('Error completing tutorial step:', error);
    throw error;
  }
};

/**
 * Skips the entire tutorial
 * @returns {Promise}
 */
export const skipTutorial = async () => {
  try {
    await axios.post('/insights/onboarding/skip', 
      { skipType: 'tutorial' },
      { headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error) {
    console.error('Error skipping tutorial:', error);
    throw error;
  }
};