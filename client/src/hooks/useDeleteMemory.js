// src/hooks/useDeleteMemory.js
import axios from '../utils/axiosInstance'

export function useDeleteMemory({
  selectedMemoryId,
  memories,
  setMemories,
  selectedEmotion,
  setFiltered,
  setShowDeleteModal
}) {
  const confirmDelete = async () => {
    try {
      await axios.delete(`/memory/${selectedMemoryId}`)
      const updated = memories.filter(m => m._id !== selectedMemoryId)
      setMemories(updated)

      if (setFiltered) {
        const label = selectedEmotion
        if (!label || label === 'All') {
          setFiltered(updated)
        } else {
          setFiltered(
            updated.filter((m) => {
              const clean = (m.emotion || '').replace(/^\p{Emoji}+/u, '').trim()
              return clean === label
            })
          )
        }
      }

      setShowDeleteModal(false)
    } catch (err) {
      console.error('Failed to delete memory:', err)
    }
  }

  return confirmDelete
}
