import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "../utils/axiosInstance";
import { useState } from "react";
import UnfollowConfirmModal from "./UnfollowConfirmModal";

export default function UserHeader({
  profile,
  isFollowing,
  setIsFollowing,
  followStats,
  setFollowStats,
  onReport,
}) {
  const { user } = useAuth();
  const isMe = user?._id === profile._id;
  const [loading, setLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);


  const handleFollowToggle = async () => {
  if (!user?._id) return toast.error("Please log in first.");
  if (isMe) return toast.error("You can't follow yourself.");

  try {
    setLoading(true);

    if (isFollowing) {
      const res = await axios.post(`/user/unfollow/${profile._id}`);
      if (res.status === 200) {
        toast.success("Unfollowed");
        setIsFollowing(false);
        setFollowStats((prev) => ({
          ...prev,
          followers: Math.max(0, prev.followers - 1),
        }));
      }
    } else {
      const res = await axios.post(`/user/follow/${profile._id}`);
      if (res.status === 200) {
        toast.success("Followed");
        setIsFollowing(true);
        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers + 1,
        }));
      }
    }
  } catch (err) {
    console.error("Follow error:", err);
    toast.error(err?.response?.data?.error || "Failed to update follow status");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {/* 🖼️ Placeholder Avatar */}
        <img
          src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile.displayName}`}
          alt="Profile"
          className="w-14 h-14 rounded-full border border-gray-300"
        />
        <div>
          <h1 className="text-3xl font-bold text-purple-700">{profile.displayName}</h1>
          {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
          {profile.location && (
            <p className="text-sm text-gray-500 mt-1">📍 {profile.location}</p>
          )}
        </div>
      </div>

      {!isMe && user && (
        <div className="flex gap-2">
          <button
              onClick={() =>
                isFollowing ? setShowUnfollowModal(true) : handleFollowToggle()
              }
              className={`px-4 py-2 rounded ${
                isFollowing
                  ? "bg-gray-300 text-gray-700"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
              disabled={loading}
            >
              {isFollowing ? "Unfollow" : "Follow"}
          </button>


          <button
            onClick={onReport}
            className="px-4 py-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
          >
            🚩 Report
          </button>
        </div>
      )}
          {showUnfollowModal && (
      <UnfollowConfirmModal
        onCancel={() => setShowUnfollowModal(false)}
        onConfirm={async () => {
          setShowUnfollowModal(false);
          await handleFollowToggle();
        }}
      />
    )}

    </div>
  );
}
