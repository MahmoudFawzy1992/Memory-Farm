// Home.jsx
import { useState } from 'react'
import MemoryCard from '../components/MemoryCard'
import FilterBar from '../components/FilterBar'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import PageWrapper from '../components/PageWrapper'
import { useMemories } from '../hooks/useMemories'
import { useDeleteMemory } from '../hooks/useDeleteMemory'
import { handleFilter } from '../utils/filterHelpers'
import { emotions } from '../constants/emotions'

function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState('All')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMemoryId, setSelectedMemoryId] = useState(null)

  const {
    memories,
    filtered,
    loading,
    setMemories,
    setFiltered
  } = useMemories()

  const confirmDelete = useDeleteMemory({
    selectedMemoryId,
    memories,
    setMemories,
    selectedEmotion,
    setFiltered,
    setShowDeleteModal
  })

  const handleDeleteClick = (id) => {
    setSelectedMemoryId(id)
    setShowDeleteModal(true)
  }

  const handleEmotionFilter = (label) => {
    setSelectedEmotion(label)
    handleFilter(label, memories, setFiltered)
  }

  return (
    <PageWrapper>
      <FilterBar
        emotions={emotions}
        selectedEmotion={selectedEmotion}
        onFilter={handleEmotionFilter}
      />

      {loading ? (
        <p className="text-gray-500">Loading memories...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No memories found.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {filtered.map((m) => (
            <MemoryCard key={m._id} memory={m} onDelete={handleDeleteClick} />
          ))}
        </ul>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  )
}

export default Home
