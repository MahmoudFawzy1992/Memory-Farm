import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import useMemoryViewer from "../hooks/useMemoryViewer";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";

import LoadingOrError from "../components/LoadingOrError";
import MemoryNotFound from "../components/MemoryNotFound";
import MemoryHeader from "../components/MemoryHeader";
import MemoryDetails from "../components/MemoryDetails";
import MemoryControls from "../components/MemoryControls";
import MemorySidebar from "../components/MemorySidebar";
import EditMemoryModal from "../components/EditMemoryModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ReportModal from "../components/ReportModal";

export default function ViewMemory() {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    memory,
    memoryMetadata,
    authorInfo,
    loading,
    error,
    showEditModal,
    setShowEditModal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    editedColor,
    setEditedColor,
    editedText,
    setEditedText,
    editedEmotionText,
    setEditedEmotionText,
    editedEmoji,
    setEditedEmoji,
    editedMemoryDate,
    setEditedMemoryDate,
    showPicker,
    setShowPicker,
    handleDelete,
    handleUpdate,
    handleToggleVisibility,
    goBack,
    isOwner
  } = useMemoryViewer(user);

  // Handle todo item updates
  const handleBlockUpdate = async (updatedBlock) => {
    if (!memory || !isOwner) return;

    try {
      // Update the content array with the updated block
      const updatedContent = memory.content.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      );

      // Update backend immediately
      await axios.put(`/memory/${memory._id}`, {
        content: updatedContent
      });

      toast.success("Todo updated!");
      
      // Refresh the page to get updated stats
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error("Failed to update todo");
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  // Show loading/error states
  if (loading) {
    return <LoadingOrError loading={true} />;
  }

  if (error || !memory) {
    return <MemoryNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile floating info button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden z-30 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              style={{ 
                borderTop: `4px solid ${memory.color || '#8B5CF6'}`
              }}
            >
              <div className="p-6 lg:p-8">
                {/* Memory header */}
                <MemoryHeader
                  memory={memory}
                  memoryMetadata={memoryMetadata}
                  authorInfo={authorInfo}
                  onGoBack={goBack}
                />

                {/* Memory content */}
                <MemoryDetails
                  memory={memory}
                  memoryMetadata={memoryMetadata}
                  onBlockUpdate={handleBlockUpdate}
                />

                {/* Memory controls */}
                <MemoryControls
                  isOwner={isOwner}
                  isPublic={memory.isPublic}
                  onEdit={() => setShowEditModal(true)}
                  onDelete={() => setShowDeleteConfirm(true)}
                  onToggleVisibility={handleToggleVisibility}
                  onReport={handleReport}
                  showReportButton={!isOwner && user}
                />
              </div>
            </motion.div>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <MemorySidebar
              memory={memory}
              memoryMetadata={memoryMetadata}
              isOwner={isOwner}
              isMobile={false}
            />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <MemorySidebar
        memory={memory}
        memoryMetadata={memoryMetadata}
        isOwner={isOwner}
        isMobile={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Modals */}
      <EditMemoryModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdate}
        editedText={editedText}
        setEditedText={setEditedText}
        editedEmoji={editedEmoji}
        setEditedEmoji={setEditedEmoji}
        editedEmotionText={editedEmotionText}
        setEditedEmotionText={setEditedEmotionText}
        showPicker={showPicker}
        setShowPicker={setShowPicker}
        editedColor={editedColor}
        setEditedColor={setEditedColor}
        editedMemoryDate={editedMemoryDate}
        setEditedMemoryDate={setEditedMemoryDate}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="memory"
        targetId={memory?._id}
      />
    </div>
  );
}