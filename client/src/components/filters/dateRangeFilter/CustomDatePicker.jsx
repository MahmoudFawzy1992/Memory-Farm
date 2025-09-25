import { DateRange } from 'react-date-range';
import { motion, AnimatePresence } from 'framer-motion';

// Import react-date-range styles (will be handled by CSS)
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

/**
 * Custom date range picker component
 */
export default function CustomDatePicker({ 
  showCustomPicker, 
  setShowCustomPicker, 
  dateRange, 
  onDateRangeChange 
}) {
  return (
    <>
      {/* Custom date picker toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
          </svg>
          <span>{showCustomPicker ? 'Hide' : 'Custom Date Range'}</span>
        </button>
      </div>
      
      {/* Custom date range picker */}
      <AnimatePresence>
        {showCustomPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Select Custom Range</h4>
              
              <div className="date-range-picker-wrapper">
                <DateRange
                  ranges={[{
                    startDate: dateRange.startDate || new Date(),
                    endDate: dateRange.endDate || new Date(),
                    key: 'selection'
                  }]}
                  onChange={onDateRangeChange}
                  maxDate={new Date()}
                  showDateDisplay={false}
                  rangeColors={['#8B5CF6']}
                  className="date-range-picker"
                />
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Select start and end dates for your filter
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}