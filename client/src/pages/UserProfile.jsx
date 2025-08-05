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
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [showReportModal, setShowReportModal] = useState(false);

  const isMe = user?._id === id;
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/user/${id}`);

        setProfile(res.data.user || {});
        setMemories(res.data.memories || []);

        if (user?._id && res.data.user?.followers?.includes(user._id)) {
          setIsFollowing(true);
        }

        setIsPrivate(res.data.user?.isPrivate && !isMe);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        setProfile({ displayName: "Private User", isPrivate: true });
        setIsPrivate(true);
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
      } catch {
        setFollowStats({ followers: 0, following: 0 });
      }
    };

    fetchProfile();
    fetchFollowStats();
  }, [id, user?._id]);

  const handleFollowToggle = async () => {
    try {
      if (!user?._id) return toast.error("Please log in first.");
      if (user._id === id) return toast.error("You can't follow yourself.");

      if (isFollowing) {
        await axios.post(`/user/unfollow/${id}`);
        toast.success("Unfollowed");
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await axios.post(`/user/follow/${id}`);
        toast.success("Followed");
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return <p className="text-center py-10 text-purple-500">🔄 Loading profile...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <UserHeader
        profile={profile}
        isMe={isMe}
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
          <UserMemoryGrid memories={memories} />
        </>
      )}

      {isPrivate && !isMe && (
        <div className="text-center py-6 text-gray-600 italic">
          This account is private. You must follow them to view their profile.
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
