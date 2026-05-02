import Order from "../../order/order.model";
import User from "../../user/user.model";
import Product from "../../product/product.model";
import { getCache, setCache } from "../../../utils/cache";

/* ===================== TYPES ===================== */
interface Revenue {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

interface TimeSeriesPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface CategoryPoint {
  name: string;
  value: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

interface DashboardStats {
  success: boolean;
  revenue: Revenue;
  users: {
    totalUsers: number;
    newUsers: number;
    blockedUsers: number;
  };
  products: {
    totalProducts: number;
    lowStockProducts: number;
  };
  orders: {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  };
  charts: {
    salesOverTime: TimeSeriesPoint[];
    ordersPerDay: TimeSeriesPoint[];
    productCategories: CategoryPoint[];
  };
  recentOrders: RecentOrder[];
}

/* ===================== DASHBOARD STATS ===================== */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const cacheKey = "dashboard:stats";

  const cached = await getCache(cacheKey);
  if (cached) return cached as DashboardStats;

  const [
    revenueData,
    totalUsers,
    newUsers,
    blockedUsers,
    totalProducts,
    lowStockProducts,
    totalOrders,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    salesOverTime,
    ordersPerDay,
    recentOrders,
    productCategories,
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          $or: [
            { isDelivered: true },
            { status: { $in: ["delivered", "completed"] } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$totalPrice", "$totalAmount"] } },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: { $ifNull: ["$totalPrice", "$totalAmount"] } },
        },
      },
    ]) as Promise<Revenue[]>,

    User.countDocuments(),
    User.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    User.countDocuments({ isBlocked: true }),

    Product.countDocuments(),
    Product.countDocuments({ stock: { $lte: 5 } }),

    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "shipped" }),
    Order.countDocuments({
      $or: [
        { isDelivered: true },
        { status: { $in: ["delivered", "completed"] } },
      ],
    }),
    Order.aggregate([
      {
        $match: {
          $or: [
            { isDelivered: true },
            { status: { $in: ["delivered", "completed"] } },
          ],
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$totalPrice", "$totalAmount"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, label: "$_id", revenue: 1, orders: 1 } },
    ]) as Promise<TimeSeriesPoint[]>,
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: 0 },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, label: "$_id", revenue: 1, orders: 1 } },
    ]) as Promise<TimeSeriesPoint[]>,
    Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate<{ user: { name?: string; email?: string } }>("user", "name email")
      .lean()
      .then((orders) =>
        orders.map((order) => ({
          id: String(order._id),
          customer: order.user?.name ?? order.user?.email ?? "Unknown user",
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        }))
      ) as Promise<RecentOrder[]>,
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$_id", "Uncategorized"] },
          value: 1,
        },
      },
    ]) as Promise<CategoryPoint[]>,
  ]);

  const revenue: Revenue = revenueData?.[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };

  const result: DashboardStats = {
    success: true,
    revenue,
    users: {
      totalUsers,
      newUsers,
      blockedUsers,
    },
    products: {
      totalProducts,
      lowStockProducts,
    },
    orders: {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
    },
    charts: {
      salesOverTime,
      ordersPerDay,
      productCategories,
    },
    recentOrders,
  };

  await setCache(cacheKey, result, 60);

  return result;
};
