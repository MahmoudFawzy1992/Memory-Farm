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

  const colorClass = memory.color
    ? `border-t-4 border-${memory.color}`
    : "border-t-4 border-purple-500";

  // Author shape can be memory.author or memory.userId depending on endpoint
  const authorObj = memory.author || memory.userId || null;
  const myId = user?._id || user?.id;
  const authorId = authorObj?._id || authorObj?.id;
  const showAuthor =
    authorObj && authorObj.displayName && authorId && (!myId || authorId !== myId);
  const isMine = Boolean(myId && authorId && myId === authorId);

  // Truncate text if truncateLength is specified
  const displayText = useMemo(() => {
    if (!truncateLength || !memory.text) return memory.text;
    const words = memory.text.split(' ');
    if (words.length <= truncateLength) return memory.text;
    return words.slice(0, truncateLength).join(' ') + '...';
  }, [memory.text, truncateLength]);

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

  return (
    <>
      <motion.li
        className={`p-4 bg-white rounded-lg shadow hover:shadow-lg transition relative list-none ${colorClass}`}
        whileHover={{ scale: 1.02 }}
      >
        <Link to={`/memory/${memory._id}`}>
          <p className="text-lg font-medium text-gray-700 line-clamp-3">{displayText}</p>
          <p className={`text-sm mt-1 italic text-${memory.color || "purple-500"}`}>
            {memory.emotion}
          </p>
        </Link>

        {/* Memory date chip */}
        {displayDate && (
          <div className="mt-1 text-xs text-gray-500">{displayDate}</div>
        )}

        {showAuthor && (
          <div className="mt-2 text-sm text-gray-500">
            👤{" "}
            <Link to={`/user/${authorId}`} className="font-medium text-purple-700 hover:underline">
              {authorObj.displayName}
            </Link>
          </div>
        )}

        <span
          className={`absolute bottom-9 right-2 text-xs font-semibold ${
            isPublic ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {isPublic ? "🌍 Public" : "🔒 Private"}
        </span>

        {isMine && !hideOwnerControls && (
          <button
            onClick={handleToggleVisibility}
            className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
            title="Toggle visibility"
          >
            ✏️
          </button>
        )}

        {onDelete && !hideOwnerControls && (
          <button
            onClick={() => onDelete(memory._id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            title="Delete"
          >
            🗑️
          </button>
        )}

        {showReport && !isMine && (
          <button
            onClick={() => setShowReportModal(true)}
            className="absolute bottom-2 right-2 text-sm text-red-500 hover:underline"
            title="Report memory"
          >
            🚩 Report
          </button>
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