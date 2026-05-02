export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  brand?: string;
  stock: number;
  images: ProductImage[];
  ratings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  _id: string;
  id?: string;
  user:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  totalPrice?: number;
  status: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "manager";
  isBlocked: boolean;
  createdAt: string;
}

export interface ChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryChartPoint {
  name: string;
  value: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
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
    salesOverTime: ChartPoint[];
    ordersPerDay: ChartPoint[];
    productCategories: CategoryChartPoint[];
  };
  recentOrders: RecentOrder[];
}

export interface PaginatedProducts {
  products: AdminProduct[];
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedOrders {
  orders: AdminOrder[];
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}
