import api from "@/lib/axios";
import { CartItem } from "@/features/cart/cartSlice";
import type { Order } from "@/features/orders/ordersSlice";
import { createMockOrder, getMockOrders } from "@/services/mockDatabase";

export type PaymentMethod = "cod" | "credit_card" | "debit_card" | "upi";

export interface ShippingAddress {
  address: string;
  city: string;
  pincode: string;
  country: string;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    items: Array<{
      productId?: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    totalAmount: number;
    status: string;
    paymentInfo?: {
      method?: PaymentMethod;
    };
    createdAt: string;
  };
}

export const createOrder = async (
  items: CartItem[],
  total: number,
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  userId = "guest"
): Promise<Order> => {
  try {
    const res = await api.post<CreateOrderResponse>("/v1/orders", {
      items: items.map((item) => ({
        productId: item.id,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalAmount: total,
      shippingAddress,
      paymentMethod,
    });

    return {
      id: res.data.data.id,
      createdAt: res.data.data.createdAt,
      status: "Pending",
      items: res.data.data.items.map((item) => ({
        productId: item.productId ?? item.name,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: res.data.data.totalAmount,
      paymentMethod: res.data.data.paymentInfo?.method ?? paymentMethod,
      userId,
      isPaid: paymentMethod !== "cod",
    };
  } catch {
    return createMockOrder({
      userId,
      orderItems: items,
      totalPrice: total,
      isPaid: paymentMethod !== "cod",
      paymentMethod,
    });
  }
};

export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  try {
    const res = await api.get<{
      success: boolean;
      data:
        | {
            orders?: Array<{
              id: string;
              createdAt: string;
              status?: Order["status"];
              items?: Array<{
                productId?: string;
                name: string;
                quantity: number;
                price: number;
                image?: string;
              }>;
              totalAmount?: number;
              totalPrice?: number;
              paymentInfo?: { method?: string };
              isPaid?: boolean;
              isDelivered?: boolean;
            }>;
          }
        | Array<{
          id: string;
          createdAt: string;
          status?: Order["status"];
          items?: Array<{
            productId?: string;
            name: string;
            quantity: number;
            price: number;
            image?: string;
          }>;
          totalAmount?: number;
          totalPrice?: number;
          paymentInfo?: { method?: string };
          isPaid?: boolean;
          isDelivered?: boolean;
        }>;
    }>("/v1/orders");

    const orders = Array.isArray(res.data.data)
      ? res.data.data
      : res.data.data.orders ?? [];

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: normalizeOrderStatus(order.status, order.isDelivered),
      items: (order.items ?? []).map((item) => ({
        productId: item.productId ?? item.name,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: order.totalAmount ?? order.totalPrice ?? 0,
      paymentMethod: order.paymentInfo?.method,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      userId,
    }));
  } catch {
    return getMockOrders(userId);
  }
};

const normalizeOrderStatus = (
  status: Order["status"] | string | undefined,
  isDelivered?: boolean
): Order["status"] => {
  if (isDelivered) {
    return "Delivered";
  }

  const normalized = String(status ?? "Pending").toLowerCase();
  const map: Record<string, Order["status"]> = {
    pending: "Pending",
    confirmed: "Pending",
    paid: "Processing",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Shipped",
    delivered: "Delivered",
    completed: "Delivered",
    cancelled: "Cancelled",
  };

  return map[normalized] ?? "Pending";
};

export const cancelOrder = async (id: string): Promise<{ id: string }> => {
  try {
    const response = await api.delete<{ success: boolean; data: { id: string } }>(
      `/v1/orders/${id}`
    );

    return response.data.data;
  } catch {
    return { id };
  }
};
