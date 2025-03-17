import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  token: string;
  role: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  const login = (userData: UserData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = user?.token;
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login"; // Redirect to login page
    }
  };

  // Auto logout when token expires
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (!user?.token) return;

      try {
        const { exp } = JSON.parse(atob(user.token.split(".")[1])); // Decode JWT payload
        const expirationTime = exp * 1000; // Convert to milliseconds

        if (Date.now() >= expirationTime) {
          logout();
        }
      } catch (error) {
        console.error("Invalid token format:", error);
        logout(); // If decoding fails, logout user
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
