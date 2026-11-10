import { z } from "zod";
import { roles } from "./permissions";

export const auditActions = [
  "auth.login",
  "auth.logout",
  "content.create",
  "content.update",
  "content.delete",
  "content.approve",
  "content.publish",
  "media.upload",
  "media.update",
  "media.delete",
  "user.role_change",
  "settings.update",
] as const;

export const auditEventSchema = z.object({
  actorId: z.string().min(1).max(36),
  actorRole: z.enum(roles),
  action: z.enum(auditActions),
  targetType: z.enum(["content", "media", "user", "settings", "session"]),
  targetId: z.string().max(128).optional(),
  outcome: z.enum(["success", "denied", "failure"]),
  requestId: z.string().max(128).optional(),
  // Only non-sensitive, bounded metadata is permitted. Never store credentials,
  // session secrets, API keys, full request bodies or customer payment data.
  metadata: z.record(z.string(), z.union([
    z.string().max(200),
    z.number().finite(),
    z.boolean(),
  ])).optional(),
  occurredAt: z.string().datetime(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

export function validateAuditEvent(input: unknown): AuditEvent {
  return auditEventSchema.parse(input);
}
