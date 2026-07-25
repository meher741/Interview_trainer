import { createContext, useContext, useState, useEffect } from "react";
import { signup as apiSignup, login as apiLogin, logout as apiLogout, getMe, setAccessToken } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await getMe();
      setCurrentUser(data);
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signup = async (email, password) => {
    const data = await apiSignup(email, password);
    setCurrentUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setCurrentUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    refreshUser: checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};