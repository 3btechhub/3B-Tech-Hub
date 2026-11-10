import { NextRequest, NextResponse } from "next/server";
import { getAppwriteRow, fetchAppwriteFilePreview, fetchAppwriteFileView, isMediaStoreConfigured } from "@/lib/appwrite-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ assetId: string }> };
const publicMediaTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
  "video/mp4", "video/webm", "video/quicktime", "application/pdf",
]);

function dimension(value: string | null) {
  if (!value || !/^\d{1,4}$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 2000 ? parsed : undefined;
}

export async function GET(request: NextRequest, context: Context) {
  if (!isMediaStoreConfigured()) {
    return NextResponse.json({ error: "Media delivery is not configured." }, { status: 503 });
  }

  const { assetId } = await context.params;
  try {
    const row = await getAppwriteRow(process.env.APPWRITE_MEDIA_TABLE_ID!, assetId);
    if (row.deletedAt || row.visibility !== "public") {
      return NextResponse.json({ error: "Media not found." }, { status: 404 });
    }

    if (row.sourceType === "external") {
      const target = typeof row.externalUrl === "string" ? new URL(row.externalUrl) : null;
      if (!target || target.protocol !== "https:") {
        return NextResponse.json({ error: "External media URL is invalid." }, { status: 415 });
      }
      return NextResponse.redirect(target.toString(), 302);
    }

    if (row.sourceType !== "appwrite"
      || typeof row.storageBucketId !== "string"
      || typeof row.storageFileId !== "string") {
      return NextResponse.json({ error: "Media source is unavailable." }, { status: 404 });
    }

    const mimeType = typeof row.mimeType === "string" ? row.mimeType : "";
    if (!publicMediaTypes.has(mimeType)) {
      return NextResponse.json({ error: "This media type cannot be delivered." }, { status: 415 });
    }

    const isImage = mimeType.startsWith("image/");
    const upstream = isImage
      ? await fetchAppwriteFilePreview(row.storageBucketId, row.storageFileId, {
          width: dimension(request.nextUrl.searchParams.get("w")) ?? 1600,
          height: dimension(request.nextUrl.searchParams.get("h")) ?? 1200,
          quality: 78,
          output: "webp",
        })
      : await fetchAppwriteFileView(row.storageBucketId, row.storageFileId);

    const contentType = isImage
      ? upstream.headers.get("content-type") ?? "image/webp"
      : mimeType;
    const headers = new Headers({
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    });
    const length = upstream.headers.get("content-length");
    if (length && /^\d+$/.test(length)) headers.set("Content-Length", length);
    const etag = upstream.headers.get("etag");
    if (etag) headers.set("ETag", etag);
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Media delivery is temporarily unavailable." }, { status: 502 });
  }
}
