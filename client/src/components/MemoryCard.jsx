import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axiosInstance";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReportModal from "./ReportModal";

function MemoryCard({ memory, onDelete, showReport = false, hideOwnerControls = false, truncateLength = null }) {
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(memory.isPublic);
  const [showReportModal, setShowReportModal] = useState(false);

  // Use preview text from backend or fallback to extracted text
  const displayText = useMemo(() => {
    if (memory.previewText) return memory.previewText;
    
    if (truncateLength && memory.extractedText) {
      const words = memory.extractedText.split(' ');
      if (words.length <= truncateLength) return memory.extractedText;
      return words.slice(0, truncateLength).join(' ') + '...';
    }
    
    return memory.extractedText || memory.text || '';
  }, [memory.previewText, memory.extractedText, memory.text, truncateLength]);

  // Author shape can be memory.author or memory.userId depending on endpoint
  const authorObj = memory.author || memory.userId || null;
  const myId = user?._id || user?.id;
  const authorId = authorObj?._id || authorObj?.id;
  const showAuthor = authorObj && authorObj.displayName && authorId && (!myId || authorId !== myId);
  const isMine = Boolean(myId && authorId && myId === authorId);

  const displayDate = useMemo(() => {
    const d = memory.memoryDate || memory.createdAt;
    try {
      return d ? format(new Date(d), "MMM d, yyyy") : null;
    } catch {
      return null;
    }
  }, [memory.memoryDate, memory.createdAt]);

  const handleToggleVisibility = async () => {
    try {
      const res = await axios.patch(`/memory/${memory._id}/visibility`);
      setIsPublic(res.data.isPublic);
      toast.success(`Memory is now ${res.data.isPublic ? "public" : "private"}`);
    } catch {
      toast.error("Failed to toggle visibility");
    }
  };

  // Content indicators
  const contentMeta = useMemo(() => {
    const indicators = [];
    if (memory.hasImages) indicators.push({ icon: '📷', label: 'Has images' });
    if (memory.hasChecklistItems) indicators.push({ icon: '✅', label: 'Has tasks' });
    if (memory.hasMoodBlocks) indicators.push({ icon: '🎭', label: 'Mood tracker' });
    if (memory.hasHeadings) indicators.push({ icon: '📝', label: 'Structured' });
    return indicators;
  }, [memory.hasImages, memory.hasChecklistItems, memory.hasMoodBlocks, memory.hasHeadings]);

  return (
    <>
      <motion.li
        className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative list-none border-l-4 group"
        style={{ borderLeftColor: memory.color || '#8B5CF6' }}
        whileHover={{ scale: 1.01, y: -2 }}
      >
        <Link to={`/memory/${memory._id}`} className="block">
          <div className="mb-3">
            <p className="text-gray-900 font-medium line-clamp-3 leading-relaxed">
              {displayText}
            </p>
            {memory.emotion && (
              <p className="text-sm mt-2 font-medium" style={{ color: memory.color || '#8B5CF6' }}>
                {memory.emotion}
              </p>
            )}
          </div>

          {/* Content indicators */}
          {contentMeta.length > 0 && (
            <div className="flex gap-1 mb-2">
              {contentMeta.map((meta, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                  title={meta.label}
                >
                  {meta.icon}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Memory date */}
        {displayDate && (
          <div className="text-xs text-gray-500 mb-2">{displayDate}</div>
        )}

        {/* Author info */}
        {showAuthor && (
          <div className="text-sm text-gray-500 mb-2">
            <Link to={`/user/${authorId}`} className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
              👤 {authorObj.displayName}
            </Link>
          </div>
        )}

        {/* Privacy badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {isPublic ? "🌍 Public" : "🔒 Private"}
          </span>
        </div>

        {/* Owner controls */}
        {isMine && !hideOwnerControls && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleVisibility}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors mr-2"
              title="Toggle visibility"
            >
              {isPublic ? "Make Private" : "Make Public"}
            </button>
          </div>
        )}

        {/* Delete button */}
        {onDelete && !hideOwnerControls && (
          <button
            onClick={() => onDelete(memory._id)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
            title="Delete memory"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Report button */}
        {showReport && !isMine && (
          <button
            onClick={() => setShowReportModal(true)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-red-500 hover:text-red-700"
            title="Report memory"
          >
            🚩
          </button>
        )}

        {/* Content complexity indicator */}
        {memory.contentComplexity > 0 && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
              Complexity: {memory.contentComplexity}
            </div>
          </div>
        )}
      </motion.li>

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