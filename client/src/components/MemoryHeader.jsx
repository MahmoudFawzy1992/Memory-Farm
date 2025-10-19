import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { generateUserSlug } from "../utils/memorySlug";


export default function MemoryHeader({ memory, memoryMetadata, authorInfo, onGoBack }) {
  if (!memory) return null;

  const { title, displayDate, emotion } = memoryMetadata || {};
  const { shouldShowAuthor, author, authorName } = authorInfo || {};

  return (
    <div className="memory-header mb-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Privacy indicator */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          memory.isPublic 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-600"
        }`}>
          <span className="mr-1.5">
            {memory.isPublic ? "🌍" : "🔒"}
          </span>
          {memory.isPublic ? "Public" : "Private"}
        </div>
      </div>

      {/* Memory title and metadata */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {title || "Untitled Memory"}
        </h1>

        {/* Emotion display */}
        {emotion && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">{emotion.emoji}</span>
            <span 
              className="text-lg font-medium"
              style={{ color: emotion.color }}
            >
              {emotion.emotionText}
            </span>
            {emotion.intensity && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(emotion.intensity / 2) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: emotion.color, opacity: 0.8 }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Date and author info */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          {displayDate && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{displayDate}</span>
            </div>
          )}

          {shouldShowAuthor && author && (
            <>
              <span className="text-gray-400">•</span>
              <Link
                to={`/user/${generateUserSlug(author.displayName, author._id || author.id)}`}
                className="flex items-center gap-1 font-medium text-purple-600 hover:text-purple-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{authorName}</span>
              </Link>
            </>
          )}
        </div>
      </motion.div>

      {/* Additional memory info - REMOVED: Don't show emotion note here */}
      
      {/* Color accent line */}
      <div 
        className="h-1 w-24 mx-auto rounded-full mb-8"
        style={{ backgroundColor: memory.color || '#8B5CF6' }}
      />
    </div>
  );
}