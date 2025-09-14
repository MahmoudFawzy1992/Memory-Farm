import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axiosInstance";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import ReportModal from "./ReportModal";
import { 
  extractTitle, 
  extractPreview, 
  extractEmotionData, 
  determineOwnership, 
  formatDisplayDate, 
  extractBlockIndicators,
  BLOCK_ICONS 
} from "../utils/memoryCard";
import { 
  OwnerControls, 
  IntensityDots, 
  ReportButton 
} from "./MemoryCard/MemoryCardControls";

function MemoryCard({ 
  memory, 
  onDelete, 
  showReport = false, 
  hideOwnerControls = false, 
  truncateLength = null 
}) {
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(memory.isPublic);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Extract all memory data using utilities
  const displayTitle = useMemo(() => extractTitle(memory), [memory]);
  const displayText = useMemo(() => extractPreview(memory, truncateLength), [memory, truncateLength]);
  const emotionData = useMemo(() => extractEmotionData(memory), [memory]);
  const displayDate = useMemo(() => formatDisplayDate(memory), [memory]);
  const blockIndicators = useMemo(() => extractBlockIndicators(memory), [memory]);
  
  // FIXED: Use correct ownership logic (matching ViewMemory.jsx)
  const { isOwner, authorObj, shouldShowAuthor } = useMemo(() => 
    determineOwnership(memory, user), [memory, user]
  );

  // Handle privacy toggle
  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      const res = await axios.patch(`/memory/${memory._id}/visibility`);
      setIsPublic(res.data.isPublic);
      toast.success(`Memory is now ${res.data.isPublic ? "public" : "private"}`);
    } catch (error) {
      console.error('Toggle visibility error:', error);
      toast.error("Failed to toggle visibility");
    } finally {
      setIsToggling(false);
    }
  };

  // FIXED: Handle delete properly (like ViewMemory)
  const handleDelete = () => {
    if (onDelete && typeof onDelete === 'function') {
      onDelete(memory._id);
    } else {
      console.warn('No delete handler provided to MemoryCard');
    }
  };

  // Handle report
  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportModal(true);
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
        style={{ 
          borderLeft: `4px solid ${memory.color || '#8B5CF6'}`,
          backgroundColor: `${memory.color || '#8B5CF6'}08`
        }}
        whileHover={{ scale: 1.01, y: -2 }}
        layout
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between mb-2">
            <Link to={`/memory/${memory._id}`} className="flex-1">
              <h3 className="font-semibold text-gray-900 leading-tight hover:text-purple-600 transition-colors">
                {displayTitle}
              </h3>
            </Link>
            <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
              isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {isPublic ? "🌍" : "🔒"}
            </span>
          </div>

          {/* Emotion & Intensity */}
          {emotionData.emotion && (
            <div className="flex items-center mb-3">
              <span className="text-sm font-medium" style={{ color: memory.color || '#8B5CF6' }}>
                {emotionData.emotion}
              </span>
              <IntensityDots 
                emotion={emotionData.emotion}
                intensity={emotionData.intensity}
                color={memory.color}
              />
            </div>
          )}
        </div>

        {/* Content Preview - Removed to show only block icons */}

        {/* Footer */}
        <div className="px-4 pb-4">
          {blockIndicators.length > 0 && (
            <div className="flex gap-2 mb-2">
              {blockIndicators.map((type, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {BLOCK_ICONS[type]}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {displayDate && <span>{displayDate}</span>}
              {shouldShowAuthor && (
                <Link 
                  to={`/user/${authorObj._id || authorObj.id}`} 
                  className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  👤 {authorObj.displayName}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Owner Controls */}
        <OwnerControls
          isOwner={isOwner}
          hideOwnerControls={hideOwnerControls}
          isPublic={isPublic}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDelete}
          hasDeleteHandler={!!onDelete}
          isToggling={isToggling}
        />

        {/* Report Button */}
        {showReport && !isOwner && (
          <ReportButton onReport={handleReport} />
        )}
      </motion.div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="memory"
        targetId={memory._id}
      />
    </>
  );
}

export default MemoryCard;