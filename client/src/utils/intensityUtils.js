import { INTENSITY_LEVELS } from './filterUtils';

/**
 * Determines which intensity level a value falls into
 * @param {number} value - Intensity value (1-10)
 * @returns {string} - Level key ('LOW', 'MEDIUM', 'HIGH')
 */
export const getIntensityLevelFromValue = (value) => {
  if (value >= 1 && value <= 3) return 'LOW';
  if (value >= 7 && value <= 10) return 'HIGH';
  return 'MEDIUM';
};

/**
 * Gets the middle value for an intensity level
 * @param {string} levelKey - Level key ('LOW', 'MEDIUM', 'HIGH')
 * @returns {number} - Middle value of the range
 */
export const getMiddleValueForLevel = (levelKey) => {
  const level = INTENSITY_LEVELS[levelKey];
  if (!level) return 5;
  return Math.floor((level.min + level.max) / 2);
};

/**
 * Checks if all intensity levels are selected
 * @param {Array} selectedIntensities - Array of selected intensity keys
 * @returns {boolean} - True if all levels are selected
 */
export const areAllLevelsSelected = (selectedIntensities) => {
  const allLevels = Object.keys(INTENSITY_LEVELS);
  return selectedIntensities.length === allLevels.length;
};

/**
 * Gets all available intensity level keys
 * @returns {Array} - Array of level keys
 */
export const getAllIntensityLevels = () => {
  return Object.keys(INTENSITY_LEVELS);
};