import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { pageRevisionSchema } from "@/lib/content-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { createAppwriteRow, deleteAppwriteRow, isContentStoreConfigured } from "@/lib/appwrite-server";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isContentStoreConfigured() || !isAuditStoreConfigured()) {
    return NextResponse.json({ error: "Content and audit storage must both be configured. No page was saved." }, { status: 503 });
  }
  const parsed = pageRevisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid page revision.", issues: parsed.error.issues }, { status: 400 });
  if (parsed.data.status !== "draft") return NextResponse.json({ error: "Only draft revisions can be created through this endpoint." }, { status: 403 });

  const revisionId = randomUUID();
  const tableId = process.env.APPWRITE_CONTENT_TABLE_ID!;
  let rowCreated = false;
  try {
    await createAppwriteRow(tableId, revisionId, {
      slug: parsed.data.slug, locale: parsed.data.locale, revision: parsed.data.revision, status: "draft",
      payload: JSON.stringify(parsed.data), createdBy: auth.identity!.id, createdAt: new Date().toISOString(),
    });
    rowCreated = true;
    await appendAuditEvent({
      actorId: auth.identity!.id, actorRole: "owner", action: "content.create", targetType: "content",
      targetId: revisionId, outcome: "success", metadata: { slug: parsed.data.slug, locale: parsed.data.locale },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, revisionId, status: "draft" }, { status: 201 });
  } catch {
    if (rowCreated) await deleteAppwriteRow(tableId, revisionId).catch(() => undefined);
    return NextResponse.json({ error: "Draft save or audit recording failed; the new draft was rolled back where possible." }, { status: 502 });
  }
}
