import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { webLogin, webLogout, refreshToken } from "../api/client.js";

// Because the browser web-login flow uses HTTP-only cookies, JavaScript cannot
// read the JWT or its claims. We therefore treat "authenticated" as: a login
// succeeded, or a token refresh on page load succeeded. A lightweight username
// hint is kept in localStorage purely for display; it is NOT a security token.

const AuthContext = createContext(null);

const STORAGE_KEY = "exam-admin-username";

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() =>
    localStorage.getItem(STORAGE_KEY) || null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // On first load, try to validate the existing session via a silent refresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (localStorage.getItem(STORAGE_KEY)) {
        const ok = await refreshToken();
        if (!cancelled) setIsAuthenticated(ok);
        if (!ok) localStorage.removeItem(STORAGE_KEY);
      }
      if (!cancelled) setInitializing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(user, password) {
    await webLogin(user, password); // throws on failure
    localStorage.setItem(STORAGE_KEY, user);
    setUsername(user);
    setIsAuthenticated(true);
  }

  async function logout() {
    await webLogout();
    localStorage.removeItem(STORAGE_KEY);
    setUsername(null);
    setIsAuthenticated(false);
  }

  const value = useMemo(
    () => ({ isAuthenticated, initializing, username, login, logout }),
    [isAuthenticated, initializing, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
