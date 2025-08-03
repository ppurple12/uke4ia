import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize userId and admin from localStorage (or defaults)
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem("userId");
    return stored ? parseInt(stored, 10) : 0;  // default 0 means logged out
  });
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin");
    return stored === "true";  // string 'true' -> boolean true
  });

  const login = (id, isAdmin = false) => {
    setUserId(id);
    setAdmin(isAdmin);
    localStorage.setItem("userId", id);
    localStorage.setItem("admin", isAdmin);
  };

  const logout = () => {
    setUserId(0);
    setAdmin(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ userId, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);