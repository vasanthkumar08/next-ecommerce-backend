import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminOrders } from "@/features/admin/admin.api";
import type { PaginatedOrders } from "@/types/admin";

interface AdminOrderState {
  data: PaginatedOrders | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminOrderState = {
  data: null,
  loading: false,
  error: null,
};

export const loadAdminOrders = createAsyncThunk(
  "adminOrders/load",
  fetchAdminOrders
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    removeAdminOrderOptimistic: (state, action: { payload: string }) => {
      if (!state.data) return;
      state.data.orders = state.data.orders.filter(
        (order) => (order.id ?? order._id) !== action.payload
      );
      state.data.total = Math.max(0, state.data.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load orders";
      });
  },
});

export const { removeAdminOrderOptimistic } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
