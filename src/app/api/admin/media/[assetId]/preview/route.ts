import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { fetchAppwriteFilePreview, fetchAppwriteFileView, getAppwriteRow, isMediaStoreConfigured } from "@/lib/appwrite-server";

export const runtime = "nodejs";
type Context = { params: Promise<{ assetId: string }> };

const safePreviewTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
  "video/mp4", "video/webm", "video/quicktime", "application/pdf",
]);

export async function GET(request: NextRequest, context: Context) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured()) return NextResponse.json({ error: "Media storage is not configured." }, { status: 503 });
  const { assetId } = await context.params;

  try {
    const row = await getAppwriteRow(process.env.APPWRITE_MEDIA_TABLE_ID!, assetId);
    if (row.deletedAt || row.sourceType !== "appwrite" || typeof row.storageFileId !== "string" || typeof row.storageBucketId !== "string") {
      return NextResponse.json({ error: "Media preview not found." }, { status: 404 });
    }
    const mimeType = typeof row.mimeType === "string" ? row.mimeType : "";
    if (!safePreviewTypes.has(mimeType)) return NextResponse.json({ error: "This media type cannot be previewed inline." }, { status: 415 });
    const isImage = mimeType.startsWith("image/");
    const upstream = isImage
      ? await fetchAppwriteFilePreview(row.storageBucketId, row.storageFileId, { width: 1200, height: 900, quality: 78, output: "webp" })
      : await fetchAppwriteFileView(row.storageBucketId, row.storageFileId);
    const headers = new Headers({
      "Content-Type": isImage ? (upstream.headers.get("content-type") ?? "image/webp") : mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Referrer-Policy": "no-referrer",
    });
    const length = upstream.headers.get("content-length");
    if (length && /^\d+$/.test(length)) headers.set("Content-Length", length);
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Media preview is unavailable." }, { status: 502 });
  }
}
