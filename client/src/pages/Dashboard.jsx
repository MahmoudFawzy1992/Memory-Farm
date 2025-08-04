import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import MemoryCard from "../components/MemoryCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

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

    const fetchMemories = async () => {
      try {
        const res = await axios.get("/memory");
        setMemories(res.data);
      } catch (err) {
        console.error("Failed to load memories:", err);
      }
    };

    const fetchFollowStats = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          axios.get(`/user/${user._id}/followers`),
          axios.get(`/user/${user._id}/following`)
        ]);

        setFollowStats({
          followers: followersRes.data.followers.length,
          following: followingRes.data.following.length,
        });
      } catch (err) {
        console.error("Failed to load follow stats:", err);
        setFollowStats({ followers: 0, following: 0 });
      }
    };

    if (user?._id) {
      fetchProfile();
      fetchMemories();
      fetchFollowStats();
    }
  }, [user]);

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
          <span className="italic text-gray-400">
            No followers or following yet.
          </span>
        ) : (
          <>
            <span>👥 {followStats.followers} follower{followStats.followers !== 1 ? "s" : ""}</span>
            <span>➡️ following {followStats.following}</span>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">🧠 Your Memories</h2>
      {memories.length === 0 ? (
        <p className="text-gray-500">No memories yet.</p>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard key={memory._id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}
