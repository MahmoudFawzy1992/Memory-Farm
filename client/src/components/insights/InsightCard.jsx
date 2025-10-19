import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function InsightCard({ 
  insight, 
  onMarkAsRead, 
  onRegenerate, // Regenerate function
  showActions = true,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleMarkAsRead = async () => {
    if (insight.isRead) return;
    
    setIsProcessing(true);
    try {
      await onMarkAsRead(insight._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    
    setIsRegenerating(true);
    try {
      await onRegenerate(insight._id);
    } finally {
      setIsRegenerating(false);
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

  // Calculate remaining regenerations
  const regenerateCount = insight.aiMetadata?.regenerateCount || 0;
  const remainingRegens = 3 - regenerateCount;

  // Also check if onRegenerate function exists (Dashboard passes monthly limit info)
  const canRegenerate = remainingRegens > 0 && onRegenerate;

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
                
                {/* ✅ Dev mode indicator - ONLY shows in local development */}
                {import.meta.env.DEV && insight.aiMetadata?.model && (
                  <>
                    <span>•</span>
                    <span className="text-xs opacity-75">
                      {insight.aiMetadata.model === 'gpt-4o-mini' ? '🤖 GPT' : 
                       insight.aiMetadata.model === 'llama-3.2' ? '🦙 Llama' : 
                       '📝 Static'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPriorityIndicator(insight.priority)}</span>
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

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {/* Mark as Read Button */}
            {!insight.isRead && (
              <button
                onClick={handleMarkAsRead}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isProcessing ? '⏳ Processing...' : '✓ Mark as read'}
              </button>
            )}

            {/* Regenerate Button */}
            {canRegenerate && onRegenerate && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || isProcessing}
                className="flex-1 px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isRegenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Regenerating...</span>
                  </span>
                ) : (
                  <>🔄 Try again ({remainingRegens} left)</>
                )}
              </button>
            )}

            {/* Compact toggle */}
            {compact && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Regeneration limit message */}
        {!canRegenerate && showActions && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              💡 Monthly Regeneration limit reached. Create more memories to help me learn and generate better insights!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
          </div>

          {/* Category badge */}
          <span 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(insight.category)}`}
          >
            {getCategoryIcon(insight.category)} {insight.category}
          </span>
        </div>
      </div>

      {/* Read indicator */}
      {insight.isRead && insight.readAt && (
        <div className="px-4 pb-3">
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