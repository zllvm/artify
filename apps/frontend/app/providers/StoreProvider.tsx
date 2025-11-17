"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/store";

import type { RootState, AppStore } from "@/store";

interface StoreProviderProps {
  preloadedState?: Partial<RootState>;
  children: React.ReactNode;
}

export default function StoreProvider({
  preloadedState,
  children,
}: StoreProviderProps) {
  const store = useMemo<AppStore>(
    () => makeStore(preloadedState),
    [preloadedState]
  );

  return <Provider store={store}>{children}</Provider>;
}
