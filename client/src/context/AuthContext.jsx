import { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const AuthContext = createContext();

// Simple token management for the minimal version
const TOKEN_KEY = 'mf_auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on app load
  const fetchUser = async () => {
    // Skip request if no token exists (optimization)
    const hasToken = document.cookie.includes('token=') || localStorage.getItem(TOKEN_KEY);
    if (!hasToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
      
      // Store user data for cross-tab sync (non-sensitive data only)
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
      
      // Clear token if auth fails (token might be expired)
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      
      // Don't log 401 errors as they're expected when not logged in
      if (error.response?.status !== 401) {
        console.warn("Failed to fetch user:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Sync user from localStorage when another tab updates (cross-tab sync)
  useEffect(() => {
    const syncUserFromStorage = (event) => {
      if (event.storageArea === localStorage && event.key === "user") {
        const localUser = event.newValue;
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setUser(parsed);
          } catch {
            console.error("Failed to parse user from localStorage");
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", syncUserFromStorage);
    return () => window.removeEventListener("storage", syncUserFromStorage);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      
      // Token is automatically stored by axios interceptor
      // Fetch user data after successful login
      await fetchUser();
      
      return response.data;
    } catch (err) {
      // Handle specific login errors
      if (err?.response?.status === 403) {
        throw new Error("Please verify your email before logging in.");
      }
      
      // Use server error message or fallback
      const message = err?.response?.data?.error || "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      const response = await axios.post("/auth/signup", { email, password, displayName });
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.error || "Signup failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      // Token cleanup is handled by axios interceptor
    } catch (error) {
      // Even if logout request fails, clear local state
      console.warn("Logout request failed, but clearing local state:", error.message);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem(TOKEN_KEY); // Clear token
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await axios.put("/user/update", updates);
      
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete("/user/delete");
    } catch (error) {
      throw error;
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);