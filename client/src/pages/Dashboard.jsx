import { useEffect, useState, useMemo } from "react";
import axios from "../utils/axiosInstance";
import MemoryCard from "../components/MemoryCard";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import usePaginatedFetcher from "../hooks/usePaginatedFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  
  // Local items state for deletion management
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/me");
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowStats = async () => {
      try {
        if (!user?._id) return;
        const [followersRes, followingRes] = await Promise.all([
          axios.get(`/user/${user._id}/followers`),
          axios.get(`/user/${user._id}/following`),
        ]);
        setFollowStats({
          followers: followersRes.data.followers.length,
          following: followingRes.data.following.length,
        });
      } catch {
        setFollowStats({ followers: 0, following: 0 });
      }
    };

    fetchProfile();
    fetchFollowStats();
  }, [user]);

  // Paginated "my memories"
  const buildUrl = useMemo(
    () => (cursor) =>
      `/memory/paginated${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    []
  );
  
  const { 
    items, 
    hasMore, 
    loading: loadingMore, 
    error, 
    loadMore
  } = usePaginatedFetcher(buildUrl, {
    pageSize: 12,
  });

  // Update local items when fetcher items change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);
  
  const sentinelRef = useInfiniteScroll(loadMore, { disabled: !hasMore || loadingMore });

  // Delete functionality
  const handleDeleteClick = (memoryId) => {
    setSelectedMemoryId(memoryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMemoryId) return;
    
    try {
      await axios.delete(`/memory/${selectedMemoryId}`);
      
      // Update local state to remove deleted memory
      setLocalItems(prevItems => prevItems.filter(m => m._id !== selectedMemoryId));
      
      toast.success("Memory deleted successfully");
      setShowDeleteModal(false);
      setSelectedMemoryId(null);
    } catch (err) {
      console.error('Failed to delete memory:', err);
      toast.error("Failed to delete memory");
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-purple-700">Loading profile...</p>;
  }

  if (!userData) {
    return <p className="text-center mt-10 text-red-600">User not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-purple-800 mb-4">
        👤 {userData.displayName}'s Profile
      </h1>
      {userData.bio && <p className="text-gray-600 mb-1">{userData.bio}</p>}
      {userData.location && (
        <p className="text-sm text-gray-500 mb-2">📍 {userData.location}</p>
      )}

      <div className="flex gap-6 mb-4 text-sm text-gray-600">
        {followStats.followers === 0 && followStats.following === 0 ? (
          <span className="italic text-gray-400">No followers or following yet.</span>
        ) : (
          <>
            <span>👥 {followStats.followers} follower{followStats.followers !== 1 ? "s" : ""}</span>
            <span>➡️ following {followStats.following}</span>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">🧠 Your Memories</h2>

      {error && <p className="text-sm text-red-600 mb-2">Failed to load memories.</p>}

      {localItems.length === 0 && !loadingMore ? (
        <p className="text-gray-500">No memories yet.</p>
      ) : (
        <>
          <div className="space-y-4">
            {localItems.map((memory) => (
              <MemoryCard 
                key={memory._id} 
                memory={memory} 
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          <div className="flex justify-center my-4">
            {hasMore ? (
              <>
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
                <div ref={sentinelRef} aria-hidden className="h-1 w-1" />
              </>
            ) : (
              <span className="text-xs text-gray-400">No more results</span>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}