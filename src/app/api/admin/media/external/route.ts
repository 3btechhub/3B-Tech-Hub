import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { externalMediaSchema } from "@/lib/media-schema";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { createAppwriteRow, isMediaStoreConfigured } from "@/lib/appwrite-server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured()) return NextResponse.json({ error: "Media storage is not configured. No asset was registered." }, { status: 503 });
  const parsed = externalMediaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid external media details.", issues: parsed.error.issues }, { status: 400 });
  const assetId = randomUUID();
  try {
    await createAppwriteRow(process.env.APPWRITE_MEDIA_TABLE_ID!, assetId, {
      ...parsed.data, createdBy: auth.identity!.id, createdAt: new Date().toISOString(), deletedAt: null, sourceType: "external",
    });
    return NextResponse.json({ ok: true, assetId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The media record could not be saved." }, { status: 502 });
  }
}
