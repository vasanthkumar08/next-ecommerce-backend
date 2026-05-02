import { Request, Response, NextFunction } from "express";
import Order from "../../order/order.model.js";
import { sendResponse } from "../../../utils/response.js";

type OrderStatusFilter =
  | { $or: Array<{ isDelivered: true } | { status: { $in: readonly ["delivered", "completed"] } }> }
  | { status: "pending" }
  | { status: "cancelled" }
  | Record<string, never>;

const allowedStatuses = [
  "pending",
  "paid",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
] as const;

type AdminOrderStatus = (typeof allowedStatuses)[number];

interface StatusBody {
  status?: AdminOrderStatus;
}

const isStatus = (value: unknown): value is AdminOrderStatus =>
  typeof value === "string" &&
  allowedStatuses.includes(value as AdminOrderStatus);

export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 50);
    const skip = (page - 1) * limit;
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const filter: OrderStatusFilter =
      status === "delivered"
        ? { $or: [{ isDelivered: true }, { status: { $in: ["delivered", "completed"] as const } }] }
        : status === "pending"
          ? { status: "pending" as const }
          : status === "cancelled"
            ? { status: "cancelled" as const }
            : {};

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendResponse(res, 200, "Orders fetched successfully", {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email avatar")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request<{ id: string }, unknown, StatusBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isStatus(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const patch: {
      status: AdminOrderStatus;
      shippedAt?: Date;
      deliveredAt?: Date;
      cancelledAt?: Date;
      isPaid?: boolean;
      isDelivered?: boolean;
      "paymentInfo.status"?: "success";
    } = { status: req.body.status };

    if (req.body.status === "shipped") {
      patch.shippedAt = new Date();
    }

    if (req.body.status === "delivered" || req.body.status === "completed") {
      patch.status = "completed";
      patch.deliveredAt = new Date();
      patch.isDelivered = true;
      patch.isPaid = true;
      patch["paymentInfo.status"] = "success";
    }

    if (req.body.status === "cancelled") {
      patch.cancelledAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return sendResponse(res, 200, "Order status updated", order);
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveredOrder = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be deleted",
      });
    }

    await order.deleteOne();

    return sendResponse(res, 200, "Delivered order deleted", {
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

export const exportOrdersCsv = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    const rows = [
      ["id", "status", "totalAmount", "isPaid", "isDelivered", "createdAt"],
      ...orders.map((order) => [
        String(order._id),
        order.status,
        String(order.totalAmount),
        String(order.isPaid),
        String(order.isDelivered),
        order.createdAt.toISOString(),
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};




