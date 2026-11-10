import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { isAuditStoreConfigured, appendAuditEvent } from "@/lib/audit-store";
import { isMediaStoreConfigured, listAppwriteRows } from "@/lib/appwrite-server";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured()) return NextResponse.json({ error: "Media storage is not configured." }, { status: 503 });
  try {
    const result = await listAppwriteRows(process.env.APPWRITE_MEDIA_TABLE_ID!, 100);
    const rows = (result.rows ?? []).filter((row) => !row.deletedAt);
    return NextResponse.json({ items: rows, total: rows.length, limit: 100 });
  } catch {
    return NextResponse.json({ error: "Media library could not be loaded." }, { status: 502 });
  }
}
