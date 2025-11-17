import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import pinterestReducer from "./pinterestSlice";
import sidebarReducer from "./sidebarState";

let clientStore: ReturnType<typeof configureStore> | null = null;

const rootReducer = combineReducers({
  auth: authReducer,
  pinterest: pinterestReducer,
  sidebar: sidebarReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export function getOrCreateStore(preloadedState?: RootState) {
  const store = makeStore(preloadedState);

  if (typeof window !== "undefined") {
    if (clientStore) {
      const prev = clientStore.getState() as RootState;
      const next = store.getState();

      store.dispatch({
        type: "HYDRATE",
        payload: {
          pinterest: { ...prev.pinterest, ...next.pinterest },
          sidebar: { ...prev.sidebar, ...next.sidebar },
          auth: { ...prev.auth, ...next.auth },
        },
      });

      return clientStore;
    }
    clientStore = store;
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
