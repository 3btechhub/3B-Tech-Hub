import { randomUUID } from "node:crypto";
import { auditEventSchema, type AuditEvent } from "./audit-schema";
import { createAppwriteRow } from "./appwrite-server";

export function isAuditStoreConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    && process.env.APPWRITE_API_KEY
    && process.env.APPWRITE_DATABASE_ID
    && process.env.APPWRITE_AUDIT_TABLE_ID,
  );
}

export async function appendAuditEvent(event: AuditEvent) {
  const parsed = auditEventSchema.parse(event);
  const tableId = process.env.APPWRITE_AUDIT_TABLE_ID;
  if (!tableId || !isAuditStoreConfigured()) throw new Error("AUDIT_STORAGE_NOT_CONFIGURED");
  await createAppwriteRow(tableId, randomUUID(), {
    ...parsed,
    metadata: parsed.metadata ? JSON.stringify(parsed.metadata) : "{}",
  });
}
