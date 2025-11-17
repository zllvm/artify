import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";

export const OPEN_SIDEBAR_WIDTH = 220;
export const CLOSED_SIDEBAR_WIDTH = 48;

type SidebarState = {
  isOpenDesktop: boolean;
  isOpenMobile: boolean;
  widthDesktop: number;
  widthMobile: number;
};

const initialState: SidebarState = {
  isOpenDesktop: true,
  isOpenMobile: false,
  widthDesktop: OPEN_SIDEBAR_WIDTH,
  widthMobile: CLOSED_SIDEBAR_WIDTH,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleIsOpenDesktop(state) {
      state.isOpenDesktop = !state.isOpenDesktop;
    },
    toggleIsOpenMobile(state) {
      state.isOpenMobile = !state.isOpenMobile;
    },
    setIsOpenDesktop(state, action: PayloadAction<boolean>) {
      state.isOpenDesktop = action.payload;
    },
    setIsOpenMobile(state, action: PayloadAction<boolean>) {
      state.isOpenMobile = action.payload;
    },
    setWidthDesktop(state, action: PayloadAction<number>) {
      state.widthDesktop = action.payload;
    },
    setWidthMobile(state, action: PayloadAction<number>) {
      state.widthMobile = action.payload;
    },
  },
});

export const {
  toggleIsOpenDesktop,
  toggleIsOpenMobile,
  setIsOpenDesktop,
  setIsOpenMobile,
  setWidthDesktop,
  setWidthMobile,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
