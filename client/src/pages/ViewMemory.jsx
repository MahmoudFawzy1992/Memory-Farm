import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import useMemoryViewer from "../hooks/useMemoryViewer";

import LoadingOrError from "../components/LoadingOrError";
import MemoryNotFound from "../components/MemoryNotFound";
import MemoryHeader from "../components/MemoryHeader";
import MemoryDetails from "../components/MemoryDetails";
import MemoryControls from "../components/MemoryControls";
import EditMemoryModal from "../components/EditMemoryModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ReportModal from "../components/ReportModal";

function ViewMemory() {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    memory,
    loading,
    showModal,
    setShowModal,
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
    isOwner,
  } = useMemoryViewer(user);

  return (
    <>
      <LoadingOrError loading={loading} memory={memory} />
      {!loading && !memory && <MemoryNotFound />}

      {!loading && memory && (
        <motion.div
          className={`bg-white shadow-lg rounded-lg p-6 mt-4 max-w-xl mx-auto relative border-t-4 border-${memory.color || "purple-500"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <MemoryHeader memory={memory} user={user} />
          <MemoryDetails memory={memory} />

          {isOwner && (
            <MemoryControls
              isPublic={memory.isPublic}
              onEdit={() => setShowModal(true)}
              onDelete={() => setShowDeleteConfirm(true)}
              onToggleVisibility={handleToggleVisibility}
            />
          )}

          {!isOwner && user && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                🚩 Report Memory
              </button>
            </div>
          )}

          <EditMemoryModal
            show={showModal}
            onClose={() => setShowModal(false)}
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
        </motion.div>
      )}
    </>
  );
}

export default ViewMemory;