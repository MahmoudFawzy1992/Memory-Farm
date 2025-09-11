// client/src/components/MemoryCard/MemoryCardControls.jsx
import { motion } from "framer-motion";

// Privacy Toggle Button
export const PrivacyToggle = ({ isPublic, onToggle, isLoading }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={isLoading}
    className="text-xs px-2 py-1 rounded-md bg-white shadow-sm border text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
    title={isPublic ? "Make private" : "Make public"}
  >
    {isLoading ? "..." : (isPublic ? "🔒" : "🌍")}
  </button>
);

// Delete Button
export const DeleteButton = ({ onDelete }) => (
  <button
    type="button"
    onClick={onDelete}
    className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm border hover:bg-red-50 transition-colors"
    title="Delete memory"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
);

// Animated Intensity Dots
export const IntensityDots = ({ emotion, intensity, color }) => {
  if (!emotion || !intensity) return null;
  
  const dotCount = Math.ceil(intensity / 2);
  
  return (
    <div className="flex items-center gap-1 ml-2">
      {Array.from({ length: dotCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color || '#8B5CF6' }}
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: index * 0.2 
          }}
        />
      ))}
    </div>
  );
};

// Report Button
export const ReportButton = ({ onReport }) => (
  <button
    type="button"
    onClick={onReport}
    className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
    title="Report memory"
  >
    🚩
  </button>
);

// Owner Controls Container
export const OwnerControls = ({ 
  isOwner, 
  hideOwnerControls, 
  isPublic, 
  onToggleVisibility, 
  onDelete, 
  hasDeleteHandler,
  isToggling 
}) => {
  if (!isOwner || hideOwnerControls) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleVisibility();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
      <PrivacyToggle 
        isPublic={isPublic}
        onToggle={handleToggle}
        isLoading={isToggling}
      />
      {hasDeleteHandler && (
        <DeleteButton onDelete={handleDelete} />
      )}
    </div>
  );
};