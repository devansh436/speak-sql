import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
} from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData.user);
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Clear table cache before login
      localStorage.removeItem("library_tables_cache");

      const response = await apiLogin(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.error || "Login failed",
      };
    }
  };

  const register = async (username, email, password, role = "USER") => {
    try {
      const response = await apiRegister(username, email, password, role);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    // Clear table cache on logout
    localStorage.removeItem("library_tables_cache");
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
