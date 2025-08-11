// Home.jsx
import { useEffect, useMemo, useState } from 'react';
import MemoryCard from '../components/MemoryCard';
import FilterBar from '../components/FilterBar';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PageWrapper from '../components/PageWrapper';
import { useMemories } from '../hooks/useMemories';
import { useDeleteMemory } from '../hooks/useDeleteMemory';
import { emotions } from '../constants/emotions';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);

  const { memories, loading } = useMemories();

  const filtered = useMemo(() => {
    const range = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
    return (memories || []).filter((m) => {
      const when = m.memoryDate ? new Date(m.memoryDate) : (m.createdAt ? new Date(m.createdAt) : null);
      if (!when || !isWithinInterval(when, range)) return false;
      if (selectedEmotion === 'All') return true;
      return m.emotion?.toLowerCase().includes(selectedEmotion.toLowerCase());
    });
  }, [memories, selectedEmotion, selectedMonth]);

  const confirmDelete = useDeleteMemory({
    selectedMemoryId,
    memories,
    setMemories: () => {}, // not used when filtering via useMemo
    selectedEmotion,
    setFiltered: () => {},
    setShowDeleteModal,
  });

  const handleDeleteClick = (id) => {
    setSelectedMemoryId(id);
    setShowDeleteModal(true);
  };

  return (
    <PageWrapper>
      <FilterBar
        emotions={emotions}
        selectedEmotion={selectedEmotion}
        onFilter={setSelectedEmotion}
        showMonthPicker
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
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
  );
}

export default Home;
