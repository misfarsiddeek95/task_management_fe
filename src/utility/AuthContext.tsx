import axios from "axios";
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: { token: string; role: string; name: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("user")
  );

  const login = (userData: { token: string; role: string; name: string }) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user") || "null")?.token
            }`,
          },
        }
      );
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
