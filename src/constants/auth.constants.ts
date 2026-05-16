export const authRoles = ["user", "admin", "moderator", "manager"] as const;

export type AuthRole = (typeof authRoles)[number];

export const privilegedRoles = ["admin", "moderator", "manager"] as const;

export const isAuthRole = (value: unknown): value is AuthRole =>
  typeof value === "string" && authRoles.includes(value as AuthRole);
