"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  college: string;
  events: string[];
  role: string;
  teamName?: string;
  paidEvents?: string[];
  paymentStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("robo_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem("robo_user");
        }
      }
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("robo_user", JSON.stringify(data.user));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("robo_user");
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("robo_user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("robo_user");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
