import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import productReducer from "@/features/product/productSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import adminDashboardReducer from "@/features/admin/dashboardSlice";
import adminProductReducer from "@/features/admin/adminProductSlice";
import adminOrderReducer from "@/features/admin/adminOrderSlice";
import adminUserReducer from "@/features/admin/adminUserSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    adminDashboard: adminDashboardReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrderReducer,
    adminUsers: adminUserReducer,
  },
});

/* ===================== TYPES ===================== */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
