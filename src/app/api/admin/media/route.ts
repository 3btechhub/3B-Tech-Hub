import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { isMediaStoreConfigured, listAppwriteRows } from "@/lib/appwrite-server";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured()) return NextResponse.json({ error: "Media storage is not configured." }, { status: 503 });
  const params = request.nextUrl.searchParams;
  const includeTrash = params.get("includeTrash") === "1";
  const rawLimit = Number(params.get("limit") ?? 24);
  const rawOffset = Number(params.get("offset") ?? 0);
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 24;
  const offset = Number.isInteger(rawOffset) ? Math.min(Math.max(rawOffset, 0), 100000) : 0;
  const search = (params.get("search") ?? "").trim().slice(0, 80);
  try {
    const result = await listAppwriteRows(process.env.APPWRITE_MEDIA_TABLE_ID!, limit, offset, search || undefined, !includeTrash);
    const rows = result.rows ?? [];
    return NextResponse.json({ items: rows, total: result.total ?? rows.length, limit, offset, search, includeTrash });
  } catch {
    return NextResponse.json({ error: "Media library could not be loaded. Verify the Appwrite title search index if search is enabled." }, { status: 502 });
  }
}
