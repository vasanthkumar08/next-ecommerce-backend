import type { Permission, Resource, Role } from "@/types/rbac";

export const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: [
    "read:dashboard",
    "write:dashboard",
    "delete:dashboard",
    "read:users",
    "write:users",
    "delete:users",
    "read:roles",
    "write:roles",
    "delete:roles",
    "read:products",
    "write:products",
    "delete:products",
    "read:orders",
    "write:orders",
    "delete:orders",
    "read:settings",
    "write:settings",
  ],
  manager: [
    "read:dashboard",
    "read:products",
    "read:orders",
    "read:settings",
  ],
  user: ["read:settings"],
};

export function hasRole(role: Role | undefined, allowedRoles: Role[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export function can(role: Role | undefined, permission: Permission) {
  return Boolean(role && rolePermissions[role].includes(permission));
}

export function canRead(role: Role | undefined, resource: Resource) {
  return can(role, `read:${resource}`);
}

export function canWrite(role: Role | undefined, resource: Resource) {
  return can(role, `write:${resource}`);
}

export function canDelete(role: Role | undefined, resource: Resource) {
  return can(role, `delete:${resource}`);
}
