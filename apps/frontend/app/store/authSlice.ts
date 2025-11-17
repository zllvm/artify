import { IUserDto } from "@artify/shared";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: IUserDto | null;
}

const initialState: AuthState = {
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUserDto | null>) {
      state.user = action.payload;
    },
    logoutUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
