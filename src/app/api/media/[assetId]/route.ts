import { NextRequest, NextResponse } from "next/server";
import { getAppwriteRow, isMediaStoreConfigured } from "@/lib/appwrite-server";

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

    if (row.sourceType === "external" || row.sourceType === "video_embed") {
      const target = typeof row.externalUrl === "string" ? new URL(row.externalUrl) : null;
      if (!target || target.protocol !== "https:") {
        return NextResponse.json({ error: "External media URL is invalid." }, { status: 415 });
      }
      return NextResponse.redirect(target.toString(), {
        status: 302,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      });
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

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
    if (!endpoint) return NextResponse.json({ error: "Media endpoint is not configured." }, { status: 503 });
    const isImage = mimeType.startsWith("image/");
    const resource = isImage ? "preview" : "view";
    const target = new URL(
      `${endpoint}/storage/buckets/${encodeURIComponent(row.storageBucketId)}/files/${encodeURIComponent(row.storageFileId)}/${resource}`,
    );

    if (isImage) {
      target.searchParams.set("width", String(dimension(request.nextUrl.searchParams.get("w")) ?? 1600));
      target.searchParams.set("height", String(dimension(request.nextUrl.searchParams.get("h")) ?? 1200));
      target.searchParams.set("quality", "78");
      target.searchParams.set("output", "webp");
    }

    // The Appwrite Storage CDN serves and caches the transformed public file directly.
    // The redirect itself is not cached so visibility changes are rechecked on each request.
    return NextResponse.redirect(target.toString(), {
      status: 302,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Media delivery is temporarily unavailable." }, { status: 502 });
  }
}
