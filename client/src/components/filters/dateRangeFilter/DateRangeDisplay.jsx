import { motion } from 'framer-motion';
import { formatDisplayDate, isSameDay } from '../../../utils/dateRangeUtils';

/**
 * Date range display component showing selected dates
 */
export default function DateRangeDisplay({ startDate, endDate, onClear }) {
  if (!startDate && !endDate) return null;
  
  const isSameDayRange = startDate && endDate && isSameDay(startDate, endDate);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
    >
      <div className="flex items-center gap-2 text-purple-700">
        <span className="text-base">📅</span>
        <span className="font-medium">
          {isSameDayRange ? (
            formatDisplayDate(startDate)
          ) : (
            `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
          )}
        </span>
      </div>
      
      <button
        type="button"
        onClick={onClear}
        className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
        title="Clear date filter"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}