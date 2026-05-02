import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Resource, Role } from "@/types/rbac";

export interface NavigationItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  resource: Resource;
  allowedRoles: Role[];
}

export const workspaceNavigation: NavigationItem[] = [
  {
    title: "Admin overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    resource: "users",
    allowedRoles: ["admin"],
  },
  {
    title: "Roles",
    href: "/admin/roles-permissions",
    icon: ShieldCheck,
    resource: "roles",
    allowedRoles: ["admin"],
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Boxes,
    resource: "products",
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: PackageCheck,
    resource: "orders",
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Manager dashboard",
    href: "/dashboard",
    icon: BarChart3,
    resource: "dashboard",
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    resource: "settings",
    allowedRoles: ["admin", "manager", "user"],
  },
];
