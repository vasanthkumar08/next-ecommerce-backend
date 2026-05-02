import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

// ✅ FIX: added missing "Processing" status
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

interface OrdersState {
  items: Order[];
}

const initialState: OrdersState = { items: [] };

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    createOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>
    ) => {
      const order = state.items.find((item) => item.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
});

export const { createOrder, updateOrderStatus } = ordersSlice.actions;

export const selectOrders = (state: RootState) => state.orders.items;

export default ordersSlice.reducer;
