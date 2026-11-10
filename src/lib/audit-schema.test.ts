import { describe, expect, it } from "vitest";
import { validateAuditEvent } from "./audit-schema";

const validEvent = {
  actorId: "owner-user-123",
  actorRole: "owner",
  action: "content.publish",
  targetType: "content",
  targetId: "homepage",
  outcome: "success",
  occurredAt: "2026-11-10T10:00:00.000Z",
};

describe("audit event validation", () => {
  it("accepts a valid bounded audit event", () => {
    expect(validateAuditEvent(validEvent).action).toBe("content.publish");
  });

  it("rejects unknown roles and actions", () => {
    expect(() => validateAuditEvent({ ...validEvent, actorRole: "superuser" })).toThrow();
    expect(() => validateAuditEvent({ ...validEvent, action: "unknown.action" })).toThrow();
  });

  it("rejects oversized metadata values", () => {
    expect(() => validateAuditEvent({
      ...validEvent,
      metadata: { note: "x".repeat(201) },
    })).toThrow();
  });

  it("rejects sensitive metadata keys", () => {
    expect(() => validateAuditEvent({
      ...validEvent,
      metadata: { sessionSecret: "never-store" },
    })).toThrow();
  });

  it("does not accept credentials as first-class audit fields", () => {
    expect(() => validateAuditEvent({
      ...validEvent,
      password: "do-not-store",
    })).toThrow();
  });
});
