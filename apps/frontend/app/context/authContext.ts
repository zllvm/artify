import { createContext } from 'react';

import type { IUserDto } from "@artify/shared";

export type AuthContextType = {
  user: IUserDto | null;
  // expiredAt?: number;
  // isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  // login: () => void;
  // googleLogin: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user");

  const user = (await res.json()) as IUserDto;

  return user;
};
