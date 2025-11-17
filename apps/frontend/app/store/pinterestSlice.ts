import { PinterestAdapter } from "@/adapters/PinterestAdapter";
import { HYDRATE } from "@/store/hydrate";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { HydrateAction } from "@/store/hydrate";
import type { PinterestBoard } from "@artify/shared";

export type PinterestState = {
  boards: PinterestBoard[];
  loading: boolean;
  error: string | null;
};

const initialState: PinterestState = {
  boards: [],
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk(
  "pinterest/fetchBoards",
  async (options?: { silent?: boolean }) => {
    const boards = await PinterestAdapter.getBoards();
    return { boards, silent: !!options?.silent };
  }
);

const pinterestSlice = createSlice({
  name: "pinterest",
  initialState,
  reducers: {
    clearBoards: (state) => {
      state.boards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.boards;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load boards";
      })
      .addCase(
        HYDRATE,
        (state, action: HydrateAction<{ pinterest: PinterestState }>) => {
          if (!action.payload?.pinterest) return state;
          return {
            ...state,
            ...action.payload.pinterest,
          };
        }
      );
  },
});

export const { clearBoards } = pinterestSlice.actions;
export default pinterestSlice.reducer;
