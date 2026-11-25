import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// The shape of the logged-in user we keep in the store
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;   // "admin" | "staff" | "customer"
  status: string; // "active" | "inactive" | "blocked"
};

type AuthState = {
  user: AuthUser | null;
};

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Call this after login to store the user
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    // Call this after logout to clear the user
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
