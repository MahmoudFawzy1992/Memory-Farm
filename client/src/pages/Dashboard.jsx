import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import useSimpleInsights from "../hooks/useSimpleInsights";
import InsightCard from "../components/insights/InsightCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [memoryCount, setMemoryCount] = useState(0);

  // Use insights hook with regenerate function
  const {
    insights,
    stats: insightStats,
    loading: insightsLoading,
    markAsRead,
    regenerateInsight, // ✅ Added regenerate function
    unreadCount
  } = useSimpleInsights();

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

    const fetchMemoryCount = async () => {
      try {
        const res = await axios.get("/memory");
        setMemoryCount(res.data.length);
      } catch (err) {
        console.error("Failed to load memory count:", err);
      }
    };

    fetchProfile();
    fetchFollowStats();
    fetchMemoryCount();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <p className="text-center mt-10 text-red-600">User not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                👤 Welcome back, {userData.displayName}!
              </h1>
              {userData.bio && (
                <p className="text-gray-600 mb-3">{userData.bio}</p>
              )}
              {userData.location && (
                <p className="text-sm text-gray-500 mb-3">📍 {userData.location}</p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-medium">{memoryCount}</span>
                  <span>memories created</span>
                </div>
                {(followStats.followers >= 0 || followStats.following >= 0) && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 font-medium">{followStats.followers}</span>
                      <span>follower{followStats.followers !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 font-medium">{followStats.following}</span>
                      <span>following</span>
                    </div>
                  </>
                )}
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-medium">{unreadCount}</span>
                    <span>new insights</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 ml-6">
              <Link
                to="/new"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                ✨ New Memory
              </Link>
              <Link
                to="/mood-tracker"
                className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                📊 Mood Tracker
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              💡 Your Insights
              {unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Discover patterns and celebrate your memory journey
            </p>
          </div>

          {insights.length > 3 && (
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              View all →
            </button>
          )}
        </div>

        {insightsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <EmptyInsightsState memoryCount={memoryCount} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 6).map((insight, index) => (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <InsightCard
                  insight={insight}
                  onMarkAsRead={markAsRead}
                  onRegenerate={
                    // ✅ Only pass regenerate function if user has monthly regenerations left
                    userData?.aiUsageTracking?.monthlyRegenerations?.count < 3 
                      ? regenerateInsight 
                      : null
                  }
                  compact={true}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Stats - Removed Favorites */}
      {insightStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Your Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              icon="🎯"
              label="Total Insights"
              value={insightStats.totalInsights}
              color="purple"
            />
            <StatCard
              icon="🧠"
              label="Total Memories"
              value={insightStats.totalMemories}
              color="blue"
            />
            <StatCard
              icon="🔔"
              label="Unread"
              value={insightStats.unreadCount}
              color="orange"
            />

            {/* Optional: Show monthly regeneration stats */}
            {userData?.aiUsageTracking?.monthlyRegenerations && (
              <StatCard
                icon="🔄"
                label="Regenerations Left"
                value={`${Math.max(0, 3 - (userData.aiUsageTracking.monthlyRegenerations.count || 0))}/3`}
                color="purple"
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Empty state component
function EmptyInsightsState({ memoryCount }) {
  const getEmptyMessage = () => {
    if (memoryCount === 0) {
      return {
        title: "Ready to discover your patterns?",
        message: "Create your first memory to start receiving personalized insights about your emotional journey!",
        action: "Create First Memory",
        link: "/new"
      };
    } else if (memoryCount < 5) {
      return {
        title: "Keep going! Insights coming soon...",
        message: `You have ${memoryCount} memor${memoryCount === 1 ? 'y' : 'ies'}. Create ${5 - memoryCount} more to unlock your first insight!`,
        action: "Add Another Memory",
        link: "/new"
      };
    } else {
      return {
        title: "Insights are processing...",
        message: "Your insights should appear soon. Try refreshing the page or create another memory to trigger new discoveries!",
        action: "Create New Memory",
        link: "/new"
      };
    }
  };

  const emptyState = getEmptyMessage();

  return (
    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-6xl mb-4">🌱</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{emptyState.message}</p>
      <Link
        to={emptyState.link}
        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        <span>✨</span>
        {emptyState.action}
      </Link>
    </div>
  );
}

// Stat card component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}