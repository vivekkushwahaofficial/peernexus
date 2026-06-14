import { createContext, useEffect, useMemo, useState } from "react";
import { userService } from "../services/userService.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "peernexus_auth";

function readStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { accessToken: null, refreshToken: null, user: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      if (auth.accessToken) {
        try {
          const user = await userService.getMe();
          setAuth((prev) => {
            const next = { ...prev, user };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        } catch (err) {
          console.error("Failed to hydrate user info:", err);
          // If token is invalid or expired and refresh fails, we will be redirected/logged out
        }
      }
      setLoading(false);
    }
    hydrate();
  }, [auth.accessToken]);

  const login = (payload) => {
    const next = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ accessToken: null, refreshToken: null, user: null });
  };

  const updateUser = (updatedUser) => {
    setAuth((prev) => {
      const next = { ...prev, user: updatedUser };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => {
    const userRole = auth.user?.role || "";
    return {
      ...auth,
      isAuthenticated: Boolean(auth.accessToken),
      isAdmin: userRole === "ADMIN",
      isModerator: userRole === "MODERATOR",
      isVerified: userRole === "VERIFIED_STUDENT" || userRole === "ADMIN" || userRole === "MODERATOR",
      loading,
      login,
      logout,
      updateUser,
    };
  }, [auth, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
