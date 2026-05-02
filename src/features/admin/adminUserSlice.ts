import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminUsers } from "@/features/admin/admin.api";
import type { PaginatedUsers } from "@/types/admin";

interface AdminUserState {
  data: PaginatedUsers | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminUserState = {
  data: null,
  loading: false,
  error: null,
};

export const loadAdminUsers = createAsyncThunk("adminUsers/load", fetchAdminUsers);

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load users";
      });
  },
});

export default adminUserSlice.reducer;
