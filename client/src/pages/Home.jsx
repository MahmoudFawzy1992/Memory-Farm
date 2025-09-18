import { useState } from 'react';
import MemoryCard from '../components/MemoryCard';
import FilterBar from '../components/FilterBar';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PageWrapper from '../components/PageWrapper';
import { FilterProvider } from '../context/FilterContext';
import { useMemories } from '../hooks/useMemories';
import { useFilteredMemories } from '../hooks/useFilteredMemories';
import { useFilters } from '../hooks/useFilters';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';

/**
 * Home page content with enhanced filtering
 * Separated from provider wrapper for proper hook usage
 */
function HomeContent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);

  // Get memories and filter state
  const { memories, loading, setMemories } = useMemories();
  const { filters } = useFilters('home');
  
  // Apply filters with statistics
  const { 
    filteredMemories, 
    stats, 
    hasResults, 
    isEmpty: noFilteredResults,
    isFiltered 
  } = useFilteredMemories(memories, filters, { 
    sortBy: 'date', 
    sortOrder: 'desc' 
  });

  // Handle memory deletion
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Bar */}
      <FilterBar 
        variant="full"
        showSections={true}
        defaultExpanded={['emotions']}
      />

      {/* Results summary */}
      {isFiltered && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>
                  Showing <strong className="text-purple-600">{stats.filtered}</strong> of{' '}
                  <strong>{stats.total}</strong> memories
                </span>
                {stats.percentage < 100 && (
                  <span className="text-gray-400">
                    ({stats.percentage}% visible)
                  </span>
                )}
              </div>
            </div>
            
            {stats.hidden > 0 && (
              <div className="text-xs text-gray-500">
                {stats.hidden} memories hidden by filters
              </div>
            )}
          </div>
        </div>
      )}

      {/* Memory list or empty states */}
      {!hasResults && stats.total === 0 ? (
        /* No memories at all */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg mb-2">No memories found.</p>
          <p className="text-gray-400 text-sm">Start your memory journey today!</p>
        </div>
      ) : noFilteredResults ? (
        /* No results after filtering */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg mb-2">No memories match your filters.</p>
          <p className="text-gray-400 text-sm mb-4">
            Try adjusting your filters to see more results.
          </p>
          <FilterBar variant="chips-only" />
        </div>
      ) : (
        /* Display filtered memories */
        <>
          <ul className="space-y-4">
            {filteredMemories.map((memory) => (
              <MemoryCard 
                key={memory._id} 
                memory={memory} 
                onDelete={handleDeleteClick} 
              />
            ))}
          </ul>

          {/* Results footer */}
          <div className="text-center py-6 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {isFiltered ? (
                <>
                  Showing {filteredMemories.length} filtered result{filteredMemories.length !== 1 ? 's' : ''}
                  {stats.hidden > 0 && (
                    <span className="block mt-1">
                      {stats.hidden} more memories available - adjust filters to see them
                    </span>
                  )}
                </>
              ) : (
                <>All {filteredMemories.length} memories displayed</>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/**
 * Main Home component wrapped with FilterProvider
 * Uses 'home' page type with default "show all" behavior
 */
function Home() {
  return (
    <PageWrapper>
      <FilterProvider pageType="home">
        <HomeContent />
      </FilterProvider>
    </PageWrapper>
  );
}

export default Home;