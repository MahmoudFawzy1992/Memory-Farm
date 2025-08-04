import { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user on app load (if token cookie exists)
  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      await axios.post("/auth/login", { email, password });
      await fetchUser();
    } catch (err) {
      if (err?.response?.status === 403) {
        throw new Error("Please verify your email before logging in.");
      }
      throw err;
    }
  };

  const signup = async (email, password, displayName) => {
    await axios.post("/auth/signup", { email, password, displayName });
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await axios.put("/user/update", updates);
    setUser(res.data); // 🟢 update local state
    return res.data;   // ⬅️ allow caller to handle success
  };

  const deleteAccount = async () => {
    await axios.delete("/user/delete");
    setUser(null);
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
        refreshUser: fetchUser, // 🔁 Optional if you want to manually refresh later
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
