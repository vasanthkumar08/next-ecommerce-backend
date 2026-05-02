import express, { Request, Response, NextFunction, Router } from "express";

// ✅ FIX: all .js extensions removed
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import productRoutes from "./modules/product/product.routes";
import cartRoutes from "./modules/cart/cart.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import orderRoutes from "./modules/order/order.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import paymentWebhookRoutes from "./modules/payment/webhook.routes";
import addressRoutes from "./modules/address/address.routes";
import reviewRoutes from "./modules/review/review.routes";
import dashboardRoutes from "./modules/admin/dashboard/dashboard.routes";
import analyticsRoutes from "./modules/admin/analytics/analytics.routes";
import adminOrderRoutes from "./modules/admin/orders/orders.routes";
import adminUserRoutes from "./modules/admin/users/users.routes";

const router: Router = express.Router();

router.use((req: Request, _res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`➡️  ${req.method} ${req.originalUrl}`);
  }
  next();
});

router.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

const v1: Router = express.Router();

v1.use("/auth", authRoutes);
v1.use("/users", userRoutes);
v1.use("/products", productRoutes);
v1.use("/cart", cartRoutes);
v1.use("/wishlist", wishlistRoutes);
v1.use("/orders", orderRoutes);
v1.use("/payments", paymentWebhookRoutes);
v1.use("/payments", paymentRoutes);
v1.use("/addresses", addressRoutes);
v1.use("/reviews", reviewRoutes);
v1.use("/admin/dashboard", dashboardRoutes);
v1.use("/admin/analytics", analyticsRoutes);
v1.use("/admin/orders", adminOrderRoutes);
v1.use("/admin/users", adminUserRoutes);

router.use("/v1", v1);

router.use((req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default router;
