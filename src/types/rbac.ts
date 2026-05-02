export const roles = ["admin", "manager", "user"] as const;

export type Role = (typeof roles)[number];

export type Resource =
  | "dashboard"
  | "users"
  | "roles"
  | "products"
  | "orders"
  | "settings";

export type Action = "read" | "write" | "delete";

export type Permission = `${Action}:${Resource}`;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}
