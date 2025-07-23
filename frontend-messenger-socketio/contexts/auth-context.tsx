"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { socketService } from "@/lib/socket";
import { userApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        try {
          const response = await userApi.getCurrentUser();
          const userData = response.data;
          setToken(storedToken);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          socketService.connect(storedToken);
        } catch (error) {
          if (storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            socketService.connect(storedToken);
          } else {
            logout();
          }
        }
      }

      setIsLoading(false);
    };

    void initAuth();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    socketService.connect(newToken);

    const response = await userApi.getCurrentUser();
    const newUser: User = response.data as User;
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
