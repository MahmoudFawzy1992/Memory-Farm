import { format, isValid } from 'date-fns';
import { DATE_PRESETS } from '../constants/dateRangePresets';

/**
 * Formats a date for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDisplayDate = (date) => {
  if (!date || !isValid(date)) return '';
  return format(date, 'MMM d, yyyy');
};

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2 || !isValid(date1) || !isValid(date2)) return false;
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
};

/**
 * Determines if current date range matches any preset
 * @param {Object} dateRange - Current date range { startDate, endDate }
 * @returns {string|null} - Matching preset key or null
 */
export const findMatchingPreset = (dateRange) => {
  if (!dateRange.startDate || !dateRange.endDate) return null;
  
  for (const [key, preset] of Object.entries(DATE_PRESETS)) {
    const presetDates = preset.getDates();
    const isSameStart = isSameDay(dateRange.startDate, presetDates.startDate);
    const isSameEnd = isSameDay(dateRange.endDate, presetDates.endDate);
    
    if (isSameStart && isSameEnd) {
      return key;
    }
  }
  
  return null;
};

/**
 * Validates if date range selection is complete and valid
 * @param {Object} ranges - Date range from picker
 * @returns {boolean} - True if valid selection
 */
export const isValidDateRangeSelection = (ranges) => {
  const { selection } = ranges;
  const { startDate, endDate } = selection;
  
  return isValid(startDate) && isValid(endDate);
};