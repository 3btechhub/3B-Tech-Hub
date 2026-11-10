import { describe, expect, it } from "vitest";
import { canManageUsers, canPublish, hasPermission, roles } from "./permissions";

describe("role permission policy", () => {
  it("allows only the owner to publish", () => {
    expect(roles.filter(canPublish)).toEqual(["owner"]);
  });

  it("does not allow non-owners to manage users", () => {
    expect(roles.filter(canManageUsers)).toEqual(["owner"]);
  });

  it("allows admins to edit content but not approve or publish", () => {
    expect(hasPermission("admin", "content:edit")).toBe(true);
    expect(hasPermission("admin", "content:approve")).toBe(false);
    expect(hasPermission("admin", "content:publish")).toBe(false);
  });

  it("denies staff access to system settings", () => {
    expect(hasPermission("staff", "settings:manage")).toBe(false);
  });
});
