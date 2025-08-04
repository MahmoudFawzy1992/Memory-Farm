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

function ViewMemory() {
  const { user } = useAuth();

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
          />

          <ConfirmDeleteModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
          />
        </motion.div>
      )}
    </>
  );
}

export default ViewMemory;
