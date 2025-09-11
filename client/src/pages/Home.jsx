import { useMemo, useState } from 'react';
import MemoryCard from '../components/MemoryCard';
import FilterBar from '../components/FilterBar';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PageWrapper from '../components/PageWrapper';
import { useMemories } from '../hooks/useMemories';
import { emotions } from '../constants/emotions';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';

function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [hasUserSelectedMonth, setHasUserSelectedMonth] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);

  const { memories, loading, setMemories } = useMemories();

  const filtered = useMemo(() => {
    let result = memories || [];
    
    // Only apply month filter if user has manually selected a month
    if (hasUserSelectedMonth && selectedMonth) {
      const range = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
      result = result.filter((m) => {
        const when = m.memoryDate ? new Date(m.memoryDate) : (m.createdAt ? new Date(m.createdAt) : null);
        return when && isWithinInterval(when, range);
      });
    }
    
    // Apply emotion filter
    if (selectedEmotion !== 'All') {
      result = result.filter(m => m.emotion?.toLowerCase().includes(selectedEmotion.toLowerCase()));
    }
    
    return result;
  }, [memories, selectedEmotion, selectedMonth, hasUserSelectedMonth]);

  // FIXED: Simplified delete functionality
  const handleDeleteClick = (memoryId) => {
    setSelectedMemoryId(memoryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMemoryId) return;
    
    try {
      await axios.delete(`/memory/${selectedMemoryId}`);
      
      // Update local state to remove deleted memory
      setMemories(prevMemories => prevMemories.filter(m => m._id !== selectedMemoryId));
      
      toast.success("Memory deleted successfully");
      setShowDeleteModal(false);
      setSelectedMemoryId(null);
    } catch (err) {
      console.error('Failed to delete memory:', err);
      toast.error("Failed to delete memory");
    }
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    setHasUserSelectedMonth(true);
  };

  const showAllMemories = () => {
    setHasUserSelectedMonth(false);
    setSelectedMonth(new Date());
  };

  return (
    <PageWrapper>
      <div className="space-y-4">
        <FilterBar
          emotions={emotions}
          selectedEmotion={selectedEmotion}
          onFilter={setSelectedEmotion}
          showMonthPicker
          month={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {hasUserSelectedMonth && (
          <button
            onClick={showAllMemories}
            className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors duration-200"
          >
            ← Show all memories
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading memories...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-2">
              {hasUserSelectedMonth ? "No memories found for this month." : "No memories found."}
            </p>
            <p className="text-gray-400 text-sm">
              {hasUserSelectedMonth ? "Try a different month or create your first memory!" : "Start your memory journey today!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                Showing {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}
                {hasUserSelectedMonth && ` for ${selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <ul className="space-y-4">
              {filtered.map((m) => (
                <MemoryCard 
                  key={m._id} 
                  memory={m} 
                  onDelete={handleDeleteClick} 
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  );
}

export default Home;