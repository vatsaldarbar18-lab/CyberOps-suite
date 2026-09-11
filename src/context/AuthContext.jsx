import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginAccount, logoutAccount, registerAccount } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCurrentUser();
      setUser(response.user || null);
    } catch (refreshError) {
      setUser(null);
      setError(refreshError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const response = await loginAccount(credentials);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload) => {
    const response = await registerAccount(payload);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    await logoutAccount();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
  }), [error, loading, refreshUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
