"use client";

import { createContext, useEffect, useState } from "react";

import { API_URL } from "../config";

import type { ReactNode } from "react";

type User = {
  id: string;
  displayName?: string;
  name?: string;
  email?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: () => void;
  googleLogin: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log(API_URL);
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/";
  };

  const login = () => {
    window.location.href = "/";
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, logout, login, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
