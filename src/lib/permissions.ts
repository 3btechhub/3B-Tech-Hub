export const roles = ["owner", "admin", "manager", "staff"] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  "content:read",
  "content:edit",
  "content:approve",
  "content:publish",
  "catalogue:manage",
  "bookings:manage",
  "customers:manage",
  "users:manage",
  "settings:manage",
  "audit:read",
] as const;
export type Permission = (typeof permissions)[number];

const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: permissions,
  admin: [
    "content:read", "content:edit", "catalogue:manage",
    "bookings:manage", "customers:manage", "audit:read",
  ],
  manager: [
    "content:read", "catalogue:manage", "bookings:manage",
    "customers:manage",
  ],
  staff: ["content:read", "bookings:manage"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canPublish(role: Role): boolean {
  return hasPermission(role, "content:publish");
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "users:manage");
}
