import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProducts } from "./product.api";
import { Product } from "@/types/product";
import { RootState } from "@/store/store";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ProductState {
  items: Product[];
  status: Status;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  status: "idle",
  error: null,
};

// ✅ withTypes() — no angle-bracket generics, full type safety
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  rejectValue: string;
}>();

export const fetchProducts = createAppAsyncThunk(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProducts();
      if (!Array.isArray(data)) return rejectWithValue("Invalid product data");
      return data as Product[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      });
  },
});

export const selectProducts = (state: RootState) => state.product.items;
export const selectProductStatus = (state: RootState) => state.product.status;
export const selectProductError = (state: RootState) => state.product.error;

export const { resetProducts } = productSlice.actions;
export default productSlice.reducer;