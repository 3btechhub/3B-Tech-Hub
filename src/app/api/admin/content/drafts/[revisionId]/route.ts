import { NextRequest, NextResponse } from "next/server";
import { pageRevisionSchema, canTransitionPageStatus } from "@/lib/content-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";
import { getAppwriteRow, isContentStoreConfigured, updateAppwriteRow } from "@/lib/appwrite-server";
export const runtime = "nodejs";
type Context = { params: Promise<{ revisionId: string }> };

const actions = {
  submit_for_review: { next: "in_review" as const, audit: "content.update" as const },
  approve: { next: "approved" as const, audit: "content.approve" as const },
  publish: { next: "published" as const, audit: "content.publish" as const },
};


export async function GET(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isContentStoreConfigured()) return NextResponse.json({ error: "Content storage is not configured." }, { status: 503 });
  const { revisionId } = await context.params;
  try {
    const row = await getAppwriteRow(process.env.APPWRITE_CONTENT_TABLE_ID!, revisionId);
    if (typeof row.payload !== "string") return NextResponse.json({ error: "Revision payload is invalid." }, { status: 409 });
    const parsed = pageRevisionSchema.safeParse(JSON.parse(row.payload));
    if (!parsed.success) return NextResponse.json({ error: "Stored revision failed validation." }, { status: 409 });
    return NextResponse.json({ revisionId, revision: parsed.data });
  } catch {
    return NextResponse.json({ error: "Saved revision could not be loaded." }, { status: 404 });
  }
}

export async function POST(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isContentStoreConfigured() || !isAuditStoreConfigured()) return NextResponse.json({ error: "Content and audit storage must both be configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as { action?: keyof typeof actions } | null;
  if (!body?.action || !Object.hasOwn(actions, body.action)) return NextResponse.json({ error: "Unsupported workflow action." }, { status: 400 });
  const { revisionId } = await context.params;
  const tableId = process.env.APPWRITE_CONTENT_TABLE_ID!;
  try {
    const row = await getAppwriteRow(tableId, revisionId);
    if (typeof row.payload !== "string") return NextResponse.json({ error: "Revision payload is invalid." }, { status: 409 });
    const parsed = pageRevisionSchema.safeParse(JSON.parse(row.payload));
    if (!parsed.success) return NextResponse.json({ error: "Stored revision failed validation." }, { status: 409 });
    const action = actions[body.action];
    if (!canTransitionPageStatus(parsed.data.status, action.next, "owner")) return NextResponse.json({ error: "Invalid page status transition." }, { status: 409 });
    const nextRevision = { ...parsed.data, status: action.next };
    await updateAppwriteRow(tableId, revisionId, { status: action.next, payload: JSON.stringify(nextRevision) });
    try {
      await appendAuditEvent({
        actorId: auth.identity!.id, actorRole: "owner", action: action.audit, targetType: "content",
        targetId: revisionId, outcome: "success", metadata: { slug: parsed.data.slug, from: parsed.data.status, to: action.next },
        occurredAt: new Date().toISOString(),
      });
    } catch {
      await updateAppwriteRow(tableId, revisionId, { status: parsed.data.status, payload: JSON.stringify(parsed.data) }).catch(() => undefined);
      return NextResponse.json({ error: "Audit recording failed; workflow transition was rolled back where possible." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, revisionId, status: action.next });
  } catch {
    return NextResponse.json({ error: "The workflow action could not be completed." }, { status: 502 });
  }
}
