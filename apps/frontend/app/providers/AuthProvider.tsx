"use client";

import { useCallback, useEffect, useRef } from "react";

import { logoutUser, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { IUserDto } from "@artify/shared";

import { API_URL } from "../config";
import { AuthContext } from "../context/authContext";

import type { ReactNode } from "react";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    dispatch(logoutUser());
    window.location.href = "/";
  }, [dispatch]);

  const logoutRef = useRef(logout);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (!user?.tokenExpiresAt) return;

    const expiresInMs = new Date(user.tokenExpiresAt).getTime() - Date.now();

    const doLogout = () => void logoutRef.current();

    if (expiresInMs <= 0) {
      doLogout();
      return;
    }

    const timer = setTimeout(doLogout, expiresInMs);

    return () => clearTimeout(timer);
  }, [user?.tokenExpiresAt, logoutRef]);

  useEffect(() => {
    const timeoutMs = 30 * 60 * 1000;

    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void logoutRef.current(), timeoutMs);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, reset));

    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      clearTimeout(timer);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (res.status === 401) {
      void logoutRef.current();
      return;
    }

    const user = (await res.json()) as IUserDto;

    dispatch(setUser(user));
  }, [dispatch]);

  const refreshRef = useRef(refreshUser);
  useEffect(() => {
    refreshRef.current = refreshUser;
  }, [refreshUser]);

  useEffect(() => {
    const handler = () => void refreshRef.current();

    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
