import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function InsightCard({ 
  insight, 
  onMarkAsRead, 
  onToggleFavorite,
  showActions = true,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkAsRead = async () => {
    if (insight.isRead) return;
    
    setIsProcessing(true);
    try {
      await onMarkAsRead(insight._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsProcessing(true);
    try {
      await onToggleFavorite(insight._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      achievement: 'bg-green-50 text-green-700 border-green-200',
      discovery: 'bg-blue-50 text-blue-700 border-blue-200',
      encouragement: 'bg-purple-50 text-purple-700 border-purple-200',
      trend: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPriorityIndicator = (priority) => {
    if (priority >= 4) return '🔥';
    if (priority >= 3) return '⭐';
    return '💡';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md ${
        !insight.isRead ? 'ring-2 ring-purple-100' : ''
      }`}
    >
      {/* Header */}
      <div 
        className="p-4 text-white relative cursor-pointer"
        style={{ backgroundColor: insight.color || '#8B5CF6' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{insight.icon || '💡'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{insight.title}</h3>
                {!insight.isRead && (
                  <span className="w-2 h-2 bg-white rounded-full opacity-80"></span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-90">
                <span>Memory #{insight.triggerMemoryCount}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPriorityIndicator(insight.priority)}</span>
            {showActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite();
                }}
                disabled={isProcessing}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50"
              >
                {insight.isFavorited ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="70" cy="20" r="2" fill="currentColor" />
            <circle cx="85" cy="35" r="1.5" fill="currentColor" />
            <circle cx="60" cy="45" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className={`text-gray-600 text-sm leading-relaxed ${
          compact && !isExpanded ? 'line-clamp-2' : ''
        }`}>
          {insight.message}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {!insight.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isProcessing}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                >
                  Mark as read
                </button>
              )}
              
              {compact && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Read indicator */}
      {insight.isRead && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Read {formatDistanceToNow(new Date(insight.readAt), { addSuffix: true })}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Utility functions
function getCategoryIcon(category) {
  const icons = {
    achievement: '🏆',
    discovery: '🔍',
    encouragement: '💪',
    trend: '📈'
  };
  return icons[category] || '💡';
}

function getTypeIcon(type) {
  const icons = {
    milestone: '🎯',
    emotion_pattern: '🎭',
    writing_pattern: '✍️',
    streak: '🔥',
    diversity: '🌈',
    complexity: '📚',
    consistency: '⚡'
  };
  return icons[type] || '💡';
}