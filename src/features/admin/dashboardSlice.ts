import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDashboardStats } from "@/features/admin/admin.api";
import type { DashboardStats } from "@/types/admin";

interface DashboardState {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const loadDashboardStats = createAsyncThunk(
  "adminDashboard/load",
  fetchDashboardStats
);

const dashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load dashboard";
      });
  },
});

export default dashboardSlice.reducer;
