import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminProducts } from "@/features/admin/admin.api";
import type { PaginatedProducts } from "@/types/admin";

interface AdminProductState {
  data: PaginatedProducts | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminProductState = {
  data: null,
  loading: false,
  error: null,
};

export const loadAdminProducts = createAsyncThunk(
  "adminProducts/load",
  fetchAdminProducts
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    removeAdminProductOptimistic: (state, action: { payload: string }) => {
      if (!state.data) return;
      state.data.products = state.data.products.filter(
        (product) => product.id !== action.payload
      );
      state.data.total = Math.max(0, state.data.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load products";
      });
  },
});

export const { removeAdminProductOptimistic } = adminProductSlice.actions;
export default adminProductSlice.reducer;
