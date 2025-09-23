import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function useSimpleInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch user's dashboard insights
  const fetchInsights = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.unreadOnly) params.append('unreadOnly', 'true');

      const response = await axios.get(`/insights/dashboard?${params}`);
      
      setInsights(response.data.insights || []);
      return response.data;
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err.response?.data?.error || 'Failed to load insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch insight statistics
  const fetchInsightStats = useCallback(async () => {
    try {
      const response = await axios.get('/insights/stats');
      setStats(response.data.stats);
      return response.data;
    } catch (err) {
      console.error('Error fetching insight stats:', err);
      return null;
    }
  }, []);

  // Trigger insight generation after memory creation
  const triggerInsightGeneration = useCallback(async (memoryId) => {
    try {
      const response = await axios.post('/insights/generate', { memoryId });
      
      if (response.data.shouldNotify && response.data.insight) {
        // Refresh insights list
        await fetchInsights();
        return response.data.insight;
      }
      
      return null;
    } catch (err) {
      console.error('Error generating insight:', err);
      // Don't show error to user - insight generation is optional
      return null;
    }
  }, [fetchInsights]);

  // Mark insight as read
  const markAsRead = useCallback(async (insightId) => {
    try {
      const response = await axios.patch(`/insights/${insightId}/read`);
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight._id === insightId 
          ? { ...insight, isRead: true, readAt: new Date() }
          : insight
      ));
      
      return response.data.insight;
    } catch (err) {
      console.error('Error marking insight as read:', err);
      toast.error('Failed to mark insight as read');
      return null;
    }
  }, []);

  // Toggle insight favorite status
  const toggleFavorite = useCallback(async (insightId) => {
    try {
      const response = await axios.patch(`/insights/${insightId}/favorite`);
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight._id === insightId 
          ? { ...insight, isFavorited: response.data.isFavorited }
          : insight
      ));
      
      toast.success(
        response.data.isFavorited 
          ? 'Insight added to favorites' 
          : 'Insight removed from favorites'
      );
      
      return response.data.insight;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorite status');
      return null;
    }
  }, []);

  // Get insights by category
  const getInsightsByCategory = useCallback((category) => {
    return insights.filter(insight => insight.category === category);
  }, [insights]);

  // Get insights by type
  const getInsightsByType = useCallback((type) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  // Get unread insights count
  const getUnreadCount = useCallback(() => {
    return insights.filter(insight => !insight.isRead).length;
  }, [insights]);

  // Get favorite insights
  const getFavoriteInsights = useCallback(() => {
    return insights.filter(insight => insight.isFavorited);
  }, [insights]);

  // Get recent insights (last 7 days)
  const getRecentInsights = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return insights.filter(insight => 
      new Date(insight.createdAt) >= sevenDaysAgo
    );
  }, [insights]);

  // Load insights on hook initialization
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    // Data
    insights,
    stats,
    loading,
    error,
    
    // Actions
    fetchInsights,
    fetchInsightStats,
    triggerInsightGeneration,
    markAsRead,
    toggleFavorite,
    
    // Computed values
    getInsightsByCategory,
    getInsightsByType,
    getUnreadCount,
    getFavoriteInsights,
    getRecentInsights,
    
    // Quick access to common data
    unreadCount: getUnreadCount(),
    favoriteInsights: getFavoriteInsights(),
    recentInsights: getRecentInsights()
  };
}

// Separate hook for onboarding status - FIXED VERSION
export function useOnboardingStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchStatus = useCallback(async () => {
    // Don't fetch if already initialized to prevent loops
    if (initialized) return status;
    
    try {
      setLoading(true);
      
      // Check if we have authentication before making the request
      if (!document.cookie.includes('token')) {
        setStatus(null);
        setInitialized(true);
        return null;
      }
      
      const response = await axios.get('/insights/onboarding/status');
      setStatus(response.data);
      setInitialized(true);
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        // User is not authenticated, this is expected
        setStatus(null);
        setInitialized(true);
        return null;
      }
      console.error('Error fetching onboarding status:', err);
      setInitialized(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [initialized, status]);

  const completeStep = useCallback(async (stepName) => {
    try {
      const response = await axios.post('/insights/onboarding/step', { stepName });
      
      // Update local state immediately
      setStatus(prev => ({
        ...prev,
        onboardingStatus: response.data.onboardingStatus,
        // Update tutorial flags when tutorial is completed
        shouldShowTutorial: stepName === 'tutorial_completed' ? false : prev?.shouldShowTutorial
      }));
      
      return response.data;
    } catch (err) {
      console.error('Error completing onboarding step:', err);
      return null;
    }
  }, []);

  const skipOnboarding = useCallback(async (skipType = 'tutorial') => {
    try {
      const response = await axios.post('/insights/onboarding/skip', { skipType });
      
      // Update local state immediately
      setStatus(prev => ({
        ...prev,
        onboardingStatus: response.data.onboardingStatus,
        shouldShowWelcome: false,
        shouldShowTutorial: false
      }));
      
      return response.data;
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      return null;
    }
  }, []);

  const markWelcomeShown = useCallback(async () => {
    try {
      const response = await axios.post('/insights/onboarding/welcome');
      
      // Update local state immediately
      setStatus(prev => ({
        ...prev,
        shouldShowWelcome: false,
        onboardingStatus: response.data.onboardingStatus
      }));
      
      return response.data;
    } catch (err) {
      console.error('Error marking welcome shown:', err);
      return null;
    }
  }, []);

  // Only fetch once when hook is first used
  useEffect(() => {
    if (!initialized && !loading) {
      fetchStatus();
    }
  }, [initialized, loading, fetchStatus]);

  return {
    status,
    loading,
    fetchStatus,
    completeStep,
    skipOnboarding,
    markWelcomeShown,
    shouldShowWelcome: status?.shouldShowWelcome || false,
    shouldShowTutorial: status?.shouldShowTutorial || false,
    isOnboardingComplete: status?.onboardingStatus?.isCompleted || false
  };
}