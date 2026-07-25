import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { getCurrentUser, syncCurrentUser } from "../services/api";

const googleProvider = new GoogleAuthProvider();

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await syncCurrentUser().catch((syncError) => {
          console.warn("Mongo user sync failed during auth bootstrap:", syncError);
        });

        const userData = await getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.warn("Failed to load backend user profile:", error);
        setUser({
          id: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          username:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          email: firebaseUser.email,
          role: "USER",
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      syncCurrentUser().catch((syncError) => {
        console.warn("Mongo user sync failed after login:", syncError);
      });
      localStorage.removeItem("library_tables_cache");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      syncCurrentUser().catch((syncError) => {
        console.warn("Mongo user sync failed after Google sign-in:", syncError);
      });
      localStorage.removeItem("library_tables_cache");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Google sign-in failed",
      };
    }
  };

  const register = async (username, email, password, role = "USER") => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (credential.user) {
        await updateProfile(credential.user, {
          displayName: username,
        });
      }

      syncCurrentUser().catch((syncError) => {
        console.warn("Mongo user sync failed after registration:", syncError);
      });

      localStorage.removeItem("library_tables_cache");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    // Clear table cache on logout
    localStorage.removeItem("library_tables_cache");
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
