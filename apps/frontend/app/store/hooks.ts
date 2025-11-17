import { useMemo } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { makeStore } from "./index";

import type { RootState, AppDispatch } from ".";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useLocalStore() {
  return useMemo(() => makeStore(), []);
}
