import Order from "../../order/order.model.js";
import User from "../../user/user.model.js";

/* ===================== TYPES ===================== */
interface DailyRevenue {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  revenue: number;
  orders: number;
}

interface MonthlyRevenue {
  _id: {
    month: number;
  };
  revenue: number;
  orders: number;
}

interface UserGrowth {
  _id: {
    year: number;
    month: number;
  };
  users: number;
}

/* ===================== DAILY REVENUE ===================== */
export const getDailyRevenue = async (
  days: number = 7
): Promise<DailyRevenue[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Order.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]) as DailyRevenue[];

  return data;
};

/* ===================== MONTHLY REVENUE ===================== */
export const getMonthlyRevenue = async (
  year: number = new Date().getFullYear()
): Promise<MonthlyRevenue[]> => {
  const data = await Order.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]) as MonthlyRevenue[];

  return data;
};

/* ===================== USERS ===================== */
export const getUserGrowth = async (): Promise<UserGrowth[]> => {
  const data = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]) as UserGrowth[];

  return data;
};