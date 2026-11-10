import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { externalMediaSchema, videoEmbedSchema } from "@/lib/media-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { createAppwriteRow, deleteAppwriteRow, isMediaStoreConfigured } from "@/lib/appwrite-server";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured() || !isAuditStoreConfigured()) return NextResponse.json({ error: "Media and audit storage must both be configured." }, { status: 503 });
  const input = await request.json().catch(() => null);
  const externalParsed = externalMediaSchema.safeParse(input);
  const parsed = externalParsed.success ? externalParsed : videoEmbedSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Invalid external media details.", issues: parsed.error.issues }, { status: 400 });
  const assetId = randomUUID();
  const tableId = process.env.APPWRITE_MEDIA_TABLE_ID!;
  let rowCreated = false;
  try {
    await createAppwriteRow(tableId, assetId, { ...parsed.data, createdBy: auth.identity!.id, createdAt: new Date().toISOString(), deletedAt: null });
    rowCreated = true;
    await appendAuditEvent({
      actorId: auth.identity!.id, actorRole: "owner", action: "media.register", targetType: "media",
      targetId: assetId, outcome: "success", metadata: { sourceType: parsed.data.sourceType, mediaType: parsed.data.mediaType },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, assetId }, { status: 201 });
  } catch {
    if (rowCreated) await deleteAppwriteRow(tableId, assetId).catch(() => undefined);
    return NextResponse.json({ error: "Media registration or audit recording failed; the new record was rolled back where possible." }, { status: 502 });
  }
}
