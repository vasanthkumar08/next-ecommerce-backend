import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";
import { sendResponse } from "../../utils/response";
import type { IOrder } from "./order.model";

/* ===================== SANITIZER ===================== */
const sanitizeOrder = (order: IOrder) => ({
  id: String(order._id),
  items: order.items,
  totalAmount: order.totalAmount,
  totalPrice: order.totalPrice,
  status: order.status,
  paymentInfo: order.paymentInfo,
  isPaid: order.isPaid,
  isDelivered: order.isDelivered,
  createdAt: order.createdAt,
});

/* ===================== CREATE ORDER ===================== */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { shippingAddress, paymentMethod, items } = req.body;

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.pincode ||
      !shippingAddress?.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address required",
      });
    }

    const order = await orderService.createOrder(
      req.user._id,
      shippingAddress,
      paymentMethod,
      items
    );

    sendResponse(
      res,
      201,
      "Order created successfully",
      sanitizeOrder(order)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== GET MY ORDERS ===================== */
export const getMy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const orders = await orderService.getMyOrders(req.user._id);

    sendResponse(
      res,
      200,
      "Orders fetched",
      orders.map(sanitizeOrder)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== GET SINGLE ORDER ===================== */
export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = typeof req.params.id === "string" ? req.params.id : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID required",
      });
    }

    const role =
      req.user.role === "admin" || req.user.role === "manager"
        ? req.user.role
        : "user";
    const order = await orderService.getOrderById(id, {
      _id: req.user._id,
      role,
    });

    sendResponse(res, 200, "Order fetched", sanitizeOrder(order));
  } catch (err) {
    next(err);
  }
};

/* ===================== UPDATE STATUS ===================== */
export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id || !req.user.role) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    sendResponse(
      res,
      200,
      "Order status updated",
      sanitizeOrder(order)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== CANCEL ORDER ===================== */
export const cancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = typeof req.params.id === "string" ? req.params.id : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID required",
      });
    }

    const order = await orderService.getOrderById(id, {
      _id: req.user._id,
      role: req.user.role === "admin" || req.user.role === "manager" ? req.user.role : "user",
    });

    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: "Order already delivered",
      });
    }

    const deleted = await orderService.cancelOrder(id);

    sendResponse(res, 200, "Order cancelled successfully", deleted);
  } catch (err) {
    next(err);
  }
};
