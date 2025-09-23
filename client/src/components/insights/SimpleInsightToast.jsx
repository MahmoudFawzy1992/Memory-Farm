import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function SimpleInsightToast({ insight, onClose, onViewDashboard }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (insight) {
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [insight]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleViewDashboard = () => {
    handleClose();
    if (onViewDashboard) onViewDashboard();
  };

  if (!insight) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div 
              className="p-4 text-white relative"
              style={{ backgroundColor: insight.color || '#8B5CF6' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{insight.icon || '💡'}</span>
                  <div>
                    <h3 className="font-medium text-sm">New Insight!</h3>
                    <p className="text-xs opacity-90">Memory #{insight.triggerMemoryCount}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="20" r="3" fill="currentColor" />
                  <circle cx="70" cy="35" r="2" fill="currentColor" />
                  <circle cx="30" cy="45" r="2.5" fill="currentColor" />
                  <circle cx="80" cy="60" r="2" fill="currentColor" />
                  <circle cx="20" cy="75" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">
                {insight.title}
              </h4>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {insight.message}
              </p>

              {/* Category badge */}
              <div className="flex items-center justify-between">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${insight.color || '#8B5CF6'}20`,
                    color: insight.color || '#8B5CF6'
                  }}
                >
                  {getCategoryIcon(insight.category)} {insight.category}
                </span>
                
                <span className="text-xs text-gray-400">
                  {formatInsightDate(insight.createdAt || new Date())}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 text-gray-600 py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Dismiss
              </button>
              
              <button
                onClick={handleViewDashboard}
                className="flex-1 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                style={{ backgroundColor: insight.color || '#8B5CF6' }}
              >
                View All Insights
              </button>
            </div>

            {/* Progress indicator for auto-close */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className="h-1"
              style={{ backgroundColor: insight.color || '#8B5CF6' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility functions
function getCategoryIcon(category) {
  const icons = {
    'achievement': '🏆',
    'discovery': '🔍',
    'encouragement': '💪',
    'trend': '📈'
  };
  return icons[category] || '💡';
}

function formatInsightDate(date) {
  const now = new Date();
  const insightDate = new Date(date);
  const diffMs = now - insightDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return insightDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// Enhanced toast function for insights
export const showInsightToast = (insight, options = {}) => {
  const customToast = ({ closeToast }) => (
    <SimpleInsightToast
      insight={insight}
      onClose={closeToast}
      onViewDashboard={options.onViewDashboard}
    />
  );

  toast(customToast, {
    position: 'top-right',
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    className: 'insight-toast',
    bodyClassName: 'p-0',
    style: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      minHeight: 'auto'
    }
  });
};

// Simple insight notification component for quick insights
export function QuickInsightNotification({ insight, onDismiss }) {
  if (!insight) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mx-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{insight.icon || '💡'}</span>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">
              {insight.title}
            </h4>
            <p className="text-gray-600 text-xs">
              {insight.message.substring(0, 80)}...
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}