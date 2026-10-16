import { createContext, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { api, invalidateReadCache } from "../services/client";
import {
  loadLibrary,
  resetMember,
  hydrateLibrary,
} from "../store/librarySlice";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const logout = useCallback(() => {
    api.post("/auth/logout").catch(() => {});
    invalidateReadCache();
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryExpires");
    setUser(null);
    dispatch(resetMember());
  }, [dispatch]);
  useEffect(() => {
    let active = true;
    (localStorage.getItem("libraryToken")
      ? api.get("/state")
      : Promise.resolve({ data: { member: null } })
    )
      .then((r) => {
        if (active) {
          setUser(r.data.member);
          if (r.data.member) dispatch(hydrateLibrary(r.data));
        }
      })
      .finally(() => {
        if (active) setReady(true);
      })
      .catch(() => {});
    window.addEventListener("session-expired", logout);
    return () => {
      active = false;
      window.removeEventListener("session-expired", logout);
    };
  }, [logout, dispatch]);
  useEffect(() => {
    if (!user) return;
    const delay = Number(localStorage.getItem("libraryExpires")) - Date.now();
    const timer = setTimeout(logout, Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [user, logout]);
  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("libraryToken", data.accessToken);
    localStorage.setItem("libraryExpires", data.expiresAt);
    setUser(data.member);
    await dispatch(loadLibrary()).unwrap();
  };
  const updateProfile = async (values) => {
    const { data } = await api.patch("/profile", values);
    setUser(data);
    await dispatch(loadLibrary()).unwrap();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export default AuthContext;
