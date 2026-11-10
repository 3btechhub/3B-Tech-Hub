import { NextRequest, NextResponse } from "next/server";
import { mediaMetadataUpdateSchema } from "@/lib/media-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";
import { getAppwriteRow, isMediaStoreConfigured, updateAppwriteRow } from "@/lib/appwrite-server";

export const runtime = "nodejs";
type Context = { params: Promise<{ assetId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured() || !isAuditStoreConfigured()) return NextResponse.json({ error: "Media and audit storage must both be configured." }, { status: 503 });
  const { assetId } = await context.params;
  const parsed = mediaMetadataUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid media metadata.", issues: parsed.error.issues }, { status: 400 });
  try {
    const tableId = process.env.APPWRITE_MEDIA_TABLE_ID!;
    const existing = await getAppwriteRow(tableId, assetId);
    if (existing.deletedAt) return NextResponse.json({ error: "Restore this asset before editing it." }, { status: 409 });
    const sourceType = existing.sourceType;
    if (parsed.data.externalUrl && sourceType !== "external") return NextResponse.json({ error: "Only externally hosted assets can change their URL." }, { status: 400 });
    const updated = await updateAppwriteRow(tableId, assetId, parsed.data);
    await appendAuditEvent({
      actorId: auth.identity!.id, actorRole: "owner", action: "media.update", targetType: "media",
      targetId: assetId, outcome: "success", metadata: { changedFields: Object.keys(parsed.data).join(",") },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch {
    return NextResponse.json({ error: "Media update or audit recording failed." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured() || !isAuditStoreConfigured()) return NextResponse.json({ error: "Media and audit storage must both be configured." }, { status: 503 });
  const { assetId } = await context.params;
  try {
    const tableId = process.env.APPWRITE_MEDIA_TABLE_ID!;
    const existing = await getAppwriteRow(tableId, assetId);
    if (existing.deletedAt) return NextResponse.json({ ok: true, alreadyTrashed: true });
    await updateAppwriteRow(tableId, assetId, { deletedAt: new Date().toISOString() });
    await appendAuditEvent({
      actorId: auth.identity!.id, actorRole: "owner", action: "media.delete", targetType: "media",
      targetId: assetId, outcome: "success", metadata: { mode: "soft_delete" },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, deleted: "trash" });
  } catch {
    return NextResponse.json({ error: "Media could not be moved to trash or audited." }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured() || !isAuditStoreConfigured()) return NextResponse.json({ error: "Media and audit storage must both be configured." }, { status: 503 });
  const { assetId } = await context.params;
  const body = await request.json().catch(() => null) as { action?: string } | null;
  if (body?.action !== "restore") return NextResponse.json({ error: "Only restore is supported." }, { status: 400 });
  try {
    const tableId = process.env.APPWRITE_MEDIA_TABLE_ID!;
    const existing = await getAppwriteRow(tableId, assetId);
    if (!existing.deletedAt) return NextResponse.json({ ok: true, alreadyActive: true });
    await updateAppwriteRow(tableId, assetId, { deletedAt: null });
    await appendAuditEvent({
      actorId: auth.identity!.id, actorRole: "owner", action: "media.update", targetType: "media",
      targetId: assetId, outcome: "success", metadata: { mode: "restore" },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, restored: true });
  } catch {
    return NextResponse.json({ error: "Media could not be restored or audited." }, { status: 502 });
  }
}
