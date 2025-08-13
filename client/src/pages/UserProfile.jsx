import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../components/ReportModal";
import UserHeader from "../components/UserHeader";
import FollowStats from "../components/FollowStats";
import UserMemoryGrid from "../components/UserMemoryGrid";

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [showReportModal, setShowReportModal] = useState(false);

  const isMe = user?._id === id;
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ Only fetch user profile, not memories (UserMemoryGrid will handle that)
        const res = await axios.get(`/user/${id}`);

        setProfile(res.data.user || {});

        if (user?._id && res.data.user?.followers?.includes(user._id)) {
          setIsFollowing(true);
        }

        setIsPrivate(res.data.user?.isPrivate && !isMe);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        
        // Better error handling based on status
        if (err.response?.status === 404) {
          setProfile({ displayName: "User Not Found", isPrivate: true });
          setIsPrivate(true);
        } else if (err.response?.status === 403) {
          setProfile({ displayName: "Private User", isPrivate: true });
          setIsPrivate(true);
        } else {
          // Network or other errors
          toast.error("Failed to load profile. Please try again.");
          setProfile({ displayName: "Error Loading Profile", isPrivate: true });
          setIsPrivate(true);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowStats = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          axios.get(`/user/${id}/followers`),
          axios.get(`/user/${id}/following`)
        ]);
        setFollowStats({
          followers: followersRes.data.followers.length,
          following: followingRes.data.following.length,
        });
      } catch (err) {
        console.error("Failed to fetch follow stats:", err);
        setFollowStats({ followers: 0, following: 0 });
      }
    };

    // Only fetch if we have a valid id
    if (id) {
      fetchProfile();
      fetchFollowStats();
    }
  }, [id, user?._id, isMe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <UserHeader
        profile={profile}
        isFollowing={isFollowing}
        setIsFollowing={setIsFollowing}
        followStats={followStats}
        setFollowStats={setFollowStats}
        onReport={() => setShowReportModal(true)}
        hideActions={isPrivate}
      />

      {!isPrivate && (
        <>
          <FollowStats showFollowList={profile.showFollowList} followStats={followStats} />
          {/* ✅ Pass userId instead of memories array */}
          <UserMemoryGrid userId={id} />
        </>
      )}

      {isPrivate && !isMe && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Private Account</h2>
          <p className="text-gray-600">This account is private. You must follow them to view their profile.</p>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId={id}
      />
    </div>
  );
}