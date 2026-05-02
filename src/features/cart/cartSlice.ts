import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    // ✅ FIX: was PayloadAction<string> with Number() coercion — now consistently number
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((item) => item.id === action.payload);
      if (!existing) return;
      if (existing.quantity <= 1) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      } else {
        existing.quantity -= 1;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    hydrateCart: (state, action: PayloadAction<CartItem[] | undefined>) => {
      state.items = action.payload ?? [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
  hydrateCart,
} = cartSlice.actions;
export default cartSlice.reducer;
