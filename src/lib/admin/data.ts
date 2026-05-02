import type { Role } from "@/types/rbac";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "suspended";
  lastSeen: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  image: string;
  status: "active" | "draft" | "archived";
}

export interface AdminOrder {
  id: string;
  customer: string;
  total: number;
  status: "paid" | "packed" | "shipped" | "refunded";
  createdAt: string;
}

export const users: AdminUser[] = [
  {
    id: "u_001",
    name: "Admin Owner",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    lastSeen: "Today",
  },
  {
    id: "u_002",
    name: "Store Manager",
    email: "manager@example.com",
    role: "manager",
    status: "active",
    lastSeen: "Yesterday",
  },
  {
    id: "u_003",
    name: "Customer User",
    email: "user@example.com",
    role: "user",
    status: "invited",
    lastSeen: "Apr 26",
  },
  {
    id: "u_004",
    name: "Ops Lead",
    email: "ops@example.com",
    role: "manager",
    status: "suspended",
    lastSeen: "Apr 19",
  },
];

export const products: AdminProduct[] = [
  {
    id: "p_001",
    name: "Classic Cotton Tee",
    sku: "TEE-100",
    stock: 128,
    price: 799,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    status: "active",
  },
  {
    id: "p_002",
    name: "Slim Denim Jacket",
    sku: "JKT-220",
    stock: 38,
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=80",
    status: "active",
  },
  {
    id: "p_003",
    name: "Everyday Sneakers",
    sku: "SNK-420",
    stock: 14,
    price: 3299,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    status: "draft",
  },
  {
    id: "p_004",
    name: "Canvas Tote",
    sku: "BAG-080",
    stock: 0,
    price: 599,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80",
    status: "archived",
  },
];

export const orders: AdminOrder[] = [
  { id: "#1008", customer: "Nisha Kumar", total: 3299, status: "paid", createdAt: "Today" },
  { id: "#1007", customer: "Arjun Rao", total: 1898, status: "packed", createdAt: "Yesterday" },
  { id: "#1006", customer: "Priya Shah", total: 4998, status: "shipped", createdAt: "Apr 29" },
  { id: "#1005", customer: "Rahul Mehta", total: 799, status: "refunded", createdAt: "Apr 28" },
];

export const revenue = [
  { month: "Jan", revenue: 42000, orders: 120 },
  { month: "Feb", revenue: 51000, orders: 148 },
  { month: "Mar", revenue: 68000, orders: 196 },
  { month: "Apr", revenue: 84500, orders: 242 },
  { month: "May", revenue: 124500, orders: 342 },
];

export const roleRows = [
  { role: "admin", users: 1, permissions: 18, scope: "Full platform control" },
  { role: "manager", users: 2, permissions: 8, scope: "Operations and reporting" },
  { role: "user", users: 1, permissions: 1, scope: "Profile and storefront access" },
] as const;
