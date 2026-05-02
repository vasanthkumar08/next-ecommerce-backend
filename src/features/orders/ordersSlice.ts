import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cancelOrder, fetchOrders } from "@/features/order/order.api";
import type { RootState } from "@/store/store";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

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
  paymentMethod?: string;
  userId?: string;
  isPaid?: boolean;
  isDelivered?: boolean;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const loadOrders = createAsyncThunk(
  "orders/load",
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      return await fetchOrders(userId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to load orders"
      );
    }
  }
);

export const cancelOrderById = createAsyncThunk(
  "orders/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      await cancelOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to cancel order"
      );
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    createOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>
    ) => {
      const order = state.items.find((item) => item.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load orders";
      })
      .addCase(cancelOrderById.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { createOrder, removeOrder, setOrders, updateOrderStatus } =
  ordersSlice.actions;

export const selectOrders = (state: RootState) => state.orders.items;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;

export default ordersSlice.reducer;
