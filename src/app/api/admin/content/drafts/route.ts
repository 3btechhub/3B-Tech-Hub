import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { pageRevisionSchema } from "@/lib/content-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { createAppwriteRow, isContentStoreConfigured } from "@/lib/appwrite-server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isContentStoreConfigured()) return NextResponse.json({ error: "Content storage is not configured. No page was saved.", code: "CONTENT_STORAGE_NOT_CONFIGURED" }, { status: 503 });
  const parsed = pageRevisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid page revision.", issues: parsed.error.issues }, { status: 400 });
  if (parsed.data.status !== "draft") return NextResponse.json({ error: "Only draft revisions can be created through this endpoint." }, { status: 403 });
  const revisionId = randomUUID();
  try {
    await createAppwriteRow(process.env.APPWRITE_CONTENT_TABLE_ID!, revisionId, {
      slug: parsed.data.slug, locale: parsed.data.locale, revision: parsed.data.revision, status: "draft",
      payload: JSON.stringify(parsed.data), createdBy: auth.identity!.id, createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, revisionId, status: "draft" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The draft could not be saved. Check server storage configuration." }, { status: 502 });
  }
}
